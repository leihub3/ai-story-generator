const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      console.error('Missing parameters:', { text: !!text, targetLang: !!targetLang });
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'Both text and targetLang are required'
      });
    }

    if (!process.env.DEEPL_API_KEY) {
      console.error('DeepL API key is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'DeepL API key is not configured'
      });
    }

    console.log('Translating text:', { 
      textLength: text.length, 
      targetLang,
      hasApiKey: !!process.env.DEEPL_API_KEY 
    });

    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      {
        text: [text],
        target_lang: targetLang
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.translations && response.data.translations[0]) {
      console.log('Translation successful');
      res.json({ translatedText: response.data.translations[0].text });
    } else {
      console.error('Invalid response from DeepL API:', response.data);
      throw new Error('Invalid response from DeepL API');
    }
  } catch (error) {
    console.error('DeepL API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(error.response?.status || 500).json({ 
      error: 'Translation failed',
      details: error.response?.data?.message || error.message
    });
  }
});

module.exports = router; 