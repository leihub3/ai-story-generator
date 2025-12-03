// Vercel serverless function for stories API (SIN EXPRESS)

require('dotenv').config();

const {
  getAllStories,
  checkRateLimit,
} = require('../../server/src/db');

// Helper para obtener IP en entorno serverless
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

  // Vercel pasa solo la parte después de /api/stories, por ejemplo: "/test", "/saved"
  const path = (url || '').split('?')[0] || '/';

  try {
    // 1) Endpoint de test: /api/stories/test
    if (path === '/test') {
      return res.status(200).json({
        status: 'ok',
        message: 'Stories API serverless handler is running (sin Express)',
        env: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasOpenAiKey: !!process.env.OPENAI_API_KEY,
          nodeEnv: process.env.NODE_ENV || 'unknown',
        },
      });
    }

    // 2) Rate limit: GET /api/stories/rate-limit
    if (method === 'GET' && path === '/rate-limit') {
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

    // 3) Historias guardadas: GET /api/stories/saved
    if (method === 'GET' && path === '/saved') {
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

    // Cualquier otra ruta aún no implementada
    return res.status(404).json({
      error: 'Not implemented',
      details: `Path ${path} con método ${method} aún no está manejado en la API serverless de stories.`,
    });
  } catch (error) {
    console.error('Stories API handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};