<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-4 capitalize">{{ sport }}</h2>

    <div v-if="sportMatches.length" class="space-y-3">
      <SportsbookEventCard
        v-for="match in sportMatches"
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

const route = useRoute()
const { matches } = useMockData()

const sport = computed(() => route.params.sport as string)

const sportMatches = computed(() => {
  return matches.filter(m => m.sportName.toLowerCase() === sport.value.toLowerCase())
})
</script>
