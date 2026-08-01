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
  // Stable per-instance identity for the cross-component "one speaker at a
  // time" registry — see SpeechEngine.registerSpeaker/claimSpeaker. Each card
  // in a list (e.g. VocabularyTile grid) is its own instance.
  const ownerIdRef = useRef(null);
  if (!ownerIdRef.current) ownerIdRef.current = Symbol('speaker');

  const finish = useCallback(() => {
    speakingRef.current = false;
    if (mountedRef.current) setIsSpeaking(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Tapping a DIFFERENT word's sound icon already silences this one's audio
    // (SpeechEngine has a single active player) — this makes sure the icon
    // itself flips back from "playing" to idle at the same moment, instead of
    // staying stuck until this instance happens to unmount.
    const unregister = SpeechEngine.registerSpeaker(ownerIdRef.current, finish);
    return () => {
      // Stop audio on unmount (e.g. navigating away mid-sentence) and
      // block any late state updates from an in-flight utterance.
      //
      // Only stop when THIS instance is the one speaking: these cards
      // live in a windowed FlatList, so an off-screen card unmounting
      // must not cut off the card the child is actually listening to.
      mountedRef.current = false;
      unregister();
      if (speakingRef.current) {
        speakingRef.current = false;
        SpeechEngine.stop();
      }
    };
  }, [finish]);

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
      SpeechEngine.claimSpeaker(ownerIdRef.current);
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
