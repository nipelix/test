<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-4">{{ $t('sportsbook.prematch') }}</h2>

    <!-- Sport tabs -->
    <div class="flex items-center gap-2 mb-4 overflow-x-auto sport-nav-scroll pb-2">
      <UBadge
        v-for="sport in sportTabs"
        :key="sport"
        :color="activeSport === sport ? 'primary' : 'neutral'"
        :variant="activeSport === sport ? 'solid' : 'outline'"
        class="cursor-pointer whitespace-nowrap"
        @click="activeSport = sport"
      >
        {{ sport }}
      </UBadge>
    </div>

    <div v-if="prematchMatches.length" class="space-y-3">
      <SportsbookEventCard
        v-for="match in prematchMatches"
        :key="match.id"
        :match="match"
      />
    </div>

    <div v-else>
      <SharedEmptyStateIllustration />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'sportsbook' })

const { prematchMatches } = useMockData()

const activeSport = ref('All')
const sportTabs = ['All', 'Football', 'Tennis', 'Basketball', 'Volleyball']
</script>
