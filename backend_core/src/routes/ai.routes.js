const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Messaggio mancante' });
        }

        const reply = await aiService.generateChatReply(message, history);
        res.json({ reply });
    } catch (error) {
        console.error('AI Route Error:', error.message);
        res.status(500).json({ error: 'Errore interno dell\'assistente' });
    }
});

module.exports = router;
