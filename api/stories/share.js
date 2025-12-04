// Vercel serverless function for PATCH /api/stories/share endpoint

require('dotenv').config();

const { toggleShareStory } = require('../../server/src/db');

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

module.exports = async (req, res) => {
  // Always set CORS headers first
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request received for SHARE endpoint');
    return res.status(200).end();
  }

  const { method, url } = req;

  console.log('=== PATCH /api/stories/share Handler Called ===');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Query:', req.query);

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract ID from query params
  const id = req.query?.id;

  console.log('Extracted ID:', id);

  if (!id) {
    return res.status(400).json({ 
      error: 'Story ID is required',
      debug: { 
        url, 
        query: req.query,
      }
    });
  }

  try {
    console.log('Attempting to toggle share status for story with ID:', id);
    const updatedStory = await toggleShareStory(id);

    if (!updatedStory) {
      console.log('Story not found:', id);
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log('Story share status toggled successfully:', id, 'is_shared:', updatedStory.is_shared);

    // Format response
    const formattedStory = {
      id: updatedStory.id,
      title: updatedStory.title,
      content: updatedStory.content,
      language: updatedStory.language,
      source: updatedStory.source,
      tag: updatedStory.tag,
      imageUrl: updatedStory.image_url,
      isShared: updatedStory.is_shared,
      createdAt: updatedStory.created_at,
    };

    return res.status(200).json(formattedStory);
  } catch (error) {
    console.error('Share endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to toggle share status',
      details: error.message,
    });
  }
};

