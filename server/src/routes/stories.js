const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const multer = require('multer');
const pdfjsLib = require('pdfjs-dist');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Import database utilities and rate limiting
const { 
  getAllStories, 
  saveStory, 
  saveStories, 
  deleteStory, 
  updateStory, 
  searchStories,
  getStoryById,
  checkRateLimit
} = require('../db');
const { 
  rateLimitMiddleware, 
  incrementRateLimitAfterGeneration 
} = require('../middleware/rateLimit');

// Helper function to get IP address from request
const getIpAddress = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.connection.remoteAddress ||
         'unknown';
};

// Configure PDF.js for Node.js environment
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../data/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Path to saved stories JSON file
const SAVED_STORIES_PATH = path.join(__dirname, '../../data/saved_stories.json');

// Ensure the data directory exists and initialize saved stories file
const ensureDataDirectory = async () => {
  const dataDir = path.join(__dirname, '../../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Initialize saved stories file if it doesn't exist
const initializeSavedStories = async () => {
  try {
    await fs.access(SAVED_STORIES_PATH);
  } catch {
    await fs.writeFile(SAVED_STORIES_PATH, JSON.stringify([]));
  }
};

// Extract text from PDF file using PDF.js
const extractTextFromPDF = async (filePath) => {
  try {
    console.log('Reading PDF file from:', filePath);
    const dataBuffer = await fs.readFile(filePath);
    console.log('PDF file read successfully, size:', dataBuffer.length, 'bytes');
    
    console.log('Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    const pdfDocument = await loadingTask.promise;
    console.log('PDF document loaded, pages:', pdfDocument.numPages);
    
    let fullText = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      console.log(`Processing page ${i} of ${pdfDocument.numPages}`);
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    console.log('PDF text extraction completed, text length:', fullText.length);
    return fullText;
  } catch (error) {
    console.error('Detailed PDF extraction error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

// Upload PDF file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File upload details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Extract text from the PDF
    console.log('Starting PDF text extraction...');
    const pdfText = await extractTextFromPDF(req.file.path);
    console.log('PDF text extraction completed');

    const ipAddress = getIpAddress(req);
    
    const newStory = {
      title: req.file.originalname.replace('.pdf', ''),
      content: pdfText,
      language: 'en', // Default to English for PDFs
      source: 'pdf',
      imageUrl: null,
      tag: null
    };

    const savedStory = await saveStory(newStory, ipAddress);

    // Convert database format to API format
    const formattedStory = {
      id: savedStory.id,
      title: savedStory.title,
      content: savedStory.content,
      language: savedStory.language,
      source: savedStory.source,
      tag: savedStory.tag,
      imageUrl: savedStory.image_url,
      createdAt: savedStory.created_at
    };

    res.json(formattedStory);
  } catch (error) {
    console.error('Detailed upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

// Get current rate limit status
router.get('/rate-limit', async (req, res) => {
  try {
    const ipAddress = getIpAddress(req);
    const rateLimitInfo = await checkRateLimit(ipAddress, 3);
    
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetDate.toISOString());
    res.setHeader('X-RateLimit-Limit', 3);
    
    res.json({
      remaining: rateLimitInfo.remaining,
      limit: 3,
      resetDate: rateLimitInfo.resetDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching rate limit:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rate limit',
      details: error.message
    });
  }
});

// Get all saved stories
router.get('/saved', async (req, res) => {
  try {
    const ipAddress = getIpAddress(req);
    const savedStories = await getAllStories(ipAddress);
    
    // Convert database format to API format
    const formattedStories = savedStories.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      language: story.language,
      source: story.source,
      tag: story.tag,
      imageUrl: story.image_url,
      createdAt: story.created_at
    }));
    
    res.json(formattedStories);
  } catch (error) {
    console.error('Error fetching saved stories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved stories',
      details: error.message
    });
  }
});

// Search saved stories
router.post('/saved/search', async (req, res) => {
  try {
    const { query, language } = req.body;
    const ipAddress = getIpAddress(req);
    
    const stories = await searchStories(query || '', language || null, ipAddress);
    
    // Convert database format to API format
    const formattedStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      language: story.language,
      source: story.source,
      tag: story.tag,
      imageUrl: story.image_url,
      createdAt: story.created_at
    }));
    
    res.json({
      query,
      results: formattedStories
    });
  } catch (error) {
    console.error('Error searching saved stories:', error);
    res.status(500).json({ 
      error: 'Failed to search saved stories',
      details: error.message
    });
  }
});

// Save a story or multiple stories
router.post('/save', async (req, res) => {
  try {
    // Handle both single story object and array of stories
    const stories = Array.isArray(req.body) ? req.body : [req.body];
    
    if (stories.length === 0) {
      return res.status(400).json({ error: 'No stories provided' });
    }

    // Validate all stories have required fields
    const invalidStories = stories.filter(story => {
      const hasTitle = story.title && typeof story.title === 'string' && story.title.length <= 200;
      const hasContent = story.content && typeof story.content === 'string';
      const hasLanguage = story.language && typeof story.language === 'string';
      return !(hasTitle && hasContent && hasLanguage);
    });

    if (invalidStories.length > 0) {
      console.error('Invalid stories found:', JSON.stringify(invalidStories, null, 2));
      return res.status(400).json({ 
        error: 'Missing required fields in one or more stories',
        details: invalidStories.map(story => ({
          hasTitle: !!story.title,
          titleLength: story.title ? story.title.length : 0,
          hasContent: !!story.content,
          hasLanguage: !!story.language
        }))
      });
    }

    const ipAddress = getIpAddress(req);
    
    // Save stories to database
    const savedStories = await saveStories(stories, ipAddress);
    
    // Convert database format to API format
    const formattedStories = savedStories.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      language: story.language,
      source: story.source,
      tag: story.tag,
      imageUrl: story.image_url,
      createdAt: story.created_at
    }));

    // Return single story if only one was saved, otherwise return array
    if (formattedStories.length === 1) {
      res.json(formattedStories[0]);
    } else {
      res.json({ 
        message: 'Stories saved successfully', 
        stories: formattedStories 
      });
    }
  } catch (error) {
    console.error('Error saving story:', error);
    res.status(500).json({ 
      error: 'Failed to save story',
      details: error.message
    });
  }
});

// Helper function to generate image with DALL-E
const generateImageWithDalle = async (prompt, title) => {
  try {
    // Create a descriptive prompt for the image based on the story title/content
    const imagePrompt = `A beautiful, colorful, child-friendly illustration for a children's story about: ${title || prompt}. The illustration should be whimsical, magical, and suitable for children. Style: digital art, vibrant colors, fantasy elements.`;
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data[0].url;
  } catch (error) {
    console.error('DALL-E API error:', error.response?.data || error.message);
    // Return null if image generation fails - story will still be generated
    return null;
  }
};

// Search stories using OpenAI (with rate limiting)
router.post('/search', rateLimitMiddleware, async (req, res) => {
  try {
    const { query, language = 'en', userTitle } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'OpenAI API key is not configured'
      });
    }

    const ipAddress = req.ipAddress || getIpAddress(req);

    // Map language codes to full names for better context
    const languageMap = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian'
    };

    const languageName = languageMap[language] || 'English';

    // Check if the query contains the multiple stories format
    const isMultipleStories = query.includes('---STORY_START---');

    // Adjust max_tokens based on whether we're generating multiple stories
    const maxTokens = isMultipleStories ? 4000 : 1000;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a creative storyteller who writes engaging children's stories in ${languageName}. 
            Write in a clear, engaging style that's appropriate for children. 
            Make sure to write the entire story in ${languageName} language.
            ${isMultipleStories ? 'When generating multiple stories, ensure each story is complete and well-formatted with the specified sections.' : ''}`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Get the generated story content
    const storyContent = response.data.choices[0].message.content;

    // Generate image with DALL-E (only for single stories, not multiple)
    let imageUrl = null;
    if (!isMultipleStories) {
      try {
        imageUrl = await generateImageWithDalle(query, userTitle || query);
      } catch (error) {
        console.error('Failed to generate image, continuing without it:', error.message);
        // Continue without image if generation fails
      }
    }

    // Increment rate limit after successful generation
    await incrementRateLimitAfterGeneration(ipAddress);

    // Re-check rate limit to get updated remaining count
    const updatedRateLimitInfo = await checkRateLimit(ipAddress, 3);

    // Create a story object with the generated content
    const story = {
      id: Date.now().toString(),
      title: isMultipleStories ? 'Multiple Myths Collection' : (userTitle || query),
      content: isMultipleStories ? storyContent : storyContent,
      language: language,
      source: 'openai',
      imageUrl: imageUrl,
      createdAt: new Date().toISOString()
    };

    // Add rate limit headers to response with updated values
    res.setHeader('X-RateLimit-Remaining', updatedRateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', updatedRateLimitInfo.resetDate.toISOString());
    res.setHeader('X-RateLimit-Limit', 3);

    res.json({
      query,
      results: [story]
    });

  } catch (error) {
    console.error('OpenAI API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(error.response?.status || 500).json({ 
      error: 'Search failed',
      details: error.response?.data?.message || error.message
    });
  }
});

// Get all stories
router.get('/', async (req, res) => {
  try {
    const ipAddress = getIpAddress(req);
    const stories = await getAllStories(ipAddress);
    
    // Convert database format to API format
    const formattedStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      language: story.language,
      source: story.source,
      tag: story.tag,
      imageUrl: story.image_url,
      createdAt: story.created_at
    }));
    
    res.json(formattedStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stories',
      details: error.message
    });
  }
});

// Get a specific story
router.get('/:id', async (req, res) => {
  try {
    const story = await getStoryById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Convert database format to API format
    const formattedStory = {
      id: story.id,
      title: story.title,
      content: story.content,
      language: story.language,
      source: story.source,
      tag: story.tag,
      imageUrl: story.image_url,
      createdAt: story.created_at
    };

    res.json(formattedStory);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ 
      error: 'Failed to fetch story',
      details: error.message
    });
  }
});

// Delete a story
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await deleteStory(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ 
      error: 'Failed to delete story',
      details: error.message
    });
  }
});

// Update story title
router.patch('/update/:id', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updatedStory = await updateStory(req.params.id, { title });
    
    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Convert database format to API format
    const formattedStory = {
      id: updatedStory.id,
      title: updatedStory.title,
      content: updatedStory.content,
      language: updatedStory.language,
      source: updatedStory.source,
      tag: updatedStory.tag,
      imageUrl: updatedStory.image_url,
      createdAt: updatedStory.created_at
    };
    
    res.json(formattedStory);
  } catch (error) {
    console.error('Error updating story title:', error);
    res.status(500).json({ 
      error: 'Failed to update story title',
      details: error.message
    });
  }
});

// Proxy endpoint to get image as base64 (to avoid CORS issues)
router.post('/image-proxy', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log('Proxying image:', imageUrl);

    // Download the image using axios (server-side, no CORS restrictions)
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('Image downloaded successfully, size:', response.data.length);

    // Convert to base64
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log('Image converted to base64, dataUrl length:', dataUrl.length);

    res.json({ dataUrl });
  } catch (error) {
    console.error('Error proxying image:', {
      message: error.message,
      response: error.response?.status,
      data: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to load image',
      details: error.message,
      status: error.response?.status
    });
  }
});

module.exports = router; 