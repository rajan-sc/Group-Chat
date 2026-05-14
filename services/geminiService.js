const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
// Initialize the API only if the key is present to prevent crashes on startup if not set yet.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const getAutocomplete = async (partialText) => {
  if (!ai) return "AI not configured";
  try {
    const prompt = `You are an autocomplete assistant for a chat application. 
Complete the following sentence naturally. Respond ONLY with the completion, no extra text.
Partial text: "${partialText}"`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini autocomplete error:', error);
    return "";
  }
};

const getSmartReply = async (recentMessages) => {
  if (!ai) return "AI not configured";
  try {
    const context = recentMessages.map(m => `${m.senderEmail}: ${m.message}`).join('\n');
    const prompt = `You are an assistant suggesting a quick, natural chat reply based on the recent conversation history.
History:
${context}

Provide a short, single-sentence response that the current user could send. Respond ONLY with the suggested reply.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Gemini smart reply error:', error);
    return "";
  }
};

module.exports = { getAutocomplete, getSmartReply };
