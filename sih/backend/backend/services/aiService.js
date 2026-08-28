const { GoogleGenAI } = require('@google/genai');

class AiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
    
    this.systemInstruction = `
      You are MindGuide, a supportive mental-health wellness assistant for the Arambh platform.
      You provide general educational and supportive guidance based on the user's input.
      
      CRITICAL SAFETY RULES:
      1. You DO NOT diagnose mental disorders.
      2. You DO NOT prescribe medication.
      3. You DO NOT replace healthcare professionals.
      4. If a user indicates immediate danger, severe depression, or self-harm risk, you MUST prioritize suggesting immediate human/professional support and verified emergency resources (e.g., Tele-MANAS helpline: 14416).
      5. Keep your responses concise, empathetic, and culturally sensitive to Indian users.
      6. Use markdown formatting lightly to highlight important points.
    `;
  }

  async generateResponse(userMessage, context = {}) {
    try {
      if (!process.env.AI_API_KEY) {
        return "MindGuide AI is currently in offline mode. Please configure your API key in the backend to enable AI responses.";
      }

      // Build context string to pass to the model
      let contextStr = 'User Context:\n';
      if (context.recentMood) contextStr += `- Recent Mood: ${context.recentMood}\n`;
      if (context.screeningCategory) contextStr += `- Screening Result: ${context.screeningCategory}\n`;
      if (context.currentConcern) contextStr += `- Primary Concern: ${context.currentConcern}\n`;

      const prompt = `
        ${contextStr}
        
        User Message: ${userMessage}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: this.systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm sorry, I'm having trouble connecting right now. Remember, you can always reach out to the Tele-MANAS helpline at 14416 if you need immediate support.";
    }
  }
}

module.exports = new AiService();
