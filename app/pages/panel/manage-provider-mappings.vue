<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-link" class="w-5 h-5 text-primary" />
      <h1 class="text-lg font-bold uppercase">{{ t('dashboard.manage_provider_mappings') }}</h1>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <USelect
        v-model="filterEntityType"
        :items="entityTypeOptions"
        placeholder="Entity Type"
        class="w-60"
      />
      <UInput
        v-model="filterEntityId"
        placeholder="Entity ID"
        type="number"
        class="w-32"
      />
      <UButton color="primary" icon="i-lucide-search" size="sm" @click="loadMappings">
        {{ t('common.search') }}
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="handleRefresh">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <!-- Add Form -->
    <UCard>
      <template #header>
        <h3 class="text-sm font-bold uppercase">Add Provider Mapping</h3>
      </template>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UFormField label="Provider">
          <USelect v-model="addForm.providerId" :items="providerOptions" />
        </UFormField>
        <UFormField :label="t('dashboard.entity_type')">
          <USelect v-model="addForm.entityType" :items="entityTypeOptions.slice(1)" />
        </UFormField>
        <UFormField :label="t('dashboard.entity_id')">
          <UInput v-model.number="addForm.entityId" type="number" />
        </UFormField>
        <UFormField :label="t('dashboard.external_id')">
          <UInput v-model.number="addForm.externalId" type="number" />
        </UFormField>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton color="primary" icon="i-lucide-save" size="sm" @click="saveMapping">
            {{ t('common.save') }}
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Results Table -->
    <UTable
      :data="mappingsList"
      :columns="columns"
    >
      <template #actions-cell="{ row }">
        <UButton
          variant="ghost"
          color="red"
          icon="i-lucide-trash"
          size="xs"
          @click="deleteMapping(row.original.id)"
        />
      </template>
    </UTable>

    <!-- Footer -->
    <div class="flex items-center justify-between text-sm text-muted px-2">
      <span>{{ t('common.total') }}: {{ mappingsList.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t } = useI18n()
const toast = useToast()

const filterEntityType = ref('')
const filterEntityId = ref('')

const entityTypeOptions = [
  { label: 'All', value: '' },
  { label: 'SPORT', value: 'SPORT' },
  { label: 'COUNTRY', value: 'COUNTRY' },
  { label: 'LEAGUE', value: 'LEAGUE' },
  { label: 'MARKET_TYPE', value: 'MARKET_TYPE' },
  { label: 'SELECTION_TEMPLATE', value: 'SELECTION_TEMPLATE' }
]

const addForm = ref({
  providerId: '',
  entityType: 'SPORT',
  entityId: 1,
  externalId: 1
})

// Load providers for dropdown
const { data: providersData } = await useAsyncData('mapping-providers', () =>
  $fetch<{ data: any[] }>('/api/providers', { query: { limit: 50 } })
)

const providerOptions = computed(() =>
  (providersData.value?.data ?? []).map(p => ({ label: p.name, value: String(p.id) }))
)

// Load mappings
const { data: mappingsData, refresh } = await useAsyncData('manage-provider-mappings', () => {
  const query: Record<string, string> = {}
  if (filterEntityType.value) query.entityType = filterEntityType.value
  if (filterEntityId.value) query.entityId = filterEntityId.value
  return $fetch<{ data: any[] }>('/api/provider-mappings', { query })
})

const mappingsList = computed(() => mappingsData.value?.data ?? [])

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'providerName', header: t('dashboard.provider_name') },
  { accessorKey: 'entityType', header: t('dashboard.entity_type') },
  { accessorKey: 'entityId', header: t('dashboard.entity_id') },
  { accessorKey: 'externalId', header: t('dashboard.external_id') },
  { accessorKey: 'actions', header: t('common.actions') }
]

function loadMappings() {
  refresh()
}

async function saveMapping() {
  try {
    await $fetch('/api/provider-mappings', {
      method: 'POST',
      body: {
        providerId: Number(addForm.value.providerId),
        entityType: addForm.value.entityType,
        entityId: addForm.value.entityId,
        externalId: addForm.value.externalId
      }
    })
    toast.add({ title: 'Success', description: 'Mapping created', color: 'green' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

async function deleteMapping(id: number) {
  try {
    await $fetch(`/api/provider-mappings/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}

function handleRefresh() {
  filterEntityType.value = ''
  filterEntityId.value = ''
  refresh()
}
</script>
