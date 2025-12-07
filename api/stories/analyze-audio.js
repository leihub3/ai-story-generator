// Vercel serverless function for POST /api/stories/analyze-audio endpoint

require('dotenv').config();
const axios = require('axios');
const { getStoryById } = require('../../server/src/db');

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
    console.log('OPTIONS preflight request received for ANALYZE-AUDIO endpoint');
    return res.status(200).end();
  }

  const { method } = req;

  console.log('=== POST /api/stories/analyze-audio Handler Called ===');
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

  try {
    // Get the story from database
    const story = await getStoryById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Analyze story content with GPT to extract emotional context
    const analysisPrompt = `Analyze this children's story and provide:
1. Emotional tone (happy, sad, adventurous, magical, etc.)
2. Genre/theme (fantasy, adventure, mystery, etc.)
3. Key scenes that would benefit from sound effects
4. Overall atmosphere

Story Title: ${story.title}
Story Content: ${story.content.substring(0, 2000)}

Respond in JSON format:
{
  "tone": "emotional tone",
  "genre": "genre/theme",
  "atmosphere": "overall atmosphere description",
  "musicPrompt": "detailed prompt for background music generation",
  "soundEffects": [
    {"paragraph": 0, "keywords": ["magic", "spell"], "suggestedEffect": "magic_spell"},
    {"paragraph": 1, "keywords": ["door", "open"], "suggestedEffect": "door_open"}
  ]
}`;

    console.log('Analyzing story with GPT...');

    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing children\'s stories for audio production. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysisText = gptResponse.data.choices[0].message.content.trim();
    
    // Parse JSON response (handle markdown code blocks if present)
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = analysisText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', analysisText);
      // Fallback: create basic analysis
      analysis = {
        tone: 'adventurous',
        genre: 'fantasy',
        atmosphere: 'whimsical and magical',
        musicPrompt: `Upbeat magical adventure music for a children's story about ${story.title}. Whimsical, fantasy style, suitable for children.`,
        soundEffects: []
      };
    }

    // Enhance music prompt for Udio
    const enhancedMusicPrompt = analysis.musicPrompt || 
      `${analysis.tone} ${analysis.genre} music for children's story. ${analysis.atmosphere}. Instrumental, no lyrics, suitable for background music.`;

    console.log('Analysis complete:', {
      tone: analysis.tone,
      genre: analysis.genre,
      musicPrompt: enhancedMusicPrompt,
      soundEffectsCount: analysis.soundEffects?.length || 0
    });

    return res.status(200).json({
      storyId,
      analysis: {
        tone: analysis.tone,
        genre: analysis.genre,
        atmosphere: analysis.atmosphere,
        musicPrompt: enhancedMusicPrompt,
        soundEffects: analysis.soundEffects || []
      }
    });
  } catch (error) {
    console.error('Analyze audio endpoint error:', error);
    
    return res.status(500).json({
      error: 'Failed to analyze story for audio',
      details: error.message,
    });
  }
};

