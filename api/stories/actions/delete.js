// Vercel serverless function for /api/stories/actions/delete endpoint

require('dotenv').config();
const { deleteStory } = require('../../../server/src/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract ID from query params
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
    const deleted = await deleteStory(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Story not found' });
    }

    return res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to delete story',
      details: error.message,
    });
  }
};

