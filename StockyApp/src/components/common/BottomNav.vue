<script setup>
const links = [
  { to: { name: 'today' }, label: 'Today', icon: '🍽️' },
  { to: { name: 'history' }, label: 'History', icon: '📅' },
  { to: { name: 'food-library' }, label: 'Foods', icon: '🥗' },
  { to: { name: 'weight' }, label: 'Weight', icon: '⚖️' },
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
</style>
