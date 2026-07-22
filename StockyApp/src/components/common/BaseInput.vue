<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  step: {
    type: String,
    default: undefined,
  },
  min: {
    type: [String, Number],
    default: undefined,
  },
  error: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="base-input">
    <span v-if="label" class="base-input__label">{{ label }}</span>
    <input
      class="base-input__field"
      :class="{ 'base-input__field--error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :step="step"
      :min="min"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="base-input__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.base-input__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.base-input__field {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1rem;
  width: 100%;
}

.base-input__field:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.base-input__field--error {
  border-color: var(--color-danger);
}

.base-input__error {
  font-size: 0.8rem;
  color: var(--color-danger);
}
</style>
