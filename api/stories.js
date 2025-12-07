// Vercel serverless function for stories API (NO EXPRESS)

require('dotenv').config();

const axios = require('axios');

const {
  getAllStories,
  checkRateLimit,
} = require('../server/src/db');
const {
  incrementRateLimitAfterGeneration,
} = require('../server/src/middleware/rateLimit');

// Helper to get IP address in serverless environment
function getIpAddress(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit');

  const { method, url } = req;

  // Get the original path - Vercel may pass it in different ways
  // 1. Check x-vercel-original-path header (when rewrite happens)
  // 2. Check x-invoke-path header (alternative Vercel header)
  // 3. Use url directly
  const originalPath = 
    req.headers['x-vercel-original-path'] || 
    req.headers['x-invoke-path'] || 
    url || 
    '';
  
  const path = originalPath.split('?')[0] || '/';
  
  // Debug logging (remove in production if needed)
  console.log('Stories API request:', {
    method,
    url,
    originalPath,
    path,
    headers: {
      'x-vercel-original-path': req.headers['x-vercel-original-path'],
      'x-invoke-path': req.headers['x-invoke-path'],
    },
    query: req.query,
    allHeaders: Object.keys(req.headers)
  });

  // Log ALL requests for debugging
  console.log('=== Stories API Handler Called ===');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Path:', path);
  console.log('Query:', req.query);
  console.log('Headers:', {
    'x-vercel-original-path': req.headers['x-vercel-original-path'],
    'x-invoke-path': req.headers['x-invoke-path'],
  });

  try {
    // Simple diagnostics endpoint: GET /api/stories?test=1 or /api/stories/test (when routed)
    if (path.endsWith('/test') || path.includes('/api/stories/test') || path.includes('/test') || req.query?.test === '1') {
      return res.status(200).json({
        status: 'ok',
        message: 'Stories serverless API running without Express',
        env: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasOpenAiKey: !!process.env.OPENAI_API_KEY,
          nodeEnv: process.env.NODE_ENV || 'unknown',
        },
      });
    }

    // Rate‑limit status: GET /api/stories?rateLimit=1 or /api/stories/rate-limit
    // Check multiple ways the path might be represented
    const isRateLimitPath = 
      path.endsWith('/rate-limit') || 
      path.includes('/api/stories/rate-limit') || 
      path.includes('/rate-limit') ||
      req.query?.rateLimit === '1' ||
      req.query?.rateLimit === 'true';
    
    if (method === 'GET' && isRateLimitPath) {
      const ipAddress = getIpAddress(req);
      const info = await checkRateLimit(ipAddress, 3);

      res.setHeader('X-RateLimit-Remaining', info.remaining);
      res.setHeader('X-RateLimit-Reset', info.resetDate.toISOString());
      res.setHeader('X-RateLimit-Limit', 3);

      return res.status(200).json({
        remaining: info.remaining,
        limit: 3,
        resetDate: info.resetDate.toISOString(),
      });
    }

    // Generate stories using OpenAI: POST /api/stories/search
    const isSearchPath = 
      path.endsWith('/search') || 
      path.includes('/api/stories/search') ||
      path.includes('/search');
    
    if (method === 'POST' && isSearchPath) {
      const { query, language = 'en', userTitle } = req.body || {};

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is not configured');
        return res.status(500).json({
          error: 'Server configuration error',
          details: 'OpenAI API key is not configured',
        });
      }

      const ipAddress = getIpAddress(req);

      // Check rate limit before calling OpenAI
      // In development, use a very high limit (9999) to effectively disable rate limiting
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const rateLimit = isDevelopment ? 9999 : 3;
      const limitInfo = await checkRateLimit(ipAddress, rateLimit);
      if (!limitInfo.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'You have reached the daily limit of 3 stories. Please try again tomorrow.',
          resetDate: limitInfo.resetDate.toISOString(),
          remaining: 0,
        });
      }

      // Map language codes to full names for better context
      const languageMap = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        it: 'Italian',
      };
      const languageName = languageMap[language] || 'English';

      const isMultipleStories = query.includes('---STORY_START---');
      const maxTokens = isMultipleStories ? 4000 : 1000;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a creative storyteller who writes engaging children's stories in ${languageName}.
              Write in a clear, engaging style that's appropriate for children.
              Make sure to write the entire story in ${languageName} language.
              ${
                isMultipleStories
                  ? 'When generating multiple stories, ensure each story is complete and well-formatted with the specified sections.'
                  : ''
              }`,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const storyContent = response.data.choices[0].message.content;

      // For now, omit image generation in serverless version to keep it simple / fast
      let imageUrl = null;

      // Increment rate limit after successful generation
      // Reuse isDevelopment and rateLimit from above
      await incrementRateLimitAfterGeneration(ipAddress);
      const updatedLimit = await checkRateLimit(ipAddress, rateLimit);

      const story = {
        id: Date.now().toString(),
        title: isMultipleStories ? 'Multiple Myths Collection' : userTitle || query,
        content: storyContent,
        language,
        source: 'openai',
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      res.setHeader('X-RateLimit-Remaining', updatedLimit.remaining);
      res.setHeader('X-RateLimit-Reset', updatedLimit.resetDate.toISOString());
      res.setHeader('X-RateLimit-Limit', rateLimit);

      return res.status(200).json({
        query,
        results: [story],
      });
    }

    // DELETE /api/stories/delete/:id - Delete story
    // Handle both /api/stories/delete/:id and /api/stories/:id with DELETE method
    if (method === 'DELETE') {
      const { deleteStory } = require('../server/src/db');
      
      let id = null;
      
      // Try to extract ID from path: /api/stories/delete/{id}
      if (path.includes('/delete/')) {
        const pathParts = path.split('/').filter(Boolean);
        const deleteIndex = pathParts.indexOf('delete');
        id = deleteIndex >= 0 && pathParts[deleteIndex + 1] 
          ? pathParts[deleteIndex + 1].split('?')[0]
          : null;
      } 
      // Also try /api/stories/:id pattern
      else if (path.match(/\/api\/stories\/[^\/]+$/)) {
        const pathParts = path.split('/').filter(Boolean);
        const storiesIndex = pathParts.indexOf('stories');
        id = storiesIndex >= 0 && pathParts[storiesIndex + 1] 
          ? pathParts[storiesIndex + 1].split('?')[0]
          : null;
      }
      // Try query params as fallback
      if (!id) {
        id = req.query?.id || req.query?.delete;
      }

      console.log('DELETE request - extracted ID:', { id, path, query: req.query });

      if (!id) {
        return res.status(400).json({ error: 'Story ID is required', debug: { path, query: req.query } });
      }

      try {
        const deleted = await deleteStory(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Story not found' });
        }
        return res.status(200).json({ message: 'Story deleted successfully' });
      } catch (error) {
        console.error('Delete endpoint error:', error);
        return res.status(500).json({
          error: 'Failed to delete story',
          details: error.message,
        });
      }
    }

    // GET /api/stories?id=... - Get single story by ID
    if (method === 'GET' && req.query?.id) {
      const { getStoryById } = require('../server/src/db');
      const storyId = req.query.id;
      
      try {
        const story = await getStoryById(storyId);
        
        if (!story) {
          return res.status(404).json({ error: 'Story not found' });
        }

        const formattedStory = {
          id: story.id,
          title: story.title,
          content: story.content,
          language: story.language,
          source: story.source,
          tag: story.tag,
          imageUrl: story.image_url,
          musicUrl: story.music_url,
          musicPrompt: story.music_prompt,
          soundEffects: story.sound_effects,
          isShared: story.is_shared || false,
          createdAt: story.created_at,
        };

        return res.status(200).json(formattedStory);
      } catch (error) {
        console.error('Error fetching story by ID:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    }

    // Saved stories: GET /api/stories or /api/stories/saved
    // This is the default GET handler - return saved stories unless it's a specific endpoint
    const isSavedPath = 
      method === 'GET' && 
      !path.includes('/rate-limit') && 
      !path.includes('/test') && 
      !path.includes('/search') &&
      !path.includes('/upload') &&
      !path.includes('/delete') &&
      !path.includes('/update');
    
    if (isSavedPath) {
      const ipAddress = getIpAddress(req);
      const stories = await getAllStories(ipAddress);

      const formatted = stories.map((story) => ({
        id: story.id,
        title: story.title,
        content: story.content,
        language: story.language,
        source: story.source,
        tag: story.tag,
        imageUrl: story.image_url,
        isShared: story.is_shared || false,
        createdAt: story.created_at,
      }));

      return res.status(200).json(formatted);
    }

    // Anything else is not implemented yet
    return res.status(404).json({
      error: 'Not implemented',
      details: `Path ${path} with method ${method} is not handled in /api/stories.`,
    });
  } catch (error) {
    console.error('Stories API handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};


