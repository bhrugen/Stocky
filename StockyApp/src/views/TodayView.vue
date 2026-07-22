<script setup>
import DayLog from '@/components/log/DayLog.vue'
import { todayIso, formatDisplayDate } from '@/utils/date'

const date = todayIso()
</script>

<template>
  <div class="today-view">
    <header class="today-view__header">
      <h1 class="today-view__title">{{ formatDisplayDate(date) }}</h1>
    </header>
    <DayLog :date="date" />
  </div>
</template>

<style scoped>
.today-view {
  padding: var(--space-md);
  padding-bottom: calc(var(--nav-height) + var(--space-lg));
}

.today-view__header {
  margin-bottom: var(--space-sm);
}

.today-view__title {
  font-size: 1.25rem;
}
</style>
