const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const storiesRouter = require('./routes/stories');
const translateRouter = require('./routes/translate');
const fs = require('fs').promises;

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for Vercel deployment (to get correct IP addresses)
app.set('trust proxy', true);

// Initialize data directory and saved stories file (for local development only)
const initializeDataDirectory = async () => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const savedStoriesPath = path.join(dataDir, 'saved_stories.json');

    // Create data directory if it doesn't exist
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Create saved_stories.json if it doesn't exist
    try {
      await fs.access(savedStoriesPath);
    } catch {
      await fs.writeFile(savedStoriesPath, JSON.stringify([]));
    }

    console.log('Data directory and saved stories file initialized successfully');
  } catch (error) {
    console.error('Error initializing data directory:', error);
  }
};

// Initialize data directory when server starts (only in local development)
if (process.env.NODE_ENV !== 'production') {
  initializeDataDirectory();
}

// CORS configuration - allow localhost and Vercel deployments
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, allow any Vercel deployment
      if (origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // For now, allow all origins (can be restricted later)
      }
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-RateLimit-Limit'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the pdfs directory
app.use('/pdfs', express.static(path.join(__dirname, '../pdfs')));

// API Routes
app.use('/api/stories', storiesRouter);
app.use('/api/translate', translateRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 