// Vercel serverless function for /api/stories/edit endpoint

require('dotenv').config();
const { updateStory } = require('../../server/src/db');

function setCorsHeaders(res, methods = 'PATCH, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const id = req.query?.id;

  if (!id) {
    return res.status(400).json({ 
      error: 'Story ID is required',
      debug: {
        query: req.query,
        url: req.url
      }
    });
  }

  try {
    const { title, content, imageUrl } = req.body || {};
    
    if (!title && content === undefined && imageUrl === undefined) {
      return res.status(400).json({ error: 'At least title, content, or imageUrl must be provided' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    const updatedStory = await updateStory(id, updates);
    
    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }

    return res.status(200).json({
      id: updatedStory.id,
      title: updatedStory.title,
      content: updatedStory.content,
      language: updatedStory.language,
      source: updatedStory.source,
      tag: updatedStory.tag,
      imageUrl: updatedStory.image_url,
      createdAt: updatedStory.created_at,
    });
  } catch (error) {
    console.error('Edit endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to update story',
      details: error.message,
    });
  }
};

