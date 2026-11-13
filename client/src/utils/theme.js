export const applyTheme = (theme = 'dark') => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#030712';
    document.body.style.color = '#f8fafc';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
  }

  localStorage.setItem('venturemind_theme', theme);
};

export const getStoredTheme = () => {
  return localStorage.getItem('venturemind_theme') || 'dark';
};

