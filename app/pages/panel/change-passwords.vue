<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('password.change_passwords') }}</h1>

    <UCard class="max-w-2xl">
      <div class="space-y-6">
        <UFormField :label="t('password.select_user')" name="selectedUser" required :error="visibleErrors.selectedUser">
          <USelectMenu v-model="form.selectedUserId" :items="userOptions" value-key="value" :placeholder="t('password.select_user')" class="w-full" @update:model-value="touch('selectedUser')" />
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
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] })

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)

const form = reactive({ selectedUserId: null as number | null, newPassword: '', confirmPassword: '' })

// Fetch users from API (descendants only)
const { data: usersData } = await useAsyncData('password-users', () =>
  $fetch<{ data: any[] }>('/api/users', { query: { limit: 200 } })
)

const userOptions = computed(() =>
  (usersData.value?.data ?? []).map((u: any) => ({ label: `${u.username} (${u.role})`, value: u.id }))
)

const { visibleErrors, touch, submit: validateForm } = useFormValidation(() => ({
  selectedUser: !form.selectedUserId ? t('validation.required') : undefined,
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
    await $fetch(`/api/users/${form.selectedUserId}`, {
      method: 'PATCH',
      body: { password: form.newPassword }
    })
    toast.add({ title: t('password.success'), color: 'success' })
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  } finally { saving.value = false }
}
</script>
