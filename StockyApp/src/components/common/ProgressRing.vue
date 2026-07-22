<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: {
    type: Number,
    required: true,
    validator: (value) => value >= 0,
  },
  size: {
    type: Number,
    default: 120,
  },
  strokeWidth: {
    type: Number,
    default: 10,
  },
  overGoal: {
    type: Boolean,
    default: false,
  },
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const clampedPercent = computed(() => Math.min(100, props.percent))
const offset = computed(() => circumference.value * (1 - clampedPercent.value / 100))
</script>

<template>
  <svg :width="size" :height="size" class="progress-ring" viewBox="0 0 120 120">
    <circle
      class="progress-ring__track"
      :r="radius"
      cx="60"
      cy="60"
      :stroke-width="strokeWidth"
      fill="none"
    />
    <circle
      class="progress-ring__value"
      :class="{ 'progress-ring__value--over': overGoal }"
      :r="radius"
      cx="60"
      cy="60"
      :stroke-width="strokeWidth"
      fill="none"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="offset"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring__track {
  stroke: var(--color-border);
}

.progress-ring__value {
  stroke: var(--color-primary);
  transition: stroke-dashoffset 0.3s ease;
}

.progress-ring__value--over {
  stroke: var(--color-danger);
}
</style>
