import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)

app.use(createPinia())

useThemeStore().init()

const authStore = useAuthStore()
authStore.startAuthListener().then(() => {
  app.use(router)
  app.mount('#app')
})
