<template>
  <div class="match-feed">
    <!-- Page Header -->
    <div class="match-feed__header">
      <h2 class="match-feed__title">{{ $t('sportsbook.match_feed') }}</h2>
      <button class="match-feed__settings">
        <UIcon name="i-lucide-settings" class="w-5 h-5" />
      </button>
    </div>

    <!-- Feed Card -->
    <div ref="feedCardRef" class="match-feed__card">
      <!-- Tab Header -->
      <div class="match-feed__tabs">
        <button
          v-for="tab in feedTabs"
          :key="tab.key"
          class="match-feed__tab"
          :class="{ 'match-feed__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span v-if="tab.icon" class="match-feed__tab-icon">
            <UIcon :name="tab.icon" class="w-4 h-4" />
          </span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="match-feed__search">
        <div class="match-feed__search-input">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('sportsbook.team_name')"
            class="match-feed__search-field"
          />
          <UIcon name="i-lucide-search" class="match-feed__search-icon" />
        </div>
      </div>

      <!-- Match List -->
      <div v-if="filteredGroups.length > 0" class="match-feed__list">
        <div
          v-for="group in filteredGroups"
          :key="group.leagueId"
          class="match-feed__league-group"
        >
          <SportsbookLeagueGroupHeader
            :country-flag="group.countryFlag"
            :country-name="group.countryName"
            :league-name="group.leagueName"
            :match-count="group.matches.length"
          />
          <SportsbookEventCard
            v-for="match in group.matches"
            :key="match.id"
            :match="match"
            @odd-select="handleOddSelect"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="match-feed__empty">
        <p class="match-feed__empty-text">{{ $t('sportsbook.no_events') }}</p>
        <div class="match-feed__empty-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="6" fill="none" opacity="0.3"/>
            <line x1="75" y1="75" x2="105" y2="105" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity="0.3"/>
            <rect x="35" y="40" width="30" height="4" rx="2" fill="currentColor" opacity="0.2"/>
            <rect x="35" y="48" width="20" height="4" rx="2" fill="currentColor" opacity="0.15"/>
            <rect x="35" y="56" width="25" height="4" rx="2" fill="currentColor" opacity="0.1"/>
          </svg>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="match-feed__disclaimer">
        {{ $t('sportsbook.disclaimer') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { liveMatches, prematchMatches, popularMatches, groupMatchesByLeague } from '@mock/matches'
import type { Match, Market, MarketSelection } from '@mock/matches'

const { t } = useI18n()

const activeTab = ref<'live' | 'prematch' | 'popular'>('live')
const searchQuery = ref('')

// Container genişliğine göre market kolon sayısı
const feedCardRef = ref<HTMLElement | null>(null)
useMarketColumns(feedCardRef)

const feedTabs = [
  { key: 'live' as const, label: t('sportsbook.live'), icon: 'i-lucide-circle-dot' },
  { key: 'prematch' as const, label: t('sportsbook.prematch'), icon: 'i-lucide-calendar' },
  { key: 'popular' as const, label: t('sportsbook.popular_matches'), icon: 'i-lucide-star' }
]

const currentMatches = computed(() => {
  switch (activeTab.value) {
    case 'live': return liveMatches
    case 'prematch': return prematchMatches
    case 'popular': return popularMatches
    default: return []
  }
})

const filteredMatches = computed(() => {
  if (!searchQuery.value.trim()) return currentMatches.value
  const query = searchQuery.value.toLowerCase()
  return currentMatches.value.filter(m =>
    m.homeTeam.toLowerCase().includes(query) ||
    m.awayTeam.toLowerCase().includes(query) ||
    m.leagueName.toLowerCase().includes(query)
  )
})

const filteredGroups = computed(() => {
  return groupMatchesByLeague(filteredMatches.value)
})

function handleOddSelect(match: Match, market: Market, selection: MarketSelection) {
  // In a real app, this would add to betslip
  console.log('Odd selected:', match.homeTeam, 'vs', match.awayTeam, '-', market.name, ':', selection.label, '@', selection.odds)
}
</script>

<style scoped>
.match-feed {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ─── Header ─── */
.match-feed__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.match-feed__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-gray-800, #1f2937);
}
:root.dark .match-feed__title {
  color: var(--color-gray-100, #f3f4f6);
}
.match-feed__settings {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: none;
  color: var(--color-gray-400, #9ca3af);
  cursor: pointer;
  transition: color 0.12s, background 0.12s;
}
.match-feed__settings:hover {
  color: var(--color-gray-600, #4b5563);
  background: var(--color-gray-100, #f3f4f6);
}
:root.dark .match-feed__settings:hover {
  color: var(--color-gray-200, #e5e7eb);
  background: var(--color-gray-800, #1f2937);
}

/* ─── Card ─── */
.match-feed__card {
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
:root.dark .match-feed__card {
  border-color: var(--color-gray-800, #1f2937);
  background: var(--color-gray-900, #111827);
}

/* ─── Tabs ─── */
.match-feed__tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  padding: 0 4px;
}
:root.dark .match-feed__tabs {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.match-feed__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s;
  white-space: nowrap;
}
.match-feed__tab:hover {
  color: var(--color-gray-600, #4b5563);
}
:root.dark .match-feed__tab:hover {
  color: var(--color-gray-300, #d1d5db);
}
.match-feed__tab--active {
  color: var(--color-gray-800, #1f2937);
  border-bottom-color: var(--accent-500, #28a745);
}
:root.dark .match-feed__tab--active {
  color: var(--color-gray-100, #f3f4f6);
}

.match-feed__tab-icon {
  display: flex;
  align-items: center;
}
.match-feed__tab--active .match-feed__tab-icon {
  color: var(--accent-500, #28a745);
}

/* ─── Search ─── */
.match-feed__search {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
}
:root.dark .match-feed__search {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.match-feed__search-input {
  position: relative;
}
.match-feed__search-field {
  width: 100%;
  padding: 8px 12px;
  padding-right: 36px;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 6px;
  background: var(--color-gray-50, #f9fafb);
  font-size: 13px;
  color: var(--color-gray-800, #1f2937);
  outline: none;
  transition: border-color 0.12s;
}
:root.dark .match-feed__search-field {
  border-color: var(--color-gray-700, #374151);
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-100, #f3f4f6);
}
.match-feed__search-field:focus {
  border-color: var(--accent-500, #28a745);
}
.match-feed__search-field::placeholder {
  color: var(--color-gray-400, #9ca3af);
}
.match-feed__search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-gray-400, #9ca3af);
  pointer-events: none;
}

/* ─── Match List ─── */
.match-feed__list {
  display: flex;
  flex-direction: column;
}

.match-feed__league-group {
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .match-feed__league-group {
  border-bottom-color: var(--color-gray-800, #1f2937);
}
.match-feed__league-group:last-child {
  border-bottom: none;
}

/* ─── Empty State ─── */
.match-feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}
.match-feed__empty-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-400, #9ca3af);
}
.match-feed__empty-icon {
  color: var(--accent-500, #28a745);
  opacity: 0.5;
}

/* ─── Disclaimer ─── */
.match-feed__disclaimer {
  padding: 10px 16px;
  font-size: 11px;
  color: #d97706;
  text-align: center;
  border-top: 1px solid var(--color-gray-100, #f3f4f6);
  background: #fffbeb;
}
:root.dark .match-feed__disclaimer {
  background: rgba(217, 119, 6, 0.08);
  border-top-color: var(--color-gray-800, #1f2937);
}
</style>
