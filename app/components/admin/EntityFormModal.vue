<template>
  <USlideover v-model:open="isOpen" :title="title">
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Entity fields -->
        <UFormField
          v-for="field in fields"
          :key="field.key"
          :label="field.label"
          :name="field.key"
          :required="field.required"
          :error="visibleErrors[field.key]"
        >
          <UInput
            v-if="!field.type || field.type === 'text'"
            v-model="form[field.key]"
            :placeholder="field.label"
            class="w-full"
            @blur="touch(field.key)"
          />
          <UInput
            v-else-if="field.type === 'number'"
            v-model="form[field.key]"
            type="number"
            :placeholder="field.label"
            class="w-full"
            @blur="touch(field.key)"
          />
          <USwitch
            v-else-if="field.type === 'boolean'"
            v-model="form[field.key]"
            :label="field.label"
          />
          <USelectMenu
            v-else-if="field.type === 'select' && field.options"
            v-model="form[field.key]"
            :items="field.options"
            value-key="value"
            :placeholder="field.label"
            class="w-full"
          />
        </UFormField>

        <!-- Translations section -->
        <template v-if="translationEntityType">
          <USeparator class="my-2" />
          <h3 class="text-sm font-semibold text-muted">{{ t('common.translations') }}</h3>

          <div v-for="lang in translationLangs" :key="lang" class="space-y-2">
            <p class="text-xs font-medium text-muted uppercase">{{ lang }}</p>
            <UFormField
              v-for="field in translationFields"
              :key="`${lang}-${field}`"
              :label="`${field} (${lang})`"
            >
              <UInput
                v-model="translationForm[`${lang}:${field}`]"
                :placeholder="`${field} (${lang})`"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
        <UButton type="submit" color="primary" :loading="loading" @click="handleSubmit">{{ t('common.save') }}</UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
interface FormField {
  key: string
  label: string
  type?: 'text' | 'number' | 'boolean' | 'select'
  required?: boolean
  options?: Array<{ label: string; value: any }>
}

const { item, title, fields, endpoint, translationEntityType, translationFields: tFields, translationLangs: tLangs } = defineProps<{
  item: Record<string, any> | null
  title: string
  fields: FormField[]
  endpoint: string
  translationEntityType?: string
  translationFields?: string[]
  translationLangs?: string[]
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const form = reactive<Record<string, any>>({})
const translationForm = reactive<Record<string, string>>({})

const translationFields = computed(() => tFields ?? ['name'])
const translationLangs = computed(() => tLangs ?? ['tr', 'en'])

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
  }
  return errors
})

watch(isOpen, async (val) => {
  if (val) {
    // Reset entity form
    Object.keys(form).forEach(k => delete form[k])
    for (const field of fields) {
      form[field.key] = item?.[field.key] ?? (field.type === 'boolean' ? false : field.type === 'number' ? 0 : '')
    }
    resetValidation()

    // Reset translation form
    Object.keys(translationForm).forEach(k => delete translationForm[k])

    // Load existing translations if editing
    if (item?.id && translationEntityType) {
      try {
        const res = await $fetch<{ data: any[] }>('/api/translations', {
          query: { entityType: translationEntityType, entityId: item.id }
        })
        for (const tr of res.data ?? []) {
          translationForm[`${tr.lang}:${tr.field}`] = tr.value
        }
      } catch { /* silent */ }
    }
  }
})

async function handleSubmit() {
  if (!validateForm()) return
  loading.value = true
  try {
    let entityId = item?.id

    // Create or update entity
    if (entityId) {
      await $fetch(`${endpoint}/${entityId}`, { method: 'PATCH', body: { ...form } })
    } else {
      const created = await $fetch<{ id: number }>(endpoint, { method: 'POST', body: { ...form } })
      entityId = created.id
    }

    // Save translations
    if (translationEntityType && entityId) {
      const translations: Array<{ entityType: string; entityId: number; lang: string; field: string; value: string }> = []
      for (const [key, value] of Object.entries(translationForm)) {
        if (!value?.trim()) continue
        const [lang, field] = key.split(':')
        translations.push({ entityType: translationEntityType, entityId, lang: lang!, field: field!, value: value.trim() })
      }
      if (translations.length > 0) {
        await $fetch('/api/translations', { method: 'POST', body: { translations } })
      }
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
