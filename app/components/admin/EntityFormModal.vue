<template>
  <UModal v-model:open="isOpen" :title="title" :description="title">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <UFormField
            v-for="field in fields"
            :key="field.key"
            :label="field.label"
            :name="field.key"
            :required="field.required"
            :error="visibleErrors[field.key]"
          >
            <UInput
              v-if="!field.type || field.type === 'text' || field.type === 'number'"
              v-model="form[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.label"
              class="w-full"
              @blur="touch(field.key)"
            />
            <USwitch v-else-if="field.type === 'boolean'" v-model="form[field.key]" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">{{ t('common.save') }}</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface FormField {
  key: string
  label: string
  type?: 'text' | 'number' | 'boolean'
  required?: boolean
}

const { item, title, fields, endpoint } = defineProps<{
  item: Record<string, any> | null
  title: string
  fields: FormField[]
  endpoint: string
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const form = reactive<Record<string, any>>({})

// Dynamic validation from field definitions
const { visibleErrors, touch, reset: resetValidation, submit: validateForm } = useFormValidation(() => {
  const errors: Record<string, string | undefined> = {}
  for (const field of fields) {
    const val = form[field.key]
    if (field.required) {
      if (field.type === 'text' || !field.type) {
        if (!val || !String(val).trim()) errors[field.key] = t('validation.required')
      } else if (field.type === 'number') {
        if (val === null || val === undefined || val === '') errors[field.key] = t('validation.required')
      }
    }
    if (field.type === 'number' && val !== '' && val !== null && val !== undefined && isNaN(Number(val))) {
      errors[field.key] = t('validation.invalid_number')
    }
  }
  return errors
})

// Populate form on open
watch(isOpen, (val) => {
  if (val) {
    Object.keys(form).forEach(k => delete form[k])
    for (const field of fields) {
      form[field.key] = item?.[field.key] ?? (field.type === 'boolean' ? false : field.type === 'number' ? 0 : '')
    }
    resetValidation()
  }
})

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  try {
    if (item?.id) {
      await $fetch(`${endpoint}/${item.id}`, { method: 'PATCH', body: { ...form } })
    } else {
      await $fetch(endpoint, { method: 'POST', body: { ...form } })
    }
    toast.add({ title: item?.id ? t('modals.success_updated') : t('modals.success_created'), color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
