<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div class="base-modal-overlay" @click.self="$emit('close')">
      <div class="base-modal" role="dialog" aria-modal="true">
        <header class="base-modal__header">
          <h2 class="base-modal__title">{{ title }}</h2>
          <button
            class="base-modal__close"
            type="button"
            aria-label="Close"
            @click="$emit('close')"
          >
            &times;
          </button>
        </header>
        <div class="base-modal__body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.base-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.base-modal {
  background: var(--color-surface);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-lg);
}

@media (min-width: 480px) {
  .base-modal-overlay {
    align-items: center;
  }

  .base-modal {
    border-radius: var(--radius-lg);
  }
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.base-modal__title {
  font-size: 1.1rem;
}

.base-modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-muted);
}
</style>
