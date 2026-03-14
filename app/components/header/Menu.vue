<template>
  <nav class="header-navbar">
    <NuxtLink
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="header-navbar__link"
      :class="{ 'header-navbar__link--active': isActiveRoute(link.raw) }"
    >
      <span class="header-navbar__icon">
        <UIcon :name="link.icon" />
      </span>
      <span class="header-navbar__label">{{ link.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

function isActiveRoute(path: string) {
  return route.path === localePath(path)
}

const navLinks = computed(() => [
  { to: localePath('/sportsbook'), raw: '/sportsbook', icon: 'i-lucide-home', label: t('navigation_tabs.home') },
  { to: localePath('/prematch'), raw: '/prematch', icon: 'i-lucide-calendar', label: t('sportsbook.prematch') },
  { to: localePath('/sportsbook/live'), raw: '/sportsbook/live', icon: 'i-lucide-signal', label: t('links.live_bet') },
  { to: localePath('/sportsbook/starting-soon'), raw: '/sportsbook/starting-soon', icon: 'i-lucide-clock', label: t('sportsbook.starting_soon') },
  { to: localePath('/play/zeppelin'), raw: '/play/zeppelin', icon: 'i-lucide-rocket', label: 'Zeppelin' },
  { to: localePath('/play/aviator'), raw: '/play/aviator', icon: 'i-lucide-plane', label: 'Aviator' },
  { to: localePath('/play/pirates'), raw: '/play/pirates', icon: 'i-lucide-swords', label: 'Pirates' },
  { to: localePath('/play/mines'), raw: '/play/mines', icon: 'i-lucide-bomb', label: 'Mines' },
  { to: localePath('/play/double'), raw: '/play/double', icon: 'i-lucide-circle-dot', label: 'Double' },
  { to: localePath('/play/coinflip'), raw: '/play/coinflip', icon: 'i-lucide-coins', label: 'Coinflip' },
  { to: localePath('/games'), raw: '/games', icon: 'i-lucide-gamepad-2', label: t('links.games') }
])
</script>

<style scoped>
.header-navbar {
  display: flex;
  position: relative;
  padding-inline: 20px;
  padding-block-end: 6px;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.header-navbar::-webkit-scrollbar {
  display: none;
}

/* Navigation Link */
.header-navbar__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  padding-inline: 8px;
  color: #e0e0e0;
  text-decoration: none;
  font-size: 14px;
  text-align: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  transition: all 0.4s;
}

/* Icon */
.header-navbar__icon {
  line-height: 0;
  margin-top: 8px;
  margin-bottom: 5px;
  opacity: 0.7;
  transition: opacity 0.4s;
}
.header-navbar__icon svg,
.header-navbar__icon .iconify {
  width: 24px;
  height: 24px;
  color: var(--color-accent-foreground, #fdfdfd);
}

/* Label */
.header-navbar__label {
  white-space: nowrap;
}

/* Hover & Active */
.header-navbar__link:hover,
.header-navbar__link--active {
  color: var(--color-accent-foreground, #fdfdfd);
}
.header-navbar__link:hover .header-navbar__icon,
.header-navbar__link--active .header-navbar__icon {
  opacity: 1;
}

/* Glow effect (::before) */
.header-navbar__link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 204, 0, 0.5), transparent);
  opacity: 0;
  z-index: 0;
}

.header-navbar__link--active::before,
.header-navbar__link:hover::before {
  box-shadow: 0 0 30px 10px #f8f8f8;
  opacity: 1;
  height: 0;
}

/* Top border line (::after) */
.header-navbar__link--active::after,
.header-navbar__link:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 25%;
  width: 50%;
  height: 1px;
  background-color: #f8f8f8;
}
</style>
