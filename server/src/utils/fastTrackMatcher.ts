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

    // A better scoring mechanism:
    // If the user types a very short query (e.g. 1-2 words), we just need 1 keyword to match.
    // If the query is long, we check how much of the meaningful keywords matched.
    const score = overlapCount > 0 ? (overlapCount / Math.min(queryTokens.size, entry.intentKeywords.length)) : 0;

    // Give a slight boost if overlap count is higher, so more specific matches win
    const finalScore = score + (overlapCount * 0.1);

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = entry;
    }
  }

  // 3. Threshold Check
  // Lowered the effective threshold for small queries
  if (highestScore > 0 && bestMatch) {
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
