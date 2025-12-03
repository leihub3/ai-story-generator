import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import LanguageSelector from './LanguageSelector';
import './StoryBrowser.css';
import ConfirmModal from './ConfirmModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SectionContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f8f9fa;
  padding: 6rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  font-family: 'Poppins', 'Inter', sans-serif;
  color: #2c3e50;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
`;

const SearchControls = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled(motion.input)`
  flex: 1;
  min-width: 250px;
  height: 50px;
  padding: 0 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background: white;
  font-family: 'Inter', sans-serif;

  &:focus {
    border-color: #4ECDC4;
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
    outline: 2px solid #4ECDC4;
    outline-offset: 2px;
  }
`;


const StoryList = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
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
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const TitleInput = styled.input`
  color: #2c3e50;
  font-size: 1.2rem;
  margin: 0;
  font-family: 'Comic Sans MS', cursive;
  flex: 1;
  padding: 0.25rem;
  border: 2px solid #4ECDC4;
  border-radius: 4px;
  outline: none;
  background: white;
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

const IconButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.delete ? '#FF6B6B' : '#4ECDC4'};
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`;

const LibrarySection = ({ onSelectStory, refreshKey }) => {
  const [stories, setStories] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  const languageOptions = [
    { value: '', label: 'All Languages' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' }
  ];

  useEffect(() => {
    fetchSavedStories();
  }, []);

  // Refresh stories when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      fetchSavedStories();
    }
  }, [refreshKey]);

  useEffect(() => {
    if (!searchQuery.trim() && !selectedLanguage?.value) {
      setStories(allStories);
      return;
    }

    const filteredStories = allStories.filter(story => {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = story.title.toLowerCase().includes(searchLower);
      const contentMatch = story.content.toLowerCase().includes(searchLower);
      const tagMatch = story.tag && story.tag.toLowerCase().includes(searchLower);
      const languageMatch = !selectedLanguage?.value || story.language === selectedLanguage.value;
      
      return (titleMatch || contentMatch || tagMatch) && languageMatch;
    });

    setStories(filteredStories);
  }, [searchQuery, selectedLanguage, allStories]);

  const fetchSavedStories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/stories/saved`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setAllStories(data);
      setStories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (selected) => {
    setSelectedLanguage(selected);
  };

  const handleDeleteStory = (storyId) => {
    setStoryToDelete(storyId);
    setShowConfirmModal(true);
  };

  const confirmDeleteStory = async () => {
    if (!storyToDelete) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/stories/delete/${storyToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete story');
      setStories(prev => prev.filter(story => story.id !== storyToDelete));
      setShowConfirmModal(false);
      setStoryToDelete(null);
    } catch (err) {
      setError(err.message);
      setShowConfirmModal(false);
      setStoryToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteStory = () => {
    setShowConfirmModal(false);
    setStoryToDelete(null);
  };

  const getStoryIcon = (source) => {
    switch (source) {
      case 'pdf': return '📄';
      case 'openai': return '🤖';
      default: return '📚';
    }
  };

  const handleTitleClick = (storyId, currentTitle) => {
    setEditingTitle(storyId);
    setEditedTitle(currentTitle);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = async (storyId) => {
    if (editedTitle.trim() && editedTitle !== stories.find(s => s.id === storyId)?.title) {
      try {
        const response = await fetch(`${API_URL}/stories/update/${storyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editedTitle.trim() })
        });

        if (!response.ok) throw new Error('Failed to update title');
        
        setStories(prev => prev.map(story => 
          story.id === storyId ? { ...story, title: editedTitle.trim() } : story
        ));
      } catch (err) {
        setError(err.message);
      }
    }
    setEditingTitle(null);
  };

  const handleTitleKeyPress = (e, storyId) => {
    if (e.key === 'Enter') {
      handleTitleBlur(storyId);
    }
  };

  return (
    <SectionContainer>
      <SectionContent>
        <SectionTitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          📚 Story Library
        </SectionTitle>
        
        <SectionSubtitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Browse and manage your saved stories
        </SectionSubtitle>

        <SearchControls
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories... 🔍"
            aria-label="Search stories"
            whileFocus={{ scale: 1.02 }}
          />
          <LanguageSelector
            value={selectedLanguage}
            onChange={handleLanguageChange}
            options={languageOptions}
            placeholder="All Languages"
            variant="default"
            tall={false}
          />
        </SearchControls>

        {error && (
          <motion.div
            role="alert"
            aria-live="assertive"
            className="error-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '1rem' }}
          >
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <motion.div
            role="status"
            aria-live="polite"
            aria-label="Loading stories"
            className="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '4rem 2rem', textAlign: 'center' }}
          >
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            />
            <p>Loading stories...</p>
          </motion.div>
        ) : stories.length === 0 ? (
          <motion.div 
            className="no-stories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '20px',
              color: '#666',
              fontSize: '1.2rem',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
            <div>No saved stories yet. Generate a story to get started!</div>
          </motion.div>
        ) : (
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
                  <StoryIcon>
                    {getStoryIcon(story.source)}
                  </StoryIcon>
                  {editingTitle === story.id ? (
                    <TitleInput
                      value={editedTitle}
                      onChange={handleTitleChange}
                      onBlur={() => handleTitleBlur(story.id)}
                      onKeyPress={(e) => handleTitleKeyPress(e, story.id)}
                      autoFocus
                    />
                  ) : (
                    <StoryTitle onClick={() => handleTitleClick(story.id, story.title)}>
                      {story.title}
                    </StoryTitle>
                  )}
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
                    {languageOptions.find(opt => opt.value === story.language)?.label || story.language}
                  </motion.span>
                  {story.tag && (
                    <motion.span
                      style={{
                        background: '#e0f7fa',
                        color: '#007c91',
                        borderRadius: 12,
                        padding: '0.25rem 0.75rem',
                        marginLeft: 8,
                        fontSize: '0.9rem'
                      }}
                    >
                      #{story.tag}
                    </motion.span>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <IconButton
                      onClick={() => onSelectStory(story)}
                      aria-label="Read Story"
                      title="Read Story"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      📖
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteStory(story.id)}
                      aria-label="Delete Story"
                      title="Delete Story"
                      delete
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🗑️
                    </IconButton>
                  </div>
                </div>
              </StoryCard>
            ))}
          </StoryList>
        )}
      </SectionContent>
      
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmModal
            message="Are you sure you want to delete this story?"
            onCancel={cancelDeleteStory}
            onConfirm={confirmDeleteStory}
          />
        )}
      </AnimatePresence>
    </SectionContainer>
  );
};

export default LibrarySection;

