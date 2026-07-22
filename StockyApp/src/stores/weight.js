import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

export const useWeightStore = defineStore('weight', () => {
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => b.date.localeCompare(a.date)),
  )

  function subscribe() {
    const authStore = useAuthStore()
    if (!authStore.user || unsubscribe) return
    loading.value = true
    const entriesQuery = query(
      collection(db, 'users', authStore.user.uid, 'weightEntries'),
      orderBy('date', 'desc'),
    )
    unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        entries.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        loading.value = false
      },
      (err) => {
        error.value = err.message
        loading.value = false
      },
    )
  }

  function unsubscribeAll() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    entries.value = []
  }

  async function addWeightEntry({ date, weight, unit }) {
    const authStore = useAuthStore()
    await addDoc(collection(db, 'users', authStore.user.uid, 'weightEntries'), {
      date,
      weight,
      unit,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteWeightEntry(entryId) {
    const authStore = useAuthStore()
    await deleteDoc(doc(db, 'users', authStore.user.uid, 'weightEntries', entryId))
  }

  return {
    entries,
    sortedEntries,
    loading,
    error,
    subscribe,
    unsubscribeAll,
    addWeightEntry,
    deleteWeightEntry,
  }
})
