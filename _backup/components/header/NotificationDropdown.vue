<template>
  <div class="notif-container" ref="containerRef">
    <!-- Trigger Button -->
    <button class="notif-trigger" @click="isOpen = !isOpen">
      <UIcon name="i-lucide-bell" class="w-5 h-5" />
      <span v-if="totalUnread > 0" class="trigger-badge">{{ totalUnread }}</span>
    </button>

    <!-- Dropdown -->
    <div v-if="isOpen" class="notif-dropdown">
      <div class="notif-wrapper">
        <div class="notif-inner">
          <!-- Header -->
          <div class="notif-header">
            <h3>{{ t('common.notifications') }}</h3>
            <button class="mark-all-read" @click="markAllRead">{{ t('common.mark_all_read') }}</button>
          </div>

          <!-- Tabs -->
          <div class="notif-tabs">
            <button
              class="notif-tab"
              :class="{ active: activeTab === 'system' }"
              @click="activeTab = 'system'"
            >
              <UIcon name="i-lucide-info" class="w-4 h-4" />
              <span>{{ t('common.system') }}</span>
              <span v-if="unreadSystem > 0" class="notif-tab-badge">{{ unreadSystem }}</span>
            </button>
            <button
              class="notif-tab"
              :class="{ active: activeTab === 'message' }"
              @click="activeTab = 'message'"
            >
              <UIcon name="i-lucide-message-square" class="w-4 h-4" />
              <span>{{ t('common.messages') }}</span>
              <span v-if="unreadMessage > 0" class="notif-tab-badge">{{ unreadMessage }}</span>
            </button>
            <button
              class="notif-tab"
              :class="{ active: activeTab === 'bet' }"
              @click="activeTab = 'bet'"
            >
              <UIcon name="i-lucide-monitor" class="w-4 h-4" />
              <span>{{ t('common.coupons') }}</span>
              <span v-if="unreadBet > 0" class="notif-tab-badge">{{ unreadBet }}</span>
            </button>
          </div>

          <!-- Notification List -->
          <div class="notif-list">
            <!-- System -->
            <template v-if="activeTab === 'system'">
              <div
                v-for="n in systemNotifs"
                :key="n.id"
                class="notif-item"
                :class="{ unread: !n.isRead }"
              >
                <div class="notif-icon system">
                  <UIcon :name="n.icon === 'shield' ? 'i-lucide-shield' : n.icon === 'clock' ? 'i-lucide-clock' : 'i-lucide-info'" class="w-[22px] h-[22px]" />
                </div>
                <div class="notif-content">
                  <div class="notif-title">{{ n.title }}</div>
                  <p class="notif-text">{{ n.message }}</p>
                  <div class="notif-meta">
                    <span class="notif-time">{{ n.time }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Messages -->
            <template v-if="activeTab === 'message'">
              <div
                v-for="n in messageNotifs"
                :key="n.id"
                class="notif-item"
                :class="{ unread: !n.isRead }"
              >
                <div class="message-avatar">{{ n.senderInitials }}</div>
                <div class="notif-content">
                  <div class="notif-title">{{ n.senderName }}</div>
                  <p class="notif-text">{{ n.message }}</p>
                  <div class="notif-meta">
                    <span class="notif-time">{{ n.time }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Bets -->
            <template v-if="activeTab === 'bet'">
              <div
                v-for="n in betNotifs"
                :key="n.id"
                class="notif-item"
                :class="{ unread: !n.isRead }"
              >
                <div class="notif-icon" :class="n.status">
                  <UIcon :name="betIcon(n.status)" class="w-[22px] h-[22px]" />
                </div>
                <div class="notif-content">
                  <div class="notif-title">
                    <span>{{ t('common.coupon') }} #{{ n.couponId }}</span>
                    <span v-if="betBadgeText(n.status)" class="status-badge" :class="n.status">{{ betBadgeText(n.status) }}</span>
                  </div>
                  <p class="notif-text">{{ n.matches }}</p>
                  <div class="notif-meta">
                    <span class="notif-time">{{ n.time }}</span>
                    <span v-if="n.amount" class="notif-amount" :class="{ positive: n.isPositive === true, negative: n.isPositive === false }">{{ n.amount }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="notif-footer">
            <button class="view-all-btn" @click="isOpen = false">
              <span>{{ t('common.view_all_notifications') }}</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type NotificationTab = 'system' | 'message' | 'bet'
type BetStatus = 'won' | 'lost' | 'pending' | 'cancelled' | 'refunded'

interface SystemNotif { id: string; type: 'system'; title: string; message: string; time: string; isRead: boolean; icon: string }
interface MessageNotif { id: string; type: 'message'; senderName: string; senderInitials: string; message: string; time: string; isRead: boolean }
interface BetNotif { id: string; type: 'bet'; couponId: string; status: BetStatus; matches: string; time: string; amount?: string; isPositive?: boolean; isRead: boolean }

const { t } = useI18n()
const isOpen = ref(false)
const activeTab = ref<NotificationTab>('system')
const containerRef = ref<HTMLElement | null>(null)

const systemNotifs = ref<SystemNotif[]>([
  { id: '1', type: 'system', title: 'Güvenlik Uyarısı', message: 'Hesabınıza yeni bir cihazdan giriş yapıldı.', time: '5 dakika önce', isRead: false, icon: 'shield' },
  { id: '2', type: 'system', title: 'Bakım Duyurusu', message: '23:00 - 02:00 saatleri arasında planlı bakım yapılacaktır.', time: '2 saat önce', isRead: false, icon: 'clock' },
  { id: '3', type: 'system', title: 'Bonus Kazandınız!', message: 'Haftalık sadakat bonusunuz hesabınıza tanımlandı.', time: '1 gün önce', isRead: true, icon: 'info' },
])

const messageNotifs = ref<MessageNotif[]>([
  { id: '4', type: 'message', senderName: 'Ahmet Kaya', senderInitials: 'AK', message: 'Bu akşamki maç için ne düşünüyorsun?', time: '10 dakika önce', isRead: false },
  { id: '5', type: 'message', senderName: 'Mehmet Yılmaz', senderInitials: 'MY', message: 'Tebrikler! Dün gece güzel vurmuşsun', time: '1 saat önce', isRead: false },
  { id: '6', type: 'message', senderName: 'Destek Ekibi', senderInitials: 'SD', message: 'Talebiniz incelendi ve çözüme kavuşturuldu.', time: '3 saat önce', isRead: true },
])

const betNotifs = ref<BetNotif[]>([
  { id: '7', type: 'bet', couponId: '48291', status: 'won', matches: 'GS vs FB, Barcelona vs Real ve 8 maç daha...', time: '30 dk önce', amount: '+₺1.250,00', isPositive: true, isRead: false },
  { id: '8', type: 'bet', couponId: '48285', status: 'lost', matches: 'Liverpool vs Man City ve 3 maç daha...', time: '2 saat önce', amount: '-₺100,00', isPositive: false, isRead: false },
  { id: '9', type: 'bet', couponId: '48295', status: 'pending', matches: 'GS vs BJK, FB vs TS ve 1 maç daha... (2/3 tamamlandı)', time: 'Canlı', amount: '₺500,00', isRead: true },
  { id: '10', type: 'bet', couponId: '48240', status: 'cancelled', matches: 'Inter vs Juventus', time: '3 gün önce', isRead: true },
  { id: '11', type: 'bet', couponId: '48235', status: 'refunded', matches: 'Arsenal vs Chelsea ve 2 maç daha...', time: '4 gün önce', amount: '₺200,00 iade', isRead: true },
])

const unreadSystem = computed(() => systemNotifs.value.filter(n => !n.isRead).length)
const unreadMessage = computed(() => messageNotifs.value.filter(n => !n.isRead).length)
const unreadBet = computed(() => betNotifs.value.filter(n => !n.isRead).length)
const totalUnread = computed(() => unreadSystem.value + unreadMessage.value + unreadBet.value)

function markAllRead() {
  systemNotifs.value = systemNotifs.value.map(n => ({ ...n, isRead: true }))
  messageNotifs.value = messageNotifs.value.map(n => ({ ...n, isRead: true }))
  betNotifs.value = betNotifs.value.map(n => ({ ...n, isRead: true }))
}

function betIcon(status: BetStatus) {
  const map: Record<BetStatus, string> = {
    won: 'i-lucide-check-circle',
    lost: 'i-lucide-x-circle',
    pending: 'i-lucide-clock',
    cancelled: 'i-lucide-minus-circle',
    refunded: 'i-lucide-refresh-cw',
  }
  return map[status]
}

function betBadgeText(status: BetStatus) {
  const map: Record<BetStatus, string | null> = {
    won: 'Kazandı',
    lost: 'Kaybetti',
    pending: null,
    cancelled: 'İptal Edildi',
    refunded: 'İade Edildi',
  }
  return map[status]
}

onMounted(() => {
  const handler = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      isOpen.value = false
    }
  }
  document.addEventListener('mousedown', handler)
  onUnmounted(() => document.removeEventListener('mousedown', handler))
})
</script>

<style scoped>
.notif-container {
  position: relative;
}

/* Trigger */
.notif-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--accent-700);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.16s;
  color: white;
}
.notif-trigger:hover {
  background-color: var(--accent-600);
}
.notif-trigger:hover svg {
  animation: ring 0.5s ease;
}

@keyframes ring {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(15deg); }
  40%, 80% { transform: rotate(-15deg); }
}

.trigger-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
}

/* Dropdown */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 380px;
  z-index: 50;
}

.notif-wrapper {
  background: var(--color-gray-100, #f3f4f6);
  padding: 8px;
  border-radius: 8px;
  position: relative;
  animation: slideDown 0.3s ease;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px rgba(0,0,0,0.14), 0 1px 10px rgba(0,0,0,0.12);
}
:root.dark .notif-wrapper {
  background: var(--color-gray-800, #1f2937);
}
.notif-wrapper::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 15px;
  width: 16px;
  height: 16px;
  background: var(--color-gray-100, #f3f4f6);
  transform: rotate(45deg);
}
:root.dark .notif-wrapper::before {
  background: var(--color-gray-800, #1f2937);
}

.notif-inner {
  background: white;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
:root.dark .notif-inner {
  background: var(--color-gray-900, #111827);
}
.notif-inner::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 7px;
  width: 16px;
  height: 16px;
  background: white;
  transform: rotate(45deg);
  z-index: 1;
}
:root.dark .notif-inner::before {
  background: var(--color-gray-900, #111827);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .notif-header {
  border-bottom-color: var(--color-gray-700, #374151);
}
.notif-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  margin: 0;
}
:root.dark .notif-header h3 {
  color: var(--color-gray-100, #f3f4f6);
}
.mark-all-read {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-400, #9ca3af);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.16s;
}
.mark-all-read:hover {
  color: var(--accent-500);
}

/* Tabs */
.notif-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .notif-tabs {
  border-bottom-color: var(--color-gray-700, #374151);
}
.notif-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gray-400, #9ca3af);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.16s;
}
.notif-tab:hover {
  color: var(--color-gray-900, #111827);
}
:root.dark .notif-tab:hover {
  color: var(--color-gray-100, #f3f4f6);
}
.notif-tab.active {
  color: var(--color-gray-900, #111827);
  border-bottom-color: var(--accent-500);
}
:root.dark .notif-tab.active {
  color: var(--color-gray-100, #f3f4f6);
}
.notif-tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent-500) 15%, transparent);
  color: var(--accent-500);
}

/* Notification List */
.notif-list {
  max-height: 400px;
  overflow-y: auto;
}
.notif-list::-webkit-scrollbar {
  width: 6px;
}
.notif-list::-webkit-scrollbar-thumb {
  background: var(--color-gray-200, #e5e7eb);
  border-radius: 3px;
}

/* Notification Item */
.notif-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  cursor: pointer;
  transition: background 0.16s;
}
:root.dark .notif-item {
  border-bottom-color: var(--color-gray-700, #374151);
}
.notif-item:hover {
  background: var(--color-gray-50, #f9fafb);
}
:root.dark .notif-item:hover {
  background: var(--color-gray-800, #1f2937);
}
.notif-item.unread {
  background: color-mix(in srgb, var(--accent-500) 6%, transparent);
}

/* Icon */
.notif-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notif-icon.system {
  background: color-mix(in srgb, var(--accent-500) 15%, transparent);
  color: var(--accent-500);
}
.notif-icon.won {
  background: #dcfce7;
  color: #16a34a;
}
.notif-icon.lost {
  background: #fee2e2;
  color: #dc2626;
}
.notif-icon.pending {
  background: #fef3c7;
  color: #d97706;
}
.notif-icon.cancelled {
  background: var(--color-gray-100, #f3f4f6);
  color: var(--color-gray-400, #9ca3af);
}
.notif-icon.refunded {
  background: #dbeafe;
  color: #2563eb;
}

/* Message Avatar */
.message-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-500);
  color: white;
  font-weight: 700;
  font-size: 16px;
}

/* Content */
.notif-content {
  flex: 1;
  min-width: 0;
}
.notif-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
:root.dark .notif-title {
  color: var(--color-gray-100, #f3f4f6);
}
.notif-text {
  font-size: 13px;
  color: var(--color-gray-400, #9ca3af);
  line-height: 1.375;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}
.notif-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.notif-time {
  font-size: 12px;
  color: var(--color-gray-400, #9ca3af);
}
.notif-amount {
  font-size: 13px;
  font-weight: 700;
}
.notif-amount.positive {
  color: #16a34a;
}
.notif-amount.negative {
  color: #dc2626;
}

/* Status Badge */
.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.status-badge.won {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.lost {
  background: #fee2e2;
  color: #dc2626;
}
.status-badge.cancelled {
  background: var(--color-gray-100, #f3f4f6);
  color: var(--color-gray-400, #9ca3af);
}
.status-badge.refunded {
  background: #dbeafe;
  color: #2563eb;
}

/* Footer */
.notif-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .notif-footer {
  border-top-color: var(--color-gray-700, #374151);
}
.view-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  background: var(--color-gray-50, #f9fafb);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.16s;
}
:root.dark .view-all-btn {
  color: var(--color-gray-100, #f3f4f6);
  background: var(--color-gray-800, #1f2937);
}
.view-all-btn:hover {
  background: var(--color-gray-100, #e5e7eb);
}
:root.dark .view-all-btn:hover {
  background: var(--color-gray-700, #374151);
}
</style>
