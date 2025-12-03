import React from 'react';
import Select from 'react-select';
import styled from '@emotion/styled';

const LanguageSelectWrapper = styled.div`
  min-width: ${props => props.variant === 'unified' ? '120px' : '200px'};
  width: ${props => props.variant === 'unified' ? '100%' : 'auto'};
  z-index: 10;
  position: relative;
  ${props => props.tall ? `
    height: 100%;
    display: flex;
    align-items: center;
  ` : ''}
  
  .select__control {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    min-height: ${props => props.tall ? '58px' : '50px'} !important;
    height: ${props => props.tall ? '58px' : '50px'} !important;
    cursor: pointer;
    box-shadow: none !important;
    transition: all 0.3s ease !important;
    
    &:hover {
      border: none !important;
      box-shadow: none !important;
    }
  }
  
  .select__control--is-focused {
    border: none !important;
    box-shadow: none !important;
  }
  
  .select__value-container {
    padding: ${props => props.variant === 'unified' ? '0 1rem' : '0 1.5rem'} !important;
    height: ${props => props.tall ? '58px' : '50px'} !important;
    ${props => props.tall ? 'display: flex !important; align-items: center !important;' : ''}
  }
  
  .select__input-container {
    margin: 0 !important;
    padding: 0 !important;
    ${props => props.tall ? 'height: 100% !important;' : ''}
  }
  
  .select__single-value {
    color: #000000 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    font-weight: 600 !important;
    font-size: ${props => props.variant === 'unified' ? '1.1rem' : props.tall ? '1.1rem' : '1rem'} !important;
    margin: 0 !important;
    ${props => props.tall ? 'line-height: 1 !important;' : ''}
  }
  
  .select__placeholder {
    color: #666 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    font-weight: 500 !important;
    font-size: ${props => props.variant === 'unified' ? '1.1rem' : props.tall ? '1.1rem' : '1rem'} !important;
  }
  
  .select__indicator-separator {
    display: none !important;
  }
  
  .select__indicator {
    color: #444 !important;
    padding: ${props => props.variant === 'unified' ? '0 0.5rem' : '0 1rem'} !important;
    transition: color 0.2s ease !important;
    
    &:hover {
      color: #1a1a1a !important;
    }
  }
  
  .select__dropdown-indicator {
    padding: ${props => props.variant === 'unified' ? '0 0.5rem 0 0' : '0 1rem 0 0.5rem'} !important;
  }
  
  .select__menu {
    background: white !important;
    border-radius: 15px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
    margin-top: 8px !important;
    border: 1px solid #e8e8e8 !important;
    overflow: hidden !important;
    z-index: 1000 !important;
  }
  
  .select__menu-list {
    padding: 0.5rem !important;
  }
  
  .select__option {
    color: #000000 !important;
    font-weight: 500 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    padding: 0.75rem 1.25rem !important;
    border-radius: 10px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    margin: 0.25rem 0 !important;
    background: white !important;
    
    &:hover {
      background: #e8e8e8 !important;
      color: #000000 !important;
    }
    
    &--is-focused {
      background: ${props => props.variant === 'purple' ? '#e0e0e0' : props.variant === 'unified' ? '#f0f0f0' : '#4ECDC4'} !important;
      color: ${props => props.variant === 'purple' || props.variant === 'unified' ? '#000000' : 'white'} !important;
    }
    
    &--is-selected {
      background: #2c3e50 !important;
      color: white !important;
      font-weight: 600 !important;
      
      &:hover {
        background: #34495e !important;
        color: white !important;
      }
    }
  }
`;

const LanguageSelector = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Language...", 
  variant = 'default', // 'default' or 'purple'
  tall = false // for taller version to match input/button height
}) => {
  return (
    <LanguageSelectWrapper variant={variant} tall={tall}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        className="language-select"
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 1000 })
        }}
      />
    </LanguageSelectWrapper>
  );
};

export default LanguageSelector;

