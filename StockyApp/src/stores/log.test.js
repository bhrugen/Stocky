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
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

import { addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { useLogStore, MEAL_TYPES } from './log'
import { useAuthStore } from './auth'

describe('MEAL_TYPES', () => {
  it('lists the four expected meal types', () => {
    expect(MEAL_TYPES).toEqual(['breakfast', 'lunch', 'dinner', 'snacks'])
  })
})

describe('useLogStore derived getters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('entriesFor returns entries for a date, empty array otherwise', () => {
    const store = useLogStore()
    store.entriesByDate = { '2026-07-22': [{ id: '1', calories: 100 }] }
    expect(store.entriesFor('2026-07-22').value).toEqual([{ id: '1', calories: 100 }])
    expect(store.entriesFor('2026-07-21').value).toEqual([])
  })

  it('totalFor sums calories for a date', () => {
    const store = useLogStore()
    store.entriesByDate = {
      '2026-07-22': [{ calories: 100 }, { calories: 250 }],
    }
    expect(store.totalFor('2026-07-22').value).toBe(350)
    expect(store.totalFor('2026-07-21').value).toBe(0)
  })

  it('entriesForMeal filters by mealType within a date', () => {
    const store = useLogStore()
    store.entriesByDate = {
      '2026-07-22': [
        { mealType: 'breakfast', calories: 100 },
        { mealType: 'lunch', calories: 200 },
        { mealType: 'breakfast', calories: 50 },
      ],
    }
    expect(store.entriesForMeal('2026-07-22', 'breakfast').value).toEqual([
      { mealType: 'breakfast', calories: 100 },
      { mealType: 'breakfast', calories: 50 },
    ])
  })
})

describe('useLogStore subscriptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('subscribeToDate is a no-op without an authenticated user', () => {
    const store = useLogStore()
    store.subscribeToDate('2026-07-22')
    expect(onSnapshot).not.toHaveBeenCalled()
  })

  it('subscribeToDate populates entriesByDate for that date', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    onSnapshot.mockImplementationOnce((query, onNext) => {
      onNext({
        docs: [
          { id: 'e1', data: () => ({ date: '2026-07-22', calories: 300, mealType: 'lunch' }) },
        ],
      })
      return unsubscribeSpy
    })

    const store = useLogStore()
    store.subscribeToDate('2026-07-22')

    expect(store.entriesByDate['2026-07-22']).toEqual([
      { id: 'e1', date: '2026-07-22', calories: 300, mealType: 'lunch' },
    ])
    expect(store.loading).toBe(false)
  })

  it('subscribeToDate does not attach a second listener for the same date', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useLogStore()

    store.subscribeToDate('2026-07-22')
    store.subscribeToDate('2026-07-22')

    expect(onSnapshot).toHaveBeenCalledTimes(1)
  })

  it('unsubscribeAll clears every date subscription and entriesByDate', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useLogStore()
    store.subscribeToDate('2026-07-22')
    store.subscribeToDate('2026-07-23')

    store.unsubscribeAll()

    expect(unsubscribeSpy).toHaveBeenCalledTimes(2)
    expect(store.entriesByDate).toEqual({})
  })

  it('subscribeHistory aggregates calories per date across entries', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    onSnapshot.mockImplementationOnce((query, onNext) => {
      onNext({
        docs: [
          { data: () => ({ date: '2026-07-22', calories: 300 }) },
          { data: () => ({ date: '2026-07-22', calories: 200 }) },
          { data: () => ({ date: '2026-07-21', calories: 400 }) },
        ],
      })
      return unsubscribeSpy
    })

    const store = useLogStore()
    store.subscribeHistory()

    expect(store.historyTotals).toEqual([
      { date: '2026-07-22', total: 500 },
      { date: '2026-07-21', total: 400 },
    ])
  })

  it('unsubscribeHistory clears historyTotals', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useLogStore()
    store.subscribeHistory()
    store.historyTotals = [{ date: '2026-07-22', total: 500 }]

    store.unsubscribeHistory()

    expect(store.historyTotals).toEqual([])
  })
})

describe('useLogStore mutations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('addLogEntry writes a computed calories field based on quantity', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useLogStore()

    await store.addLogEntry({
      date: '2026-07-22',
      mealType: 'lunch',
      item: { id: 'f1', name: 'Chicken Breast', calories: 165, servingSize: '100g' },
      quantity: 1.5,
    })

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        date: '2026-07-22',
        mealType: 'lunch',
        itemId: 'f1',
        itemName: 'Chicken Breast',
        caloriesPerServing: 165,
        quantity: 1.5,
        calories: Math.round(165 * 1.5),
      }),
    )
  })

  it('updateLogEntryQuantity recomputes calories from quantity', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useLogStore()

    await store.updateLogEntryQuantity('entry-1', 2, 105)

    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { quantity: 2, calories: 210 })
  })

  it('deleteLogEntry calls deleteDoc', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useLogStore()

    await store.deleteLogEntry('entry-1')

    expect(deleteDoc).toHaveBeenCalled()
  })
})
