<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('password.change_passwords') }}</h1>

    <UCard class="max-w-2xl">
      <UForm :state="formState" @submit="handleSave">
        <div class="space-y-6">
          <UFormField :label="t('password.select_user')" name="selectedUser" required>
            <USelectMenu
              v-model="formState.selectedUser"
              :items="userOptions"
              value-key="value"
              :placeholder="t('password.select_user')"
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
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const { users, dealers, subDealers } = useMockData()

const formState = reactive({
  selectedUser: '',
  newPassword: '',
  confirmPassword: ''
})

const userOptions = computed(() => {
  const allUsers = [
    ...users.map(u => ({ label: `${u.username} (${u.role})`, value: u.username })),
    ...dealers.map(d => ({ label: `${d.username} (dealer)`, value: d.username })),
    ...subDealers.map(sd => ({ label: `${sd.username} (sub-dealer)`, value: sd.username }))
  ]
  const seen = new Set<string>()
  return allUsers.filter((u) => {
    if (seen.has(u.value)) return false
    seen.add(u.value)
    return true
  })
})

function handleSave() {
  // Save logic
}
</script>
