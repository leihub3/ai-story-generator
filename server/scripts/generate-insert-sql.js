/**
 * Script to generate SQL INSERT statements from saved_stories.json
 * This creates a SQL file that can be executed directly in PostgreSQL
 * 
 * Usage: node server/scripts/generate-insert-sql.js
 */

const path = require('path');
const fs = require('fs').promises;

const SAVED_STORIES_PATH = path.join(__dirname, '../data/saved_stories.json');
const OUTPUT_SQL_PATH = path.join(__dirname, '../migrations/002_insert_stories.sql');

// Helper function to escape single quotes in SQL strings
function escapeSqlString(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Helper function to format date for SQL
function formatDate(dateString) {
  if (!dateString) return 'NOW()';
  return `'${dateString}'::timestamp`;
}

async function generateInsertSQL() {
  try {
    console.log('Reading stories from JSON file...');
    
    // Read existing stories from JSON file
    let savedStories = [];
    try {
      const fileContent = await fs.readFile(SAVED_STORIES_PATH, 'utf8');
      savedStories = JSON.parse(fileContent);
      console.log(`Found ${savedStories.length} stories to convert`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No existing stories file found. Nothing to convert.');
        return;
      }
      throw error;
    }

    if (savedStories.length === 0) {
      console.log('No stories to convert.');
      return;
    }

    // Generate SQL INSERT statements
    let sqlStatements = [];
    sqlStatements.push('-- SQL script to insert stories from saved_stories.json');
    sqlStatements.push('-- Generated automatically - DO NOT EDIT MANUALLY');
    sqlStatements.push('');
    sqlStatements.push('-- Start transaction');
    sqlStatements.push('BEGIN;');
    sqlStatements.push('');

    let successCount = 0;
    let skipCount = 0;

    for (const story of savedStories) {
      try {
        // Extract fields with defaults
        const id = story.id || null;
        const title = story.title || 'Untitled Story';
        const content = story.content || '';
        const language = story.language || 'en';
        const source = story.source || 'openai';
        const imageUrl = story.imageUrl || story.image_url || null;
        const tag = story.tag || null;
        const createdAt = story.createdAt || story.created_at || new Date().toISOString();
        const ipAddress = 'migrated'; // Mark migrated stories

        // Generate UUID from the original ID if it's numeric, otherwise use it as-is
        // PostgreSQL will generate UUID if we use gen_random_uuid()
        let idValue;
        if (id && /^\d+$/.test(id)) {
          // If it's a numeric ID, we'll let PostgreSQL generate a new UUID
          idValue = 'gen_random_uuid()';
        } else if (id) {
          // If it's already a UUID-like string, use it
          idValue = escapeSqlString(id);
        } else {
          // Generate new UUID
          idValue = 'gen_random_uuid()';
        }

        // Build INSERT statement
        const insertSQL = `INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  ${idValue},
  ${escapeSqlString(title)},
  ${escapeSqlString(content)},
  ${escapeSqlString(language)},
  ${imageUrl ? escapeSqlString(imageUrl) : 'NULL'},
  ${escapeSqlString(source)},
  ${escapeSqlString(ipAddress)},
  ${tag ? escapeSqlString(tag) : 'NULL'},
  ${formatDate(createdAt)}
)
ON CONFLICT (id) DO NOTHING;`;

        sqlStatements.push(insertSQL);
        sqlStatements.push('');
        successCount++;
      } catch (error) {
        console.error(`Error processing story "${story.title}":`, error.message);
        skipCount++;
      }
    }

    sqlStatements.push('-- Commit transaction');
    sqlStatements.push('COMMIT;');
    sqlStatements.push('');
    sqlStatements.push(`-- Total stories inserted: ${successCount}`);
    if (skipCount > 0) {
      sqlStatements.push(`-- Stories skipped: ${skipCount}`);
    }

    // Write SQL file
    const sqlContent = sqlStatements.join('\n');
    await fs.writeFile(OUTPUT_SQL_PATH, sqlContent, 'utf8');

    console.log('\n=== SQL Generation Complete ===');
    console.log(`Successfully converted: ${successCount} stories`);
    if (skipCount > 0) {
      console.log(`Skipped: ${skipCount} stories`);
    }
    console.log(`\nSQL file created at: ${OUTPUT_SQL_PATH}`);
    console.log('\nTo execute this SQL file:');
    console.log('1. Connect to your PostgreSQL database');
    console.log('2. Run: \\i server/migrations/002_insert_stories.sql');
    console.log('   OR copy and paste the contents into your SQL client');
    
  } catch (error) {
    console.error('Error generating SQL:', error);
    process.exit(1);
  }
}

// Run script
generateInsertSQL()
  .then(() => {
    console.log('\nScript completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


