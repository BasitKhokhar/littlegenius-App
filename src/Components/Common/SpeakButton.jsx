import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import SpeechEngine from '../../Utils/speechEngine';
import { Colors } from '../../Data/colorsTheme';
import { Radius, coloredShadow } from '../../Theme';

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
      SpeechEngine.stop();
    };
  }, []);

  const handleSpeak = async () => {
    setIsSpeaking(true);
    if (onSpeakStart) onSpeakStart();

    // Clear, professional MALE voice handled centrally by SpeechEngine
    // (male voice selection + adult pitch + slow rate).
    await SpeechEngine.speak(text, language, {
      onDone: () => {
        setIsSpeaking(false);
        if (onSpeakEnd) onSpeakEnd();
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
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
        coloredShadow(color, 'sm'),
        {
          backgroundColor: color,
          paddingVertical: config.padding,
          paddingHorizontal: config.padding * 1.5,
          opacity: isSpeaking ? 0.85 : 1,
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
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
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
