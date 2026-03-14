<template>
  <div class="mob-nav">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="mob-nav__item"
      active-class="mob-nav__item--active"
    >
      <img :src="tab.icon" :alt="tab.label" class="mob-nav__icon" />
      <span class="mob-nav__label">{{ tab.label }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const tabs = [
  { to: localePath('/sportsbook'), icon: '/icons/home.svg', label: t('navigation_tabs.home') },
  { to: localePath('/prematch'), icon: '/icons/baseball.svg', label: t('navigation_tabs.prematch') },
  { to: localePath('/live'), icon: '/icons/live-signal.svg', label: t('navigation_tabs.live_now1') },
  { to: localePath('/panel/main-dealers'), icon: '/icons/player.svg', label: t('navigation_tabs.dealers') },
  { to: localePath('/panel'), icon: '/icons/dashboard.svg', label: t('navigation_tabs.panel') },
]
</script>

<style scoped>
.mob-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: stretch;
  background: var(--color-gray-100, #f3f4f6);
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
:root.dark .mob-nav {
  background: #222222;
  border-top-color: #222222;
}

.mob-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-gray-400, #9ca3af);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 0;
  transition: color 0.2s;
}
:root.dark .mob-nav__item {
  color: #868686;
}

.mob-nav__item--active {
  color: var(--color-gray-900, #111827);
}
:root.dark .mob-nav__item--active {
  color: #ffffff;
}

.mob-nav__icon {
  width: 24px;
  height: 24px;
  opacity: 0.5;
}
:root.dark .mob-nav__icon {
  filter: brightness(0) invert(0.5);
}
.mob-nav__item--active .mob-nav__icon {
  opacity: 1;
}
:root.dark .mob-nav__item--active .mob-nav__icon {
  filter: brightness(0) invert(0.75);
}

.mob-nav__label {
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .mob-nav {
    display: none;
  }
}
</style>
