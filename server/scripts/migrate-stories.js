/**
 * Migration script to move stories from JSON file to Postgres database
 * Run this script once to migrate existing stories
 * 
 * Usage: node server/scripts/migrate-stories.js
 */

const path = require('path');
const fs = require('fs').promises;
const { saveStory } = require('../src/db');
require('dotenv').config();

const SAVED_STORIES_PATH = path.join(__dirname, '../../data/saved_stories.json');

async function migrateStories() {
  try {
    console.log('Starting migration...');
    
    // Read existing stories from JSON file
    let savedStories = [];
    try {
      const fileContent = await fs.readFile(SAVED_STORIES_PATH, 'utf8');
      savedStories = JSON.parse(fileContent);
      console.log(`Found ${savedStories.length} stories to migrate`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No existing stories file found. Nothing to migrate.');
        return;
      }
      throw error;
    }

    if (savedStories.length === 0) {
      console.log('No stories to migrate.');
      return;
    }

    // Migrate each story to database
    let successCount = 0;
    let errorCount = 0;

    for (const story of savedStories) {
      try {
        // Convert story format to match database schema
        const storyToSave = {
          title: story.title,
          content: story.content,
          language: story.language || 'en',
          source: story.source || 'openai',
          imageUrl: story.imageUrl || story.image_url || null,
          tag: story.tag || null
        };

        // Use 'unknown' as IP address for migrated stories
        await saveStory(storyToSave, 'migrated');
        successCount++;
        console.log(`✓ Migrated: ${story.title.substring(0, 50)}...`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to migrate story "${story.title}":`, error.message);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully migrated: ${successCount} stories`);
    console.log(`Failed: ${errorCount} stories`);
    
    if (successCount > 0) {
      console.log('\nNote: Original JSON file has been preserved.');
      console.log('You can delete it after verifying the migration was successful.');
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateStories()
  .then(() => {
    console.log('\nMigration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


