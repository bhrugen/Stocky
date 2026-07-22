import { describe, it, expect } from 'vitest'
import {
  ACTIVITY_LEVELS,
  calculateBmr,
  activityMultiplier,
  calculateTdee,
  calculateDailyGoal,
} from './calories'

describe('calculateBmr', () => {
  it('applies the male offset', () => {
    expect(calculateBmr({ gender: 'male', age: 30, heightCm: 180, weightKg: 80 })).toBeCloseTo(
      10 * 80 + 6.25 * 180 - 5 * 30 + 5,
    )
  })

  it('applies the female offset', () => {
    expect(calculateBmr({ gender: 'female', age: 30, heightCm: 165, weightKg: 60 })).toBeCloseTo(
      10 * 60 + 6.25 * 165 - 5 * 30 - 161,
    )
  })

  it('averages the offsets for other genders', () => {
    expect(calculateBmr({ gender: 'other', age: 30, heightCm: 170, weightKg: 70 })).toBeCloseTo(
      10 * 70 + 6.25 * 170 - 5 * 30 - 78,
    )
  })
})

describe('activityMultiplier', () => {
  it('returns the multiplier for a known level', () => {
    expect(activityMultiplier('moderate')).toBe(1.55)
  })

  it('falls back to sedentary for an unknown level', () => {
    expect(activityMultiplier('made-up-level')).toBe(1.2)
  })

  it('covers every declared activity level', () => {
    ACTIVITY_LEVELS.forEach((level) => {
      expect(activityMultiplier(level.value)).toBe(level.multiplier)
    })
  })
})

describe('calculateTdee', () => {
  it('multiplies BMR by the activity multiplier', () => {
    const params = { gender: 'male', age: 25, heightCm: 175, weightKg: 75, activityLevel: 'active' }
    expect(calculateTdee(params)).toBeCloseTo(calculateBmr(params) * 1.725)
  })
})

describe('calculateDailyGoal', () => {
  const base = { gender: 'male', age: 25, heightCm: 175, weightKg: 75, activityLevel: 'sedentary' }

  it('returns the rounded TDEE when maintaining weight', () => {
    const tdee = calculateTdee(base)
    expect(calculateDailyGoal({ ...base, weeklyRateLb: 0 })).toBe(Math.round(tdee))
  })

  it('subtracts 500 kcal/day per pound of weekly loss', () => {
    const tdee = calculateTdee(base)
    expect(calculateDailyGoal({ ...base, weeklyRateLb: -1 })).toBe(Math.round(tdee - 500))
  })

  it('adds calories for a weekly gain rate', () => {
    const tdee = calculateTdee(base)
    expect(calculateDailyGoal({ ...base, weeklyRateLb: 1 })).toBe(Math.round(tdee + 500))
  })

  it('never returns less than the 1200 kcal floor', () => {
    expect(
      calculateDailyGoal({
        gender: 'female',
        age: 25,
        heightCm: 150,
        weightKg: 45,
        activityLevel: 'sedentary',
        weeklyRateLb: -3,
      }),
    ).toBe(1200)
  })
})
