import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLogStore } from '@/stores/log'

export function useDailyTotals(dateIso) {
  const authStore = useAuthStore()
  const logStore = useLogStore()

  const total = logStore.totalFor(dateIso)
  const goal = computed(() => authStore.dailyCalorieGoal)
  const remaining = computed(() => goal.value - total.value)
  const percentConsumed = computed(() =>
    goal.value > 0 ? Math.min(100, Math.round((total.value / goal.value) * 100)) : 0,
  )
  const isOverGoal = computed(() => total.value > goal.value)

  return { total, goal, remaining, percentConsumed, isOverGoal }
}
