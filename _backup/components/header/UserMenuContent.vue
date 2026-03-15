<template>
  <div class="user-menu-root" :class="{ 'is-drawer': mode === 'drawer' }">
    <!-- Header (drawer mode only) -->
    <div v-if="mode === 'drawer'" class="sheet-header">
      <button
        class="sheet-back"
        :class="{ visible: currentPage !== 'menu' }"
        @click="goBack"
      >
        <UIcon name="i-lucide-chevron-left" class="w-5 h-5" />
        {{ t('common.back') }}
      </button>
      <span class="sheet-title">{{ pageTitle }}</span>
      <button class="sheet-close" @click="$emit('close')">
        <UIcon name="i-lucide-x" class="w-[18px] h-[18px] text-gray-400" />
      </button>
    </div>

    <!-- ===================== DROPDOWN MODE ===================== -->
    <div v-if="mode === 'dropdown'">
      <!-- Balance Section -->
      <div class="dd-balance-section">
        <div class="dd-balance-row">
          <span class="dd-balance-label">
            <CommonUserAvatar :username="user.username" :avatar-id="auth.currentAvatarId" size="md" :editable="true" @picker-open="$emit('open-avatar-picker')" />
            <span>{{ user.username }}</span>
          </span>
          <span class="dd-balance-amount">
            {{ formatBalance(user.balance) }} {{ user.balanceType === 'money' ? '₺' : t('common.credit') }}
          </span>
        </div>
        <NuxtLink :to="localePath('/panel')" class="dd-control-panel" @click="$emit('close')">
          <UIcon name="i-lucide-settings" class="w-5 h-5" />
          <span>{{ t('dashboard.dashboard') }}</span>
        </NuxtLink>
      </div>

      <!-- Menu -->
      <div class="dd-menu">
        <NuxtLink :to="localePath('/panel/messages')" class="dd-menu-item" @click="$emit('close')">
          <UIcon name="i-lucide-message-square" class="w-5 h-5" />
          <span class="dd-menu-item-label">{{ t('common.inbox') }}</span>
          <span v-if="unreadMessages > 0" class="dd-badge">{{ unreadMessages }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/panel/coupon-list')" class="dd-menu-item" @click="$emit('close')">
          <UIcon name="i-lucide-list-checks" class="w-5 h-5" />
          <span class="dd-menu-item-label">{{ t('sportsbook.coupon_list') }}</span>
          <span v-if="openBetCount > 0" class="dd-badge dd-badge-orange">{{ openBetCount }}</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/panel/change-password')" class="dd-menu-item" @click="$emit('close')">
          <UIcon name="i-lucide-lock" class="w-5 h-5" />
          <span class="dd-menu-item-label">{{ t('common.change_password') }}</span>
        </NuxtLink>
        <button class="dd-menu-item" @click="handleRegisterPasskey">
          <UIcon name="i-lucide-fingerprint" class="w-5 h-5" />
          <span class="dd-menu-item-label">{{ t('auth.passkey_register') }}</span>
        </button>
      </div>

      <!-- Theme + Language -->
      <div class="dd-theme-section">
        <div class="dd-theme-controls">
          <HeaderThemeToggle />
          <CommonAccentColorSwitcher />
        </div>
        <div class="dd-lang-row" @mousedown.stop>
          <HeaderLanguageSwitcher />
        </div>
      </div>

      <!-- Logout -->
      <div class="dd-logout-menu">
        <button class="dd-menu-item dd-logout-item" @click="handleLogout">
          <UIcon name="i-lucide-log-out" class="w-5 h-5" />
          <span class="dd-menu-item-label">{{ t('common.logout') }}</span>
        </button>
      </div>
    </div>

    <!-- ===================== DRAWER MODE ===================== -->
    <div v-if="mode === 'drawer'" class="pages-container">
      <!-- Page 1: Menu -->
      <div
        class="page"
        :class="{
          active: currentPage === 'menu',
          prev: currentPage !== 'menu'
        }"
      >
        <div class="sidebar-content">
          <!-- Profile Header -->
          <div class="drawer-profile-header">
            <CommonUserAvatar :username="user.username" :avatar-id="auth.currentAvatarId" size="lg" :editable="true" class="shrink-0" @picker-open="$emit('open-avatar-picker')" />
            <div class="flex-1 min-w-0">
              <div class="text-lg font-bold text-gray-900 dark:text-gray-100">@{{ user.username }}</div>
              <div class="flex items-center gap-1 mt-1">
                <UIcon name="i-lucide-credit-card" class="w-[18px] h-[18px] text-primary" />
                <span class="text-base font-bold text-primary">
                  {{ formatBalance(user.balance) }} {{ user.balanceType === 'money' ? '₺' : t('common.credit') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Action: Dashboard -->
          <NuxtLink
            :to="localePath('/panel')"
            class="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4 no-underline hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="$emit('close')"
          >
            <UIcon name="i-lucide-settings" class="w-5 h-5 text-primary" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ t('dashboard.dashboard') }}</span>
          </NuxtLink>

          <!-- My Account Section -->
          <div class="mb-4">
            <div class="menu-section-title">{{ t('common.my_account') }}</div>
            <NuxtLink :to="localePath('/panel/coupon-list')" class="menu-item" @click="$emit('close')">
              <UIcon name="i-lucide-list-checks" class="w-5 h-5 text-gray-400 shrink-0" />
              <span class="menu-item-label">{{ t('sportsbook.coupon_list') }}</span>
              <span v-if="openBetCount > 0" class="badge badge-orange">{{ openBetCount }}</span>
            </NuxtLink>
            <NuxtLink :to="localePath('/panel/change-password')" class="menu-item" @click="$emit('close')">
              <UIcon name="i-lucide-key-round" class="w-5 h-5 text-gray-400 shrink-0" />
              <span class="menu-item-label">{{ t('common.change_password') }}</span>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </NuxtLink>
            <button class="menu-item" @click="handleRegisterPasskey">
              <UIcon name="i-lucide-fingerprint" class="w-5 h-5 text-gray-400 shrink-0" />
              <span class="menu-item-label">{{ t('auth.passkey_register') }}</span>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </button>
          </div>

          <!-- Notifications Section -->
          <div class="mb-4">
            <div class="menu-section-title">{{ t('common.notifications') }}</div>
            <button class="menu-item" @click="handleNotificationClick('system', t('common.system_notifications'))">
              <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-gray-400 shrink-0" />
              <span class="menu-item-label">{{ t('common.system_notifications') }}</span>
              <span class="badge">0</span>
            </button>
            <button class="menu-item" @click="handleNotificationClick('messages', t('common.messages'))">
              <UIcon name="i-lucide-message-square" class="w-5 h-5 text-gray-400 shrink-0" />
              <span class="menu-item-label">{{ t('common.messages') }}</span>
              <span v-if="unreadMessages > 0" class="badge">{{ unreadMessages }}</span>
            </button>
            <button class="menu-item" @click="handleNotificationClick('bets', t('common.coupon_notifications'))">
              <UIcon name="i-lucide-ticket" class="w-5 h-5 text-gray-400 shrink-0" />
              <span class="menu-item-label">{{ t('common.coupon_notifications') }}</span>
              <span class="badge">5</span>
            </button>
          </div>

          <!-- Theme + Language -->
          <div class="drawer-theme-section">
            <div class="drawer-theme-controls">
              <HeaderThemeToggle />
              <CommonAccentColorSwitcher />
            </div>
            <div class="drawer-lang-row">
              <HeaderLanguageSwitcher />
            </div>
          </div>

          <!-- Logout -->
          <div class="drawer-logout-section">
            <button
              class="drawer-logout-btn"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="w-[18px] h-[18px]" />
              {{ t('common.logout') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Page 2: Notifications -->
      <div
        class="page"
        :class="{ active: currentPage === 'notifications' }"
      >
        <!-- Notification Tabs -->
        <div class="notification-tabs">
          <button
            class="notification-tab"
            :class="{ active: activeTab === 'system' }"
            @click="activeTab = 'system'"
          >
            <UIcon name="i-lucide-alert-circle" class="w-4 h-4" />
            {{ t('common.system') }}
            <span class="tab-badge">3</span>
          </button>
          <button
            class="notification-tab"
            :class="{ active: activeTab === 'messages' }"
            @click="activeTab = 'messages'"
          >
            <UIcon name="i-lucide-message-square" class="w-4 h-4" />
            {{ t('common.messages') }}
            <span class="tab-badge">4</span>
          </button>
          <button
            class="notification-tab"
            :class="{ active: activeTab === 'bets' }"
            @click="activeTab = 'bets'"
          >
            <UIcon name="i-lucide-list-checks" class="w-4 h-4" />
            {{ t('common.coupons') }}
            <span class="tab-badge">5</span>
          </button>
        </div>

        <!-- System Notifications Content -->
        <div class="notification-content" :class="{ active: activeTab === 'system' }">
          <div class="notification-item unread">
            <div class="notification-icon system">
              <UIcon name="i-lucide-shield" class="w-5 h-5" />
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ t('common.security_alert') }}</div>
              <p class="notification-text">{{ t('common.new_device_login') }}</p>
              <div class="notification-meta">
                <span class="notification-time">5 {{ t('common.minutes_ago') }}</span>
              </div>
            </div>
          </div>
          <div class="notification-item">
            <div class="notification-icon system">
              <UIcon name="i-lucide-shield-check" class="w-5 h-5" />
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ t('common.maintenance') }}</div>
              <p class="notification-text">{{ t('common.maintenance_text') }}</p>
              <div class="notification-meta">
                <span class="notification-time">1 {{ t('common.hours_ago') }}</span>
              </div>
            </div>
          </div>
          <button class="view-all" @click="$emit('close')">
            {{ t('common.view_all') }}
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          </button>
        </div>

        <!-- Messages Content -->
        <div class="notification-content" :class="{ active: activeTab === 'messages' }">
          <div class="notification-item unread">
            <CommonUserAvatar username="Admin" :avatar-id="5" size="md" class="shrink-0" />
            <div class="notification-body">
              <div class="notification-title">Admin</div>
              <p class="notification-text">{{ t('common.new_message_preview') }}</p>
              <div class="notification-meta">
                <span class="notification-time">10 {{ t('common.minutes_ago') }}</span>
              </div>
            </div>
          </div>
          <div class="notification-item">
            <CommonUserAvatar username="Support" :avatar-id="12" size="md" class="shrink-0" />
            <div class="notification-body">
              <div class="notification-title">Support</div>
              <p class="notification-text">{{ t('common.support_message_preview') }}</p>
              <div class="notification-meta">
                <span class="notification-time">2 {{ t('common.hours_ago') }}</span>
              </div>
            </div>
          </div>
          <NuxtLink :to="localePath('/panel/messages')" class="view-all" @click="$emit('close')">
            {{ t('common.view_all') }}
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Bets/Coupons Content -->
        <div class="notification-content" :class="{ active: activeTab === 'bets' }">
          <div class="notification-item unread">
            <div class="notification-icon won">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5" />
            </div>
            <div class="notification-body">
              <div class="notification-title">
                {{ t('common.coupon') }} #48291
                <span class="status-badge won">{{ t('common.won') }}</span>
              </div>
              <p class="notification-text">GS vs FB, Barcelona vs Real...</p>
              <div class="notification-meta">
                <span class="notification-time">30 {{ t('common.minutes_ago') }}</span>
                <span class="notification-amount positive">+₺1.250,00</span>
              </div>
            </div>
          </div>
          <div class="notification-item">
            <div class="notification-icon lost">
              <UIcon name="i-lucide-x-circle" class="w-5 h-5" />
            </div>
            <div class="notification-body">
              <div class="notification-title">
                {{ t('common.coupon') }} #48285
                <span class="status-badge lost">{{ t('common.lost') }}</span>
              </div>
              <p class="notification-text">Liverpool vs Man City...</p>
              <div class="notification-meta">
                <span class="notification-time">2 {{ t('common.hours_ago') }}</span>
                <span class="notification-amount negative">-₺100,00</span>
              </div>
            </div>
          </div>
          <div class="notification-item">
            <div class="notification-icon pending">
              <UIcon name="i-lucide-clock" class="w-5 h-5" />
            </div>
            <div class="notification-body">
              <div class="notification-title">
                {{ t('common.coupon') }} #48299
                <span class="status-badge pending">{{ t('common.pending') }}</span>
              </div>
              <p class="notification-text">Fenerbahçe vs Beşiktaş...</p>
              <div class="notification-meta">
                <span class="notification-time">15 {{ t('common.minutes_ago') }}</span>
                <span class="notification-amount">₺250,00</span>
              </div>
            </div>
          </div>
          <NuxtLink :to="localePath('/panel/coupon-list')" class="view-all" @click="$emit('close')">
            {{ t('common.all_coupons') }}
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { startRegistration } from '@simplewebauthn/browser'

type PageType = 'menu' | 'notifications'
type NotificationTab = 'system' | 'messages' | 'bets'

withDefaults(defineProps<{
  openBetCount?: number
  unreadMessages?: number
  mode?: 'dropdown' | 'drawer'
}>(), {
  openBetCount: 0,
  unreadMessages: 0,
  mode: 'dropdown'
})

defineEmits<{
  close: []
  'open-avatar-picker': []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const user = computed(() => auth.user || { username: '', balance: 0, balanceType: 'credit' })

const currentPage = ref<PageType>('menu')
const activeTab = ref<NotificationTab>('system')
const pageTitle = ref(t('common.my_account'))

function handleNotificationClick(tab: NotificationTab, title: string) {
  activeTab.value = tab
  currentPage.value = 'notifications'
  pageTitle.value = title
}

function goBack() {
  currentPage.value = 'menu'
  pageTitle.value = t('common.my_account')
}

async function handleLogout() {
  await auth.logout()
  router.push(localePath('/sign-in'))
}

function formatBalance(val: number) {
  return val?.toLocaleString('tr-TR') ?? '0'
}

// Passkey Registration
async function handleRegisterPasskey() {
  try {
    // 1. Get registration options
    const options = await $fetch<any>('/api/auth/passkey/register-options', { method: 'POST' })

    // 2. Browser prompt (Windows Hello / Touch ID / Face ID)
    const credential = await startRegistration({ optionsJSON: options })

    // 3. Send to server
    await $fetch('/api/auth/passkey/register-verify', {
      method: 'POST',
      body: { credential, name: navigator.userAgent.includes('Windows') ? 'Windows Hello' : navigator.userAgent.includes('Mac') ? 'Touch ID' : 'Passkey' }
    })

    toast.add({ title: t('auth.passkey_register_success'), color: 'success' })
  } catch (err: any) {
    if (err.name !== 'NotAllowedError') {
      console.error('Passkey registration failed:', err)
    }
  }
}

defineExpose({
  reset() {
    setTimeout(() => {
      currentPage.value = 'menu'
      pageTitle.value = t('common.my_account')
    }, 300)
  }
})
</script>

<style scoped>
.user-menu-root {
  display: flex;
  flex-direction: column;
}
.user-menu-root.is-drawer {
  height: 100%;
}

/* Header */
.sheet-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  background: var(--color-white, #fff);
  flex-shrink: 0;
}
:root.dark .sheet-header {
  background: #1e1e1f;
  border-bottom-color: #414141;
}

.sheet-back {
  display: none;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent-500);
  padding: 0;
  margin-right: 12px;
  cursor: pointer;
}
.sheet-back.visible {
  display: flex;
}
.sheet-back svg {
  width: 20px;
  height: 20px;
}

.sheet-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  text-align: center;
}
:root.dark .sheet-title {
  color: #fdfdfd;
}

.sheet-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.sheet-close svg {
  color: #868686;
}
.sheet-close:hover {
  background: var(--color-gray-100, #f3f4f6);
}
:root.dark .sheet-close:hover {
  background: #2e2e2e;
}

/* Pages Container */
.pages-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.page {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  visibility: hidden;
  background: white;
}
:root.dark .page {
  background: #1e1e1f;
}
.page.active {
  transform: translateX(0);
  visibility: visible;
}
.page.prev {
  transform: translateX(-100%);
  visibility: hidden;
}
.page::-webkit-scrollbar {
  width: 4px;
}
.page::-webkit-scrollbar-thumb {
  background: var(--color-gray-300, #d1d5db);
  border-radius: 2px;
}

.sidebar-content {
  padding: 16px;
}

.drawer-profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  margin-bottom: 16px;
}
:root.dark .drawer-profile-header {
  border-bottom-color: #414141;
}

/* Menu Section */
.menu-section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  padding-left: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  border: none;
  background: none;
  transition: background 0.15s;
}
.menu-item:active,
.menu-item:hover {
  background: var(--color-gray-50, #f9fafb);
}
:root.dark .menu-item:active,
:root.dark .menu-item:hover {
  background: var(--color-gray-800, #1f2937);
}

.menu-item-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-900, #111827);
}
:root.dark .menu-item-label {
  color: var(--color-gray-100, #f3f4f6);
}

.badge {
  background: var(--accent-500);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.badge-orange {
  background: var(--accent-600);
}

/* Notification Tabs */
.notification-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}
:root.dark .notification-tabs {
  border-bottom-color: #414141;
  background: #1e1e1f;
}

.notification-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.notification-tab.active {
  color: var(--color-gray-900, #111827);
  border-bottom-color: var(--accent-500);
}
:root.dark .notification-tab.active {
  color: var(--color-gray-100, #f3f4f6);
}

.tab-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent-500) 15%, transparent);
  color: var(--accent-500);
}

/* Notification Content */
.notification-content {
  display: none;
}
.notification-content.active {
  display: block;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .notification-item {
  border-bottom-color: #414141;
}
.notification-item.unread {
  background: color-mix(in srgb, var(--accent-500) 6%, transparent);
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notification-icon.system {
  background: color-mix(in srgb, var(--accent-500) 15%, transparent);
  color: var(--accent-500);
}
.notification-icon.won {
  background: #dcfce7;
  color: #16a34a;
}
.notification-icon.lost {
  background: #fee2e2;
  color: #dc2626;
}
.notification-icon.pending {
  background: #fef3c7;
  color: #d97706;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
:root.dark .notification-title {
  color: var(--color-gray-100, #f3f4f6);
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}
.status-badge.won {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.lost {
  background: #fee2e2;
  color: #dc2626;
}
.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.notification-text {
  font-size: 12px;
  color: var(--color-gray-400, #9ca3af);
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.notification-time {
  font-size: 12px;
  color: var(--color-gray-400, #9ca3af);
}

.notification-amount {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gray-500, #6b7280);
}
.notification-amount.positive {
  color: #16a34a;
}
.notification-amount.negative {
  color: #dc2626;
}

.view-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent-500);
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-decoration: none;
}
.view-all:active {
  opacity: 0.7;
}

/* ===================== DROPDOWN MODE STYLES ===================== */

/* Balance Section */
.dd-balance-section {
  padding-bottom: 16px;
}
.dd-balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.dd-balance-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
}
:root.dark .dd-balance-label {
  color: var(--color-gray-100, #f3f4f6);
}
.dd-balance-amount {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
}
:root.dark .dd-balance-amount {
  color: var(--color-gray-100, #f3f4f6);
}

/* Control Panel Button */
.dd-control-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-gray-50, #f9fafb);
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 12px;
  transition: background 0.2s;
  text-decoration: none;
  color: inherit;
}
:root.dark .dd-control-panel {
  background: var(--color-gray-800, #1f2937);
}
.dd-control-panel:hover {
  background: var(--color-gray-100, #e5e7eb);
}
:root.dark .dd-control-panel:hover {
  background: var(--color-gray-700, #374151);
}
.dd-control-panel svg {
  color: var(--color-gray-400, #9ca3af);
  flex-shrink: 0;
}
.dd-control-panel span {
  color: var(--color-gray-900, #111827);
  font-size: 15px;
  font-weight: 500;
}
:root.dark .dd-control-panel span {
  color: var(--color-gray-100, #f3f4f6);
}

/* Menu */
.dd-menu {
  padding-top: 16px;
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .dd-menu {
  border-top-color: var(--color-gray-700, #374151);
}

.dd-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  color: var(--color-gray-900, #111827);
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}
:root.dark .dd-menu-item {
  color: var(--color-gray-100, #f3f4f6);
}
.dd-menu-item:hover {
  background: var(--color-gray-50, #f9fafb);
}
:root.dark .dd-menu-item:hover {
  background: var(--color-gray-800, #1f2937);
}
.dd-menu-item svg {
  color: var(--color-gray-400, #9ca3af);
  flex-shrink: 0;
}
.dd-menu-item-label {
  flex: 1;
}

.dd-logout-menu {
  padding-top: 8px;
}

/* Logout hover */
.dd-logout-item:hover {
  background: #fef2f2;
  color: #dc2626;
}
:root.dark .dd-logout-item:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #f87171;
}
.dd-logout-item:hover svg {
  color: #dc2626;
}
:root.dark .dd-logout-item:hover svg {
  color: #f87171;
}

/* Badges */
.dd-badge {
  background: var(--accent-500);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: auto;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dd-badge-orange {
  background: var(--accent-600);
}

/* Theme Section */
.dd-theme-section {
  padding-top: 16px;
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .dd-theme-section {
  border-top-color: var(--color-gray-700, #374151);
}
.dd-theme-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 8px 0;
}
.dd-lang-row {
  padding-top: 10px;
  width: 100%;
}
.dd-theme-section {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .dd-theme-section {
  border-bottom-color: var(--color-gray-700, #374151);
}

/* Drawer Theme Section */
.drawer-theme-section {
  padding: 16px 0;
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .drawer-theme-section {
  border-top-color: #414141;
}
.drawer-theme-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.drawer-lang-row {
  padding-top: 10px;
  display: flex;
  justify-content: center;
}

/* Drawer Logout */
.drawer-logout-section {
  padding-top: 16px;
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .drawer-logout-section {
  border-top-color: #414141;
}
.drawer-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: var(--color-gray-100, #f3f4f6);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
:root.dark .drawer-logout-btn {
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-100, #f3f4f6);
}
.drawer-logout-btn:active {
  background: #fee2e2;
  color: #dc2626;
}
.drawer-logout-btn:active svg {
  color: #dc2626;
}
:root.dark .drawer-logout-btn:active {
  background: rgba(220, 38, 38, 0.15);
  color: #f87171;
}
:root.dark .drawer-logout-btn:active svg {
  color: #f87171;
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .page {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
