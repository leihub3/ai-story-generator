import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalBox = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:focus {
    outline: none;
  }
`;

const Message = styled.div`
  font-family: 'Comic Sans MS', cursive;
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const ModalButton = styled(motion.button)`
  font-family: 'Comic Sans MS', cursive;
  font-size: 1rem;
  border: none;
  border-radius: 20px;
  padding: 0.7rem 2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  
  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`;

const CancelButton = styled(ModalButton)`
  background: #e9ecef;
  color: #2c3e50;
  &:hover {
    background: #d6dee2;
  }
`;

const DeleteButton = styled(ModalButton)`
  background: #4ECDC4;
  color: white;
  &:hover {
    background: #3dbeb6;
  }
`;

const ConfirmModal = ({ message, onCancel, onConfirm }) => {
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    // Focus the cancel button when modal opens
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    // Handle focus trap
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [onCancel]);

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <ModalBox
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-message"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Message id="confirm-modal-message">{message}</Message>
        <ButtonRow>
          <CancelButton
            ref={cancelButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            aria-label="Cancel deletion"
          >
            Cancel
          </CancelButton>
          <DeleteButton
            ref={deleteButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            aria-label="Confirm deletion"
          >
            Delete
          </DeleteButton>
        </ButtonRow>
      </ModalBox>
    </Overlay>
  );
};

export default ConfirmModal; 