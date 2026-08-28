const { GoogleGenAI } = require('@google/genai');

class AiService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.AI_API_KEY
    });

    this.systemInstruction = `
You are MindGuide, a supportive mental-health wellness assistant for the Arambh platform.

Your job is to have a natural, helpful conversation with the user.

IMPORTANT CONVERSATION RULES:
1. Always answer the user's CURRENT message directly.
2. Use previous conversation messages to understand context.
3. Do NOT repeat the same generic response when the user asks a new question.
4. If the user changes the topic, follow the new topic.
5. If the user asks a follow-up question, answer based on the previous conversation.
6. Ask a relevant follow-up question when appropriate.
7. Keep responses concise, empathetic and natural.
8. Do not claim to be a doctor.
9. Do not diagnose mental disorders.
10. Do not prescribe medication.
11. For immediate danger or self-harm risk, encourage immediate professional/emergency support.

You are a conversational assistant, not a scripted chatbot.
`;
  }
  async generateResponse(userMessage, context = {}, chatHistory = []) {
    try {
      if (!process.env.AI_API_KEY) {
        return "MindGuide AI is currently in offline mode. Please configure your API key in the backend to enable AI responses.";
      }

      // Build previous conversation
      let conversation = '';

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        conversation = chatHistory
          .map(msg => {
            const role = msg.role === 'assistant' ? 'MindGuide' : 'User';
            return `${role}: ${msg.content}`;
          })
          .join('\n');
      }

      // Build user context
      let contextStr = '';

      if (context.recentMood) {
        contextStr += `Recent Mood: ${context.recentMood}\n`;
      }

      if (context.screeningCategory) {
        contextStr += `Screening Result: ${context.screeningCategory}\n`;
      }

      if (context.currentConcern) {
        contextStr += `Primary Concern: ${context.currentConcern}\n`;
      }

      const prompt = `
${contextStr ? `USER CONTEXT:\n${contextStr}\n` : ''}

PREVIOUS CONVERSATION:
${conversation || 'No previous conversation.'}

CURRENT USER MESSAGE:
${userMessage}

INSTRUCTIONS:
Respond specifically to the CURRENT USER MESSAGE.
Use the previous conversation only when it helps answer the current message.
Do not repeat a previous answer unless the user specifically asks you to repeat it.
Be natural and conversational.
`;

      console.log('Sending prompt to Gemini...');
      console.log('Current message:', userMessage);
      console.log('History messages:', chatHistory.length);

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: this.systemInstruction,
          temperature: 0.8
        }
      });

      return response.text;

    } catch (error) {
      console.error('AI Service Error:', error);

      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
  }
}

module.exports = new AiService();