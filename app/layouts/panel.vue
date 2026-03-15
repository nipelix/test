<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Skip to content (a11y) -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:p-2 focus:bg-primary focus:text-white focus:rounded">
      Skip to content
    </a>

    <HeaderAppHeader @toggle-sidebar="mobileOpen = !mobileOpen" />
    <SidebarPanelDesktop />
    <SidebarPanelMobile :open="mobileOpen" @close="mobileOpen = false" />

    <main id="main-content" class="min-h-[calc(100vh-3.75rem)] p-4 lg:p-6 lg:ml-60 max-w-screen-2xl">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false)
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
