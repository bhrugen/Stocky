<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="base-button"
    :class="[`base-button--${variant}`, { 'base-button--full': fullWidth }]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s,
    opacity 0.15s;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--full {
  width: 100%;
}

.base-button--primary {
  background: var(--color-primary);
  color: #fff;
}

.base-button--secondary {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.base-button--danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.base-button--ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
</style>
