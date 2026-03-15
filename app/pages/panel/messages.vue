<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">{{ t('dashboard.messages') }}</h1>
      <UButton icon="i-lucide-plus" size="sm" @click="newChatOpen = true">
        {{ t('messages.new_chat') }}
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4" style="height: calc(100dvh - 12rem)">
      <!-- Conversation List (hide on mobile when chat is active) -->
      <UCard v-if="!activeConversationId || !isMobile" class="lg:col-span-1 overflow-hidden flex flex-col">
        <template #header>
          <UInput v-model="conversationSearch" icon="i-lucide-search" :placeholder="t('messages.search_conversations')" size="sm" />
        </template>

        <!-- Loading -->
        <div v-if="!conversationsData" class="space-y-3 p-3">
          <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
        </div>

        <!-- List -->
        <div v-else class="flex-1 overflow-y-auto divide-y divide-default">
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="flex items-center gap-3 p-3 cursor-pointer transition"
            :class="activeConversationId === conv.id ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="activeConversationId = conv.id"
          >
            <div class="relative">
              <CommonUserAvatar :username="conv.participantUsername" size="md" />
              <span v-if="conv.unreadCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {{ conv.unreadCount }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ conv.participantUsername }}</p>
              <p class="text-xs text-muted truncate">{{ conv.lastMessage }}</p>
            </div>
            <span class="text-[10px] text-muted shrink-0">{{ formatTime(conv.lastMessageAt) }}</span>
          </div>

          <!-- Empty -->
          <div v-if="filteredConversations.length === 0" class="flex flex-col items-center py-12 text-muted">
            <UIcon name="i-lucide-message-square" class="w-10 h-10 mb-2 opacity-30" />
            <p class="text-sm">{{ t('messages.no_conversations') }}</p>
          </div>
        </div>
      </UCard>

      <!-- Chat Area -->
      <UCard v-if="activeConversationId || !isMobile" class="lg:col-span-2 overflow-hidden flex flex-col">
        <template v-if="activeConversationId" #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <!-- Back button on mobile -->
              <UButton v-if="isMobile" icon="i-lucide-arrow-left" variant="ghost" size="xs" @click="activeConversationId = null" />
              <CommonUserAvatar :username="activeConversation?.participantUsername ?? ''" size="sm" />
              <span class="font-medium">{{ activeConversation?.participantUsername }}</span>
            </div>
            <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="deleteConversation" />
          </div>
        </template>

        <!-- Messages -->
        <div v-if="activeConversationId" ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-1">
          <template v-for="(msg, i) in messages" :key="msg.id">
            <!-- Date separator -->
            <div v-if="shouldShowDateSeparator(i)" class="text-center text-xs text-muted py-3">
              <span class="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{{ formatDateLabel(msg.createdAt) }}</span>
            </div>

            <!-- Message bubble -->
            <div class="flex" :class="msg.senderId === auth.user?.id ? 'justify-end' : 'justify-start'">
              <div
                class="max-w-[70%] rounded-2xl px-3.5 py-2 text-sm"
                :class="msg.senderId === auth.user?.id
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'"
              >
                <p>{{ msg.content }}</p>
                <p class="text-[10px] mt-1 opacity-60 text-right">{{ formatTime(msg.createdAt) }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- No conversation selected -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-muted gap-2">
          <UIcon name="i-lucide-message-circle" class="w-16 h-16 opacity-20" />
          <p class="text-sm">{{ t('messages.select_conversation') }}</p>
        </div>

        <!-- Message Input -->
        <div v-if="activeConversationId" class="border-t border-default p-3">
          <form class="flex gap-2" @submit.prevent="sendMessage">
            <UInput v-model="messageInput" :placeholder="t('messages.type_message')" class="flex-1" />
            <UButton type="submit" icon="i-lucide-send" :loading="sending" :disabled="!messageInput.trim()" />
          </form>
        </div>
      </UCard>
    </div>

    <!-- New Chat Modal -->
    <UModal v-model:open="newChatOpen" :title="t('messages.new_chat')">
      <template #body>
        <UFormField :label="t('messages.select_user')">
          <UInput v-model="newChatUsername" :placeholder="t('common.username')" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="newChatOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton color="primary" :disabled="!newChatUsername.trim()" @click="startNewChat">{{ t('messages.start_chat') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const conversationSearch = ref('')
const activeConversationId = ref<number | null>(null)
const messageInput = ref('')
const sending = ref(false)
const newChatOpen = ref(false)
const newChatUsername = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const isMobile = ref(false)

onMounted(() => {
  const check = () => { isMobile.value = window.innerWidth < 1024 }
  check()
  window.addEventListener('resize', check)
  onBeforeUnmount(() => window.removeEventListener('resize', check))
})

const { data: conversationsData, refresh: refreshConversations } = await useAsyncData('messages-conversations', () =>
  $fetch<any[]>('/api/messages/conversations').catch(() => [])
)

const conversations = computed(() => conversationsData.value ?? [])
const filteredConversations = computed(() => {
  if (!conversationSearch.value) return conversations.value
  const q = conversationSearch.value.toLowerCase()
  return conversations.value.filter((c: any) => c.participantUsername?.toLowerCase().includes(q))
})

const activeConversation = computed(() =>
  conversations.value.find((c: any) => c.id === activeConversationId.value)
)

const messages = ref<any[]>([])

watch(activeConversationId, async (id) => {
  if (!id) { messages.value = []; return }
  try {
    const data = await $fetch<any[]>(`/api/messages/conversations/${id}`)
    messages.value = data
    scrollToBottom()
  } catch { messages.value = [] }
})

function scrollToBottom() {
  nextTick(() => {
    chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

function shouldShowDateSeparator(index: number): boolean {
  if (index === 0) return true
  const curr = new Date(messages.value[index].createdAt).toDateString()
  const prev = new Date(messages.value[index - 1].createdAt).toDateString()
  return curr !== prev
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return t('common.today')
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('common.yesterday')
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}

async function sendMessage() {
  if (!messageInput.value.trim() || !activeConversationId.value) return
  sending.value = true
  try {
    await $fetch('/api/messages/send', { method: 'POST', body: { conversationId: activeConversationId.value, content: messageInput.value.trim() } })
    messageInput.value = ''
    const data = await $fetch<any[]>(`/api/messages/conversations/${activeConversationId.value}`)
    messages.value = data
    scrollToBottom()
    refreshConversations()
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  } finally { sending.value = false }
}

async function deleteConversation() {
  if (!activeConversationId.value) return
  try {
    await $fetch(`/api/messages/conversations/${activeConversationId.value}`, { method: 'DELETE' })
    activeConversationId.value = null
    messages.value = []
    refreshConversations()
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

async function startNewChat() {
  if (!newChatUsername.value.trim()) return
  newChatOpen.value = false
  newChatUsername.value = ''
  toast.add({ title: t('messages.chat_started'), color: 'success' })
  refreshConversations()
}
</script>
