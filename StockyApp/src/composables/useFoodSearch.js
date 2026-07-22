import { ref, computed } from 'vue'
import { useFoodItemsStore } from '@/stores/foodItems'

export function useFoodSearch() {
  const foodItemsStore = useFoodItemsStore()
  const searchTerm = ref('')

  const results = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return foodItemsStore.sortedItems
    return foodItemsStore.sortedItems.filter((item) => item.name.toLowerCase().includes(term))
  })

  const hasExactMatch = computed(() =>
    foodItemsStore.items.some(
      (item) => item.name.toLowerCase() === searchTerm.value.trim().toLowerCase(),
    ),
  )

  return { searchTerm, results, hasExactMatch }
}
