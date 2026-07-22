import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useCalorieGoal } from './useCalorieGoal'
import { calculateDailyGoal, calculateTdee } from '@/utils/calories'

function makeInputs(overrides = {}) {
  return {
    gender: ref('male'),
    age: ref(30),
    heightCm: ref(180),
    weightKg: ref(80),
    activityLevel: ref('moderate'),
    weeklyRateLb: ref(0),
    ...overrides,
  }
}

describe('useCalorieGoal', () => {
  it('is incomplete when a required field is missing', () => {
    const inputs = makeInputs({ age: ref(null) })
    const { isComplete, tdee, dailyGoal } = useCalorieGoal(inputs)
    expect(isComplete.value).toBe(false)
    expect(tdee.value).toBeNull()
    expect(dailyGoal.value).toBeNull()
  })

  it('computes tdee and dailyGoal once all fields are present', () => {
    const inputs = makeInputs()
    const { isComplete, tdee, dailyGoal } = useCalorieGoal(inputs)
    expect(isComplete.value).toBe(true)

    const params = {
      gender: 'male',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: 'moderate',
    }
    expect(tdee.value).toBe(Math.round(calculateTdee(params)))
    expect(dailyGoal.value).toBe(calculateDailyGoal({ ...params, weeklyRateLb: 0 }))
  })

  it('reacts to input changes', () => {
    const inputs = makeInputs()
    const { dailyGoal } = useCalorieGoal(inputs)
    const before = dailyGoal.value
    inputs.weeklyRateLb.value = -1
    expect(dailyGoal.value).toBe(before - 500)
  })

  it('coerces string-valued refs to numbers', () => {
    const inputs = makeInputs({ age: ref('30'), heightCm: ref('180'), weightKg: ref('80') })
    const { tdee } = useCalorieGoal(inputs)
    expect(tdee.value).toBe(
      Math.round(
        calculateTdee({
          gender: 'male',
          age: 30,
          heightCm: 180,
          weightKg: 80,
          activityLevel: 'moderate',
        }),
      ),
    )
  })
})
