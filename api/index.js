const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mainRouter = require('../backend_core/src/routes');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Logging per debug - ci permetterà di vedere cosa accade su Vercel
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Supportiamo entrambi i percorsi per massima compatibilità con i rewrites di Vercel
app.use('/api', mainRouter);
app.use('/', mainRouter);

// Importazione diagnostica (rimane separata)
app.get('/api/diag/import-from-csv', async (req, res) => {
    try {
        const { importData } = require('./import_data');
        await importData(prisma, res);
    } catch (e) {
        res.status(500).send("ERROR: " + e.message);
    }
});

// Catch-all per debug
app.use((req, res) => {
    res.status(404).send({
        error: "Route not found",
        receivedUrl: req.url,
        method: req.method
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
