const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');

router.post('/chat', async (req, res, next) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Messaggio mancante' });
        }

        const reply = await aiService.generateChatReply(message, history);
        
        res.json({ success: true, reply });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
