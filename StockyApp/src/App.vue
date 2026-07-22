<script setup>
import { RouterView, useRoute } from 'vue-router'
import BottomNav from '@/components/common/BottomNav.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
</script>

<template>
  <RouterView />
  <BottomNav v-if="authStore.isAuthenticated && !route.meta.public" />
</template>
