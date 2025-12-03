// ... existing code ...
// Update the save story endpoint
app.post('/api/stories/save', async (req, res) => {
  try {
    console.log('Received save request body:', JSON.stringify(req.body, null, 2));
    const stories = Array.isArray(req.body) ? req.body : [req.body];
    console.log('Processing stories count:', stories.length);

    // Validate all stories have required fields
    const invalidStories = stories.filter(story => {
      const hasTitle = story.title && typeof story.title === 'string' && story.title.length <= 200;
      const hasContent = story.content && typeof story.content === 'string';
      const hasLanguage = story.language && typeof story.language === 'string';
      return !(hasTitle && hasContent && hasLanguage);
    });

    if (invalidStories.length > 0) {
      console.error('Invalid stories found:', JSON.stringify(invalidStories, null, 2));
      return res.status(400).json({ 
        error: 'Missing required fields in one or more stories',
        invalidStories: invalidStories.map(story => ({
          title: story.title ? `Length: ${story.title.length}` : 'Missing',
          hasContent: !!story.content,
          hasLanguage: !!story.language
        }))
      });
    }

    // Read existing stories
    let savedStories = [];
    try {
      const data = await fs.readFile('saved_stories.json', 'utf8');
      savedStories = JSON.parse(data);
      console.log('Existing stories count:', savedStories.length);
    } catch (error) {
      console.log('No existing stories file, starting fresh');
      savedStories = [];
    }

    // Process each story
    const processedStories = stories.map(story => ({
      ...story,
      id: story.id || Date.now() + Math.random(),
      tag: story.tag || null,
      source: story.source || 'user',
      createdAt: new Date().toISOString()
    }));
    console.log('Processed stories:', JSON.stringify(processedStories, null, 2));

    // Add new stories to the array
    savedStories.push(...processedStories);
    console.log('Total stories after save:', savedStories.length);

    // Save all stories
    await fs.writeFile('saved_stories.json', JSON.stringify(savedStories, null, 2));
    console.log('Stories saved successfully');

    res.json({ 
      message: 'Stories saved successfully', 
      stories: processedStories 
    });
  } catch (error) {
    console.error('Error saving stories:', error);
    res.status(500).json({ error: 'Failed to save stories' });
  }
});

// Update the get saved stories endpoint
app.get('/api/stories/saved', async (req, res) => {
  try {
    let savedStories = [];
    try {
      const data = await fs.readFile('saved_stories.json', 'utf8');
      savedStories = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return empty array
      savedStories = [];
    }

    // Ensure each story has all required fields
    savedStories = savedStories.map(story => ({
      ...story,
      tag: story.tag || null, // Ensure tag exists
      source: story.source || 'user',
      createdAt: story.createdAt || new Date().toISOString()
    }));

    res.json(savedStories);
  } catch (error) {
    console.error('Error reading saved stories:', error);
    res.status(500).json({ error: 'Failed to read saved stories' });
  }
});
// ... rest of the code ... 