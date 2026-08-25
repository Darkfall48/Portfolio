export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'portfolio-theme'

export function isTheme(value: string): value is Theme {
  return value === 'dark' || value === 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Ignore quota / privacy errors.
  }
  applyTheme(theme)
}

export function detectTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isTheme(stored)) return stored
  } catch {
    // Private mode or blocked storage — keep the dark default.
  }
  return 'dark'
}

applyTheme(detectTheme())
