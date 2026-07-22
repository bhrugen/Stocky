<script setup>
defineProps({
  label: {
    type: String,
    default: 'Loading…',
  },
})
</script>

<template>
  <div class="loading-spinner">
    <div class="loading-spinner__icon" role="status" aria-live="polite" />
    <span v-if="label" class="loading-spinner__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  color: var(--color-text-muted);
}

.loading-spinner__icon {
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
