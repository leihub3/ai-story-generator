// Vercel serverless function for POST /api/stories/generate-image endpoint

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

module.exports = async (req, res) => {
  // Always set CORS headers first
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request received for GENERATE-IMAGE endpoint');
    return res.status(200).end();
  }

  // Wrap everything in try-catch to ensure we always return JSON
  try {
    const { method } = req;

    console.log('=== POST /api/stories/generate-image Handler Called ===');
    console.log('Method:', method);
    console.log('Body:', req.body);

    if (method !== 'POST') {
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extract story ID from request body
    const { storyId } = req.body || {};

    if (!storyId) {
      return res.status(400).json({ 
        error: 'Story ID is required',
      });
    }
    // Get the story to use its title/content for image generation
    const story = await getStoryById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Create a descriptive prompt for the image based on the story title/content
    // Limit prompt length to avoid issues (DALL-E-3 has a 4000 character limit, but we'll be conservative)
    const storyText = story.title || story.content.substring(0, 200);
    // Clean the text to avoid any problematic characters
    const cleanStoryText = storyText.replace(/[^\w\s.,!?-]/g, '').trim();
    const imagePrompt = `A beautiful, colorful, child-friendly illustration for a children's story about: ${cleanStoryText}. The illustration should be whimsical, magical, and suitable for children. Style: digital art, vibrant colors, fantasy elements.`;

    console.log('Generating image with prompt (length:', imagePrompt.length, '):', imagePrompt);

    // Generate image with DALL-E
    let imageResponse;
    try {
      imageResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout for image generation
        }
      );
    } catch (axiosError) {
      // Log the full error response from OpenAI
      const errorData = axiosError.response?.data;
      const errorMessage = errorData?.error?.message || axiosError.message;
      const errorType = errorData?.error?.type || 'unknown';
      const errorCode = errorData?.error?.code || axiosError.response?.status;
      
      console.error('DALL-E API error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        errorType,
        errorCode,
        errorMessage,
        fullErrorResponse: JSON.stringify(errorData, null, 2),
        promptLength: imagePrompt.length,
        promptPreview: imagePrompt.substring(0, 100)
      });
      
      // Re-throw with more context
      const detailedError = new Error(errorMessage || `OpenAI API error: Status ${errorCode || 'unknown'}`);
      detailedError.statusCode = axiosError.response?.status;
      detailedError.errorData = errorData;
      throw detailedError;
    }

    if (!imageResponse?.data?.data?.[0]?.url) {
      throw new Error('Invalid response from OpenAI: missing image URL');
    }

    const imageUrlFromDalle = imageResponse.data.data[0].url;
    console.log('✅ [GENERATE-IMAGE] Image generated successfully:', imageUrlFromDalle);

    // Download the image and convert to Base64
    let imageUrl = imageUrlFromDalle; // Fallback to URL if conversion fails
    try {
      console.log('📥 [GENERATE-IMAGE] Downloading image to convert to Base64...');
      const imageDownloadResponse = await axios.get(imageUrlFromDalle, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout for image download
      });
      
      // Convert arraybuffer to Base64
      const imageBuffer = Buffer.from(imageDownloadResponse.data);
      const base64String = imageBuffer.toString('base64');
      
      // Determine image format from content-type or default to png
      const contentType = imageDownloadResponse.headers['content-type'] || 'image/png';
      
      // Create data URI
      imageUrl = `data:${contentType};base64,${base64String}`;
      console.log('✅ [GENERATE-IMAGE] Image converted to Base64 successfully. Size:', base64String.length, 'characters');
    } catch (downloadError) {
      console.error('❌ [GENERATE-IMAGE] Error downloading/converting image to Base64:', downloadError.message);
      console.error('❌ [GENERATE-IMAGE] Download error details:', {
        message: downloadError.message,
        response: downloadError.response?.status,
        data: downloadError.response?.data,
      });
      // Fallback to URL if Base64 conversion fails
      console.log('⚠️ [GENERATE-IMAGE] Falling back to URL storage');
      imageUrl = imageUrlFromDalle;
    }

    // Update the story with the new image (Base64 or URL)
    const updatedStory = await updateStory(storyId, { imageUrl });

    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found after image generation' });
    }

    // Format response
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
  } catch (error) {
    console.error('Generate image endpoint error:', error);
    console.error('Error stack:', error.stack);
    
    // Extract error details from OpenAI response
    const errorMessage = error.message || 'Unknown error';
    const openAIError = error.errorData?.error || error.response?.data?.error;
    const statusCode = error.statusCode || error.response?.status || 500;
    
    // Log full error for debugging
    if (error.errorData) {
      console.error('Full OpenAI error response:', JSON.stringify(error.errorData, null, 2));
    }
    
    // Handle specific DALL-E API errors
    if (statusCode === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        details: openAIError?.message || errorMessage,
      });
    }
    
    if (statusCode === 400) {
      return res.status(400).json({
        error: 'Invalid image generation request',
        details: openAIError?.message || errorMessage,
      });
    }
    
    if (statusCode === 500 || statusCode === 503) {
      return res.status(503).json({
        error: 'OpenAI service is temporarily unavailable. Please try again later.',
        details: openAIError?.message || errorMessage || 'The image generation service encountered an error. Please try again in a few moments.',
      });
    }

    // Return the error message from OpenAI if available
    const userFriendlyMessage = openAIError?.message || errorMessage;
    
    return res.status(statusCode >= 400 && statusCode < 500 ? statusCode : 500).json({
      error: 'Failed to generate image',
      details: userFriendlyMessage,
      statusCode: statusCode,
    });
  } catch (outerError) {
    // Catch any unexpected errors that might occur outside the main try-catch
    console.error('Unexpected error in generate-image endpoint:', outerError);
    console.error('Error stack:', outerError.stack);
    
    // Always return JSON, never HTML
    return res.status(500).json({
      error: 'An unexpected error occurred',
      details: outerError.message || 'Please try again later.',
    });
  }
};
