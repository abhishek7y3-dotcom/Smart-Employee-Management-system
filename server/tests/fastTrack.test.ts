import { matchFastTrack } from '../src/utils/fastTrackMatcher';
import { FAST_TRACK_DATA } from '../src/constants/fastTrackData';

describe('Fast Track Semantic Cache (V2)', () => {
  
  it('should match an exact canonical question', () => {
    const result = matchFastTrack('What is the leave policy and how do I apply?', 'employee');
    expect(result).not.toBeNull();
    expect(result?.hit).toBe(true);
    expect(result?.matchedIntentId).toBe('leave_policy');
    expect(result?.source).toBe('FAST_TRACK_CACHE_HIT');
  });

  it('should match a paraphrased question with overlap score >= 0.6', () => {
    // Intent keywords: ['payslip', 'salary', 'download', 'pay', 'slip']
    // Query: "where can I download my salary payslip"
    // Tokens: [where, can, i, download, my, salary, payslip]
    // Overlap: download, salary, payslip (3 matches out of 5 keywords = 0.6)
    const result = matchFastTrack('where can I download my salary payslip?', 'employee');
    expect(result).not.toBeNull();
    expect(result?.matchedIntentId).toBe('payslip_download');
  });

  it('should return null for queries that do not match the threshold (No Match)', () => {
    // Should fall through to LLM
    const result = matchFastTrack('can you write a poem about my dog?', 'employee');
    expect(result).toBeNull();
  });

  it('should correctly block unauthorized roles for admin intents', () => {
    // Intent keywords: ['admin', 'panel', 'manage', 'all', 'users', 'broadcast', 'announcement']
    // User role: 'employee'
    const query = 'how do i broadcast an announcement in the admin panel';
    
    const employeeResult = matchFastTrack(query, 'employee');
    // Expect null because it falls through to LLM instead of leaking the answer
    expect(employeeResult).toBeNull();

    const adminResult = matchFastTrack(query, 'admin');
    // Expect a hit because the admin is authorized
    expect(adminResult).not.toBeNull();
    expect(adminResult?.matchedIntentId).toBe('admin_dashboard_help');
  });

  it('should ignore punctuation and case', () => {
    const result = matchFastTrack('   wHAt iS THE lEaVe pOlicy and how do I APply!?!...   ', 'employee');
    expect(result).not.toBeNull();
    expect(result?.matchedIntentId).toBe('leave_policy');
  });

  it('should return null for empty queries', () => {
    expect(matchFastTrack('', 'employee')).toBeNull();
    expect(matchFastTrack('   ', 'employee')).toBeNull();
  });
});
