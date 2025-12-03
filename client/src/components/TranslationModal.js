import React, { useState } from 'react';
import Select from 'react-select';
import { SUPPORTED_LANGUAGES, translateText } from '../utils/translation';
import './TranslationModal.css';

function TranslationModal({ isOpen, onClose, text, onTranslate }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');

  const languageOptions = SUPPORTED_LANGUAGES.map(lang => ({
    value: lang.code,
    label: lang.name
  }));

  const handleTranslate = async () => {
    if (!selectedLanguage || !text.trim()) return;

    setIsTranslating(true);
    setError('');

    try {
      const translatedText = await translateText(text, selectedLanguage.value);
      onTranslate(translatedText);
      onClose();
    } catch (error) {
      setError('Failed to translate text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Translate Text 🌐</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="translation-controls">
            <Select
              className="language-select"
              classNamePrefix="select"
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              options={languageOptions}
              placeholder="Select target language..."
              isClearable
              isSearchable
            />
            <button
              className="primary-button"
              onClick={handleTranslate}
              disabled={!selectedLanguage || isTranslating}
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default TranslationModal; 