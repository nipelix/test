<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>
        <p class="text-sm text-muted">{{ message }}</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">
              {{ $t('common.cancel') }}
            </UButton>
            <UButton :color="confirmColor" @click="handleConfirm">
              {{ confirmText || $t('common.confirm') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
  confirmText?: string
  confirmColor?: 'primary' | 'error' | 'warning'
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()

function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}
</script>
