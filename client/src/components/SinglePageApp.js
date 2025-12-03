import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styled from '@emotion/styled';
import LandingSection from './LandingSection';
import GenerateSection from './GenerateSection';
import LibrarySection from './LibrarySection';
import StoryViewer from './StoryViewer';

const PageContainer = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

const Navbar = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent'};
  backdrop-filter: ${props => props.scrolled ? 'blur(10px)' : 'none'};
  box-shadow: ${props => props.scrolled ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: all 0.3s ease;
  padding: 1rem 2rem;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 800;
  font-family: 'Poppins', 'Inter', sans-serif;
  background: ${props => props.scrolled 
    ? 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' 
    : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  filter: ${props => props.scrolled ? 'none' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'};
  
  &:focus {
    outline: 2px solid ${props => props.scrolled ? '#667eea' : 'white'};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(motion.button)`
  background: none;
  border: none;
  color: ${props => props.scrolled ? '#1a1a1a' : 'white'};
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: ${props => props.scrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  &:focus {
    outline: 2px solid ${props => props.scrolled ? '#667eea' : 'white'};
    outline-offset: 2px;
  }
  
  &.active {
    color: ${props => props.scrolled ? '#667eea' : 'white'};
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: ${props => props.scrolled ? '#667eea' : 'white'};
    border-radius: 2px;
  }
`;

const Section = styled.section`
  min-height: 100vh;
  width: 100%;
  position: relative;
  scroll-margin-top: 80px;
  
  &:first-of-type {
    padding-top: 80px;
  }
`;

const SinglePageApp = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('landing');
  const [selectedStory, setSelectedStory] = useState(null);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  
  const landingRef = useRef(null);
  const generateRef = useRef(null);
  const libraryRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const scrollPosition = window.scrollY + 100;
      
      if (libraryRef.current && scrollPosition >= libraryRef.current.offsetTop) {
        setActiveSection('library');
      } else if (generateRef.current && scrollPosition >= generateRef.current.offsetTop) {
        setActiveSection('generate');
      } else {
        setActiveSection('landing');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionName) => {
    let targetRef;
    switch (sectionName) {
      case 'landing':
        targetRef = landingRef;
        break;
      case 'generate':
        targetRef = generateRef;
        break;
      case 'library':
        targetRef = libraryRef;
        break;
      default:
        return;
    }

    if (targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleLogoKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToSection('landing');
    }
  };

  const handleSelectStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
  };

  return (
    <PageContainer>
      <a
        href="#landing"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '0',
          background: '#667eea',
          color: 'white',
          padding: '8px 16px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 10000,
          fontSize: '14px',
          fontWeight: 600,
        }}
        onFocus={(e) => {
          e.target.style.top = '0';
        }}
        onBlur={(e) => {
          e.target.style.top = '-40px';
        }}
      >
        Skip to main content
      </a>
      <Navbar scrolled={scrolled} initial={{ y: -100 }} animate={{ y: 0 }}>
        <NavContent>
          <Logo 
            scrolled={scrolled}
            onClick={() => scrollToSection('landing')}
            onKeyDown={handleLogoKeyDown}
            role="button"
            aria-label="Go to home"
            tabIndex={0}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            🤖 AI Story Creator
          </Logo>
          <NavLinks>
            <NavLink 
              scrolled={scrolled}
              className={activeSection === 'landing' ? 'active' : ''}
              onClick={() => scrollToSection('landing')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </NavLink>
            <NavLink 
              scrolled={scrolled}
              className={activeSection === 'generate' ? 'active' : ''}
              onClick={() => scrollToSection('generate')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Generate
            </NavLink>
            <NavLink 
              scrolled={scrolled}
              className={activeSection === 'library' ? 'active' : ''}
              onClick={() => scrollToSection('library')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Library
            </NavLink>
          </NavLinks>
        </NavContent>
      </Navbar>

      <Section ref={landingRef} id="landing">
        <LandingSection onScrollToGenerate={() => scrollToSection('generate')} />
      </Section>

      <Section ref={generateRef} id="generate">
        <GenerateSection 
          onSelectStory={handleSelectStory}
          onStoriesSaved={() => setLibraryRefreshKey(prev => prev + 1)}
        />
      </Section>

      <Section ref={libraryRef} id="library">
        <LibrarySection 
          refreshKey={libraryRefreshKey}
          onSelectStory={handleSelectStory} 
        />
      </Section>

      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={handleCloseStory}
          isModal={true}
        />
      )}
    </PageContainer>
  );
};

export default SinglePageApp;

