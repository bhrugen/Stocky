<script setup>
import { onMounted, watch } from 'vue'
import DailySummary from '@/components/log/DailySummary.vue'
import MealSection from '@/components/log/MealSection.vue'
import { MEAL_TYPES, useLogStore } from '@/stores/log'

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
})

const logStore = useLogStore()

function subscribe() {
  logStore.subscribeToDate(props.date)
}

onMounted(subscribe)
watch(() => props.date, subscribe)
</script>

<template>
  <div class="day-log">
    <DailySummary :date="date" />

    <MealSection
      v-for="mealType in MEAL_TYPES"
      :key="mealType"
      :meal-type="mealType"
      :date="date"
    />
  </div>
</template>

<style scoped>
.day-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
