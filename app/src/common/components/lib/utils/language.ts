export const getUserLanguage = (): string => {
  return localStorage.getItem('user-lang') || 'fr';
};

export const setUserLanguage = (lang: string): void => {
  localStorage.setItem('user-lang', lang);
};
