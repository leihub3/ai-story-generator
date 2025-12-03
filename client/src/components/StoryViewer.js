import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import './StoryViewer.css';
import Select from 'react-select';
import jsPDF from 'jspdf';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const ViewerContainer = styled(motion.div)`
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
    padding: 2rem;
    background: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  `}
`;

const ViewerContent = styled(motion.div)`
  background: white;
  border-radius: ${props => props.isFullscreen ? '0' : '20px'};
  width: ${props => props.isFullscreen ? '100%' : '90%'};
  max-width: ${props => props.isFullscreen ? '100%' : '800px'};
  height: ${props => props.isFullscreen ? '100vh' : 'auto'};
  ${props => props.isModal && !props.isFullscreen ? 'max-height: 80vh;' : props.isFullscreen ? 'height: 100vh;' : 'min-height: 80vh;'}
  overflow: hidden;
  box-shadow: ${props => props.isFullscreen ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.2)'};
  display: flex;
  flex-direction: column;
`;

const ViewerHeader = styled(motion.div)`
  background: linear-gradient(135deg, #4ECDC4, #2C3E50);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #FFE66D;
`;

const StoryTitle = styled(motion.h2)`
  margin: 0;
  font-size: 1.8rem;
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
  
  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const HeaderButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  margin-left: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StoryImage = styled(motion.img)`
  width: 300px;
  max-width: 40%;
  height: auto;
  border-radius: 15px;
  float: right;
  margin: 0 0 1.5rem 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  object-fit: cover;
  shape-outside: margin-box;
  
  @media (max-width: 768px) {
    float: none;
    width: 100%;
    max-width: 100%;
    margin: 0 0 2rem 0;
    display: block;
  }
`;

const StoryContent = styled(motion.div)`
  padding: 2rem;
  overflow-y: auto;
  font-size: 1.2rem;
  line-height: 1.8;
  color: #2c3e50;
  font-family: 'Comic Sans MS', cursive;
  padding-bottom: 6rem;
  
  /* Clear float after image */
  &::after {
    content: "";
    display: table;
    clear: both;
  }
  
  p {
    margin-bottom: 1.5rem;
    color: #2c3e50;
    background: none;
    border-radius: 8px;
    padding: 0;
    transition: background 0.3s, box-shadow 0.3s;
    text-align: justify;
  }
  
  p:first-of-type {
    margin-top: 0;
  }
  
  p:first-of-type::first-letter {
    font-size: 5rem;
    font-weight: bold;
    float: left;
    line-height: 0.8;
    margin-right: 0.5rem;
    margin-top: 0.1rem;
    color: #667eea;
    font-family: 'Georgia', 'Times New Roman', serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p.active {
    background: #e0f7fa;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    box-shadow: 0 2px 8px rgba(78,205,196,0.08);
  }
`;

const StoryFooter = styled(motion.div)`
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-top: 2px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LanguageTag = styled(motion.span)`
  background: #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
`;

const ControlsContainer = styled(motion.div)`
  position: sticky;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  align-items: center;
  justify-content: center;
`;

const ControlButton = styled(motion.button)`
  background: #4ECDC4;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
  
  &:hover {
    background: #3dbeb6;
  }
  
  &:focus {
    outline: 2px solid #2c3e50;
    outline-offset: 2px;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SpeedControl = styled(motion.div)`
  background: white;
  padding: 0.5rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SpeedButton = styled(motion.button)`
  background: ${props => props.active ? '#4ECDC4' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 15px;
  padding: 0.5rem 1rem;
  
  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
  font-size: 0.9rem;
  cursor: pointer;
  font-family: 'Comic Sans MS', cursive;
  
  &:hover {
    background: ${props => props.active ? '#3dbeb6' : '#e0e0e0'};
  }
`;

const VoiceSelectWrapper = styled.div`
  width: 220px;
  margin-right: 1rem;
`;

const StoryViewer = ({ story, onClose, onBack, isModal = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const paragraphRefs = useRef([]);
  const storyContentRef = useRef(null);

  // Fullscreen API handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || 
           document.webkitFullscreenElement || 
           document.mozFullScreenElement || 
           document.msFullscreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Auto-scroll to paragraph
  const scrollToParagraph = useCallback((index) => {
    if (paragraphRefs.current[index] && isPlaying) {
      const paragraph = paragraphRefs.current[index];
      const rect = paragraph.getBoundingClientRect();
      const container = storyContentRef.current;
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const isVisible = (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom
        );
        
        if (!isVisible) {
          setTimeout(() => {
            paragraph.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }, 100);
        }
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && currentParagraph >= 0) {
      scrollToParagraph(currentParagraph);
    }
  }, [currentParagraph, isPlaying, scrollToParagraph]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const savedVoiceName = localStorage.getItem('selectedVoiceName');
      const populateVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        const langCode = (story.language || 'en').split('-')[0];
        const filtered = allVoices.filter(v => v.lang && v.lang.startsWith(langCode));
        setVoices(filtered.length > 0 ? filtered : allVoices);
        let defaultVoice = filtered.length > 0 ? filtered[0] : allVoices[0];
        if (savedVoiceName) {
          const found = allVoices.find(v => v.name === savedVoiceName);
          if (found) defaultVoice = found;
        }
        setSelectedVoice(defaultVoice);
      };
      populateVoices();
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, [story.language]);

  useEffect(() => {
    if (!isPlaying) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const paragraphs = story.content.split('\n');
    if (currentParagraph >= paragraphs.length) {
      setIsPlaying(false);
      setCurrentParagraph(0);
      return;
    }

    const newUtterance = new window.SpeechSynthesisUtterance(paragraphs[currentParagraph]);
    newUtterance.lang = story.language || 'en-US';
    newUtterance.rate = speechRate;
    if (selectedVoice) newUtterance.voice = selectedVoice;

    newUtterance.onend = () => {
      if (isPlaying && currentParagraph < paragraphs.length - 1) {
        setCurrentParagraph(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentParagraph(0);
      }
    };

    window.speechSynthesis.speak(newUtterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentParagraph, selectedVoice, speechRate, story.content, story.language]);

  const togglePlayPause = () => {
    if (window.speechSynthesis) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        setIsPlaying(true);
      }
    }
  };

  const handleSpeedChange = (rate) => {
    setSpeechRate(rate);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentParagraph(0);
    }
  };

  const handleVoiceChange = (eOrOption) => {
    const voice = voices.find(v => v.name === (eOrOption.value || eOrOption.target.value));
    setSelectedVoice(voice);
    if (voice) {
      localStorage.setItem('selectedVoiceName', voice.name);
    }
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    } else if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.cancel();
    }
  };

  // Export to PDF function
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(story.title, pageWidth - 2 * margin);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 11 + 18;

      // Load image if exists
      let imgData = null;
      let pdfImgWidth = 0;
      let pdfImgHeight = 0;
      const imageRightMargin = 8;
      const imageWidth = 70; // Width in mm for image on the right
      const imageX = pageWidth - margin - imageWidth;

      if (story.imageUrl) {
        try {
          const response = await fetch(`${API_URL}/stories/image-proxy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: story.imageUrl })
          });
          
          if (response.ok) {
            const data = await response.json();
            imgData = data.dataUrl;
            
            // Get image dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Image load timeout')), 10000);
              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              img.onerror = (err) => {
                clearTimeout(timeout);
                reject(err);
              };
              img.src = imgData;
            });
            
            pdfImgWidth = imageWidth;
            pdfImgHeight = (img.height * pdfImgWidth) / img.width;
            console.log('Image successfully loaded for PDF');
          }
        } catch (error) {
          console.error('Error loading image for PDF:', error);
        }
      }

      // Calculate text width based on whether we have an image
      const textWidth = imgData ? (pageWidth - 2 * margin - pdfImgWidth - imageRightMargin) : (pageWidth - 2 * margin);
      const lineHeight = 6;
      const paragraphSpacing = 7;

      // Place image first if it exists
      let imageYPosition = yPosition;
      if (imgData) {
        const imageFormat = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(imgData, imageFormat, imageX, imageYPosition, pdfImgWidth, pdfImgHeight);
      }

      // Add content with paragraph breaks
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const paragraphs = story.content.split('\n').filter(p => p.trim());
      
      paragraphs.forEach((paragraph, index) => {
        const paragraphText = paragraph.trim();
        
        if (!paragraphText) return;
        
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage();
          yPosition = margin;
          imagePlaced = false;
        }
        
        // All paragraphs are treated the same (no drop cap in PDF)
        // Check if we're still within the image area
        const isWithinImageArea = imgData && (yPosition < imageYPosition + pdfImgHeight);
        const currentTextWidth = isWithinImageArea ? textWidth : (pageWidth - 2 * margin);
        
        const lines = pdf.splitTextToSize(paragraphText, currentTextWidth);
        
        lines.forEach((line) => {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
            imagePlaced = false;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        // Add space between paragraphs (except after last one)
        if (index < paragraphs.length - 1) {
          yPosition += paragraphSpacing;
        }
      });

      // Save PDF
      const fileName = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsExporting(false);
      alert('Error al exportar el PDF. Por favor, intenta de nuevo.');
    }
  };

  return (
    <ViewerContainer
      isModal={isModal}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ViewerContent
        isModal={isModal}
        isFullscreen={isFullscreen}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ position: 'relative' }}
      >
        <ViewerHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            {onBack && (
              <motion.button
                onClick={onBack}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onBack();
                  }
                }}
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
                aria-label="Back to home"
                title="Back to Home"
              >
                ←
              </motion.button>
            )}
            <StoryTitle
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {story.title}
            </StoryTitle>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HeaderButton
              onClick={exportToPDF}
              disabled={isExporting}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isExporting ? "Exporting PDF" : "Export to PDF"}
              title="Export to PDF"
            >
              {isExporting ? '⏳' : '📄'}
            </HeaderButton>
            <HeaderButton
              onClick={toggleFullscreen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? '🗗' : '🗖'}
            </HeaderButton>
            <CloseButton
              onClick={onClose}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClose();
                }
              }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close story viewer"
              title="Close"
            >
              &times;
            </CloseButton>
          </div>
        </ViewerHeader>

        <StoryContent ref={storyContentRef}>
          {story.imageUrl && (
            <StoryImage
              src={story.imageUrl}
              alt={story.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          )}
          {story.content.split('\n').map((line, idx) => (
            line.trim() ? (
              <p
                key={idx}
                ref={(el) => (paragraphRefs.current[idx] = el)}
                className={isPlaying && idx === currentParagraph ? 'active' : ''}
                onClick={() => {
                  setCurrentParagraph(idx);
                  if (!isPlaying) {
                    setIsPlaying(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentParagraph(idx);
                    if (!isPlaying) {
                      setIsPlaying(true);
                    }
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Read paragraph ${idx + 1}`}
                style={{ cursor: 'pointer' }}
              >
                {line.trim()}
              </p>
            ) : null
          ))}
        </StoryContent>

        <StoryFooter
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LanguageTag
            whileHover={{ scale: 1.1 }}
          >
            {story.language}
          </LanguageTag>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Source: {story.source === 'openai' ? '🤖 AI Generated' : '📄 PDF Upload'}
          </motion.span>
        </StoryFooter>

        <ControlsContainer
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <VoiceSelectWrapper>
            <Select
              options={voices.map(v => ({ value: v.name, label: `${v.name} (${v.lang})` }))}
              value={selectedVoice ? { value: selectedVoice.name, label: `${selectedVoice.name} (${selectedVoice.lang})` } : null}
              onChange={handleVoiceChange}
              placeholder="Select voice..."
              isSearchable
              menuPlacement="top"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: 20,
                  background: '#f0f0f0',
                  fontFamily: 'Comic Sans MS, cursive',
                  color: '#2c3e50',
                  minHeight: '40px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: 'none',
                }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
                option: (base, state) => ({
                  ...base,
                  background: state.isSelected ? '#4ECDC4' : state.isFocused ? '#e0e0e0' : '#fff',
                  color: state.isSelected ? 'white' : '#2c3e50',
                  fontFamily: 'Comic Sans MS, cursive',
                }),
              }}
            />
          </VoiceSelectWrapper>

          <SpeedControl>
            <SpeedButton
              active={speechRate === 0.75}
              onClick={() => handleSpeedChange(0.75)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Set reading speed to 0.75x"
              aria-pressed={speechRate === 0.75}
            >
              0.75x
            </SpeedButton>
            <SpeedButton
              active={speechRate === 1}
              onClick={() => handleSpeedChange(1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Set reading speed to 1x"
              aria-pressed={speechRate === 1}
            >
              1x
            </SpeedButton>
            <SpeedButton
              active={speechRate === 1.25}
              onClick={() => handleSpeedChange(1.25)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Set reading speed to 1.25x"
              aria-pressed={speechRate === 1.25}
            >
              1.25x
            </SpeedButton>
          </SpeedControl>

          <ControlButton
            onClick={handleStop}
            disabled={!isPlaying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Stop reading"
            title="Stop reading"
          >
            ⏹️
          </ControlButton>

          <ControlButton
            onClick={togglePlayPause}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? "Pause reading" : "Start reading"}
            title={isPlaying ? "Pause reading" : "Start reading"}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </ControlButton>
        </ControlsContainer>
      </ViewerContent>
    </ViewerContainer>
  );
};

export default StoryViewer; 