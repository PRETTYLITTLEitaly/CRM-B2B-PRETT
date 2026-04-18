const axios = require('axios');

class AIService {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
        this.systemInstruction = `
            Sei l'assistente virtuale ufficiale di PRETTYB2B, una piattaforma CRM avanzata per il commercio all'ingrosso.
            Il tuo obiettivo è aiutare Luca e il suo team a gestire lead, clienti e ordini Shopify.
            Professionalità Premium, risposta in Italiano.
        `;
    }

    async generateChatReply(userMessage, history = []) {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return "Errore: Configurazione mancante (API Key).";
        }

        try {
            const contents = [
                {
                    role: 'user',
                    parts: [{ text: `ISTRUZIONI DI SISTEMA: ${this.systemInstruction}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Ricevuto. Sono pronto.' }]
                },
                ...history.slice(-6).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))
            ];

            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, {
                contents: contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            });

            if (response.data?.candidates?.[0]?.content) {
                return response.data.candidates[0].content.parts[0].text;
            }

            return "Ricevuto! Come posso aiutarti oggi?";

        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error('[AI SERVICE ERROR]:', errorMsg);
            return `Si è verificato un problema con l'IA: ${errorMsg}`;
        }
    }
}

module.exports = new AIService();
