<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
import FoodItemCard from '@/components/food/FoodItemCard.vue'
import { useFoodSearch } from '@/composables/useFoodSearch'

defineEmits(['select'])

const { searchTerm, results, hasExactMatch } = useFoodSearch()

defineExpose({ searchTerm, hasExactMatch })
</script>

<template>
  <div class="food-search-list">
    <BaseInput v-model="searchTerm" placeholder="Search your food items…" />
    <div class="food-search-list__results">
      <FoodItemCard
        v-for="item in results"
        :key="item.id"
        :item="item"
        @select="$emit('select', item)"
      />
      <p v-if="results.length === 0" class="food-search-list__empty">
        No matching items yet — add one below.
      </p>
    </div>
  </div>
</template>

<style scoped>
.food-search-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.food-search-list__results {
  max-height: 40vh;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.food-search-list__empty {
  padding: var(--space-md);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
