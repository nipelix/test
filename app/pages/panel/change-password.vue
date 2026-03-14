<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.change_password') }}</h1>

    <UCard class="max-w-2xl">
      <UForm :state="formState" @submit="handleSave">
        <div class="space-y-6">
          <UFormField :label="t('password.old_password')" name="oldPassword" required>
            <UInput
              v-model="formState.oldPassword"
              type="password"
              :placeholder="t('password.old_password')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('password.new_password')" name="newPassword" required>
            <UInput
              v-model="formState.newPassword"
              type="password"
              :placeholder="t('password.new_password')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('password.confirm_password')" name="confirmPassword" required>
            <UInput
              v-model="formState.confirmPassword"
              type="password"
              :placeholder="t('password.confirm_password')"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit" color="primary">
              {{ t('common.save') }}
            </UButton>
          </div>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()

const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function handleSave() {
  // Save logic
}
</script>
