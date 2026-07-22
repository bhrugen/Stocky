<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FoodSearchList from '@/components/food/FoodSearchList.vue'
import { useFoodItemsStore } from '@/stores/foodItems'
import { useLogStore, MEAL_TYPES } from '@/stores/log'
import { todayIso } from '@/utils/date'

const router = useRouter()
const foodItemsStore = useFoodItemsStore()
const logStore = useLogStore()

onMounted(() => foodItemsStore.subscribe())
onUnmounted(() => foodItemsStore.unsubscribeAll())

const step = ref('search') // 'search' | 'create' | 'details'
const selectedItem = ref(null)
const mealType = ref(null)
const quantity = ref(1)
const saving = ref(false)
const error = ref('')

const newItemName = ref('')
const newItemCalories = ref('')
const newItemServingSize = ref('')

const searchListRef = ref(null)

function goBack() {
  if (step.value === 'search') {
    router.back()
  } else if (step.value === 'create') {
    step.value = 'search'
  } else {
    step.value = 'search'
  }
}

function chooseItem(item) {
  selectedItem.value = item
  mealType.value = null
  quantity.value = 1
  step.value = 'details'
}

function openCreateForm() {
  newItemName.value = searchListRef.value?.searchTerm ?? ''
  newItemCalories.value = ''
  newItemServingSize.value = ''
  error.value = ''
  step.value = 'create'
}

async function createItem() {
  error.value = ''
  const calories = Number(newItemCalories.value)
  if (!newItemName.value.trim() || !calories || calories <= 0 || !newItemServingSize.value.trim()) {
    error.value = 'Enter a name, serving size, and a positive calorie value.'
    return
  }
  saving.value = true
  try {
    const id = await foodItemsStore.addFoodItem({
      name: newItemName.value.trim(),
      calories,
      servingSize: newItemServingSize.value.trim(),
    })
    chooseItem({
      id,
      name: newItemName.value.trim(),
      calories,
      servingSize: newItemServingSize.value.trim(),
    })
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function logEntry() {
  error.value = ''
  if (!mealType.value) {
    error.value = 'Choose a meal.'
    return
  }
  const qty = Number(quantity.value)
  if (!qty || qty <= 0) {
    error.value = 'Enter a quantity greater than 0.'
    return
  }
  saving.value = true
  try {
    await logStore.addLogEntry({
      date: todayIso(),
      mealType: mealType.value,
      item: selectedItem.value,
      quantity: qty,
    })
    router.push({ name: 'today' })
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="log-food-view">
    <header class="log-food-view__header">
      <button class="log-food-view__back" type="button" @click="goBack">← Back</button>
      <h1 class="log-food-view__title">Log Food</h1>
    </header>

    <div v-if="step === 'search'" class="log-food-view__step">
      <FoodSearchList ref="searchListRef" @select="chooseItem" />
      <BaseButton variant="secondary" full-width @click="openCreateForm">
        + Create new food item
      </BaseButton>
    </div>

    <form v-else-if="step === 'create'" class="log-food-view__step" @submit.prevent="createItem">
      <BaseInput v-model="newItemName" label="Name" placeholder="e.g. Grilled chicken" required />
      <BaseInput
        v-model="newItemServingSize"
        label="Serving size"
        placeholder="e.g. 1 cup, 1/2 cup, 1 ct"
        required
      />
      <BaseInput
        v-model="newItemCalories"
        label="Calories per serving"
        type="number"
        min="0"
        step="1"
        required
      />
      <p v-if="error" class="log-food-view__error">{{ error }}</p>
      <BaseButton type="submit" full-width :disabled="saving">
        {{ saving ? 'Saving…' : 'Save item & continue' }}
      </BaseButton>
    </form>

    <form v-else class="log-food-view__step" @submit.prevent="logEntry">
      <div class="log-food-view__summary">
        <p class="log-food-view__summary-name">{{ selectedItem.name }}</p>
        <p class="log-food-view__summary-meta">
          {{ selectedItem.servingSize }} · {{ selectedItem.calories }} cal
        </p>
      </div>

      <div class="log-food-view__field">
        <span class="log-food-view__label">Meal</span>
        <div class="log-food-view__meal-options">
          <button
            v-for="meal in MEAL_TYPES"
            :key="meal"
            type="button"
            class="log-food-view__meal-option"
            :class="{ 'log-food-view__meal-option--active': mealType === meal }"
            @click="mealType = meal"
          >
            {{ meal.charAt(0).toUpperCase() + meal.slice(1) }}
          </button>
        </div>
      </div>

      <BaseInput v-model="quantity" label="Quantity" type="number" min="0" step="0.25" required />
      <p v-if="error" class="log-food-view__error">{{ error }}</p>
      <BaseButton type="submit" full-width :disabled="saving">
        {{ saving ? 'Adding…' : 'Add to log' }}
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.log-food-view {
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-height) + var(--space-lg));
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.log-food-view__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.log-food-view__back {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
}

.log-food-view__title {
  font-size: 1.25rem;
}

.log-food-view__step {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.log-food-view__summary {
  padding: var(--space-md);
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
}

.log-food-view__summary-name {
  font-weight: 600;
}

.log-food-view__summary-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.log-food-view__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.log-food-view__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.log-food-view__meal-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.log-food-view__meal-option {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  font-weight: 600;
}

.log-food-view__meal-option--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.log-food-view__error {
  color: var(--color-danger);
  font-size: 0.875rem;
}
</style>
