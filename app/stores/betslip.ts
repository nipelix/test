import { defineStore } from 'pinia'

interface BetSelection {
  id: string
  matchId: number
  marketId: number
  selectionId: number
  selectionName: string
  marketName: string
  homeTeam: string
  awayTeam: string
  odds: number
  isLive: boolean
}

export type BetCategory = 'single' | 'combination' | 'system'

interface BetslipState {
  selections: Map<string, BetSelection>
  stakes: Record<string, number>
  category: BetCategory
  couponName: string
  isLocked: boolean
}

export const useBetslipStore = defineStore('betslip', () => {
  // ── State ──
  const selections = ref<Map<string, BetSelection>>(new Map())
  const stakes = ref<Record<string, number>>({})
  const category = ref<BetCategory>('single')
  const couponName = ref('')
  const isLocked = ref(false)
  const lastActivity = ref(Date.now())

  // ── Getters ──
  const selectionList = computed(() => Array.from(selections.value.values()))
  const selectionCount = computed(() => selections.value.size)
  const isEmpty = computed(() => selections.value.size === 0)

  const totalStake = computed(() => {
    if (category.value === 'single') {
      return Object.values(stakes.value).reduce((sum, s) => sum + (s || 0), 0)
    }
    return stakes.value.__combo || 0
  })

  const totalOdds = computed(() => {
    if (category.value === 'single') return 0
    return selectionList.value.reduce((acc, s) => acc * s.odds, 1)
  })

  const potentialPayout = computed(() => {
    if (category.value === 'single') {
      return selectionList.value.reduce((sum, s) => {
        const stake = stakes.value[s.id] || 0
        return sum + stake * s.odds
      }, 0)
    }
    return totalStake.value * totalOdds.value
  })

  const hasLiveSelections = computed(() => selectionList.value.some(s => s.isLive))

  // ── Actions ──
  function addSelection(selection: BetSelection) {
    if (isLocked.value) return
    selections.value.set(selection.id, selection)
    lastActivity.value = Date.now()
  }

  function removeSelection(id: string) {
    if (isLocked.value) return
    selections.value.delete(id)
    delete stakes.value[id]
    lastActivity.value = Date.now()
  }

  function setStake(id: string, amount: number) {
    if (isLocked.value) return
    stakes.value[id] = amount
    lastActivity.value = Date.now()
  }

  function setComboStake(amount: number) {
    if (isLocked.value) return
    stakes.value.__combo = amount
    lastActivity.value = Date.now()
  }

  function setCategory(cat: BetCategory) {
    if (isLocked.value) return
    category.value = cat
    lastActivity.value = Date.now()
  }

  function clear() {
    selections.value.clear()
    stakes.value = {}
    category.value = 'single'
    couponName.value = ''
    isLocked.value = false
  }

  function lock() { isLocked.value = true }
  function unlock() { isLocked.value = false }

  // ── Inactivity auto-clear (15 minutes) ──
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
      if (Date.now() - lastActivity.value >= 15 * 60 * 1000) {
        clear()
      }
    }, 15 * 60 * 1000)
  }

  watch(lastActivity, resetInactivityTimer, { immediate: true })

  return {
    // State
    selections,
    stakes,
    category,
    couponName,
    isLocked,

    // Getters
    selectionList,
    selectionCount,
    isEmpty,
    totalStake,
    totalOdds,
    potentialPayout,
    hasLiveSelections,

    // Actions
    addSelection,
    removeSelection,
    setStake,
    setComboStake,
    setCategory,
    clear,
    lock,
    unlock
  }
})
