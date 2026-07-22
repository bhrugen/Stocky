<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['select', 'edit', 'delete'])
</script>

<template>
  <div
    class="food-item-card"
    :class="{ 'food-item-card--clickable': clickable }"
    @click="clickable && $emit('select', item)"
  >
    <div class="food-item-card__info">
      <p class="food-item-card__name">{{ item.name }}</p>
      <p class="food-item-card__meta">{{ item.servingSize }} · {{ item.calories }} cal</p>
    </div>
    <div class="food-item-card__actions" @click.stop>
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.food-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.food-item-card--clickable {
  cursor: pointer;
}

.food-item-card--clickable:active {
  background: var(--color-primary-soft);
}

.food-item-card__name {
  font-weight: 600;
}

.food-item-card__meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.food-item-card__actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
}
</style>
