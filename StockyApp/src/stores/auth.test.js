import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/firebase', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...args) => ({ path: args.slice(1).join('/') })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'
import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('defaults dailyCalorieGoal, weightUnit, and onboardingComplete when no profile exists', () => {
    const store = useAuthStore()
    expect(store.dailyCalorieGoal).toBe(2000)
    expect(store.weightUnit).toBe('lb')
    expect(store.onboardingComplete).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })

  it('reflects profile values once loaded', () => {
    const store = useAuthStore()
    store.profile = { dailyCalorieGoal: 1800, weightUnit: 'kg', onboardingComplete: true }
    expect(store.dailyCalorieGoal).toBe(1800)
    expect(store.weightUnit).toBe('kg')
    expect(store.onboardingComplete).toBe(true)
  })

  it('isAuthenticated is true once a user is set', () => {
    const store = useAuthStore()
    store.user = { uid: 'abc' }
    expect(store.isAuthenticated).toBe(true)
  })

  it('signUp creates the account and provisions a profile document for a new user', async () => {
    getDoc.mockResolvedValue({ exists: () => false })
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1', email: 'a@b.com' } })

    const store = useAuthStore()
    await store.signUp('a@b.com', 'password123')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'a@b.com', 'password123')
    expect(setDoc).toHaveBeenCalled()
    expect(store.profile).toMatchObject({
      email: 'a@b.com',
      dailyCalorieGoal: 2000,
      weightUnit: 'lb',
    })
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('signUp does not overwrite an existing profile document', async () => {
    const existingProfile = { email: 'a@b.com', dailyCalorieGoal: 2200, weightUnit: 'kg' }
    getDoc.mockResolvedValue({ exists: () => true, data: () => existingProfile })
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1', email: 'a@b.com' } })

    const store = useAuthStore()
    await store.signUp('a@b.com', 'password123')

    expect(setDoc).not.toHaveBeenCalled()
    expect(store.profile).toEqual(existingProfile)
  })

  it('signUp surfaces and rethrows errors, and clears loading', async () => {
    createUserWithEmailAndPassword.mockRejectedValue(new Error('email already in use'))

    const store = useAuthStore()
    await expect(store.signUp('a@b.com', 'bad')).rejects.toThrow('email already in use')
    expect(store.error).toBe('email already in use')
    expect(store.loading).toBe(false)
  })

  it('logIn calls signInWithEmailAndPassword and toggles loading', async () => {
    signInWithEmailAndPassword.mockResolvedValue({})
    const store = useAuthStore()

    const promise = store.logIn('a@b.com', 'password123')
    expect(store.loading).toBe(true)
    await promise

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'a@b.com', 'password123')
    expect(store.loading).toBe(false)
  })

  it('logInWithGoogle provisions a profile on first sign-in', async () => {
    getDoc.mockResolvedValue({ exists: () => false })
    signInWithPopup.mockResolvedValue({ user: { uid: 'u2', email: 'g@b.com' } })

    const store = useAuthStore()
    await store.logInWithGoogle()

    expect(signInWithPopup).toHaveBeenCalled()
    expect(store.profile).toMatchObject({ email: 'g@b.com' })
  })

  it('resetPassword delegates to sendPasswordResetEmail', async () => {
    const store = useAuthStore()
    await store.resetPassword('a@b.com')
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'a@b.com')
  })

  it('logOut delegates to signOut', async () => {
    const store = useAuthStore()
    await store.logOut()
    expect(signOut).toHaveBeenCalledWith({})
  })

  it('updateDailyCalorieGoal persists and updates local profile', async () => {
    const store = useAuthStore()
    store.user = { uid: 'u1' }
    store.profile = { dailyCalorieGoal: 2000 }

    await store.updateDailyCalorieGoal(1750)

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      { dailyCalorieGoal: 1750 },
      { merge: true },
    )
    expect(store.profile.dailyCalorieGoal).toBe(1750)
  })

  it('completeOnboarding updates the body profile and marks onboarding complete', async () => {
    const store = useAuthStore()
    store.user = { uid: 'u1' }
    store.profile = {}

    await store.completeOnboarding({
      gender: 'male',
      age: 30,
      heightCm: 180,
      activityLevel: 'moderate',
      weeklyRateLb: -1,
      dailyCalorieGoal: 2200,
    })

    expect(setDoc).toHaveBeenCalledTimes(2)
    expect(store.profile.onboardingComplete).toBe(true)
    expect(store.profile.dailyCalorieGoal).toBe(2200)
  })
})
