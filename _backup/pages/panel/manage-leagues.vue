<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-trophy" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_leagues') }}</h1>
    </div>

    <!-- 3-Column Layout -->
    <UCard>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-800">
        <!-- Left Column: Countries -->
        <div class="p-4 space-y-3">
          <h3 class="text-sm font-bold uppercase text-muted">{{ t('dashboard.country') }}</h3>
          <UInput
            v-model="countrySearch"
            icon="i-lucide-search"
            placeholder="Search countries..."
            size="sm"
          />
          <div class="space-y-1 max-h-96 overflow-y-auto">
            <button
              v-for="country in filteredCountries"
              :key="country.id"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="selectedCountryId === country.id ? 'bg-primary/10 text-primary font-medium' : ''"
              @click="selectedCountryId = country.id"
            >
              <span class="text-lg">{{ country.flag }}</span>
              <span class="truncate">{{ country.name }}</span>
              <UBadge
                color="neutral"
                variant="subtle"
                size="xs"
                class="ml-auto"
              >
                {{ country.code }}
              </UBadge>
            </button>
            <p v-if="filteredCountries.length === 0" class="text-sm text-muted py-4 text-center">
              {{ t('common.no_result') }}
            </p>
          </div>
        </div>

        <!-- Middle Column: Leagues -->
        <div class="p-4 space-y-3">
          <h3 class="text-sm font-bold uppercase text-muted">{{ t('dashboard.league_name') }}</h3>
          <UInput
            v-model="leagueSearch"
            icon="i-lucide-search"
            placeholder="Search leagues..."
            size="sm"
          />
          <div v-if="selectedCountryId" class="space-y-1 max-h-96 overflow-y-auto">
            <button
              v-for="league in filteredLeagues"
              :key="league.id"
              class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="selectedLeagueId === league.id ? 'bg-primary/10 text-primary font-medium' : ''"
              @click="selectedLeagueId = league.id"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="truncate">{{ league.name }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <UBadge color="primary" variant="subtle" size="xs">
                  {{ league.matchCount }}
                </UBadge>
                <USwitch
                  :model-value="league.active"
                  size="xs"
                  @click.stop
                />
              </div>
            </button>
            <p v-if="filteredLeagues.length === 0" class="text-sm text-muted py-4 text-center">
              {{ t('common.no_result') }}
            </p>
          </div>
          <div v-else class="flex items-center justify-center py-12">
            <p class="text-sm text-muted">Select a country to see leagues</p>
          </div>
        </div>

        <!-- Right Column: Match Results -->
        <div class="p-4 space-y-3">
          <h3 class="text-sm font-bold uppercase text-muted">Match Results</h3>
          <UInput
            v-model="matchSearch"
            icon="i-lucide-search"
            placeholder="Search matches..."
            size="sm"
          />
          <div v-if="selectedLeagueId" class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="match in filteredMatches"
              :key="match.id"
              class="rounded-md border border-gray-200 dark:border-gray-800 p-3"
            >
              <div class="flex items-center justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-medium">{{ match.homeTeam }} vs {{ match.awayTeam }}</p>
                  <p class="text-xs text-muted">{{ formatDate(match.startTime) }}</p>
                </div>
                <div class="text-right shrink-0">
                  <UBadge
                    :color="getMatchStatus(match.status) === 'live' ? 'red' : getMatchStatus(match.status) === 'prematch' ? 'blue' : 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ getMatchStatus(match.status) }}
                  </UBadge>
                  <p v-if="match.scoreHome != null" class="text-sm font-bold mt-1">
                    {{ match.scoreHome }} - {{ match.scoreAway }}
                  </p>
                </div>
              </div>
            </div>
            <p v-if="filteredMatches.length === 0" class="text-sm text-muted py-4 text-center">
              {{ t('common.no_result') }}
            </p>
          </div>
          <div v-else class="flex items-center justify-center py-12">
            <p class="text-sm text-muted">Select a league to see matches</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const toast = useToast()

const countrySearch = ref('')
const leagueSearch = ref('')
const matchSearch = ref('')
const selectedCountryId = ref<string | null>(null)
const selectedLeagueId = ref<string | null>(null)

// Countries: fetch once, filter client-side
const { data: countriesData } = await useAsyncData('league-countries', () =>
  $fetch<{ data: any[], total: number }>('/api/countries', { query: { limit: 300 } })
)
const countries = computed(() => countriesData.value?.data ?? [])

// Leagues: reactive fetch when country changes
const { data: leaguesData, refresh: refreshLeagues } = await useAsyncData(
  'league-leagues',
  () => selectedCountryId.value
    ? $fetch<{ data: any[], total: number }>('/api/leagues', { query: { countryId: selectedCountryId.value, limit: 200 } })
    : Promise.resolve({ data: [], total: 0 }),
  { watch: [selectedCountryId] }
)
const leagues = computed(() => leaguesData.value?.data ?? [])

// Matches: reactive fetch when league changes
const { data: matchesData } = await useAsyncData(
  'league-matches',
  () => selectedLeagueId.value
    ? $fetch<{ data: any[], total: number }>('/api/matches', { query: { leagueId: selectedLeagueId.value, limit: 100 } })
    : Promise.resolve({ data: [], total: 0 }),
  { watch: [selectedLeagueId] }
)
const matchesList = computed(() => matchesData.value?.data ?? [])

const filteredCountries = computed(() => {
  if (!countrySearch.value) return countries.value
  const query = countrySearch.value.toLowerCase()
  return countries.value.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.code.toLowerCase().includes(query)
  )
})

const filteredLeagues = computed(() => {
  if (!selectedCountryId.value) return []
  let result = leagues.value
  if (leagueSearch.value) {
    const query = leagueSearch.value.toLowerCase()
    result = result.filter(l => l.name.toLowerCase().includes(query))
  }
  return result
})

const filteredMatches = computed(() => {
  if (!selectedLeagueId.value) return []
  let result = matchesList.value
  if (matchSearch.value) {
    const query = matchSearch.value.toLowerCase()
    result = result.filter(m =>
      m.homeTeam.toLowerCase().includes(query) ||
      m.awayTeam.toLowerCase().includes(query)
    )
  }
  return result
})

// Reset league selection when country changes
watch(selectedCountryId, () => {
  selectedLeagueId.value = null
})

function getMatchStatus(status: string): string {
  return status ? status.toLowerCase() : ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
