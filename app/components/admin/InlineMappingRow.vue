<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-link" class="w-4 h-4 text-muted" />
      <span class="text-sm font-medium text-muted">{{ t('mappings.provider_mappings') }}</span>
      <UBadge variant="subtle" size="xs" color="neutral">{{ mappings.length }}</UBadge>
    </div>

    <!-- Existing mappings as chips -->
    <div class="flex flex-wrap gap-2">
      <div
        v-for="mapping in mappings"
        :key="mapping.id"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-default text-sm"
      >
        <span class="font-medium text-xs">{{ mapping.providerName || `P${mapping.providerId}` }}</span>
        <USeparator orientation="vertical" class="h-3" />
        <span class="text-muted font-mono tabular-nums text-xs">{{ mapping.externalId }}</span>
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          color="error"
          size="2xs"
          :loading="deletingId === mapping.id"
          @click="handleDelete(mapping.id)"
        />
      </div>
      <p v-if="mappings.length === 0 && !loading" class="text-xs text-muted italic">
        {{ t('mappings.no_mappings') }}
      </p>
    </div>

    <!-- Add new mapping -->
    <div class="flex items-center gap-2">
      <USelectMenu
        v-model="newProviderId"
        :items="providerOptions"
        value-key="value"
        :placeholder="t('mappings.select_provider')"
        size="xs"
        class="w-40"
      />
      <UInput
        v-model="newExternalId"
        :placeholder="t('mappings.external_id')"
        size="xs"
        class="w-32"
        @keyup.enter="handleAdd"
      />
      <UButton
        icon="i-lucide-plus"
        size="xs"
        :disabled="!newProviderId || !newExternalId"
        :loading="adding"
        @click="handleAdd"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  entityType: string
  entityId: number
}>()

const { t } = useI18n()

const {
  mappings, loading, adding, deletingId,
  newProviderId, newExternalId, providerOptions,
  handleAdd, handleDelete
} = useInlineMapping(toRef(props, 'entityType'), toRef(props, 'entityId'))
</script>
