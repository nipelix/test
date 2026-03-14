<template>
  <div class="lg:hidden">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 z-[60]"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Sidebar Drawer -->
    <aside
      class="fixed top-0 left-0 z-[70] h-screen w-[75vw] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo (fixed top) -->
      <div class="shrink-0 flex items-center justify-center h-[3.75rem] border-b border-gray-200 dark:border-gray-800">
        <SharedLogo />
      </div>

      <!-- Navigation (scrollable) -->
      <nav class="sb-nav flex-1 overflow-y-auto custom-scrollbar">
        <!-- Base Navigation Links -->
        <div class="sb-links-group">
          <NuxtLink
            v-for="link in sidebarLinks"
            :key="link.to"
            :to="link.to"
            class="sb-nav-link"
            active-class="sb-nav-link--active"
            @click="$emit('close')"
          >
            <img :src="link.icon" :alt="link.label" class="sb-nav-link__icon" />
            <span class="sb-nav-link__label">{{ link.label }}</span>
            <span v-if="link.badge" class="sb-nav-link__badge" :style="{ backgroundColor: link.badge.bg, color: link.badge.color }">
              {{ link.badge.count }}
            </span>
          </NuxtLink>
        </div>

        <div class="sb-separator" />

        <!-- Popular Competitions -->
        <div class="sb-section">
          <button class="sb-section__trigger" @click="popularOpen = !popularOpen">
            <span>{{ $t('links.popular_competitions') }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="sb-section__chevron"
              :class="{ 'sb-section__chevron--open': popularOpen }"
            />
          </button>
        </div>
        <div v-show="popularOpen" class="sb-leagues">
          <NuxtLink
            v-for="league in popularLeagues"
            :key="league.id"
            :to="localePath('/sportsbook/football')"
            class="sb-league-item"
            @click="$emit('close')"
          >
            <span class="sb-league-item__flag">{{ league.countryFlag }}</span>
            <span class="sb-league-item__name">{{ league.name }}</span>
            <UIcon name="i-lucide-star" class="sb-league-item__star" />
          </NuxtLink>
        </div>

        <div class="sb-separator" />

        <!-- Most Popular Sports -->
        <div class="sb-section">
          <button class="sb-section__trigger" @click="mostPopularOpen = !mostPopularOpen">
            <span>{{ $t('links.most_popular') }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="sb-section__chevron"
              :class="{ 'sb-section__chevron--open': mostPopularOpen }"
            />
          </button>
        </div>
        <div v-show="mostPopularOpen" class="sb-sports-list">
          <NuxtLink
            v-for="sport in popularSports"
            :key="sport.id"
            :to="localePath('/sportsbook/' + sport.slug)"
            class="sb-sport-item"
            @click="$emit('close')"
          >
            <img :src="sport.icon" :alt="sport.name" class="sb-sport-item__icon" />
            <span class="sb-sport-item__name">{{ sport.name }}</span>
            <span class="sb-sport-item__count">{{ sport.matchCount }}</span>
          </NuxtLink>
        </div>

        <div class="sb-separator" />

        <!-- A-Z Sports -->
        <div class="sb-section">
          <button class="sb-section__trigger" @click="azOpen = !azOpen">
            <span>{{ $t('common.a_z') }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="sb-section__chevron"
              :class="{ 'sb-section__chevron--open': azOpen }"
            />
          </button>
        </div>
        <div v-show="azOpen" class="sb-sports-list">
          <NuxtLink
            v-for="sport in allActiveSports"
            :key="sport.id"
            :to="localePath('/sportsbook/' + sport.slug)"
            class="sb-sport-item"
            @click="$emit('close')"
          >
            <img :src="sport.icon" :alt="sport.name" class="sb-sport-item__icon" />
            <span class="sb-sport-item__name">{{ sport.name }}</span>
            <span class="sb-sport-item__count">{{ sport.matchCount }}</span>
          </NuxtLink>
        </div>

      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const { sidebarLinks, popularLeagues, popularSports, allActiveSports, localePath } = useSportsbookNav()
const popularOpen = ref(true)
const mostPopularOpen = ref(true)
const azOpen = ref(false)

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
.sb-nav { padding: 0; }
.sb-links-group { display: flex; flex-direction: column; }

.sb-nav-link {
  display: flex; align-items: center; gap: 8px; padding: 12px 8px;
  font-size: 12px; font-weight: 500; color: var(--color-gray-500, #6b7280);
  text-decoration: none; border-left: 4px solid transparent;
  transition: background 0.16s, color 0.16s;
}
:root.dark .sb-nav-link { color: var(--color-gray-400, #9ca3af); }
.sb-nav-link:hover { background: var(--color-gray-50, #f9fafb); }
:root.dark .sb-nav-link:hover { background: var(--color-gray-800, #1f2937); }

.sb-nav-link--active { border-left-color: var(--accent-500); background: rgba(4, 4, 5, 0.06); }
:root.dark .sb-nav-link--active { background: rgba(4, 4, 5, 0.2); }
.sb-nav-link__icon {
  flex-shrink: 0; width: 20px; height: 20px; opacity: 0.5;
}
:root.dark .sb-nav-link__icon { filter: brightness(0) invert(0.5); }
.sb-nav-link--active .sb-nav-link__icon { opacity: 1; }
:root.dark .sb-nav-link--active .sb-nav-link__icon { filter: brightness(0) invert(0.75); }
.sb-nav-link__label { flex: 1; }

.sb-nav-link__badge {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; height: 24px; padding: 0 8px; font-size: 12px; font-weight: 700; border-radius: 20rem;
}

.sb-separator { border-bottom: 1px solid var(--color-gray-100, #f3f4f6); }
:root.dark .sb-separator { border-bottom-color: var(--color-gray-800, #1f2937); }

.sb-section { padding: 0 8px; }
.sb-section__trigger {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
  min-height: 48px; padding: 0; background: none; border: none;
  font-size: 12px; font-weight: 700; color: var(--accent-500); cursor: pointer;
}
.sb-section__chevron { width: 20px; height: 20px; color: var(--accent-500); transition: transform 0.4s; }
.sb-section__chevron--open { transform: rotate(180deg); }

/* Leagues list */
.sb-leagues { display: flex; flex-direction: column; }
.sb-league-item {
  display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 8px;
  font-size: 12px; font-weight: 600; color: var(--color-gray-600, #4b5563);
  text-decoration: none; transition: background 0.16s;
}
:root.dark .sb-league-item { color: var(--color-gray-400, #9ca3af); }
.sb-league-item:hover { background: var(--color-gray-50, #f9fafb); }
:root.dark .sb-league-item:hover { background: var(--color-gray-800, #1f2937); }
.sb-league-item__flag { font-size: 18px; flex-shrink: 0; line-height: 1; }
.sb-league-item__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb-league-item__star { width: 16px; height: 16px; flex-shrink: 0; color: var(--color-gray-300, #d1d5db); cursor: pointer; transition: color 0.16s; }
.sb-league-item__star:hover { color: #facc15; }

/* Sports list */
.sb-sports-list { display: flex; flex-direction: column; }
.sb-sport-item {
  display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 8px;
  font-size: 12px; font-weight: 600; color: var(--color-gray-600, #4b5563);
  text-decoration: none; transition: background 0.16s;
}
:root.dark .sb-sport-item { color: var(--color-gray-400, #9ca3af); }
.sb-sport-item:hover { background: var(--color-gray-50, #f9fafb); }
:root.dark .sb-sport-item:hover { background: var(--color-gray-800, #1f2937); }
.sb-sport-item__icon {
  flex-shrink: 0; width: 20px; height: 20px; opacity: 0.6;
}
:root.dark .sb-sport-item__icon { filter: brightness(0) invert(0.5); }
.sb-sport-item__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb-sport-item__count {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; height: 20px; padding: 0 6px; font-size: 10px; font-weight: 700;
  border-radius: 10px; background: var(--color-gray-100, #f3f4f6); color: var(--color-gray-500, #6b7280);
}
:root.dark .sb-sport-item__count { background: var(--color-gray-800, #1f2937); color: var(--color-gray-400, #9ca3af); }


.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
