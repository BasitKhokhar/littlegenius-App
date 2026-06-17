import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Colors } from '../../Data/colorsTheme';

const SpeakButton = ({ 
  text, 
  language = 'en-US', 
  color = Colors.primary, 
  size = 'md',
  label = '🔊 Listen',
  onSpeakStart = null,
  onSpeakEnd = null,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      // Stop speech on unmount
      Speech.stop();
    };
  }, []);

  const handleSpeak = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(true);
      
      if (onSpeakStart) onSpeakStart();

      await Speech.speak(text, {
        language,
        pitch: 1.35,  // Kid-friendly pitch
        rate: 0.85,   // Clear, slow rate
        onDone: () => {
          setIsSpeaking(false);
          if (onSpeakEnd) onSpeakEnd();
        },
        onError: (error) => {
          setIsSpeaking(false);
          console.warn('Speech error:', error);
        },
      });
    } catch (error) {
      setIsSpeaking(false);
      console.warn('Failed to speak:', error);
    }
  };

  const sizeConfig = {
    sm: { padding: 8, fontSize: 11 },
    md: { padding: 12, fontSize: 12 },
    lg: { padding: 16, fontSize: 14 },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <TouchableOpacity
      onPress={handleSpeak}
      disabled={isSpeaking}
      style={[
        styles.button,
        {
          backgroundColor: isSpeaking ? color : color,
          paddingVertical: config.padding,
          paddingHorizontal: config.padding * 1.5,
          opacity: isSpeaking ? 0.8 : 1,
          borderBottomWidth: isSpeaking ? 2 : 4,
          borderBottomColor: 'rgba(0,0,0,0.1)',
        },
      ]}
      activeOpacity={0.8}
    >
      {isSpeaking ? (
        <View style={styles.speakingContainer}>
          <View style={styles.waveBar} />
          <View style={styles.waveBar} />
          <View style={styles.waveBar} />
          <View style={styles.waveBar} />
          <Text style={[styles.buttonText, { marginLeft: 8, fontSize: config.fontSize }]}>
            Playing...
          </Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, { fontSize: config.fontSize }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '900',
    textAlign: 'center',
  },
  speakingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveBar: {
    width: 3,
    height: 12,
    backgroundColor: '#FFF',
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

export default SpeakButton;
