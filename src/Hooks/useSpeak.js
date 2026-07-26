import { useState, useRef, useEffect, useCallback } from 'react';
import SpeechEngine from '../Utils/speechEngine';

// ──────────────────────────────────────────────────────────────
// useSpeak — speech state for components that speak on their own
// press (e.g. TopicCard) rather than through a <SpeakButton>.
//
//   const { isSpeaking, toggle } = useSpeak();
//   <Pressable onPress={() => toggle(item.speak, 'en-US')} />
//
// Owns the same discipline as SpeakButton: tap-to-stop, a single
// settle via onDone/onError, and no state updates after unmount.
// Deliberately simpler — no audioClips/phrases sequencing, because
// callers here always speak one plain sentence.
// ──────────────────────────────────────────────────────────────
const useSpeak = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);
  // Read inside callbacks so `toggle` stays stable across renders.
  const speakingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      // Stop audio on unmount (e.g. navigating away mid-sentence) and
      // block any late state updates from an in-flight utterance.
      //
      // Only stop when THIS instance is the one speaking: these cards
      // live in a windowed FlatList, so an off-screen card unmounting
      // must not cut off the card the child is actually listening to.
      mountedRef.current = false;
      if (speakingRef.current) {
        speakingRef.current = false;
        SpeechEngine.stop();
      }
    };
  }, []);

  const finish = useCallback(() => {
    speakingRef.current = false;
    if (mountedRef.current) setIsSpeaking(false);
  }, []);

  const stop = useCallback(async () => {
    await SpeechEngine.stop();
    finish();
  }, [finish]);

  // Press while playing cancels instead of queueing a second voice.
  const toggle = useCallback(
    async (text, language = 'en-US', opts = {}) => {
      if (speakingRef.current) {
        await stop();
        return;
      }
      if (!text) return;

      speakingRef.current = true;
      setIsSpeaking(true);
      await SpeechEngine.speak(text, language, {
        ...opts,
        onDone: finish,
        onError: finish,
      });
    },
    [finish, stop]
  );

  return { isSpeaking, toggle, stop };
};

export default useSpeak;
