const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mainRouter = require('../backend_core/src/routes');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Mantengo la struttura originale che permette il login
app.use('/', mainRouter);

// Aggiungo l'importazione in fondo per non interferire con il login
app.get('/api/diag/import-from-csv', async (req, res) => {
    try {
        const { importData } = require('./import_data');
        await importData(prisma, res);
    } catch (e) {
        res.status(500).send("ERROR: " + e.message);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
