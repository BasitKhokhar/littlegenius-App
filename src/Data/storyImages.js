// Story banner illustrations. Metro requires static string literals, so
// every file is required explicitly here rather than built from a template
// string — this array's index is what StoriesScreen maps story index onto.
const storyImages = [
  require('../../assets/stories/story1.png'),
  require('../../assets/stories/story2.png'),
  require('../../assets/stories/story3.png'),
  require('../../assets/stories/story4.png'),
  require('../../assets/stories/story5.png'),
  require('../../assets/stories/story6.png'),
  require('../../assets/stories/story7.png'),
  require('../../assets/stories/story8.png'),
  require('../../assets/stories/story9.png'),
  require('../../assets/stories/story10.png'),
  require('../../assets/stories/story11.png'),
  require('../../assets/stories/story12.png'),
  require('../../assets/stories/story13.png'),
  require('../../assets/stories/story14.png'),
  require('../../assets/stories/story15.png'),
  require('../../assets/stories/story16.png'),
  require('../../assets/stories/story17.png'),
  require('../../assets/stories/story18.png'),
  require('../../assets/stories/story19.png'),
  require('../../assets/stories/story20.png'),
];

// storyImages holds 20 banner illustrations; the moral-stories list only has
// `storiesLength` entries, so every moral story gets one banner (idx 0 up to
// storiesLength-1). Leftover banners after that go to the first few Islamic
// stories in order — the rest fall back to the emoji tile since there's no
// artwork left for them.
export const getStoryHeroImage = (storiesLength, isIslamic, idx) => {
  if (!isIslamic) return idx < storyImages.length ? storyImages[idx] : null;
  const offset = storiesLength + idx;
  return offset < storyImages.length ? storyImages[offset] : null;
};

export default storyImages;
