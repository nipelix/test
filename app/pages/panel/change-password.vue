<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.change_password') }}</h1>

    <UCard class="max-w-2xl">
      <div class="space-y-6">
        <UFormField :label="t('password.old_password')" name="oldPassword" required :error="visibleErrors.oldPassword">
          <UInput v-model="form.oldPassword" type="password" :placeholder="t('password.old_password')" class="w-full" @blur="touch('oldPassword')" />
        </UFormField>

        <UFormField :label="t('password.new_password')" name="newPassword" required :error="visibleErrors.newPassword">
          <UInput v-model="form.newPassword" type="password" :placeholder="t('password.new_password')" class="w-full" @blur="touch('newPassword')" />
        </UFormField>

        <UFormField :label="t('password.confirm_password')" name="confirmPassword" required :error="visibleErrors.confirmPassword">
          <UInput v-model="form.confirmPassword" type="password" :placeholder="t('password.confirm_password')" class="w-full" @blur="touch('confirmPassword')" />
        </UFormField>

        <div class="flex justify-end">
          <UButton color="primary" :loading="saving" @click="handleSave">{{ t('common.save') }}</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)

const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const { visibleErrors, touch, submit: validateForm } = useFormValidation(() => ({
  oldPassword: !form.oldPassword ? t('validation.required') : undefined,
  newPassword: !form.newPassword ? t('validation.required')
    : form.newPassword.length < 4 ? t('validation.min_length', { min: 4 })
    : undefined,
  confirmPassword: !form.confirmPassword ? t('validation.required')
    : form.newPassword !== form.confirmPassword ? t('modals.error_passwords_mismatch')
    : undefined
}))

async function handleSave() {
  if (!validateForm()) return
  saving.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: { oldPassword: form.oldPassword, newPassword: form.newPassword }
    })
    toast.add({ title: t('password.success'), color: 'success' })
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? t('password.failed'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
