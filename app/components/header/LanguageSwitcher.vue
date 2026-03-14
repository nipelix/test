<template>
  <div class="lang-switcher" @mousedown.stop>
    <USelectMenu
      :model-value="locale"
      :items="langItems"
      value-key="value"
      size="sm"
      icon="i-lucide-globe"
      :search-input="false"
      :ui="{ root: 'lang-root', trigger: 'lang-trigger' }"
      @update:model-value="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const langItems = computed(() =>
  (locales.value as Array<{ code: string; name?: string }>).map(loc => ({
    label: loc.name || loc.code.toUpperCase(),
    value: loc.code
  }))
)

function onSelect(val: any) {
  const code = typeof val === 'string' ? val : val?.value
  if (code && code !== locale.value) {
    setLocale(code)
  }
}
</script>

<style>
.lang-switcher {
  width: 100%;
  display: flex;
  justify-content: center;
}
.lang-root {
  width: 100% !important;
}
.lang-trigger {
  width: 100% !important;
  cursor: pointer !important;
}
.lang-switcher button,
.lang-switcher [role="combobox"],
.lang-switcher input,
.lang-switcher span {
  cursor: pointer !important;
}
[role="listbox"] [role="option"],
[role="listbox"] [role="option"] * {
  cursor: pointer !important;
}
</style>
