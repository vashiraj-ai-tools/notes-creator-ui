import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// We check for the API key to prevent crashes if it's not set
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Generate revision notes from the provided text using Gemini AI
 * @param {string} text - The raw text extracted from a video or blog
 * @param {string} sourceTitle - The title of the source material
 * @returns {Promise<string>} - The generated markdown notes
 */
export async function generateNotes(text, sourceTitle = 'Content') {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  try {
    // We use gemini-1.5-pro for complex text summarization, or gemini-1.5-flash for speed
    // Flash is usually sufficient and much faster/cheaper for this use case
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert educational assistant. Your task is to create clear, highly-structured, and easy-to-read revision notes based ONLY on the following content extracted from "${sourceTitle}".

      Format your response in Markdown using the following structure:
      1. Start with an H1 heading showing the title.
      2. Provide a 2-3 sentence **Quick Summary** of the entire content.
      3. Create a **Key Concepts** section using an unordered list.
      4. Break down the main topics into H2 headings. Under each H2, use bullet points, bold text, and brief paragraphs to explain the details clearly.
      5. Add a **Important Takeaways / Conclusion** section at the end.

      Make the notes concise but comprehensive enough for someone studying this topic. Do not include introductory or concluding conversational filler in your response, just the notes.

      Here is the content to summarize:
      
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating notes with Gemini:', error);
    throw new Error('Failed to generate notes using AI. Please try again later.');
  }
}
