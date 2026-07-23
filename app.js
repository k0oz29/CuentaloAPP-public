const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './Backend/.env' });

const app = express();

// Configuracion de CORS
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'https://TU-URL-VERCEL',  // <-- CAMBIAR por tu URL de Vercel
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('No permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Servir frontend estatico solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('Frontend'));
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function startServer() {
  try {
    await client.connect();
    const db = client.db('Despensa');

    // Rutas de la API
    app.use('/api/productos', require('./Backend/routes/productos')(db));
    app.use('/api/buscar-codigo', require('./Backend/routes/codigos')());

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
}

startServer();
