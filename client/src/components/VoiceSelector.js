import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './VoiceSelector.css';

function VoiceSelector({ selectedVoice, onVoiceChange }) {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Get available voices when component mounts
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceOptions = availableVoices
        .filter(voice => voice.lang.startsWith('en')) // Filter for English voices
        .map(voice => ({
          value: voice.name,
          label: `${voice.name} (${voice.lang})`
        }));
      setVoices(voiceOptions);
    };

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Cleanup
    return () => {
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleVoiceChange = (selectedOption) => {
    onVoiceChange(selectedOption?.value || '');
  };

  return (
    <div className="voice-selector">
      <Select
        className="voice-select"
        classNamePrefix="select"
        value={voices.find(voice => voice.value === selectedVoice)}
        onChange={handleVoiceChange}
        options={voices}
        placeholder="Choose a fun voice... 🎭"
        isClearable
        isSearchable
        noOptionsMessage={() => "No voices available"}
      />
    </div>
  );
}

export default VoiceSelector; 