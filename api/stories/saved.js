// Vercel serverless function for /api/stories/saved endpoint

require('dotenv').config();

const { getAllStories } = require('../../server/src/db');

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit');

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
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
      musicUrl: story.music_url,
      musicPrompt: story.music_prompt,
      soundEffects: story.sound_effects,
      isShared: story.is_shared || false,
      createdAt: story.created_at,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Saved stories endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

