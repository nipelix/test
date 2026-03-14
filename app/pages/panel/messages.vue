<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">{{ t('dashboard.messages') }}</h1>
      <UButton icon="i-lucide-plus" size="sm" @click="newChatOpen = true">
        {{ t('messages.new_chat') }}
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
      <!-- Conversation List -->
      <UCard class="lg:col-span-1 overflow-hidden flex flex-col">
        <template #header>
          <UInput v-model="conversationSearch" icon="i-lucide-search" :placeholder="t('messages.search_conversations')" size="sm" />
        </template>
        <div class="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
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
          <p v-if="filteredConversations.length === 0" class="text-sm text-muted text-center py-8">
            {{ t('messages.no_conversations') }}
          </p>
        </div>
      </UCard>

      <!-- Chat Area -->
      <UCard class="lg:col-span-2 overflow-hidden flex flex-col">
        <template v-if="activeConversationId" #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <CommonUserAvatar :username="activeConversation?.participantUsername ?? ''" size="sm" />
              <span class="font-medium">{{ activeConversation?.participantUsername }}</span>
            </div>
            <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="deleteConversation" />
          </div>
        </template>

        <div v-if="activeConversationId" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.senderId === auth.user?.id ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] rounded-lg px-3 py-2 text-sm"
              :class="msg.senderId === auth.user?.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'"
            >
              <p>{{ msg.content }}</p>
              <p class="text-[10px] mt-1 opacity-70">{{ formatTime(msg.createdAt) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-muted">
          {{ t('messages.select_conversation') }}
        </div>

        <!-- Message Input -->
        <div v-if="activeConversationId" class="border-t border-gray-200 dark:border-gray-800 p-3">
          <div class="flex gap-2">
            <UInput v-model="messageInput" :placeholder="t('messages.type_message')" class="flex-1" @keyup.enter="sendMessage" />
            <UButton icon="i-lucide-send" :loading="sending" @click="sendMessage" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- New Chat Modal -->
    <UModal v-model:open="newChatOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ t('messages.new_chat') }}</h3>
          </template>
          <UFormField :label="t('messages.select_user')">
            <UInput v-model="newChatUsername" :placeholder="t('common.username')" />
          </UFormField>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="outline" @click="newChatOpen = false">{{ t('common.cancel') }}</UButton>
              <UButton color="primary" @click="startNewChat">{{ t('messages.start_chat') }}</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~~/shared/utils/formatters'

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

// Conversations
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

// Messages for active conversation
const messages = ref<any[]>([])

watch(activeConversationId, async (id) => {
  if (!id) { messages.value = []; return }
  try {
    const data = await $fetch<any[]>(`/api/messages/conversations/${id}`)
    messages.value = data
  } catch { messages.value = [] }
})

async function sendMessage() {
  if (!messageInput.value.trim() || !activeConversationId.value) return
  sending.value = true
  try {
    await $fetch('/api/messages/send', {
      method: 'POST',
      body: { conversationId: activeConversationId.value, content: messageInput.value.trim() }
    })
    messageInput.value = ''
    // Refresh messages
    const data = await $fetch<any[]>(`/api/messages/conversations/${activeConversationId.value}`)
    messages.value = data
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
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

async function startNewChat() {
  if (!newChatUsername.value.trim()) return
  // In a real implementation, resolve username to userId first
  newChatOpen.value = false
  newChatUsername.value = ''
  toast.add({ title: t('messages.chat_started'), color: 'success' })
  refreshConversations()
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}
</script>
