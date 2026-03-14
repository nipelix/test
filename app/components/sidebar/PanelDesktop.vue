<template>
  <aside class="hidden lg:flex fixed top-[3.75rem] left-0 z-30 h-[calc(100vh-3.75rem)] w-60 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
    <!-- User Info (fixed top) -->
    <div class="shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <CommonUserAvatar :username="currentUser.username" :avatar-id="auth.currentAvatarId" size="lg" :editable="true" @picker-open="auth.openAvatarPicker()" />
        <div class="min-w-0">
          <div class="flex items-center gap-1">
            <img src="/icons/check-circle.svg" alt="" class="panel-icon-sm panel-icon-green" />
            <span class="font-semibold text-sm truncate">{{ currentUser.username }}</span>
          </div>
          <div class="flex items-center gap-1 text-xs text-muted">
            <span>ID: {{ currentUser.id }}</span>
            <img src="/icons/clipboard.svg" alt="" class="panel-icon-xs cursor-pointer" />
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation (scrollable middle) -->
    <nav class="flex-1 overflow-y-auto custom-scrollbar py-2">
      <NuxtLink
        :to="localePath('/panel')"
        class="panel-nav-link"
        active-class="panel-nav-link--active"
      >
        <img src="/icons/grid.svg" alt="" class="panel-nav-icon" />
        <span>{{ $t('dashboard.dashboard') }}</span>
      </NuxtLink>

      <div v-for="group in navGroups" :key="group.label" class="mt-2">
        <div class="panel-nav-group-label">{{ $t(group.label) }}</div>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="panel-nav-link"
          active-class="panel-nav-link--active"
        >
          <img :src="item.icon" :alt="$t(item.label)" class="panel-nav-icon" />
          <span class="truncate">{{ $t(item.label) }}</span>
          <UBadge v-if="item.badge" color="primary" variant="solid" size="xs" class="ml-auto">{{ item.badge }}</UBadge>
        </NuxtLink>
      </div>
    </nav>

    <!-- Footer (fixed bottom) -->
    <div class="shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
      <div class="flex items-center justify-between">
        <div class="text-xs text-muted">{{ currentDate }}</div>
        <button class="panel-logout-btn" :title="$t('common.logout')">
          <img src="/icons/logout.svg" alt="" class="panel-icon-sm" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { navGroups, currentDate, localePath } = usePanelNav()
const { currentUser } = useMockData()
const auth = useAuthStore()
</script>

<style scoped>
.panel-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-gray-600, #4b5563);
  text-decoration: none;
  transition: background 0.16s;
}
:root.dark .panel-nav-link {
  color: var(--color-gray-400, #9ca3af);
}
.panel-nav-link:hover {
  background: var(--color-gray-100, #f3f4f6);
}
:root.dark .panel-nav-link:hover {
  background: var(--color-gray-800, #1f2937);
}
.panel-nav-link--active {
  color: var(--accent-500);
  font-weight: 500;
  background: rgba(4, 4, 5, 0.04);
}
:root.dark .panel-nav-link--active {
  color: var(--accent-500);
  background: rgba(4, 4, 5, 0.15);
}

/* Icon styles */
.panel-nav-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  opacity: 0.5;
}
:root.dark .panel-nav-icon {
  filter: brightness(0) invert(0.5);
}
.panel-nav-link--active .panel-nav-icon {
  opacity: 1;
}
:root.dark .panel-nav-link--active .panel-nav-icon {
  filter: brightness(0) invert(0.75);
}

.panel-icon-sm {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}
:root.dark .panel-icon-sm {
  filter: brightness(0) invert(0.5);
}
.panel-icon-green {
  opacity: 1;
  filter: none;
}
:root.dark .panel-icon-green {
  filter: hue-rotate(0deg) brightness(1);
}
.panel-icon-xs {
  width: 12px;
  height: 12px;
  opacity: 0.4;
}
:root.dark .panel-icon-xs {
  filter: brightness(0) invert(0.4);
}

.panel-nav-group-label {
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-gray-400, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
:root.dark .panel-nav-group-label {
  color: var(--color-gray-500, #6b7280);
}

.panel-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.16s;
}
.panel-logout-btn:hover {
  background: var(--color-gray-100, #f3f4f6);
}
:root.dark .panel-logout-btn:hover {
  background: var(--color-gray-800, #1f2937);
}
</style>
