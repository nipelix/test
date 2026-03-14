<template>
  <NuxtLink :to="`/play/${game.slug}`" class="block group">
    <div class="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-800">
      <!-- Placeholder image -->
      <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
        <span class="text-3xl font-bold text-white/80">{{ game.name }}</span>
      </div>
      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
        <UButton
          icon="i-lucide-play"
          color="primary"
          size="lg"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
    <p class="text-sm font-medium text-center mt-2 text-white">{{ game.name }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Game } from '@mock/games'

defineProps<{
  game: Game
}>()
</script>
