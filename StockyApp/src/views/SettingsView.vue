<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const goal = ref(authStore.dailyCalorieGoal)
const unit = ref(authStore.weightUnit)
const saving = ref(false)
const saved = ref(false)

watch(
  () => authStore.dailyCalorieGoal,
  (value) => (goal.value = value),
)
watch(
  () => authStore.weightUnit,
  (value) => (unit.value = value),
)

async function saveGoal() {
  const value = Number(goal.value)
  if (!value || value <= 0) return
  saving.value = true
  saved.value = false
  try {
    await authStore.updateDailyCalorieGoal(value)
    saved.value = true
  } finally {
    saving.value = false
  }
}

async function setUnit(next) {
  unit.value = next
  await authStore.updateWeightUnit(next)
}

async function handleLogOut() {
  await authStore.logOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-view__header">
      <h1 class="settings-view__title">Settings</h1>
    </header>

    <section class="settings-view__section">
      <p class="settings-view__label">Account</p>
      <p class="settings-view__email">{{ authStore.user?.email }}</p>
    </section>

    <section class="settings-view__section">
      <form class="settings-view__form" @submit.prevent="saveGoal">
        <BaseInput v-model="goal" label="Daily calorie goal" type="number" min="1" required />
        <p v-if="saved" class="settings-view__success">Goal updated.</p>
        <BaseButton type="submit" full-width :disabled="saving">
          {{ saving ? 'Saving…' : 'Save goal' }}
        </BaseButton>
      </form>
    </section>

    <section class="settings-view__section">
      <p class="settings-view__label">Weight unit</p>
      <div class="settings-view__unit-toggle">
        <button
          type="button"
          class="settings-view__unit-option"
          :class="{ 'settings-view__unit-option--active': unit === 'lb' }"
          @click="setUnit('lb')"
        >
          lb
        </button>
        <button
          type="button"
          class="settings-view__unit-option"
          :class="{ 'settings-view__unit-option--active': unit === 'kg' }"
          @click="setUnit('kg')"
        >
          kg
        </button>
      </div>
    </section>

    <BaseButton variant="ghost" full-width @click="handleLogOut">Log out</BaseButton>
  </div>
</template>

<style scoped>
.settings-view {
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-height) + var(--space-lg));
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.settings-view__title {
  font-size: 1.25rem;
}

.settings-view__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.settings-view__label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.settings-view__email {
  font-weight: 500;
}

.settings-view__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.settings-view__success {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.settings-view__unit-toggle {
  display: flex;
  gap: var(--space-sm);
}

.settings-view__unit-option {
  flex: 1;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  font-weight: 600;
}

.settings-view__unit-option--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>
