import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import LanguageSelector from './LanguageSelector';
import { LANGUAGE_OPTIONS_WITH_ALL, LANGUAGE_NAMES } from '../utils/languages';
import './StoryBrowser.css';
import ConfirmModal from './ConfirmModal';
import EditStoryModal from './EditStoryModal';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3000/api');

const SectionContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
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

const UnifiedSearchContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  max-width: 800px;
  width: 100%;
  margin: 0 auto 2rem;
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
    margin: 0 auto 1.5rem;
  }
`;

const SearchInput = styled(motion.input)`
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


const StoryList = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StoryCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
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
  
  @media (max-width: 768px) {
    padding: 1.25rem;
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

const MenuButton = styled(motion.button)`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #666;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const MenuDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const MenuItem = styled(motion.button)`
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #333;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  ${props => props.danger && `
    color: #e74c3c;
    &:hover {
      background: #fee;
    }
  `}
`;

const LibrarySection = ({ onSelectStory, refreshKey }) => {
  const [stories, setStories] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editingStory, setEditingStory] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const languageOptions = LANGUAGE_OPTIONS_WITH_ALL;

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
      setIsDeleting(true);
      setError(null);
      const response = await fetch(`${API_URL}/stories/delete?id=${storyToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete story');
      
      const deletedStory = stories.find(s => s.id === storyToDelete);
      setStories(prev => prev.filter(story => story.id !== storyToDelete));
      setShowConfirmModal(false);
      setStoryToDelete(null);
      
      // Show success message
      setSuccess(`Story "${deletedStory?.title || 'Untitled'}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setShowConfirmModal(false);
      setStoryToDelete(null);
    } finally {
      setIsDeleting(false);
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
        const response = await fetch(`${API_URL}/stories/${storyId}`, {
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

  const handleEditStory = (story) => {
    setEditingStory(story);
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
  };

  const handleSaveEdit = async (editedStory) => {
    try {
      setIsSavingEdit(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/stories/edit?id=${editedStory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedStory.title,
          content: editedStory.content,
          imageUrl: editedStory.imageUrl,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update story');
      }

      const updatedStory = await response.json();
      
      setStories(prev => prev.map(story => 
        story.id === editedStory.id ? updatedStory : story
      ));
      setAllStories(prev => prev.map(story => 
        story.id === editedStory.id ? updatedStory : story
      ));
      
      setEditingStory(null);
      setSuccess('Story updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleShare = async (storyId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/stories/share?id=${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle share status');
      }

      const updatedStory = await response.json();
      
      setStories(prev => prev.map(story => 
        story.id === storyId ? { ...story, isShared: updatedStory.isShared } : story
      ));
      setAllStories(prev => prev.map(story => 
        story.id === storyId ? { ...story, isShared: updatedStory.isShared } : story
      ));
      
      const shareStatus = updatedStory.isShared ? 'shared' : 'unshared';
      setSuccess(`Story ${shareStatus} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('[data-menu-container]')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

        <UnifiedSearchContainer
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileFocus={{ scale: 1.01 }}
        >
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories... 🔍"
            aria-label="Search stories"
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
        </UnifiedSearchContainer>

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

        {success && (
          <motion.div
            style={{
              background: '#d4edda',
              color: '#155724',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✅ {success}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
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
                  <div style={{ position: 'relative', marginLeft: 'auto' }} data-menu-container>
                    <MenuButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === story.id ? null : story.id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ⋮
                    </MenuButton>
                    <AnimatePresence>
                      {openMenuId === story.id && (
                        <MenuDropdown
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleShare(story.id);
                              setOpenMenuId(null);
                            }}
                            whileHover={{ x: 4 }}
                          >
                            <span>{story.isShared ? '🔗' : '📤'}</span>
                            <span>{story.isShared ? 'Unshare' : 'Share'}</span>
                          </MenuItem>
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStory(story);
                              setOpenMenuId(null);
                            }}
                            whileHover={{ x: 4 }}
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </MenuItem>
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStory(story.id);
                              setOpenMenuId(null);
                            }}
                            danger
                            whileHover={{ x: 4 }}
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </MenuItem>
                        </MenuDropdown>
                      )}
                    </AnimatePresence>
                  </div>
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
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    flex: '1',
                    minWidth: 0,
                  }}>
                    <motion.span
                      style={{
                        background: '#f8f9fa',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#666',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {LANGUAGE_NAMES[story.language] || story.language}
                    </motion.span>
                    {story.isShared && (
                      <motion.span
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          borderRadius: 12,
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                        }}
                        title="This story is publicly shared"
                      >
                        🔗 Shared
                      </motion.span>
                    )}
                    {story.tag && (
                      <motion.span
                        style={{
                          background: '#e0f7fa',
                          color: '#007c91',
                          borderRadius: 12,
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                        }}
                        title={`#${story.tag}`}
                      >
                        #{story.tag}
                      </motion.span>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    flexShrink: 0,
                  }}>
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
        )}
      </SectionContent>
      
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmModal
            message="Are you sure you want to delete this story?"
            onCancel={cancelDeleteStory}
            onConfirm={confirmDeleteStory}
            isDeleting={isDeleting}
          />
        )}
        {editingStory && (
          <EditStoryModal
            story={editingStory}
            onCancel={handleCancelEdit}
            onSave={handleSaveEdit}
            isSaving={isSavingEdit}
          />
        )}
      </AnimatePresence>
    </SectionContainer>
  );
};

export default LibrarySection;

