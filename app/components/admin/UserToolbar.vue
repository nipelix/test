<template>
  <div class="space-y-3">
    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="emit('create')">
        {{ addLabel }}
      </UButton>
      <UButton icon="i-lucide-user-pen" variant="outline" color="neutral" size="sm" :disabled="selectedCount !== 1" @click="emit('edit')">
        {{ t('common.edit') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="emit('refresh')">
        {{ t('common.refresh') }}
      </UButton>
      <slot name="extra-actions" />
      <UButton v-if="showBalance" icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="emit('balance', 'deposit')">
        {{ t('common.add_balance') }}
      </UButton>
      <UButton v-if="showBalance" icon="i-lucide-minus-circle" variant="outline" color="neutral" size="sm" @click="emit('balance', 'withdraw')">
        {{ t('common.remove_balance') }}
      </UButton>
      <UButton v-if="showCredit" icon="i-lucide-coins" variant="outline" color="neutral" size="sm" @click="emit('credit')">
        {{ t('dashboard.add_credit') }}
      </UButton>
      <UButton icon="i-lucide-check-circle-2" variant="outline" color="neutral" size="sm" :disabled="selectedCount === 0" @click="emit('status', 'activate')">
        {{ t('common.activate') }}
      </UButton>
      <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" :disabled="selectedCount === 0" @click="emit('status', 'deactivate')">
        {{ t('common.deactivate') }}
      </UButton>
      <UButton icon="i-lucide-trash-2" variant="outline" color="error" size="sm" :disabled="selectedCount === 0" @click="emit('status', 'delete')">
        {{ t('common.delete') }}
      </UButton>
    </div>

    <!-- Search + Sort/View -->
    <div class="flex items-center justify-between gap-4">
      <UInput :model-value="search" icon="i-lucide-search" :placeholder="searchPlaceholder" class="max-w-xs" @update:model-value="emit('update:search', $event)" />
      <div class="flex items-center gap-2">
        <slot name="filters" />
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
  searchPlaceholder: string
  addLabel: string
  selectedCount: number
  showBalance?: boolean
  showCredit?: boolean
  sorts: any[]
  sortableColumns: any[]
  availableSortColumns: any[]
  toggleableColumns: any[]
  visibleColumns: string[]
}>()

const emit = defineEmits<{
  create: []
  edit: []
  refresh: []
  credit: []
  balance: [mode: 'deposit' | 'withdraw']
  status: [action: 'activate' | 'deactivate' | 'delete']
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
