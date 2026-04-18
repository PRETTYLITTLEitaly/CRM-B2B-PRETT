const axios = require('axios');

class AIService {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        this.systemInstruction = `
            Sei l'assistente virtuale ufficiale di PRETTYB2B, una piattaforma CRM avanzata per il commercio all'ingrosso.
            Il tuo obiettivo è aiutare Luca e il suo team a gestire lead, clienti e ordini Shopify.
            Professionalità Premium, risposta in Italiano.
        `;
    }

    async generateChatReply(userMessage, history = []) {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('[AI SERVICE] CRITICAL: GEMINI_API_KEY is missing');
            return "Errore: Configurazione mancante (API Key).";
        }

        try {
            // DIAGNOSTIC: List available models
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const listResponse = await axios.get(listUrl);
            const models = listResponse.data.models.map(m => m.name).join(', ');
            
            return `MODELLI DISPONIBILI PER QUESTA CHIAVE: ${models}. Per favore, dimmi quale vedi in questa lista.`;

        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error('[AI SERVICE ERROR]:', errorMsg);
            throw new Error(`AI_LIST_MODELS_FAILED: ${errorMsg}`);
        }
    }
}

module.exports = new AIService();
