<template>
  <div class="live-page">
    <!-- Header -->
    <div class="live-page__header">
      <div class="live-page__title-wrap">
        <span class="live-page__dot" />
        <h2 class="live-page__title">{{ $t('sportsbook.live') }}</h2>
      </div>
      <button class="live-page__settings">
        <UIcon name="i-lucide-settings" class="w-5 h-5" />
      </button>
    </div>

    <!-- Sport tabs -->
    <div class="live-page__sport-tabs">
      <button
        v-for="sport in sportTabs"
        :key="sport"
        class="live-page__sport-tab"
        :class="{ 'live-page__sport-tab--active': activeSport === sport }"
        @click="activeSport = sport"
      >
        {{ sport }}
      </button>
    </div>

    <!-- Match Feed Card -->
    <div v-if="groupedMatches.length > 0" ref="feedCardRef" class="live-page__card">
      <div
        v-for="group in groupedMatches"
        :key="group.leagueId"
        class="live-page__league-group"
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
        />
      </div>

      <!-- Disclaimer -->
      <div class="live-page__disclaimer">
        {{ $t('sportsbook.disclaimer') }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="live-page__empty">
      <SharedEmptyStateIllustration />
    </div>
  </div>
</template>

<script setup lang="ts">
import { groupMatchesByLeague } from '@mock/matches'

definePageMeta({ layout: 'sportsbook' })

const { liveMatches } = useMockData()

const feedCardRef = ref<HTMLElement | null>(null)
useMarketColumns(feedCardRef)

const activeSport = ref('All')
const sportTabs = ['All', 'Football', 'Tennis', 'Basketball']

const filteredMatches = computed(() => {
  if (activeSport.value === 'All') return liveMatches
  return liveMatches.filter(m => m.sportName === activeSport.value)
})

const groupedMatches = computed(() => groupMatchesByLeague(filteredMatches.value))
</script>

<style scoped>
.live-page {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.live-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.live-page__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.live-page__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  animation: live-pulse 1.5s infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.live-page__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-gray-800, #1f2937);
}
:root.dark .live-page__title {
  color: var(--color-gray-100, #f3f4f6);
}
.live-page__settings {
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
}

/* Sport tabs */
.live-page__sport-tabs {
  display: flex;
  gap: 6px;
  padding: 0 16px 12px;
  overflow-x: auto;
}
.live-page__sport-tab {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 16px;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  background: none;
  color: var(--color-gray-500, #6b7280);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.12s;
}
:root.dark .live-page__sport-tab {
  border-color: var(--color-gray-700, #374151);
  color: var(--color-gray-400, #9ca3af);
}
.live-page__sport-tab:hover {
  border-color: var(--accent-500);
  color: var(--accent-500);
}
.live-page__sport-tab--active {
  background: var(--accent-500);
  border-color: var(--accent-500);
  color: #fff;
}

/* Card */
.live-page__card {
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  margin: 0 16px 16px;
}
:root.dark .live-page__card {
  border-color: var(--color-gray-800, #1f2937);
  background: var(--color-gray-900, #111827);
}

.live-page__league-group {
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .live-page__league-group {
  border-bottom-color: var(--color-gray-800, #1f2937);
}
.live-page__league-group:last-child {
  border-bottom: none;
}

.live-page__disclaimer {
  padding: 10px 16px;
  font-size: 11px;
  color: #d97706;
  text-align: center;
  border-top: 1px solid var(--color-gray-100, #f3f4f6);
  background: #fffbeb;
}
:root.dark .live-page__disclaimer {
  background: rgba(217, 119, 6, 0.08);
  border-top-color: var(--color-gray-800, #1f2937);
}

.live-page__empty {
  padding: 48px 16px;
  text-align: center;
}
</style>
