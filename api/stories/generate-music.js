// Vercel serverless function for POST /api/stories/generate-music endpoint
// Uses Udio API for music generation

require('dotenv').config();
const axios = require('axios');
const { updateStory, getStoryById } = require('../../server/src/db');

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

// Polling function to check music generation status using /api/v2/feed
// This is a fallback in case the callback doesn't work
async function pollForMusicCompletion(storyId, workId, maxAttempts = 60) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls
    attempts++;
    
    try {
      console.log(`Polling attempt ${attempts}/${maxAttempts} for workId: ${workId}`);
      
      // Use POST as shown in user's working curl command
      const feedResponse = await axios.post(
        `https://udioapi.pro/api/v2/feed?workId=${workId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${process.env.UDIO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      const feedData = feedResponse.data;
      
      // Check if we have response_data with complete status
      if (feedData?.data?.response_data && Array.isArray(feedData.data.response_data)) {
        const completedTracks = feedData.data.response_data.filter(
          track => track.status === 'complete' && track.audio_url
        );
        
        if (completedTracks.length > 0) {
          // Use the first completed track's audio URL
          const audioUrl = completedTracks[0].audio_url;
          console.log('✅ Music generation completed via polling:', audioUrl);
          
          // Update the story with the music URL
          await updateStory(storyId, {
            musicUrl: audioUrl
          });
          
          console.log('Story updated with music URL via polling:', storyId, audioUrl);
          return; // Success, stop polling
        }
      }
      
      // Check if there's an error
      if (feedData?.data?.type === 'ERROR' || feedData?.code !== 200) {
        console.error('Music generation failed:', feedData);
        return; // Stop polling on error
      }
      
      console.log(`Polling: status not complete yet (attempt ${attempts}/${maxAttempts})`);
    } catch (pollError) {
      console.warn(`Polling error (attempt ${attempts}/${maxAttempts}):`, pollError.message);
      // Continue polling on errors (might be temporary)
      if (attempts >= maxAttempts) {
        console.error('Polling timeout - music generation may still be in progress');
      }
    }
  }
  
  console.warn('Polling completed without finding completed music. Callback may still deliver results.');
}

module.exports = async (req, res) => {
  console.log('🎵🎵🎵 [GENERATE-MUSIC] ============================================');
  console.log('🎵 [GENERATE-MUSIC] Function called at:', new Date().toISOString());
  console.log('🎵 [GENERATE-MUSIC] Request method:', req.method);
  console.log('🎵 [GENERATE-MUSIC] Request body:', JSON.stringify(req.body, null, 2));
  console.log('🎵 [GENERATE-MUSIC] Request headers keys:', Object.keys(req.headers || {}));
  
  // Always set CORS headers first
  setCorsHeaders(res);
  console.log('🎵 [GENERATE-MUSIC] CORS headers set');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('🎵 [GENERATE-MUSIC] OPTIONS preflight request received');
    return res.status(200).end();
  }

  const { method } = req;

  console.log('🎵 [GENERATE-MUSIC] Processing request with method:', method);

  if (method !== 'POST') {
    console.error('❌ [GENERATE-MUSIC] Invalid method:', method);
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('✅ [GENERATE-MUSIC] Method is POST, proceeding...');

  // Extract story ID and optional music prompt from request body
  const { storyId, musicPrompt } = req.body || {};

  console.log('🔍 [GENERATE-MUSIC] Extracted storyId:', storyId);
  console.log('🔍 [GENERATE-MUSIC] Extracted musicPrompt:', musicPrompt ? `provided (${musicPrompt.length} chars)` : 'not provided');
  console.log('🔍 [GENERATE-MUSIC] Full req.body:', JSON.stringify(req.body, null, 2));

  if (!storyId) {
    console.error('❌ [GENERATE-MUSIC] Story ID is missing!');
    console.error('❌ [GENERATE-MUSIC] Body:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({ 
      error: 'Story ID is required',
    });
  }

  console.log('✅ [GENERATE-MUSIC] Story ID validated:', storyId);

  // Verify API key is available
  console.log('🔑 [GENERATE-MUSIC] Checking UDIO_API_KEY...');
  console.log('🔑 [GENERATE-MUSIC] UDIO_API_KEY exists:', !!process.env.UDIO_API_KEY);
  console.log('🔑 [GENERATE-MUSIC] UDIO_API_KEY value:', process.env.UDIO_API_KEY ? `${process.env.UDIO_API_KEY.substring(0, 10)}...` : 'NOT SET');
  
  if (!process.env.UDIO_API_KEY) {
    console.error('❌ [GENERATE-MUSIC] UDIO_API_KEY is not set!');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Udio API key is not configured',
    });
  }

  console.log('✅ [GENERATE-MUSIC] UDIO_API_KEY is configured');

  try {
    console.log('📚 [GENERATE-MUSIC] Fetching story from database...');
    console.log('📚 [GENERATE-MUSIC] Story ID to fetch:', storyId);
    
    // Get the story from database
    let story;
    try {
      console.log('📚 [GENERATE-MUSIC] About to call getStoryById...');
      console.log('📚 [GENERATE-MUSIC] Current time:', new Date().toISOString());
      
      // Add a timeout to prevent hanging
      const dbQueryPromise = getStoryById(storyId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout after 10 seconds')), 10000)
      );
      
      story = await Promise.race([dbQueryPromise, timeoutPromise]);
      console.log('📚 [GENERATE-MUSIC] Database query completed at:', new Date().toISOString());
    } catch (dbError) {
      console.error('❌ [GENERATE-MUSIC] Database error:', dbError.message);
      console.error('❌ [GENERATE-MUSIC] Database error stack:', dbError.stack);
      throw dbError;
    }
    
    console.log('📚 [GENERATE-MUSIC] Story fetched:', story ? 'Found' : 'NOT FOUND');
    if (story) {
      console.log('📚 [GENERATE-MUSIC] Story title:', story.title);
      console.log('📚 [GENERATE-MUSIC] Story content length:', story.content?.length || 0);
      console.log('📚 [GENERATE-MUSIC] Story keys:', Object.keys(story));
    } else {
      console.error('❌ [GENERATE-MUSIC] Story is null or undefined');
    }
    
    if (!story) {
      console.error('❌ [GENERATE-MUSIC] Story not found in database for ID:', storyId);
      return res.status(404).json({ error: 'Story not found' });
    }

    // ALWAYS use full story content as prompt - never use AI-generated suggestions
    // The user explicitly requested to pass the FULL story text (generated by GPT) as prompt
    const promptToUse = `${story.title}\n\n${story.content}`;

    console.log('📝 [GENERATE-MUSIC] Created prompt from story');
    console.log('📝 [GENERATE-MUSIC] Prompt length:', promptToUse.length);
    console.log('📝 [GENERATE-MUSIC] Prompt preview (first 200 chars):', promptToUse.substring(0, 200));

    // Call Udio API to generate music
    // Based on Udio API documentation: https://udioapi.pro/docs/generate-callback
    
    // Construct callback URL - use Vercel URL if available, otherwise use environment variable
    // The callback URL must be publicly accessible
    // VERCEL_URL is automatically set by Vercel in production (e.g., "ai-story-generator.vercel.app")
    // For local development, use UDIO_CALLBACK_BASE_URL or VERCEL_URL from vercel dev
    let baseUrl;
    if (process.env.VERCEL_URL) {
      // VERCEL_URL might already include https:// or might not
      baseUrl = process.env.VERCEL_URL.startsWith('http') 
        ? process.env.VERCEL_URL 
        : `https://${process.env.VERCEL_URL}`;
    } else if (process.env.UDIO_CALLBACK_BASE_URL) {
      baseUrl = process.env.UDIO_CALLBACK_BASE_URL;
    } else {
      // Fallback - try to get from request headers (Vercel sets this)
      const host = req.headers.host || req.headers['x-forwarded-host'];
      baseUrl = host ? `https://${host}` : 'https://your-domain.vercel.app';
      console.warn('No VERCEL_URL or UDIO_CALLBACK_BASE_URL set, using:', baseUrl);
    }
    
    const callbackUrl = `${baseUrl}/api/stories/udio-callback?storyId=${storyId}`;
    console.log('🔗 [GENERATE-MUSIC] Callback URL constructed:', callbackUrl);
    
    // Construct request payload for Udio API
    // According to docs: https://udioapi.pro/docs/generate-callback
    // User requested: always generate instrumental music and send full story text as prompt
    const requestPayload = {
      prompt: promptToUse, // Full story text (title + content)
      callback_url: callbackUrl,
      make_instrumental: true, // Always instrumental as per user request
      model: 'chirp-v4-5', // Default model
      style: 'instrumental, background music, children story, fantasy, whimsical'
    };
    
    console.log('📤 [GENERATE-MUSIC] Request payload prepared');
    console.log('📤 [GENERATE-MUSIC] Payload prompt length:', requestPayload.prompt.length);
    console.log('📤 [GENERATE-MUSIC] Payload callback_url:', requestPayload.callback_url);
    console.log('📤 [GENERATE-MUSIC] Payload make_instrumental:', requestPayload.make_instrumental);
    
    // Declare taskId outside try block so it's available in the response
    let taskId = null;
    
    try {
      // Udio API endpoint for music generation
      let udioResponse;
      
      console.log('🌐 [GENERATE-MUSIC] Calling Udio API...');
      console.log('🌐 [GENERATE-MUSIC] Endpoint: https://udioapi.pro/api/generate');
      
      // Use Udio API endpoint and format
      // According to docs: https://udioapi.pro/docs/generate-callback
      udioResponse = await axios.post(
        'https://udioapi.pro/api/generate',
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.UDIO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds for initial request
        }
      );
      
      console.log('✅ [GENERATE-MUSIC] Udio API responded!');
      console.log('📥 [GENERATE-MUSIC] Response status:', udioResponse.status);
      console.log('📥 [GENERATE-MUSIC] Response headers:', JSON.stringify(udioResponse.headers, null, 2));
      console.log('📥 [GENERATE-MUSIC] Full response data:', JSON.stringify(udioResponse.data, null, 2));
      
      // Extract task ID from response
      // Response format: { code: 200, message: "success", workId: "...", data: { task_id: "..." } }
      // Both workId and data.task_id should contain the same value
      const responseData = udioResponse.data;
      console.log('🔍 [GENERATE-MUSIC] Extracting task ID from response...');
      console.log('🔍 [GENERATE-MUSIC] responseData.data?.task_id:', responseData?.data?.task_id);
      console.log('🔍 [GENERATE-MUSIC] responseData.workId:', responseData?.workId);
      console.log('🔍 [GENERATE-MUSIC] responseData.data?.taskId:', responseData?.data?.taskId);
      console.log('🔍 [GENERATE-MUSIC] responseData.id:', responseData?.id);
      console.log('🔍 [GENERATE-MUSIC] responseData.task_id:', responseData?.task_id);
      
      taskId = responseData?.data?.task_id || 
               responseData?.workId ||
               responseData?.data?.taskId ||
               responseData?.id || 
               responseData?.task_id;
      
      if (!taskId) {
        console.error('❌ [GENERATE-MUSIC] Failed to extract task ID from response!');
        console.error('❌ [GENERATE-MUSIC] Full response:', JSON.stringify(responseData, null, 2));
        throw new Error('Invalid response from Udio API: missing task ID. Response: ' + JSON.stringify(responseData));
      }
      
      console.log('✅ [GENERATE-MUSIC] Successfully extracted task ID:', taskId);
      
      // Store task_id and music prompt in database for callback lookup
      console.log('💾 [GENERATE-MUSIC] Updating story in database with task ID...');
      try {
        await updateStory(storyId, {
          sunoTaskId: taskId, // Keep same field name for compatibility
          musicPrompt: promptToUse
        });
        console.log('✅ [GENERATE-MUSIC] Story updated successfully in database');
      } catch (updateError) {
        console.error('❌ [GENERATE-MUSIC] Error updating story in database:', updateError.message);
        console.error('❌ [GENERATE-MUSIC] Update error stack:', updateError.stack);
        // Continue anyway - the task ID is still valid
      }
      
      console.log('Udio task created:', {
        taskId,
        storyId,
        callbackUrl
      });

      // Start polling as fallback in case callback doesn't work
      // Poll using /api/v2/feed endpoint
      pollForMusicCompletion(storyId, taskId).catch(err => {
        console.error('Polling error (non-fatal, callback may still work):', err.message);
      });

      // Udio API is async - it will send results via callback
      // Polling is a fallback in case callback fails
      console.log('Music generation started, waiting for callback. Task ID:', taskId);
      
    } catch (udioError) {
      console.error('Udio API error:', {
        status: udioError.response?.status,
        statusText: udioError.response?.statusText,
        data: udioError.response?.data,
        message: udioError.message,
        url: udioError.config?.url
      });
      
      // If Udio API fails, provide helpful error message
      if (udioError.response?.status === 401) {
        throw new Error('Invalid Udio API key. Please check your UDIO_API_KEY environment variable.');
      } else if (udioError.response?.status === 403) {
        throw new Error('Udio API access forbidden. Please check your API key permissions.');
      } else if (udioError.response?.status === 429) {
        throw new Error('Udio API rate limit exceeded. Please try again later.');
      } else if (udioError.response?.status === 503 || udioError.response?.status === 502) {
        throw new Error('Udio API service is temporarily unavailable. Please try again in a few minutes.');
      } else if (udioError.response?.status === 500) {
        throw new Error('Udio API internal server error. Please try again later.');
      } else if (udioError.response?.status === 404) {
        throw new Error('Udio API endpoint not found. The API may have changed. Please check the documentation.');
      } else if (udioError.response?.status === 400) {
        const errorMsg = udioError.response?.data?.message || 'Bad request';
        throw new Error(`Udio API error: ${errorMsg}`);
      } else if (udioError.code === 'ECONNREFUSED' || udioError.code === 'ETIMEDOUT') {
        throw new Error('Cannot connect to Udio API. Please check your internet connection and try again.');
      } else {
        const errorMsg = udioError.response?.data?.message || 
                        udioError.response?.data?.error?.message || 
                        udioError.message;
        throw new Error(`Udio API error (${udioError.response?.status || 'unknown'}): ${errorMsg}`);
      }
    }

    // Get the current story state
    const currentStory = await getStoryById(storyId);

    if (!currentStory) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Format response
    const formattedStory = {
      id: currentStory.id,
      title: currentStory.title,
      content: currentStory.content,
      language: currentStory.language,
      source: currentStory.source,
      tag: currentStory.tag,
      imageUrl: currentStory.image_url,
      musicUrl: currentStory.music_url,
      musicPrompt: currentStory.music_prompt,
      soundEffects: currentStory.sound_effects,
      createdAt: currentStory.created_at,
    };

    // Udio API is async - always return 202 (Accepted) indicating it's being processed via callback
    return res.status(202).json({
      ...formattedStory,
      message: 'Music generation started. The story will be updated automatically when generation completes via callback.',
      ...(taskId && { taskId }) // Only include taskId if it was successfully extracted
    });
  } catch (error) {
    console.error('❌❌❌ [GENERATE-MUSIC] ========== ERROR ==========');
    console.error('❌ [GENERATE-MUSIC] Error type:', error.constructor.name);
    console.error('❌ [GENERATE-MUSIC] Error message:', error.message);
    console.error('❌ [GENERATE-MUSIC] Error stack:', error.stack);
    console.error('❌ [GENERATE-MUSIC] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('❌❌❌ [GENERATE-MUSIC] ============================');
    
    return res.status(500).json({
      error: 'Failed to generate music',
      details: error.message,
    });
  }
};

