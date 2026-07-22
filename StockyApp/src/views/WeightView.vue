<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import WeightEntryForm from '@/components/weight/WeightEntryForm.vue'
import WeightHistoryList from '@/components/weight/WeightHistoryList.vue'
import { useAuthStore } from '@/stores/auth'
import { useWeightStore } from '@/stores/weight'

const authStore = useAuthStore()
const weightStore = useWeightStore()
const saving = ref(false)

onMounted(() => weightStore.subscribe())
onUnmounted(() => weightStore.unsubscribeAll())

async function addEntry({ date, weight }) {
  saving.value = true
  try {
    await weightStore.addWeightEntry({ date, weight, unit: authStore.weightUnit })
  } finally {
    saving.value = false
  }
}

function deleteEntry(entryId) {
  weightStore.deleteWeightEntry(entryId)
}
</script>

<template>
  <div class="weight-view">
    <header class="weight-view__header">
      <h1 class="weight-view__title">Weight</h1>
    </header>

    <WeightEntryForm :unit="authStore.weightUnit" :saving="saving" @submit="addEntry" />
    <WeightHistoryList :entries="weightStore.sortedEntries" @delete="deleteEntry" />
  </div>
</template>

<style scoped>
.weight-view {
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-height) + var(--space-lg));
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.weight-view__title {
  font-size: 1.25rem;
}
</style>
