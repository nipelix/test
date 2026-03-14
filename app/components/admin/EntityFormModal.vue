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
          >
            <UInput
              v-if="!field.type || field.type === 'text' || field.type === 'number'"
              v-model="form[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.label"
              class="w-full"
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

const props = defineProps<{
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

// Populate form on open
watch(isOpen, (val) => {
  if (val) {
    for (const field of props.fields) {
      form[field.key] = props.item?.[field.key] ?? (field.type === 'boolean' ? false : field.type === 'number' ? 0 : '')
    }
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    if (props.item?.id) {
      await $fetch(`${props.endpoint}/${props.item.id}`, { method: 'PATCH', body: { ...form } })
    } else {
      await $fetch(props.endpoint, { method: 'POST', body: { ...form } })
    }
    toast.add({ title: props.item?.id ? t('modals.success_updated') : t('modals.success_created'), color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
