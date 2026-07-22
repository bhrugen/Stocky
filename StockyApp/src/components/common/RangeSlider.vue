<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: '',
  },
  formatValue: {
    type: Function,
    default: (value) => String(value),
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="range-slider">
    <div v-if="label" class="range-slider__header">
      <span class="range-slider__label">{{ label }}</span>
      <span class="range-slider__value">{{ formatValue(modelValue) }}</span>
    </div>
    <input
      class="range-slider__input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div class="range-slider__scale">
      <span>{{ formatValue(min) }}</span>
      <span>{{ formatValue(max) }}</span>
    </div>
  </div>
</template>

<style scoped>
.range-slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.range-slider__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.range-slider__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.range-slider__value {
  font-weight: 700;
  color: var(--color-primary);
}

.range-slider__input {
  width: 100%;
  accent-color: var(--color-primary);
}

.range-slider__scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
