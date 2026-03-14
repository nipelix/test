<template>
  <div class="starting-soon-page">
    <!-- Header -->
    <div class="starting-soon-page__header">
      <div class="starting-soon-page__title-wrap">
        <UIcon name="i-lucide-clock" class="w-5 h-5" style="color: var(--accent-500);" />
        <h2 class="starting-soon-page__title">{{ $t('sportsbook.starting_soon') }}</h2>
      </div>
    </div>

    <!-- Match Feed Card -->
    <div v-if="groupedMatches.length > 0" ref="feedCardRef" class="starting-soon-page__card">
      <div
        v-for="group in groupedMatches"
        :key="group.leagueId"
        class="starting-soon-page__league-group"
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
    </div>

    <!-- Empty State -->
    <div v-else class="starting-soon-page__empty">
      <SharedEmptyStateIllustration />
    </div>
  </div>
</template>

<script setup lang="ts">
import { groupMatchesByLeague } from '@mock/matches'

definePageMeta({ layout: 'sportsbook' })

const { prematchMatches } = useMockData()

const feedCardRef = ref<HTMLElement | null>(null)
useMarketColumns(feedCardRef)

const startingSoonMatches = computed(() => prematchMatches.slice(0, 5))
const groupedMatches = computed(() => groupMatchesByLeague(startingSoonMatches.value))
</script>

<style scoped>
.starting-soon-page {
  display: flex;
  flex-direction: column;
}

.starting-soon-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.starting-soon-page__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.starting-soon-page__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-gray-800, #1f2937);
}
:root.dark .starting-soon-page__title {
  color: var(--color-gray-100, #f3f4f6);
}

.starting-soon-page__card {
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  margin: 0 16px 16px;
}
:root.dark .starting-soon-page__card {
  border-color: var(--color-gray-800, #1f2937);
  background: var(--color-gray-900, #111827);
}

.starting-soon-page__league-group {
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .starting-soon-page__league-group {
  border-bottom-color: var(--color-gray-800, #1f2937);
}
.starting-soon-page__league-group:last-child {
  border-bottom: none;
}

.starting-soon-page__empty {
  padding: 48px 16px;
  text-align: center;
}
</style>
