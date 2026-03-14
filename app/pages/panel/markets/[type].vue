<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">
      {{ feedType === 'live' ? t('markets.live_market_groups') : t('markets.prematch_market_groups') }}
    </h1>

    <UCard>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('markets.search')" class="max-w-xs" />
          <UButton icon="i-lucide-refresh-cw" variant="outline" size="sm" @click="loadData">{{ t('common.refresh') }}</UButton>
        </div>

        <div class="space-y-1 max-h-[60vh] overflow-y-auto">
          <div
            v-for="group in filteredGroups"
            :key="group.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div>
              <p class="text-sm font-medium">{{ group.name }}</p>
              <p class="text-xs text-muted">ID: {{ group.id }} | Sort: {{ group.sortOrder ?? '-' }}</p>
            </div>
            <USwitch
              :model-value="enabledIds.has(group.id)"
              @update:model-value="toggleGroup(group.id, $event)"
            />
          </div>
          <p v-if="filteredGroups.length === 0" class="text-sm text-muted text-center py-8">{{ t('common.no_data') }}</p>
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

const feedType = computed(() => {
  const f = route.params.type as string
  return f === 'live' || f === 'line' ? f : 'live'
})

const searchQuery = ref('')
const groups = ref<any[]>([])
const enabledIds = reactive(new Set<number>())

async function loadData() {
  try {
    const [allGroups, enabled] = await Promise.all([
      $fetch<{ data: any[] }>('/api/betting-groups', { query: { limit: 500 } }),
      $fetch<{ data: any[] }>(`/api/betting-groups/feed/${feedType.value}`).catch(() => ({ data: [] }))
    ])
    groups.value = allGroups.data ?? []
    enabledIds.clear()
    for (const g of enabled.data ?? []) enabledIds.add(g.id)
  } catch { groups.value = [] }
}

const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) return groups.value
  const q = searchQuery.value.toLowerCase()
  return groups.value.filter((g: any) => g.name?.toLowerCase().includes(q))
})

async function toggleGroup(id: number, enabled: boolean) {
  try {
    if (enabled) {
      await $fetch(`/api/betting-groups/feed/${feedType.value}`, { method: 'POST', body: { groupId: id } })
      enabledIds.add(id)
    } else {
      await $fetch(`/api/betting-groups/feed/${feedType.value}/${id}`, { method: 'DELETE' })
      enabledIds.delete(id)
    }
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

onMounted(() => loadData())
watch(feedType, () => loadData())
</script>
