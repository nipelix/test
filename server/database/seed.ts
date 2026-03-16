import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import argon2 from 'argon2'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error('DATABASE_URL environment variable is required')

function loadJson(filename: string) {
  const filePath = resolve(process.cwd(), 'data', filename)
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

async function batchInsert<T>(
  db: any,
  table: any,
  rows: T[],
  chunkSize = 100
): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    await db.insert(table).values(chunk)
  }
}

async function seed() {
  const client = postgres(DATABASE_URL, { max: 1 })
  const db = drizzle(client, { schema })

  console.log('Seeding database...')

  // ============================================================
  // 0. LANGUAGES
  // ============================================================
  const languagesData = [
    { code: 'tr', name: 'Turkish', nativeName: 'Turkce', sortOrder: 0 },
    { code: 'en', name: 'English', nativeName: 'English', sortOrder: 1 },
    { code: 'de', name: 'German', nativeName: 'Deutsch', sortOrder: 2 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', sortOrder: 3 },
    { code: 'fr', name: 'French', nativeName: 'Francais', sortOrder: 4 },
    { code: 'es', name: 'Spanish', nativeName: 'Espanol', sortOrder: 5 },
    { code: 'pt', name: 'Portuguese', nativeName: 'Portugues', sortOrder: 6 },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', sortOrder: 7 },
    { code: 'zh', name: 'Chinese', nativeName: '中文', sortOrder: 8 },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', sortOrder: 9 },
    { code: 'ko', name: 'Korean', nativeName: '한국어', sortOrder: 10 }
  ]

  const insertedLanguages = await db.insert(schema.languages).values(languagesData).returning()
  const langMap: Record<string, number> = {}
  for (const l of insertedLanguages) langMap[l.code] = l.id
  console.log(`Created ${insertedLanguages.length} languages`)

  // ============================================================
  // 1. SUPER ADMIN
  // ============================================================
  const passwordHash = await argon2.hash('Admin123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  })

  const [superAdmin] = await db.insert(schema.users).values({
    username: 'superadmin',
    email: 'superadmin@sportbooks.com',
    passwordHash,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    walletType: 'NONE'
  }).returning()

  await db.insert(schema.userTree).values({
    ancestorId: superAdmin.id,
    descendantId: superAdmin.id,
    depth: 0
  })

  await db.insert(schema.wallets).values({
    userId: superAdmin.id,
    balance: '1000000',
    creditLimit: '1000000',
    currency: 'TRY'
  })

  console.log(`Created SUPER_ADMIN: ${superAdmin.username} (${superAdmin.id})`)

  // ============================================================
  // 2. PROVIDERS
  // ============================================================
  const providersData = [
    { name: 'Melbet', slug: 'melbet' },
    { name: 'Upgaming', slug: 'upgaming' },
    { name: 'Globalbahis', slug: 'globalbahis' }
  ]

  const insertedProviders = await db.insert(schema.providers).values(providersData).returning()
  console.log(`Created ${insertedProviders.length} providers`)

  const providerMap: Record<string, number> = {}
  for (const p of insertedProviders) providerMap[p.slug] = p.id

  // ============================================================
  // 3. SPORTS
  // ============================================================
  const sportsJson = loadJson('sports.json')
  const sportIdMap: Record<number, number> = {} // JSON id → DB id

  const sportTransRows: any[] = []
  const countryTransRows: any[] = []
  const leagueTransRows: any[] = []
  const marketTypeTransRows: any[] = []
  const selectionTemplateTransRows: any[] = []
  const mappingRows: any[] = []

  for (const s of sportsJson) {
    const [inserted] = await db.insert(schema.sports).values({
      slug: s.slug,
      icon: s.icon || null,
      category: s.category || null,
      banner: s.banner || null,
      sortOrder: s.sortOrder || 0
    }).returning()

    sportIdMap[s.id] = inserted.id

    // Translations
    if (s.translations) {
      for (const t of s.translations) {
        const languageId = langMap[t.lang]
        if (!languageId) continue
        sportTransRows.push({
          sportId: inserted.id,
          languageId,
          field: t.field,
          value: t.value
        })
      }
    }

    // Provider mappings
    for (const provSlug of ['melbet', 'upgaming', 'globalbahis']) {
      if (s[provSlug]) {
        for (const extId of s[provSlug]) {
          mappingRows.push({
            providerId: providerMap[provSlug],
            entityType: 'SPORT' as const,
            entityId: inserted.id,
            externalId: extId
          })
        }
      }
    }
  }

  console.log(`Created ${sportsJson.length} sports`)

  // ============================================================
  // 4. COUNTRIES
  // ============================================================
  const countriesJson = loadJson('countries.json')
  const countryIdMap: Record<number, number> = {}

  for (const c of countriesJson) {
    const [inserted] = await db.insert(schema.countries).values({
      code: c.code,
      slug: c.slug || null,
      flag: c.flag || null
    }).returning()

    countryIdMap[c.id] = inserted.id

    if (c.translations) {
      for (const t of c.translations) {
        const languageId = langMap[t.lang]
        if (!languageId) continue
        countryTransRows.push({
          countryId: inserted.id,
          languageId,
          field: t.field,
          value: t.value
        })
      }
    }

    for (const provSlug of ['melbet', 'upgaming', 'globalbahis']) {
      if (c[provSlug]) {
        for (const extId of c[provSlug]) {
          mappingRows.push({
            providerId: providerMap[provSlug],
            entityType: 'COUNTRY' as const,
            entityId: inserted.id,
            externalId: extId
          })
        }
      }
    }
  }

  console.log(`Created ${countriesJson.length} countries`)

  // ============================================================
  // 5. LEAGUES
  // ============================================================
  const leaguesJson = loadJson('leagues.json')
  const leagueIdMap: Record<number, number> = {}

  for (const l of leaguesJson) {
    const sportId = sportIdMap[l.sportId]
    const countryId = countryIdMap[l.countryId]

    if (!sportId || !countryId) {
      console.warn(`Skipping league "${l.name}": sportId=${l.sportId}→${sportId}, countryId=${l.countryId}→${countryId}`)
      continue
    }

    const [inserted] = await db.insert(schema.leagues).values({
      sportId,
      countryId,
      category: l.category || null,
      popular: l.popular || false,
      mostPopular: l.mostPopular || false,
      mbs: l.mbs || 1,
      type: l.type || null,
      sortOrder: l.sortOrder || 0
    }).returning()

    leagueIdMap[l.id] = inserted.id

    if (l.translations) {
      for (const t of l.translations) {
        const languageId = langMap[t.lang]
        if (!languageId) continue
        leagueTransRows.push({
          leagueId: inserted.id,
          languageId,
          field: t.field,
          value: t.value
        })
      }
    }

    for (const provSlug of ['melbet', 'upgaming', 'globalbahis']) {
      if (l[provSlug]) {
        for (const extId of l[provSlug]) {
          mappingRows.push({
            providerId: providerMap[provSlug],
            entityType: 'LEAGUE' as const,
            entityId: inserted.id,
            externalId: extId
          })
        }
      }
    }
  }

  console.log(`Created ${Object.keys(leagueIdMap).length} leagues`)

  // ============================================================
  // 6. MARKET TYPES
  // ============================================================
  const marketsJson = loadJson('betting-markets.json')
  const marketIdMap: Record<number, number> = {}

  for (const m of marketsJson) {
    const sportId = m.sportId ? sportIdMap[m.sportId] : null

    const [inserted] = await db.insert(schema.marketTypes).values({
      name: m.name,
      slug: m.slug,
      sportId: sportId || null,
      bettingGroupId: m.bettingGroupId || null,
      category: m.category || null,
      extendsControl: m.extendsControl || false,
      providerFeedType: m.providerFeedType || null,
      selectionsCount: m.selectionsCount || 2,
      sortOrder: m.sortOrder || 0
    }).returning()

    marketIdMap[m.id] = inserted.id

    if (m.translations) {
      for (const t of m.translations) {
        const languageId = langMap[t.lang]
        if (!languageId) continue
        marketTypeTransRows.push({
          marketTypeId: inserted.id,
          languageId,
          field: t.field,
          value: t.value
        })
      }
    }

    for (const provSlug of ['melbet', 'upgaming', 'globalbahis']) {
      if (m[provSlug]) {
        for (const extId of m[provSlug]) {
          mappingRows.push({
            providerId: providerMap[provSlug],
            entityType: 'MARKET_TYPE' as const,
            entityId: inserted.id,
            externalId: extId
          })
        }
      }
    }
  }

  console.log(`Created ${marketsJson.length} market types`)

  // ============================================================
  // 7. SELECTION TEMPLATES
  // ============================================================
  const selectionsJson = loadJson('betting-selections.json')

  for (const s of selectionsJson) {
    const marketGroupId = s.marketGroupId ? marketIdMap[s.marketGroupId] : null

    const [inserted] = await db.insert(schema.selectionTemplates).values({
      groupId: s.groupId,
      marketGroupId: marketGroupId || null,
      sortOrder: s.sortOrder || 0,
      statusType: s.statusType || null,
      validator: s.validator || null,
      drawNoBet: s.drawNoBet || false,
      period: s.period || 0,
      providerFeedType: s.providerFeedType || null
    }).returning()

    if (s.translations) {
      for (const t of s.translations) {
        const languageId = langMap[t.lang]
        if (!languageId) continue
        selectionTemplateTransRows.push({
          selectionTemplateId: inserted.id,
          languageId,
          field: t.field,
          value: t.value
        })
      }
    }

    for (const provSlug of ['melbet', 'upgaming', 'globalbahis']) {
      if (s[provSlug]) {
        for (const extId of s[provSlug]) {
          mappingRows.push({
            providerId: providerMap[provSlug],
            entityType: 'SELECTION_TEMPLATE' as const,
            entityId: inserted.id,
            externalId: extId
          })
        }
      }
    }
  }

  console.log(`Created ${selectionsJson.length} selection templates`)

  // ============================================================
  // 8. BATCH INSERT: TRANSLATIONS (per-entity tables)
  // ============================================================
  if (sportTransRows.length > 0) {
    await batchInsert(db, schema.sportTranslations, sportTransRows)
    console.log(`Created ${sportTransRows.length} sport translations`)
  }
  if (countryTransRows.length > 0) {
    await batchInsert(db, schema.countryTranslations, countryTransRows)
    console.log(`Created ${countryTransRows.length} country translations`)
  }
  if (leagueTransRows.length > 0) {
    await batchInsert(db, schema.leagueTranslations, leagueTransRows)
    console.log(`Created ${leagueTransRows.length} league translations`)
  }
  if (marketTypeTransRows.length > 0) {
    await batchInsert(db, schema.marketTypeTranslations, marketTypeTransRows)
    console.log(`Created ${marketTypeTransRows.length} market type translations`)
  }
  if (selectionTemplateTransRows.length > 0) {
    await batchInsert(db, schema.selectionTemplateTranslations, selectionTemplateTransRows)
    console.log(`Created ${selectionTemplateTransRows.length} selection template translations`)
  }
  const totalTranslations = sportTransRows.length + countryTransRows.length + leagueTransRows.length + marketTypeTransRows.length + selectionTemplateTransRows.length

  // ============================================================
  // 9. BATCH INSERT: PROVIDER MAPPINGS
  // ============================================================
  if (mappingRows.length > 0) {
    await batchInsert(db, schema.providerMappings, mappingRows)
    console.log(`Created ${mappingRows.length} provider mappings`)
  }

  // ============================================================
  // 10. CREDIT RANGES
  // ============================================================
  const creditRangesJson = loadJson('credit-tiers.json')
  await db.insert(schema.creditRanges).values(creditRangesJson)
  console.log(`Created ${creditRangesJson.length} credit ranges`)

  // ============================================================
  // 11. BETTING SETTINGS
  // ============================================================
  const optionsJson = loadJson('options.json')
  await db.insert(schema.bettingSettings).values(
    optionsJson.map((o: any) => ({
      scope: o.scope as 'GLOBAL',
      scopeRef: o.scopeRef,
      key: o.key,
      value: o.value
    }))
  )
  console.log(`Created ${optionsJson.length} betting settings`)

  // ============================================================
  console.log('Seed complete!')
  console.log(`Summary:`)
  console.log(`  Sports: ${sportsJson.length}`)
  console.log(`  Countries: ${countriesJson.length}`)
  console.log(`  Leagues: ${Object.keys(leagueIdMap).length}`)
  console.log(`  Market Types: ${marketsJson.length}`)
  console.log(`  Selection Templates: ${selectionsJson.length}`)
  console.log(`  Translations: ${totalTranslations}`)
  console.log(`  Provider Mappings: ${mappingRows.length}`)

  await client.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
