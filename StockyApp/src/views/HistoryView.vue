<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DayLog from '@/components/log/DayLog.vue'
import { useAuthStore } from '@/stores/auth'
import { useLogStore } from '@/stores/log'
import { formatDisplayDate } from '@/utils/date'

const authStore = useAuthStore()
const logStore = useLogStore()
const selectedDate = ref(null)

onMounted(() => logStore.subscribeHistory())
onUnmounted(() => logStore.unsubscribeHistory())

function selectDate(date) {
  selectedDate.value = date
}

function backToList() {
  selectedDate.value = null
}
</script>

<template>
  <div class="history-view">
    <header class="history-view__header">
      <button v-if="selectedDate" class="history-view__back" type="button" @click="backToList">
        ← Back
      </button>
      <h1 class="history-view__title">
        {{ selectedDate ? formatDisplayDate(selectedDate) : 'History' }}
      </h1>
    </header>

    <DayLog v-if="selectedDate" :date="selectedDate" />

    <ul v-else class="history-view__list">
      <li
        v-for="row in logStore.historyTotals"
        :key="row.date"
        class="history-view__row"
        @click="selectDate(row.date)"
      >
        <span class="history-view__date">{{ formatDisplayDate(row.date) }}</span>
        <span
          class="history-view__total"
          :class="{ 'history-view__total--over': row.total > authStore.dailyCalorieGoal }"
        >
          {{ row.total }} cal
        </span>
      </li>
      <li v-if="logStore.historyTotals.length === 0" class="history-view__empty">
        No logged days yet.
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history-view {
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-height) + var(--space-lg));
}

.history-view__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.history-view__back {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
}

.history-view__title {
  font-size: 1.25rem;
}

.history-view__list {
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.history-view__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.history-view__row:last-child {
  border-bottom: none;
}

.history-view__row:active {
  background: var(--color-primary-soft);
}

.history-view__total {
  font-weight: 600;
  color: var(--color-primary);
}

.history-view__total--over {
  color: var(--color-danger);
}

.history-view__empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
