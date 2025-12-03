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
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
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
      // Show stories for current IP OR migrated stories (for local development)
      queryText = `SELECT * FROM stories 
                   WHERE ip_address = $1 OR ip_address = 'migrated' 
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
    const { title, content, language, imageUrl, source, tag } = story;
    
    const result = await query(
      `INSERT INTO stories (title, content, language, image_url, source, ip_address, tag)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, content, language, imageUrl || null, source || 'openai', ipAddress, tag || null]
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
    if (updates.tag !== undefined) {
      fields.push(`tag = $${paramIndex++}`);
      values.push(updates.tag);
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

module.exports = {
  query,
  getAllStories,
  getStoryById,
  saveStory,
  saveStories,
  deleteStory,
  updateStory,
  searchStories,
  getRateLimit,
  incrementRateLimit,
  checkRateLimit
};

