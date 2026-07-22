<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FoodSearchList from '@/components/food/FoodSearchList.vue'
import { useFoodItemsStore } from '@/stores/foodItems'
import { useLogStore } from '@/stores/log'

const props = defineProps({
  mealType: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'logged'])

const foodItemsStore = useFoodItemsStore()
const logStore = useLogStore()

const step = ref('search') // 'search' | 'create' | 'quantity'
const selectedItem = ref(null)
const quantity = ref(1)
const saving = ref(false)
const error = ref('')

const newItemName = ref('')
const newItemCalories = ref('')
const newItemServingSize = ref('')

const searchListRef = ref(null)

function chooseItem(item) {
  selectedItem.value = item
  quantity.value = 1
  step.value = 'quantity'
}

function openCreateForm() {
  newItemName.value = searchListRef.value?.searchTerm ?? ''
  newItemCalories.value = ''
  newItemServingSize.value = ''
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
    selectedItem.value = {
      id,
      name: newItemName.value.trim(),
      calories,
      servingSize: newItemServingSize.value.trim(),
    }
    quantity.value = 1
    step.value = 'quantity'
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function logEntry() {
  error.value = ''
  const qty = Number(quantity.value)
  if (!qty || qty <= 0) {
    error.value = 'Enter a quantity greater than 0.'
    return
  }
  saving.value = true
  try {
    await logStore.addLogEntry({
      date: props.date,
      mealType: props.mealType,
      item: selectedItem.value,
      quantity: qty,
    })
    emit('logged')
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal title="Add food" @close="$emit('close')">
    <div v-if="step === 'search'" class="add-food-modal__step">
      <FoodSearchList ref="searchListRef" @select="chooseItem" />
      <BaseButton variant="secondary" full-width @click="openCreateForm">
        + Create new food item
      </BaseButton>
    </div>

    <form v-else-if="step === 'create'" class="add-food-modal__step" @submit.prevent="createItem">
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
      <p v-if="error" class="add-food-modal__error">{{ error }}</p>
      <BaseButton type="submit" full-width :disabled="saving">
        {{ saving ? 'Saving…' : 'Save item & continue' }}
      </BaseButton>
      <BaseButton variant="ghost" full-width @click="step = 'search'">Back to search</BaseButton>
    </form>

    <form v-else class="add-food-modal__step" @submit.prevent="logEntry">
      <div class="add-food-modal__summary">
        <p class="add-food-modal__summary-name">{{ selectedItem.name }}</p>
        <p class="add-food-modal__summary-meta">
          {{ selectedItem.servingSize }} · {{ selectedItem.calories }} cal
        </p>
      </div>
      <BaseInput v-model="quantity" label="Quantity" type="number" min="0" step="0.25" required />
      <p v-if="error" class="add-food-modal__error">{{ error }}</p>
      <BaseButton type="submit" full-width :disabled="saving">
        {{ saving ? 'Adding…' : 'Add to log' }}
      </BaseButton>
      <BaseButton variant="ghost" full-width @click="step = 'search'"
        >Choose different item</BaseButton
      >
    </form>
  </BaseModal>
</template>

<style scoped>
.add-food-modal__step {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.add-food-modal__summary {
  padding: var(--space-md);
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
}

.add-food-modal__summary-name {
  font-weight: 600;
}

.add-food-modal__summary-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.add-food-modal__error {
  color: var(--color-danger);
  font-size: 0.875rem;
}
</style>
