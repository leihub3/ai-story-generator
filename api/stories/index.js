// Vercel serverless function for stories API
// This handles all /api/stories/* routes

const express = require('express');
const cors = require('cors');
const storiesRouter = require('../../server/src/routes/stories');

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', true);

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in production
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-RateLimit-Limit'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount stories router
app.use('/', storiesRouter);

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  return app(req, res);
};

