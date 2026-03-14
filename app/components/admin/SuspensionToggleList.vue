<template>
  <div class="space-y-1 max-h-[55vh] overflow-y-auto">
    <div v-if="loading" class="text-center py-8 text-muted text-sm">Loading...</div>
    <div
      v-for="item in items"
      :key="item.id"
      class="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium truncate">{{ item.name }}</p>
        <p v-if="item.description" class="text-xs text-muted truncate">{{ item.description }}</p>
      </div>
      <USwitch
        :model-value="!suspendedIds.has(item.id)"
        @update:model-value="emit('toggle', item.id, !$event)"
      />
    </div>
    <p v-if="!loading && items.length === 0" class="text-sm text-muted text-center py-8">
      {{ t('common.no_data') }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ id: number; name: string; description?: string }>
  suspendedIds: Set<number>
  loading?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number, suspended: boolean]
}>()

const { t } = useI18n()
</script>
