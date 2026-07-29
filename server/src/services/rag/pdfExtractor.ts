const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF file buffer.
 * @param fileBuffer - The buffer of the uploaded PDF file.
 * @returns The extracted text as a string.
 */
export const extractTextFromPdf = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};
