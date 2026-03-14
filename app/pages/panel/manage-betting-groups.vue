<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-arrow-up-circle" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_betting_groups') }}</h1>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton color="primary" icon="i-lucide-plus" size="sm">
        {{ t('common.add') }} {{ t('dashboard.group_name') }}
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <!-- Search -->
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Search betting groups..."
      class="w-full sm:w-80"
    />

    <!-- Table -->
    <UTable
      :data="filteredGroups"
      :columns="columns"
    >
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
            @click="editGroup(row.original.id)"
          />
          <UButton
            variant="ghost"
            color="red"
            icon="i-lucide-trash"
            size="xs"
            @click="deleteGroup(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <!-- Pagination Footer -->
    <div class="flex items-center justify-between text-sm text-muted px-2">
      <span>{{ t('common.total') }}: {{ filteredGroups.length }}</span>
      <span>{{ t('common.page_of', { page: 1, pages: 1 }) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const searchQuery = ref('')

const { data: groupsData, refresh } = await useAsyncData('manage-betting-groups', () =>
  $fetch<{ data: any[], total: number }>('/api/betting-groups', { query: { limit: 200 } })
)

const groupsList = computed(() => groupsData.value?.data ?? [])

const columns = [
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'sportName', header: t('dashboard.sport_name') },
  { accessorKey: 'active', header: t('common.active') },
  { accessorKey: 'sortOrder', header: t('dashboard.sort_order') },
  { accessorKey: 'actions', header: t('common.actions') }
]

const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupsList.value
  const query = searchQuery.value.toLowerCase()
  return groupsList.value.filter(g =>
    g.name.toLowerCase().includes(query) ||
    (g.sportName && g.sportName.toLowerCase().includes(query))
  )
})

async function toggleActive(id: number, val: boolean) {
  try {
    await $fetch(`/api/betting-groups/${id}`, { method: 'PATCH', body: { active: val } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function editGroup(id: number) {
  console.log('Edit group', id)
}

async function deleteGroup(id: number) {
  try {
    await $fetch(`/api/betting-groups/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function handleRefresh() {
  searchQuery.value = ''
  refresh()
}
</script>
