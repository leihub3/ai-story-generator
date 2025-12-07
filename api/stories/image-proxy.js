// Vercel serverless function for /api/stories/image-proxy endpoint

require('dotenv').config();

const axios = require('axios');

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
    const { imageUrl } = req.body || {};

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // If image is already Base64 (data URI), return it directly
    if (imageUrl.startsWith('data:image')) {
      console.log('Image is already Base64, returning directly');
      return res.status(200).json({ dataUrl: imageUrl });
    }

    console.log('Proxying image:', imageUrl);

    // Download the image using axios (server-side, no CORS restrictions)
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('Image downloaded successfully, size:', response.data.length);

    // Convert to base64
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log('Image converted to base64, dataUrl length:', dataUrl.length);

    return res.status(200).json({ dataUrl });
  } catch (error) {
    console.error('Error proxying image:', {
      message: error.message,
      response: error.response?.status,
      data: error.response?.data,
    });
    return res.status(500).json({
      error: 'Failed to load image',
      details: error.message,
      status: error.response?.status,
    });
  }
};

