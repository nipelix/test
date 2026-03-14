<script setup lang="ts">
const auth = useAuthStore()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    'lang': 'tr',
    'data-accent': () => auth.accentColor
  }
})

useSeoMeta({
  title: 'Sinek2 - Sportbooks',
  description: 'Sinek2 Sports Betting Platform'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
