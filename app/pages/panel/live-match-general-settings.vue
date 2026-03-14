<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.live_match_general_settings') }}</h1>

    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField :label="t('settings.live_duration_minutes')">
          <UInput v-model="form.liveDurationMinutes" type="number" class="w-full" />
        </UFormField>
        <UFormField :label="t('settings.delete_after_minutes')">
          <UInput v-model="form.deleteAfterMinutes" type="number" class="w-full" />
        </UFormField>
        <UFormField :label="t('settings.block_cancel_if_live')">
          <USwitch v-model="form.blockCancelIfLive" />
        </UFormField>
        <UFormField :label="t('settings.auto_settle')">
          <USwitch v-model="form.autoSettle" />
        </UFormField>
      </div>

      <div class="flex justify-end mt-6">
        <UButton color="primary" :loading="saving" @click="handleSave">{{ t('common.save') }}</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)

const form = reactive({
  liveDurationMinutes: 120,
  deleteAfterMinutes: 30,
  blockCancelIfLive: true,
  autoSettle: true
})

const { data: settings } = await useAsyncData('live-settings', () => $fetch<Record<string, any>>('/api/settings'))

watch(settings, (val) => {
  if (!val) return
  const ts = val.time_settings ?? {}
  const ft = val.features ?? {}
  form.liveDurationMinutes = ts.liveDurationMinutes ?? 120
  form.deleteAfterMinutes = ts.deleteAfterMinutes ?? 30
  form.blockCancelIfLive = ft.blockCancelIfLive ?? true
  form.autoSettle = ft.autoSettle ?? true
}, { immediate: true })

async function handleSave() {
  saving.value = true
  try {
    await Promise.all([
      $fetch('/api/settings/GLOBAL/system/time_settings', {
        method: 'PUT',
        body: { value: { liveDurationMinutes: form.liveDurationMinutes, deleteAfterMinutes: form.deleteAfterMinutes } }
      }),
      $fetch('/api/settings/GLOBAL/system/features', {
        method: 'PUT',
        body: { value: { blockCancelIfLive: form.blockCancelIfLive, autoSettle: form.autoSettle } }
      })
    ])
    toast.add({ title: t('common.saved'), color: 'success' })
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  } finally { saving.value = false }
}
</script>
