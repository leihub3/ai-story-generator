document.addEventListener('DOMContentLoaded', () => {
    const textContent = document.getElementById('textContent');
    const readButton = document.getElementById('readButton');
    const stopButton = document.getElementById('stopButton');
    const clearButton = document.getElementById('clearButton');
    const translateButton = document.getElementById('translateButton');
    const pdfInput = document.getElementById('pdfInput');
    const pdfStatus = document.getElementById('pdfStatus');
    const voiceSelect = document.getElementById('voiceSelect');

    let speechSynthesis = window.speechSynthesis;
    let speaking = false;
    let voices = [];
    let highlightTimeout = null;
    let originalText = ''; // Store original text for toggling
    let allVoices = []; // Store all voices for filtering

    // Story Browser Elements
    const browseButton = document.getElementById('browseButton');
    const storyModal = document.getElementById('storyModal');
    const closeButton = document.querySelector('.close-button');
    const storySearch = document.getElementById('storySearch');
    const storyLanguage = document.getElementById('storyLanguage');
    const storyList = document.getElementById('storyList');
    const storyLoading = document.getElementById('storyLoading');

    // Story Browser State
    let currentStories = [];
    let currentPage = 1;
    const storiesPerPage = 20;

    // Initialize Select2
    $(voiceSelect).select2({
        theme: 'bootstrap-5',
        width: '100%',
        placeholder: 'Choose a fun voice... 🎭',
        allowClear: true,
        search: true,
        matcher: function(params, data) {
            // If there are no search terms, return all of the data
            if ($.trim(params.term) === '') {
                return data;
            }

            // Do not display the item if there is no 'text' property
            if (typeof data.text === 'undefined') {
                return null;
            }

            // Get the language name from the optgroup label
            const optgroup = $(data.element).parent('optgroup');
            const languageName = optgroup.length ? optgroup.attr('label') : '';

            // Search in the text, language code, and language name
            const searchStr = (data.text + ' ' + languageName).toLowerCase();
            if (searchStr.indexOf(params.term.toLowerCase()) > -1) {
                return data;
            }

            // Return `null` if the term should not be displayed
            return null;
        }
    });

    // Function to add fun animation to an element
    function addFunAnimation(element, animation) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = animation;
    }

    // Function to show fun status message
    function showFunStatus(message, type) {
        const emojis = {
            loading: '⏳',
            success: '🎉',
            error: '😢'
        };
        pdfStatus.textContent = `${message} ${emojis[type]}`;
        pdfStatus.className = 'pdf-status ' + type;
        addFunAnimation(pdfStatus, 'slideIn 0.3s ease');
    }

    // Function to get supported language codes
    function getSupportedLanguages() {
        return {
            'en': 'English 🇬🇧',
            'es': 'Spanish 🇪🇸',
            'fr': 'French 🇫🇷',
            'de': 'German 🇩🇪',
            'it': 'Italian 🇮🇹',
            'pt': 'Portuguese 🇵🇹',
            'ru': 'Russian 🇷🇺',
            'zh': 'Chinese 🇨🇳',
            'ja': 'Japanese 🇯🇵',
            'ko': 'Korean 🇰🇷',
            'ar': 'Arabic 🇸🇦',
            'nl': 'Dutch 🇳🇱',
            'pl': 'Polish 🇵🇱',
            'tr': 'Turkish 🇹🇷'
        };
    }

    // Function to clean voice name
    function cleanVoiceName(name) {
        return name
            .replace(/Microsoft /g, '')
            .replace(/Online /g, '')
            .replace(/\(Natural\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Function to populate voice select dropdown
    function populateVoiceList() {
        voices = speechSynthesis.getVoices();
        const supportedLanguages = getSupportedLanguages();
        
        // Clear existing options except the first one
        $(voiceSelect).empty().append('<option value="">Choose a fun voice... 🎭</option>');

        // Filter and sort voices by supported languages
        const supportedVoices = voices.filter(voice => {
            const langCode = voice.lang.split('-')[0];
            return supportedLanguages[langCode];
        }).sort((a, b) => {
            if (a.lang === b.lang) {
                return a.name.localeCompare(b.name);
            }
            return a.lang.localeCompare(b.lang);
        });

        // Group voices by language
        const voicesByLang = {};
        supportedVoices.forEach(voice => {
            const langCode = voice.lang.split('-')[0];
            if (!voicesByLang[langCode]) {
                voicesByLang[langCode] = [];
            }
            voicesByLang[langCode].push(voice);
        });

        // Add voices to select with language headers
        Object.entries(voicesByLang).forEach(([langCode, langVoices]) => {
            const optgroup = $('<optgroup>').attr('label', supportedLanguages[langCode]);
            
            langVoices.forEach((voice, index) => {
                const option = $('<option>')
                    .val(voices.indexOf(voice))
                    .text(`${cleanVoiceName(voice.name)} (${voice.lang})`);
                optgroup.append(option);
            });

            $(voiceSelect).append(optgroup);
        });

        // If no voices found, show message
        if (supportedVoices.length === 0) {
            $(voiceSelect).append('<option disabled>No supported voices found 😢</option>');
        }

        // Trigger Select2 to update
        $(voiceSelect).trigger('change');
    }

    // Function to read text
    function readText(text, startPosition = 0) {
        if (speaking) {
            speechSynthesis.cancel();
        }

        // Get the text from the cursor position if no specific position is provided
        if (startPosition === 0 && textContent.selectionStart !== textContent.selectionEnd) {
            startPosition = textContent.selectionStart;
            text = textContent.value.substring(startPosition);
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure speech settings
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set selected voice
        const selectedVoice = voiceSelect.value;
        if (selectedVoice && voices[selectedVoice]) {
            utterance.voice = voices[selectedVoice];
        } else {
            // Default to first English voice if none selected
            const englishVoice = voices.find(voice => voice.lang.includes('en')) || voices[0];
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }

        // Event handlers
        utterance.onstart = () => {
            speaking = true;
            readButton.textContent = 'Reading Story... 📖';
            readButton.disabled = true;
            stopButton.disabled = false;
            addFunAnimation(textContent, 'pulse 1s infinite');
        };

        utterance.onend = () => {
            speaking = false;
            readButton.textContent = 'Read Story Aloud 📢';
            readButton.disabled = false;
            stopButton.disabled = true;
            textContent.style.animation = 'none';
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            speaking = false;
            readButton.textContent = 'Read Story Aloud 📢';
            readButton.disabled = false;
            stopButton.disabled = true;
            textContent.style.animation = 'none';
            showFunStatus('Oops! Something went wrong. Try again!', 'error');
        };

        speechSynthesis.speak(utterance);
    }

    // Function to read from cursor position
    function readFromCursor() {
        const text = textContent.textContent;
        if (!text || text.trim() === '') {
            showFunStatus('Please write or upload a story first!', 'error');
            return;
        }

        // Get the cursor position from the selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorPosition = range.startOffset;
        
        if (selection.toString().length > 0) {
            // If text is selected, read only the selected text
            readText(selection.toString(), cursorPosition);
        } else {
            // If no text is selected, read from cursor to end
            const textFromCursor = text.substring(cursorPosition);
            readText(textFromCursor, cursorPosition);
        }
    }

    // Function to stop reading
    function stopReading() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            speaking = false;
            readButton.textContent = 'Read Story Aloud 📢';
            readButton.disabled = false;
            stopButton.disabled = true;
            textContent.style.animation = 'none';
            
            // Remove all highlights
            const words = textContent.querySelectorAll('span');
            words.forEach(word => {
                word.classList.remove('highlight', 'highlight-current');
            });
            
            // Clear any pending highlight timeouts
            if (highlightTimeout) {
                clearTimeout(highlightTimeout);
                highlightTimeout = null;
            }
        }
    }

    // Function to split text into chunks
    function splitTextIntoChunks(text, maxLength = 500) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = sentence;
            }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }

    // Function to wait with exponential backoff
    async function wait(attempt) {
        const baseDelay = 2000; // 2 seconds
        const maxDelay = 10000; // 10 seconds
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Function to create and show progress bar
    function createProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">0%</div>
            <div class="progress-status">Preparing translation...</div>
        `;
        document.querySelector('.input-section').insertBefore(progressContainer, document.querySelector('.button-controls'));
        return progressContainer;
    }

    // Function to update progress bar
    function updateProgress(container, percent, status) {
        const fill = container.querySelector('.progress-fill');
        const text = container.querySelector('.progress-text');
        const statusText = container.querySelector('.progress-status');
        
        fill.style.width = `${percent}%`;
        text.textContent = `${Math.round(percent)}%`;
        statusText.textContent = status;
    }

    // Function to remove progress bar
    function removeProgressBar(container) {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }

    // Function to clean and format text
    function cleanAndFormatText(text) {
        return text
            // Replace multiple spaces with a single space
            .replace(/\s+/g, ' ')
            // Replace multiple line breaks with a single space
            .replace(/\n+/g, ' ')
            // Add line break after periods followed by space
            .replace(/\. /g, '.\n')
            // Add line break after question marks
            .replace(/\? /g, '?\n')
            // Add line break after exclamation marks
            .replace(/! /g, '!\n')
            // Remove any remaining multiple spaces
            .replace(/\s+/g, ' ')
            // Remove any remaining multiple line breaks
            .replace(/\n+/g, '\n')
            // Trim whitespace
            .trim();
    }

    // Function to translate text using DeepL API
    async function translateText(text, targetLang) {
        let progressContainer = null;
        let translatedChunks = [];
        let currentChunkIndex = 0;
        const INITIAL_BUFFER_PERCENTAGE = 5;
        
        // DeepL language code mapping
        const languageMap = {
            'en': 'EN',
            'es': 'ES',
            'fr': 'FR',
            'de': 'DE',
            'it': 'IT',
            'pt': 'PT',
            'ru': 'RU',
            'zh': 'ZH',
            'ja': 'JA',
            'ko': 'KO',
            'nl': 'NL',
            'pl': 'PL',
            'tr': 'TR'
        };
        
        try {
            showFunStatus('Preparing translation...', 'loading');
            
            // Split text into chunks if it's too long
            const chunks = splitTextIntoChunks(text);
            const totalChunks = chunks.length;
            const initialBufferSize = Math.max(1, Math.ceil(totalChunks * (INITIAL_BUFFER_PERCENTAGE / 100)));

            // Create progress bar for large translations
            if (totalChunks > 10) {
                progressContainer = createProgressBar();
            }

            console.log(`Starting translation of ${totalChunks} chunks to ${targetLang}...`);
            console.log(`Will wait for ${initialBufferSize} chunks before starting playback`);

            // Function to read the next chunk
            async function readNextChunk() {
                if (currentChunkIndex < translatedChunks.length) {
                    const chunk = translatedChunks[currentChunkIndex];
                    currentChunkIndex++;
                    
                    // Update progress
                    const percent = (currentChunkIndex / totalChunks) * 100;
                    if (progressContainer) {
                        updateProgress(
                            progressContainer,
                            percent,
                            `Reading part ${currentChunkIndex} of ${totalChunks}...`
                        );
                    }
                    
                    // Read the chunk
                    await new Promise((resolve) => {
                        const utterance = new SpeechSynthesisUtterance(chunk);
                        utterance.voice = voices[voiceSelect.value];
                        utterance.onend = resolve;
                        speechSynthesis.speak(utterance);
                    });
                    
                    // Schedule next chunk
                    setTimeout(readNextChunk, 500);
                }
            }

            // Start translation process
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const percent = ((i + 1) / totalChunks) * 100;
                
                if (progressContainer) {
                    updateProgress(
                        progressContainer,
                        percent,
                        `Translating part ${i + 1} of ${totalChunks}...`
                    );
                } else {
                    showFunStatus(`Translating part ${i + 1} of ${totalChunks}...`, 'loading');
                }
                
                try {
                    console.log(`Translating chunk ${i + 1}:`, chunk.substring(0, 50) + '...');
                    
                    // Use DeepL API through our server
                    const response = await fetch('http://localhost:3000/api/translate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: chunk,
                            targetLang: languageMap[targetLang] || 'EN'
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.success && data.translatedText) {
                        translatedChunks.push(data.translatedText);
                        
                        // Start reading after we have the initial buffer
                        if (i === initialBufferSize - 1) {
                            console.log(`Initial buffer of ${initialBufferSize} chunks ready, starting playback`);
                            readNextChunk();
                        }
                        
                        console.log(`Successfully translated chunk ${i + 1}`);
                    } else {
                        throw new Error('Translation failed');
                    }

                    // Add a small delay between chunks to respect rate limits
                    if (i < chunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    console.error(`Error translating chunk ${i + 1}:`, error);
                    if (progressContainer) {
                        updateProgress(
                            progressContainer,
                            percent,
                            `Error in part ${i + 1}: ${error.message}`
                        );
                    } else {
                        showFunStatus(`Error translating part ${i + 1}: ${error.message}`, 'error');
                    }
                    continue;
                }
            }

            // Wait for all chunks to be read
            while (currentChunkIndex < translatedChunks.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (translatedChunks.length > 0) {
                if (progressContainer) {
                    updateProgress(progressContainer, 100, 'Translation complete!');
                    setTimeout(() => removeProgressBar(progressContainer), 2000);
                }
                showFunStatus('Translation complete!', 'success');
                // Clean and format the final text
                return cleanAndFormatText(translatedChunks.join(' '));
            } else {
                throw new Error('No text was translated successfully');
            }
        } catch (error) {
            console.error('Translation error:', error);
            if (progressContainer) {
                updateProgress(progressContainer, 0, 'Translation failed');
                setTimeout(() => removeProgressBar(progressContainer), 2000);
            }
            showFunStatus(error.message || 'Translation failed. Please try again later.', 'error');
            return null;
        }
    }

    // Function to get language code from voice
    function getLanguageCode(voice) {
        if (!voice) return 'en';
        const langCode = voice.lang.split('-')[0];
        // Map language codes to Google Translate supported codes
        const languageMap = {
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'pt',
            'ru': 'ru',
            'zh': 'zh',
            'ja': 'ja',
            'ko': 'ko',
            'ar': 'ar',
            'nl': 'nl',
            'pl': 'pl',
            'tr': 'tr'
        };
        return languageMap[langCode] || 'en';
    }

    // Function to toggle between original and translated text
    function toggleTranslation() {
        if (textContent.textContent === originalText) {
            // If showing original, show translated
            const selectedVoice = voiceSelect.value;
            if (selectedVoice) {
                const targetLang = getLanguageCode(voices[selectedVoice]);
                translateText(originalText, targetLang).then(translatedText => {
                    if (translatedText) {
                        textContent.textContent = translatedText;
                        translateButton.textContent = 'Show Original 🔄';
                        addFunAnimation(textContent, 'bounce 0.5s ease');
                    }
                });
            }
        } else {
            // If showing translated, show original
            textContent.textContent = originalText;
            translateButton.textContent = 'Translate 🌐';
            addFunAnimation(textContent, 'bounce 0.5s ease');
        }
    }

    // Event Listeners
    readButton.addEventListener('click', () => {
        const text = textContent.textContent;
        if (text && text.trim()) {
            readFromCursor();
            addFunAnimation(readButton, 'bounce 0.5s ease');
        } else {
            showFunStatus('Please write or upload a story first!', 'error');
        }
    });

    stopButton.addEventListener('click', () => {
        stopReading();
        addFunAnimation(stopButton, 'bounce 0.5s ease');
    });

    clearButton.addEventListener('click', () => {
        clearText();
        addFunAnimation(clearButton, 'bounce 0.5s ease');
    });

    translateButton.addEventListener('click', () => {
        const text = textContent.textContent.trim();
        if (!text) {
            showFunStatus('Please write or upload a story first!', 'error');
            return;
        }

        const selectedVoice = voiceSelect.value;
        if (!selectedVoice) {
            showFunStatus('Please select a voice first!', 'error');
            return;
        }

        // Store original text if not already stored
        if (!originalText) {
            originalText = text;
        }

        toggleTranslation();
    });

    // Function to extract text from PDF
    async function extractTextFromPDF(file) {
        try {
            showFunStatus('Loading your story...', 'loading');
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            
            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            showFunStatus('Story loaded! Ready to read!', 'success');
            return fullText;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            showFunStatus('Oops! Could not read the story. Try another one!', 'error');
            throw error;
        }
    }

    // Handle PDF file upload
    pdfInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            try {
                const text = await extractTextFromPDF(file);
                if (text && text.trim()) {
                    textContent.textContent = text;
                    // Automatically start reading if text was extracted successfully
                    readText(text);
                } else {
                    showFunStatus('No text found in the PDF!', 'error');
                }
            } catch (error) {
                console.error('Error processing PDF:', error);
                showFunStatus('Error reading PDF. Please try another file.', 'error');
            }
        } else {
            showFunStatus('Please select a PDF story!', 'error');
        }
    });

    // Add fun hover effects
    textContent.addEventListener('mouseover', () => {
        addFunAnimation(textContent, 'float 1s ease');
    });

    // Initialize voices
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    
    // Initial population of voices
    populateVoiceList();

    // Update clearText function to use value instead of textContent
    function clearText() {
        textContent.textContent = '';
        originalText = '';
        pdfInput.value = '';
        pdfStatus.textContent = '';
        pdfStatus.className = 'pdf-status';
        translateButton.textContent = 'Translate 🌐';
        addFunAnimation(textContent, 'bounce 0.5s ease');
    }

    // Add drag and drop functionality
    const fileInputWrapper = document.querySelector('.file-input-wrapper');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileInputWrapper.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileInputWrapper.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileInputWrapper.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        fileInputWrapper.classList.add('dragover');
    }

    function unhighlight(e) {
        fileInputWrapper.classList.remove('dragover');
    }

    fileInputWrapper.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            pdfInput.files = files;
            const event = new Event('change');
            pdfInput.dispatchEvent(event);
        }
    }

    // Add click animation
    fileInputWrapper.addEventListener('click', () => {
        addFunAnimation(fileInputWrapper, 'bounce 0.5s ease');
    });

    // Show Story Browser Modal
    browseButton.addEventListener('click', () => {
        storyModal.style.display = 'block';
        loadStories();
    });

    // Close Story Browser Modal
    closeButton.addEventListener('click', () => {
        storyModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === storyModal) {
            storyModal.style.display = 'none';
        }
    });

    // Search and Filter Stories
    storySearch.addEventListener('input', debounce(() => {
        currentPage = 1;
        loadStories();
    }, 500));

    storyLanguage.addEventListener('change', () => {
        currentPage = 1;
        loadStories();
    });

    // Load Stories from Gutenberg API
    async function loadStories() {
        showLoading();
        const searchQuery = storySearch.value.trim();
        const language = storyLanguage.value;
        
        try {
            console.log('Fetching stories...', { searchQuery, language });
            
            // First get the book IDs from Gutenberg API
            let apiUrl = 'https://gutendex.com/books/';
            const params = new URLSearchParams({
                search: searchQuery || '',
                languages: language || 'en'
            });

            apiUrl += `?${params.toString()}`;
            console.log('API URL:', apiUrl);

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data && data.results && data.results.length > 0) {
                // Transform the API response and add text URLs
                currentStories = data.results.map(book => {
                    // Construct Project Gutenberg URLs
                    const gutenbergId = book.id;
                    const gutenbergUrl = `https://www.gutenberg.org/ebooks/${gutenbergId}`;
                    
                    // Use correct URL format for text files
                    const textUrl = `https://gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
                    
                    return {
                        id: book.id,
                        title: book.title,
                        author: book.authors.map(a => a.name).join(', ') || 'Unknown Author',
                        language: book.languages[0] || 'en',
                        year: book.release_date ? new Date(book.release_date).getFullYear() : null,
                        subjects: book.subjects || [],
                        downloadCount: book.download_count || 0,
                        coverUrl: book.formats['image/jpeg'] || 'https://archive.org/images/notfound.png',
                        textUrl: textUrl,
                        epubUrl: book.formats['application/epub+zip'],
                        htmlUrl: book.formats['text/html; charset=utf-8'] || book.formats['text/html'],
                        gutenbergUrl: gutenbergUrl
                    };
                });

                displayStories();
            } else {
                showError('No books found. Try a different search term or language.');
            }
        } catch (error) {
            console.error('Error loading stories:', error);
            showError(`Failed to load books: ${error.message}`);
        } finally {
            hideLoading();
        }
    }

    // Display Stories in the Grid
    function displayStories() {
        storyList.innerHTML = '';
        
        currentStories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'story-card';
            
            // Get language display name
            const languageDisplay = story.language === 'en' ? 'English 🇬🇧' : 
                                  story.language === 'es' ? 'Spanish 🇪🇸' :
                                  story.language === 'fr' ? 'French 🇫🇷' :
                                  story.language === 'de' ? 'German 🇩🇪' :
                                  story.language === 'it' ? 'Italian 🇮🇹' :
                                  story.language.toUpperCase();
            
            // Get top 3 subjects
            const subjects = story.subjects.slice(0, 3).join(', ');
            
            card.innerHTML = `
                <img src="${story.coverUrl}" alt="${story.title} cover" class="story-cover" onerror="this.src='https://archive.org/images/notfound.png'">
                <h3>${story.title}</h3>
                <p>By ${story.author}</p>
                ${story.year ? `<p class="year">${story.year}</p>` : ''}
                ${story.downloadCount ? `<p class="downloads">⬇️ ${story.downloadCount.toLocaleString()} downloads</p>` : ''}
                ${subjects ? `<p class="subjects">📚 ${subjects}</p>` : ''}
                <p class="format">📄 Text Available</p>
                <span class="language">${languageDisplay}</span>
            `;
            
            card.addEventListener('click', () => loadStory(story));
            storyList.appendChild(card);
        });
    }

    // Function to clean and format story text
    function cleanStoryText(text) {
        return text
            // Remove Project Gutenberg headers and footers
            .replace(/\*\*\* START OF THE PROJECT GUTENBERG.*?\*\*\*/s, '')
            .replace(/\*\*\* END OF THE PROJECT GUTENBERG.*?\*\*\*/s, '')
            // Remove multiple spaces
            .replace(/\s+/g, ' ')
            // Remove multiple line breaks
            .replace(/\n+/g, ' ')
            // Add proper spacing after punctuation
            .replace(/([.!?])\s*/g, '$1 ')
            // Remove spaces before punctuation
            .replace(/\s+([.,!?])/g, '$1')
            // Add line breaks after sentences
            .replace(/([.!?])\s+/g, '$1\n')
            // Remove any remaining multiple spaces
            .replace(/\s+/g, ' ')
            // Remove any remaining multiple line breaks
            .replace(/\n+/g, '\n')
            // Trim whitespace
            .trim();
    }

    // Load Selected Story
    async function loadStory(story) {
        showLoading();
        try {
            console.log('Loading story:', story);
            
            // First show book information
            const message = `
Title: ${story.title}
Author: ${story.author}
${story.year ? `Published: ${story.year}` : ''}
Language: ${story.language === 'en' ? 'English' : 
           story.language === 'es' ? 'Spanish' : 
           story.language === 'fr' ? 'French' : 
           story.language === 'de' ? 'German' : 
           story.language === 'it' ? 'Italian' : 
           story.language.toUpperCase()}

Book Details:
${story.downloadCount ? `Downloads: ${story.downloadCount.toLocaleString()}` : ''}
${story.subjects ? `Subjects: ${story.subjects.join(', ')}` : ''}

Reading Options:
1. Read Text Version:
   ${story.textUrl}

2. Download EPUB:
   ${story.epubUrl || 'Not available'}

3. Read Online (HTML):
   ${story.htmlUrl || 'Not available'}

4. Visit Project Gutenberg Page:
   ${story.gutenbergUrl}

Loading book content...
`;
            
            // Update the text area with the initial message
            textContent.textContent = message;
            console.log('Initial message set:', message);
            
            // Close the modal
            storyModal.style.display = 'none';
            
            // Show loading message
            showFunStatus('Loading book content... 📖', 'loading');
            
            try {
                // Use CORS proxy to fetch the text content
                const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(story.textUrl)}`;
                console.log('Fetching from:', corsProxyUrl);
                
                const response = await fetch(corsProxyUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch story content: ${response.status}`);
                }

                const content = await response.text();
                console.log('Received content length:', content.length);
                
                // Clean and format the content
                const cleanContent = cleanStoryText(content);
                console.log('Cleaned content length:', cleanContent.length);

                // Update the text area with the book content
                const finalContent = `
${message}

Book Content:
${cleanContent}
`;
                
                // Set the content
                textContent.textContent = finalContent;
                console.log('Final content set, length:', finalContent.length);
                
                // Show success message
                showFunStatus('Book content loaded successfully! 📚', 'success');
                
                // Make URLs clickable by converting them to HTML
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const htmlContent = finalContent.replace(urlRegex, url => 
                    `<a href="${url}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">${url}</a>`
                );
                
                // Create a temporary div to hold the HTML content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                
                // Convert the HTML content back to plain text while preserving URLs
                const plainTextWithUrls = Array.from(tempDiv.childNodes).map(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
                        return node.href;
                    }
                    return node.textContent;
                }).join('');
                
                // Set the final content
                textContent.textContent = plainTextWithUrls;
                console.log('Final content with URLs set, length:', plainTextWithUrls.length);
                
                // Force update the text content div and container
                const textContainer = document.querySelector('.text-container');
                if (textContainer) {
                    textContainer.style.cssText = `
                        display: block !important;
                        width: 100% !important;
                        margin: 20px 0 !important;
                        position: relative !important;
                        z-index: 1 !important;
                        max-height: 60vh !important;
                        overflow: hidden !important;
                    `;
                }
                
                textContent.style.cssText = `
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    padding: 10px !important;
                    margin: 0 !important;
                    border: 1px solid #ccc !important;
                    border-radius: 4px !important;
                    font-size: 16px !important;
                    line-height: 1.5 !important;
                    font-family: Arial, sans-serif !important;
                    background-color: #fff !important;
                    color: #333 !important;
                    position: relative !important;
                    z-index: 1 !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    overflow-y: auto !important;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    box-sizing: border-box !important;
                `;
                
                // Force a reflow
                textContent.offsetHeight;
                if (textContainer) textContainer.offsetHeight;
                
                // Scroll to the top
                textContent.scrollTop = 0;
                
            } catch (error) {
                console.error('Error loading book content:', error);
                showFunStatus('Could not load book content, but you can still read it online! 📖', 'error');
            }
            
        } catch (error) {
            console.error('Error loading story:', error);
            showError(`Failed to load book: ${error.message}. Try another book.`);
        } finally {
            hideLoading();
        }
    }

    // Loading State Functions
    function showLoading() {
        storyLoading.style.display = 'block';
        storyList.style.opacity = '0.5';
        storyList.innerHTML = ''; // Clear previous results
    }

    function hideLoading() {
        storyLoading.style.display = 'none';
        storyList.style.opacity = '1';
    }

    function showError(message) {
        storyList.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; color: var(--error-color);">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">😢 ${message}</p>
                <p style="font-size: 0.9rem; color: #666;">Please try again or select a different story.</p>
            </div>
        `;
    }

    // Debounce Function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add keyboard shortcut (Ctrl/Cmd + R) to read from cursor
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            readFromCursor();
        }
    });

    // Initialize text content div
    const textContainer = document.querySelector('.text-container');
    
    if (!textContent) {
        console.error('Text content div not found!');
        return;
    }
    
    if (!textContainer) {
        console.error('Text container not found!');
        return;
    }
    
    // Style the text container
    textContainer.style.cssText = `
        display: block !important;
        width: 100% !important;
        margin: 20px 0 !important;
        position: relative !important;
        z-index: 1 !important;
        max-height: 60vh !important;
        overflow: hidden !important;
    `;
    
    // Style the text content div
    textContent.style.cssText = `
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        padding: 10px !important;
        margin: 0 !important;
        border: 1px solid #ccc !important;
        border-radius: 4px !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        font-family: Arial, sans-serif !important;
        background-color: #fff !important;
        color: #333 !important;
        position: relative !important;
        z-index: 1 !important;
        opacity: 1 !important;
        visibility: visible !important;
        overflow-y: auto !important;
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        box-sizing: border-box !important;
    `;
    
    // Force a reflow
    textContent.offsetHeight;
    textContainer.offsetHeight;
    
    console.log('Text content div initialized:', textContent);
    console.log('Text container initialized:', textContainer);
    
    // Test content
    textContent.textContent = 'Type or paste your story here... ✍️';
    console.log('Text content div initialized:', textContent);
    console.log('Text container initialized:', textContainer);

    // Add new elements for myth search
    const mythSearchContainer = document.createElement('div');
    mythSearchContainer.className = 'myth-search-container';
    mythSearchContainer.innerHTML = `
        <div class="myth-search-box">
            <input type="text" id="mythSearch" placeholder="Ask for a myth, legend, or story... 🏺" class="myth-search-input">
            <button id="searchMyth" class="myth-search-button">Search 🔍</button>
        </div>
        <div id="mythSuggestions" class="myth-suggestions"></div>
    `;
    document.querySelector('.input-section').insertBefore(mythSearchContainer, document.querySelector('.text-container'));

    // Add styles for myth search
    const style = document.createElement('style');
    style.textContent = `
        .myth-search-container {
            margin: 20px 0;
            width: 100%;
        }
        .myth-search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        .myth-search-input {
            flex: 1;
            padding: 12px;
            border: 2px solid var(--primary-color);
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .myth-search-input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
        }
        .myth-search-button {
            padding: 12px 24px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .myth-search-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .myth-suggestions {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }
        .myth-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .myth-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .myth-card h3 {
            margin: 0 0 10px 0;
            color: var(--primary-color);
        }
        .myth-card p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }
    `;
    document.head.appendChild(style);

    // Function to fetch myth/legend content
    async function fetchMythContent(query) {
        try {
            showFunStatus('Searching for your story... 📚', 'loading');
            
            // First, check if we have the story cached
            const SERVER_URL = 'http://localhost:3000';
            const cachedResponse = await fetch(`${SERVER_URL}/api/get-story/${encodeURIComponent(query)}`);
            
            if (cachedResponse.ok) {
                const { content } = await cachedResponse.json();
                console.log('Found cached story');
                textContent.textContent = content;
                showFunStatus('Story found in cache! 📖', 'success');
                readText(content);
                return content;
            }
            
            // If not cached, get the API key and fetch from OpenAI
            console.log('Story not found in cache, fetching from OpenAI');
            const keyResponse = await fetch(`${SERVER_URL}/api/get-openai-key`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!keyResponse.ok) {
                console.error('API key response error:', keyResponse.status, keyResponse.statusText);
                const errorData = await keyResponse.json().catch(() => ({}));
                throw new Error(`Could not get API key: ${errorData.details || keyResponse.statusText}`);
            }

            const { apiKey } = await keyResponse.json();
            if (!apiKey) {
                throw new Error('No API key received from server');
            }
            
            console.log('Successfully received API key');
            
            // Use OpenAI API to get the story
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: "You are a knowledgeable storyteller specializing in myths, legends, and folklore from around the world. Provide detailed, engaging, and accurate retellings of these stories. Make them suitable for children while maintaining the essence of the original myth or legend. Include some fun facts or interesting details that make the story more engaging."
                    }, {
                        role: "user",
                        content: `Please tell me the story of ${query}. Make it engaging and suitable for children, but maintain the essence of the original myth or legend.`
                    }],
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenAI API error:', errorData);
                
                // Handle specific error cases
                if (errorData.error?.code === 'insufficient_quota') {
                    const fallbackMessage = `I apologize, but I'm currently unable to generate new stories due to API limitations. However, I can tell you about ${query}:

${query} is a fascinating story from mythology/folklore. While I can't generate the full story right now, you can find this tale in many books and online resources. Some key points about this story:

1. It's a classic tale that has been told for generations
2. It contains important lessons and cultural significance
3. It's a great story to share with children
4. You can find it in many mythology books and educational websites

Would you like me to suggest some reliable sources where you can read the full story?`;
                    
                    textContent.textContent = fallbackMessage;
                    showFunStatus('Story information provided! 📖', 'success');
                    readText(fallbackMessage);
                    return fallbackMessage;
                }
                
                throw new Error(`Failed to fetch story: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const story = data.choices[0].message.content;

            // Store the story in cache
            try {
                await fetch(`${SERVER_URL}/api/store-story`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: query,
                        content: story
                    })
                });
                console.log('Story cached successfully');
            } catch (error) {
                console.error('Failed to cache story:', error);
            }

            // Display the story
            textContent.textContent = story;
            showFunStatus('Story found! Ready to read! 📖', 'success');
            
            // Automatically start reading
            readText(story);
            
            return story;
        } catch (error) {
            console.error('Error fetching myth:', error);
            showFunStatus(`Could not find the story: ${error.message}. Try another one! 😢`, 'error');
            return null;
        }
    }

    // Function to show myth suggestions
    function showMythSuggestions() {
        const suggestions = [
            { title: 'Zeus and the Titans', description: 'The epic battle for control of Mount Olympus' },
            { title: 'Poseidon\'s Wrath', description: 'The god of the sea\'s most famous tales' },
            { title: 'Hercules\' Labors', description: 'The twelve impossible tasks' },
            { title: 'Pandora\'s Box', description: 'The story of hope and curiosity' },
            { title: 'Theseus and the Minotaur', description: 'The hero\'s journey through the labyrinth' },
            { title: 'Perseus and Medusa', description: 'The quest to slay the Gorgon' },
            { title: 'Odysseus\' Journey', description: 'The long voyage home from Troy' },
            { title: 'King Midas', description: 'The golden touch and its consequences' }
        ];

        const suggestionsContainer = document.getElementById('mythSuggestions');
        suggestionsContainer.innerHTML = '';

        suggestions.forEach(myth => {
            const card = document.createElement('div');
            card.className = 'myth-card';
            card.innerHTML = `
                <h3>${myth.title}</h3>
                <p>${myth.description}</p>
            `;
            card.addEventListener('click', () => {
                fetchMythContent(myth.title);
                suggestionsContainer.innerHTML = '';
            });
            suggestionsContainer.appendChild(card);
        });
    }

    // Add event listeners for myth search
    const mythSearch = document.getElementById('mythSearch');
    const searchMythButton = document.getElementById('searchMyth');

    mythSearch.addEventListener('input', debounce(() => {
        if (mythSearch.value.trim().length > 2) {
            showMythSuggestions();
        } else {
            document.getElementById('mythSuggestions').innerHTML = '';
        }
    }, 300));

    searchMythButton.addEventListener('click', () => {
        const query = mythSearch.value.trim();
        if (query) {
            fetchMythContent(query);
        } else {
            showFunStatus('Please enter a myth or story to search for!', 'error');
        }
    });

    // Add keyboard shortcut (Enter) for myth search
    mythSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMythButton.click();
        }
    });

    // Show initial suggestions
    showMythSuggestions();
}); 