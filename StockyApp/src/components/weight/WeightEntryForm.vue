<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { todayIso } from '@/utils/date'

defineProps({
  unit: {
    type: String,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const date = ref(todayIso())
const weight = ref('')

function handleSubmit() {
  const value = Number(weight.value)
  if (!value || value <= 0) return
  emit('submit', { date: date.value, weight: value })
  weight.value = ''
}
</script>

<template>
  <form class="weight-entry-form" @submit.prevent="handleSubmit">
    <BaseInput v-model="date" label="Date" type="date" required />
    <BaseInput
      v-model="weight"
      :label="`Weight (${unit})`"
      type="number"
      min="0"
      step="0.1"
      required
    />
    <BaseButton type="submit" full-width :disabled="saving">
      {{ saving ? 'Saving…' : 'Add entry' }}
    </BaseButton>
  </form>
</template>

<style scoped>
.weight-entry-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}
</style>
