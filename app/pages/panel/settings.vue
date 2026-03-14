<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('settings.settings') }}</h1>

    <UCard class="max-w-2xl">
      <UForm :state="formState" @submit="handleSave">
        <div class="space-y-6">
          <!-- Theme Mode -->
          <UFormField :label="t('settings.theme_mode')" name="themeMode">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted">{{ t('settings.dark_mode') }}</span>
              <USwitch v-model="formState.darkMode" />
            </div>
          </UFormField>

          <USeparator />

          <!-- Accent Color -->
          <UFormField :label="t('settings.accent_color')" name="accentColor">
            <USelectMenu
              v-model="formState.accentColor"
              :items="colorOptions"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <USeparator />

          <!-- Language -->
          <UFormField :label="t('settings.language')" name="language">
            <USelectMenu
              v-model="formState.language"
              :items="languageOptions"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end pt-4">
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
  darkMode: false,
  accentColor: 'green',
  language: 'tr'
})

const colorOptions = [
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
  { label: 'Red', value: 'red' },
  { label: 'Orange', value: 'orange' },
  { label: 'Purple', value: 'purple' },
  { label: 'Indigo', value: 'indigo' }
]

const languageOptions = [
  { label: 'Turkce', value: 'tr' },
  { label: 'English', value: 'en' }
]

function handleSave() {
  // Save logic
}
</script>
