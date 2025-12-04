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
  const { method, url } = req;

  // For this handler, Vercel maps `/api/stories` directly here.
  // We support a few simple subpaths via query/path parsing if needed later.
  const path = (url || '').split('?')[0] || '/';

  try {
    // Simple diagnostics endpoint: GET /api/stories?test=1 or /api/stories/test (when routed)
    if (path.endsWith('/test') || req.query?.test === '1') {
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

    // Rate‑limit status: GET /api/stories?rateLimit=1
    if (method === 'GET' && (path.endsWith('/rate-limit') || req.query?.rateLimit === '1')) {
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
    if (method === 'POST' && path.endsWith('/search')) {
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
      const limitInfo = await checkRateLimit(ipAddress, 3);
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
      await incrementRateLimitAfterGeneration(ipAddress);
      const updatedLimit = await checkRateLimit(ipAddress, 3);

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
      res.setHeader('X-RateLimit-Limit', 3);

      return res.status(200).json({
        query,
        results: [story],
      });
    }

    // Saved stories: GET /api/stories
    if (method === 'GET') {
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


