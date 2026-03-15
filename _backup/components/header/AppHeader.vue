<template>
  <header class="sportsbook-header sticky top-0 z-40">
    <div class="relative flex items-center justify-between px-3 py-3 lg:px-4">
      <!-- Left: Hamburger + Logo (desktop) -->
      <div class="flex items-center gap-2">
        <button
          class="lg:hidden flex items-center justify-center w-9 h-9 text-white/80 hover:text-white"
          @click="$emit('toggle-sidebar')"
        >
          <UIcon name="i-lucide-menu" class="w-5 h-5" />
        </button>
        <SharedLogo :light="true" class="hidden lg:flex" />
      </div>

      <!-- Center: Logo (mobile) -->
      <div class="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <SharedLogo :light="true" :width="120" :height="30" />
      </div>

      <!-- Right: Notification + Coupon List + Profile -->
      <div class="flex items-center gap-2">
        <!-- Notification Dropdown (desktop only) -->
        <HeaderNotificationDropdown class="hidden lg:block" />

        <!-- Coupon List (desktop) -->
        <NuxtLink
          :to="localePath('/panel/coupon-list')"
          class="hidden sm:flex items-center justify-center h-9 px-3 text-sm font-bold rounded bg-amber-400 text-gray-900 hover:bg-amber-300 transition"
        >
          {{ $t('sportsbook.coupon_list') }}
        </NuxtLink>

        <!-- Profile Button -->
        <button
          class="flex items-center gap-2 h-9 px-2 rounded bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition cursor-pointer"
          @click="handleProfileClick"
        >
          <CommonUserAvatar :username="user.username" :avatar-id="auth.currentAvatarId" size="xs" />
          <span class="hidden sm:inline">{{ user.username }}</span>
          <UIcon name="i-lucide-chevron-down" class="w-4 h-4 hidden lg:block" />
        </button>

        <!-- Desktop Dropdown -->
        <div
          v-show="isDropdownOpen"
          ref="dropdownRef"
          class="absolute top-[calc(100%+8px)] right-3 w-[340px] z-50 hidden lg:block"
        >
          <div class="relative bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <div class="absolute -top-2 right-4 w-4 h-4 bg-gray-100 dark:bg-gray-800 rotate-45" />
            <div class="relative bg-white dark:bg-gray-900 rounded-lg p-4">
              <div class="absolute -top-2 right-[14px] w-4 h-4 bg-white dark:bg-gray-900 rotate-45" />
              <HeaderUserMenuContent
                :open-bet-count="openBetCount"
                :unread-messages="unreadMessages"
                @close="isDropdownOpen = false"
                @open-avatar-picker="handleOpenAvatarPicker"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slot for sub-bars (HeaderMenu, HeaderContextBar) -->
    <slot />

    <!-- Mobile Drawer -->
    <UDrawer v-model:open="isDrawerOpen" direction="bottom" :handle="false">
      <template #content>
        <div class="drawer-content">
          <!-- Handle -->
          <div class="drawer-handle-area">
            <div class="drawer-handle" />
          </div>
          <HeaderUserMenuContent
            ref="menuContentRef"
            mode="drawer"
            :open-bet-count="openBetCount"
            :unread-messages="unreadMessages"
            @close="closeDrawer"
            @open-avatar-picker="handleOpenAvatarPicker"
          />
        </div>
      </template>
    </UDrawer>

    <!-- Avatar Picker Modal (lives here so it survives drawer/dropdown close) -->
    <UModal v-model:open="avatarPickerOpen">
      <template #content>
        <div class="avatar-picker">
          <div class="avatar-picker__header">
            <span class="avatar-picker__title">{{ $t('common.select_avatar') || 'Select Avatar' }}</span>
            <button class="avatar-picker__close" @click="auth.closeAvatarPicker()">
              <UIcon name="i-lucide-x" class="w-5 h-5" />
            </button>
          </div>
          <div class="avatar-picker__body">
            <div class="avatar-picker__grid">
              <button
                v-for="id in 60"
                :key="id"
                class="avatar-picker__option"
                :class="{ 'avatar-picker__option--selected': selectedAvatar === id }"
                @click="selectedAvatar = id"
              >
                <img :src="`/avatars/${id}.png`" :alt="`Avatar ${id}`" class="avatar-picker__option-img" />
              </button>
            </div>
          </div>
          <div class="avatar-picker__footer">
            <UButton variant="outline" @click="auth.closeAvatarPicker()">{{ $t('common.cancel') }}</UButton>
            <UButton @click="auth.confirmAvatarPicker()">{{ $t('common.save') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </header>
</template>

<script setup lang="ts">
interface Props {
  unreadMessages?: number
  openBetCount?: number
}

withDefaults(defineProps<Props>(), {
  unreadMessages: 3,
  openBetCount: 2
})

defineEmits<{
  'toggle-sidebar': []
}>()

const auth = useAuthStore()
const { avatarPickerOpen, selectedAvatar } = storeToRefs(auth)
const user = computed(() => auth.user || { username: '' })
const localePath = useLocalePath()

const isDropdownOpen = ref(false)
const isDrawerOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const menuContentRef = ref<{ reset: () => void } | null>(null)
const isMobile = ref(false)

function handleProfileClick() {
  if (isMobile.value) {
    isDrawerOpen.value = true
  } else {
    isDropdownOpen.value = !isDropdownOpen.value
  }
}

function closeDrawer() {
  isDrawerOpen.value = false
  menuContentRef.value?.reset()
}

function handleOpenAvatarPicker() {
  isDropdownOpen.value = false
  isDrawerOpen.value = false
  auth.openAvatarPicker()
}

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)

  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!dropdownRef.value) return
    // Ignore clicks inside the dropdown
    if (dropdownRef.value.contains(target)) return
    // Ignore clicks on Nuxt UI portaled popover content (USelect listbox etc.)
    if (target.closest('[role="listbox"]') || target.closest('[data-radix-popper-content-wrapper]') || target.closest('[vaul-drawer-wrapper]')) return
    isDropdownOpen.value = false
  }
  document.addEventListener('mousedown', handler)

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
    document.removeEventListener('mousedown', handler)
  })
})
</script>

<style scoped>
.drawer-content {
  height: 85vh;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}
:root.dark .drawer-content {
  background: #1e1e1f;
}
.drawer-handle-area {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  flex-shrink: 0;
}
.drawer-handle {
  width: 40px;
  height: 4px;
  border-radius: 9999px;
  background: #d1d5db;
}
:root.dark .drawer-handle {
  background: #414141;
}
</style>
