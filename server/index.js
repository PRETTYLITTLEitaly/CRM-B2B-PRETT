const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mainRouter = require('./src/routes');
const errorHandler = require('./src/middleware/error.handler');

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', mainRouter);

// Error Handling
app.use(errorHandler);

// Per il deployment locale
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 B2B CRM Server running on port ${PORT}`);
    });
}

// Esporta l'app per Vercel
module.exports = app;
