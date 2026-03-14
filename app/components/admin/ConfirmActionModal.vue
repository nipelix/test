<template>
  <UModal v-model:open="isOpen" :title="actionTitle" :description="actionTitle">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ actionTitle }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-sm text-muted">{{ t('modals.confirm_action_message') }}</p>
          <ul class="text-sm space-y-1">
            <li v-for="user in users" :key="user.id" class="flex items-center gap-2">
              <UIcon name="i-lucide-user" class="w-4 h-4 text-gray-400" />
              <span>{{ user.username }}</span>
            </li>
          </ul>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">
              {{ t('common.cancel') }}
            </UButton>
            <UButton :color="confirmColor" :loading="loading" @click="handleConfirm">
              {{ t('common.confirm') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  action: 'activate' | 'deactivate' | 'delete'
  users: Array<{ id: number, username: string }>
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)

const actionTitle = computed(() => {
  switch (props.action) {
    case 'activate': return t('common.activate')
    case 'deactivate': return t('common.deactivate')
    case 'delete': return t('common.delete')
  }
})

const confirmColor = computed(() => {
  return props.action === 'delete' ? 'error' as const : 'primary' as const
})

async function handleConfirm() {
  loading.value = true
  try {
    const promises = props.users.map(user => {
      if (props.action === 'delete') {
        return $fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      }
      return $fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: { status: props.action === 'activate' ? 'ACTIVE' : 'PASSIVE' }
      })
    })

    await Promise.allSettled(promises)

    const successMsg = props.action === 'delete'
      ? t('modals.success_deleted')
      : t('modals.success_updated')
    toast.add({ title: successMsg, color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
