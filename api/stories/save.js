// Vercel serverless function for /api/stories/save endpoint

require('dotenv').config();

const { saveStories } = require('../../server/src/db');

// Helper to get IP address in serverless environment
function getIpAddress(req) {
  return (
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.headers['x-real-ip'] ||
    (req.socket && req.socket.remoteAddress) ||
    'unknown'
  );
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Handle both single story object and array of stories
    const stories = Array.isArray(req.body) ? req.body : [req.body];

    if (stories.length === 0) {
      return res.status(400).json({ error: 'No stories provided' });
    }

    // Validate all stories have required fields
    const invalidStories = stories.filter((story) => {
      const hasTitle = story.title && typeof story.title === 'string' && story.title.length <= 200;
      const hasContent = story.content && typeof story.content === 'string';
      const hasLanguage = story.language && typeof story.language === 'string';
      return !(hasTitle && hasContent && hasLanguage);
    });

    if (invalidStories.length > 0) {
      console.error('Invalid stories found:', JSON.stringify(invalidStories, null, 2));
      return res.status(400).json({
        error: 'Missing required fields in one or more stories',
        details: invalidStories.map((story) => ({
          hasTitle: !!story.title,
          titleLength: story.title ? story.title.length : 0,
          hasContent: !!story.content,
          hasLanguage: !!story.language,
        })),
      });
    }

    const ipAddress = getIpAddress(req);

    // Save stories to database
    const savedStories = await saveStories(stories, ipAddress);

    // Convert database format to API format
    const formattedStories = savedStories.map((story) => ({
      id: story.id,
      title: story.title,
      content: story.content,
      language: story.language,
      source: story.source,
      tag: story.tag,
      imageUrl: story.image_url,
      musicUrl: story.music_url,
      musicPrompt: story.music_prompt,
      soundEffects: story.sound_effects,
      createdAt: story.created_at,
    }));

    // Return single story if only one was saved, otherwise return array
    if (formattedStories.length === 1) {
      return res.status(200).json(formattedStories[0]);
    } else {
      return res.status(200).json({
        message: 'Stories saved successfully',
        stories: formattedStories,
      });
    }
  } catch (error) {
    console.error('Save endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to save story',
      details: error.message,
    });
  }
};

