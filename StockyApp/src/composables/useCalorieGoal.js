import { computed } from 'vue'
import { calculateDailyGoal, calculateTdee } from '@/utils/calories'

// inputs: an object of refs/computeds — { gender, age, heightCm, weightKg, activityLevel, weeklyRateLb }
export function useCalorieGoal(inputs) {
  const isComplete = computed(
    () =>
      !!inputs.gender.value &&
      !!inputs.age.value &&
      !!inputs.heightCm.value &&
      !!inputs.weightKg.value &&
      !!inputs.activityLevel.value,
  )

  const tdee = computed(() => {
    if (!isComplete.value) return null
    return Math.round(
      calculateTdee({
        gender: inputs.gender.value,
        age: Number(inputs.age.value),
        heightCm: Number(inputs.heightCm.value),
        weightKg: Number(inputs.weightKg.value),
        activityLevel: inputs.activityLevel.value,
      }),
    )
  })

  const dailyGoal = computed(() => {
    if (!isComplete.value) return null
    return calculateDailyGoal({
      gender: inputs.gender.value,
      age: Number(inputs.age.value),
      heightCm: Number(inputs.heightCm.value),
      weightKg: Number(inputs.weightKg.value),
      activityLevel: inputs.activityLevel.value,
      weeklyRateLb: Number(inputs.weeklyRateLb.value),
    })
  })

  return { isComplete, tdee, dailyGoal }
}
