import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/firebase', () => ({ db: {} }))

const unsubscribeSpy = vi.fn()
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((...args) => ({ path: args.slice(1).join('/') })),
  addDoc: vi.fn(),
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

import { addDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { useWeightStore } from './weight'
import { useAuthStore } from './auth'

describe('useWeightStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('sortedEntries orders by date descending', () => {
    const store = useWeightStore()
    store.entries = [
      { date: '2026-07-01', weight: 180 },
      { date: '2026-07-20', weight: 178 },
      { date: '2026-07-10', weight: 179 },
    ]
    expect(store.sortedEntries.map((e) => e.date)).toEqual([
      '2026-07-20',
      '2026-07-10',
      '2026-07-01',
    ])
  })

  it('subscribe is a no-op without an authenticated user', () => {
    const store = useWeightStore()
    store.subscribe()
    expect(onSnapshot).not.toHaveBeenCalled()
  })

  it('subscribe populates entries from the snapshot', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    onSnapshot.mockImplementationOnce((query, onNext) => {
      onNext({
        docs: [{ id: 'e1', data: () => ({ date: '2026-07-20', weight: 178, unit: 'lb' }) }],
      })
      return unsubscribeSpy
    })

    const store = useWeightStore()
    store.subscribe()

    expect(store.entries).toEqual([{ id: 'e1', date: '2026-07-20', weight: 178, unit: 'lb' }])
    expect(store.loading).toBe(false)
  })

  it('unsubscribeAll clears entries', () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useWeightStore()
    store.subscribe()
    store.entries = [{ id: 'e1', date: '2026-07-20', weight: 178 }]

    store.unsubscribeAll()

    expect(unsubscribeSpy).toHaveBeenCalled()
    expect(store.entries).toEqual([])
  })

  it('addWeightEntry writes to firestore', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useWeightStore()

    await store.addWeightEntry({ date: '2026-07-22', weight: 177, unit: 'lb' })

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ date: '2026-07-22', weight: 177, unit: 'lb' }),
    )
  })

  it('deleteWeightEntry calls deleteDoc', async () => {
    const authStore = useAuthStore()
    authStore.user = { uid: 'u1' }
    const store = useWeightStore()

    await store.deleteWeightEntry('e1')

    expect(deleteDoc).toHaveBeenCalled()
  })
})
