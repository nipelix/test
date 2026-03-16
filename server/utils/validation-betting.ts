import { z } from 'zod'

// --- Shared: Translation schema ---
const translationItemSchema = z.object({
  lang: z.string().min(1).max(10),
  field: z.string().min(1).max(50),
  value: z.string().min(1).max(500)
})

// --- Sports ---
export const createSportSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  icon: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  banner: z.string().max(255).optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
  translations: z.array(translationItemSchema).optional()
})

export const updateSportSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  icon: z.string().max(100).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  banner: z.string().max(255).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  translations: z.array(translationItemSchema).optional()
})

// --- Countries ---
export const createCountrySchema = z.object({
  code: z.string().min(1).max(10),
  slug: z.string().max(100).optional(),
  flag: z.string().max(255).optional(),
  active: z.boolean().optional().default(true),
  translations: z.array(translationItemSchema).optional()
})

export const updateCountrySchema = z.object({
  code: z.string().min(1).max(10).optional(),
  slug: z.string().max(100).nullable().optional(),
  flag: z.string().max(255).nullable().optional(),
  active: z.boolean().optional(),
  translations: z.array(translationItemSchema).optional()
})

// --- Leagues ---
export const createLeagueSchema = z.object({
  sportId: z.number().int().positive(),
  countryId: z.number().int().positive(),
  category: z.string().max(200).optional(),
  specialIcon: z.string().max(255).optional(),
  popular: z.boolean().optional().default(false),
  mostPopular: z.boolean().optional().default(false),
  mbs: z.number().int().min(1).optional().default(1),
  type: z.string().max(50).optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
  translations: z.array(translationItemSchema).optional()
})

export const updateLeagueSchema = z.object({
  sportId: z.number().int().positive().optional(),
  countryId: z.number().int().positive().optional(),
  category: z.string().max(200).nullable().optional(),
  specialIcon: z.string().max(255).nullable().optional(),
  popular: z.boolean().optional(),
  mostPopular: z.boolean().optional(),
  mbs: z.number().int().min(1).optional(),
  type: z.string().max(50).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  translations: z.array(translationItemSchema).optional()
})

// --- Betting Groups ---
export const createBettingGroupSchema = z.object({
  name: z.string().min(1).max(200),
  sportId: z.number().int().positive(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0)
})

export const updateBettingGroupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sportId: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
})

// --- Market Types ---
export const createMarketTypeSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  sportId: z.number().int().positive().nullable().optional(),
  bettingGroupId: z.number().int().positive().nullable().optional(),
  category: z.string().max(200).optional(),
  extendsControl: z.boolean().optional().default(false),
  providerFeedType: z.string().max(50).optional(),
  selectionsCount: z.number().int().min(1).optional().default(2),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
  translations: z.array(translationItemSchema).optional()
})

export const updateMarketTypeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  sportId: z.number().int().positive().nullable().optional(),
  bettingGroupId: z.number().int().positive().nullable().optional(),
  category: z.string().max(200).nullable().optional(),
  extendsControl: z.boolean().optional(),
  providerFeedType: z.string().max(50).nullable().optional(),
  selectionsCount: z.number().int().min(1).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  translations: z.array(translationItemSchema).optional()
})

// --- Selection Templates ---
export const createSelectionTemplateSchema = z.object({
  groupId: z.number().int().positive(),
  marketGroupId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
  statusType: z.string().max(50).optional(),
  validator: z.string().max(500).optional(),
  drawNoBet: z.boolean().optional().default(false),
  period: z.number().int().min(0).optional().default(0),
  providerFeedType: z.string().max(50).optional(),
  translations: z.array(translationItemSchema).optional()
})

export const updateSelectionTemplateSchema = z.object({
  groupId: z.number().int().positive().optional(),
  marketGroupId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  statusType: z.string().max(50).nullable().optional(),
  validator: z.string().max(500).nullable().optional(),
  drawNoBet: z.boolean().optional(),
  period: z.number().int().min(0).optional(),
  providerFeedType: z.string().max(50).nullable().optional(),
  translations: z.array(translationItemSchema).optional()
})

// --- Providers ---
export const createProviderSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  active: z.boolean().optional().default(true)
})

export const updateProviderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  active: z.boolean().optional()
})

// --- Translations (bulk upsert, per-entity) ---
export const bulkTranslationSchema = z.object({
  entityType: z.enum(['SPORT', 'COUNTRY', 'LEAGUE', 'MARKET_TYPE', 'SELECTION_TEMPLATE', 'BETTING_GROUP']),
  entityId: z.number().int().positive(),
  translations: z.array(translationItemSchema).min(1)
})

// --- Provider Mappings ---
export const createProviderMappingSchema = z.object({
  providerId: z.number().int().positive(),
  entityType: z.enum(['SPORT', 'COUNTRY', 'LEAGUE', 'MARKET_TYPE', 'SELECTION_TEMPLATE']),
  entityId: z.number().int().positive(),
  externalId: z.number().int()
})

// --- Matches ---
export const createMatchSchema = z.object({
  homeTeam: z.string().min(1).max(200),
  awayTeam: z.string().min(1).max(200),
  leagueId: z.number().int().positive(),
  sportId: z.number().int().positive(),
  startTime: z.string().datetime(),
  isPopular: z.boolean().optional().default(false),
  externalId: z.string().max(100).optional()
})

export const updateMatchSchema = z.object({
  homeTeam: z.string().min(1).max(200).optional(),
  awayTeam: z.string().min(1).max(200).optional(),
  leagueId: z.number().int().positive().optional(),
  sportId: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  isPopular: z.boolean().optional(),
  externalId: z.string().max(100).nullable().optional()
})

export const updateMatchStatusSchema = z.object({
  status: z.enum(['PREMATCH', 'LIVE', 'FINISHED', 'CANCELLED', 'POSTPONED'])
})

export const updateMatchScoreSchema = z.object({
  scoreHome: z.number().int().min(0),
  scoreAway: z.number().int().min(0),
  minute: z.number().int().min(0).nullable().optional(),
  period: z.string().max(50).nullable().optional()
})

// --- Markets ---
export const createMarketSchema = z.object({
  marketTypeId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  line: z.number().optional()
})

export const updateMarketSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  line: z.number().nullable().optional()
})

export const updateMarketStatusSchema = z.object({
  status: z.enum(['OPEN', 'SUSPENDED', 'SETTLED', 'CANCELLED'])
})

// --- Selections ---
export const createSelectionSchema = z.object({
  name: z.string().min(1).max(200),
  label: z.string().min(1).max(50),
  baseOdds: z.number().min(1.01),
  sortOrder: z.number().int().min(0).optional().default(0)
})

export const updateSelectionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  label: z.string().min(1).max(50).optional(),
  baseOdds: z.number().min(1.01).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'WON', 'LOST', 'VOID']).optional(),
  sortOrder: z.number().int().min(0).optional()
})

// --- Odds Adjustments ---
export const createOddsAdjustmentSchema = z.object({
  scope: z.enum(['SYSTEM_GLOBAL', 'ROLE', 'BETTING_GROUP', 'MATCH', 'USER']),
  scopeRef: z.string().min(1).max(255),
  sportId: z.number().int().positive().nullable().optional(),
  marketTypeId: z.number().int().positive().nullable().optional(),
  adjustmentType: z.enum(['FIXED', 'PERCENTAGE']).optional().default('FIXED'),
  value: z.number(),
  active: z.boolean().optional().default(true)
})

export const updateOddsAdjustmentSchema = z.object({
  scope: z.enum(['SYSTEM_GLOBAL', 'ROLE', 'BETTING_GROUP', 'MATCH', 'USER']).optional(),
  scopeRef: z.string().min(1).max(255).optional(),
  sportId: z.number().int().positive().nullable().optional(),
  marketTypeId: z.number().int().positive().nullable().optional(),
  adjustmentType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
  value: z.number().optional(),
  active: z.boolean().optional()
})
