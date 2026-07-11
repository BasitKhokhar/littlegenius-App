import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import SpeechEngine from '../../Utils/speechEngine';
import { Colors } from '../../Data/colorsTheme';
import { Radius, coloredShadow } from '../../Theme';

// Human labels + install hints for the languages that commonly lack a
// device voice pack (Arabic/Urdu are absent on many Android phones).
const LANG_INFO = {
  ar: { name: 'Arabic', code: 'ar' },
  ur: { name: 'Urdu', code: 'ur' },
};
// Warn at most once per language per app session so we never nag.
const warnedLangs = new Set();

const maybeWarnMissingVoice = async (language) => {
  const prefix = `${language || ''}`.toLowerCase().split(/[-_]/)[0];
  const info = LANG_INFO[prefix];
  if (!info || warnedLangs.has(prefix)) return;
  // Only warn if the device really has no voice for this language.
  const available = await SpeechEngine.isLanguageAvailable(language);
  if (available) return;
  warnedLangs.add(prefix);
  Alert.alert(
    `${info.name} voice not installed`,
    `Your device doesn't have a ${info.name} text-to-speech voice yet, so this audio can't play.\n\nTo enable it: open your phone's Settings → System → Languages & input → Text-to-speech output → install the ${info.name} voice data.`,
    [{ text: 'OK' }],
  );
};

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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      // Stop speech on unmount and block any late state updates.
      mountedRef.current = false;
      SpeechEngine.stop();
    };
  }, []);

  // Central reset — safe to call from any callback; ignored after unmount.
  const finish = () => {
    if (!mountedRef.current) return;
    setIsSpeaking(false);
    if (onSpeakEnd) onSpeakEnd();
  };

  const handleSpeak = async () => {
    // Tap-to-stop: pressing while playing cancels instead of being a dead
    // (disabled) button. This is also the user's recovery path if a device
    // voice misbehaves.
    if (isSpeaking) {
      await SpeechEngine.stop();
      finish();
      return;
    }

    setIsSpeaking(true);
    if (onSpeakStart) onSpeakStart();

    // Voice handled centrally by SpeechEngine: it plays the pre-baked premium
    // clip for the active persona (teacher/kid) when one exists, else falls
    // back to device TTS. SpeechEngine guarantees exactly one of onDone/onError
    // fires, so state can't hang.
    await SpeechEngine.speak(text, language, {
      onDone: finish,
      onError: () => {
        finish();
        // If the audio never played because the device lacks this
        // language's voice, explain how to install it (once per language).
        maybeWarnMissingVoice(language);
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
