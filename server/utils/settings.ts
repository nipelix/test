import { eq, and } from 'drizzle-orm'
import { bettingSettings } from '../database/schema'

interface SettingsMap {
  [key: string]: any
}

const DEFAULT_SETTINGS: SettingsMap = {
  betting_limits: {
    minStake: 1,
    maxBetAmount: 50000,
    maxPotentialPayout: 200000,
    minSelections: 1,
    maxSelections: 20,
    maxTotalOdds: 5000
  },
  odds_limits: {
    normalMinOdds: 1.01,
    normalMaxOdds: 1000,
    liveMinOdds: 1.01,
    liveMaxOdds: 500
  },
  display_filter: {
    normalMinDisplayOdds: 1.01,
    liveMinDisplayOdds: 1.01,
    hideMode: false,
    fullCloseMode: false
  },
  features: {
    liveBettingAllowed: true,
    lineBettingAllowed: true,
    systemBetsAllowed: false,
    combineLiveAndLine: false,
    allowSameEvent: false,
    oddChangeAutoAccept: false,
    combinationBoost: false,
    combinationInsurance: false
  },
  time_settings: {
    couponCancelTimeMin: 15,
    liveBettingDelaySec: 5
  },
  credit: {
    dealerMinBalance: 0,
    cancelPenalty: 0
  }
}

async function getSettingsByScope(scope: string, scopeRef: string): Promise<SettingsMap> {
  const db = useDb()
  const rows = await db.select()
    .from(bettingSettings)
    .where(and(
      eq(bettingSettings.scope, scope as any),
      eq(bettingSettings.scopeRef, scopeRef)
    ))

  const result: SettingsMap = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}

export async function resolveSettings(userId?: string, userRole?: string): Promise<SettingsMap> {
  const cacheKey = `settings:resolved:${userId || 'anon'}:${userRole || 'none'}`

  return cached(cacheKey, 60, async () => {
    // Start with defaults
    const merged = { ...DEFAULT_SETTINGS }

    // Layer 1: Global overrides
    const globalSettings = await getSettingsByScope('GLOBAL', 'GLOBAL')
    for (const key of Object.keys(globalSettings)) {
      merged[key] = { ...merged[key], ...globalSettings[key] }
    }

    // Layer 2: Role overrides
    if (userRole) {
      const roleSettings = await getSettingsByScope('ROLE', userRole)
      for (const key of Object.keys(roleSettings)) {
        merged[key] = { ...merged[key], ...roleSettings[key] }
      }
    }

    // Layer 3: User overrides
    if (userId) {
      const userSettings = await getSettingsByScope('USER', userId)
      for (const key of Object.keys(userSettings)) {
        merged[key] = { ...merged[key], ...userSettings[key] }
      }
    }

    return merged
  })
}

export async function resolveSetting(key: string, userId?: string, userRole?: string): Promise<any> {
  const all = await resolveSettings(userId, userRole)
  return all[key] ?? DEFAULT_SETTINGS[key] ?? null
}

export function getDefaultSettings(): SettingsMap {
  return { ...DEFAULT_SETTINGS }
}
