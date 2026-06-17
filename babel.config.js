module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module resolver for clean absolute imports
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.jsx', '.js', '.json'],
          alias: {
            '@components': './src/Components',
            '@screens':    './src/Screens',
            '@navigation': './src/Navigation',
            '@context':    './src/Context',
            '@hooks':      './src/Hooks',
            '@store':      './src/Store',
            '@services':   './src/Services',
            '@utils':      './src/Utils',
            '@constants':  './src/Constants',
            '@theme':      './src/Theme',
            '@assets':     './src/Assets',
          },
        },
      ],
    ],
  };
};
