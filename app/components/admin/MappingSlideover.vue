<template>
  <USlideover v-model:open="isOpen" :title="`${entityName} — ${t('mappings.provider_mappings')}`" :description="t('mappings.provider_mappings')">
    <template #body>
      <div class="space-y-4">
        <!-- Existing mappings -->
        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-14 rounded-lg" />
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="mapping in mappings"
            :key="mapping.id"
            class="rounded-lg border border-default overflow-hidden"
          >
            <!-- View mode -->
            <div v-if="editingId !== mapping.id" class="flex items-center justify-between p-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UIcon name="i-lucide-link" class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-medium">{{ mapping.providerName || `Provider #${mapping.providerId}` }}</p>
                  <p class="text-xs text-muted font-mono">ID: {{ mapping.externalId }}</p>
                </div>
              </div>
              <div class="flex gap-1">
                <UButton
                  icon="i-lucide-pencil"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="startEdit(mapping)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  color="error"
                  size="xs"
                  :loading="deletingId === mapping.id"
                  @click="handleDelete(mapping.id)"
                />
              </div>
            </div>

            <!-- Edit mode -->
            <div v-else class="p-3 bg-primary/5">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium shrink-0">{{ mapping.providerName }}</span>
                <UInput
                  v-model="editExternalId"
                  placeholder="External ID"
                  size="xs"
                  class="flex-1"
                  @keyup.enter="handleSaveEdit(mapping.id)"
                  @keyup.escape="cancelEdit"
                />
                <UButton
                  icon="i-lucide-check"
                  color="success"
                  size="xs"
                  :loading="saving"
                  @click="handleSaveEdit(mapping.id)"
                />
                <UButton
                  icon="i-lucide-x"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="cancelEdit"
                />
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="mappings.length === 0" class="flex flex-col items-center py-8 text-muted">
            <UIcon name="i-lucide-unlink" class="w-10 h-10 mb-2 opacity-30" />
            <p class="text-sm">{{ t('mappings.no_mappings') }}</p>
          </div>
        </div>

        <!-- Add new mapping -->
        <USeparator />
        <h3 class="text-sm font-semibold">{{ t('mappings.add_mapping') }}</h3>
        <div class="space-y-3">
          <UFormField :label="t('mappings.select_provider')">
            <USelectMenu
              v-model="newProviderId"
              :items="providerOptions"
              value-key="value"
              :placeholder="t('mappings.select_provider')"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="t('mappings.external_id')">
            <UInput
              v-model="newExternalId"
              :placeholder="t('mappings.external_id')"
              class="w-full"
              @keyup.enter="handleAdd"
            />
          </UFormField>
          <UButton
            block
            color="primary"
            icon="i-lucide-plus"
            :disabled="!newProviderId || !newExternalId"
            :loading="saving"
            @click="handleAdd"
          >
            {{ t('common.add') }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const props = defineProps<{
  entityType: string
  entityId: number | null
  entityName: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const { t } = useI18n()

const entityTypeRef = computed(() => props.entityType)
const entityIdRef = computed(() => props.entityId ?? 0)

const {
  mappings, loading, saving, deletingId, editingId, editExternalId,
  newProviderId, newExternalId, providerOptions,
  handleAdd, startEdit, cancelEdit, handleSaveEdit, handleDelete
} = useInlineMapping(entityTypeRef, entityIdRef)
</script>
