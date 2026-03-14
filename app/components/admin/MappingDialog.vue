<template>
  <UModal v-model:open="isOpen" :title="t('mappings.provider_mappings')" :description="t('mappings.provider_mappings')">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ t('mappings.provider_mappings') }} — {{ entityName }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Existing Mappings -->
          <div v-for="mapping in mappings" :key="mapping.id" class="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
            <div>
              <span class="text-sm font-medium">{{ mapping.providerName }}</span>
              <span class="text-xs text-muted ml-2">ID: {{ mapping.externalId }}</span>
            </div>
            <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click="deleteMapping(mapping.id)" />
          </div>
          <p v-if="mappings.length === 0" class="text-sm text-muted text-center py-2">{{ t('common.no_data') }}</p>

          <USeparator />

          <!-- Add New Mapping -->
          <div class="flex gap-2">
            <USelectMenu v-model="newProviderId" :items="providerOptions" value-key="value" :placeholder="t('mappings.select_provider')" class="flex-1" />
            <UInput v-model="newExternalId" :placeholder="t('mappings.external_id')" class="flex-1" />
            <UButton icon="i-lucide-plus" :disabled="!newProviderId || !newExternalId" @click="addMapping" />
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  entityType: 'MARKET' | 'SELECTION'
  entityId: number | null
  entityName: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()

const mappings = ref<any[]>([])
const newProviderId = ref<number | null>(null)
const newExternalId = ref('')

const { data: providers } = await useAsyncData('providers-list', () =>
  $fetch<{ data: any[] }>('/api/providers', { query: { limit: 100 } }).catch(() => ({ data: [] }))
)

const providerOptions = computed(() => (providers.value?.data ?? []).map((p: any) => ({ label: p.name, value: p.id })))

watch(isOpen, async (val) => {
  if (val && props.entityId) {
    try {
      const res = await $fetch<{ data: any[] }>('/api/provider-mappings', {
        query: { entityType: props.entityType, entityId: props.entityId }
      })
      mappings.value = res.data ?? []
    } catch { mappings.value = [] }
    newProviderId.value = null
    newExternalId.value = ''
  }
})

async function addMapping() {
  if (!props.entityId || !newProviderId.value || !newExternalId.value) return
  try {
    await $fetch('/api/provider-mappings', {
      method: 'POST',
      body: { entityType: props.entityType, entityId: props.entityId, providerId: newProviderId.value, externalId: newExternalId.value }
    })
    toast.add({ title: t('modals.success_created'), color: 'success' })
    // Refresh
    const res = await $fetch<{ data: any[] }>('/api/provider-mappings', {
      query: { entityType: props.entityType, entityId: props.entityId }
    })
    mappings.value = res.data ?? []
    newExternalId.value = ''
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  }
}

async function deleteMapping(id: number) {
  try {
    await $fetch(`/api/provider-mappings/${id}`, { method: 'DELETE' })
    mappings.value = mappings.value.filter(m => m.id !== id)
    toast.add({ title: t('modals.success_deleted'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}
</script>
