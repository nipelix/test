<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ title }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="searchPlaceholder"
          :add-label="addLabel"
          :selected-count="selectedRows.length"
          show-add
          show-delete
          @create="editItem = null; modalOpen = true"
          @edit="openEdit"
          @refresh="handleRefresh"
          @activate="handleActivate"
          @deactivate="handleDeactivate"
          @delete="handleDelete"
          @update:search="searchQuery = $event"
        >
          <!-- Mapping button in toolbar -->
          <template v-if="mappingEntityType" #extra-actions>
            <UButton
              icon="i-lucide-link"
              variant="outline"
              color="neutral"
              size="sm"
              :disabled="selectedRows.length !== 1"
              @click="openMapping"
            >
              {{ t('mappings.provider_mappings') }}
            </UButton>
          </template>
        </AdminEntityToolbar>

        <AdminUserTable
          :data="rows"
          :columns="filteredColumns"
          :loading="status === 'pending'"
          :selected-ids="selectedIds"
          :all-selected="allSelected"
          :some-selected="someSelected"
          :selected-count="selectedRows.length"
          :total="total"
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          @toggle-row="toggleRow"
          @toggle-all="toggleAll"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        />
      </div>
    </UCard>

    <AdminEntityFormModal
      v-model:open="modalOpen"
      :item="editItem"
      :title="editItem ? editTitle : addLabel"
      :fields="formFields"
      :endpoint="endpoint"
      @success="handleRefresh"
    />

    <!-- Mapping Slideover -->
    <AdminMappingSlideover
      v-if="mappingEntityType"
      v-model:open="mappingOpen"
      :entity-type="mappingEntityType"
      :entity-id="mappingEntityId"
      :entity-name="mappingEntityName"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  endpoint: string
  pageKey: string
  columns: Array<{ accessorKey: string; header: string }>
  formFields: Array<{ key: string; label: string; type?: 'text' | 'number' | 'boolean'; required?: boolean }>
  searchPlaceholder: string
  addLabel: string
  editTitle: string
  mappingEntityType?: string
}>()

const toast = useToast()
const { t } = useI18n()

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch, bulkDelete
} = useEntityList<any>(props.endpoint, props.pageKey, props.columns)

const modalOpen = ref(false)
const editItem = ref<any>(null)

// Mapping slideover state
const mappingOpen = ref(false)
const mappingEntityId = ref<number | null>(null)
const mappingEntityName = ref('')

function openEdit() {
  if (selectedRows.value.length === 1) {
    editItem.value = selectedRows.value[0]
    modalOpen.value = true
  }
}

function openMapping() {
  if (selectedRows.value.length === 1) {
    const row = selectedRows.value[0]
    mappingEntityId.value = row.id
    mappingEntityName.value = row.name || row.username || `#${row.id}`
    mappingOpen.value = true
  }
}

async function handleActivate() {
  const { succeeded, failed } = await bulkPatch({ active: true })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleDeactivate() {
  const { succeeded, failed } = await bulkPatch({ active: false })
  toast.add({ title: failed === 0 ? t('modals.success_updated') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}

async function handleDelete() {
  const { succeeded, failed } = await bulkDelete()
  toast.add({ title: failed === 0 ? t('modals.success_deleted') : `${succeeded}/${succeeded + failed}`, color: failed === 0 ? 'success' : 'warning' })
}
</script>
