// Vercel serverless function for /api/stories/rate-limit endpoint

require('dotenv').config();

const { checkRateLimit } = require('../../server/src/db');

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
    // In development, use a very high limit (9999) to effectively disable rate limiting
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const rateLimit = isDevelopment ? 9999 : 3;
    const info = await checkRateLimit(ipAddress, rateLimit);

    res.setHeader('X-RateLimit-Remaining', info.remaining);
    res.setHeader('X-RateLimit-Reset', info.resetDate.toISOString());
    res.setHeader('X-RateLimit-Limit', rateLimit);

    return res.status(200).json({
      remaining: info.remaining,
      limit: rateLimit,
      resetDate: info.resetDate.toISOString(),
    });
  } catch (error) {
    console.error('Rate limit endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

