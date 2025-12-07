const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database utility functions for PostgreSQL
 * Works with both standard PostgreSQL and Vercel Postgres
 */

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // Vercel Postgres always requires SSL
  ssl: process.env.VERCEL || process.env.POSTGRES_URL?.includes('vercel') || process.env.POSTGRES_URL?.includes('neon') ? {
    rejectUnauthorized: false
  } : false
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in serverless environment - just log the error
  if (process.env.VERCEL) {
    console.error('Database pool error in serverless function:', err);
  } else {
    // Only exit in non-serverless environments
  process.exit(-1);
  }
});

/**
 * Execute a SQL query
 * @param {string} queryText - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(queryText, params = []) {
  try {
    // Check if connection string is available
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    
    console.log('🔌 [DB] Attempting to connect to database pool...');
    const connectStart = Date.now();
    const client = await pool.connect();
    console.log(`🔌 [DB] Database client connected successfully (${Date.now() - connectStart}ms)`);
    
    try {
      console.log('🔌 [DB] Executing query:', queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''));
      console.log('🔌 [DB] Query params:', params);
      const queryStart = Date.now();
      const result = await client.query(queryText, params);
      console.log(`🔌 [DB] Query executed successfully (${Date.now() - queryStart}ms), rows returned:`, result.rows.length);
      return result;
    } finally {
      console.log('🔌 [DB] Releasing database client...');
      client.release();
      console.log('🔌 [DB] Database client released');
    }
  } catch (error) {
    console.error('❌ [DB] Database query error:', error);
    console.error('❌ [DB] Error details:', {
      message: error.message,
      code: error.code,
      connectionString: process.env.POSTGRES_URL ? 'Set' : 'Not set',
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get all stories
 * @param {string} ipAddress - Optional IP address to filter by
 * @returns {Promise<Array>} Array of stories
 */
async function getAllStories(ipAddress = null) {
  try {
    let queryText = 'SELECT * FROM stories ORDER BY created_at DESC';
    let params = [];
    
    if (ipAddress) {
      // Show stories for current IP OR migrated stories OR shared stories from all users
      queryText = `SELECT * FROM stories 
                   WHERE ip_address = $1 OR ip_address = 'migrated' OR is_shared = true
                   ORDER BY created_at DESC`;
      params = [ipAddress];
    }
    
    const result = await query(queryText, params);
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
}

/**
 * Get a story by ID
 * @param {string} storyId - Story UUID
 * @returns {Promise<Object|null>} Story object or null
 */
async function getStoryById(storyId) {
  try {
    const result = await query('SELECT * FROM stories WHERE id = $1', [storyId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching story by ID:', error);
    throw error;
  }
}

/**
 * Save a story
 * @param {Object} story - Story object
 * @param {string} ipAddress - IP address of the user
 * @returns {Promise<Object>} Saved story with ID
 */
async function saveStory(story, ipAddress = null) {
  try {
    const { title, content, language, imageUrl, source, tag, musicUrl, musicPrompt, soundEffects } = story;
    
    const result = await query(
      `INSERT INTO stories (title, content, language, image_url, source, ip_address, tag, music_url, music_prompt, sound_effects)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title, 
        content, 
        language, 
        imageUrl || null, 
        source || 'openai', 
        ipAddress, 
        tag || null,
        musicUrl || null,
        musicPrompt || null,
        soundEffects ? JSON.stringify(soundEffects) : null
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
}

/**
 * Save multiple stories
 * @param {Array} stories - Array of story objects
 * @param {string} ipAddress - IP address of the user
 * @returns {Promise<Array>} Array of saved stories
 */
async function saveStories(stories, ipAddress = null) {
  try {
    const savedStories = [];
    
    for (const story of stories) {
      const saved = await saveStory(story, ipAddress);
      savedStories.push(saved);
    }
    
    return savedStories;
  } catch (error) {
    console.error('Error saving stories:', error);
    throw error;
  }
}

/**
 * Delete a story by ID
 * @param {string} storyId - Story UUID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
async function deleteStory(storyId) {
  try {
    const result = await query('DELETE FROM stories WHERE id = $1 RETURNING id', [storyId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
}

/**
 * Update a story
 * @param {string} storyId - Story UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated story or null
 */
async function updateStory(storyId, updates) {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }
    if (updates.language !== undefined) {
      fields.push(`language = $${paramIndex++}`);
      values.push(updates.language);
    }
    if (updates.imageUrl !== undefined) {
      fields.push(`image_url = $${paramIndex++}`);
      values.push(updates.imageUrl);
    }
    if (updates.musicUrl !== undefined) {
      fields.push(`music_url = $${paramIndex++}`);
      values.push(updates.musicUrl);
    }
    if (updates.musicPrompt !== undefined) {
      fields.push(`music_prompt = $${paramIndex++}`);
      values.push(updates.musicPrompt);
    }
    if (updates.sunoTaskId !== undefined) {
      // Check if column exists before trying to update it
      // If it doesn't exist, we'll skip this update (migration needs to be run)
      try {
        const columnCheck = await query(
          `SELECT column_name 
           FROM information_schema.columns 
           WHERE table_name='stories' AND column_name='suno_task_id'`
        );
        if (columnCheck.rows.length > 0) {
          fields.push(`suno_task_id = $${paramIndex++}`);
          values.push(updates.sunoTaskId);
        } else {
          console.warn('Column suno_task_id does not exist. Please run migration 003_add_audio_fields.sql');
        }
      } catch (err) {
        console.warn('Could not check for suno_task_id column:', err.message);
        // Try to add it anyway - might work if migration was partially run
        fields.push(`suno_task_id = $${paramIndex++}`);
        values.push(updates.sunoTaskId);
      }
    }
    if (updates.soundEffects !== undefined) {
      fields.push(`sound_effects = $${paramIndex++}`);
      values.push(updates.soundEffects ? JSON.stringify(updates.soundEffects) : null);
    }
    if (updates.tag !== undefined) {
      fields.push(`tag = $${paramIndex++}`);
      values.push(updates.tag);
    }
    if (updates.is_shared !== undefined) {
      fields.push(`is_shared = $${paramIndex++}`);
      values.push(updates.is_shared);
    }
    
    if (fields.length === 0) {
      return await getStoryById(storyId);
    }
    
    values.push(storyId);
    const queryText = `UPDATE stories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await query(queryText, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
}

/**
 * Toggle share status of a story
 * @param {string} storyId - Story UUID
 * @returns {Promise<Object|null>} Updated story or null
 */
async function toggleShareStory(storyId) {
  try {
    // First get the current story to check its share status
    const story = await getStoryById(storyId);
    if (!story) {
      return null;
    }
    
    // Toggle the is_shared field
    const newShareStatus = !story.is_shared;
    const result = await query(
      'UPDATE stories SET is_shared = $1 WHERE id = $2 RETURNING *',
      [newShareStatus, storyId]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error toggling share status:', error);
    throw error;
  }
}

/**
 * Search stories by query and language
 * @param {string} searchQuery - Search query
 * @param {string} language - Language filter
 * @param {string} ipAddress - Optional IP address to filter by
 * @returns {Promise<Array>} Array of matching stories
 */
async function searchStories(searchQuery, language = null, ipAddress = null) {
  try {
    let queryText = 'SELECT * FROM stories WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (searchQuery) {
      queryText += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }
    
    if (language) {
      queryText += ` AND language = $${paramIndex}`;
      params.push(language);
      paramIndex++;
    }
    
    if (ipAddress) {
      // Show stories for current IP OR migrated stories (for local development)
      queryText += ` AND (ip_address = $${paramIndex} OR ip_address = 'migrated')`;
      params.push(ipAddress);
      paramIndex++;
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return result.rows || [];
  } catch (error) {
    console.error('Error searching stories:', error);
    throw error;
  }
}

/**
 * Get rate limit for an IP address on a specific date
 * @param {string} ipAddress - IP address
 * @param {Date} date - Date to check
 * @returns {Promise<Object|null>} Rate limit record or null
 */
async function getRateLimit(ipAddress, date) {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const result = await query(
      'SELECT * FROM rate_limits WHERE ip_address = $1 AND date = $2',
      [ipAddress, dateStr]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting rate limit:', error);
    throw error;
  }
}

/**
 * Increment rate limit count for an IP address
 * @param {string} ipAddress - IP address
 * @param {Date} date - Date
 * @returns {Promise<Object>} Updated rate limit record
 */
async function incrementRateLimit(ipAddress, date) {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Try to update existing record
    const updateResult = await query(
      `UPDATE rate_limits 
       SET story_count = story_count + 1 
       WHERE ip_address = $1 AND date = $2 
       RETURNING *`,
      [ipAddress, dateStr]
    );
    
    if (updateResult.rows.length > 0) {
      return updateResult.rows[0];
    }
    
    // If no record exists, create a new one
    const insertResult = await query(
      `INSERT INTO rate_limits (ip_address, date, story_count)
       VALUES ($1, $2, 1)
       RETURNING *`,
      [ipAddress, dateStr]
    );
    
    return insertResult.rows[0];
  } catch (error) {
    console.error('Error incrementing rate limit:', error);
    throw error;
  }
}

/**
 * Check if IP address has exceeded rate limit
 * @param {string} ipAddress - IP address
 * @param {number} maxStories - Maximum stories allowed per day
 * @returns {Promise<{allowed: boolean, remaining: number, resetDate: Date}>}
 */
async function checkRateLimit(ipAddress, maxStories = 3) {
  try {
    const today = new Date();
    const rateLimit = await getRateLimit(ipAddress, today);
    
    const currentCount = rateLimit ? rateLimit.story_count : 0;
    const allowed = currentCount < maxStories;
    const remaining = Math.max(0, maxStories - currentCount);
    
    // Reset date is tomorrow at midnight UTC
    const resetDate = new Date(today);
    resetDate.setUTCDate(resetDate.getUTCDate() + 1);
    resetDate.setUTCHours(0, 0, 0, 0);
    
    return {
      allowed,
      remaining,
      currentCount,
      resetDate
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: maxStories,
      currentCount: 0,
      resetDate: new Date()
    };
  }
}

/**
 * Update story audio fields
 * @param {string} storyId - Story UUID
 * @param {Object} audioData - Audio data object
 * @returns {Promise<Object|null>} Updated story or null
 */
async function updateStoryAudio(storyId, audioData) {
  try {
    const updates = {};
    if (audioData.musicUrl !== undefined) updates.musicUrl = audioData.musicUrl;
    if (audioData.musicPrompt !== undefined) updates.musicPrompt = audioData.musicPrompt;
    if (audioData.soundEffects !== undefined) updates.soundEffects = audioData.soundEffects;
    
    return await updateStory(storyId, updates);
  } catch (error) {
    console.error('Error updating story audio:', error);
    throw error;
  }
}

module.exports = {
  query,
  getAllStories,
  getStoryById,
  saveStory,
  saveStories,
  deleteStory,
  updateStory,
  updateStoryAudio,
  toggleShareStory,
  searchStories,
  getRateLimit,
  incrementRateLimit,
  checkRateLimit
};

