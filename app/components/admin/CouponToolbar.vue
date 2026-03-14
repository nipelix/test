<template>
  <div class="space-y-3">
    <!-- Status Filter Buttons -->
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" size="sm" @click="emit('refresh')">
        {{ t('common.refresh') }}
      </UButton>
      <UButton variant="outline" color="info" icon="i-lucide-clock" size="sm" :class="{ 'ring-2 ring-blue-500': activeFilter === 'ONGOING' }" @click="emit('filter', 'ONGOING')">
        {{ t('dashboard.ongoing_bets') }}
      </UButton>
      <UButton variant="outline" color="success" icon="i-lucide-trophy" size="sm" :class="{ 'ring-2 ring-green-500': activeFilter === 'WON' }" @click="emit('filter', 'WON')">
        {{ t('dashboard.won') }}
      </UButton>
      <UButton variant="outline" color="error" icon="i-lucide-thumbs-down" size="sm" :class="{ 'ring-2 ring-red-500': activeFilter === 'LOST' }" @click="emit('filter', 'LOST')">
        {{ t('dashboard.lost') }}
      </UButton>
      <UButton variant="outline" color="warning" icon="i-lucide-rotate-ccw" size="sm" :class="{ 'ring-2 ring-orange-500': activeFilter === 'REFUNDED' }" @click="emit('filter', 'REFUNDED')">
        {{ t('dashboard.refunded_bets') }}
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-x-circle" size="sm" :class="{ 'ring-2 ring-gray-500': activeFilter === 'CANCELLED' }" @click="emit('filter', 'CANCELLED')">
        {{ t('dashboard.cancelled_bets') }}
      </UButton>
      <UButton variant="outline" color="neutral" icon="i-lucide-list" size="sm" :class="{ 'ring-2 ring-primary': activeFilter === 'all' }" @click="emit('filter', 'all')">
        {{ t('common.all') }}
      </UButton>

      <!-- Details -->
      <UButton variant="soft" color="primary" icon="i-lucide-eye" size="sm" :disabled="selectedCount !== 1" @click="emit('details')">
        {{ t('common.details') }}
      </UButton>

      <!-- Bulk Actions -->
      <template v-if="showBulkActions">
        <USeparator orientation="vertical" class="h-6 mx-1" />
        <UButton variant="soft" color="error" icon="i-lucide-ban" size="sm" :disabled="selectedCount === 0" @click="emit('cancel')">
          {{ t('common.cancel') }}
        </UButton>
        <UButton variant="soft" color="error" icon="i-lucide-trash" size="sm" :disabled="selectedCount === 0" @click="emit('delete')">
          {{ t('common.delete') }}
        </UButton>
        <UButton variant="soft" color="success" icon="i-lucide-check-circle" size="sm" :disabled="selectedCount === 0" @click="emit('mark-won')">
          {{ t('dashboard.mark_as_won') }}
        </UButton>
        <UButton variant="soft" color="error" icon="i-lucide-x-circle" size="sm" :disabled="selectedCount === 0" @click="emit('mark-lost')">
          {{ t('dashboard.mark_as_lost') }}
        </UButton>
      </template>
    </div>

    <!-- Search + Sort/View -->
    <div class="flex items-center justify-between gap-4">
      <UInput :model-value="search" icon="i-lucide-search" :placeholder="t('dashboard.search_coupons')" class="max-w-xs" @update:model-value="emit('update:search', $event)" />
      <div class="flex items-center gap-2">
        <AdminTableSortPopover
          :sorts="sorts"
          :sortable-columns="sortableColumns"
          :available-sort-columns="availableSortColumns"
          @add-sort="emit('add-sort')"
          @remove-sort="(i: number) => emit('remove-sort', i)"
          @update-sort-column="(i: number, k: string) => emit('update-sort-column', i, k)"
          @update-sort-direction="(i: number, d: string) => emit('update-sort-direction', i, d)"
          @clear-sorts="emit('clear-sorts')"
        />
        <AdminTableViewPopover
          :toggleable-columns="toggleableColumns"
          :visible-columns="visibleColumns"
          @toggle-column="(k: string) => emit('toggle-column', k)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  activeFilter: string
  selectedCount: number
  showBulkActions?: boolean
  sorts: any[]
  sortableColumns: any[]
  availableSortColumns: any[]
  toggleableColumns: any[]
  visibleColumns: string[]
}>()

const emit = defineEmits<{
  refresh: []
  details: []
  filter: [status: string]
  cancel: []
  delete: []
  'mark-won': []
  'mark-lost': []
  'update:search': [value: string]
  'add-sort': []
  'remove-sort': [index: number]
  'update-sort-column': [index: number, key: string]
  'update-sort-direction': [index: number, direction: string]
  'clear-sorts': []
  'toggle-column': [key: string]
}>()

const { t } = useI18n()
</script>
