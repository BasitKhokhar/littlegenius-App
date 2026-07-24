import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import SpeechEngine from '../../Utils/speechEngine';
import { Colors } from '../../Data/colorsTheme';
import { Radius, coloredShadow } from '../../Theme';

const SpeakButton = ({
  text,
  language = 'en-US',
  // Romanized/English text spoken with the English voice when the device has
  // no Arabic/Urdu voice pack — guarantees the child always hears something.
  fallbackText = null,
  fallbackLang = 'en-US',
  // Ordered [{ text, language }] spoken back-to-back, each in its OWN language
  // — e.g. a number said in English then Urdu. Unlike audioClips these still go
  // through SpeechEngine, so each phrase gets its pre-baked clip when one exists
  // and falls back to device TTS when it doesn't. Takes priority over text.
  phrases = null,
  // Ordered list of bundled clips (require()'d MP3s) to play back-to-back —
  // e.g. a full surah recited ayah by ayah. Takes priority over text when set.
  audioClips = null,
  // Slow the delivery for single letters / vocabulary words so young learners
  // can copy the pronunciation. clipRate applies to the pre-baked teacher clip;
  // rate slows the device-TTS fallback to match. Omit for normal speed.
  clipRate = null,
  rate = null,
  color = Colors.primary,
  size = 'md',
  label = '🔊 Listen',
  onSpeakStart = null,
  onSpeakEnd = null,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);
  // Increments to cancel an in-flight clip sequence (tap-to-stop / unmount).
  const seqRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      // Stop speech on unmount and block any late state updates.
      mountedRef.current = false;
      seqRef.current++;
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
      seqRef.current++; // abort any running sequence
      await SpeechEngine.stop();
      finish();
      return;
    }

    setIsSpeaking(true);
    if (onSpeakStart) onSpeakStart();

    // Multi-clip sequence (e.g. a whole surah): play each bundled clip in turn,
    // chaining on completion. A token makes a stale chain a no-op after stop.
    const clips = Array.isArray(audioClips) ? audioClips.filter(Boolean) : [];
    if (clips.length) {
      const token = ++seqRef.current;
      const playAt = (i) => {
        if (token !== seqRef.current || !mountedRef.current) return;
        if (i >= clips.length) { finish(); return; }
        SpeechEngine.speak('', language, {
          audioClip: clips[i],
          onDone: () => playAt(i + 1),
          onError: () => playAt(i + 1),
        });
      };
      playAt(0);
      return;
    }

    // Multi-language phrase sequence (e.g. "42. Forty Two" then "بیالیس").
    // Same chaining/token discipline as above, but each step is a normal
    // SpeechEngine.speak() so it keeps the clip lookup and the TTS fallback.
    // onError advances rather than aborting: one missing voice pack must not
    // swallow the rest of the sequence.
    const steps = Array.isArray(phrases) ? phrases.filter((p) => p?.text) : [];
    if (steps.length) {
      const token = ++seqRef.current;
      const speakAt = (i) => {
        if (token !== seqRef.current || !mountedRef.current) return;
        if (i >= steps.length) { finish(); return; }
        const step = steps[i];
        SpeechEngine.speak(step.text, step.language || language, {
          fallbackText: step.fallbackText ?? null,
          fallbackLang: step.fallbackLang ?? fallbackLang,
          clipRate: step.clipRate ?? clipRate,
          rate: step.rate ?? rate,
          onDone: () => speakAt(i + 1),
          onError: () => speakAt(i + 1),
        });
      };
      speakAt(0);
      return;
    }

    // Voice handled centrally by SpeechEngine: it plays the pre-baked teacher
    // clip when one exists, else falls back to device TTS — and if the
    // requested Arabic/Urdu voice isn't installed, to fallbackText spoken in
    // English. SpeechEngine guarantees exactly one of onDone/onError fires, so
    // state can't hang.
    await SpeechEngine.speak(text, language, {
      fallbackText,
      fallbackLang,
      clipRate,
      rate,
      onDone: finish,
      onError: finish,
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
