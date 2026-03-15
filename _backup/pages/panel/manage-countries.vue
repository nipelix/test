<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-globe" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_countries') }}</h1>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton color="primary" icon="i-lucide-plus" size="sm">
        {{ t('common.add') }} {{ t('dashboard.country') }}
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <!-- Search -->
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Search countries..."
      class="w-full sm:w-80"
    />

    <!-- Table -->
    <UTable
      :data="filteredCountries"
      :columns="columns"
    >
      <template #flag-cell="{ row }">
        <span class="text-xl">{{ row.original.flag }}</span>
      </template>
      <template #active-cell="{ row }">
        <USwitch
          :model-value="row.original.active"
          @update:model-value="(val: boolean) => toggleActive(row.original.id, val)"
        />
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-pencil"
            size="xs"
            @click="editCountry(row.original.id)"
          />
          <UButton
            variant="ghost"
            color="red"
            icon="i-lucide-trash"
            size="xs"
            @click="deleteCountry(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <!-- Pagination Footer -->
    <div class="flex items-center justify-between text-sm text-muted px-2">
      <span>{{ t('common.total') }}: {{ filteredCountries.length }}</span>
      <span>{{ t('common.page_of', { page: 1, pages: 1 }) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const toast = useToast()

const searchQuery = ref('')

const { data: countriesData, refresh } = await useAsyncData('manage-countries', () =>
  $fetch<{ data: any[], total: number }>('/api/countries', { query: { limit: 300 } })
)

const countriesList = computed(() => countriesData.value?.data ?? [])

const columns = [
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'flag', header: 'Flag' },
  { accessorKey: 'active', header: t('common.active') },
  { accessorKey: 'actions', header: t('common.actions') }
]

const filteredCountries = computed(() => {
  if (!searchQuery.value) return countriesList.value
  const query = searchQuery.value.toLowerCase()
  return countriesList.value.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.code.toLowerCase().includes(query)
  )
})

async function toggleActive(id: number, val: boolean) {
  try {
    await $fetch(`/api/countries/${id}`, { method: 'PATCH', body: { active: val } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function editCountry(id: number) {
  console.log('Edit country', id)
}

function deleteCountry(id: number) {
  console.log('Delete country', id)
}

function handleRefresh() {
  searchQuery.value = ''
  refresh()
}
</script>
