<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import RangeSlider from '@/components/common/RangeSlider.vue'
import { ACTIVITY_LEVELS } from '@/utils/calories'
import { lbToKg, kgToLb, feetInchesToCm, cmToFeetInches } from '@/utils/units'
import { useCalorieGoal } from '@/composables/useCalorieGoal'

const props = defineProps({
  weightUnit: {
    type: String,
    required: true,
  },
  initial: {
    type: Object,
    default: () => ({}),
  },
  submitLabel: {
    type: String,
    default: 'Save',
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const gender = ref(props.initial.gender ?? '')
const age = ref(props.initial.age ?? '')
const activityLevel = ref(props.initial.activityLevel ?? '')
const weeklyRateLb = ref(props.initial.weeklyRateLb ?? 0)

const initialHeightCm = props.initial.heightCm ?? null
const initialFeetInches = initialHeightCm
  ? cmToFeetInches(initialHeightCm)
  : { feet: '', inches: '' }
const feet = ref(initialFeetInches.feet)
const inches = ref(initialFeetInches.inches)
const heightCmInput = ref(initialHeightCm ?? '')

const initialWeightLb = props.initial.weightKg ? kgToLb(props.initial.weightKg) : null
const weightInput = ref(
  props.weightUnit === 'lb'
    ? initialWeightLb
      ? Math.round(initialWeightLb)
      : ''
    : (props.initial.weightKg ?? ''),
)

const heightCm = computed(() => {
  if (props.weightUnit === 'lb') {
    if (!feet.value) return null
    return feetInchesToCm(Number(feet.value), Number(inches.value) || 0)
  }
  return heightCmInput.value ? Number(heightCmInput.value) : null
})

const weightKg = computed(() => {
  if (!weightInput.value) return null
  return props.weightUnit === 'lb' ? lbToKg(Number(weightInput.value)) : Number(weightInput.value)
})

const { isComplete, tdee, dailyGoal } = useCalorieGoal({
  gender,
  age,
  heightCm,
  weightKg,
  activityLevel,
  weeklyRateLb,
})

function rateLabel(value) {
  if (value === 0) return 'Maintain weight'
  const direction = value > 0 ? 'Gain' : 'Lose'
  return `${direction} ${Math.abs(value)} lb/week`
}

function handleSubmit() {
  if (!isComplete.value) return
  emit('submit', {
    gender: gender.value,
    age: Number(age.value),
    heightCm: Math.round(heightCm.value),
    weightKg: weightKg.value,
    activityLevel: activityLevel.value,
    weeklyRateLb: weeklyRateLb.value,
    dailyCalorieGoal: dailyGoal.value,
  })
}

watch(
  () => props.initial,
  (next) => {
    gender.value = next.gender ?? gender.value
    age.value = next.age ?? age.value
    activityLevel.value = next.activityLevel ?? activityLevel.value
    weeklyRateLb.value = next.weeklyRateLb ?? weeklyRateLb.value
  },
)
</script>

<template>
  <form class="calorie-goal-form" @submit.prevent="handleSubmit">
    <label class="calorie-goal-form__field">
      <span class="calorie-goal-form__label">Gender</span>
      <select v-model="gender" class="calorie-goal-form__select" required>
        <option value="" disabled>Select…</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </label>

    <BaseInput v-model="age" label="Age" type="number" min="10" max="100" required />

    <div v-if="weightUnit === 'lb'" class="calorie-goal-form__row">
      <BaseInput v-model="feet" label="Height (ft)" type="number" min="0" max="8" required />
      <BaseInput v-model="inches" label="Height (in)" type="number" min="0" max="11" />
    </div>
    <BaseInput v-else v-model="heightCmInput" label="Height (cm)" type="number" min="0" required />

    <BaseInput
      v-model="weightInput"
      :label="`Current weight (${weightUnit})`"
      type="number"
      min="0"
      step="0.1"
      required
    />

    <label class="calorie-goal-form__field">
      <span class="calorie-goal-form__label">Activity level</span>
      <select v-model="activityLevel" class="calorie-goal-form__select" required>
        <option value="" disabled>Select…</option>
        <option v-for="level in ACTIVITY_LEVELS" :key="level.value" :value="level.value">
          {{ level.label }}
        </option>
      </select>
    </label>

    <RangeSlider
      v-model="weeklyRateLb"
      :min="-2"
      :max="2"
      :step="0.5"
      label="Goal pace"
      :format-value="rateLabel"
    />

    <div v-if="isComplete" class="calorie-goal-form__preview">
      <p class="calorie-goal-form__preview-goal">{{ dailyGoal }} cal/day</p>
      <p class="calorie-goal-form__preview-meta">Maintenance is ~{{ tdee }} cal/day</p>
    </div>

    <BaseButton type="submit" full-width :disabled="!isComplete || saving">
      {{ saving ? 'Saving…' : submitLabel }}
    </BaseButton>
  </form>
</template>

<style scoped>
.calorie-goal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.calorie-goal-form__row {
  display: flex;
  gap: var(--space-md);
}

.calorie-goal-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.calorie-goal-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.calorie-goal-form__select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1rem;
}

.calorie-goal-form__preview {
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  text-align: center;
}

.calorie-goal-form__preview-goal {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.calorie-goal-form__preview-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
</style>
