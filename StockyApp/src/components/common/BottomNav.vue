<script setup>
const links = [
  { to: { name: 'today' }, label: 'Today', icon: '🍽️' },
  { to: { name: 'history' }, label: 'History', icon: '📅' },
  { to: { name: 'food-library' }, label: 'Foods', icon: '🥗' },
  { to: { name: 'settings' }, label: 'Settings', icon: '⚙️' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="link in links"
      :key="link.label"
      :to="link.to"
      class="bottom-nav__link"
      active-class="bottom-nav__link--active"
    >
      <span class="bottom-nav__icon" aria-hidden="true">{{ link.icon }}</span>
      <span class="bottom-nav__label">{{ link.label }}</span>
    </RouterLink>
  </nav>

  <RouterLink :to="{ name: 'log-food' }" class="log-food-fab" aria-label="Log food">
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" />
    </svg>
  </RouterLink>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  height: var(--nav-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  z-index: 50;
}

.bottom-nav__link {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.bottom-nav__icon {
  font-size: 1.1rem;
}

.bottom-nav__link--active {
  color: var(--color-primary);
}

.log-food-fab {
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-height) + 8px);
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--color-primary);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.28),
    0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 60;
  transition: transform 0.15s ease;
}

.log-food-fab:active {
  transform: translateX(-50%) scale(0.93);
}
</style>
