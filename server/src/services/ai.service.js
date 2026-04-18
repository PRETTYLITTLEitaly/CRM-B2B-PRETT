const axios = require('axios');

/**
 * Service to handle AI interactions using Gemini REST API
 */
class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        // System instruction to define the AI's personality and knowledge
        this.systemInstruction = `
            Sei l'assistente virtuale ufficiale di PRETTYB2B, una piattaforma CRM avanzata per il commercio all'ingrosso.
            Il tuo obiettivo è aiutare Luca e il suo team a gestire lead, clienti e ordini Shopify.
            
            TOKEN DI PERSONALITÀ:
            - Professionalità Premium: Parla in modo elegante ma diretto.
            - Proattività: Se vedi problemi potenziali (es. ordini non evasi), segnalali.
            - Riservatezza: Non condividere segreti industriali.
            - Lingua: Rispondi sempre in Italiano.
            
            CONTESTO SOFTWARE:
            - Il CRM gestisce Lead (potenziali clienti), Clienti (già attivi), Ordini (sincronizzati da Shopify) e Calendario (Google Calendar).
            - Estetica: Il software usa un design moderno con Dark Mode, Glassmorphism e colori Indigo/Slate.
        `;
    }

    async generateChatReply(userMessage, history = []) {
        if (!this.apiKey) {
            console.warn('[AI SERVICE] No GEMINI_API_KEY found in .env');
            return "Scusa, il sistema AI non è ancora configurato correttamente (manca la API Key).";
        }

        try {
            // Format history for Gemini (alternating user/model)
            const contents = history.slice(-6).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Add the current message
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, {
                contents: contents,
                systemInstruction: {
                    parts: [{ text: this.systemInstruction }]
                },
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 1024,
                }
            });

            if (response.data && response.data.candidates && response.data.candidates[0].content) {
                return response.data.candidates[0].content.parts[0].text;
            }

            return "Ricevuto! Ma non sono sicuro di come rispondere a questa specifica domanda al momento.";

        } catch (error) {
            console.error('[AI SERVICE ERROR]:', error.response?.data || error.message);
            throw new Error('Errore nella comunicazione con il cervello dell\'IA.');
        }
    }
}

module.exports = new AIService();
