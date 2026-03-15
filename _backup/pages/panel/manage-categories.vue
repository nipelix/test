<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-folder" class="w-5 h-5 text-primary" />
        <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_categories') }}</h1>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton color="primary" icon="i-lucide-plus" size="sm">
        {{ t('common.add') }} {{ t('dashboard.category') }}
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <!-- Search -->
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Search categories..."
      class="w-full sm:w-80"
    />

    <!-- Table -->
    <UTable
      :data="filteredCategories"
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
            @click="editCategory(row.original.id)"
          />
          <UButton
            variant="ghost"
            color="red"
            icon="i-lucide-trash"
            size="xs"
            @click="deleteCategory(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <!-- Pagination Footer -->
    <div class="flex items-center justify-between text-sm text-muted px-2">
      <span>{{ t('common.total') }}: {{ filteredCategories.length }}</span>
      <span>{{ t('common.page_of', { page: 1, pages: 1 }) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const toast = useToast()

const searchQuery = ref('')

const { data: categoriesData, refresh } = await useAsyncData('manage-categories', () =>
  $fetch<{ data: any[], total: number }>('/api/market-types', { query: { limit: 200 } })
)

const categoriesList = computed(() => categoriesData.value?.data ?? [])

const columns = [
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'sportName', header: t('common.sport') },
  { accessorKey: 'active', header: t('common.active') },
  { accessorKey: 'sortOrder', header: t('dashboard.sort_order') },
  { accessorKey: 'actions', header: t('common.actions') }
]

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categoriesList.value
  const query = searchQuery.value.toLowerCase()
  return categoriesList.value.filter(c =>
    c.name.toLowerCase().includes(query) ||
    (c.sportName && c.sportName.toLowerCase().includes(query))
  )
})

async function toggleActive(id: number, val: boolean) {
  try {
    await $fetch(`/api/market-types/${id}`, { method: 'PATCH', body: { active: val } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function editCategory(id: number) {
  console.log('Edit category', id)
}

function deleteCategory(id: number) {
  console.log('Delete category', id)
}

function handleRefresh() {
  searchQuery.value = ''
  refresh()
}
</script>
