<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <header class="sportsbook-header sticky top-0 z-40">
      <div class="flex items-center justify-between px-4 h-12">
        <SharedLogo :light="true" />
        <div class="flex items-center gap-3">
          <NuxtLink
            :to="localePath('/panel/coupon-list')"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white border border-white/30 rounded hover:bg-white/10 transition"
          >
            {{ $t('sportsbook.coupon_list') }}
          </NuxtLink>
          <div class="flex items-center gap-2 text-white text-sm">
            <UIcon name="i-lucide-user-circle" class="w-5 h-5" />
            <span class="hidden sm:inline">{{ currentUser.username }}</span>
          </div>
        </div>
      </div>
      <!-- Game Nav Row -->
      <div class="bg-gray-800 overflow-x-auto sport-nav-scroll">
        <div class="flex items-center gap-1 px-4 min-w-max">
          <NuxtLink
            v-for="nav in gameNav"
            :key="nav.to"
            :to="nav.to"
            class="flex flex-col items-center gap-1 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition whitespace-nowrap"
            active-class="text-white bg-gray-700"
          >
            <UIcon :name="nav.icon" class="w-5 h-5" />
            <span>{{ nav.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Search -->
    <div class="px-4 pt-4">
      <UInput
        v-model="search"
        :placeholder="$t('common.search')"
        icon="i-lucide-search"
        class="max-w-sm"
      />
    </div>

    <!-- Game Sections -->
    <div class="px-4 py-6 space-y-8">
      <section v-for="section in sections" :key="section.key">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
            {{ section.label }}
            <UIcon name="i-lucide-chevron-up" class="w-4 h-4" />
          </h3>
          <button class="text-sm text-gray-400 hover:text-white">see all</button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <SportsbookGameCard
            v-for="game in games"
            :key="game.id"
            :game="game"
          />
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-950 text-center py-8 px-4">
      <div class="text-2xl font-bold text-gray-500 mb-4">Sinek2</div>
      <p class="text-gray-500 text-sm max-w-2xl mx-auto mb-4">{{ $t('sportsbook.footer_text') }}</p>
      <p class="text-gray-500 text-sm">{{ $t('sportsbook.copyright') }} &copy; {{ new Date().getFullYear() }}</p>
      <div class="flex items-center justify-center gap-6 mt-4">
        <button class="flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm">
          <UIcon name="i-lucide-help-circle" class="w-5 h-5" />
          {{ $t('sportsbook.faq') }}
        </button>
        <button class="flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm">
          <UIcon name="i-lucide-headphones" class="w-5 h-5" />
          {{ $t('sportsbook.live_support') }}
        </button>
      </div>
    </footer>

    <!-- Mobile Bottom Nav -->
    <SportsbookMobileBottomNav class="lg:hidden" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()
const { currentUser, games } = useMockData()

const search = ref('')

const gameNav = [
  { to: localePath('/sportsbook'), icon: 'i-lucide-home', label: 'Home' },
  { to: localePath('/prematch'), icon: 'i-lucide-calendar', label: 'Pre-Match' },
  { to: localePath('/sportsbook/starting-soon'), icon: 'i-lucide-clock', label: 'Starting Soon' },
  { to: localePath('/sportsbook/live'), icon: 'i-lucide-zap', label: 'Live Bet' },
  { to: localePath('/games'), icon: 'i-lucide-gamepad-2', label: 'Games' }
]

const sections = [
  { key: 'new', label: t('games_page.new_games') },
  { key: 'popular', label: t('games_page.popular') },
  { key: 'originals', label: t('games_page.originals') },
  { key: 'spotlight', label: t('games_page.spotlight') },
  { key: 'latest', label: t('games_page.latest_winners') }
]
</script>
