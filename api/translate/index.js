// Vercel serverless function for translate API

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');

let translateRouter;
try {
  translateRouter = require('../../server/src/routes/translate');
} catch (error) {
  console.error('Error loading translate router:', error);
  // Fallback handler if module fails to load
  translateRouter = express.Router();
  translateRouter.all('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server configuration error',
      details: error.message 
    });
  });
}

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Serverless function error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Function invocation error:', error);
    return res.status(500).json({ 
      error: 'Function invocation failed',
      message: error.message 
    });
  }
};

