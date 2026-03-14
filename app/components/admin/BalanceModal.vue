<template>
  <UModal v-model:open="isOpen" :title="mode === 'deposit' ? t('modals.balance_add_title') : t('modals.balance_remove_title')" :description="mode === 'deposit' ? t('modals.balance_add_title') : t('modals.balance_remove_title')">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ mode === 'deposit' ? t('modals.balance_add_title') : t('modals.balance_remove_title') }}
            </h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <div v-if="username" class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('common.user') }}: <span class="font-medium text-gray-900 dark:text-white">{{ username }}</span>
          </div>

          <UFormField :label="t('common.amount')" name="amount" required :error="visibleErrors.amount">
            <UInput v-model="formState.amount" type="number" :placeholder="t('common.amount')" class="w-full" autocomplete="off" @blur="touch('amount')" />
          </UFormField>

          <UFormField :label="t('common.description')" name="description">
            <UInput v-model="formState.description" :placeholder="t('common.description')" class="w-full" autocomplete="off" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">
              {{ t('common.cancel') }}
            </UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">
              {{ t('common.submit') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  userId: number | null
  username: string
  mode: 'deposit' | 'withdraw'
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const submitted = ref(false)
const touched = reactive<Record<string, boolean>>({})

const formState = reactive({
  amount: 0,
  description: ''
})

const errors = computed(() => ({
  amount: formState.amount <= 0 ? t('validation.required') : undefined
}))

const visibleErrors = computed(() => {
  const result: Record<string, string | undefined> = {}
  for (const key of Object.keys(errors.value) as Array<keyof typeof errors.value>) {
    result[key] = (submitted.value || touched[key]) ? errors.value[key] : undefined
  }
  return result
})

const hasErrors = computed(() => {
  return Object.values(errors.value).some(e => !!e)
})

function touch(field: string) {
  touched[field] = true
}

async function handleSubmit() {
  submitted.value = true
  if (!props.userId || hasErrors.value) return

  loading.value = true
  try {
    await $fetch(`/api/wallets/${props.userId}/${props.mode}`, {
      method: 'POST',
      body: {
        amount: formState.amount,
        description: formState.description || undefined
      }
    })
    toast.add({ title: t('modals.success_balance'), color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

watch(isOpen, (val) => {
  if (val) {
    formState.amount = 0
    formState.description = ''
    submitted.value = false
    Object.keys(touched).forEach(k => delete touched[k])
  }
})
</script>
