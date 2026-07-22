<script setup>
import { formatDisplayDate } from '@/utils/date'

defineProps({
  entries: {
    type: Array,
    required: true,
  },
})

defineEmits(['delete'])
</script>

<template>
  <ul class="weight-history-list">
    <li v-for="entry in entries" :key="entry.id" class="weight-history-list__row">
      <span class="weight-history-list__date">{{ formatDisplayDate(entry.date) }}</span>
      <span class="weight-history-list__value">{{ entry.weight }} {{ entry.unit }}</span>
      <button
        class="weight-history-list__delete"
        type="button"
        aria-label="Delete entry"
        @click="$emit('delete', entry.id)"
      >
        &times;
      </button>
    </li>
    <li v-if="entries.length === 0" class="weight-history-list__empty">No weight entries yet.</li>
  </ul>
</template>

<style scoped>
.weight-history-list {
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.weight-history-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.weight-history-list__row:last-child {
  border-bottom: none;
}

.weight-history-list__value {
  font-weight: 600;
  flex: 1;
  text-align: right;
}

.weight-history-list__delete {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.weight-history-list__empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
