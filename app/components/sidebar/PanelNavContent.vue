<template>
  <div class="flex flex-col h-full">
    <!-- User Info -->
    <div class="shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <CommonUserAvatar
          :username="user?.username || ''"
          :avatar-id="auth.currentAvatarId"
          size="lg"
          :editable="true"
          @picker-open="auth.openAvatarPicker()"
        />
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-green-500 shrink-0" />
            <span class="font-semibold text-sm truncate">{{ user?.username }}</span>
          </div>
          <button
            class="flex items-center gap-1 text-xs text-muted hover:text-foreground transition"
            @click="copyUserId"
          >
            <span>ID: {{ user?.id }}</span>
            <UIcon name="i-lucide-copy" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto custom-scrollbar py-2">
      <!-- Dashboard link -->
      <NuxtLink
        :to="localePath('/panel')"
        class="nav-link"
        active-class="nav-link--active"
        @click="$emit('navigate')"
      >
        <UIcon name="i-lucide-layout-dashboard" class="nav-icon" />
        <span>{{ $t('dashboard.dashboard') }}</span>
      </NuxtLink>

      <!-- Nav groups -->
      <div v-for="group in navGroups" :key="group.label" class="mt-3">
        <div class="group-label">{{ $t(group.label) }}</div>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="nav-link--active"
          @click="$emit('navigate')"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="truncate">{{ $t(item.label) }}</span>
          <UBadge v-if="item.badge" color="primary" variant="solid" size="xs" class="ml-auto">
            {{ item.badge }}
          </UBadge>
        </NuxtLink>
      </div>
    </nav>

    <!-- Footer -->
    <div class="shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted">{{ currentDate }}</span>
        <button
          class="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          :title="$t('common.logout')"
          @click="handleLogout"
        >
          <UIcon name="i-lucide-log-out" class="w-4 h-4 text-muted" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  navigate: []
}>()

const auth = useAuthStore()
const { navGroups, currentDate } = usePanelNav()
const localePath = useLocalePath()
const toast = useToast()

const user = computed(() => auth.user)

function copyUserId() {
  if (!user.value?.id) return
  navigator.clipboard.writeText(String(user.value.id))
  toast.add({ title: 'ID copied', color: 'success' })
}

async function handleLogout() {
  await auth.logout()
  navigateTo(localePath('/sign-in'))
}
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  font-size: 13px;
  color: var(--ui-text-muted);
  text-decoration: none;
  transition: all 0.15s;
}
.nav-link:hover {
  background: var(--ui-bg-elevated);
  color: var(--ui-text);
}
.nav-link--active {
  color: var(--ui-primary);
  font-weight: 500;
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.nav-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  opacity: 0.6;
}
.nav-link--active .nav-icon {
  opacity: 1;
}

.group-label {
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ui-text-dimmed);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
