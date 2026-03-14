<template>
  <div class="league-header">
    <div class="league-header__info">
      <span class="league-header__flag">{{ countryFlag }}</span>
      <span class="league-header__country">{{ countryName }}</span>
      <span class="league-header__separator">/</span>
      <span class="league-header__name">{{ leagueName }}</span>
    </div>
    <div class="league-header__right">
      <span class="league-header__count">{{ matchCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  countryFlag: string
  countryName: string
  leagueName: string
  matchCount: number
}>()
</script>

<style scoped>
.league-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-gray-50, #f9fafb);
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
}
:root.dark .league-header {
  background: var(--color-gray-900, #111827);
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.league-header__info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.league-header__flag {
  font-size: 14px;
  flex-shrink: 0;
}

.league-header__country {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-gray-600, #4b5563);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
:root.dark .league-header__country {
  color: var(--color-gray-300, #d1d5db);
}

.league-header__separator {
  font-size: 11px;
  color: var(--color-gray-300, #d1d5db);
}
:root.dark .league-header__separator {
  color: var(--color-gray-600, #4b5563);
}

.league-header__name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-gray-500, #6b7280);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:root.dark .league-header__name {
  color: var(--color-gray-400, #9ca3af);
}

.league-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.league-header__count {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  background: var(--color-gray-100, #f3f4f6);
  padding: 1px 8px;
  border-radius: 10px;
}
:root.dark .league-header__count {
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-500, #6b7280);
}
</style>
