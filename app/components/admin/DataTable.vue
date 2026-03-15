<template>
  <div class="border border-default rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <UTable :data="flatData" :columns="columns" :loading="loading">
        <!-- Select + Expand toggle -->
        <template #select-cell="{ row }">
          <div v-if="!row.original._isExpansion" class="flex items-center gap-0.5">
            <UButton
              v-if="expandable"
              :icon="expandedRows.has(row.original.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              variant="ghost"
              color="neutral"
              size="2xs"
              @click.stop="toggleExpand(row.original.id)"
            />
            <UCheckbox
              :model-value="selectedIds.has(row.original.id)"
              @update:model-value="emit('toggle-row', row.original.id)"
            />
          </div>
        </template>

        <template #select-header>
          <UCheckbox :model-value="allSelected" :indeterminate="someSelected" @update:model-value="emit('toggle-all')" />
        </template>

        <!-- Expansion row: span full width -->
        <template v-for="col in dataColumnKeys" :key="`exp-${col}`" #[`${col}-cell`]="{ row }">
          <template v-if="row.original._isExpansion && col === dataColumnKeys[0]">
            <div class="col-span-full -mx-2">
              <slot name="expanded" :row="getParentRow(row.original._expandedFor)" />
            </div>
          </template>
          <template v-else-if="!row.original._isExpansion">
            <slot :name="`${col}-cell`" :row="row">
              {{ row.original[col] }}
            </slot>
          </template>
        </template>

        <!-- Active status badge -->
        <template #active-cell="{ row }">
          <template v-if="!row.original._isExpansion">
            <UBadge :color="row.original.active ? 'success' : 'error'" variant="subtle" size="sm">
              {{ row.original.active ? t('common.active') : t('common.inactive') }}
            </UBadge>
          </template>
        </template>

        <!-- Row actions dropdown -->
        <template v-if="showActions" #actions-cell="{ row }">
          <template v-if="!row.original._isExpansion">
            <UDropdownMenu v-if="rowActions" :items="rowActions(row.original)">
              <UButton icon="i-lucide-ellipsis-vertical" variant="ghost" color="neutral" size="xs" />
            </UDropdownMenu>
          </template>
        </template>
      </UTable>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && data.length === 0" class="flex flex-col items-center justify-center py-12 text-muted">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 mb-3 opacity-30" />
      <p class="text-sm">{{ t('common.no_data') }}</p>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-3 py-2.5 border-t border-default bg-gray-50/30 dark:bg-gray-900/30">
      <div class="flex items-center gap-3 text-sm text-muted">
        <USelectMenu :model-value="pageSize" :items="pageSizeOptions" value-key="value" class="w-20" size="xs" @update:model-value="emit('update:pageSize', $event)" />
        <span>{{ t('common.rows_selected', { count: selectedCount, total }) }}</span>
      </div>
      <div class="flex items-center gap-1 text-sm">
        <span class="mr-2 text-muted">{{ t('common.page_of', { page: currentPage, pages: totalPages }) }}</span>
        <UButton icon="i-lucide-chevrons-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="emit('update:currentPage', 1)" />
        <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="emit('update:currentPage', currentPage - 1)" />
        <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="emit('update:currentPage', currentPage + 1)" />
        <UButton icon="i-lucide-chevrons-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="emit('update:currentPage', totalPages)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatBalance } from '~~/shared/utils/formatters'

const props = defineProps<{
  data: any[]
  columns: any[]
  loading: boolean
  selectedIds: Set<number>
  allSelected: boolean
  someSelected: boolean
  selectedCount: number
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  expandable?: boolean
  showActions?: boolean
  rowActions?: (row: any) => any[][]
}>()

const emit = defineEmits<{
  'toggle-row': [id: number]
  'toggle-all': []
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

const { t } = useI18n()

// Expand state
const expandedRows = reactive(new Set<number>())

function toggleExpand(id: number) {
  expandedRows.has(id) ? expandedRows.delete(id) : expandedRows.add(id)
}

function getParentRow(id: number) {
  return props.data.find(r => r.id === id)
}

// Flatten data with expansion sentinel rows
const flatData = computed(() => {
  if (!props.expandable) return props.data
  const result: any[] = []
  for (const row of props.data) {
    result.push(row)
    if (expandedRows.has(row.id)) {
      result.push({ _isExpansion: true, _expandedFor: row.id, id: `exp-${row.id}` })
    }
  }
  return result
})

const dataColumnKeys = computed(() =>
  props.columns.map((c: any) => c.accessorKey).filter((k: string) => k && k !== 'select' && k !== 'actions')
)

const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 }
]
</script>
