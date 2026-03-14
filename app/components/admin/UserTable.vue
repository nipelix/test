<template>
  <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
    <UTable :data="data" :columns="columns" :loading="loading">
      <!-- Checkbox column -->
      <template #select-cell="{ row }">
        <UCheckbox :model-value="selectedIds.has(row.original.id)" @update:model-value="$emit('toggle-row', row.original.id)" />
      </template>
      <template #select-header>
        <UCheckbox :model-value="allSelected" :indeterminate="someSelected" @update:model-value="$emit('toggle-all')" />
      </template>

      <!-- Status badge -->
      <template #status-cell="{ row }">
        <UBadge :color="row.original.status === 'ACTIVE' ? 'success' : 'error'" variant="subtle" size="sm">
          {{ row.original.status === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
        </UBadge>
      </template>

      <!-- Balance / Credit -->
      <template #balance-cell="{ row }">
        <span class="font-mono tabular-nums">{{ formatBalance(row.original.balance) }}</span>
      </template>

      <!-- Date columns -->
      <template #createdAt-cell="{ row }">
        {{ formatDate(row.original.createdAt) }}
      </template>

      <!-- Pass through extra slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </UTable>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
      <div class="flex items-center gap-3 text-sm text-muted">
        <select v-model="pageSizeModel" class="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-transparent">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <span>{{ t('common.rows_selected', { count: selectedCount, total: total }) }}</span>
      </div>
      <div class="flex items-center gap-1 text-sm">
        <span class="mr-2 text-muted">{{ t('common.page_of', { page: currentPage, pages: totalPages }) }}</span>
        <UButton icon="i-lucide-chevrons-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="$emit('update:currentPage', 1)" />
        <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="$emit('update:currentPage', currentPage - 1)" />
        <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="$emit('update:currentPage', currentPage + 1)" />
        <UButton icon="i-lucide-chevrons-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="$emit('update:currentPage', totalPages)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
}>()

defineEmits<{
  'toggle-row': [id: number]
  'toggle-all': []
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

const { t } = useI18n()

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => {
    // emit is not available in computed set, use event directly
  }
})

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatBalance(val: string | number | null) {
  if (val == null) return '0.00'
  return Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>
