<template>
  <div class="space-y-8 max-w-2xl">
    <h1 class="text-2xl font-bold">{{ t('settings.settings') }}</h1>

    <!-- Appearance -->
    <section>
      <h2 class="text-sm font-semibold uppercase text-muted mb-3">{{ t('settings.theme_mode') }}</h2>
      <UCard>
        <div class="space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">{{ t('settings.dark_mode') }}</p>
              <p class="text-xs text-muted">{{ t('settings.dark_mode_description') }}</p>
            </div>
            <USwitch :model-value="colorMode.preference === 'dark'" @update:model-value="toggleTheme" />
          </div>

          <USeparator />

          <div>
            <p class="text-sm font-medium mb-3">{{ t('settings.accent_color') }}</p>
            <div class="flex gap-4">
              <button
                v-for="color in colorOptions"
                :key="color.value"
                class="flex flex-col items-center gap-1.5 group"
                @click="auth.setAccentColor(color.value)"
              >
                <div
                  class="w-9 h-9 rounded-full border-2 transition group-hover:scale-110"
                  :class="auth.accentColor === color.value ? 'border-foreground ring-2 ring-offset-2 ring-current' : 'border-transparent'"
                  :style="{ backgroundColor: color.hex }"
                />
                <span class="text-[10px] text-muted">{{ color.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Language -->
    <section>
      <h2 class="text-sm font-semibold uppercase text-muted mb-3">{{ t('settings.language') }}</h2>
      <UCard>
        <USelectMenu :model-value="locale" :items="languageOptions" value-key="value" class="w-full" @update:model-value="switchLocale" />
      </UCard>
    </section>

    <!-- Account -->
    <section>
      <h2 class="text-sm font-semibold uppercase text-muted mb-3">{{ t('settings.account') }}</h2>
      <UCard>
        <div class="space-y-3">
          <NuxtLink :to="localePath('/panel/change-password')" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-key" class="w-5 h-5 text-muted" />
              <span class="text-sm">{{ t('dashboard.change_password') }}</span>
            </div>
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-muted" />
          </NuxtLink>
        </div>
      </UCard>
    </section>
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
}
</script>
