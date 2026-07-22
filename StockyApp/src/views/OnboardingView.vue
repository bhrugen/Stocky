<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CalorieGoalForm from '@/components/goal/CalorieGoalForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useWeightStore } from '@/stores/weight'
import { todayIso } from '@/utils/date'
import { kgToLb } from '@/utils/units'

const authStore = useAuthStore()
const weightStore = useWeightStore()
const router = useRouter()
const saving = ref(false)
const error = ref('')

async function handleSubmit(payload) {
  saving.value = true
  error.value = ''
  try {
    await authStore.completeOnboarding(payload)
    await weightStore.addWeightEntry({
      date: todayIso(),
      weight:
        authStore.weightUnit === 'lb'
          ? Math.round(kgToLb(payload.weightKg) * 10) / 10
          : Math.round(payload.weightKg * 10) / 10,
      unit: authStore.weightUnit,
    })
    router.replace({ name: 'today' })
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="onboarding-view">
    <header class="onboarding-view__header">
      <h1 class="onboarding-view__title">Let's set your goal</h1>
      <p class="onboarding-view__subtitle">
        Tell us about yourself so we can calculate a daily calorie target.
      </p>
    </header>

    <CalorieGoalForm
      :weight-unit="authStore.weightUnit"
      submit-label="Get started"
      :saving="saving"
      @submit="handleSubmit"
    />

    <p v-if="error" class="onboarding-view__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.onboarding-view {
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.onboarding-view__title {
  font-size: 1.5rem;
}

.onboarding-view__subtitle {
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.onboarding-view__error {
  color: var(--color-danger);
  font-size: 0.875rem;
}
</style>
