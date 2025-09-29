import { createWorker } from 'tesseract.js';

const cleanText = (text) => {
  // Basic text corrections for common OCR errors
  return text
    .replace(/\nnxt/g, ' next')
    .replace(/@/g, 'at')
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();
};

const extractTextFromImage = async (imageBuffer) => {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(imageBuffer);
    const cleanedText = cleanText(data.text);
    console.log(`OCR Result: "${cleanedText}" (Confidence: ${data.confidence})`);
    return {
      raw_text: cleanedText,
      confidence: data.confidence / 100,
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to process image with OCR.');
  } finally {
    await worker.terminate();
  }
};

export const ocrService = {
  extractTextFromImage,
};