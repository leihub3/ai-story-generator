import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import LanguageSelector from './LanguageSelector';
import { LANGUAGE_OPTIONS, LANGUAGE_NAMES } from '../utils/languages';
import './StoryBrowser.css';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3000/api');

// Styled components (copied from StoryBrowser)
const GenerationSection = styled(motion.div)`
  min-height: ${props => props.hasStories ? 'auto' : '60vh'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${props => props.hasStories ? 'flex-start' : 'center'};
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: visible;
  width: 100%;
`;

const GenerationBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
`;

const FloatingShape = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const GenerationContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  text-align: center;
  color: white;
`;

const GenerationTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const GenerationSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.6;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const GenerationForm = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;
`;

const UnifiedSearchContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  transition: all 0.3s ease;
  overflow: visible;
  
  &:focus-within {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 25px;
    padding: 0.75rem;
  }
`;

const StoryInput = styled(motion.input)`
  flex: 1;
  min-width: 200px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0;
  font-size: 1.1rem;
  outline: none;
  background: transparent;
  color: #1a1a1a;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    background: transparent;
    outline: 2px solid #667eea;
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 0.5rem;
    padding-bottom: 0.75rem;
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 40px;
  background: #e0e0e0;
  margin: 0 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MultipleToggle = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #667eea;
  }
  
  label {
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
  }
`;


const GenerateButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
  min-width: 140px;
  margin-left: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
  
  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
  }
`;

const StoryList = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
  width: 100%;
`;

const StoryCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 320px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FF6B6B, #4ECDC4, #FFE66D);
  }
`;

const StoryIcon = styled(motion.span)`
  font-size: 1.5rem;
  display: inline-block;
  background: #f8f9fa;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const StoryImage = styled(motion.img)`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

const StoryTitle = styled(motion.h3)`
  color: #2c3e50;
  font-size: 1.2rem;
  margin: 0;
  font-family: 'Comic Sans MS', cursive;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StoryContent = styled.div`
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
  color: #666;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4ECDC4;
    border-radius: 3px;
  }
  
  p {
    margin: 0 0 1rem 0;
    color: #666;
  }
`;

const Spinner = styled.div`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const IconButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4ECDC4;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const GenerateSection = ({ onSelectStory, onStoriesSaved }) => {
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [savingStoryId, setSavingStoryId] = useState(null);
  const [success, setSuccess] = useState('');
  const [generateMultiple, setGenerateMultiple] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: 3, resetDate: null });

  const languageOptions = LANGUAGE_OPTIONS;

  useEffect(() => {
    if (!selectedLanguage) {
      setSelectedLanguage(languageOptions[0]);
    }
    
    // Fetch current rate limit status on mount
    const fetchRateLimit = async () => {
      try {
        const response = await fetch(`${API_URL}/stories/rate-limit`);
        if (response.ok) {
          const data = await response.json();
          setRateLimitInfo({
            remaining: data.remaining,
            resetDate: data.resetDate
          });
        }
      } catch (error) {
        console.error('Error fetching rate limit:', error);
        // Keep default value on error
      }
    };
    
    fetchRateLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a story idea');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const enhancedPrompt = generateMultiple 
        ? `Write 3 different mythological stories about ${searchQuery}. Each story should be historically accurate, child-friendly, and ready to be read aloud. Each story must be longer and more detailed than usual (about twice as long as a typical children's story). Include the cultural context and moral lesson naturally within each story. Separate each story with ---STORY_START--- and ---STORY_END---.`
        : `Write a mythological story about ${searchQuery}. The story should be historically accurate, child-friendly, and ready to be read aloud. Include the cultural context and moral lesson naturally within the story.`;

      const response = await fetch(`${API_URL}/stories/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enhancedPrompt,
          language: selectedLanguage?.value || 'en',
          userTitle: searchQuery
        })
      });

      // Extract rate limit info from headers (updated after generation)
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '3', 10);
      const resetDate = response.headers.get('X-RateLimit-Reset');
      setRateLimitInfo({ remaining, resetDate });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'You have reached the daily limit of 3 stories. Please try again tomorrow.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to generate story');
      }
      
      const data = await response.json();
      
      if (generateMultiple) {
        // Procesar múltiples historias
        const storiesText = data.results[0].content;
        const storyBlocks = storiesText.split('---STORY_START---').filter(block => block.trim());
        
        const processedStories = storyBlocks.map((block, index) => {
          const storyContent = block.split('---STORY_END---')[0].trim();
          // Extraer el título de la primera línea si existe
          const lines = storyContent.split('\n');
          let title = lines[0].trim();
          let content = lines.slice(1).join('\n').trim();
          
          // Si no hay título claro, usar el contenido completo
          if (!title || title.length > 100 || !content) {
            content = storyContent;
            title = `${searchQuery} - Story ${index + 1}`;
          }
          
          return {
            id: Date.now() + index,
            title: title || `${searchQuery} - Story ${index + 1}`,
            content: content || storyContent,
            language: selectedLanguage?.value || 'en',
            source: 'openai',
            tag: searchQuery,
            imageUrl: null, // Multiple stories don't get images to save costs
            createdAt: new Date().toISOString()
          };
        });
        
        setStories(processedStories);
      } else {
        // For a single story, use the backend's title and content directly
        const story = data.results[0];
        setStories([story]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (selected) => {
    setSelectedLanguage(selected);
  };

  const handleSaveStory = async (story) => {
    if (savingStoryId === story.id) return; // Prevent multiple clicks
    
    try {
      setSavingStoryId(story.id);
      setError(null);
      const response = await fetch(`${API_URL}/stories/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...story, tag: story.tag })
      });

      if (!response.ok) throw new Error('Failed to save story');
      
      setStories(prev => prev.filter(s => s.id !== story.id));
      setSuccess('Story saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Notify parent to refresh library section
      if (onStoriesSaved) {
        setTimeout(() => onStoriesSaved(), 500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingStoryId(null);
    }
  };

  const handleSaveAllStories = async () => {
    try {
      setIsSavingAll(true);
      const storiesToSave = stories.filter(story => story.source === 'openai');

      if (storiesToSave.length === 0) {
        setError('No stories to save');
        return;
      }

      const validStories = storiesToSave.map(story => {
        // Use the story's title if it exists and is valid, otherwise use first sentence
        let title = story.title;
        if (!title || title.length > 200) {
          const firstSentence = story.content.split('.')[0] + '.';
          title = firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
        }
        
        return {
          title: title,
          content: story.content,
          language: story.language,
          source: story.source || 'openai',
          tag: story.tag || null,
          imageUrl: story.imageUrl || null
        };
      });

      const response = await fetch(`${API_URL}/stories/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validStories)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save stories');
      }

      setStories([]);
      setSuccess(`All ${storiesToSave.length} stories saved successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Notify parent to refresh library section
      if (onStoriesSaved) {
        setTimeout(() => onStoriesSaved(), 500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingAll(false);
    }
  };

  const getStoryIcon = (source) => {
    switch (source) {
      case 'pdf': return '📄';
      case 'openai': return '🤖';
      default: return '📚';
    }
  };

  return (
    <GenerationSection
      hasStories={stories.length > 0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <GenerationBackground>
        {[...Array(4)].map((_, i) => {
          const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
          return (
            <FloatingShape
              key={i}
              initial={{
                x: Math.random() * width * 0.8,
                y: Math.random() * 400,
                width: Math.random() * 150 + 80,
                height: Math.random() * 150 + 80,
              }}
              animate={{
                x: [
                  Math.random() * width * 0.8,
                  Math.random() * width * 0.8,
                  Math.random() * width * 0.8,
                ],
                y: [
                  Math.random() * 400,
                  Math.random() * 400,
                  Math.random() * 400,
                ],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </GenerationBackground>
      
      <GenerationContent>
        <GenerationTitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🤖 Create Your Story with AI
        </GenerationTitle>
        
        <GenerationSubtitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Describe your story idea and let AI bring it to life with text and illustrations
        </GenerationSubtitle>

        {/* Rate Limit Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px',
            fontSize: '0.9rem',
            color: 'white',
            display: 'inline-block',
          }}
        >
          <span style={{ marginRight: '0.5rem' }}>📊</span>
          <span>
            {rateLimitInfo.remaining > 0 
              ? `${rateLimitInfo.remaining} ${rateLimitInfo.remaining === 1 ? 'story' : 'stories'} remaining today`
              : 'Daily limit reached. Try again tomorrow!'
            }
          </span>
        </motion.div>

        <GenerationForm
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <UnifiedSearchContainer
            whileFocus={{ scale: 1.01 }}
          >
            <StoryInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., A brave knight saving a magical kingdom..."
              aria-label="Story idea input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading && searchQuery.trim()) {
                  handleSearch();
                }
              }}
            />
            <Separator />
            <div style={{ minWidth: '120px', width: '120px', flexShrink: 0 }}>
              <LanguageSelector
                value={selectedLanguage}
                onChange={handleLanguageChange}
                options={languageOptions}
                placeholder="Lang..."
                variant="unified"
                tall={false}
              />
            </div>
            <Separator />
                <GenerateButton
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim() || rateLimitInfo.remaining === 0}
                  whileHover={{ scale: (isLoading || !searchQuery.trim() || rateLimitInfo.remaining === 0) ? 1 : 1.02 }}
                  whileTap={{ scale: (isLoading || !searchQuery.trim() || rateLimitInfo.remaining === 0) ? 1 : 0.98 }}
                >
                  {isLoading ? '✨ Generating...' : rateLimitInfo.remaining === 0 ? '⏸️ Limit Reached' : '✨ Generate'}
                </GenerateButton>
          </UnifiedSearchContainer>
          
          {/* Hidden for MVP - Generate 3 stories toggle */}
          {false && (
            <MultipleToggle
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setGenerateMultiple(!generateMultiple)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={generateMultiple}
                onChange={(e) => setGenerateMultiple(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <label onClick={(e) => e.stopPropagation()}>
                Generate 3 stories at once
              </label>
            </MultipleToggle>
          )}
        </GenerationForm>

        {error && (
          <motion.div
            role="alert"
            aria-live="assertive"
            style={{
              background: 'rgba(244, 67, 54, 0.2)',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              marginTop: '1rem',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            role="status"
            aria-live="polite"
            style={{
              background: 'rgba(76, 175, 80, 0.2)',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              marginTop: '1rem',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ {success}
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            role="status"
            aria-live="polite"
            aria-label="Generating story"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '3rem 2rem',
              marginTop: '2rem',
              textAlign: 'center',
            }}
          >
            <motion.div
              style={{
                width: '60px',
                height: '60px',
                border: '5px solid rgba(255, 255, 255, 0.3)',
                borderTop: '5px solid white',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            />
            <p style={{ fontSize: '1.2rem', color: 'white', margin: 0 }}>
              ✨ AI is crafting your story...
            </p>
          </motion.div>
        )}

        {!isLoading && stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '2rem',
              width: '100%',
            }}
          >
            <motion.div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <motion.h2
                style={{
                  fontSize: '1.8rem',
                  color: 'white',
                  fontFamily: 'Poppins, Inter, sans-serif',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                }}
              >
                ✨ Generated Stories
              </motion.h2>
              {/* Hidden for MVP - Save All button */}
              {false && stories.some(story => story.source === 'openai') && (
                <motion.button
                  onClick={handleSaveAllStories}
                  disabled={isSavingAll}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: isSavingAll ? 'not-allowed' : 'pointer',
                    minWidth: 160,
                    opacity: isSavingAll ? 0.6 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                  whileHover={{ scale: isSavingAll ? 1 : 1.05 }}
                  whileTap={{ scale: isSavingAll ? 1 : 0.95 }}
                >
                  💾 Save All ({stories.filter(s => s.source === 'openai').length})
                </motion.button>
              )}
            </motion.div>
            
            <StoryList
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {stories.map(story => (
                <StoryCard
                  key={story.id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 24
                      }
                    },
                    hover: {
                      scale: 1.02,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 10
                      }
                    }
                  }}
                  whileHover="hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {story.imageUrl ? (
                      <StoryImage
                        src={story.imageUrl}
                        alt={story.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <StoryIcon>
                        {getStoryIcon(story.source)}
                      </StoryIcon>
                    )}
                    <StoryTitle>
                      {story.title}
                    </StoryTitle>
                  </div>
                  <StoryContent>
                    {story.content.split('\n').map((line, index) => (
                      <p key={index}>{line.trim()}</p>
                    ))}
                  </StoryContent>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #eee',
                  }}>
                    <motion.span
                      style={{
                        background: '#f8f9fa',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#666',
                      }}
                    >
                      {LANGUAGE_NAMES[story.language] || story.language}
                    </motion.span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {story.source === 'openai' && (
                        <IconButton
                          onClick={() => handleSaveStory(story)}
                          aria-label={savingStoryId === story.id ? "Saving..." : "Save Story"}
                          title={savingStoryId === story.id ? "Saving..." : "Save Story"}
                          disabled={savingStoryId === story.id}
                          whileHover={savingStoryId !== story.id ? { scale: 1.1 } : {}}
                          whileTap={savingStoryId !== story.id ? { scale: 0.9 } : {}}
                        >
                          {savingStoryId === story.id ? <Spinner /> : '💾'}
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => onSelectStory(story)}
                        aria-label="Read Story"
                        title="Read Story"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        📖
                      </IconButton>
                    </div>
                  </div>
                </StoryCard>
              ))}
            </StoryList>
          </motion.div>
        )}

        {!isLoading && stories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              marginTop: '2rem',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
            <div>Your generated stories will appear here</div>
          </motion.div>
        )}
      </GenerationContent>
    </GenerationSection>
  );
};

export default GenerateSection;

