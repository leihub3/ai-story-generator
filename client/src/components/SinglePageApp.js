import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  img {
    flex-shrink: 0;
    display: block;
  }
  
  span {
    background: ${props => props.scrolled 
      ? 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' 
      : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: ${props => props.scrolled ? 'none' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'};
  }
  
  &:focus {
    outline: 2px solid ${props => props.scrolled ? '#667eea' : 'white'};
    outline-offset: 4px;
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HamburgerButton = styled(motion.button)`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  color: ${props => props.scrolled ? '#1a1a1a' : 'white'};
  z-index: 1001;
  
  @media (max-width: 768px) {
    display: flex;
  }
  
  &:focus {
    outline: 2px solid ${props => props.scrolled ? '#667eea' : 'white'};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const HamburgerLine = styled(motion.span)`
  width: 24px;
  height: 3px;
  background: ${props => props.scrolled ? '#1a1a1a' : 'white'};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding-top: 80px;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled(motion.button)`
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  padding: 1rem 2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  width: 200px;
  text-align: center;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
  
  &.active {
    color: #667eea;
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: #667eea;
    border-radius: 2px;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
      setMobileMenuOpen(false); // Close mobile menu after navigation
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
            <img 
              src="/app_icon.png" 
              alt="AI Story Creator" 
              style={{ 
                width: '48px', 
                height: '48px', 
                objectFit: 'contain',
                display: 'block'
              }} 
            />
            <span>AI Story Creator</span>
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
          <HamburgerButton
            scrolled={scrolled}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            <HamburgerLine
              scrolled={scrolled}
              animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            />
            <HamburgerLine
              scrolled={scrolled}
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            />
            <HamburgerLine
              scrolled={scrolled}
              animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            />
          </HamburgerButton>
        </NavContent>
      </Navbar>

      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MobileNavLink
              className={activeSection === 'landing' ? 'active' : ''}
              onClick={() => scrollToSection('landing')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              className={activeSection === 'generate' ? 'active' : ''}
              onClick={() => scrollToSection('generate')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Generate
            </MobileNavLink>
            <MobileNavLink
              className={activeSection === 'library' ? 'active' : ''}
              onClick={() => scrollToSection('library')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Library
            </MobileNavLink>
          </MobileMenu>
        )}
      </AnimatePresence>

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

