export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'longpress-theme';
const META_COLOR: Record<Theme, string> = {
  light: '#F4F1E8',
  dark: '#0E0F1D',
};

export function getTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — the theme still applies for this page */
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLOR[theme]);

  window.dispatchEvent(new CustomEvent('longpress:theme-change', { detail: { theme } }));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Fires whenever the theme changes, from any control on the page. */
export function onThemeChange(handler: (theme: Theme) => void): void {
  window.addEventListener('longpress:theme-change', () => handler(getTheme()));
}
