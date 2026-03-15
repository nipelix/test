<template>
  <div class="border border-default rounded-lg overflow-hidden">
    <!-- Table with horizontal scroll for mobile -->
    <div class="overflow-x-auto">
      <UTable :data="data" :columns="columns" :loading="loading">
        <template #select-cell="{ row }">
          <UCheckbox :model-value="selectedIds.has(row.original.id)" @update:model-value="emit('toggle-row', row.original.id)" />
        </template>
        <template #select-header>
          <UCheckbox :model-value="allSelected" :indeterminate="someSelected" @update:model-value="emit('toggle-all')" />
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'ACTIVE' ? 'success' : 'error'" variant="subtle" size="sm">
            {{ row.original.status === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
          </UBadge>
        </template>

        <template #balance-cell="{ row }">
          <span class="font-mono tabular-nums">{{ formatBalance(row.original.balance) }}</span>
        </template>

        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
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
        <USelectMenu
          :model-value="pageSize"
          :items="pageSizeOptions"
          value-key="value"
          class="w-20"
          size="xs"
          @update:model-value="emit('update:pageSize', $event)"
        />
        <span>{{ t('common.rows_selected', { count: selectedCount, total: total }) }}</span>
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

defineProps<{
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

const emit = defineEmits<{
  'toggle-row': [id: number]
  'toggle-all': []
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

const { t } = useI18n()

const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 }
]
</script>
