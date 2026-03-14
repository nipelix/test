<template>
  <div class="p-4">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-muted mb-4">
      <NuxtLink :to="localePath('/sportsbook')" class="hover:text-foreground">{{ t('sportsbook.home') }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
      <NuxtLink :to="localePath(`/sportsbook/${sport}`)" class="hover:text-foreground capitalize">{{ sport }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
      <span class="text-foreground capitalize">{{ leagueSlug }}</span>
    </div>

    <h2 class="text-lg font-semibold mb-4 capitalize">{{ leagueSlug }}</h2>

    <div v-if="status === 'pending'" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    </div>

    <div v-else-if="matches.length" class="space-y-3">
      <SportsbookEventCard
        v-for="match in matches"
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

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const sport = computed(() => route.params.sport as string)
const leagueSlug = computed(() => route.params.league as string)

const { data: matchesData, status } = await useAsyncData(
  `league-${sport.value}-${leagueSlug.value}`,
  () => $fetch<{ data: any[] }>('/api/sportsbook/matches', {
    query: { sport: sport.value, league: leagueSlug.value, limit: 50 }
  }).catch(() => ({ data: [] }))
)

const matches = computed(() => matchesData.value?.data ?? [])
</script>
