<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton v-if="showAdd" icon="i-lucide-plus-circle" variant="outline" color="neutral" size="sm" @click="emit('create')">
        {{ addLabel }}
      </UButton>
      <UButton icon="i-lucide-pencil" variant="outline" color="neutral" size="sm" :disabled="selectedCount !== 1" @click="emit('edit')">
        {{ t('common.edit') }}
      </UButton>
      <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="sm" @click="emit('refresh')">
        {{ t('common.refresh') }}
      </UButton>
      <slot name="extra-actions" />
      <UButton icon="i-lucide-check-circle-2" variant="outline" color="neutral" size="sm" :disabled="selectedCount === 0" @click="emit('activate')">
        {{ t('common.activate') }}
      </UButton>
      <UButton icon="i-lucide-x-circle" variant="outline" color="neutral" size="sm" :disabled="selectedCount === 0" @click="emit('deactivate')">
        {{ t('common.deactivate') }}
      </UButton>
      <UButton v-if="showDelete" icon="i-lucide-trash-2" variant="outline" color="error" size="sm" :disabled="selectedCount === 0" @click="emit('delete')">
        {{ t('common.delete') }}
      </UButton>
    </div>

    <div class="flex items-center justify-between gap-4">
      <UInput :model-value="search" icon="i-lucide-search" :placeholder="searchPlaceholder" class="max-w-xs" @update:model-value="emit('update:search', $event)" />
      <div class="flex items-center gap-2">
        <slot name="filters" />
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
  showAdd?: boolean
  showDelete?: boolean
}>()

const emit = defineEmits<{
  create: []
  edit: []
  refresh: []
  activate: []
  deactivate: []
  delete: []
  'update:search': [value: string]
}>()

const { t } = useI18n()
</script>
