/**
 * Central asset registry — import all local images/icons here
 * and reference them from a single place throughout the app.
 */

const Images = {
  logo:          require('./images/logo.png'),
  onboarding1:   require('./images/onboarding1.png'),
  onboarding2:   require('./images/onboarding2.png'),
  onboarding3:   require('./images/onboarding3.png'),
  placeholder:   require('./images/placeholder.png'),
};

const Icons = {
  home:     require('./icons/home.png'),
  search:   require('./icons/search.png'),
  saved:    require('./icons/saved.png'),
  profile:  require('./icons/profile.png'),
  settings: require('./icons/settings.png'),
};

export { Images, Icons };
