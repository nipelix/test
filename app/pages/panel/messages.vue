<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.messages') }}</h1>

    <div class="space-y-4">
      <UCard
        v-for="message in messages"
        :key="message.id"
        class="relative"
        :class="!message.read ? 'border-l-4 border-l-primary' : ''"
      >
        <div class="flex items-start gap-4">
          <!-- Unread Indicator -->
          <div class="flex-shrink-0 mt-1">
            <div
              v-if="!message.read"
              class="w-3 h-3 rounded-full bg-blue-500"
            />
            <div
              v-else
              class="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"
            />
          </div>

          <!-- Message Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-sm font-semibold" :class="!message.read ? 'text-primary' : ''">
                {{ message.subject }}
              </h3>
              <span class="text-xs text-muted flex-shrink-0 ml-4">
                {{ formatDate(message.createdAt) }}
              </span>
            </div>
            <p class="text-xs text-muted mb-2">
              {{ t('messages.from') }}: {{ message.sender }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ message.content }}
            </p>
          </div>
        </div>
      </UCard>

      <div v-if="messages.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-inbox" class="w-12 h-12 text-muted mx-auto mb-4" />
        <p class="text-muted">{{ t('messages.no_messages') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const { messages } = useMockData()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
