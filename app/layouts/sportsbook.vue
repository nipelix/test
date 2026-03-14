<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <!-- Header + Menu + Context Bar (all sticky together) -->
    <HeaderAppHeader @toggle-sidebar="mobileOpen = !mobileOpen">
      <HeaderMenu />
      <HeaderContextBar
        :sidebar-open="desktopSidebarOpen"
        :betslip-open="betslipOpen"
        @toggle-sidebar="desktopSidebarOpen = !desktopSidebarOpen"
        @toggle-betslip="betslipOpen = !betslipOpen"
      />
    </HeaderAppHeader>

    <!-- 3-Column Layout -->
    <div class="flex">
      <!-- Desktop Sidebar (CSS-controlled) -->
      <SidebarSportsbookDesktop :open="desktopSidebarOpen" />

      <!-- Mobile Sidebar (toggle via JS) -->
      <SidebarSportsbookMobile
        :open="mobileOpen"
        @close="mobileOpen = false"
      />

      <!-- Main Content -->
      <main class="flex-1 min-w-0 transition-[margin] duration-200" :class="desktopSidebarOpen ? 'lg:ml-[230px]' : ''">
        <slot />
        <FooterSportsbookFooter />
      </main>

      <!-- Right Betslip Panel -->
      <aside
        v-show="betslipOpen"
        class="hidden lg:block sticky top-[169px] h-[calc(100vh-169px)] w-[375px] shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto"
      >
        <SportsbookBetslip />
      </aside>
    </div>

    <!-- Mobile Bottom Nav -->
    <FooterMobileBottomNav />
  </div>
</template>

<script setup lang="ts">
const desktopSidebarOpen = ref(true)
const betslipOpen = ref(true)
const mobileOpen = ref(false)
</script>
