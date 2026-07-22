import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const dailyCalorieGoal = computed(() => profile.value?.dailyCalorieGoal ?? 2000)
  const weightUnit = computed(() => profile.value?.weightUnit ?? 'lb')

  async function ensureProfile(firebaseUser) {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const initial = {
        email: firebaseUser.email,
        dailyCalorieGoal: 2000,
        weightUnit: 'lb',
        createdAt: serverTimestamp(),
      }
      await setDoc(ref, initial)
      profile.value = initial
    } else {
      profile.value = snap.data()
    }
  }

  function startAuthListener() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser
        if (firebaseUser) {
          await ensureProfile(firebaseUser)
        } else {
          profile.value = null
        }
        initialized.value = true
        resolve()
      })
    })
  }

  async function signUp(email, password) {
    loading.value = true
    error.value = null
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await ensureProfile(cred.user)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logIn(email, password) {
    loading.value = true
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logInWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      await ensureProfile(cred.user)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email) {
    error.value = null
    await sendPasswordResetEmail(auth, email)
  }

  async function logOut() {
    await signOut(auth)
  }

  async function updateDailyCalorieGoal(goal) {
    const ref = doc(db, 'users', user.value.uid)
    await setDoc(ref, { dailyCalorieGoal: goal }, { merge: true })
    profile.value = { ...profile.value, dailyCalorieGoal: goal }
  }

  async function updateWeightUnit(unit) {
    const ref = doc(db, 'users', user.value.uid)
    await setDoc(ref, { weightUnit: unit }, { merge: true })
    profile.value = { ...profile.value, weightUnit: unit }
  }

  return {
    user,
    profile,
    initialized,
    loading,
    error,
    isAuthenticated,
    dailyCalorieGoal,
    weightUnit,
    startAuthListener,
    signUp,
    logIn,
    logInWithGoogle,
    resetPassword,
    logOut,
    updateDailyCalorieGoal,
    updateWeightUnit,
  }
})
