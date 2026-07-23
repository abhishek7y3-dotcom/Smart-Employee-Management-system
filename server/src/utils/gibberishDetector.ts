/**
 * Gibberish Detector Utility
 * Evaluates whether a user's input string is meaningless gibberish (e.g., keyboard mashing, repeated characters, pure punctuation)
 * while preserving typos, technical terms, and emojis.
 */
export function isGibberish(text: string): boolean {
  if (!text) return false;
  
  const trimmed = text.trim();

  // 1. Check for excessive repeated characters anywhere in the string (e.g., "aaaaaaa", "kkkkkk", "111111")
  // Using 5 repeats (6 total identical consecutive characters) as a safe threshold
  if (/(.)\1{5,}/.test(trimmed)) {
    return true;
  }

  // 2. Check for common keyboard mashing sequences
  const mashingRegex = /asdf|qwer|zxcv|hjkl|uiop|tyui|ghjk|vbnm|lkjh|mnbv|poiu|qwpo|qaz|wsx|edc/i;
  // If the message is relatively short and contains a mash pattern, it's likely gibberish
  if (trimmed.length < 20 && mashingRegex.test(trimmed)) {
    return true;
  }

  // 3. Check for pure standard punctuation overload (length >= 3)
  // This explicitly avoids matching Emojis, because Emojis are outside standard ASCII ranges.
  const onlyAsciiSymbols = /^[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\.\<\>\/\?\\\|]{3,}$/;
  if (onlyAsciiSymbols.test(trimmed)) {
    return true;
  }

  // If none of the gibberish rules matched, assume it's valid input, a typo, an acronym, or an emoji.
  return false;
}
