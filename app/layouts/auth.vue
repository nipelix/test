<template>
  <div class="auth-layout">
    <div class="auth-content">
      <slot />
    </div>

    <!-- Footer -->
    <div class="auth-footer">
      <div class="auth-footer-left">
        <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-green-600" />
        <span class="text-xs font-bold text-gray-700 dark:text-gray-300">100% Secured</span>
      </div>
      <button class="auth-footer-right">
        <span>{{ $t('common.customer_service') }}</span>
        <UIcon name="i-lucide-send" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--ui-bg);
}

.auth-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 80px;
  width: 100%;
}

.auth-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 24px;
  background: var(--ui-bg-elevated);
  border-top: 1px solid var(--ui-border);
}

.auth-footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ui-primary);
  transition: opacity 0.15s;
}

.auth-footer-right:hover {
  opacity: 0.8;
}
</style>
