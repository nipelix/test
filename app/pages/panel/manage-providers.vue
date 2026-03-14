<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-server" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_providers') }}</h1>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton color="primary" icon="i-lucide-plus" size="sm" @click="showAddModal = true">
        {{ t('common.add') }} Provider
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <!-- Search -->
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Search providers..."
      class="w-full sm:w-80"
    />

    <!-- Table -->
    <UTable
      :data="filteredProviders"
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
            @click="editProvider(row.original)"
          />
          <UButton
            variant="ghost"
            color="red"
            icon="i-lucide-trash"
            size="xs"
            @click="deleteProvider(row.original.id)"
          />
        </div>
      </template>
    </UTable>

    <!-- Add/Edit Modal -->
    <UModal v-model:open="showAddModal">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold">{{ editingProvider ? 'Edit' : 'Add' }} Provider</h3>
          <UFormField label="Name">
            <UInput v-model="form.name" placeholder="Provider name" />
          </UFormField>
          <UFormField label="Slug">
            <UInput v-model="form.slug" placeholder="provider-slug" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="showAddModal = false">{{ t('common.cancel') }}</UButton>
            <UButton color="primary" @click="saveProvider">{{ t('common.save') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Pagination Footer -->
    <div class="flex items-center justify-between text-sm text-muted px-2">
      <span>{{ t('common.total') }}: {{ filteredProviders.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const toast = useToast()

const searchQuery = ref('')
const showAddModal = ref(false)
const editingProvider = ref<any>(null)
const form = ref({ name: '', slug: '' })

const { data: providersData, refresh } = await useAsyncData('manage-providers', () =>
  $fetch<{ data: any[], total: number }>('/api/providers', { query: { limit: 100 } })
)

const providersList = computed(() => providersData.value?.data ?? [])

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'active', header: t('common.active') },
  { accessorKey: 'actions', header: t('common.actions') }
]

const filteredProviders = computed(() => {
  if (!searchQuery.value) return providersList.value
  const query = searchQuery.value.toLowerCase()
  return providersList.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.slug.toLowerCase().includes(query)
  )
})

async function toggleActive(id: number, val: boolean) {
  try {
    await $fetch(`/api/providers/${id}`, { method: 'PATCH', body: { active: val } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function editProvider(provider: any) {
  editingProvider.value = provider
  form.value = { name: provider.name, slug: provider.slug }
  showAddModal.value = true
}

async function saveProvider() {
  try {
    if (editingProvider.value) {
      await $fetch(`/api/providers/${editingProvider.value.id}`, { method: 'PATCH', body: form.value })
    } else {
      await $fetch('/api/providers', { method: 'POST', body: form.value })
    }
    showAddModal.value = false
    editingProvider.value = null
    form.value = { name: '', slug: '' }
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

async function deleteProvider(id: number) {
  try {
    await $fetch(`/api/providers/${id}`, { method: 'DELETE' })
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
