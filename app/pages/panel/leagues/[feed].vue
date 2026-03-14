<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        {{ feed === 'live' ? t('matches.live_leagues') : t('matches.prematch_leagues') }}
      </h1>
      <UButton icon="i-lucide-refresh-cw" variant="outline" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <UCard>
      <div class="space-y-3">
        <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('leagues.search')" class="max-w-xs" />

        <div class="space-y-1 max-h-[60vh] overflow-y-auto">
          <div
            v-for="league in filteredLeagues"
            :key="league.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div>
              <p class="text-sm font-medium">{{ league.name }}</p>
              <p class="text-xs text-muted">{{ league.sportName }} — {{ league.countryName }}</p>
            </div>
            <USwitch
              :model-value="enabledIds.has(league.id)"
              @update:model-value="toggleLeague(league.id, $event)"
            />
          </div>
          <p v-if="filteredLeagues.length === 0" class="text-sm text-muted text-center py-8">{{ t('common.no_data') }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] })

const { t } = useI18n()
const toast = useToast()
const route = useRoute()

const feed = computed(() => {
  const f = route.params.feed as string
  return f === 'live' || f === 'line' ? f : 'live'
})

const searchQuery = ref('')
const leagues = ref<any[]>([])
const enabledIds = reactive(new Set<number>())

async function loadData() {
  try {
    const [allLeagues, enabled] = await Promise.all([
      $fetch<{ data: any[] }>('/api/leagues', { query: { limit: 500 } }),
      $fetch<{ data: any[] }>(`/api/leagues/feed/${feed.value}`).catch(() => ({ data: [] }))
    ])
    leagues.value = allLeagues.data ?? []
    enabledIds.clear()
    for (const l of enabled.data ?? []) enabledIds.add(l.id)
  } catch { leagues.value = [] }
}

const filteredLeagues = computed(() => {
  if (!searchQuery.value.trim()) return leagues.value
  const q = searchQuery.value.toLowerCase()
  return leagues.value.filter((l: any) => l.name?.toLowerCase().includes(q))
})

async function toggleLeague(id: number, enabled: boolean) {
  try {
    if (enabled) {
      await $fetch(`/api/leagues/feed/${feed.value}`, { method: 'POST', body: { leagueId: id } })
      enabledIds.add(id)
    } else {
      await $fetch(`/api/leagues/feed/${feed.value}/${id}`, { method: 'DELETE' })
      enabledIds.delete(id)
    }
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

function handleRefresh() { loadData() }

onMounted(() => loadData())
watch(feed, () => loadData())
</script>
