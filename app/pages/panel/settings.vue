<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('settings.settings') }}</h1>

    <UCard class="max-w-2xl">
      <div class="space-y-6">
        <!-- Theme Mode -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">{{ t('settings.dark_mode') }}</p>
            <p class="text-xs text-muted">{{ t('settings.dark_mode_description') }}</p>
          </div>
          <USwitch :model-value="colorMode.preference === 'dark'" @update:model-value="toggleTheme" />
        </div>

        <USeparator />

        <!-- Accent Color -->
        <UFormField :label="t('settings.accent_color')">
          <div class="flex gap-3">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              class="w-8 h-8 rounded-full border-2 transition"
              :class="auth.accentColor === color.value ? 'border-foreground scale-110' : 'border-transparent'"
              :style="{ backgroundColor: color.hex }"
              @click="auth.setAccentColor(color.value)"
            />
          </div>
        </UFormField>

        <USeparator />

        <!-- Language -->
        <UFormField :label="t('settings.language')">
          <USelectMenu :model-value="locale" :items="languageOptions" value-key="value" class="w-full" @update:model-value="switchLocale" />
        </UFormField>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t, locale, setLocale } = useI18n()
const colorMode = useColorMode()
const auth = useAuthStore()
const localePath = useLocalePath()

const colorOptions = [
  { label: 'Green', value: 'green' as const, hex: '#22c55e' },
  { label: 'Purple', value: 'purple' as const, hex: '#a855f7' },
  { label: 'Orange', value: 'orange' as const, hex: '#f97316' },
  { label: 'Red', value: 'red' as const, hex: '#ef4444' }
]

const languageOptions = [
  { label: 'Türkçe', value: 'tr' },
  { label: 'English', value: 'en' }
]

function toggleTheme(dark: boolean) {
  colorMode.preference = dark ? 'dark' : 'light'
  auth.savePreferences({ theme: dark ? 'dark' : 'light' })
}

function switchLocale(newLocale: string) {
  setLocale(newLocale)
  navigateTo(localePath('/panel/settings'))
}
</script>
