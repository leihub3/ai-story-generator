-- Initial database schema for AI Story Creator
-- Run this migration to set up the database tables

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  image_url TEXT,
  source VARCHAR(50) DEFAULT 'openai',
  ip_address VARCHAR(45), -- IPv6 compatible
  tag VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address VARCHAR(45) NOT NULL,
  date DATE NOT NULL,
  story_count INT DEFAULT 0,
  PRIMARY KEY (ip_address, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_ip_address ON stories(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(ip_address, date);


