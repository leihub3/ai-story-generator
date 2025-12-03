import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const AnimatedBackground = styled.div`
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

const Content = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
  text-align: center;
  color: white;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.95;
  line-height: 1.6;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  width: 100%;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  border: none;
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  margin: 1rem;
  
  &:hover {
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
  }
`;

const SecondaryButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const Sparkle = styled(motion.span)`
  position: absolute;
  font-size: 1.5rem;
  pointer-events: none;
`;

const LandingPage = ({ onGetStarted, onExploreStories }) => {
  const [sparkles, setSparkles] = useState([]);

  const createSparkle = (e) => {
    const sparkle = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setSparkles((prev) => [...prev, sparkle]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
    }, 1000);
  };

  return (
    <LandingContainer onMouseMove={createSparkle}>
      <AnimatedBackground>
        {[...Array(6)].map((_, i) => {
          const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const height = typeof window !== 'undefined' ? window.innerHeight : 800;
          return (
            <FloatingShape
              key={i}
              initial={{
                x: Math.random() * width,
                y: Math.random() * height,
                width: Math.random() * 200 + 100,
                height: Math.random() * 200 + 100,
              }}
              animate={{
                x: [
                  Math.random() * width,
                  Math.random() * width,
                  Math.random() * width,
                ],
                y: [
                  Math.random() * height,
                  Math.random() * height,
                  Math.random() * height,
                ],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </AnimatedBackground>

      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          initial={{ x: sparkle.x, y: sparkle.y, opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 1.5, y: sparkle.y - 50 }}
          transition={{ duration: 1 }}
        >
          ✨
        </Sparkle>
      ))}

      <Content>
        <HeroTitle
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          AI Story Creator
        </HeroTitle>

        <Subtitle
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Create magical stories with AI. Generate, read, and share
          <br />
          personalized tales in any language, instantly.
        </Subtitle>

        <FeaturesGrid
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <FeatureCard
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <FeatureIcon>🤖✨</FeatureIcon>
            <FeatureTitle>AI Story Generation</FeatureTitle>
            <FeatureDescription>
              Simply describe your idea, and our AI creates engaging, 
              child-friendly stories tailored to your preferences. 
              Perfect for bedtime stories, educational content, or creative adventures.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <FeatureIcon>🌍📚</FeatureIcon>
            <FeatureTitle>Multi-Language Support</FeatureTitle>
            <FeatureDescription>
              Generate stories in multiple languages including English, 
              Spanish, French, German, and Italian. Perfect for language 
              learning and cultural exploration.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <FeatureIcon>📖🎙️</FeatureIcon>
            <FeatureTitle>Interactive Reading</FeatureTitle>
            <FeatureDescription>
              Read stories aloud with text-to-speech, upload PDFs, 
              save your favorites, and enjoy a beautiful reading 
              experience designed for all ages.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <ButtonGroup
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <CTAButton
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Generate Your Story
          </CTAButton>
          <SecondaryButton
            onClick={onExploreStories}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📚 Browse Stories
          </SecondaryButton>
        </ButtonGroup>
      </Content>
    </LandingContainer>
  );
};

export default LandingPage;

