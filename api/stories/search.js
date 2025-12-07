// Vercel serverless function for /api/stories/search endpoint

require('dotenv').config();

const axios = require('axios');
const { checkRateLimit, saveStory } = require('../../server/src/db');
const { incrementRateLimitAfterGeneration } = require('../../server/src/middleware/rateLimit');

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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Limit');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
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

    // Generate image with DALL-E (only for single stories, not multiple)
    let imageUrl = null;
    if (!isMultipleStories) {
      try {
        // Create a descriptive prompt for the image based on the story title/content
        const imagePrompt = `A beautiful, colorful, child-friendly illustration for a children's story about: ${userTitle || query}. The illustration should be whimsical, magical, and suitable for children. Style: digital art, vibrant colors, fantasy elements.`;

        const imageResponse = await axios.post(
          'https://api.openai.com/v1/images/generations',
          {
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const imageUrlFromDalle = imageResponse.data.data[0].url;
        console.log('Image generated successfully:', imageUrlFromDalle);
        
        // Download the image and convert to Base64
        try {
          console.log('Downloading image to convert to Base64...');
          const imageDownloadResponse = await axios.get(imageUrlFromDalle, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 second timeout for image download
          });
          
          // Convert arraybuffer to Base64
          const imageBuffer = Buffer.from(imageDownloadResponse.data);
          const base64String = imageBuffer.toString('base64');
          
          // Determine image format from content-type or default to png
          const contentType = imageDownloadResponse.headers['content-type'] || 'image/png';
          
          // Create data URI
          imageUrl = `data:${contentType};base64,${base64String}`;
          console.log('Image converted to Base64 successfully. Size:', base64String.length, 'characters');
        } catch (downloadError) {
          console.error('Error downloading/converting image to Base64:', downloadError.message);
          // Fallback to URL if Base64 conversion fails
          console.log('Falling back to URL storage');
          imageUrl = imageUrlFromDalle;
        }
      } catch (error) {
        console.error('DALL-E API error:', error.response?.data || error.message);
        // Continue without image if generation fails - story will still be generated
        imageUrl = null;
      }
    }

    // Increment rate limit after successful generation
    // Reuse isDevelopment and rateLimit from above
    await incrementRateLimitAfterGeneration(ipAddress);
    const updatedLimit = await checkRateLimit(ipAddress, rateLimit);

    // Save story to database first (needed for audio generation)
    const savedStory = await saveStory({
      title: isMultipleStories ? 'Multiple Myths Collection' : userTitle || query,
      content: storyContent,
      language,
      source: 'openai',
      imageUrl,
      ipAddress,
    });

    const story = {
      id: savedStory.id, // Use database ID instead of timestamp
      title: savedStory.title,
      content: savedStory.content,
      language: savedStory.language,
      source: savedStory.source,
      imageUrl: savedStory.image_url,
      musicUrl: null,
      musicPrompt: null,
      soundEffects: null,
      createdAt: savedStory.created_at,
    };

    // Reuse isDevelopment and rateLimit from above (declared at line 57-58)
    res.setHeader('X-RateLimit-Remaining', updatedLimit.remaining);
    res.setHeader('X-RateLimit-Reset', updatedLimit.resetDate.toISOString());
    res.setHeader('X-RateLimit-Limit', rateLimit);

    return res.status(200).json({
      query,
      results: [story],
    });
  } catch (error) {
    console.error('Search endpoint error:', error);
    return res.status(error.response?.status || 500).json({
      error: 'Search failed',
      details: error.response?.data?.message || error.message,
    });
  }
};

