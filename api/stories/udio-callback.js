// Vercel serverless function for POST /api/stories/udio-callback endpoint
// This endpoint receives callbacks from Udio API when music generation is complete
// Based on: https://udioapi.pro/docs/generate-callback

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
    console.log('OPTIONS preflight request received for UDIO-CALLBACK endpoint');
    return res.status(200).end();
  }

  const { method } = req;

  console.log('=== POST /api/stories/udio-callback Handler Called ===');
  console.log('Method:', method);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Udio callback can have different formats:
    // 1. Direct array: [{ id, audio_url, status, ... }, ...]
    // 2. Wrapped in data.response_data: { data: { response_data: [...] } }
    let results = [];
    
    if (Array.isArray(req.body)) {
      // Format 1: Direct array
      results = req.body;
    } else if (req.body?.data?.response_data && Array.isArray(req.body.data.response_data)) {
      // Format 2: Wrapped in data.response_data
      results = req.body.data.response_data;
    } else if (req.body?.response_data && Array.isArray(req.body.response_data)) {
      // Alternative format
      results = req.body.response_data;
    } else if (req.body) {
      // Single result object
      results = [req.body];
    }
    
    if (!results || results.length === 0) {
      console.error('Invalid callback: empty results. Body:', JSON.stringify(req.body, null, 2));
      return res.status(200).json({ status: 'received', error: 'Empty results' });
    }

    // Extract storyId from query parameter
    const storyId = req.query?.storyId;

    console.log('Udio callback received:', {
      resultsCount: results.length,
      storyId,
      firstResultStatus: results[0]?.status,
      bodyStructure: Object.keys(req.body || {})
    });

    // Process each result
    for (const result of results) {
      const status = result.status;
      const audioUrl = result.audio_url;
      const taskId = result.id;

      console.log('Processing result:', {
        taskId,
        status,
        hasAudioUrl: !!audioUrl
      });

      // Only process when status is "complete" and we have an audio URL
      if (status === 'complete' && audioUrl) {
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
          // Check if column exists first
          try {
            const columnCheck = await query(
              `SELECT column_name 
               FROM information_schema.columns 
               WHERE table_name='stories' AND column_name='suno_task_id'`
            );
            if (columnCheck.rows.length > 0) {
              storyToUpdate = await query(
                'SELECT id FROM stories WHERE suno_task_id = $1',
                [taskId]
              );
            } else {
              console.warn('Column suno_task_id does not exist. Cannot find story by task_id. Please run migration 003_add_audio_fields.sql');
              storyToUpdate = { rows: [] };
            }
          } catch (err) {
            console.warn('Could not check for suno_task_id column:', err.message);
            storyToUpdate = { rows: [] };
          }
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
      } else if (status === 'text') {
        console.log('Text generation completed for task:', taskId);
      } else if (status === 'first') {
        console.log('First audio generated for task:', taskId, 'audio_url:', audioUrl);
        // Optionally update with first audio if needed
      } else if (result.error_message || result.fail_message) {
        console.error('Music generation failed for task:', taskId, {
          error: result.error_message || result.fail_message
        });
      }
    }

    // Always return 200 to confirm callback received
    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Callback processing error:', error);
    // Still return 200 to prevent retries
    return res.status(200).json({ status: 'received', error: error.message });
  }
};

