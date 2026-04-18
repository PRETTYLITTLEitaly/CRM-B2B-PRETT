const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mainRouter = require('../backend_core/src/routes');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// ROUTE DI TEST PER VERIFICARE CHE IL SERVER SIA VIVO
app.get('/api/health', (req, res) => {
    res.send({ status: 'ok', timestamp: new Date() });
});

// IMPORT FROM CSV (LA LOGICA VIENE CARICATA DINAMICAMENTE PER NON PESARE SUL LOGIN)
app.get('/api/diag/import-from-csv', async (req, res) => {
    try {
        const { importData } = require('./import_data');
        await importData(prisma, res);
    } catch (e) {
        res.status(500).send("ERROR: " + e.message);
    }
});

app.use('/', mainRouter);

// Gestione errori globale per evitare crash del server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
