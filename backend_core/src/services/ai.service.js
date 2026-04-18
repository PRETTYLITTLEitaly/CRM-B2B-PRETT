const axios = require('axios');
const crmService = require('./crm.service');

class AIService {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
        this.baseInstruction = `
            Sei l'assistente virtuale ufficiale di PRETTYB2B.
            Usa un tono professionale, elegante e proattivo. Rispondi in Italiano.
            Hai accesso ai dati reali del CRM riportati sotto.
        `;
    }

    async generateChatReply(userMessage, history = []) {
        const apiKey = process.env.GEMINI_API_KEY;
        const crmContext = await crmService.getQuickSummary();

        if (!apiKey) {
            return "Errore: Configurazione mancante (API Key).";
        }

        try {
            const contents = [
                {
                    role: 'user',
                    parts: [{ text: `CONTESTO REALE CRM:\n${crmContext}\n\nISTRUZIONI: ${this.baseInstruction}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Ricevuto. Conosco lo stato attuale del CRM e sono pronto ad aiutarti con i dati reali.' }]
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
