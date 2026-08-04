import { FAST_TRACK_DATA, FastTrackEntry } from '../constants/fastTrackData';
import Task from '../models/Task';
import User from '../models/User';
import Holiday from '../models/Holiday';
import Attendance from '../models/Attendance';
import Leave from '../models/Leave';
import mongoose from 'mongoose';

export interface FastTrackResult {
  hit: true;
  answer: string;
  matchedIntentId: string;
  source: 'FAST_TRACK_CACHE_HIT';
}

/**
 * Matches user query against the Fast Track semantic cache using token overlap scoring.
 * It first checks for highly-dynamic live database intents (Tasks, Members, Holidays, Attendance, Leaves).
 * If no live intent matches, it falls back to checking the static FAST_TRACK_DATA.
 * 
 * @param userQuery The raw user message
 * @param userRole The verified role from JWT (e.g., 'admin', 'employee')
 * @param userId The user's ID to fetch personalized dynamic cache entries (e.g., tasks)
 * @returns FastTrackResult if matched and authorized, otherwise null.
 */
export async function matchFastTrack(userQuery: string, userRole: string, userId: string | mongoose.Types.ObjectId): Promise<FastTrackResult | null> {
  if (!userQuery || !userRole) return null;

  // 1. Normalize input
  const normalizedQuery = userQuery.toLowerCase().trim().replace(/[^\w\s]/g, '');
  if (!normalizedQuery) return null;

  const queryTokens = new Set(normalizedQuery.split(/\s+/).filter(Boolean));
  
  const hasAny = (keywords: string[]) => keywords.some(k => queryTokens.has(k));
  const hasAll = (keywords: string[]) => keywords.every(k => queryTokens.has(k));

  // =========================================================================
  // LIVE DATABASE INTENTS (Fast Path bypassing LLM)
  // =========================================================================

  // 1. My Tasks
  if ((hasAny(['my', 'pending']) && hasAny(['task', 'tasks', 'todo'])) || (hasAny(['what']) && hasAny(['tasks']))) {
    try {
      const tasks = await Task.find({ assignedTo: userId }).limit(20).lean();
      let answer = `**Your Pending Tasks:**\n\n`;
      if (tasks.length === 0) answer = `You currently have no tasks assigned to you.`;
      else {
        tasks.forEach((t: any, idx: number) => {
          answer += `${idx + 1}. **${t.title}** - Status: *${t.status}* (Priority: ${t.priority})\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_user_tasks', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live tasks:', e); }
  }

  // 2. Members/Employees
  if ((hasAny(['who', 'show', 'list']) && hasAny(['members', 'employees', 'team', 'staff'])) || hasAll(['all', 'employees'])) {
    try {
      const users = await User.find({ role: { $ne: 'superadmin' } }).select('name email designation department').lean();
      let answer = `**Company Employee Directory:**\n\n`;
      users.forEach((u: any) => {
        answer += `- **${u.name}** (${u.designation || 'Employee'}) - ${u.department || 'General'}\n`;
      });
      return { hit: true, answer, matchedIntentId: 'live_employees', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live users:', e); }
  }

  // 3. Holidays
  if (hasAny(['holiday', 'holidays']) || (hasAny(['public', 'company']) && hasAny(['holiday', 'calendar']))) {
    try {
      const holidays = await Holiday.find({ status: { $ne: 'Cancelled' } }).sort({ holidayDate: 1 }).limit(10).lean();
      let answer = `**Upcoming Company Holidays:**\n\n`;
      if (holidays.length === 0) answer = `There are no upcoming holidays scheduled at the moment.`;
      else {
        holidays.forEach((h: any, idx: number) => {
          const date = new Date(h.holidayDate).toLocaleDateString();
          answer += `${idx + 1}. **${h.holidayName}** - ${date} (${h.holidayType})\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_holidays', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live holidays:', e); }
  }

  // 4. Attendance
  if (hasAny(['attendance', 'present', 'log']) || (hasAny(['my']) && hasAny(['check', 'in', 'out', 'attendance']))) {
    try {
      const attendances = await Attendance.find({ employeeId: userId }).sort({ attendanceDate: -1 }).limit(5).lean();
      let answer = `**Your Recent Attendance Log:** 🕒\n\n`;
      if (attendances.length === 0) answer += `No recent attendance records found.`;
      else {
        attendances.forEach((a: any) => {
          const inTime = a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
          const outTime = a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
          answer += `- **${a.attendanceDate}**: ${a.attendanceStatus} (In: ${inTime} | Out: ${outTime})\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_attendance', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live attendance:', e); }
  }

  // 5. Leaves
  if ((hasAny(['my', 'recent', 'status']) && hasAny(['leave', 'leaves', 'pto'])) || hasAll(['my', 'leaves'])) {
    try {
      const leaves = await Leave.find({ employeeId: userId }).sort({ createdAt: -1 }).limit(5).lean();
      let answer = `**Your Recent Leave Requests:** 🌴\n\n`;
      if (leaves.length === 0) answer += `You haven't applied for any leaves recently.`;
      else {
        leaves.forEach((l: any) => {
          const statusIcon = l.status === 'Approved' ? '✅' : (l.status === 'Rejected' ? '❌' : '⏳');
          const sDate = new Date(l.startDate).toLocaleDateString();
          const eDate = new Date(l.endDate).toLocaleDateString();
          answer += `- **${l.leaveType}** (${sDate} to ${eDate})\n  Status: ${statusIcon} **${l.status}** (${l.totalDays} days)\n`;
        });
      }
      return { hit: true, answer, matchedIntentId: 'live_leaves', source: 'FAST_TRACK_CACHE_HIT' };
    } catch(e) { console.error('Error fetching live leaves:', e); }
  }

  // =========================================================================
  // STATIC FALLBACK MATCHING (for FAQs like WFH policy, IT support)
  // =========================================================================

  const MATCH_THRESHOLD = 0.70; // Slightly lowered to be more forgiving
  let bestMatch: any = null;
  let highestScore = 0;

  for (const entry of FAST_TRACK_DATA) {
    if (!entry.intentKeywords || entry.intentKeywords.length === 0) continue;

    let overlapCount = 0;
    for (const keyword of entry.intentKeywords) {
      if (queryTokens.has(keyword.toLowerCase())) {
        overlapCount++;
      }
    }

    const score = overlapCount > 0 ? (overlapCount / Math.min(queryTokens.size, entry.intentKeywords.length)) : 0;
    const finalScore = score + (overlapCount * 0.1);

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = entry;
    }
  }

  if (highestScore >= MATCH_THRESHOLD && bestMatch) {
    if (bestMatch.requiresRole && bestMatch.requiresRole !== 'any') {
      if (bestMatch.requiresRole !== userRole) {
        return null; 
      }
    }
    return {
      hit: true,
      answer: bestMatch.answer,
      matchedIntentId: bestMatch.id || bestMatch.intentId,
      source: 'FAST_TRACK_CACHE_HIT'
    };
  }

  return null; // Fall through to LLM
}
