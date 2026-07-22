<script setup>
import { computed } from 'vue'
import LogEntryRow from '@/components/log/LogEntryRow.vue'
import { useLogStore } from '@/stores/log'

const props = defineProps({
  mealType: {
    type: String,
    required: true,
    validator: (value) => ['breakfast', 'lunch', 'dinner', 'snacks'].includes(value),
  },
  date: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['add-food'])

const logStore = useLogStore()
const entries = logStore.entriesForMeal(props.date, props.mealType)

const title = computed(() => props.mealType.charAt(0).toUpperCase() + props.mealType.slice(1))
const subtotal = computed(() => entries.value.reduce((sum, entry) => sum + entry.calories, 0))

function updateQuantity(entryId, quantity, caloriesPerServing) {
  logStore.updateLogEntryQuantity(entryId, quantity, caloriesPerServing)
}

function deleteEntry(entryId) {
  logStore.deleteLogEntry(entryId)
}
</script>

<template>
  <section class="meal-section">
    <header class="meal-section__header">
      <h2 class="meal-section__title">{{ title }}</h2>
      <span class="meal-section__subtotal">{{ subtotal }} cal</span>
    </header>

    <div v-if="entries.length" class="meal-section__entries">
      <LogEntryRow
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        @update-quantity="(qty) => updateQuantity(entry.id, qty, entry.caloriesPerServing)"
        @delete="deleteEntry(entry.id)"
      />
    </div>
    <p v-else class="meal-section__empty">No food logged yet.</p>

    <button class="meal-section__add" type="button" @click="$emit('add-food', mealType)">
      + Add food
    </button>
  </section>
</template>

<style scoped>
.meal-section {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
}

.meal-section + .meal-section {
  margin-top: var(--space-md);
}

.meal-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.meal-section__title {
  font-size: 1rem;
}

.meal-section__subtotal {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.meal-section__empty {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  padding: var(--space-sm) 0;
}

.meal-section__add {
  margin-top: var(--space-sm);
  width: 100%;
  background: none;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
}
</style>
