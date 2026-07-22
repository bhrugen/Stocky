<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import FoodItemCard from '@/components/food/FoodItemCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useFoodItemsStore } from '@/stores/foodItems'
import { useFoodSearch } from '@/composables/useFoodSearch'

const foodItemsStore = useFoodItemsStore()
const { searchTerm, results } = useFoodSearch()

onMounted(() => foodItemsStore.subscribe())
onUnmounted(() => foodItemsStore.unsubscribeAll())

const editingItem = ref(null)
const editName = ref('')
const editCalories = ref('')
const editServingSize = ref('')
const saving = ref(false)
const error = ref('')

function openEdit(item) {
  editingItem.value = item
  editName.value = item.name
  editCalories.value = item.calories
  editServingSize.value = item.servingSize
  error.value = ''
}

function closeEdit() {
  editingItem.value = null
}

async function saveEdit() {
  const calories = Number(editCalories.value)
  if (!editName.value.trim() || !calories || calories <= 0 || !editServingSize.value.trim()) {
    error.value = 'Enter a name, serving size, and a positive calorie value.'
    return
  }
  saving.value = true
  try {
    await foodItemsStore.updateFoodItem(editingItem.value.id, {
      name: editName.value.trim(),
      calories,
      servingSize: editServingSize.value.trim(),
    })
    closeEdit()
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function removeItem(itemId) {
  await foodItemsStore.deleteFoodItem(itemId)
  closeEdit()
}
</script>

<template>
  <div class="food-library-view">
    <header class="food-library-view__header">
      <h1 class="food-library-view__title">Food Library</h1>
    </header>

    <BaseInput v-model="searchTerm" placeholder="Search your food items…" />

    <LoadingSpinner v-if="foodItemsStore.loading" />

    <div v-else class="food-library-view__list">
      <FoodItemCard v-for="item in results" :key="item.id" :item="item" :clickable="false">
        <template #actions>
          <button class="food-library-view__action" type="button" @click="openEdit(item)">
            Edit
          </button>
        </template>
      </FoodItemCard>
      <p v-if="results.length === 0" class="food-library-view__empty">
        No food items yet — add one from a meal on the Today screen.
      </p>
    </div>

    <BaseModal v-if="editingItem" title="Edit food item" @close="closeEdit">
      <form class="food-library-view__form" @submit.prevent="saveEdit">
        <BaseInput v-model="editName" label="Name" required />
        <BaseInput v-model="editServingSize" label="Serving size" required />
        <BaseInput
          v-model="editCalories"
          label="Calories per serving"
          type="number"
          min="0"
          required
        />
        <p v-if="error" class="food-library-view__error">{{ error }}</p>
        <BaseButton type="submit" full-width :disabled="saving">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </BaseButton>
        <BaseButton variant="danger" full-width type="button" @click="removeItem(editingItem.id)">
          Delete item
        </BaseButton>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.food-library-view {
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-height) + var(--space-lg));
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.food-library-view__title {
  font-size: 1.25rem;
}

.food-library-view__list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.food-library-view__action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
}

.food-library-view__empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-muted);
}

.food-library-view__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.food-library-view__error {
  color: var(--color-danger);
  font-size: 0.875rem;
}
</style>
