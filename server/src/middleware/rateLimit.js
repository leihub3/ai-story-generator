const { checkRateLimit, incrementRateLimit } = require('../db');

/**
 * Rate limiting middleware
 * Limits story generation to 3 stories per IP per day
 */
async function rateLimitMiddleware(req, res, next) {
  try {
    // Get IP address from request
    const ipAddress = req.ip || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection.remoteAddress ||
                     'unknown';
    
    // Check rate limit
    const rateLimitInfo = await checkRateLimit(ipAddress, 3);
    
    // Add rate limit info to response headers
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetDate.toISOString());
    res.setHeader('X-RateLimit-Limit', 3);
    
    // If rate limit exceeded, return error
    if (!rateLimitInfo.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have reached the daily limit of 3 stories. Please try again tomorrow.',
        resetDate: rateLimitInfo.resetDate.toISOString(),
        remaining: 0
      });
    }
    
    // Store IP address and rate limit info in request for later use
    req.ipAddress = ipAddress;
    req.rateLimitInfo = rateLimitInfo;
    
    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // On error, allow the request (fail open)
    req.ipAddress = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    next();
  }
}

/**
 * Increment rate limit after successful story generation
 * @param {string} ipAddress - IP address
 */
async function incrementRateLimitAfterGeneration(ipAddress) {
  try {
    const today = new Date();
    await incrementRateLimit(ipAddress, today);
  } catch (error) {
    console.error('Error incrementing rate limit after generation:', error);
    // Don't throw - this is not critical
  }
}

module.exports = {
  rateLimitMiddleware,
  incrementRateLimitAfterGeneration
};


