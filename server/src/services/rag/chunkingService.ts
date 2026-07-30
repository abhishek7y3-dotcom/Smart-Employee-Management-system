/**
 * Splits a given text into overlapping chunks.
 * @param text - The full text to split.
 * @param chunkSize - Maximum number of characters per chunk.
 * @param overlap - Number of overlapping characters between consecutive chunks.
 * @returns Array of text chunks.
 */
export const chunkText = (text: string, chunkSize: number = 800, overlap: number = 150): string[] => {
  if (!text || text.trim() === '') return [];

  const chunks: string[] = [];
  let startIndex = 0;

  // Clean the text from excessive whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    // Adjust endIndex to avoid splitting words if possible
    if (endIndex < cleanText.length) {
      const prevSpace = cleanText.lastIndexOf(' ', endIndex);
      if (prevSpace > startIndex) {
        endIndex = prevSpace;
      }
    } else {
      endIndex = cleanText.length;
    }

    const chunk = cleanText.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    const nextStartIndex = endIndex - overlap;
    startIndex = nextStartIndex > startIndex ? nextStartIndex : endIndex;
  }

  return chunks;
};
