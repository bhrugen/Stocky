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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

export const useFoodItemsStore = defineStore('foodItems', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  const sortedItems = computed(() => [...items.value].sort((a, b) => a.name.localeCompare(b.name)))

  function subscribe() {
    const authStore = useAuthStore()
    if (!authStore.user || unsubscribe) return
    loading.value = true
    const itemsQuery = query(
      collection(db, 'users', authStore.user.uid, 'foodItems'),
      orderBy('name'),
    )
    unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        items.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
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
    items.value = []
  }

  async function addFoodItem({ name, calories, servingSize }) {
    const authStore = useAuthStore()
    const docRef = await addDoc(collection(db, 'users', authStore.user.uid, 'foodItems'), {
      name,
      calories,
      servingSize,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  }

  async function updateFoodItem(itemId, { name, calories, servingSize }) {
    const authStore = useAuthStore()
    await updateDoc(doc(db, 'users', authStore.user.uid, 'foodItems', itemId), {
      name,
      calories,
      servingSize,
    })
  }

  async function deleteFoodItem(itemId) {
    const authStore = useAuthStore()
    await deleteDoc(doc(db, 'users', authStore.user.uid, 'foodItems', itemId))
  }

  return {
    items,
    sortedItems,
    loading,
    error,
    subscribe,
    unsubscribeAll,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
  }
})
