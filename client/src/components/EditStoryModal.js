import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalBox = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  padding: 2rem 2.5rem;
  min-width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  
  &:focus {
    outline: none;
  }
`;

const Title = styled.h2`
  font-family: 'Comic Sans MS', cursive;
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-family: 'Comic Sans MS', cursive;
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ModalButton = styled(motion.button)`
  font-family: 'Comic Sans MS', cursive;
  font-size: 1rem;
  border: none;
  border-radius: 20px;
  padding: 0.7rem 2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  
  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(ModalButton)`
  background: #e9ecef;
  color: #2c3e50;
  &:hover:not(:disabled) {
    background: #d6dee2;
  }
`;

const SaveButton = styled(ModalButton)`
  background: #4ECDC4;
  color: white;
  &:hover:not(:disabled) {
    background: #3dbeb6;
  }
`;

const GenerateImageButton = styled(ModalButton)`
  background: #667eea;
  color: white;
  &:hover:not(:disabled) {
    background: #5568d3;
  }
`;

const StoryImage = styled(motion.img)`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  display: block;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Spinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3000/api');

const EditStoryModal = ({ story, onCancel, onSave, isSaving }) => {
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);
  const [editedTitle, setEditedTitle] = useState(story?.title || '');
  const [editedContent, setEditedContent] = useState(story?.content || '');
  const [currentImageUrl, setCurrentImageUrl] = useState(story?.imageUrl || null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  const handleSave = () => {
    if (editedTitle.trim() && editedContent.trim()) {
      onSave({
        ...story,
        title: editedTitle.trim(),
        content: editedContent.trim(),
        imageUrl: currentImageUrl,
      });
    }
  };

  const handleGenerateImage = async () => {
    if (!story?.id) return;
    
    try {
      setIsGeneratingImage(true);
      setImageError(null);
      
      const response = await fetch(`${API_URL}/stories/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id }),
      });

      // Always get text first to handle both JSON and HTML responses
      const responseText = await response.text();
      
      if (!response.ok) {
        // Try to parse JSON error; if it fails, fall back to plain text
        let errorMessage = 'Failed to generate image';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // Not JSON, might be HTML error page from Vercel
          // Extract meaningful text or use generic message
          if (responseText.includes('server error') || responseText.includes('500')) {
            errorMessage = 'Server error occurred. Please try again later.';
          } else if (responseText.trim().length > 0 && responseText.length < 200) {
            // Use text if it's short and meaningful
            errorMessage = responseText.trim();
          } else {
            errorMessage = `Server returned error ${response.status}. Please try again.`;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let updatedStory;
      try {
        updatedStory = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing generate-image success response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      setCurrentImageUrl(updatedStory.imageUrl);
    } catch (err) {
      console.error('Error generating image:', err);
      setImageError(err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <ModalBox
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Title id="edit-modal-title">Edit Story</Title>
        
        {/* Image Section */}
        {(currentImageUrl || story?.imageUrl) && (
          <FormGroup>
            <Label>Current Image</Label>
            <ImageContainer>
              <StoryImage
                src={currentImageUrl || story?.imageUrl}
                alt={editedTitle || story?.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onError={() => setImageError('Failed to load image')}
              />
              <GenerateImageButton
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || isSaving}
                whileHover={!isGeneratingImage && !isSaving ? { scale: 1.05 } : {}}
                whileTap={!isGeneratingImage && !isSaving ? { scale: 0.95 } : {}}
                aria-label="Generate new image"
              >
                {isGeneratingImage ? (
                  <>
                    <Spinner />
                    Generating...
                  </>
                ) : (
                  '🎨 Generate New Image'
                )}
              </GenerateImageButton>
              {imageError && (
                <div style={{ color: '#FF6B6B', fontSize: '0.9rem', textAlign: 'center' }}>
                  {imageError}
                </div>
              )}
            </ImageContainer>
          </FormGroup>
        )}
        
        {!currentImageUrl && !story?.imageUrl && (
          <FormGroup>
            <Label>Image</Label>
            <ImageContainer>
              <GenerateImageButton
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || isSaving}
                whileHover={!isGeneratingImage && !isSaving ? { scale: 1.05 } : {}}
                whileTap={!isGeneratingImage && !isSaving ? { scale: 0.95 } : {}}
                aria-label="Generate image"
              >
                {isGeneratingImage ? (
                  <>
                    <Spinner />
                    Generating...
                  </>
                ) : (
                  '🎨 Generate Image with AI'
                )}
              </GenerateImageButton>
              {imageError && (
                <div style={{ color: '#FF6B6B', fontSize: '0.9rem', textAlign: 'center' }}>
                  {imageError}
                </div>
              )}
            </ImageContainer>
          </FormGroup>
        )}
        
        <FormGroup>
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            ref={titleInputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Story title"
            disabled={isSaving}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="edit-content">Content</Label>
          <TextArea
            id="edit-content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Story content"
            disabled={isSaving}
          />
        </FormGroup>
        <ButtonRow>
          <CancelButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Cancel editing"
          >
            Cancel
          </CancelButton>
          <SaveButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving || !editedTitle.trim() || !editedContent.trim()}
            aria-label="Save changes"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </SaveButton>
        </ButtonRow>
      </ModalBox>
    </Overlay>
  );
};

export default EditStoryModal;

