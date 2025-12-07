/**
 * Script to run database migrations
 * Usage: node server/scripts/run-migration.js [migration-file]
 * 
 * Example: node server/scripts/run-migration.js 003_add_audio_fields.sql
 */

const path = require('path');
const fs = require('fs').promises;
const { query } = require('../src/db');
require('dotenv').config();

async function runMigration(migrationFile) {
  try {
    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    
    console.log(`Reading migration file: ${migrationPath}`);
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    console.log('Executing migration...');
    console.log('SQL:', sql);
    
    // Execute the migration SQL
    await query(sql);
    
    console.log('✅ Migration executed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node server/scripts/run-migration.js <migration-file>');
  console.error('Example: node server/scripts/run-migration.js 003_add_audio_fields.sql');
  process.exit(1);
}

// Run the migration
runMigration(migrationFile)
  .then(() => {
    console.log('\nMigration completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


