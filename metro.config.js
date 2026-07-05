// Metro config for Expo SDK 54
// Adds react-native-svg-transformer so `.svg` files can be imported as
// React components:  import Apple from '@assets/svg/apple.svg';
const { getDefaultConfig } = require('expo/metro');

const config = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = config.resolver;

config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer/expo'
);

// Treat .svg as source (component) instead of a static asset.
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

module.exports = config;
