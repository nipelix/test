<template>
  <div class="event-row" @click="$emit('matchClick', match)">
    <!-- Left: Match Details -->
    <div class="event-details">
      <!-- Status badge -->
      <div class="event-status">
        <template v-if="match.status === 'live'">
          <span class="event-live-badge">
            <span class="event-live-dot" />
            LIVE
          </span>
          <span class="event-minute">{{ match.minute }}'</span>
        </template>
        <template v-else>
          <span class="event-time">{{ formatTime(match.startTime) }}</span>
          <span class="event-date">{{ formatDate(match.startTime) }}</span>
        </template>
      </div>

      <!-- Team Names + Scores -->
      <div class="event-teams">
        <div class="event-team">
          <span class="event-team-name">{{ match.homeTeam }}</span>
          <span v-if="match.score" class="event-team-score" :class="{ 'event-team-score--winning': match.score.home > match.score.away }">{{ match.score.home }}</span>
        </div>
        <div class="event-team">
          <span class="event-team-name">{{ match.awayTeam }}</span>
          <span v-if="match.score" class="event-team-score" :class="{ 'event-team-score--winning': match.score.away > match.score.home }">{{ match.score.away }}</span>
        </div>
      </div>

      <!-- Statistics (live only) -->
      <div v-if="match.status === 'live' && (match.corners || match.yellowCards)" class="event-stats">
        <span v-if="match.corners" class="event-stat" title="Corners">
          <UIcon name="i-lucide-corner-down-right" class="w-3 h-3" />
          {{ match.corners.home }}-{{ match.corners.away }}
        </span>
        <span v-if="match.yellowCards" class="event-stat" title="Yellow Cards">
          <span class="event-stat-card event-stat-card--yellow" />
          {{ match.yellowCards.home }}-{{ match.yellowCards.away }}
        </span>
      </div>

      <!-- Markets count badge -->
      <div class="event-markets-count">
        +{{ match.marketsCount }}
      </div>
    </div>

    <!-- Right: Dynamic Market Columns -->
    <div class="event-markets">
      <div
        v-for="market in visibleMarkets"
        :key="market.id"
        class="event-market"
      >
        <div class="event-market-header">{{ marketLabel(market) }}</div>
        <div
          class="event-market-selections"
          :class="market.selections.length === 3 ? 'event-market-selections--3' : 'event-market-selections--2'"
        >
          <button
            v-for="sel in market.selections"
            :key="sel.id"
            class="odds-btn"
            :class="{
              'odds-btn--selected': sel.isSelected,
              'odds-btn--locked': sel.isLocked
            }"
            @click.stop="selectOdd(match, market, sel)"
          >
            <span class="odds-btn__label">{{ sel.label }}</span>
            <span class="odds-btn__value">{{ sel.isLocked ? '-' : sel.odds.toFixed(2) }}</span>
            <span v-if="sel.isLocked" class="odds-btn__lock">
              <UIcon name="i-lucide-lock" class="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Match, Market, MarketSelection } from '@mock/matches'

const MARKET_LABELS: Record<string, string> = {
  'match-result': 'sportsbook.match_result',
  'over-under': 'sportsbook.over_under',
  'both-teams-score': 'sportsbook.both_teams_score',
  'double-chance': 'sportsbook.double_chance'
}

const props = defineProps<{
  match: Match
}>()

const emit = defineEmits<{
  matchClick: [match: Match]
  oddSelect: [match: Match, market: Market, selection: MarketSelection]
}>()

const { t } = useI18n()

// Parent container'dan kolon sayısını al (MatchFeed provide eder)
// Eğer provide yoksa (standalone kullanım) fallback 3
const injectedColumns = inject<Ref<number>>('marketColumns', ref(3))

const visibleMarkets = computed(() => {
  return props.match.markets.slice(0, injectedColumns.value)
})

function marketLabel(market: Market): string {
  const key = MARKET_LABELS[market.id]
  return key ? t(key) : market.name
}

function selectOdd(match: Match, market: Market, selection: MarketSelection) {
  if (selection.isLocked) return
  emit('oddSelect', match, market, selection)
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
/* ─── Event Row ─── */
.event-row {
  display: flex;
  align-items: stretch;
  min-height: 64px;
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
  cursor: pointer;
  transition: background 0.12s;
}
:root.dark .event-row {
  border-bottom-color: var(--color-gray-800, #1f2937);
}
.event-row:hover {
  background: var(--color-gray-50, #f9fafb);
}
:root.dark .event-row:hover {
  background: var(--color-gray-800/50);
}

/* ─── Left: Match Details ─── */
.event-details {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  min-width: 160px;
  width: 30%;
  padding: 8px 12px;
}

/* Status (LIVE badge or time) */
.event-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  flex-shrink: 0;
  gap: 2px;
}

.event-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.event-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse-dot 1.5s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.event-minute {
  font-size: 11px;
  font-weight: 600;
  color: #ef4444;
}

.event-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-700, #374151);
}
:root.dark .event-time {
  color: var(--color-gray-200, #e5e7eb);
}
.event-date {
  font-size: 10px;
  color: var(--color-gray-400, #9ca3af);
}

/* Teams */
.event-teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.event-team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.event-team-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-800, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:root.dark .event-team-name {
  color: var(--color-gray-100, #f3f4f6);
}
.event-team-score {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-600, #4b5563);
  min-width: 16px;
  text-align: center;
}
:root.dark .event-team-score {
  color: var(--color-gray-300, #d1d5db);
}
.event-team-score--winning {
  color: var(--color-gray-900, #111827);
}
:root.dark .event-team-score--winning {
  color: #fff;
}

/* Statistics */
.event-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.event-stat {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: var(--color-gray-400, #9ca3af);
}
.event-stat-card {
  width: 8px;
  height: 10px;
  border-radius: 1px;
}
.event-stat-card--yellow {
  background: #eab308;
}
.event-stat-card--red {
  background: #ef4444;
}

/* Markets count */
.event-markets-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ─── Right: Markets ─── */
.event-markets {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
}

.event-market {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 6px;
  border-left: 1px solid var(--color-gray-100, #f3f4f6);
  flex: 1;
  min-width: 0;
}
:root.dark .event-market {
  border-left-color: var(--color-gray-800, #1f2937);
}

.event-market-header {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  text-align: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Selections grid */
.event-market-selections {
  display: grid;
  gap: 2px;
}
.event-market-selections--3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.event-market-selections--2 {
  grid-template-columns: 1fr 1fr;
}

/* ─── Odds Buttons ─── */
.odds-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  height: 40px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: var(--color-gray-100, #f3f4f6);
  transition: background 0.12s, box-shadow 0.12s;
  overflow: hidden;
}
:root.dark .odds-btn {
  background: var(--color-gray-800, #1f2937);
}
.odds-btn:hover {
  background: var(--color-gray-200, #e5e7eb);
}
:root.dark .odds-btn:hover {
  background: var(--color-gray-700, #374151);
}

.odds-btn--selected {
  background: var(--accent-500, #28a745) !important;
  color: #fff !important;
}
.odds-btn--selected .odds-btn__label,
.odds-btn--selected .odds-btn__value {
  color: #fff !important;
}

.odds-btn--locked {
  cursor: not-allowed;
  opacity: 0.5;
}

.odds-btn__label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-gray-400, #9ca3af);
  line-height: 1;
}

.odds-btn__value {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gray-800, #1f2937);
  line-height: 1;
}
:root.dark .odds-btn__value {
  color: var(--color-gray-100, #f3f4f6);
}

.odds-btn__lock {
  position: absolute;
  bottom: 2px;
  right: 2px;
  color: var(--color-gray-400, #9ca3af);
}

/* ─── Mobile: stack layout ─── */
@media (max-width: 540px) {
  .event-row {
    flex-direction: column;
  }
  .event-details {
    width: 100%;
  }
  .event-markets {
    padding: 4px 8px 8px;
    border-top: 1px solid var(--color-gray-100, #f3f4f6);
  }
  :root.dark .event-markets {
    border-top-color: var(--color-gray-800, #1f2937);
  }
  .event-market {
    border-left: none;
  }
}
</style>
