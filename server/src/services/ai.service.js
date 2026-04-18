const axios = require('axios');

/**
 * Service to handle AI interactions using Gemini REST API
 */
class AIService {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        this.systemInstruction = `
            Sei l'assistente virtuale ufficiale di PRETTYB2B, una piattaforma CRM avanzata per il commercio all'ingrosso.
            Il tuo obiettivo è aiutare Luca e il suo team a gestire lead, clienti e ordini Shopify.
            Professionalità Premium, risposta in Italiano.
        `;
    }

    async generateChatReply(userMessage, history = []) {
        const apiKey = process.env.GEMINI_API_KEY; // Read dynamic from process.env

        if (!apiKey) {
            console.error('[AI SERVICE] CRITICAL: GEMINI_API_KEY is missing in process.env');
            return "Errore: Configurazione mancante (API Key).";
        }

        try {
            const contents = history.slice(-6).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, {
                contents: contents,
                systemInstruction: { parts: [{ text: this.systemInstruction }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            });

            if (response.data?.candidates?.[0]?.content) {
                return response.data.candidates[0].content.parts[0].text;
            }

            return "Non sono riuscito a generare una risposta. Riprova.";

        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error('[AI SERVICE ERROR]:', errorMsg);
            throw new Error(`AI_CONNECTION_FAILED: ${errorMsg}`);
        }
    }
}

module.exports = new AIService();
