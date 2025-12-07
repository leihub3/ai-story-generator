// Vercel serverless function for POST /api/stories/suno-callback endpoint
// This endpoint receives callbacks from Suno API when music generation is complete

require('dotenv').config();
const { updateStory, query } = require('../../server/src/db');

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

module.exports = async (req, res) => {
  // Always set CORS headers first
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request received for SUNO-CALLBACK endpoint');
    return res.status(200).end();
  }

  const { method } = req;

  console.log('=== POST /api/stories/suno-callback Handler Called ===');
  console.log('Method:', method);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { code, msg, data } = req.body || {};

    if (!data || !data.task_id) {
      console.error('Invalid callback: missing task_id');
      return res.status(200).json({ status: 'received', error: 'Missing task_id' });
    }

    const taskId = data.task_id;
    const callbackType = data.callbackType;

    // Extract storyId from query parameter if available
    const storyId = req.query?.storyId;

    console.log('Suno callback received:', {
      taskId,
      storyId,
      callbackType,
      code,
      message: msg
    });

    if (code === 200 && callbackType === 'complete' && data.data && data.data.length > 0) {
      // Task completed successfully
      const musicData = data.data[0]; // Get first track
      const audioUrl = musicData.audio_url || musicData.source_audio_url;
      
      if (!audioUrl) {
        console.error('No audio URL in callback data');
        return res.status(200).json({ status: 'received', error: 'No audio URL' });
      }

      // Find story by storyId (from query) or by task_id
      let storyToUpdate = null;
      
      if (storyId) {
        // Use storyId from query parameter
        storyToUpdate = await query(
          'SELECT id FROM stories WHERE id = $1',
          [storyId]
        );
      } else {
        // Fallback: Find by task_id stored in database
        storyToUpdate = await query(
          'SELECT id FROM stories WHERE suno_task_id = $1',
          [taskId]
        );
      }

      if (storyToUpdate.rows.length > 0) {
        const foundStoryId = storyToUpdate.rows[0].id;
        
        // Update the story with the music URL
        await updateStory(foundStoryId, {
          musicUrl: audioUrl
        });

        console.log('Story updated with music URL:', foundStoryId, audioUrl);
      } else {
        console.warn('Could not find story for task_id:', taskId, 'storyId:', storyId);
      }
    } else if (code !== 200) {
      // Task failed
      console.error('Music generation failed:', {
        code,
        message: msg,
        taskId
      });
    }

    // Always return 200 to confirm callback received
    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Callback processing error:', error);
    // Still return 200 to prevent retries
    return res.status(200).json({ status: 'received', error: error.message });
  }
};

