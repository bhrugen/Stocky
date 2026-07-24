import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './theme'

function mockMatchMedia(matches) {
  const listeners = []
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: (event, cb) => listeners.push(cb),
    removeEventListener: vi.fn(),
  }))
  return {
    trigger(next) {
      listeners.forEach((cb) => cb({ matches: next }))
    },
  }
}

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to the OS preference when nothing is saved', () => {
    mockMatchMedia(true)
    const store = useThemeStore()
    store.init()

    expect(store.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('defaults to light when OS prefers light and nothing is saved', () => {
    mockMatchMedia(false)
    const store = useThemeStore()
    store.init()

    expect(store.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('uses the saved preference over the OS preference', () => {
    mockMatchMedia(false)
    window.localStorage.setItem('stocky-theme', 'dark')
    const store = useThemeStore()
    store.init()

    expect(store.theme).toBe('dark')
  })

  it('setTheme updates state, the DOM attribute, and persists to localStorage', () => {
    mockMatchMedia(false)
    const store = useThemeStore()
    store.init()

    store.setTheme('dark')

    expect(store.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(window.localStorage.getItem('stocky-theme')).toBe('dark')
  })

  it('toggleTheme flips between light and dark', () => {
    mockMatchMedia(false)
    const store = useThemeStore()
    store.init()

    store.toggleTheme()
    expect(store.theme).toBe('dark')

    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('follows OS changes when no explicit preference is saved', () => {
    const media = mockMatchMedia(false)
    const store = useThemeStore()
    store.init()
    expect(store.theme).toBe('light')

    media.trigger(true)
    expect(store.theme).toBe('dark')
  })

  it('ignores OS changes once an explicit preference has been saved', () => {
    const media = mockMatchMedia(false)
    const store = useThemeStore()
    store.init()
    store.setTheme('light')

    media.trigger(true)
    expect(store.theme).toBe('light')
  })
})
