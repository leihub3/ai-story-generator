import React, { useState, useEffect, useRef } from 'react';
import VoiceSelector from './VoiceSelector';
import FileUploader from './FileUploader';
import StoryBrowser from './StoryBrowser';
import TranslationModal from './TranslationModal';
import './StoryReader.css';

function StoryReader() {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const speechRef = useRef(null);

  useEffect(() => {
    // Initialize speech synthesis
    speechRef.current = window.speechSynthesis;
    
    // Cleanup on component unmount
    return () => {
      if (speechRef.current) {
        speechRef.current.cancel();
      }
    };
  }, []);

  const handleRead = () => {
    if (!textContent.trim()) return;
    
    // Cancel any ongoing speech
    if (speechRef.current) {
      speechRef.current.cancel();
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(textContent);
    
    // Set voice if selected
    if (selectedVoice) {
      const voices = speechRef.current.getVoices();
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Set up event handlers
    utterance.onend = () => {
      setIsReading(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsReading(false);
    };

    // Start speaking
    speechRef.current.speak(utterance);
    setIsReading(true);
  };

  const handleStop = () => {
    if (speechRef.current) {
      speechRef.current.cancel();
      setIsReading(false);
    }
  };

  const handleClear = () => {
    handleStop();
    setTextContent('');
  };

  const handleTranslate = (translatedText) => {
    setTextContent(translatedText);
  };

  return (
    <div className="story-reader">
      <div className="controls-row">
        <VoiceSelector
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
        />
        <FileUploader onFileUpload={(text) => setTextContent(text)} />
      </div>

      <div className="input-section">
        <div className="text-container">
          <div
            className="text-content"
            contentEditable
            role="textbox"
            aria-multiline="true"
            placeholder="Type or paste your story here... ✍️"
            onInput={(e) => setTextContent(e.currentTarget.textContent)}
            dangerouslySetInnerHTML={{ __html: textContent }}
          />
        </div>

        <div className="button-controls">
          <button
            className="secondary-button"
            onClick={() => setShowBrowser(true)}
          >
            Browse Stories 🌍
          </button>
          <button
            className="primary-button"
            onClick={handleRead}
            disabled={!textContent.trim() || isReading}
          >
            Read Story Aloud 📢
          </button>
          <button
            className="secondary-button"
            onClick={() => setShowTranslation(true)}
            disabled={!textContent.trim()}
          >
            Translate 🌐
          </button>
          <button
            className="secondary-button"
            onClick={handleStop}
            disabled={!isReading}
          >
            Stop Reading ⏹️
          </button>
          <button
            className="secondary-button"
            onClick={handleClear}
            disabled={!textContent.trim()}
          >
            Clear Text 🧹
          </button>
        </div>
      </div>

      {showBrowser && (
        <StoryBrowser
          onClose={() => setShowBrowser(false)}
          onSelectStory={(story) => {
            setTextContent(story.content);
            setShowBrowser(false);
          }}
        />
      )}

      <TranslationModal
        isOpen={showTranslation}
        onClose={() => setShowTranslation(false)}
        text={textContent}
        onTranslate={handleTranslate}
      />
    </div>
  );
}

export default StoryReader; 