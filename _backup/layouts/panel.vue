<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Header (sticky, full width) -->
    <HeaderAppHeader @toggle-sidebar="mobileOpen = !mobileOpen" />

    <!-- Desktop Sidebar (always visible, CSS-controlled) -->
    <SidebarPanelDesktop />

    <!-- Mobile Sidebar (toggle via JS, no SSR mismatch) -->
    <SidebarPanelMobile
      :open="mobileOpen"
      @close="mobileOpen = false"
    />

    <!-- Page Content -->
    <main class="min-h-[calc(100vh-3.75rem)] p-4 lg:p-6 lg:ml-60">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false)
</script>
