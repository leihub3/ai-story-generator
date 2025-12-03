import React, { useState } from 'react';
import pdfjsLib from '../utils/pdfjs-config';
import './FileUploader.css';

function FileUploader({ onFileUpload }) {
  const [status, setStatus] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setStatus('Please upload a PDF file');
      return;
    }

    try {
      setStatus('Loading PDF...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      onFileUpload(fullText);
      setStatus('PDF loaded successfully!');
    } catch (error) {
      console.error('Error loading PDF:', error);
      setStatus('Error loading PDF. Please try again.');
    }
  };

  return (
    <div className="file-uploader">
      <label htmlFor="pdfInput" className="file-input-wrapper">
        <input
          type="file"
          id="pdfInput"
          accept=".pdf"
          onChange={handleFileUpload}
        />
        <span className="file-input-label">Upload PDF</span>
      </label>
      {status && <div className="pdf-status">{status}</div>}
    </div>
  );
}

export default FileUploader; 