export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { value: 'light', label: 'Light (exercise 1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)', multiplier: 1.55 },
  { value: 'active', label: 'Active (exercise 6-7 days/week)', multiplier: 1.725 },
  { value: 'very_active', label: 'Very active (hard exercise daily)', multiplier: 1.9 },
]

const CALORIES_PER_LB = 500 // ~3500 kcal/lb spread across 7 days
const MIN_DAILY_CALORIES = 1200

// Mifflin-St Jeor equation
export function calculateBmr({ gender, age, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (gender === 'male') return base + 5
  if (gender === 'female') return base - 161
  return base - 78 // average of the male/female offsets
}

export function activityMultiplier(activityLevel) {
  return ACTIVITY_LEVELS.find((level) => level.value === activityLevel)?.multiplier ?? 1.2
}

export function calculateTdee({ gender, age, heightCm, weightKg, activityLevel }) {
  return calculateBmr({ gender, age, heightCm, weightKg }) * activityMultiplier(activityLevel)
}

// weeklyRateLb: negative to lose, positive to gain, 0 to maintain
export function calculateDailyGoal({
  gender,
  age,
  heightCm,
  weightKg,
  activityLevel,
  weeklyRateLb,
}) {
  const tdee = calculateTdee({ gender, age, heightCm, weightKg, activityLevel })
  const goal = tdee + weeklyRateLb * CALORIES_PER_LB
  return Math.max(MIN_DAILY_CALORIES, Math.round(goal))
}
