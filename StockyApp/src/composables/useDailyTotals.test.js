import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDailyTotals } from './useDailyTotals'
import { useAuthStore } from '@/stores/auth'
import { useLogStore } from '@/stores/log'

describe('useDailyTotals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('computes remaining and percentConsumed under goal', () => {
    const authStore = useAuthStore()
    const logStore = useLogStore()
    authStore.profile = { dailyCalorieGoal: 2000 }
    logStore.entriesByDate = {
      '2026-07-22': [{ calories: 500 }, { calories: 300 }],
    }

    const { total, goal, remaining, percentConsumed, isOverGoal } = useDailyTotals('2026-07-22')

    expect(total.value).toBe(800)
    expect(goal.value).toBe(2000)
    expect(remaining.value).toBe(1200)
    expect(percentConsumed.value).toBe(40)
    expect(isOverGoal.value).toBe(false)
  })

  it('flags isOverGoal and caps percentConsumed at 100 when over goal', () => {
    const authStore = useAuthStore()
    const logStore = useLogStore()
    authStore.profile = { dailyCalorieGoal: 1000 }
    logStore.entriesByDate = {
      '2026-07-22': [{ calories: 1500 }],
    }

    const { remaining, percentConsumed, isOverGoal } = useDailyTotals('2026-07-22')

    expect(remaining.value).toBe(-500)
    expect(percentConsumed.value).toBe(100)
    expect(isOverGoal.value).toBe(true)
  })

  it('defaults to a 2000 calorie goal when no profile is set', () => {
    useLogStore()
    const { goal } = useDailyTotals('2026-07-22')
    expect(goal.value).toBe(2000)
  })

  it('returns zero total for a date with no entries', () => {
    useAuthStore()
    useLogStore()
    const { total, remaining } = useDailyTotals('2099-01-01')
    expect(total.value).toBe(0)
    expect(remaining.value).toBe(2000)
  })
})
