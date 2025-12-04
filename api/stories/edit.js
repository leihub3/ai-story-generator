// Vercel serverless function for PATCH /api/stories/edit endpoint

require('dotenv').config();

const { updateStory } = require('../../server/src/db');

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
    console.log('OPTIONS preflight request received for EDIT endpoint');
    return res.status(200).end();
  }

  const { method, url } = req;

  console.log('=== PATCH /api/stories/edit Handler Called ===');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Query:', req.query);
  console.log('Body:', req.body);

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

  // Extract title and content from request body
  const { title, content } = req.body || {};

  if (!title && content === undefined) {
    return res.status(400).json({ error: 'At least title or content must be provided' });
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;

  try {
    console.log('Attempting to update story with ID:', id, 'Updates:', updates);
    const updatedStory = await updateStory(id, updates);

    if (!updatedStory) {
      console.log('Story not found:', id);
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log('Story updated successfully:', id);

    // Format response
    const formattedStory = {
      id: updatedStory.id,
      title: updatedStory.title,
      content: updatedStory.content,
      language: updatedStory.language,
      source: updatedStory.source,
      tag: updatedStory.tag,
      imageUrl: updatedStory.image_url,
      createdAt: updatedStory.created_at,
    };

    return res.status(200).json(formattedStory);
  } catch (error) {
    console.error('Edit endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to update story',
      details: error.message,
    });
  }
};

