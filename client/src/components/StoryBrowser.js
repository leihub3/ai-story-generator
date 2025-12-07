import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import { LANGUAGE_OPTIONS, LANGUAGE_OPTIONS_WITH_ALL, LANGUAGE_NAMES } from '../utils/languages';
import './StoryBrowser.css';
import ConfirmModal from './ConfirmModal';
import EditStoryModal from './EditStoryModal';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3000/api');

// Styled components
const Container = styled(motion.div)`
  ${props => props.isModal ? `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  ` : `
    min-height: 100vh;
    width: 100%;
    padding: 0;
  `}
`;

const Content = styled(motion.div)`
  background: #f8f9fa;
  ${props => props.isModal ? `
    border-radius: 20px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  ` : `
    width: 100%;
    min-height: 100vh;
    padding: 2rem;
  `}
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled(motion.div)`
  background: linear-gradient(135deg, #4ECDC4, #2C3E50);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #FFE66D;
  ${props => !props.isModal && `
    margin: -2rem -2rem 0 -2rem;
    border-radius: 0;
  `}
`;

const Title = styled(motion.h2)`
  margin: 0;
  font-size: 2rem;
  font-family: 'Comic Sans MS', cursive;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
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

  .story-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .story-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid #eee;

    .story-language {
      background: #f8f9fa;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      color: #666;
    }

    .story-actions {
      display: flex;
      gap: 0.5rem;
    }
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

const StoryPreview = styled(motion.p)`
  color: #666;
  margin: 1rem 0;
  line-height: 1.6;
  font-size: 1.1rem;
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
  background: ${props => props.delete ? '#FF6B6B' : '#4ECDC4'};
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
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

const SearchControls = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;

  .search-input {
    flex: 1;
    height: 40px;
    padding: 0 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 20px;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
    background: white;

    &:focus {
      border-color: #4ECDC4;
      box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
    }
  }

  .language-select {
    width: 200px;
    
    .select__control {
      height: 40px;
      min-height: 40px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      box-shadow: none;
      transition: all 0.3s ease;
      background: white;
      cursor: pointer;

      &:hover {
        border-color: #4ECDC4;
      }
    }

    .select__control--is-focused {
      border-color: #4ECDC4;
      box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
    }

    .select__value-container {
      padding: 0 1rem;
      height: 40px;
    }

    .select__placeholder {
      color: #666;
    }

    .select__single-value {
      color: #2c3e50;
    }

    .select__indicator {
      padding: 0 1rem;
    }

    .select__menu {
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-top: 4px;
      border: 2px solid #e0e0e0;
    }

    .select__option {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
      }

      &--is-focused {
        background: #4ECDC4;
        color: white;
      }
    }
  }

  .search-button {
    height: 40px;
    padding: 0 1.5rem;
    background: linear-gradient(90deg, #4ECDC4, #2C3E50);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
    }
  }
`;

const UploadSection = styled(motion.div)`
  padding: 1rem 0;

  .file-upload {
    display: flex;
    gap: 1rem;
    align-items: center;

    .file-input {
      flex: 1;
      height: 40px;
      padding: 0 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      font-size: 1rem;
      outline: none;
      transition: all 0.3s ease;

      &:focus {
        border-color: #4ECDC4;
        box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
      }
    }

    .upload-button {
      height: 40px;
      padding: 0 1.5rem;
      background: linear-gradient(90deg, #4ECDC4, #2C3E50);
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
      }
    }
  }
`;

const ViewModeToggle = styled(motion.div)`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  align-items: center;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 1rem;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #4ECDC4;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const StoryList = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
`;

const GenerationSection = styled(motion.div)`
  min-height: ${props => props.hasStories ? 'auto' : '60vh'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${props => props.hasStories ? 'flex-start' : 'center'};
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 20px;
  margin: 2rem 0;
  position: relative;
  overflow: visible;
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
  max-width: 800px;
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

const InputGroup = styled(motion.div)`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StoryInput = styled(motion.input)`
  flex: 1;
  min-width: 250px;
  padding: 1.25rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-size: 1.1rem;
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
  }
`;

const LanguageSelectWrapper = styled.div`
  min-width: 200px;
  
  .select__control {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.5) !important;
    border-radius: 50px !important;
    min-height: 50px;
    cursor: pointer;
    
    &:hover {
      border-color: rgba(255, 255, 255, 1) !important;
      background: white !important;
    }
  }
  
  .select__control--is-focused {
    border-color: white !important;
    background: white !important;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3) !important;
  }
  
  .select__value-container {
    padding: 0 1.5rem;
  }
  
  .select__single-value {
    color: #2c3e50 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 500;
  }
  
  .select__placeholder {
    color: #666 !important;
  }
  
  .select__indicator {
    color: #666 !important;
    
    &:hover {
      color: #2c3e50 !important;
    }
  }
  
  .select__menu {
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    margin-top: 8px;
    border: 1px solid #e0e0e0;
  }
  
  .select__option {
    color: #2c3e50 !important;
    font-weight: 500;
    
    &--is-focused {
      background: #f0f0f0 !important;
    }
    
    &--is-selected {
      background: #4ECDC4 !important;
      color: white !important;
    }
  }
`;

const GenerateButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
  min-width: 160px;
  
  &:hover:not(:disabled) {
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


const StoryBrowser = ({ onSelectStory, onClose, isModal = true, initialViewMode = 'saved', onBack }) => {
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [generateMultiple, setGenerateMultiple] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [success, setSuccess] = useState('');
  const [editingStory, setEditingStory] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingStoryId, setSavingStoryId] = useState(null);

  const languageOptions = viewMode === 'saved' ? LANGUAGE_OPTIONS_WITH_ALL : LANGUAGE_OPTIONS;

  useEffect(() => {
    if (initialViewMode === 'saved') {
      fetchSavedStories();
    } else {
      // Clear stories when in 'new' mode
      setStories([]);
      // Set default language to English for generation
      if (!selectedLanguage) {
        setSelectedLanguage(LANGUAGE_OPTIONS.find(opt => opt.value === 'en') || LANGUAGE_OPTIONS[0]);
      }
    }
  }, []);

  useEffect(() => {
    setViewMode(initialViewMode);
    if (initialViewMode === 'saved') {
      fetchSavedStories();
    } else {
      // Clear stories when switching to 'new' mode
      setStories([]);
      setSearchQuery('');
      setError(null);
      // Set default language to English for generation if not set
      if (!selectedLanguage) {
        setSelectedLanguage(LANGUAGE_OPTIONS.find(opt => opt.value === 'en') || LANGUAGE_OPTIONS[0]);
      }
    }
  }, [initialViewMode]);

  const fetchSavedStories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/stories/saved`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (viewMode === 'saved') {
      // Búsqueda en historias guardadas
      if (!searchQuery.trim()) {
        await fetchSavedStories();
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const filteredStories = stories.filter(story => {
          const searchLower = searchQuery.toLowerCase();
          const titleMatch = story.title.toLowerCase().includes(searchLower);
          const contentMatch = story.content.toLowerCase().includes(searchLower);
          const tagMatch = story.tag && story.tag.toLowerCase().includes(searchLower);
          const languageMatch = !selectedLanguage?.value || story.language === selectedLanguage.value;
          
          return (titleMatch || contentMatch || tagMatch) && languageMatch;
        });

        setStories(filteredStories);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!searchQuery.trim()) {
        setError('Please enter a story idea');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const enhancedPrompt = generateMultiple 
          ? `Write 5 different mythological stories about ${searchQuery}. Each story should be historically accurate, child-friendly, and ready to be read aloud. Each story must be longer and more detailed than usual (about twice as long as a typical children's story). Include the cultural context and moral lesson naturally within each story. Separate each story with ---STORY_START--- and ---STORY_END---.`
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate story');
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
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            return {
              id: Date.now() + index,
              title: title || `Myth ${index + 1}`,
              content: content,
              language: selectedLanguage?.value || 'en',
              source: 'openai',
              tag: searchQuery
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
    }
  };

  useEffect(() => {
    if (viewMode === 'saved') {
      handleSearch();
    }
  }, [searchQuery, selectedLanguage, viewMode]);

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

  const handleLanguageChange = (selected) => {
    setSelectedLanguage(selected);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a PDF file');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/stories/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      setStories(prev => [...prev, data]);
      setUploadStatus('File uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
      setUploadStatus('Upload failed');
    } finally {
      setIsLoading(false);
    }
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
      
      // In 'new' mode, remove the saved story from the list
      if (viewMode === 'new') {
        setStories(prev => prev.filter(s => s.id !== story.id));
        setSuccess('Story saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // In 'saved' mode, refresh the list
        await fetchSavedStories();
      }
    } catch (err) {
      setError(err.message);
    }
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
      // Use /api/stories/actions/delete endpoint
      const response = await fetch(`${API_URL}/stories/actions/delete?id=${storyToDelete}`, {
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
      setIsTogglingShare(true);
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
      
      const shareStatus = updatedStory.isShared ? 'shared' : 'unshared';
      setSuccess(`Story ${shareStatus} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTogglingShare(false);
    }
  };

  const handleSaveAllStories = async () => {
    try {
      setIsSavingAll(true);
      const storiesToSave = stories.filter(story => story.source === 'openai');
      console.log('Stories to save:', JSON.stringify(storiesToSave, null, 2));

      if (storiesToSave.length === 0) {
        setError('No stories to save');
        return;
      }

      // Process stories to have proper titles
      const validStories = storiesToSave.map(story => {
        // Extract a shorter title from the content
        const firstSentence = story.content.split('.')[0] + '.';
        return {
          title: firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence,
          content: story.content,
          language: story.language,
          source: story.source,
          tag: story.tag || null
        };
      });
      console.log('Validated stories:', JSON.stringify(validStories, null, 2));

      console.log('Sending request to save stories...');
      const response = await fetch(`${API_URL}/stories/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validStories)
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save stories');
      }

      const data = await response.json();
      console.log('Save response:', data);
      
      // In 'new' mode, clear the saved stories from the list
      if (viewMode === 'new') {
        setStories([]);
        setSuccess(`All ${storiesToSave.length} stories saved successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // In 'saved' mode, add them to the list
        setStories(prevStories => [...prevStories, ...data.stories]);
        setSuccess('All stories saved successfully!');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <Container isModal={isModal}>
      <Content isModal={isModal}>
        <Header isModal={isModal}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onBack && (
              <motion.button
                onClick={onBack}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.9 }}
                title="Back to Home"
              >
                ←
              </motion.button>
            )}
            <Title>Story Browser 🌍</Title>
          </div>
          {isModal && onClose && (
            <CloseButton
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              &times;
            </CloseButton>
          )}
        </Header>

        <ViewModeToggle
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className={`view-mode-button ${viewMode === 'saved' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('saved');
              fetchSavedStories();
              setStories([]);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Saved Stories 📚
          </motion.button>
          <motion.button
            className={`view-mode-button ${viewMode === 'new' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('new');
              setStories([]);
              setSearchQuery('');
              setError(null);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generate New Story ✨
          </motion.button>
        </ViewModeToggle>

        {viewMode === 'saved' && (
          <motion.div
            className="search-controls"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories... 🔍"
              className="search-input"
              whileFocus={{ scale: 1.02 }}
            />
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={languageOptions}
              className="language-select"
              placeholder="Select language..."
            />
          </motion.div>
        )}

        {viewMode === 'new' && (
          <GenerationSection
            hasStories={stories.length > 0}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GenerationBackground>
              {[...Array(4)].map((_, i) => {
                const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
                const height = typeof window !== 'undefined' ? window.innerHeight : 800;
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
                Describe your story idea and let AI bring it to life
              </GenerationSubtitle>

              <GenerationForm
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <InputGroup>
                  <StoryInput
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., A brave knight saving a magical kingdom..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLoading && searchQuery.trim()) {
                        handleSearch();
                      }
                    }}
                    whileFocus={{ scale: 1.02 }}
                  />
                  <LanguageSelectWrapper>
                    <Select
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      options={languageOptions.filter(opt => opt.value !== '')}
                      placeholder="Language..."
                      className="language-select"
                    />
                  </LanguageSelectWrapper>
                  <GenerateButton
                    onClick={handleSearch}
                    disabled={isLoading || !searchQuery.trim()}
                    whileHover={{ scale: isLoading || !searchQuery.trim() ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading || !searchQuery.trim() ? 1 : 0.95 }}
                  >
                    {isLoading ? '✨ Generating...' : '✨ Generate'}
                  </GenerateButton>
                </InputGroup>
              </GenerationForm>

              {viewMode === 'new' && isLoading && (
                <motion.div
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
                  />
                  <p style={{ fontSize: '1.2rem', color: 'white', margin: 0 }}>
                    ✨ AI is crafting your story...
                  </p>
                </motion.div>
              )}

              {viewMode === 'new' && !isLoading && stories.length > 0 && (
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
                    {stories.some(story => story.source === 'openai') && (
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
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1.5rem',
                    }}
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
                        layout
                      >
                        <div className="story-header">
                          {story.imageUrl ? (
                            <StoryImage
                              src={story.imageUrl}
                              alt={story.title}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          ) : (
                          <StoryIcon
                            variants={{
                              hover: {
                                rotate: [0, -10, 10, -10, 0],
                                transition: {
                                  duration: 0.5
                                }
                              }
                            }}
                            whileHover="hover"
                          >
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
                          {viewMode === 'saved' && (
                            <div style={{ position: 'relative' }} data-menu-container>
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
                          )}
                        </div>
                        <StoryContent>
                          {story.content.split('\n').map((line, index) => (
                            <p key={index}>{line.trim()}</p>
                          ))}
                        </StoryContent>
                        <div className="story-footer">
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            flex: '1',
                            minWidth: 0,
                          }}>
                          <motion.span 
                            className="story-language"
                            whileHover={{ scale: 1.1 }}
                              style={{ whiteSpace: 'nowrap' }}
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
                              className="story-tag"
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
                          <div className="story-actions" style={{ flexShrink: 0 }}>
                            {viewMode === 'new' && story.source === 'openai' && (
                              <IconButton
                                onClick={() => handleSaveStory(story)}
                                title="Save Story"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                💾
                              </IconButton>
                            )}
                            <IconButton
                              onClick={() => onSelectStory(story)}
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

              {viewMode === 'new' && !isLoading && stories.length === 0 && (
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
        )}

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              margin: viewMode === 'new' ? '2rem 0' : '1rem 0',
            }}
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
              margin: viewMode === 'new' ? '2rem 0' : '1rem 0',
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✅ {success}
          </motion.div>
        )}

        {viewMode === 'saved' && isLoading && (
          <motion.div
            className="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Loading stories...</p>
          </motion.div>
        )}

        {!isLoading && (
          <>
            {viewMode === 'saved' && stories.length === 0 && !isLoading && (
              <motion.div 
                className="no-stories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No saved stories yet. Generate or upload a story to get started!
              </motion.div>
            )}

            {viewMode === 'saved' && stories.length > 0 && (
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
                    layout
                  >
                    <div className="story-header">
                      {story.imageUrl ? (
                        <StoryImage
                          src={story.imageUrl}
                          alt={story.title}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                      <StoryIcon
                        variants={{
                          hover: {
                            rotate: [0, -10, 10, -10, 0],
                            transition: {
                              duration: 0.5
                            }
                          }
                        }}
                        whileHover="hover"
                      >
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
                    </div>
                    <StoryContent>
                      {story.content.split('\n').map((line, index) => (
                        <p key={index}>{line.trim()}</p>
                      ))}
                    </StoryContent>
                    <div className="story-footer">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        flex: '1',
                        minWidth: 0,
                      }}>
                      <motion.span 
                        className="story-language"
                        whileHover={{ scale: 1.1 }}
                          style={{ whiteSpace: 'nowrap' }}
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
                          className="story-tag"
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
                      <div className="story-actions" style={{ flexShrink: 0 }}>
                        {viewMode === 'new' && story.source === 'openai' && (
                          <IconButton
                            onClick={() => handleSaveStory(story)}
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
          </>
        )}
      </Content>
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmModal
            message="¿Estás seguro de que deseas eliminar esta historia?"
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
    </Container>
  );
};

export default StoryBrowser; 