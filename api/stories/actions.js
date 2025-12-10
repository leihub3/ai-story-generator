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
  // Set CORS headers FIRST, before any other logic
  setCorsHeaders(res, 'GET, POST, PATCH, DELETE, OPTIONS');

  // Handle CORS preflight - MUST be handled before any other logic
  if (req.method === 'OPTIONS') {
    console.log('🔧 [ACTIONS] OPTIONS preflight, returning 200');
    return res.status(200).end();
  }

  console.log('🔧 [ACTIONS] Actions endpoint called');
  console.log('🔧 [ACTIONS] Method:', req.method);
  console.log('🔧 [ACTIONS] URL:', req.url);
  console.log('🔧 [ACTIONS] Query:', req.query);
  console.log('🔧 [ACTIONS] Content-Type:', req.headers['content-type']);
  console.log('🔧 [ACTIONS] Content-Length:', req.headers['content-length']);
  console.log('🔧 [ACTIONS] Origin:', req.headers['origin']);
  console.log('🔧 [ACTIONS] All headers:', Object.keys(req.headers));

  // Log body info if available
  if (req.body) {
    console.log('🔧 [ACTIONS] Body received, keys:', Object.keys(req.body || {}));
    if (req.body.imageUrl) {
      const isBase64 = typeof req.body.imageUrl === 'string' && req.body.imageUrl.startsWith('data:image');
      console.log('🔧 [ACTIONS] Body imageUrl info:', {
        isBase64,
        length: req.body.imageUrl.length,
        preview: req.body.imageUrl.substring(0, 50) + '...'
      });
    }
  }

  const { method, url } = req;
  
  // Get the original path - Vercel may pass it in different ways
  // 1. Check x-vercel-original-path header (when rewrite happens)
  // 2. Check x-invoke-path header (alternative Vercel header)
  // 3. Use url directly
  const originalPath = 
    req.headers['x-vercel-original-path'] || 
    req.headers['x-invoke-path'] || 
    url || 
    '';
  
  const path = originalPath.split('?')[0] || url.split('?')[0];
  
  console.log('🔧 [ACTIONS] Path detection:', {
    url,
    originalPath,
    path,
    'x-vercel-original-path': req.headers['x-vercel-original-path'],
    'x-invoke-path': req.headers['x-invoke-path'],
  });
  
  // Determine action from path
  let action = null;
  if (path.includes('/edit')) action = 'edit';
  else if (path.includes('/share')) action = 'share';
  else if (path.includes('/delete')) action = 'delete';

  console.log('🔧 [ACTIONS] Detected action:', action);

  if (!action) {
    console.error('❌ [ACTIONS] No action detected from path');
    return res.status(400).json({ 
      error: 'Invalid action path',
      debug: {
        url,
        path,
        originalPath,
        headers: {
          'x-vercel-original-path': req.headers['x-vercel-original-path'],
          'x-invoke-path': req.headers['x-invoke-path'],
        }
      }
    });
  }

  // Extract ID from query params or path
  let id = req.query && req.query.id;
  
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
      console.log('✏️ [EDIT] Edit action detected');
      console.log('✏️ [EDIT] Story ID:', id);
      console.log('✏️ [EDIT] Request body keys:', Object.keys(req.body || {}));
      
      const { title, content, imageUrl } = req.body || {};
      
      // Log imageUrl info (but not the full Base64 string to avoid log spam)
      if (imageUrl) {
        const isBase64 = imageUrl.startsWith('data:image');
        console.log('✏️ [EDIT] Image URL provided:', {
          isBase64,
          length: imageUrl.length,
          preview: imageUrl.substring(0, 50) + '...'
        });
      }
      
      if (!title && content === undefined && imageUrl === undefined) {
        return res.status(400).json({ error: 'At least title, content, or imageUrl must be provided' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (imageUrl !== undefined) updates.imageUrl = imageUrl;

      console.log('✏️ [EDIT] Updating story with:', {
        hasTitle: !!updates.title,
        hasContent: !!updates.content,
        hasImageUrl: !!updates.imageUrl,
        imageUrlLength: (updates.imageUrl && updates.imageUrl.length) || 0
      });

      const updatedStory = await updateStory(id, updates);
      
      console.log('✅ [EDIT] Story updated successfully');
      
      if (!updatedStory) {
        console.error('❌ [EDIT] Story not found after update');
        return res.status(404).json({ error: 'Story not found' });
      }

      // Return response without the full Base64 image to reduce response size
      const responseData = {
        id: updatedStory.id,
        title: updatedStory.title,
        content: updatedStory.content,
        language: updatedStory.language,
        source: updatedStory.source,
        tag: updatedStory.tag,
        imageUrl: updatedStory.image_url,
        createdAt: updatedStory.created_at,
      };
      
      // Log response size info
      const responseSize = JSON.stringify(responseData).length;
      console.log('✅ [EDIT] Response prepared, size:', responseSize, 'bytes');
      if (responseData.imageUrl) {
        const isBase64 = responseData.imageUrl.startsWith('data:image');
        console.log('✅ [EDIT] Image in response:', {
          isBase64,
          length: responseData.imageUrl.length
        });
      }

      return res.status(200).json(responseData);
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
    const actionUpper = (action && action.toUpperCase()) || 'UNKNOWN';
    console.error(`❌ [${actionUpper}] Endpoint error:`, error);
    console.error(`❌ [${actionUpper}] Error stack:`, error.stack);
    console.error(`❌ [${actionUpper}] Error message:`, error.message);
    
    // Check if it's a database error
    if (error.code) {
      const actionUpper = (action && action.toUpperCase()) || 'UNKNOWN';
      console.error(`❌ [${actionUpper}] Database error code:`, error.code);
    }
    
    return res.status(500).json({
      error: `Failed to ${action} story`,
      details: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    });
  }
};


