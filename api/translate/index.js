// Vercel serverless function for translate API

const express = require('express');
const cors = require('cors');
const translateRouter = require('../../server/src/routes/translate');

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', true);

// CORS configuration
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount translate router
app.use('/', translateRouter);

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  return app(req, res);
};

