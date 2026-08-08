// Shared per-story accent palette. Cycled by the story's position in its
// list (moral vs Islamic), so the same story always resolves to the same
// colour everywhere — the detail screen's hero/card accent and the quiz
// screen's gradient stage must agree, or the quiz reads as a different
// story's theme.
export const STORY_COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
// One shade darker per accent above, for gradient bodies.
export const STORY_COLORS_DARK = ['#D97706', '#DC2626', '#059669', '#2563EB', '#7C3AED', '#DB2777'];

export const getStoryAccent = (idx) => ({
  color: STORY_COLORS[idx % STORY_COLORS.length],
  dark: STORY_COLORS_DARK[idx % STORY_COLORS_DARK.length],
});

export default { STORY_COLORS, STORY_COLORS_DARK, getStoryAccent };
