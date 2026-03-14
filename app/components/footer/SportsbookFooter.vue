<template>
  <footer class="sb-footer">
    <div class="sb-footer__logo">Sinek2</div>
    <p class="sb-footer__licence">
      {{ $t('sportsbook.footer_text') }}
    </p>
    <p class="sb-footer__copyright">{{ $t('sportsbook.copyright') }} &copy; {{ new Date().getFullYear() }}</p>
    <div class="sb-footer__links">
      <a href="#" class="sb-footer__link">
        <UIcon name="i-lucide-help-circle" class="w-5 h-5" />
        <span>{{ $t('sportsbook.faq') }}</span>
      </a>
      <a href="#" class="sb-footer__link">
        <UIcon name="i-lucide-headphones" class="w-5 h-5" />
        <span>{{ $t('sportsbook.live_support') }}</span>
        <span class="sb-footer__live-dot" />
      </a>
    </div>
  </footer>
</template>

<style scoped>
.sb-footer {
  background: var(--color-gray-800, #1f2937);
  color: var(--color-gray-400, #9ca3af);
  padding: 40px 20px;
  width: 100%;
}
:root.dark .sb-footer {
  background: var(--color-gray-900, #111827);
}

.sb-footer__logo {
  width: fit-content;
  margin: 0 auto 16px;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-gray-400, #9ca3af);
}

.sb-footer__licence {
  font-size: 13px;
  line-height: 1.5;
  max-width: 800px;
  text-align: center;
  margin: 0 auto 20px;
  color: var(--color-gray-500, #6b7280);
}

.sb-footer__copyright {
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-400, #9ca3af);
  margin-bottom: 20px;
}

.sb-footer__links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

.sb-footer__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  border-radius: 5px;
  white-space: nowrap;
  padding: 0 16px;
  height: 36px;
  width: 100%;
  max-width: 272px;
  background: var(--color-gray-700, #374151);
  color: var(--color-gray-300, #d1d5db);
  font-size: 14px;
  transition: background 0.2s;
}
:root.dark .sb-footer__link {
  background: var(--color-gray-800, #1f2937);
}
.sb-footer__link:hover {
  background: var(--color-gray-600, #4b5563);
}
:root.dark .sb-footer__link:hover {
  background: var(--color-gray-700, #374151);
}
.sb-footer__link svg {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.sb-footer__live-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-500);
}

@media (max-width: 639px) {
  .sb-footer__links {
    flex-direction: column;
  }
  .sb-footer {
    padding-bottom: calc(40px + 60px);
  }
}
</style>
