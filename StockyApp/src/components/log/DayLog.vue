<script setup>
import { ref, onMounted, watch } from 'vue'
import DailySummary from '@/components/log/DailySummary.vue'
import MealSection from '@/components/log/MealSection.vue'
import AddFoodModal from '@/components/food/AddFoodModal.vue'
import { MEAL_TYPES, useLogStore } from '@/stores/log'

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
})

const logStore = useLogStore()
const activeMealType = ref(null)

function subscribe() {
  logStore.subscribeToDate(props.date)
}

onMounted(subscribe)
watch(() => props.date, subscribe)

function openAddFood(mealType) {
  activeMealType.value = mealType
}

function closeAddFood() {
  activeMealType.value = null
}
</script>

<template>
  <div class="day-log">
    <DailySummary :date="date" />

    <MealSection
      v-for="mealType in MEAL_TYPES"
      :key="mealType"
      :meal-type="mealType"
      :date="date"
      @add-food="openAddFood"
    />

    <AddFoodModal
      v-if="activeMealType"
      :meal-type="activeMealType"
      :date="date"
      @close="closeAddFood"
      @logged="closeAddFood"
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
