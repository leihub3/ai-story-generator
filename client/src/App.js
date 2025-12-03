import React from 'react';
import styled from '@emotion/styled';
import SinglePageApp from './components/SinglePageApp';

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

const App = () => {
  return (
    <AppContainer>
      <SinglePageApp />
    </AppContainer>
  );
};

export default App; 