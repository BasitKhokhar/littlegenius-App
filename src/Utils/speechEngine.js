// Speech Engine - Text to Speech using Expo Speech
import * as Speech from 'expo-speech';

export const SpeechEngine = {
  /**
   * Speak text in specified language
   * @param {string} text - Text to speak
   * @param {string} language - Language code (en-US, ur-PK, etc.)
   */
  speak: async (text, language = 'en-US') => {
    try {
      // Stop any ongoing speech
      await Speech.stop();

      // Configure utterance for kid-friendly voice
      const utterance = {
        text: text,
        language: language,
        pitch: 1.35, // Slightly higher pitch for kid-friendly tone
        rate: 0.85,  // Slower rate for clear pronunciation
        onDone: () => {
          // Callback when speech finishes
        },
        onError: (error) => {
          console.warn('[SpeechEngine] Error:', error);
        },
      };

      await Speech.speak(text, utterance);
    } catch (error) {
      console.warn('[SpeechEngine] Failed to speak:', error);
    }
  },

  /**
   * Stop currently playing speech
   */
  stop: async () => {
    try {
      await Speech.stop();
    } catch (error) {
      console.warn('[SpeechEngine] Failed to stop:', error);
    }
  },

  /**
   * Check if speech is currently playing
   */
  isSpeaking: async () => {
    try {
      return await Speech.isSpeaking();
    } catch (error) {
      console.warn('[SpeechEngine] Error checking if speaking:', error);
      return false;
    }
  },

  /**
   * Speak number with both English and Urdu pronunciation
   */
  speakNumber: async (number, englishName, urduName) => {
    const text = `${number}. In English ${englishName}. In Urdu ${urduName}`;
    await SpeechEngine.speak(text, 'en-US');
  },

  /**
   * Speak with language selection
   */
  speakWithLanguage: async (text, language = 'en-US') => {
    await SpeechEngine.speak(text, language);
  },
};

export default SpeechEngine;
