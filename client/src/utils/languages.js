// Shared language options for the application
// Using abbreviated format for compact display in unified search containers

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'ENG' },
  { value: 'es', label: 'ESP' },
  { value: 'fr', label: 'FRA' },
  { value: 'de', label: 'DEU' },
  { value: 'it', label: 'ITA' }
];

// Full language names for display in story cards and other places
export const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian'
};

// Language options with "All Languages" option for filtering
export const LANGUAGE_OPTIONS_WITH_ALL = [
  { value: '', label: 'All' },
  ...LANGUAGE_OPTIONS
];

