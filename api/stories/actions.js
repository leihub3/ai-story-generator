// Vercel serverless function for /api/stories/actions endpoint
// Handles: edit, share, delete actions

require('dotenv').config();
const { updateStory, toggleShareStory, deleteStory } = require('../../server/src/db');

function setCorsHeaders(res, methods = 'PATCH, DELETE, OPTIONS') {
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

  const { method, url } = req;
  const path = url.split('?')[0];
  
  // Determine action from path
  let action = null;
  if (path.includes('/edit')) action = 'edit';
  else if (path.includes('/share')) action = 'share';
  else if (path.includes('/delete')) action = 'delete';

  if (!action) {
    return res.status(400).json({ error: 'Invalid action path' });
  }

  // Extract ID from query params or path
  let id = req.query?.id;
  
  // For delete, also check path and headers
  if (!id && action === 'delete') {
    // Check x-vercel-original-path header first (when rewrite happens)
    if (req.headers['x-vercel-original-path']) {
      const originalPath = req.headers['x-vercel-original-path'];
      const pathParts = originalPath.split('/').filter(Boolean);
      const deleteIndex = pathParts.indexOf('delete');
      if (deleteIndex >= 0 && pathParts[deleteIndex + 1]) {
        id = pathParts[deleteIndex + 1].split('?')[0];
      }
    }
    
    // Try path directly if still no ID
    if (!id) {
      const pathParts = path.split('/').filter(Boolean);
      const actionIndex = pathParts.indexOf(action);
      if (actionIndex >= 0 && pathParts[actionIndex + 1]) {
        id = pathParts[actionIndex + 1];
      }
    }
  }

  if (!id) {
    return res.status(400).json({ 
      error: 'Story ID is required',
      debug: {
        url,
        path,
        query: req.query,
        originalPath: req.headers['x-vercel-original-path']
      }
    });
  }

  try {
    // Handle EDIT action
    if (action === 'edit' && method === 'PATCH') {
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
    }

    // Handle SHARE action
    if (action === 'share' && method === 'PATCH') {
      const updatedStory = await toggleShareStory(id);
      
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
        isShared: updatedStory.is_shared,
        createdAt: updatedStory.created_at,
      });
    }

    // Handle DELETE action
    if (action === 'delete' && method === 'DELETE') {
      const deleted = await deleteStory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Story not found' });
      }

      return res.status(200).json({ message: 'Story deleted successfully' });
    }

    // Invalid method for action
    return res.status(405).json({ error: 'Method Not Allowed' });
    
  } catch (error) {
    console.error(`${action} endpoint error:`, error);
    return res.status(500).json({
      error: `Failed to ${action} story`,
      details: error.message,
    });
  }
};

