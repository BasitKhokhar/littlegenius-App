// speechCatalog — the fixed spoken phrases that live in UI / feedback code
// (game intros, praise, "try again", etc.) rather than in the curriculum data
// files. Centralising them here does two things:
//   1. Screens import a named constant instead of an inline literal, so the
//      exact spoken string can never drift out of sync with its audio clip.
//   2. The build-time generator (scripts/generateAudio.mjs) enumerates
//      SPEECH_PHRASE_LIST to pre-bake a teacher-voice clip for each phrase.
//
// The VALUES are the exact strings passed to SpeechEngine.speak(); changing a
// value means the audio must be regenerated (its speechKey changes).
// All of these are spoken in English.

export const SPEECH_PHRASES = {
  // Quiz / answer feedback
  CORRECT: 'Correct!',
  CORRECT_BRILLIANT: 'Correct! Brilliant!',
  CORRECT_NICE_JOB: 'Correct! Nice job!',
  CORRECT_EXCELLENT: 'Correct! Excellent job!',
  TRY_AGAIN: 'Try again!',
  OOPS_TRY_AGAIN: 'Oops! Try again!',

  // Memory game
  MATCHED: 'Matched!',
  NO_MATCH: 'No match!',

  // Tracing worksheet
  TRACE_AMAZING: 'Amazing writing!',
  TRACE_GOOD: 'Good job!',
  TRACE_WRONG: 'Oops! You have written it wrong. Try again!',

  // Session/result praise — spoken in place of dynamic "you scored X" lines so
  // the whole app stays on the teacher voice. The exact score/stars still show
  // on screen; only the audio is a fixed phrase.
  SKETCH_COMPLETE: "Fantastic writing! You've earned your stars!",
  WORKSHEET_COMPLETE: "Worksheet complete! Wonderful writing! You've earned your stars!",
  GAME_WON: "Congratulations! You won the game! You've earned your stars!",
  PUZZLE_COMPLETE: "Puzzle finished! Brilliant work! You've earned your stars!",
  QUIZ_COMPLETE: "Quiz finished! Great job! You've earned your stars!",
  STORY_QUIZ_COMPLETE: "Story quiz complete! Well done! You've earned your stars!",
  COLORING_DONE: "Beautiful colouring! You've earned a big bonus!",

  // Wrong-answer lead-in — spoken first, then the correct answer word is spoken
  // as its own pre-baked clip so the child hears the answer in the teacher voice.
  INCORRECT_LEAD: 'Not quite! The correct answer is',

  // Game intros
  GAME_PATTERN: 'Pattern Match! Find the emoji that fits next!',
  GAME_MEMORY: 'Memory Game! Match all pairs of emojis!',
  GAME_ODD: 'Odd One Out! Tap the item that does not fit!',
  GAME_MATH: 'Math Race! Solve the math questions quickly!',
  GAME_COLOR: 'Color Match! Pick the right color name!',
  GAME_SHAPE: 'Shape Quiz! Name the shapes correctly!',

  // Voice preview line (spoken from Settings to check the sound is working)
  VOICE_PREVIEW_TEACHER: "Hello! I'm your teacher. Let's learn together!",
};

// Flat list the audio generator consumes. All fixed phrases are English.
export const SPEECH_PHRASE_LIST = Object.values(SPEECH_PHRASES).map((text) => ({
  language: 'en-US',
  text,
}));

export default SPEECH_PHRASES;
