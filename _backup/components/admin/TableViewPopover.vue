<template>
  <UPopover :content="{ align: 'end' }">
    <UButton icon="i-lucide-settings-2" variant="outline" color="neutral" size="sm">
      {{ t('common.view') }}
    </UButton>
    <template #content>
      <div class="min-w-48">
        <!-- Search -->
        <div class="p-2 border-b border-gray-200 dark:border-gray-800">
          <UInput v-model="columnSearch" icon="i-lucide-search" :placeholder="t('common.search_columns')" size="sm" />
        </div>
        <!-- Column List -->
        <div class="py-1 max-h-64 overflow-y-auto">
          <button
            v-for="col in filteredToggleableColumns"
            :key="col.accessorKey"
            @click="$emit('toggleColumn', col.accessorKey)"
            class="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span class="truncate">{{ col.header }}</span>
            <UIcon v-if="visibleColumns.includes(col.accessorKey)" name="i-lucide-check" class="w-4 h-4 text-gray-900 dark:text-gray-100 shrink-0 ml-2" />
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  toggleableColumns: { accessorKey: string; header: string }[]
  visibleColumns: string[]
}>()

defineEmits<{
  toggleColumn: [key: string]
}>()

const columnSearch = ref('')

const filteredToggleableColumns = computed(() => {
  if (!columnSearch.value.trim()) return props.toggleableColumns
  const q = columnSearch.value.toLowerCase()
  return props.toggleableColumns.filter(c => c.header.toLowerCase().includes(q))
})
</script>
