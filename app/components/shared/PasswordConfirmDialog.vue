<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ $t('common.confirm') }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-muted">{{ message }}</p>
          <UFormField :label="$t('common.password')">
            <UInput v-model="password" type="password" :placeholder="$t('common.password')" class="w-full" />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">
              {{ $t('common.cancel') }}
            </UButton>
            <UButton color="primary" :disabled="!password" @click="handleConfirm">
              {{ $t('common.confirm') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [password: string] }>()
const password = ref('')

function handleConfirm() {
  emit('confirm', password.value)
  password.value = ''
  isOpen.value = false
}
</script>
