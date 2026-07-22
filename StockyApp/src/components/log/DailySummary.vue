<script setup>
import ProgressRing from '@/components/common/ProgressRing.vue'
import { useDailyTotals } from '@/composables/useDailyTotals'

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
})

const { total, goal, remaining, percentConsumed, isOverGoal } = useDailyTotals(props.date)
</script>

<template>
  <section class="daily-summary">
    <ProgressRing :percent="percentConsumed" :over-goal="isOverGoal" />
    <div class="daily-summary__ring-label">
      <span class="daily-summary__number">{{ total }}</span>
      <span class="daily-summary__unit">/ {{ goal }} cal</span>
    </div>
    <p class="daily-summary__remaining" :class="{ 'daily-summary__remaining--over': isOverGoal }">
      <template v-if="isOverGoal">{{ Math.abs(remaining) }} cal over goal</template>
      <template v-else>{{ remaining }} cal remaining</template>
    </p>
  </section>
</template>

<style scoped>
.daily-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) 0;
  position: relative;
}

.daily-summary__ring-label {
  position: absolute;
  top: calc(var(--space-lg) + 45px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.daily-summary__number {
  font-size: 1.5rem;
  font-weight: 700;
}

.daily-summary__unit {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.daily-summary__remaining {
  font-weight: 600;
  color: var(--color-primary);
}

.daily-summary__remaining--over {
  color: var(--color-danger);
}
</style>
