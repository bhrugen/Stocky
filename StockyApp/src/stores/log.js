import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks']

export const useLogStore = defineStore('log', () => {
  const entriesByDate = ref({})
  const loading = ref(false)
  const error = ref(null)
  const subscriptions = new Map()
  const historyTotals = ref([])
  let historyUnsubscribe = null

  function subscribeHistory() {
    const authStore = useAuthStore()
    if (!authStore.user || historyUnsubscribe) return
    const historyQuery = query(
      collection(db, 'users', authStore.user.uid, 'logEntries'),
      orderBy('date', 'desc'),
    )
    historyUnsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const totalsByDate = new Map()
      snapshot.docs.forEach((d) => {
        const entry = d.data()
        totalsByDate.set(entry.date, (totalsByDate.get(entry.date) ?? 0) + entry.calories)
      })
      historyTotals.value = Array.from(totalsByDate, ([date, total]) => ({ date, total })).sort(
        (a, b) => b.date.localeCompare(a.date),
      )
    })
  }

  function unsubscribeHistory() {
    if (historyUnsubscribe) {
      historyUnsubscribe()
      historyUnsubscribe = null
    }
    historyTotals.value = []
  }

  function entriesFor(dateIso) {
    return computed(() => entriesByDate.value[dateIso] ?? [])
  }

  function totalFor(dateIso) {
    return computed(() =>
      (entriesByDate.value[dateIso] ?? []).reduce((sum, entry) => sum + entry.calories, 0),
    )
  }

  function entriesForMeal(dateIso, mealType) {
    return computed(() =>
      (entriesByDate.value[dateIso] ?? []).filter((entry) => entry.mealType === mealType),
    )
  }

  function subscribeToDate(dateIso) {
    const authStore = useAuthStore()
    if (!authStore.user || subscriptions.has(dateIso)) return
    loading.value = true
    const entriesQuery = query(
      collection(db, 'users', authStore.user.uid, 'logEntries'),
      where('date', '==', dateIso),
    )
    const unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        entriesByDate.value = {
          ...entriesByDate.value,
          [dateIso]: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
        }
        loading.value = false
      },
      (err) => {
        error.value = err.message
        loading.value = false
      },
    )
    subscriptions.set(dateIso, unsubscribe)
  }

  function unsubscribeAll() {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    subscriptions.clear()
    entriesByDate.value = {}
  }

  async function addLogEntry({ date, mealType, item, quantity }) {
    const authStore = useAuthStore()
    await addDoc(collection(db, 'users', authStore.user.uid, 'logEntries'), {
      date,
      mealType,
      itemId: item.id,
      itemName: item.name,
      caloriesPerServing: item.calories,
      servingSize: item.servingSize,
      quantity,
      calories: Math.round(item.calories * quantity),
      createdAt: serverTimestamp(),
    })
  }

  async function updateLogEntryQuantity(entryId, quantity, caloriesPerServing) {
    const authStore = useAuthStore()
    await updateDoc(doc(db, 'users', authStore.user.uid, 'logEntries', entryId), {
      quantity,
      calories: Math.round(caloriesPerServing * quantity),
    })
  }

  async function deleteLogEntry(entryId) {
    const authStore = useAuthStore()
    await deleteDoc(doc(db, 'users', authStore.user.uid, 'logEntries', entryId))
  }

  return {
    entriesByDate,
    historyTotals,
    loading,
    error,
    entriesFor,
    totalFor,
    entriesForMeal,
    subscribeToDate,
    subscribeHistory,
    unsubscribeHistory,
    unsubscribeAll,
    addLogEntry,
    updateLogEntryQuantity,
    deleteLogEntry,
  }
})
