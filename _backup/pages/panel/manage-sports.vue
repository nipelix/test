<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-dumbbell" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_sports') }}</h1>
    </div>

    <!-- Tabs -->
    <UTabs
      :items="tabItems"
      v-model="activeTab"
    />

    <!-- Search -->
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Search sports..."
      class="w-full sm:w-80"
    />

    <!-- Stats Row -->
    <div class="flex items-center gap-4 text-sm">
      <span class="font-medium">
        {{ t('common.total') }}: <strong>{{ sportsList.length }}</strong>
      </span>
      <USeparator orientation="vertical" class="h-4" />
      <span class="text-green-600 font-medium">
        {{ t('common.active') }}: <strong>{{ activeSportsCount }}</strong>
      </span>
      <USeparator orientation="vertical" class="h-4" />
      <span class="text-orange-600 font-medium">
        {{ t('common.suspended') }}: <strong>{{ suspendedSportsCount }}</strong>
      </span>
    </div>

    <!-- Sports List -->
    <div class="space-y-2">
      <div
        v-for="sport in filteredSports"
        :key="sport.id"
        class="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UIcon :name="sport.icon" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-sm font-semibold">{{ sport.name }}</p>
            <p class="text-xs text-muted">{{ sport.slug }}</p>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <UFormField :label="t('dashboard.sort_order')" class="w-20">
            <UInput
              :model-value="sport.sortOrder"
              type="number"
              size="sm"
              @update:model-value="(val: string | number) => updateSortOrder(sport.id, Number(val))"
            />
          </UFormField>
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-muted">{{ t('common.active') }}</span>
            <USwitch
              :model-value="sport.active"
              @update:model-value="(val: boolean) => toggleSportActive(sport.id, val)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Button -->
    <div class="flex justify-end">
      <UButton variant="outline" color="neutral" icon="i-lucide-rotate-ccw" @click="resetToDefault">
        Reset to Default
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const toast = useToast()

const searchQuery = ref('')
const activeTab = ref('system')

const tabItems = [
  { label: 'SYSTEM RULES', value: 'system' },
  { label: 'DEALER RULES', value: 'dealer' }
]

const { data: sportsData, refresh } = await useAsyncData('manage-sports', () =>
  $fetch<{ data: any[], total: number }>('/api/sports', { query: { limit: 100 } })
)

const sportsList = computed(() => sportsData.value?.data ?? [])

const filteredSports = computed(() => {
  if (!searchQuery.value) return sportsList.value
  const query = searchQuery.value.toLowerCase()
  return sportsList.value.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.slug.toLowerCase().includes(query)
  )
})

const activeSportsCount = computed(() => sportsList.value.filter(s => s.active).length)
const suspendedSportsCount = computed(() => sportsList.value.filter(s => !s.active).length)

async function toggleSportActive(id: number, val: boolean) {
  try {
    await $fetch(`/api/sports/${id}`, { method: 'PATCH', body: { active: val } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

async function updateSortOrder(id: number, val: number) {
  try {
    await $fetch(`/api/sports/${id}`, { method: 'PATCH', body: { sortOrder: val } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function resetToDefault() {
  refresh()
}
</script>
