<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-tv" class="w-5 h-5 text-primary" />
      <h2 class="text-lg font-semibold">Live 2</h2>
    </div>

    <div v-if="liveMatches.length" class="space-y-3">
      <SportsbookEventCard
        v-for="match in liveMatches"
        :key="match.id"
        :match="match"
      />
    </div>

    <div v-else>
      <SharedEmptyStateIllustration />
    </div>

    <p class="text-xs text-yellow-600 dark:text-yellow-500 text-center mt-6 px-4">
      {{ $t('sportsbook.disclaimer') }}
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'sportsbook' })

const { liveMatches } = useMockData()
</script>
