import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { Howl } from 'howler';

// Sound effects
const bookOpenSound = '/client/public/book.wav';

const Background = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  overflow: hidden;
  position: relative;
`;

const AnimatedLeaf = styled(motion.img)`
  position: absolute;
  width: 60px;
  opacity: 0.7;
`;

const CenterContent = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const Title = styled(motion.h1)`
  font-family: 'Comic Sans MS', cursive;
  color: #2c3e50;
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 8px #fff8;
`;

const ExploreButton = styled(motion.button)`
  font-family: 'Comic Sans MS', cursive;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #4ECDC4, #FFE66D);
  color: #2c3e50;
  border: none;
  border-radius: 30px;
  padding: 1rem 3rem;
  box-shadow: 0 4px 16px rgba(78, 205, 196, 0.2);
  cursor: pointer;
  margin-top: 2rem;
  outline: none;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 8px 32px rgba(78, 205, 196, 0.3);
  }
`;

const SvgRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
`;

const Home = ({ onExplore }) => {
  useEffect(() => {
    const sound = new Howl({ src: [bookOpenSound], volume: 0.5 });
    sound.play();
    return () => sound.unload();
  }, []);

  return (
    <Background>
      {/* Hojas animadas flotando */}
      <AnimatedLeaf
        src="https://www.svgrepo.com/show/309485/leaf.svg"
        alt="leaf"
        initial={{ y: -100, x: 100 }}
        animate={{ y: [0, 600, 0], x: [100, 300, 100] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ left: '10vw', top: '5vh' }}
      />
      <AnimatedLeaf
        src="https://www.svgrepo.com/show/309485/leaf.svg"
        alt="leaf"
        initial={{ y: -120, x: 400 }}
        animate={{ y: [0, 700, 0], x: [400, 600, 400] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 2 }}
        style={{ left: '60vw', top: '10vh', transform: 'rotate(30deg)' }}
      />
      <AnimatedLeaf
        src="https://www.svgrepo.com/show/309485/leaf.svg"
        alt="leaf"
        initial={{ y: -80, x: 700 }}
        animate={{ y: [0, 500, 0], x: [700, 900, 700] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 4 }}
        style={{ left: '80vw', top: '2vh', transform: 'rotate(-20deg)' }}
      />
      <CenterContent>
        <Title
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          ¡Bienvenido al Bosque de los Cuentos!
        </Title>
        <SvgRow>
          {/* Búho */}
          <motion.img
            src="https://www.svgrepo.com/show/52254/owl.svg"
            alt="owl"
            width={90}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            style={{ filter: 'drop-shadow(0 4px 8px #0002)' }}
          />
          {/* Libro sonriente */}
          <motion.img
            src="https://www.svgrepo.com/show/4910/book.svg"
            alt="book"
            width={90}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            style={{ filter: 'drop-shadow(0 4px 8px #0002)' }}
          />
          {/* Zorrito */}
          <motion.img
            src="https://www.svgrepo.com/show/303251/fox.svg"
            alt="fox"
            width={90}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            style={{ filter: 'drop-shadow(0 4px 8px #0002)' }}
          />
        </SvgRow>
        <ExploreButton
          whileHover={{ scale: 1.08, boxShadow: '0 8px 32px #4ECDC4aa' }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          onClick={onExplore}
        >
          Explorar cuentos
        </ExploreButton>
      </CenterContent>
    </Background>
  );
};

export default Home; 