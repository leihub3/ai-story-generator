// Vercel serverless function for /api/stories/edit endpoint

require('dotenv').config();
const { updateStory } = require('../../server/src/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async (req, res) => {
  // Set CORS headers FIRST, before any other logic
  setCorsHeaders(res);

  // Handle CORS preflight - MUST be handled before any other logic
  if (req.method === 'OPTIONS') {
    console.log('✏️ [EDIT] OPTIONS preflight, returning 200');
    return res.status(200).end();
  }

  console.log('✏️ [EDIT] Edit endpoint called');
  console.log('✏️ [EDIT] Method:', req.method);
  console.log('✏️ [EDIT] URL:', req.url);
  console.log('✏️ [EDIT] Query:', req.query);
  console.log('✏️ [EDIT] Content-Type:', req.headers['content-type']);
  console.log('✏️ [EDIT] Content-Length:', req.headers['content-length']);
  console.log('✏️ [EDIT] Origin:', req.headers['origin']);

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const id = req.query?.id;

  if (!id) {
    return res.status(400).json({ 
      error: 'Story ID is required',
      debug: {
        url: req.url,
        query: req.query,
      }
    });
  }

  try {
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
      imageUrlLength: updates.imageUrl?.length || 0
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
  } catch (error) {
    console.error('❌ [EDIT] Endpoint error:', error);
    console.error('❌ [EDIT] Error stack:', error.stack);
    console.error('❌ [EDIT] Error message:', error.message);
    
    // Check if it's a database error
    if (error.code) {
      console.error('❌ [EDIT] Database error code:', error.code);
    }
    
    return res.status(500).json({
      error: 'Failed to edit story',
      details: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    });
  }
};

