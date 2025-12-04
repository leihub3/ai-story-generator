// Vercel serverless function for stories API (NO EXPRESS)

require('dotenv').config();

const {
  getAllStories,
  checkRateLimit,
} = require('../server/src/db');

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


