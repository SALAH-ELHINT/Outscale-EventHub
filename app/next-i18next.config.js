const path = require('path');

module.exports = {
  i18n: {
    locales: ['fr', 'en', 'es'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  localePath: path.resolve('./public/locales'),
};