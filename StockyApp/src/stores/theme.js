import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'stocky-theme'

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredTheme() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' || stored === 'light' ? stored : null
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')
  let mediaQuery = null
  let handleSystemChange = null

  function applyTheme(value) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', value)
    }
  }

  function setTheme(value) {
    theme.value = value
    applyTheme(value)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function init() {
    const stored = readStoredTheme()
    const initial = stored ?? getSystemTheme()
    theme.value = initial
    applyTheme(initial)

    if (!stored && typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      handleSystemChange = (event) => {
        if (readStoredTheme()) return
        theme.value = event.matches ? 'dark' : 'light'
        applyTheme(theme.value)
      }
      mediaQuery.addEventListener('change', handleSystemChange)
    }
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    init,
  }
})
