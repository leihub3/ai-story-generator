// Vercel serverless function for /api/stories/:id endpoint (GET story by ID)

require('dotenv').config();

const { getStoryById, deleteStory, updateStory } = require('../../server/src/db');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const { method } = req;
  const { id } = req.query; // Vercel passes route params in req.query

  if (!id) {
    return res.status(400).json({ error: 'Story ID is required' });
  }

  try {
    // GET /api/stories/:id - Get story by ID
    if (method === 'GET') {
      const story = await getStoryById(id);

      if (!story) {
        return res.status(404).json({ error: 'Story not found' });
      }

      const formattedStory = {
        id: story.id,
        title: story.title,
        content: story.content,
        language: story.language,
        source: story.source,
        tag: story.tag,
        imageUrl: story.image_url,
        createdAt: story.created_at,
      };

      return res.status(200).json(formattedStory);
    }

    // DELETE /api/stories/:id - Delete story
    if (method === 'DELETE') {
      const deleted = await deleteStory(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Story not found' });
      }

      return res.status(200).json({ message: 'Story deleted successfully' });
    }

    // PATCH /api/stories/:id - Update story
    if (method === 'PATCH') {
      const { title, content } = req.body || {};

      if (!title && content === undefined) {
        return res.status(400).json({ error: 'At least title or content must be provided' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;

      const updatedStory = await updateStory(id, updates);

      if (!updatedStory) {
        return res.status(404).json({ error: 'Story not found' });
      }

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
    }

    res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Story by ID endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

