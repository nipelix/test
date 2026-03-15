import { defineStore } from 'pinia'
import { readonly as vueReadonly } from 'vue'

export interface BetSelection {
  id: string
  matchId: number
  eventId: number
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

interface BetslipRules {
  allowSameEventSelections: boolean
  liveEnabled: boolean
  lineEnabled: boolean
  mixLiveAndLineEnabled: boolean
  maxTotalOdds: number
  maxSelectionsCount: number
  systemBetsEnabled: boolean
}

const DEFAULT_RULES: BetslipRules = {
  allowSameEventSelections: false,
  liveEnabled: true,
  lineEnabled: true,
  mixLiveAndLineEnabled: true,
  maxTotalOdds: 1000,
  maxSelectionsCount: 20,
  systemBetsEnabled: false
}

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export const useBetslipStore = defineStore('betslip', () => {
  // ── State ──
  const selections = ref<Map<string, BetSelection>>(new Map())
  const originalOddsMap = ref<Record<string, number>>({})
  const stakes = ref<Record<string, number>>({})
  const category = ref<BetCategory>('single')
  const couponName = ref('')
  const isLocked = ref(false)
  const lastActivity = ref(Date.now())
  const rules = ref<BetslipRules>({ ...DEFAULT_RULES })

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
  const hasLineSelections = computed(() => selectionList.value.some(s => !s.isLive))

  // Odds change detection
  const hasOddChange = computed(() =>
    selectionList.value.some(s => s.odds !== originalOddsMap.value[s.id])
  )

  // ── Actions ──

  function addSelection(selection: BetSelection) {
    if (isLocked.value) return
    if (selections.value.size >= rules.value.maxSelectionsCount) return

    // Same event check: if not allowed, remove existing selections from same event
    if (!rules.value.allowSameEventSelections) {
      for (const [id, existing] of selections.value) {
        if (existing.eventId === selection.eventId && id !== selection.id) {
          selections.value.delete(id)
          delete stakes.value[id]
          delete originalOddsMap.value[id]
        }
      }
    }

    // Duplicate check: toggle off if already selected
    if (selections.value.has(selection.id)) {
      removeSelection(selection.id)
      return
    }

    selections.value.set(selection.id, selection)
    originalOddsMap.value[selection.id] = selection.odds
    lastActivity.value = Date.now()

    // Category auto-switch
    autoSwitchCategory()
  }

  function removeSelection(id: string) {
    if (isLocked.value) return
    selections.value.delete(id)
    delete stakes.value[id]
    delete originalOddsMap.value[id]
    lastActivity.value = Date.now()

    // Category auto-switch
    autoSwitchCategory()
  }

  function updateSelectionOdds(id: string, newOdds: number) {
    const sel = selections.value.get(id)
    if (sel) {
      sel.odds = newOdds
    }
  }

  function autoSwitchCategory() {
    const count = selections.value.size
    if (count <= 1 && category.value !== 'single') {
      category.value = 'single'
    } else if (count === 2 && category.value === 'single') {
      category.value = 'combination'
    } else if (count < 3 && category.value === 'system') {
      category.value = count >= 2 ? 'combination' : 'single'
    }
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
    if (cat === 'system' && !rules.value.systemBetsEnabled) return
    if (cat === 'system' && selections.value.size < 3) return
    if (cat === 'combination' && selections.value.size < 2) return
    category.value = cat
    lastActivity.value = Date.now()
  }

  function setRules(newRules: Partial<BetslipRules>) {
    rules.value = { ...rules.value, ...newRules }
  }

  function clear() {
    selections.value.clear()
    originalOddsMap.value = {}
    stakes.value = {}
    category.value = 'single'
    couponName.value = ''
    isLocked.value = false
  }

  function lock() { isLocked.value = true }
  function unlock() { isLocked.value = false }

  // ── Inactivity auto-clear ──
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
      if (Date.now() - lastActivity.value >= INACTIVITY_TIMEOUT) {
        clear()
      }
    }, INACTIVITY_TIMEOUT)
  }

  watch(lastActivity, resetInactivityTimer, { immediate: true })

  return {
    // State (readonly — mutate only through actions)
    selections: vueReadonly(selections),
    originalOddsMap: vueReadonly(originalOddsMap),
    stakes: vueReadonly(stakes),
    category: vueReadonly(category),
    couponName,
    isLocked: vueReadonly(isLocked),
    rules: vueReadonly(rules),

    // Getters
    selectionList, selectionCount, isEmpty, totalStake, totalOdds,
    potentialPayout, hasLiveSelections, hasLineSelections, hasOddChange,

    // Actions
    addSelection, removeSelection, updateSelectionOdds,
    setStake, setComboStake, setCategory, setRules, clear, lock, unlock
  }
})
