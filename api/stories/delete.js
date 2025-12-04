// Vercel serverless function for DELETE /api/stories/delete/:id

require('dotenv').config();

const { deleteStory } = require('../../server/src/db');

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

module.exports = async (req, res) => {
  // Always set CORS headers first
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request received for DELETE endpoint');
    return res.status(200).end();
  }

  const { method, url } = req;

  console.log('=== DELETE /api/stories/delete Handler Called ===');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Query:', req.query);
  console.log('Headers:', {
    'x-vercel-original-path': req.headers['x-vercel-original-path'],
    'x-invoke-path': req.headers['x-invoke-path'],
  });

  if (method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract ID from URL: /api/stories/delete/:id
  let id = null;
  
  // FIRST: Check x-vercel-original-path header (when rewrite happens)
  // This is the ORIGINAL path before rewrite: /api/stories/delete/2c06dece-...
  if (req.headers['x-vercel-original-path']) {
    const originalPath = req.headers['x-vercel-original-path'];
    console.log('Found x-vercel-original-path:', originalPath);
    const pathParts = originalPath.split('/').filter(Boolean);
    const deleteIndex = pathParts.indexOf('delete');
    if (deleteIndex >= 0 && pathParts[deleteIndex + 1]) {
      id = pathParts[deleteIndex + 1].split('?')[0];
      console.log('Extracted ID from x-vercel-original-path:', id);
    }
  }
  
  // SECOND: Try to get ID from query params (if URL is /api/stories/delete?id=...)
  if (!id && req.query && req.query.id) {
    id = req.query.id;
    console.log('Extracted ID from query params:', id);
  }
  
  // THIRD: Extract from URL path directly (if no rewrite happened)
  if (!id) {
    const urlPath = url.split('?')[0]; // Remove query string
    const pathParts = urlPath.split('/').filter(Boolean); // ['api', 'stories', 'delete', '2c06dece-...']
    
    // Find 'delete' in path and get the next segment
    const deleteIndex = pathParts.indexOf('delete');
    if (deleteIndex >= 0 && pathParts[deleteIndex + 1]) {
      id = pathParts[deleteIndex + 1];
      console.log('Extracted ID from URL path:', id);
    }
  }

  console.log('Extracted ID:', id);

  if (!id) {
    return res.status(400).json({ 
      error: 'Story ID is required',
      debug: { 
        url, 
        query: req.query,
        originalPath: req.headers['x-vercel-original-path'],
        pathParts: url.split('?')[0].split('/').filter(Boolean)
      }
    });
  }

  try {
    console.log('Attempting to delete story with ID:', id);
    const deleted = await deleteStory(id);

    if (!deleted) {
      console.log('Story not found:', id);
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log('Story deleted successfully:', id);
    return res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to delete story',
      details: error.message,
    });
  }
};

