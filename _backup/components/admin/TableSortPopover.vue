<template>
  <UPopover :content="{ align: 'end' }">
    <UButton icon="i-lucide-arrow-up-down" variant="outline" color="neutral" size="sm">
      {{ t('common.sort') }}
      <UBadge v-if="sorts.length > 0" :label="String(sorts.length)" size="xs" variant="subtle" color="primary" class="ml-1" />
    </UButton>
    <template #content>
      <div class="p-3 min-w-72">
        <!-- Empty State -->
        <div v-if="sorts.length === 0" class="space-y-3">
          <div>
            <p class="font-semibold text-sm">{{ t('common.no_sorting_applied') }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ t('common.add_sorting_description') }}</p>
          </div>
          <UButton color="neutral" variant="solid" size="sm" @click="addSort">
            {{ t('common.add_sort') }}
          </UButton>
        </div>

        <!-- Active Sorts -->
        <div v-else class="space-y-3">
          <p class="font-semibold text-sm">{{ t('common.sort_by') }}</p>
          <div class="space-y-2">
            <div v-for="(sort, index) in sorts" :key="index" class="flex items-center gap-2">
              <!-- Column Select -->
              <USelect
                :model-value="sort.key"
                :items="getColumnsForIndex(index)"
                value-key="key"
                label-key="label"
                size="sm"
                class="flex-1 min-w-0"
                @update:model-value="updateSortColumn(index, $event)"
              />
              <!-- Direction Select -->
              <USelect
                :model-value="sort.direction"
                :items="directionOptions"
                value-key="value"
                label-key="label"
                size="sm"
                class="w-24"
                @update:model-value="updateSortDirection(index, $event)"
              />
              <!-- Delete -->
              <UButton icon="i-lucide-trash-2" variant="ghost" color="neutral" size="xs" @click="removeSort(index)" />
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <UButton color="neutral" variant="solid" size="sm" @click="addSort" :disabled="availableSortColumns.length === 0">
              {{ t('common.add_sort') }}
            </UButton>
            <UButton variant="ghost" color="neutral" size="sm" @click="clearSorts">
              {{ t('common.reset_sorting') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { SortItem } from '~/stores/table'

const { t } = useI18n()

const props = defineProps<{
  sorts: SortItem[]
  sortableColumns: { key: string; label: string }[]
  availableSortColumns: { key: string; label: string }[]
}>()

const emit = defineEmits<{
  addSort: []
  removeSort: [index: number]
  updateSortColumn: [index: number, key: string]
  updateSortDirection: [index: number, direction: 'asc' | 'desc']
  clearSorts: []
}>()

const directionOptions = computed(() => [
  { value: 'asc', label: t('common.asc') },
  { value: 'desc', label: t('common.desc') }
])

function addSort() { emit('addSort') }
function removeSort(index: number) { emit('removeSort', index) }
function updateSortColumn(index: number, key: string) { emit('updateSortColumn', index, key) }
function updateSortDirection(index: number, direction: 'asc' | 'desc') { emit('updateSortDirection', index, direction) }
function clearSorts() { emit('clearSorts') }

// For each sort row, show: the current column + all available (unused) columns
function getColumnsForIndex(index: number): { key: string; label: string }[] {
  const currentKey = props.sorts[index]?.key
  const usedKeys = new Set(props.sorts.map((s, i) => i !== index ? s.key : ''))
  return props.sortableColumns.filter(c => c.key === currentKey || !usedKeys.has(c.key))
}
</script>
