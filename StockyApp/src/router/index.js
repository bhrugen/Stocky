import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { onboarding: true },
    },
    {
      path: '/',
      name: 'today',
      component: () => import('@/views/TodayView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
    },
    {
      path: '/food-library',
      name: 'food-library',
      component: () => import('@/views/FoodLibraryView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/log-food',
      name: 'log-food',
      component: () => import('@/views/LogFoodView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.public && authStore.isAuthenticated) {
    return { name: 'today' }
  }

  if (
    authStore.isAuthenticated &&
    !authStore.onboardingComplete &&
    !to.meta.public &&
    !to.meta.onboarding
  ) {
    return { name: 'onboarding' }
  }

  if (authStore.isAuthenticated && authStore.onboardingComplete && to.meta.onboarding) {
    return { name: 'today' }
  }

  return true
})

export default router
