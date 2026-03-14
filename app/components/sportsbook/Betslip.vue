<template>
  <div class="betslip">
    <!-- BETSLIP / OPEN BETS Top Tabs -->
    <div class="betslip-main-tabs">
      <button
        v-for="tab in mainTabs"
        :key="tab.key"
        class="betslip-main-tab"
        :class="{ 'betslip-main-tab--active': activeMainTab === tab.key }"
        @click="activeMainTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- BETSLIP Tab Content -->
    <div v-if="activeMainTab === 'betslip'" class="betslip-content">
      <!-- Single / Combination / System Sub Tabs -->
      <div class="betslip-sub-tabs">
        <button
          v-for="tab in betTypeTabs"
          :key="tab.key"
          class="betslip-sub-tab"
          :class="{ 'betslip-sub-tab--active': activeBetType === tab.key }"
          @click="activeBetType = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Selections List (when has selections) -->
      <div v-if="selections.length > 0" class="betslip-selections">
        <!-- Odds Change Warnings -->
        <div v-if="oddsChanges.length > 0" class="betslip-warnings">
          <div
            v-for="(warning, idx) in oddsChanges"
            :key="idx"
            class="betslip-warning"
            :class="warning.type === 'info' ? 'betslip-warning--info' : 'betslip-warning--alert'"
          >
            <UIcon :name="warning.type === 'info' ? 'i-lucide-info' : 'i-lucide-triangle-alert'" class="w-3.5 h-3.5 flex-shrink-0" />
            <span>{{ warning.message }}</span>
          </div>
        </div>

        <!-- Selection Cards -->
        <div
          v-for="(sel, idx) in selections"
          :key="sel.id"
          class="betslip-selection"
        >
          <!-- Remove button (left strip) -->
          <button class="betslip-selection__remove" @click="removeSelection(idx)">
            <UIcon name="i-lucide-x" class="w-4 h-4" />
          </button>

          <!-- Selection content -->
          <div class="betslip-selection__content">
            <!-- Row 1: Market label + Selection name + Odds -->
            <div class="betslip-selection__header">
              <div class="betslip-selection__market">
                <span class="betslip-selection__label">{{ sel.periodLabel ? `${sel.periodLabel} - ` : '' }}{{ sel.marketLabel }}:</span>
                <span class="betslip-selection__name">{{ sel.selectionName }}</span>
              </div>
              <span class="betslip-selection__odds" :class="{ 'betslip-selection__odds--changed': sel.oddsChanged }">
                {{ sel.odds.toFixed(2) }}
              </span>
            </div>

            <!-- Row 2: Team names + Score -->
            <div class="betslip-selection__match">
              <span class="betslip-selection__teams">{{ sel.homeTeam }} - {{ sel.awayTeam }}</span>
              <span v-if="sel.score" class="betslip-selection__score">{{ sel.score }}</span>
            </div>

            <!-- Row 3: LIVE/Time badge + Stake (single mode only) -->
            <div class="betslip-selection__footer">
              <div class="betslip-selection__status-wrap">
                <span
                  v-if="sel.isLive"
                  class="betslip-selection__live-badge"
                >
                  <span class="betslip-selection__live-dot" />
                  LIVE
                  <span class="betslip-selection__live-time">{{ sel.matchTime }}</span>
                </span>
                <span v-else class="betslip-selection__time">
                  {{ sel.matchTime }}
                </span>
              </div>
              <div v-if="activeBetType === 'single'" class="betslip-selection__stake-wrap">
                <div class="betslip-selection__payout">
                  <span class="betslip-selection__payout-label">{{ $t('sportsbook.potential_payout') }}:</span>
                  <span class="betslip-selection__payout-value">₺{{ ((sel.stake || 0) * sel.odds).toFixed(2) }}</span>
                </div>
                <div class="betslip-selection__stake">
                  <span class="betslip-selection__currency">₺</span>
                  <input
                    v-model="sel.stake"
                    type="text"
                    class="betslip-selection__stake-input"
                    :placeholder="$t('sportsbook.stake')"
                    inputmode="decimal"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clear All Button -->
        <button class="betslip-clear" @click="clearSelections">
          <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
          <span>{{ $t('sportsbook.remove_all') }}</span>
        </button>

        <!-- Separator -->
        <div class="betslip-separator" />

        <!-- Coupon Name Input -->
        <div class="betslip-name-input">
          <input
            v-model="couponName"
            type="text"
            class="betslip-name-field"
            :placeholder="$t('sportsbook.coupon_name_placeholder')"
          />
        </div>

        <!-- Separator -->
        <div class="betslip-separator" />

        <!-- Combination Stake (only for combination) -->
        <div v-if="activeBetType === 'combination'" class="betslip-bet-fields">
          <div class="betslip-bet-field">
            <span class="betslip-bet-field__label">{{ $t('sportsbook.stake') }}</span>
            <div class="betslip-bet-field__input-wrap">
              <span class="betslip-bet-field__currency">₺</span>
              <input
                v-model="combinationStake"
                type="text"
                class="betslip-bet-field__input"
                :placeholder="$t('sportsbook.stake')"
                inputmode="decimal"
              />
            </div>
          </div>
          <div class="betslip-separator" />
        </div>

        <!-- System Bet Fields -->
        <div v-if="activeBetType === 'system'" class="betslip-bet-fields">
          <div
            v-for="bt in systemBetTypes"
            :key="bt.id"
            class="betslip-bet-field"
          >
            <div class="betslip-bet-field__info">
              <span class="betslip-bet-field__label">{{ bt.label }}</span>
              <span class="betslip-bet-field__multiplier">{{ bt.count }}x</span>
            </div>
            <div class="betslip-bet-field__input-wrap">
              <span class="betslip-bet-field__currency">₺</span>
              <input
                v-model="bt.stake"
                type="text"
                class="betslip-bet-field__input"
                :placeholder="$t('sportsbook.stake')"
                :disabled="systemComboStake !== ''"
                inputmode="decimal"
              />
            </div>
          </div>
          <!-- Combos row -->
          <div v-if="systemCombosKey" class="betslip-bet-field betslip-bet-field--combo">
            <div class="betslip-bet-field__info">
              <span class="betslip-bet-field__label betslip-bet-field__label--accent">{{ systemCombosKey }}</span>
              <span class="betslip-bet-field__multiplier">{{ systemCombosCount }}x</span>
            </div>
            <div class="betslip-bet-field__input-wrap">
              <span class="betslip-bet-field__currency">₺</span>
              <input
                v-model="systemComboStake"
                type="text"
                class="betslip-bet-field__input"
                :placeholder="$t('sportsbook.stake')"
                inputmode="decimal"
              />
            </div>
          </div>
          <div class="betslip-separator" />
        </div>

        <!-- Summary -->
        <div class="betslip-summary">
          <!-- Single Summary -->
          <template v-if="activeBetType === 'single'">
            <div class="betslip-summary__row">
              <span class="betslip-summary__label">{{ $t('sportsbook.total_stake') }}</span>
              <span class="betslip-summary__value">₺{{ totalStakeSingle.toFixed(2) }}</span>
            </div>
            <div class="betslip-summary__row">
              <span class="betslip-summary__label betslip-summary__label--bold">{{ $t('sportsbook.potential_payout') }}</span>
              <span class="betslip-summary__value betslip-summary__value--accent betslip-summary__value--bold">₺{{ potentialPayoutSingle.toFixed(2) }}</span>
            </div>
          </template>

          <!-- Combination Summary -->
          <template v-if="activeBetType === 'combination'">
            <div class="betslip-summary__row">
              <span class="betslip-summary__label">{{ $t('sportsbook.total_stake') }}</span>
              <span class="betslip-summary__value">₺{{ (Number(combinationStake) || 0).toFixed(2) }}</span>
            </div>
            <div class="betslip-summary__row">
              <span class="betslip-summary__label">{{ $t('sportsbook.total_odds') }}</span>
              <span class="betslip-summary__value betslip-summary__value--bold">{{ totalOddsCombination.toFixed(2) }}</span>
            </div>
            <div class="betslip-summary__row">
              <span class="betslip-summary__label betslip-summary__label--bold">{{ $t('sportsbook.potential_payout') }}</span>
              <span class="betslip-summary__value betslip-summary__value--accent betslip-summary__value--bold">₺{{ potentialPayoutCombination.toFixed(2) }}</span>
            </div>
          </template>

          <!-- System Summary -->
          <template v-if="activeBetType === 'system'">
            <div class="betslip-summary__row">
              <span class="betslip-summary__label">{{ $t('sportsbook.total_stake') }}</span>
              <span class="betslip-summary__value">₺{{ systemTotalStake.toFixed(2) }}</span>
            </div>
            <div class="betslip-summary__row">
              <span class="betslip-summary__label">{{ $t('sportsbook.total_bets') }}</span>
              <span class="betslip-summary__value betslip-summary__value--bold">{{ systemTotalBets }}</span>
            </div>
            <div class="betslip-summary__row">
              <span class="betslip-summary__label betslip-summary__label--bold">{{ $t('sportsbook.potential_payout') }}</span>
              <span class="betslip-summary__value betslip-summary__value--accent betslip-summary__value--bold">₺{{ systemPotentialPayout.toFixed(2) }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Empty state (when no selections) -->
      <div v-else class="betslip-empty">
        <p class="betslip-empty__text">
          {{ activeBetType === 'single' ? $t('sportsbook.no_selections') : activeBetType === 'combination' ? $t('sportsbook.no_selections_combination') : $t('sportsbook.no_selections_system') }}
        </p>
        <img
          :src="activeBetType === 'single' ? '/icons/betslip-selections-single.svg' : activeBetType === 'system' ? '/icons/betslip-selections-system.svg' : '/icons/betslip-selections-combi.svg'"
          alt=""
          class="betslip-empty__icon"
        />
      </div>

      <!-- Footer -->
      <div class="betslip-footer">
        <!-- Place Bet Button -->
        <button
          class="betslip-place-btn"
          :disabled="selections.length === 0"
        >
          {{ $t('sportsbook.place_bet') }}
        </button>

        <!-- Previous Coupon -->
        <button class="betslip-prev-coupon">
          <img src="/icons/prev-coupon.svg" alt="" class="betslip-prev-coupon__icon" />
          <span>{{ $t('sportsbook.previous_coupon') }}</span>
        </button>
      </div>
    </div>

    <!-- OPEN BETS Tab Content -->
    <div v-else class="betslip-open-bets">
      <p class="betslip-open-bets__empty">{{ $t('common.no_result') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const activeMainTab = ref('betslip')
const activeBetType = ref('single')
const couponName = ref('')
const combinationStake = ref('')

const mainTabs = [
  { key: 'betslip', label: t('sportsbook.betslip') },
  { key: 'open_bets', label: t('sportsbook.open_bets') }
]

const betTypeTabs = [
  { key: 'single', label: t('sportsbook.single') },
  { key: 'combination', label: t('sportsbook.combination') },
  { key: 'system', label: t('sportsbook.system') }
]

// Mock selections (empty by default — will be populated when user clicks odds)
interface BetSelection {
  id: string
  homeTeam: string
  awayTeam: string
  score?: string
  isLive: boolean
  matchTime: string
  periodLabel?: string
  marketLabel: string
  selectionName: string
  odds: number
  oddsChanged?: boolean
  stake?: number
}

const selections = ref<BetSelection[]>([
  {
    id: 'sel-1',
    homeTeam: 'Galatasaray',
    awayTeam: 'Fenerbahçe',
    score: '1 - 0',
    isLive: true,
    matchTime: '67\'',
    periodLabel: 'Full Time',
    marketLabel: 'Match Result',
    selectionName: 'Galatasaray',
    odds: 2.10,
    stake: 50
  },
  {
    id: 'sel-2',
    homeTeam: 'Manchester City',
    awayTeam: 'Real Madrid',
    isLive: false,
    matchTime: '21:45',
    periodLabel: 'Full Time',
    marketLabel: 'Over/Under 2.5',
    selectionName: 'Over 2.5',
    odds: 1.85,
    stake: 100
  },
  {
    id: 'sel-3',
    homeTeam: 'Barcelona',
    awayTeam: 'Bayern Munich',
    score: '2 - 2',
    isLive: true,
    matchTime: '82\'',
    marketLabel: 'Both Teams Score',
    selectionName: 'Yes',
    odds: 1.45,
    stake: 75
  },
  {
    id: 'sel-4',
    homeTeam: 'Beşiktaş',
    awayTeam: 'Trabzonspor',
    isLive: false,
    matchTime: '19:00',
    periodLabel: '1st Half',
    marketLabel: 'Over/Under 1.5',
    selectionName: 'Over 1.5',
    odds: 1.72,
    stake: 60
  },
  {
    id: 'sel-5',
    homeTeam: 'Liverpool',
    awayTeam: 'Arsenal',
    score: '0 - 1',
    isLive: true,
    matchTime: '34\'',
    periodLabel: 'Full Time',
    marketLabel: 'Match Result',
    selectionName: 'Arsenal',
    odds: 3.20,
    stake: 30
  },
  {
    id: 'sel-6',
    homeTeam: 'PSG',
    awayTeam: 'Juventus',
    isLive: false,
    matchTime: '20:00',
    periodLabel: 'Full Time',
    marketLabel: 'Over/Under 2.5',
    selectionName: 'Under 2.5',
    odds: 2.05,
    stake: 40
  }
])

// Odds change warnings (mock)
const oddsChanges = ref([
  { type: 'alert', message: 'Some odds have changed since you added them to your betslip.' },
  { type: 'info', message: 'Galatasaray - Fenerbahçe: Match Result odds updated from 2.15 to 2.10' }
])

function removeSelection(idx: number) {
  selections.value.splice(idx, 1)
  if (selections.value.length === 0) {
    oddsChanges.value = []
  }
}

function clearSelections() {
  selections.value = []
  oddsChanges.value = []
}

const totalStakeSingle = computed(() => {
  return selections.value.reduce((sum, s) => sum + (s.stake || 0), 0)
})

const potentialPayoutSingle = computed(() => {
  return selections.value.reduce((sum, s) => sum + (s.stake || 0) * s.odds, 0)
})

const totalOddsCombination = computed(() => {
  if (selections.value.length === 0) return 0
  return selections.value.reduce((acc, s) => acc * s.odds, 1)
})

const potentialPayoutCombination = computed(() => {
  return (Number(combinationStake.value) || 0) * totalOddsCombination.value
})

// ─── System Bet Logic ───

const COMBOS_KEYS: Record<number, string> = {
  3: 'Trixie',
  4: 'Yankee',
  5: 'Canadian',
  6: 'Heinz',
  7: 'Super Heinz',
  8: 'Goliath'
}

const BET_TYPE_LABELS: Record<number, string> = {
  1: 'Singles',
  2: 'Doubles',
  3: 'Trebles',
  4: 'Four-folds',
  5: 'Five-folds',
  6: 'Six-folds',
  7: 'Seven-folds',
  8: 'Eight-folds'
}

function combinations(n: number, r: number): number {
  if (r > n) return 0
  if (r === 0 || r === n) return 1
  let result = 1
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1)
  }
  return Math.round(result)
}

interface SystemBetType {
  id: number
  label: string
  count: number
  stake: string
}

const systemBetTypes = ref<SystemBetType[]>([])
const systemComboStake = ref('')

watch([selections, activeBetType], () => {
  if (activeBetType.value === 'system') {
    const n = selections.value.length
    const types: SystemBetType[] = []
    for (let r = 2; r <= n; r++) {
      types.push({
        id: r,
        label: BET_TYPE_LABELS[r] || `${r}-folds`,
        count: combinations(n, r),
        stake: ''
      })
    }
    systemBetTypes.value = types
  }
}, { immediate: true })

const systemCombosKey = computed(() => {
  const n = selections.value.length
  return COMBOS_KEYS[n] || (n > 2 ? `Combo ${n}` : null)
})

const systemCombosCount = computed(() => {
  return systemBetTypes.value
    .filter(bt => bt.id >= 2)
    .reduce((sum, bt) => sum + bt.count, 0)
})

const systemTotalStake = computed(() => {
  let total = 0
  const comboVal = Number(systemComboStake.value) || 0
  for (const bt of systemBetTypes.value) {
    const stake = comboVal > 0 ? comboVal : (Number(bt.stake) || 0)
    total += stake * bt.count
  }
  return total
})

const systemTotalBets = computed(() => {
  let total = 0
  const comboVal = Number(systemComboStake.value) || 0
  for (const bt of systemBetTypes.value) {
    const stake = comboVal > 0 ? comboVal : (Number(bt.stake) || 0)
    if (stake > 0) {
      total += bt.count
    }
  }
  return total
})

function getSystemCombinationOdds(sels: BetSelection[], r: number): number[][] {
  const odds = sels.map(s => s.odds)
  const result: number[][] = []
  function combine(start: number, combo: number[]) {
    if (combo.length === r) { result.push([...combo]); return }
    for (let i = start; i < odds.length; i++) {
      combo.push(odds[i])
      combine(i + 1, combo)
      combo.pop()
    }
  }
  combine(0, [])
  return result
}

const systemPotentialPayout = computed(() => {
  let total = 0
  const sels = selections.value
  const comboVal = Number(systemComboStake.value) || 0
  for (const bt of systemBetTypes.value) {
    const stake = comboVal > 0 ? comboVal : (Number(bt.stake) || 0)
    if (stake > 0) {
      const combos = getSystemCombinationOdds(sels, bt.id)
      for (const combo of combos) {
        const comboOdds = combo.reduce((a, b) => a * b, 1)
        total += stake * comboOdds
      }
    }
  }
  return total
})
</script>

<style scoped>
.betslip {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ─── Main Tabs (BETSLIP / OPEN BETS) ─── */
.betslip-main-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .betslip-main-tabs {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.betslip-main-tab {
  flex: 1;
  padding: 14px 0;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-gray-400, #9ca3af);
  cursor: pointer;
  transition: color 0.16s, border-color 0.16s;
  letter-spacing: 0.02em;
}
.betslip-main-tab:hover {
  color: var(--color-gray-600, #4b5563);
}
:root.dark .betslip-main-tab:hover {
  color: var(--color-gray-300, #d1d5db);
}
.betslip-main-tab--active {
  color: var(--accent-500);
  border-bottom-color: var(--accent-500);
}
:root.dark .betslip-main-tab--active {
  color: var(--accent-500);
  border-bottom-color: var(--accent-500);
}

/* ─── Sub Tabs (Single / Combination / System) ─── */
.betslip-sub-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .betslip-sub-tabs {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.betslip-sub-tab {
  flex: 1;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-gray-400, #9ca3af);
  cursor: pointer;
  transition: color 0.16s, border-color 0.16s;
}
.betslip-sub-tab:hover {
  color: var(--color-gray-600, #4b5563);
}
:root.dark .betslip-sub-tab:hover {
  color: var(--color-gray-300, #d1d5db);
}
.betslip-sub-tab--active {
  color: var(--accent-500);
  font-weight: 600;
  border-bottom-color: var(--accent-500);
}

/* ─── Content Area ─── */
.betslip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ─── Warnings / Odds Changes ─── */
.betslip-warnings {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.betslip-warning {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.4;
}
.betslip-warning--alert {
  background: #fef3c7;
  color: #92400e;
  border-bottom: 1px solid #fde68a;
}
:root.dark .betslip-warning--alert {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-bottom-color: rgba(245, 158, 11, 0.2);
}
.betslip-warning--info {
  background: #dbeafe;
  color: #1e40af;
  border-bottom: 1px solid #bfdbfe;
}
:root.dark .betslip-warning--info {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border-bottom-color: rgba(59, 130, 246, 0.2);
}

/* ─── Empty State ─── */
.betslip-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  gap: 16px;
}
.betslip-empty__text {
  font-size: 13px;
  color: var(--color-gray-400, #9ca3af);
  line-height: 1.5;
}
.betslip-empty__icon {
  width: 160px;
  opacity: 0.6;
}
:root.dark .betslip-empty__icon {
  filter: brightness(0.7) invert(0.1);
}

/* ─── Selections List ─── */
.betslip-selections {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* ─── Single Selection Card (NEW DESIGN) ─── */
.betslip-selection {
  display: flex;
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
}
:root.dark .betslip-selection {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.betslip-selection__remove {
  width: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100, #f3f4f6);
  color: var(--color-gray-400, #9ca3af);
  border: none;
  cursor: pointer;
  transition: background 0.16s, color 0.16s;
}
:root.dark .betslip-selection__remove {
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-500, #6b7280);
}
.betslip-selection__remove:hover {
  background: #fee2e2;
  color: #ef4444;
}
:root.dark .betslip-selection__remove:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.betslip-selection__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  width: 100%;
  overflow: hidden;
}

/* Row 1: Market label + odds (NEW: market first, odds right) */
.betslip-selection__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.betslip-selection__market {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}
.betslip-selection__label {
  font-size: 12px;
  color: var(--color-gray-400, #9ca3af);
  white-space: nowrap;
  flex-shrink: 0;
}
.betslip-selection__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gray-800, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:root.dark .betslip-selection__name {
  color: var(--color-gray-100, #f3f4f6);
}
.betslip-selection__odds {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-500);
  flex-shrink: 0;
}
.betslip-selection__odds--changed {
  color: #f59e0b;
}

/* Row 2: Team names + score */
.betslip-selection__match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.betslip-selection__teams {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-500, #6b7280);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:root.dark .betslip-selection__teams {
  color: var(--color-gray-400, #9ca3af);
}
.betslip-selection__score {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gray-700, #374151);
  flex-shrink: 0;
}
:root.dark .betslip-selection__score {
  color: var(--color-gray-200, #e5e7eb);
}

/* Row 3: LIVE badge / Time + Stake area */
.betslip-selection__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  margin-top: 2px;
}

.betslip-selection__status-wrap {
  display: flex;
  align-items: center;
}

.betslip-selection__live-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}
.betslip-selection__live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ef4444;
  animation: betslip-pulse 1.5s infinite;
}
@keyframes betslip-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.betslip-selection__live-time {
  font-size: 10px;
  font-weight: 600;
  color: #ef4444;
  margin-left: 2px;
}

.betslip-selection__time {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-gray-400, #9ca3af);
}

/* Stake wrap (single mode only) */
.betslip-selection__stake-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.betslip-selection__payout {
  display: flex;
  align-items: center;
  gap: 4px;
}
.betslip-selection__payout-label {
  font-size: 10px;
  color: var(--color-gray-400, #9ca3af);
  white-space: nowrap;
}
.betslip-selection__payout-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-gray-600, #4b5563);
}
:root.dark .betslip-selection__payout-value {
  color: var(--color-gray-300, #d1d5db);
}

/* Stake input */
.betslip-selection__stake {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 110px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 6px;
  background: var(--color-gray-50, #f9fafb);
}
:root.dark .betslip-selection__stake {
  border-color: var(--color-gray-700, #374151);
  background: var(--color-gray-800, #1f2937);
}
.betslip-selection__currency {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  flex-shrink: 0;
}
.betslip-selection__stake-input {
  width: 100%;
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  color: var(--color-gray-800, #1f2937);
}
:root.dark .betslip-selection__stake-input {
  color: var(--color-gray-100, #f3f4f6);
}
.betslip-selection__stake-input::placeholder {
  color: var(--color-gray-300, #d1d5db);
  font-weight: 400;
}
:root.dark .betslip-selection__stake-input::placeholder {
  color: var(--color-gray-600, #4b5563);
}

/* ─── Clear All Button ─── */
.betslip-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.16s;
}
.betslip-clear:hover {
  color: #ef4444;
}

/* ─── Separator ─── */
.betslip-separator {
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
}
:root.dark .betslip-separator {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

/* ─── Coupon Name Input ─── */
.betslip-name-input {
  padding: 8px;
}
.betslip-name-field {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 6px;
  background: var(--color-gray-50, #f9fafb);
  font-size: 13px;
  color: var(--color-gray-800, #1f2937);
  outline: none;
  transition: border-color 0.16s;
}
:root.dark .betslip-name-field {
  border-color: var(--color-gray-700, #374151);
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-100, #f3f4f6);
}
.betslip-name-field:focus {
  border-color: var(--accent-500);
}
.betslip-name-field::placeholder {
  color: var(--color-gray-300, #d1d5db);
}
:root.dark .betslip-name-field::placeholder {
  color: var(--color-gray-600, #4b5563);
}

/* ─── Bet Fields (Combination & System) ─── */
.betslip-bet-fields {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.betslip-bet-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.betslip-bet-field__info {
  display: flex;
  align-items: center;
  gap: 6px;
}
.betslip-bet-field__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-500, #6b7280);
}
:root.dark .betslip-bet-field__label {
  color: var(--color-gray-400, #9ca3af);
}
.betslip-bet-field__label--accent {
  color: var(--accent-500);
  font-weight: 700;
}
.betslip-bet-field__multiplier {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-gray-400, #9ca3af);
  background: var(--color-gray-100, #f3f4f6);
  padding: 1px 6px;
  border-radius: 4px;
}
:root.dark .betslip-bet-field__multiplier {
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-500, #6b7280);
}
.betslip-bet-field__input-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
  max-width: 120px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 6px;
  background: var(--color-gray-50, #f9fafb);
}
:root.dark .betslip-bet-field__input-wrap {
  border-color: var(--color-gray-700, #374151);
  background: var(--color-gray-800, #1f2937);
}
.betslip-bet-field__currency {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  flex-shrink: 0;
}
.betslip-bet-field__input {
  width: 100%;
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  color: var(--color-gray-800, #1f2937);
}
:root.dark .betslip-bet-field__input {
  color: var(--color-gray-100, #f3f4f6);
}
.betslip-bet-field__input::placeholder {
  color: var(--color-gray-300, #d1d5db);
  font-weight: 400;
}
:root.dark .betslip-bet-field__input::placeholder {
  color: var(--color-gray-600, #4b5563);
}
.betslip-bet-field__input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.betslip-bet-field--combo {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-gray-200, #e5e7eb);
}
:root.dark .betslip-bet-field--combo {
  border-top-color: var(--color-gray-700, #374151);
}

/* ─── Summary ─── */
.betslip-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}
.betslip-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.betslip-summary__label {
  font-size: 12px;
  color: var(--color-gray-500, #6b7280);
}
:root.dark .betslip-summary__label {
  color: var(--color-gray-400, #9ca3af);
}
.betslip-summary__label--bold {
  font-weight: 700;
}
.betslip-summary__value {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-700, #374151);
}
:root.dark .betslip-summary__value {
  color: var(--color-gray-200, #e5e7eb);
}
.betslip-summary__value--bold {
  font-weight: 700;
}
.betslip-summary__value--accent {
  color: var(--accent-500);
}

/* ─── Footer ─── */
.betslip-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--color-gray-100, #f3f4f6);
}
:root.dark .betslip-footer {
  border-top-color: var(--color-gray-800, #1f2937);
}

/* Place Bet Button (Warning / Amber style) */
.betslip-place-btn {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  background: #f59e0b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.16s, opacity 0.16s;
}
.betslip-place-btn:hover {
  background: #d97706;
}
.betslip-place-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Previous Coupon Button */
.betslip-prev-coupon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-500, #6b7280);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.16s;
}
:root.dark .betslip-prev-coupon {
  color: var(--color-gray-400, #9ca3af);
}
.betslip-prev-coupon:hover {
  color: var(--accent-500);
}
.betslip-prev-coupon__icon {
  width: 20px;
  height: 20px;
  opacity: 0.5;
}
:root.dark .betslip-prev-coupon__icon {
  filter: brightness(0) invert(0.5);
}

/* ─── Open Bets Empty ─── */
.betslip-open-bets {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.betslip-open-bets__empty {
  font-size: 13px;
  color: var(--color-gray-400, #9ca3af);
}
</style>
