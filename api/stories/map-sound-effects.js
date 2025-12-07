// Vercel serverless function for POST /api/stories/map-sound-effects endpoint

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

// Keyword to Freesound search query mapping
const KEYWORD_TO_QUERY = {
  magic: 'magic spell',
  spell: 'magic spell',
  door: 'door open',
  open: 'door open',
  close: 'door close',
  footsteps: 'footsteps walking',
  walk: 'footsteps walking',
  run: 'footsteps running',
  laugh: 'laugh',
  cry: 'cry',
  thunder: 'thunder',
  rain: 'rain',
  wind: 'wind',
  fire: 'fire crackling',
  water: 'water',
  sword: 'sword clash',
  fight: 'sword fight',
  bell: 'bell',
  chime: 'bell chime',
  whisper: 'whisper',
  scream: 'scream',
  cheer: 'cheer',
  clap: 'applause',
  forest: 'forest ambience',
  ocean: 'ocean waves',
  bird: 'bird chirp',
  wolf: 'wolf howl',
  dragon: 'dragon roar',
};

// Get Freesound access token
async function getFreesoundToken() {
  const clientId = process.env.FREESOUND_CLIENT_ID;
  const clientSecret = process.env.FREESOUND_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Freesound API credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://freesound.org/apiv2/oauth2/access_token/',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Freesound token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Freesound API');
  }
}

// Search for sound effect in Freesound
async function searchFreesoundSound(query, accessToken) {
  try {
    const response = await axios.get('https://freesound.org/apiv2/search/text/', {
      params: {
        query: query,
        fields: 'id,name,previews',
        page_size: 1,
        sort: 'rating',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const sound = response.data.results[0];
      // Use the preview URL (mp3 format)
      const previewUrl = sound.previews?.['preview-hq-mp3'] || sound.previews?.['preview-lq-mp3'];
      if (previewUrl) {
        return {
          name: sound.name,
          url: previewUrl,
          id: sound.id,
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error searching Freesound for "${query}":`, error.response?.data || error.message);
    return null;
  }
}

// Function to find matching sound effect for keywords using Freesound API
async function findSoundEffect(keywords, accessToken) {
  if (!keywords || !Array.isArray(keywords)) return null;
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  // Try to find a matching query for any keyword
  for (const keyword of lowerKeywords) {
    if (KEYWORD_TO_QUERY[keyword]) {
      const query = KEYWORD_TO_QUERY[keyword];
      const sound = await searchFreesoundSound(query, accessToken);
      if (sound) {
        // Determine volume based on sound type
        const volumeMap = {
          magic: 0.6, spell: 0.6, thunder: 0.6, sword: 0.6, fight: 0.6, dragon: 0.6,
          door: 0.5, open: 0.5, close: 0.5, laugh: 0.5, cry: 0.5, fire: 0.5, bell: 0.5, chime: 0.5, scream: 0.5, cheer: 0.5, wolf: 0.5,
          footsteps: 0.4, walk: 0.4, run: 0.4, rain: 0.4, wind: 0.4, water: 0.4, clap: 0.4, bird: 0.4,
          whisper: 0.3, forest: 0.3, ocean: 0.3,
        };
        return {
          name: sound.name,
          url: sound.url,
          volume: volumeMap[keyword] || 0.5,
        };
      }
    }
  }
  
  return null;
}

module.exports = async (req, res) => {
  // Always set CORS headers first
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request received for MAP-SOUND-EFFECTS endpoint');
    return res.status(200).end();
  }

  const { method } = req;

  console.log('=== POST /api/stories/map-sound-effects Handler Called ===');
  console.log('Method:', method);
  console.log('Body:', req.body);

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract story ID and optional analysis from request body
  const { storyId, analysis } = req.body || {};

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

    let soundEffectsMappings = [];

    // Get Freesound access token
    let accessToken;
    try {
      accessToken = await getFreesoundToken();
    } catch (error) {
      console.error('Freesound authentication error:', error.message);
      // Continue without Freesound - return empty sound effects
      return res.status(200).json({
        id: story.id,
        title: story.title,
        content: story.content,
        language: story.language,
        source: story.source,
        tag: story.tag,
        imageUrl: story.image_url,
        musicUrl: story.music_url,
        musicPrompt: story.music_prompt,
        soundEffects: null,
        createdAt: story.created_at,
      });
    }

    // If analysis is provided, use it; otherwise analyze paragraphs
    if (analysis && analysis.soundEffects && Array.isArray(analysis.soundEffects)) {
      // Use provided analysis
      for (const effectMapping of analysis.soundEffects) {
        const soundEffect = await findSoundEffect(effectMapping.keywords, accessToken);
        if (soundEffect) {
          soundEffectsMappings.push({
            paragraph: effectMapping.paragraph || 0,
            effect: soundEffect.name,
            url: soundEffect.url,
            volume: soundEffect.volume,
            keywords: effectMapping.keywords
          });
        }
      }
    } else {
      // Analyze story paragraphs to find sound effects
      const paragraphs = story.content.split('\n').filter(p => p.trim().length > 0);
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].toLowerCase();
        
        // Check for keywords in paragraph
        for (const keyword of Object.keys(KEYWORD_TO_QUERY)) {
          if (paragraph.includes(keyword)) {
            // Avoid duplicates for same paragraph
            const existing = soundEffectsMappings.find(m => m.paragraph === i);
            if (!existing) {
              const soundEffect = await findSoundEffect([keyword], accessToken);
              if (soundEffect) {
                soundEffectsMappings.push({
                  paragraph: i,
                  effect: soundEffect.name,
                  url: soundEffect.url,
                  volume: soundEffect.volume,
                  keywords: [keyword]
                });
                break; // Only one effect per paragraph
              }
            }
          }
        }
      }
    }

    console.log('Mapped sound effects:', soundEffectsMappings.length, 'effects');

    // Update the story with sound effects mappings
    const updatedStory = await updateStory(storyId, { 
      soundEffects: soundEffectsMappings.length > 0 ? soundEffectsMappings : null
    });

    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found after mapping sound effects' });
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
      musicUrl: updatedStory.music_url,
      musicPrompt: updatedStory.music_prompt,
      soundEffects: updatedStory.sound_effects,
      createdAt: updatedStory.created_at,
    };

    return res.status(200).json(formattedStory);
  } catch (error) {
    console.error('Map sound effects endpoint error:', error);
    
    return res.status(500).json({
      error: 'Failed to map sound effects',
      details: error.message,
    });
  }
};

