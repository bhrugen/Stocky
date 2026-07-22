<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref('login') // 'login' | 'signup' | 'reset'
const email = ref('')
const password = ref('')
const error = ref('')
const resetSent = ref(false)
const submitting = ref(false)

function redirectAfterAuth() {
  router.replace(route.query.redirect || { name: 'today' })
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    if (mode.value === 'signup') {
      await authStore.signUp(email.value, password.value)
      redirectAfterAuth()
    } else if (mode.value === 'login') {
      await authStore.logIn(email.value, password.value)
      redirectAfterAuth()
    } else if (mode.value === 'reset') {
      await authStore.resetPassword(email.value)
      resetSent.value = true
    }
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}

async function handleGoogleSignIn() {
  error.value = ''
  submitting.value = true
  try {
    await authStore.logInWithGoogle()
    redirectAfterAuth()
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}

function switchMode(next) {
  mode.value = next
  error.value = ''
  resetSent.value = false
}
</script>

<template>
  <div class="login-view">
    <h1 class="login-view__title">Stocky</h1>
    <p class="login-view__subtitle">Track your daily calories, simply.</p>

    <form class="login-view__form" @submit.prevent="handleSubmit">
      <BaseInput v-model="email" label="Email" type="email" required />
      <BaseInput
        v-if="mode !== 'reset'"
        v-model="password"
        label="Password"
        type="password"
        required
      />

      <p v-if="error" class="login-view__error">{{ error }}</p>
      <p v-if="resetSent" class="login-view__success">Password reset email sent.</p>

      <BaseButton type="submit" full-width :disabled="submitting">
        <template v-if="mode === 'signup'">{{
          submitting ? 'Creating account…' : 'Sign up'
        }}</template>
        <template v-else-if="mode === 'reset'">{{
          submitting ? 'Sending…' : 'Send reset email'
        }}</template>
        <template v-else>{{ submitting ? 'Logging in…' : 'Log in' }}</template>
      </BaseButton>
    </form>

    <BaseButton
      v-if="mode !== 'reset'"
      variant="secondary"
      full-width
      :disabled="submitting"
      @click="handleGoogleSignIn"
    >
      Continue with Google
    </BaseButton>

    <div class="login-view__links">
      <button
        v-if="mode !== 'signup'"
        type="button"
        class="login-view__link"
        @click="switchMode('signup')"
      >
        Need an account? Sign up
      </button>
      <button
        v-if="mode !== 'login'"
        type="button"
        class="login-view__link"
        @click="switchMode('login')"
      >
        Have an account? Log in
      </button>
      <button
        v-if="mode !== 'reset'"
        type="button"
        class="login-view__link"
        @click="switchMode('reset')"
      >
        Forgot password?
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.login-view__title {
  font-size: 2rem;
  text-align: center;
  color: var(--color-primary);
}

.login-view__subtitle {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.login-view__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.login-view__error {
  color: var(--color-danger);
  font-size: 0.875rem;
}

.login-view__success {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.login-view__links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.login-view__link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
