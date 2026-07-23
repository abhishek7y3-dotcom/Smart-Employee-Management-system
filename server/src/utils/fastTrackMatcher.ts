import { FAST_TRACK_DATA, FastTrackEntry } from '../constants/fastTrackData';

export interface FastTrackResult {
  hit: true;
  answer: string;
  matchedIntentId: string;
  source: 'FAST_TRACK_CACHE_HIT';
}

/**
 * Matches user query against the Fast Track semantic cache using token overlap scoring.
 * Enforces Role-Based Access Control (RBAC) before returning cached answers.
 * 
 * @param userQuery The raw user message
 * @param userRole The verified role from JWT (e.g., 'admin', 'employee')
 * @returns FastTrackResult if matched and authorized, otherwise null.
 */
export function matchFastTrack(userQuery: string, userRole: string): FastTrackResult | null {
  if (!userQuery || !userRole) return null;

  // 1. Normalize input (lowercase, trim, strip punctuation)
  const normalizedQuery = userQuery.toLowerCase().trim().replace(/[^\w\s]/g, '');
  if (!normalizedQuery) return null;

  // Tokenize the user query into a Set for fast lookup O(1)
  const queryTokens = new Set(normalizedQuery.split(/\s+/).filter(Boolean));
  
  const MATCH_THRESHOLD = 0.5;
  let bestMatch: FastTrackEntry | null = null;
  let highestScore = 0;

  // 2. Score intents
  for (const entry of FAST_TRACK_DATA) {
    if (entry.intentKeywords.length === 0) continue;

    // Calculate how many intent keywords are present in the user query
    let overlapCount = 0;
    for (const keyword of entry.intentKeywords) {
      if (queryTokens.has(keyword)) {
        overlapCount++;
      }
    }

    const score = overlapCount / entry.intentKeywords.length;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // 3. Threshold Check
  if (highestScore >= MATCH_THRESHOLD && bestMatch) {
    // 4. RBAC (Role-Based Access Control) Check
    if (bestMatch.requiresRole && bestMatch.requiresRole !== 'any') {
      if (bestMatch.requiresRole !== userRole) {
        // User matched an intent they are not authorized to view.
        // We fall through to the LLM (returning null) instead of leaking the answer.
        // The LLM's system prompt handles strict role enforcement naturally.
        return null;
      }
    }

    return {
      hit: true,
      answer: bestMatch.answer,
      matchedIntentId: bestMatch.id,
      source: 'FAST_TRACK_CACHE_HIT'
    };
  }

  return null; // Fall through to LLM
}
