<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Logo -->
    <div class="text-center mb-8">
      <h1 class="text-5xl font-bold text-gray-400">Sinek2</h1>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
      {{ errorMessage }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
      {{ successMessage }}
    </div>

    <!-- Password Login Form -->
    <div v-if="mode === 'password'" class="space-y-4">
      <UInput
        v-model="username"
        :placeholder="$t('auth.username_placeholder')"
        size="lg"
        icon="i-lucide-at-sign"
        class="w-full"
        :disabled="auth.loading"
        @keyup.enter="handleLogin"
      />
      <UInput
        v-model="password"
        type="password"
        :placeholder="$t('auth.password_placeholder')"
        size="lg"
        icon="i-lucide-lock"
        class="w-full"
        :disabled="auth.loading"
        @keyup.enter="handleLogin"
      />
      <UButton
        block
        size="lg"
        color="primary"
        class="font-semibold"
        :loading="auth.loading"
        @click="handleLogin"
      >
        {{ $t('auth.login') }}
      </UButton>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span class="text-xs text-gray-400 uppercase">{{ $t('common.or') || 'veya' }}</span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- Passkey Login -->
      <UButton
        block
        size="lg"
        variant="outline"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-fingerprint"
        :loading="passkeyLoading"
        @click="handlePasskeyLogin"
      >
        {{ $t('auth.passkey_login') }}
      </UButton>

      <!-- Magic Link -->
      <UButton
        block
        size="lg"
        variant="ghost"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-wand-sparkles"
        @click="mode = 'magic-link'"
      >
        {{ $t('auth.use_magic_link') }}
      </UButton>
    </div>

    <!-- Magic Link: Email Step -->
    <div v-else-if="mode === 'magic-link'" class="space-y-4">
      <UInput
        v-model="email"
        :placeholder="$t('auth.magic_link_email_placeholder')"
        size="lg"
        icon="i-lucide-mail"
        class="w-full"
        :disabled="sendingLink"
        @keyup.enter="handleSendMagicLink"
      />
      <UButton
        block
        size="lg"
        color="primary"
        class="font-semibold"
        icon="i-lucide-send"
        :loading="sendingLink"
        @click="handleSendMagicLink"
      >
        {{ $t('auth.send_magic_link') }}
      </UButton>
      <UButton
        block
        size="lg"
        variant="outline"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-lock"
        @click="mode = 'password'"
      >
        {{ $t('auth.use_password') }}
      </UButton>
    </div>

    <!-- Magic Link: Token Step -->
    <div v-else-if="mode === 'verify-token'" class="space-y-4">
      <p class="text-sm text-center text-gray-500 dark:text-gray-400">
        {{ $t('auth.enter_token') }}
      </p>
      <UInput
        v-model="token"
        :placeholder="$t('auth.magic_link_token_placeholder')"
        size="lg"
        icon="i-lucide-key-round"
        class="w-full"
        :disabled="verifyingToken"
        @keyup.enter="handleVerifyToken"
      />
      <UButton
        block
        size="lg"
        color="primary"
        class="font-semibold"
        icon="i-lucide-log-in"
        :loading="verifyingToken"
        @click="handleVerifyToken"
      >
        {{ $t('auth.verify_magic_link') }}
      </UButton>
      <UButton
        block
        size="lg"
        variant="outline"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-lock"
        @click="mode = 'password'"
      >
        {{ $t('auth.use_password') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { startAuthentication } from '@simplewebauthn/browser'

definePageMeta({ layout: 'default' })

const router = useRouter()
const localePath = useLocalePath()
const auth = useAuthStore()

type Mode = 'password' | 'magic-link' | 'verify-token'
const mode = ref<Mode>('password')

const username = ref('')
const password = ref('')
const email = ref('')
const token = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const sendingLink = ref(false)
const verifyingToken = ref(false)
const passkeyLoading = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push(localePath('/panel'))
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Login failed'
  }
}

async function handlePasskeyLogin() {
  errorMessage.value = ''
  passkeyLoading.value = true
  try {
    // 1. Get options from server
    const options = await $fetch<any>('/api/auth/passkey/login-options', { method: 'POST' })
    const { challengeId, ...authOptions } = options

    // 2. Browser prompt (Windows Hello / Touch ID / Face ID)
    const credential = await startAuthentication({ optionsJSON: authOptions })

    // 3. Verify with server
    const userData = await $fetch('/api/auth/passkey/login-verify', {
      method: 'POST',
      body: { credential, challengeId }
    })
    auth.user = userData as any
    router.push(localePath('/panel'))
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      errorMessage.value = ''
    } else {
      errorMessage.value = err.data?.statusMessage || err.message || 'Passkey authentication failed'
    }
  } finally {
    passkeyLoading.value = false
  }
}

async function handleSendMagicLink() {
  if (!email.value) return
  errorMessage.value = ''
  successMessage.value = ''
  sendingLink.value = true
  try {
    await $fetch('/api/auth/magic-link', {
      method: 'POST',
      body: { email: email.value }
    })
    mode.value = 'verify-token'
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Failed to send magic link'
  } finally {
    sendingLink.value = false
  }
}

async function handleVerifyToken() {
  if (!token.value) return
  errorMessage.value = ''
  successMessage.value = ''
  verifyingToken.value = true
  try {
    const userData = await $fetch('/api/auth/verify-link', {
      method: 'POST',
      body: { token: token.value }
    })
    auth.user = userData as any
    router.push(localePath('/panel'))
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Invalid or expired token'
  } finally {
    verifyingToken.value = false
  }
}
</script>
