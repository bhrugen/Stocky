<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update-quantity', 'delete'])

const editing = ref(false)
const quantity = ref(props.entry.quantity)

function startEdit() {
  quantity.value = props.entry.quantity
  editing.value = true
}

function saveEdit() {
  const qty = Number(quantity.value)
  if (qty > 0) {
    emit('update-quantity', qty)
  }
  editing.value = false
}
</script>

<template>
  <div class="log-entry-row">
    <div class="log-entry-row__info">
      <p class="log-entry-row__name">{{ entry.itemName }}</p>
      <p class="log-entry-row__meta">
        {{ entry.servingSize }} × {{ entry.quantity }} · {{ entry.calories }} cal
      </p>
    </div>

    <div v-if="!editing" class="log-entry-row__actions">
      <button class="log-entry-row__action" type="button" @click="startEdit">Edit</button>
      <button
        class="log-entry-row__action log-entry-row__action--danger"
        type="button"
        @click="$emit('delete')"
      >
        Delete
      </button>
    </div>

    <form v-else class="log-entry-row__edit" @submit.prevent="saveEdit">
      <BaseInput v-model="quantity" type="number" min="0" step="0.25" />
      <BaseButton type="submit">Save</BaseButton>
      <BaseButton variant="ghost" @click="editing = false">Cancel</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.log-entry-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.log-entry-row__name {
  font-weight: 500;
}

.log-entry-row__meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.log-entry-row__actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.log-entry-row__action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.log-entry-row__action--danger {
  color: var(--color-danger);
}

.log-entry-row__edit {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}
</style>
