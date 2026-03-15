# Sinek Sportsbook Platform - Nuxt.js Claude Prompt

> **Proje:** sportbooks-nuxt (Modern Vue.js Frontend)  
> **Lokasyon:** `C:\Users\Ramco\Desktop\betting\sportbooks-nuxt`  
> **Framework:** Nuxt 4 + Vue 3 + TypeScript + Nuxt UI 4

---

## 🏗️ PROJE MİMARİSİ (Genel Yapı)

```
SINEK PLATFORM (5 Modül)
│
├── match-distributer/      # Maç verisi çekme (Cron)
├── matcs/                  # Maç verisi çekme (BullMQ Worker)
├── sinek-api/              # Ana Backend API (Business Logic)
├── sportbooks/             # Eski Next.js Frontend (Legacy)
└── sportbooks-nuxt/        # ✅ AKTİF Frontend (Sen buradasın)
    ├── app/                # Ana uygulama kodu
    ├── server/             # Nuxt Server (API Routes)
    └── .nuxt/              # Build output
```

**Senin projen:** `sportbooks-nuxt` - Kullanıcıların gördüğü arayüz. `sinek-api` ile haberleşir.

---

## 👤 KULLANICI HİYERARŞİSİ (5 Rol)

### Rol Ağacı:

```
SUPER ADMIN (Nuxt'ta tanımlı)
│
├── Admin oluşturur (sadece kullanıcı açar, kategori yönetemez)
├── Main Dealer oluşturur
├── Kategori/Spor/Lig yönetir
└── Tüm sistem ayarlarına erişir

ADMIN (API'de - Agent/Main Dealer olarak da geçer)
│
├── Main Dealer (Agent) açar - KREDI tipi
├── Kredi tanımlar (sistemden, kendi bakiyesinden düşmez)
├── Kendi Agent'ından Main Dealer'lara bakiye transfer eder
└── Tüm kullanıcıları görebilir

MAIN DEALER (Agent - KREDI tipi)
│
├── Sub Dealer açar - MONEY tipi
├── Kendi kredisinden Sub Dealer'lara bakiye transfer eder
├── Bahis kuralları belirler (kendi altı için)
├── Oran ayarlamaları yapar
└── Sadece kendi ağacını görür

SUB DEALER (MONEY tipi)
│
├── User (Player) açar - MONEY tipi
├── Kendi MONEY'sinden User'lara bakiye transfer eder
├── Sınırlı kurallar belirler
└── Sadece kendi User'larını görür

USER / PLAYER (MONEY tipi)
│
├── Bahis yapar (Kupon oluşturur)
├── Kendi kuponlarını görür
├── Bakiye görüntüler
└── Kimseyi açamaz
```

### Rol Yetki Özeti:

| Rol | Kimi Açar | Bakiye Tipi | Kategori Yönetimi | Bakiye Transferi |
|-----|-----------|-------------|-------------------|------------------|
| **Super Admin** | Admin, Main Dealer | Agent (CREDIT) | ✅ Evet | Agent üzerinden |
| **Admin** | Main Dealer | Agent (CREDIT) | ❌ Hayır | Agent üzerinden |
| **Main Dealer** | Sub Dealer | CREDIT | ❌ Hayır | Kendi kredisinden |
| **Sub Dealer** | User | MONEY | ❌ Hayır | Kendi MONEY'sinden |
| **User** | ❌ Yok | MONEY | ❌ Hayır | ❌ Yok |

---

## 💰 BAKİYE / KREDİ MANTIĞI (Kritik!)

### Bakiye Tipleri:

```typescript
type BalanceType = 'NONE' | 'CREDIT' | 'MONEY' | 'CASH';

// Admin: NONE - Bakiye yok, sadece kredi tanımlar
// Agent/Main Dealer: CREDIT - Kredi tipi, dağıtım yapar
// Sub Dealer: MONEY - Nakit tipi
// User: MONEY - Nakit tipi
```

### Kullanıcı Açma (Bakiye Tanımlama):

```
Durum: Kullanıcı açarken bakiye tanımlanabilir AMA açanın bakiyesinden DÜŞMEZ!

Admin → Main Dealer açar (Kredi: 50.000)
  └─ Admin'in bakiyesi: DEĞİŞMEZ (sistemden tanımlanır)
  └─ Main Dealer Kredisi: 50.000

Main Dealer → Sub Dealer açar (Money: 10.000)
  └─ Main Dealer Kredisi: DEĞİŞMEZ
  └─ Sub Dealer Money: 10.000

Sub Dealer → User açar (Money: 1.000)
  └─ Sub Dealer Money: DEĞİŞMEZ
  └─ User Money: 1.000
```

### Bakiye Transferi (Sonradan Ekleme/Çekme):

```
1️⃣ Admin işlem yaparken:
   Admin'in AGENT'ı (Main Dealer) üzerinden işlem yapar!
   
   Admin → Main Dealer'a ekle: 10.000
   └─ Admin'in Agent Kredisi: 100.000 → 90.000 (DÜŞER)
   └─ Main Dealer Kredisi: 50.000 → 60.000 (ARTAR)
   
   Admin ← Main Dealer'dan çek: 5.000
   └─ Main Dealer Kredisi: 60.000 → 55.000 (DÜŞER)
   └─ Admin'in Agent Kredisi: 90.000 → 95.000 (ARTAR)

2️⃣ Main Dealer → Sub Dealer:
   Main Dealer Kredisi: 55.000 → 50.000 (DÜŞER)
   Sub Dealer Money: 10.000 → 15.000 (ARTAR)

3️⃣ Sub Dealer → User:
   Sub Dealer Money: 15.000 → 14.000 (DÜŞER)
   User Money: 1.000 → 2.000 (ARTAR)
```

### Önemli Kurallar:

- **Admin'in kendi Agent'ı vardır** - Tüm bakiye işlemlerini bu agent üzerinden yapar
- **CREDIT → MONEY** dönüşümü: Main Dealer'dan Sub Dealer'a transferde olur
- **MONEY → CREDIT** dönüşümü: Olmaz, çekme işleminde Main Dealer kredisine eklenir
- **Kullanıcı açarken**: Bakiye tanımlanabilir ama açandan düşmez
- **Transfer yaparken**: Kaynak bakiyeden düşer, hedefe eklenir

---

## 🔐 KİMLİK DOĞRULAMA (Auth)

### Giriş Yöntemleri:

```typescript
// 1. Passkey / WebAuthn (Modern)
// - FIDO2 desteği
// - @simplewebauthn/browser kullanılır
// - Biyometrik veya güvenlik anahtarı

// 2. Şifre (Geleneksel)
// - Session-based authentication
// - Cookie'de session token
// - Argon2 ile şifre hashleme
```

### Auth Akışı:

```
1. Kullanıcı giriş formunu doldurur (Nuxt)
   ↓
2. Nuxt Server API → sinek-api'ye istek
   POST /api/authNew/credentials/signIn
   ↓
3. sinek-api doğrular, session oluşturur
   ↓
4. Cookie set edilir (session token)
   ↓
5. Socket.IO bağlantısı açılır (real-time)
   ↓
6. Rol bazlı yönlendirme
   - Super Admin/Admin: /panel/admin/*
   - Main Dealer: /panel/dealer/*
   - Sub Dealer: /panel/sub-dealer/*
   - User: /sportsbook
```

### Session Yapısı:

```typescript
interface Session {
  id: string;
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'DEALER' | 'SUB_DEALER' | 'USER';
  username: string;
  token: string;
  expiresAt: Date;
}
```

---

## 🎨 UI/UX (Nuxt UI 4)

### Kullanılan Bileşenler:

```vue
<!-- Temel UI Bileşenleri (Nuxt UI 4) -->
<UCard />           <!-- Kart container -->
<UButton />         <!-- Buton -->
<UInput />          <!-- Input alanı -->
<UForm />           <!-- Form wrapper -->
<UFormField />      <!-- Form alanı -->
<UTable />          <!-- Tablo -->
<UModal />          <!-- Modal dialog -->
<UDrawer />         <!-- Drawer (mobil) -->
<USeparator />      <!-- Ayraç -->
<UBadge />          <!-- Rozet -->
<UTabs />           <!-- Sekmeler -->
<USelect />         <!-- Select dropdown -->
<USwitch />         <!-- Toggle switch -->
<UTooltip />        <!-- Tooltip -->
<UDropdown />       <!-- Dropdown menu -->
```

### Layout Yapısı:

```
app/layouts/
├── default.vue         # Varsayılan layout
├── panel.vue           # Admin/Dealer panel layout (sidebar + header)
├── sportsbook.vue      # Sportsbook layout (betting arayüzü)
└── games.vue           # Oyunlar layout

Panel Layout Yapısı:
┌─────────────────────────────────────────┐
│  Header (AppHeader)                     │
│  - Logo | Menü | Bildirim | User Menu  │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │     Content Area             │
│ (Panel)  │     - Sayfa içeriği          │
│          │     - Data tables            │
│          │     - Forms                  │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Responsive Tasarım:

```
Desktop (>1024px):
- Sidebar açık, tam genişlik
- Tablo tüm kolonlar görünür

Tablet (768-1024px):
- Sidebar collapsible
- Tablo yatay scroll

Mobile (<768px):
- Drawer (slide-over) menü
- Bottom navigation
- Kart bazlı liste görünümü
```

---

## 📁 SAYFA YAPISI (Routing)

```
app/pages/
│
├── index.vue                    # Ana sayfa (redirect)
├── sign-in.vue                  # Giriş sayfası
│
├── panel/                       # Panel sayfaları (protected)
│   ├── index.vue                # Dashboard
│   ├── main-dealers.vue         # Main Dealer listesi
│   ├── create-main-dealer.vue   # Main Dealer oluştur
│   ├── sub-dealers.vue          # Sub Dealer listesi
│   ├── agents.vue               # Agent listesi
│   ├── players.vue              # Oyuncu listesi
│   ├── active-coupons.vue       # Aktif kuponlar
│   ├── coupon-list.vue          # Kupon listesi
│   ├── coupon-trash.vue         # Silinen kuponlar
│   ├── account-statement.vue    # Hesap ekstresi
│   ├── betting-rules.vue        # Bahis kuralları
│   ├── change-password.vue      # Şifre değiştir
│   ├── change-passwords.vue     # Toplu şifre değiştir
│   ├── check-balance.vue        # Bakiye kontrol
│   ├── credit-consumption.vue   # Kredi tüketim raporu
│   ├── credit-reports.vue       # Kredi raporları
│   ├── dealers-balance.vue      # Dealer bakiyeleri
│   ├── dealers-credits.vue      # Dealer kredileri
│   ├── manage-sports.vue        # Spor yönetimi
│   ├── manage-leagues.vue       # Lig yönetimi
│   ├── manage-countries.vue     # Ülke yönetimi
│   ├── manage-categories.vue    # Kategori yönetimi
│   ├── manage-betting-groups.vue # Bahis grubu yönetimi
│   ├── live-matches.vue         # Canlı maçlar
│   ├── live-match-general-settings.vue # Canlı maç ayarları
│   ├── matches-list.vue         # Maç listesi
│   ├── messages.vue             # Mesajlar
│   ├── settings.vue             # Ayarlar
│   └── transaction-history.vue  # İşlem geçmişi
│
├── sportsbook/                  # Sportsbook (bahis)
│   ├── index.vue                # Pre-match
│   ├── live.vue                 # Canlı bahis
│   ├── starting-soon.vue        # Yaklaşan maçlar
│   ├── bet-history.vue          # Bahis geçmişi
│   └── [sport].vue              # Spor detay sayfası
│
├── prematch/                    # Prematch sayfası
│   └── index.vue
│
├── live/                        # Canlı sayfası
│   ├── index.vue
│   └── live-2.vue               # Alternatif canlı görünüm
│
├── games/                       # Oyunlar
│   └── index.vue
│
└── play/                        # Oyun oyna
    └── [game].vue
```

### Route Middleware:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useUserStore()
  
  // Giriş kontrolü
  if (!user && to.path !== '/sign-in') {
    return navigateTo('/sign-in')
  }
  
  // Rol bazlı erişim kontrolü
  const role = user?.role
  
  if (to.path.startsWith('/panel/admin') && !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return navigateTo('/panel') // Yetkisiz
  }
  
  if (to.path.startsWith('/panel') && role === 'USER') {
    return navigateTo('/sportsbook') // User panel'e giremez
  }
})
```

---

## 🔄 STATE MANAGEMENT (Pinia)

### Store Yapısı:

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<Session | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role)
  
  // Actions
  async function login(credentials: LoginCredentials) {
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    user.value = result.user
    return result
  }
  
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/sign-in')
  }
  
  return { user, isAuthenticated, role, login, logout }
})

// stores/betslip.ts
export const useBetslipStore = defineStore('betslip', () => {
  // State
  const selections = ref<Selection[]>([])
  const stake = ref<number>(0)
  const couponType = ref<'SINGLE' | 'COMBI' | 'SYSTEM'>('SINGLE')
  
  // Getters
  const totalOdds = computed(() => 
    selections.value.reduce((acc, s) => acc * s.odds, 1)
  )
  const potentialWin = computed(() => stake.value * totalOdds.value)
  
  // Actions
  function addSelection(match: Match, market: Market, selection: Selection) {
    // Aynı maça çift seçim kontrolü
    // Max selection limit kontrolü
    selections.value.push({ match, market, selection })
  }
  
  function removeSelection(id: string) {
    selections.value = selections.value.filter(s => s.id !== id)
  }
  
  async function placeCoupon() {
    const coupon = {
      selections: selections.value,
      stake: stake.value,
      type: couponType.value
    }
    return await $fetch('/api/coupons', {
      method: 'POST',
      body: coupon
    })
  }
  
  return { selections, stake, couponType, totalOdds, potentialWin, addSelection, removeSelection, placeCoupon }
})

// stores/matches.ts
export const useMatchesStore = defineStore('matches', () => {
  const liveMatches = ref<Match[]>([])
  const prematchMatches = ref<Match[]>([])
  const selectedSport = ref<string>('football')
  
  async function fetchLiveMatches() {
    liveMatches.value = await $fetch('/api/matches/live')
  }
  
  async function fetchPrematchMatches() {
    prematchMatches.value = await $fetch('/api/matches/prematch', {
      params: { sport: selectedSport.value }
    })
  }
  
  return { liveMatches, prematchMatches, selectedSport, fetchLiveMatches, fetchPrematchMatches }
})
```

---

## 🔌 API İLETİŞİMİ

### Server Routes (Nuxt Server):

```typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)
  
  // sinek-api'ye proxy
  const result = await $fetch(`${useRuntimeConfig().apiBase}/authNew/credentials/signIn`, {
    method: 'POST',
    body
  })
  
  // Session cookie set et
  setCookie(event, 'auth-session-token', result.sessionToken, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 7 gün
  })
  
  return result
})

// server/api/users/index.post.ts (Kullanıcı açma)
export default defineEventHandler(async (event) => {
  const session = requireAuth(event) // Auth middleware
  
  // Player kullanıcı açamaz
  if (session.role === 'PLAYER') {
    throw createError({ statusCode: 403, message: 'Insufficient permissions' })
  }
  
  const body = await readValidatedBody(event, createUserSchema.parse)
  
  // Rol kontrolü - Sadece belirli roller açılabilir
  const allowedChildRole = getCreatableChildRole(session.role)
  if (!allowedChildRole || body.role !== allowedChildRole) {
    throw createError({ 
      statusCode: 403, 
      message: `You can only create ${allowedChildRole} users` 
    })
  }
  
  const passwordHash = await hashPassword(body.password)
  const db = useDb()
  
  const [newUser] = await db.insert(users).values({
    username: body.username,
    email: body.email,
    passwordHash,
    role: body.role,
    parentId: session.userId, // Açan kişi parent olur
    status: 'ACTIVE',
    walletType: body.walletType || 'NONE'
  }).returning()
  
  // Closure table'a ekle (ağaç yapısı)
  await addUserToTree(newUser.id, session.userId)
  
  return newUser
})

// server/api/balance/transfer.post.ts (Bakiye transferi)
export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readBody(event)
  
  // Hiyerarşik kontrol: Sadece kendi altındaki kullanıcılara transfer
  const isDescendant = await checkIsDescendant(session.userId, body.targetUserId)
  if (!isDescendant) {
    throw createError({ statusCode: 403, message: 'Not your subordinate' })
  }
  
  // Bakiye tipi kontrolü
  const sourceUser = await getUserById(session.userId)
  const targetUser = await getUserById(body.targetUserId)
  
  // CREDIT sadece CREDIT'e veya MONEY'ye transfer edilebilir
  // MONEY sadece MONEY'ye transfer edilebilir
  
  // Transfer işlemi
  await executeTransfer({
    fromUserId: session.userId,
    toUserId: body.targetUserId,
    amount: body.amount,
    type: body.type // 'ADD' | 'WITHDRAW'
  })
  
  return { success: true }
})
```

### Client-Side Fetching:

```typescript
// Composable: composables/useUsers.ts
export function useUsers() {
  const { data: users, refresh } = useFetch('/api/users', {
    key: 'users-list'
  })
  
  async function createUser(userData: CreateUserInput) {
    return await $fetch('/api/users', {
      method: 'POST',
      body: userData
    })
  }
  
  return { users, refresh, createUser }
}

// Composable: composables/useBalance.ts
export function useBalance() {
  async function transferBalance(payload: TransferPayload) {
    return await $fetch('/api/balance/transfer', {
      method: 'POST',
      body: payload
    })
  }
  
  async function getBalanceHistory(userId: string) {
    return await $fetch(`/api/balance/history/${userId}`)
  }
  
  return { transferBalance, getBalanceHistory }
}
```

---

## 🌳 HİYERARŞİK ERİŞİM KONTROLÜ (Closure Table)

```typescript
// server/utils/tree.ts

// Kullanıcı ağaca ekleme
export async function addUserToTree(userId: string, parentId: string | null) {
  const db = useDb()
  
  // 1. Kendine referans (depth 0)
  await db.insert(userTree).values({
    ancestorId: userId,
    descendantId: userId,
    depth: 0
  })
  
  // 2. Parent'in ancestor zincirini kopyala
  if (parentId) {
    await db.execute(sql`
      INSERT INTO user_tree (ancestor_id, descendant_id, depth)
      SELECT ancestor_id, ${userId}, depth + 1
      FROM user_tree
      WHERE descendant_id = ${parentId}
    `)
  }
}

// Torun kontrolü (X, Y'nin atası mı?)
export async function isDescendant(ancestorId: string, candidateId: string) {
  const db = useDb()
  const result = await db.select()
    .from(userTree)
    .where(and(
      eq(userTree.ancestorId, ancestorId),
      eq(userTree.descendantId, candidateId)
    ))
    .limit(1)
  
  return result.length > 0
}

// Tüm alt kullanıcıları getir
export async function getDescendantIds(ancestorId: string) {
  const db = useDb()
  const rows = await db.select({ descendantId: userTree.descendantId })
    .from(userTree)
    .where(eq(userTree.ancestorId, ancestorId))
  
  return rows.map(r => r.descendantId)
}

// Doğrudan çocukları getir (depth = 1)
export async function getDirectChildIds(parentId: string) {
  const db = useDb()
  const rows = await db.select({ descendantId: userTree.descendantId })
    .from(userTree)
    .where(and(
      eq(userTree.ancestorId, parentId),
      eq(userTree.depth, 1)
    ))
  
  return rows.map(r => r.descendantId)
}
```

---

## 🎯 SPORTSBOOK ÖZELLİKLERİ

### Betslip (Bahis Sepeti):

```vue
<!-- components/sportsbook/Betslip.vue -->
<template>
  <div class="betslip">
    <!-- Seçimler -->
    <div v-for="selection in selections" :key="selection.id" class="selection">
      <div class="match-info">
        <span class="teams">{{ selection.match.team1 }} vs {{ selection.match.team2 }}</span>
        <span class="market">{{ selection.market.name }}</span>
        <span class="selection">{{ selection.selection.name }}</span>
      </div>
      <div class="odds">{{ selection.odds }}</div>
      <UButton icon="i-lucide-x" @click="removeSelection(selection.id)" />
    </div>
    
    <!-- Kupon tipi -->
    <URadioGroup v-model="couponType" :options="[
      { label: 'Tekli', value: 'SINGLE' },
      { label: 'Kombi', value: 'COMBI' },
      { label: 'Sistem', value: 'SYSTEM' }
    ]" />
    
    <!-- Tutar -->
    <UInput v-model="stake" type="number" placeholder="Tutar girin" />
    
    <!-- Özet -->
    <div class="summary">
      <div>Toplam Oran: {{ totalOdds }}</div>
      <div>Potansiyel Kazanç: {{ potentialWin }}</div>
    </div>
    
    <!-- Oyna butonu -->
    <UButton color="primary" block @click="placeCoupon" :loading="isPlacing">
      Kupon Yap
    </UButton>
  </div>
</template>
```

### Maç Kartı:

```vue
<!-- components/sportsbook/EventCard.vue -->
<template>
  <UCard class="event-card">
    <div class="header">
      <UBadge>{{ match.league }}</UBadge>
      <span class="time">{{ formatTime(match.startTime) }}</span>
    </div>
    
    <div class="teams">
      <div class="team">{{ match.team1 }}</div>
      <div class="score" v-if="match.isLive">{{ match.score }}</div>
      <div class="team">{{ match.team2 }}</div>
    </div>
    
    <div class="markets">
      <div v-for="market in match.markets" :key="market.id" class="market-row">
        <MarketButton
          v-for="selection in market.selections"
          :key="selection.id"
          :selection="selection"
          :is-selected="isSelected(match.id, market.id, selection.id)"
          @click="toggleSelection(match, market, selection)"
        />
      </div>
    </div>
  </UCard>
</template>
```

### Canlı Bahis (Real-time):

```typescript
// Real-time maç güncellemeleri (Socket.IO)
const socket = io('wss://api.sinek.com')

// Maç güncellemelerini dinle
socket.on('match:update', (data: MatchUpdate) => {
  const matchStore = useMatchesStore()
  matchStore.updateMatch(data.matchId, data)
})

// Oran değişikliklerini dinle
socket.on('odds:change', (data: OddsChange) => {
  const betslipStore = useBetslipStore()
  
  // Sepetteki seçim etkilendiyse bildirim göster
  const affectedSelection = betslipStore.selections.find(
    s => s.selection.id === data.selectionId
  )
  
  if (affectedSelection) {
    toast.info(`${affectedSelection.match.team1} - Oran değişti: ${data.oldOdds} → ${data.newOdds}`)
  }
})

// Maç durumu değişikliği
socket.on('match:status', (data: StatusChange) => {
  if (data.status === 'SUSPENDED') {
    toast.warning('Maç askıya alındı')
  }
})
```

---

## 🛡️ GÜVENLİK KURALLARI

### Input Validasyonu:

```typescript
// server/utils/validation.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
  email: z.string().email().optional(),
  role: z.enum(['AGENT', 'DEALER', 'SUB_DEALER', 'USER']),
  walletType: z.enum(['CREDIT', 'MONEY', 'NONE']).optional(),
  initialBalance: z.number().min(0).optional()
})

export const transferSchema = z.object({
  targetUserId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['ADD', 'WITHDRAW']),
  description: z.string().max(255).optional()
})
```

### CSRF & XSS Koruması:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", 'https://api.sinek.com']
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff'
    }
  },
  
  // Auth cookie ayarları
  auth: {
    sessionCookie: {
      name: 'auth-session-token',
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    }
  }
})
```

### Rate Limiting:

```typescript
// server/middleware/rate-limit.ts
import { RateLimiterRedis } from 'rate-limiter-flexible'

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit',
  points: 10, // 10 istek
  duration: 1 // 1 saniyede
})

export default defineEventHandler(async (event) => {
  try {
    await limiter.consume(getRequestIP(event) || 'anonymous')
  } catch {
    throw createError({
      statusCode: 429,
      message: 'Too many requests'
    })
  }
})
```

---

## 📝 TYPESCRIPT TİPLERİ

```typescript
// types/index.ts

// Kullanıcı Tipleri
export interface User {
  id: string
  username: string
  email?: string
  role: UserRole
  parentId: string | null
  balance: number
  walletType: WalletType
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'DEALER' | 'SUB_DEALER' | 'USER'
export type WalletType = 'NONE' | 'CREDIT' | 'MONEY' | 'CASH'

// Session
export interface Session {
  id: string
  userId: string
  username: string
  role: UserRole
  token: string
  expiresAt: Date
}

// Maç Tipleri
export interface Match {
  id: string
  sportId: string
  leagueId: string
  team1: string
  team2: string
  startTime: Date
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'SUSPENDED'
  score?: {
    team1: number
    team2: number
  }
  markets: Market[]
  isFavorite?: boolean
}

export interface Market {
  id: string
  name: string
  type: string
  selections: Selection[]
}

export interface Selection {
  id: string
  name: string
  odds: number
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED'
}

// Kupon Tipleri
export interface Coupon {
  id: string
  userId: string
  selections: CouponSelection[]
  stake: number
  type: 'SINGLE' | 'COMBI' | 'SYSTEM'
  totalOdds: number
  potentialWin: number
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'CASHED_OUT'
  createdAt: Date
}

export interface CouponSelection {
  id: string
  matchId: string
  match: Match
  marketId: string
  marketName: string
  selectionId: string
  selectionName: string
  odds: number
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID'
}

// Bakiye Transferi
export interface BalanceTransfer {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: 'ADD' | 'WITHDRAW' | 'TRANSFER'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  description?: string
  createdAt: Date
}

// Hiyerarşi (Closure Table)
export interface UserTree {
  ancestorId: string
  descendantId: string
  depth: number
}
```

---

## 🚀 GELİŞTİRME KURALLARI

### 1. Kod Organizasyonu:

```
app/
├── components/           # Vue bileşenleri
│   ├── common/          # Ortak bileşenler
│   ├── sportsbook/      # Bahis bileşenleri
│   ├── header/          # Header bileşenleri
│   ├── sidebar/         # Sidebar bileşenleri
│   └── admin/           # Admin panel bileşenleri
├── layouts/             # Layoutlar
├── pages/               # Sayfalar
├── composables/         # Composable'lar
├── stores/              # Pinia stores
├── types/               # TypeScript tipleri
├── utils/               # Yardımcı fonksiyonlar
└── assets/              # CSS, images, fonts

server/
├── api/                 # Server API routes
├── database/            # Drizzle schema & migrations
├── utils/               # Server utils (auth, tree, validation)
└── middleware/          # Server middleware
```

### 2. Naming Conventions:

```typescript
// Bileşenler: PascalCase
EventCard.vue
UserAvatar.vue
BetHistoryTable.vue

// Composable'lar: camelCase, use* prefix
useUser.ts
useBalance.ts
useMatches.ts

// Store'lar: camelCase, *Store suffix
userStore.ts
betslipStore.ts

// Types: PascalCase, interface önerilir
interface UserConfig { }
type UserRole = 'ADMIN' | 'USER'

// Utils: camelCase
formatCurrency.ts
calculateOdds.ts
validateCoupon.ts
```

### 3. Sayfa Yapısı Standardı:

```vue
<script setup lang="ts">
// 1. Meta tanımları
definePageMeta({
  layout: 'panel',
  middleware: ['auth', 'role-check'],
  roles: ['ADMIN', 'DEALER']
})

// 2. Imports
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

// 3. Stores
const userStore = useUserStore()

// 4. State
const loading = ref(false)
const formData = reactive({
  username: '',
  password: ''
})

// 5. Computed
const canSubmit = computed(() => formData.username && formData.password)

// 6. Methods
async function handleSubmit() {
  loading.value = true
  try {
    await createUser(formData)
    toast.success(t('success.user_created'))
    navigateTo(localePath('/panel/users'))
  } catch (error) {
    toast.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('page.title') }}</h1>
    
    <UCard>
      <UForm :state="formData" @submit="handleSubmit">
        <!-- Form content -->
      </UForm>
    </UCard>
  </div>
</template>
```

### 4. API İsteği Standardı:

```typescript
// HATA YÖNETİMİ
async function fetchData() {
  try {
    const data = await $fetch('/api/data')
    return data
  } catch (error: any) {
    // 401: Unauthorized → Login'e yönlendir
    if (error.statusCode === 401) {
      navigateTo('/sign-in')
      return
    }
    
    // 403: Forbidden → Yetki hatası
    if (error.statusCode === 403) {
      toast.error('Bu işlem için yetkiniz yok')
      return
    }
    
    // 404: Not Found
    if (error.statusCode === 404) {
      showError({ statusCode: 404, message: 'Sayfa bulunamadı' })
      return
    }
    
    // Diğer hatalar
    toast.error(error.message || 'Bir hata oluştu')
    throw error
  }
}
```

### 5. Form Validasyonu:

```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(3, 'En az 3 karakter').max(50),
  password: z.string().min(8, 'En az 8 karakter'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  username: undefined,
  password: undefined,
  confirmPassword: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField label="Kullanıcı Adı" name="username">
      <UInput v-model="state.username" />
    </UFormField>
    
    <UFormField label="Şifre" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>
    
    <UButton type="submit">Gönder</UButton>
  </UForm>
</template>
```

---

## 🎨 UI/UX STANDARTLARI

### Renk Semantikleri (Nuxt UI):

```
primary    → Ana aksiyon butonları, linkler
secondary  → İkincil aksiyonlar
success    → Başarılı işlemler, kazanan kuponlar
warning    → Uyarılar, askıya alınmış maçlar
error      → Hatalar, kayıp kuponlar
info       → Bilgilendirme, açıklamalar
neutral    → Pasif durumlar, kenarlıklar
```

### Responsive Breakpoints:

```css
/* Tailwind default breakpoints */
sm: 640px   /* Mobil yatay */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Geniş ekran */
2xl: 1536px /* Ultra geniş */
```

### Loading & Empty States:

```vue
<!-- Loading -->
<USkeleton v-if="pending" class="h-32" />

<!-- Empty State -->
<EmptyStateIllustration
  v-else-if="!data?.length"
  :title="t('no_data.title')"
  :description="t('no_data.description')"
  icon="i-lucide-inbox"
/>

<!-- Data -->
<div v-else>
  <!-- Content -->
</div>
```

---

## 🧪 TEST & DEBUG

### Geliştirme Komutları:

```bash
# Development server
npm run dev

# Production build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Database (Drizzle)
npm run db:generate    # Migration generate
npm run db:migrate     # Migration çalıştır
npm run db:studio      # Drizzle Studio aç
npm run db:seed        # Seed data yükle
```

### Debug İpuçları:

```typescript
// Server-side debug
export default defineEventHandler(async (event) => {
  console.log('Request:', {
    path: event.path,
    method: event.method,
    headers: getRequestHeaders(event),
    body: await readBody(event)
  })
})

// Client-side debug
const { data, error, pending } = useFetch('/api/data', {
  onRequest({ request, options }) {
    console.log('Request:', request, options)
  },
  onRequestError({ request, options, error }) {
    console.error('Request Error:', error)
  },
  onResponse({ request, response, options }) {
    console.log('Response:', response._data)
  }
})
```

---

## ⚠️ SIK KARŞILAŞILAN HATALAR

### 1. "Insufficient permissions" (403)
- **Neden:** Kullanıcının rolü bu işlem için yetkili değil
- **Çözüm:** Rol kontrolü yap, gerekiyorsa Super Admin'e yönlendir

### 2. "Not your subordinate" (403)
- **Neden:** Hedef kullanıcı, işlem yapanın hiyerarşisinde değil
- **Çözüm:** `isDescendant()` kontrolü ekle, yanlış kullanıcı seçilmemiş mi kontrol et

### 3. "Insufficient balance" (400)
- **Neden:** Transfer için yeterli bakiye/kredi yok
- **Çözüm:** Transfer öncesi bakiye kontrolü göster

### 4. "Username taken" (409)
- **Neden:** Kullanıcı adı zaten kullanımda
- **Çözüm:** Input'a realtime validation ekle

### 5. Session Timeout
- **Neden:** Oturum süresi dolmuş
- **Çözüm:** Auto-refresh token veya redirect to login

---

## 📚 ÖNEMLİ LİNKLER & REFERANSLAR

- **Nuxt Docs:** https://nuxt.com/docs
- **Nuxt UI 4:** https://ui.nuxt.com
- **Vue 3:** https://vuejs.org
- **Drizzle ORM:** https://orm.drizzle.team
- **sinek-api:** `C:\Users\Ramco\Desktop\betting\sinek-api` (Backend referansı)

---

## 💡 İPUÇLARI

1. **Hiyerarşi işlemlerinde** her zaman `isDescendant()` kontrolü yap
2. **Bakiye transferlerinde** transaction kullan (atomic işlem)
3. **Form'larda** Zod validasyonu kullan, server-side da tekrar validate et
4. **Real-time verilerde** optimistic UI kullan, hata durumunda geri al
5. **Liste sayfalarında** pagination ve virtual scrolling kullan (performans)
6. **Error handling** her zaman kullanıcı dostu mesajlar göster
7. **i18n** için tüm metinleri `t()` fonksiyonu ile çevir
8. **TypeScript** tiplerini eksiksiz tanımla, `any` kullanma

---

**Bu promp, Sinek Sportsbook Nuxt projesinde çalışırken ihtiyaç duyacağın TÜM bilgileri içerir. Yeni özellik geliştirirken, bug çözerken veya kod review yaparken bu rehberi kullan.**
