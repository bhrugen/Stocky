import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/firebase', () => ({ db: {} }))

const unsubscribeSpy = vi.fn()
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((...args) => ({ path: args.slice(1).join('/') })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((...args) => ({ path: args.slice(1).join('/') })),
  onSnapshot: vi.fn((query, onNext) => {
    onNext({ docs: [] })
    return unsubscribeSpy
  }),
  query: vi.fn((...args) => args),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

import { addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { useFoodItemsStore } from './foodItems'
import { useAuthStore } from './auth'

describe('useFoodItemsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('sortedItems sorts alphabetically by name', () => {
    const store = useFoodItemsStore()
    store.items = [{ name: 'Chicken' }, { name: 'Apple' }, { name: 'Banana' }]
    expect(store.sortedItems.map((i) => i.name)).toEqual(['Apple', 'Banana', 'Chicken'])
  })

  it('subscribe is a no-op without an authenticated user', () => {
    const store = useFoodItemsStore()
    store.subscribe()
    expect(onSnapshot).not.toHaveBeenCalled()
  })

  it('subscribe populates items from the snapshot once authenticated', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    onSnapshot.mockImplementationOnce((query, onNext) => {
      onNext({ docs: [{ id: '1', data: () => ({ name: 'Banana', calories: 105 }) }] })
      return unsubscribeSpy
    })

    const store = useFoodItemsStore()
    store.subscribe()

    expect(store.loading).toBe(false)
    expect(store.items).toEqual([{ id: '1', name: 'Banana', calories: 105 }])
  })

  it('subscribe only attaches one listener even if called twice', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useFoodItemsStore()

    store.subscribe()
    store.subscribe()

    expect(onSnapshot).toHaveBeenCalledTimes(1)
  })

  it('unsubscribeAll clears items and calls the stored unsubscribe function', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useFoodItemsStore()
    store.subscribe()
    store.items = [{ id: '1', name: 'Banana' }]

    store.unsubscribeAll()

    expect(unsubscribeSpy).toHaveBeenCalled()
    expect(store.items).toEqual([])
  })

  it('addFoodItem writes to firestore and returns the new doc id', async () => {
    addDoc.mockResolvedValue({ id: 'new-id' })
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useFoodItemsStore()

    const id = await store.addFoodItem({ name: 'Banana', calories: 105, servingSize: '1 medium' })

    expect(id).toBe('new-id')
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'Banana', calories: 105, servingSize: '1 medium' }),
    )
  })

  it('updateFoodItem writes the updated fields', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useFoodItemsStore()

    await store.updateFoodItem('item-1', { name: 'Bread', calories: 80, servingSize: '1 slice' })

    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      name: 'Bread',
      calories: 80,
      servingSize: '1 slice',
    })
  })

  it('deleteFoodItem calls deleteDoc', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useFoodItemsStore()

    await store.deleteFoodItem('item-1')

    expect(deleteDoc).toHaveBeenCalled()
  })
})
