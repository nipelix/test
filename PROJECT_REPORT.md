# SPORTBOOKS-NUXT — DETAYLI PROJE RAPORU

**Tarih:** 2026-03-15
**Versiyon:** 1.0
**Commit Sayısı:** 37
**Repository:** https://github.com/nipelix/test.git

---

## 1. GENEL BAKIŞ

| Metrik | Değer |
|--------|-------|
| **Toplam Kod Satırı** | 21,573 |
| App (Vue + TS) | 14,896 satır |
| Server (TS) | 6,677 satır |
| **Toplam Dosya** | ~280+ |
| **Framework** | Nuxt 4.3 + Vue 3 |
| **Backend** | Nitro (built-in) |
| **Veritabanı** | PostgreSQL + Drizzle ORM |
| **Cache** | Redis (ioredis) |
| **Real-time** | Socket.IO + Redis adapter |
| **UI** | Nuxt UI v4 + Tailwind CSS v4 |
| **Auth** | Session-based + WebAuthn Passkey + Argon2 |
| **i18n** | Türkçe (varsayılan) + İngilizce |
| **State** | Pinia |
| **Validation** | Zod |

---

## 2. MİMARİ YAPI

```
sportbooks-nuxt/
├── shared/                          # Frontend + Backend ortak kod
│   ├── types/roles.ts               # Role sistemi (6 rol, hiyerarşi, yetki)
│   ├── types/socket.ts              # WebSocket event tipleri
│   ├── utils/formatters.ts          # formatDate, formatBalance, getCouponStatusColor
│   └── utils/validation.ts          # EMAIL_REGEX
│
├── app/                             # Frontend (Nuxt)
│   ├── pages/                       # 52 sayfa
│   │   ├── panel/                   #   39 panel sayfası (3 dinamik route)
│   │   ├── sportsbook/              #   6 sportsbook sayfası
│   │   └── ...                      #   7 diğer sayfa
│   ├── components/                  # 49 component
│   │   ├── admin/ (21)              #   Panel component'ları
│   │   ├── header/ (7)              #   Header component'ları
│   │   ├── sidebar/ (5)             #   Sidebar component'ları
│   │   ├── sportsbook/ (5)          #   Bahis component'ları
│   │   ├── shared/ (5)              #   Ortak component'lar
│   │   ├── common/ (2)              #   Genel component'lar
│   │   └── footer/ (2)              #   Footer component'ları
│   ├── composables/ (12)            # İş mantığı composable'ları
│   ├── stores/ (3)                  # Pinia store'ları (auth, betslip, table)
│   ├── middleware/ (2)              # Route korumaları (auth.global, panel)
│   └── layouts/ (5)                 # Sayfa layout'ları
│
└── server/                          # Backend (Nitro)
    ├── api/                         # 95+ API endpoint
    │   ├── users/ (7)               #   Kullanıcı CRUD + balance
    │   ├── auth/ (14)               #   Kimlik doğrulama
    │   ├── coupons/ (8)             #   Kupon yönetimi
    │   ├── matches/ (7)             #   Maç yönetimi
    │   ├── wallets/ (6)             #   Cüzdan işlemleri
    │   └── ...                      #   Diğer endpoint'ler
    ├── database/schema/ (25)        # Drizzle ORM tabloları
    ├── utils/ (14)                  # Sunucu utility'leri
    ├── middleware/ (4)              # Rate limit, session, CSRF, security headers
    └── plugins/ (1)                 # Socket.IO server plugin
```

---

## 3. ROL SİSTEMİ

### 3.1 Hiyerarşi

```
SUPER_ADMIN (level: 0)
  └── ADMIN (level: 1)
      └── AGENT (level: 2)
          └── DEALER (level: 3)
              └── SUB_DEALER (level: 4)
                  └── PLAYER (level: 5)
```

### 3.2 Kullanıcı Oluşturma Yetkileri

| Oluşturan | Oluşturabildiği Roller |
|-----------|----------------------|
| SUPER_ADMIN | ADMIN, AGENT, DEALER, SUB_DEALER, PLAYER |
| ADMIN | AGENT, DEALER, SUB_DEALER, PLAYER |
| AGENT | DEALER, SUB_DEALER, PLAYER |
| DEALER | SUB_DEALER, PLAYER |
| SUB_DEALER | PLAYER |

### 3.3 Bakiye Tipleri ve Akış Kuralları

| Rol | Bakiye Tipi | Kim Günceller | Parent Ters İşlem |
|-----|-------------|---------------|-------------------|
| SUPER_ADMIN | NONE | - | - |
| ADMIN | NONE | - | - |
| AGENT | CREDIT | Admin | YOK (admin sınırsız) |
| DEALER | CREDIT | Admin, Agent | EVET (parent varsa) |
| SUB_DEALER | MONEY | Admin, Dealer | YOK (kredi kupon oluşturmada düşer) |
| PLAYER | MONEY | Admin, Dealer, SubDealer | DAİMA (parent zorunlu) |

### 3.4 Kredi Akışı

```
Admin → Agent: Direkt kredi ekleme (ters işlem yok)
Agent → Dealer: Kredi ekleme + Agent'tan düşürme (ters işlem)
Dealer → SubDealer: Para ekleme (ters işlem yok)
SubDealer → Player: Para ekleme + SubDealer'dan düşürme (ters işlem)

Kupon oluşturulduğunda:
  Player MONEY -= stake
  Dealer CREDIT -= creditTier.credits_deducted
```

---

## 4. SAYFA ENVANTER

### 4.1 Panel Sayfaları (39 sayfa)

**Dashboard:**
- `panel/index.vue` — 6 stat card, top 10 maç, risk analizi (rol bazlı profit)

**Kullanıcı Yönetimi:**
- `panel/admins.vue` — Admin listesi (SUPER_ADMIN only)
- `panel/agents.vue` — Agent listesi + credit modal
- `panel/main-dealers.vue` — Dealer listesi + credit modal
- `panel/sub-dealers.vue` — SubDealer listesi + balance modal
- `panel/players.vue` — Player listesi + balance modal

**Kupon Yönetimi:**
- `panel/coupon-list.vue` — Tüm kuponlar, bulk actions (cancel/delete/won/lost)
- `panel/active-coupons.vue` — Aktif kuponlar (ONGOING filter)
- `panel/coupon-trash.vue` — İptal edilen kuponlar (CANCELLED filter)
- `panel/coupon-deletion.vue` — Toplu kupon silme (şifre onayı)
- `panel/account-statement.vue` — Hesap özeti + stat cards

**Bahis Kuralları:**
- `panel/betting-rules.vue` — Sistem kuralları (Limits/Odds/Features tabs)
- `panel/dealer-betting-rules.vue` — Dealer bazlı spor kuralları

**Spor Yönetimi:**
- `panel/manage-sports.vue` — Spor CRUD + bulk operations
- `panel/manage-countries.vue` — Ülke CRUD + bulk operations
- `panel/manage-leagues.vue` — Lig CRUD + bulk operations
- `panel/manage-categories.vue` — Market types + selection templates (dual-column)
- `panel/manage-betting-groups.vue` — Betting group CRUD
- `panel/manage-betting-markets.vue` — Market CRUD + provider mapping
- `panel/manage-providers.vue` — Provider CRUD
- `panel/manage-provider-mappings.vue` — Provider mapping yönetimi
- `panel/betting-markets-suspensions.vue` — Market/selection suspension toggle

**Maç Yönetimi:**
- `panel/matches-list.vue` — Tüm maçlar
- `panel/live-matches.vue` — Canlı/yaklaşan maçlar (tab)
- `panel/live-match-general-settings.vue` — Canlı maç ayarları
- `panel/matches-feed/[feed].vue` — Feed bazlı maç listesi (live/line)
- `panel/leagues/[feed].vue` — Feed bazlı lig toggle (live/line)
- `panel/markets/[type].vue` — Feed bazlı market grupları (live/line)

**Kredi Yönetimi:**
- `panel/credit-consumption.vue` — Credit tiers + default ayarlar
- `panel/credit-reports.vue` — Kredi raporları (custom/weekly/monthly/yearly)
- `panel/dealers-credits.vue` — Dealer kredi yönetimi
- `panel/dealers-balance.vue` — SubDealer bakiye listesi
- `panel/check-balance.vue` — Bakiye kontrol (3 stat card)

**Hesap:**
- `panel/change-password.vue` — Şifre değiştirme (API entegre)
- `panel/change-passwords.vue` — Diğer kullanıcı şifre değiştirme
- `panel/settings.vue` — Tema, renk, dil ayarları (persist)
- `panel/messages.vue` — Mesajlaşma (conversation list + chat)
- `panel/transaction-history.vue` — İşlem geçmişi
- `panel/admin-logs.vue` — Admin aktivite logları

### 4.2 Sportsbook Sayfaları (6 sayfa)

- `sportsbook/index.vue` — Ana sayfa (match feed)
- `sportsbook/live.vue` — Canlı bahisler
- `sportsbook/starting-soon.vue` — Yakında başlayacak maçlar
- `sportsbook/bet-history.vue` — Bahis geçmişi
- `sportsbook/[sport].vue` — Spor detay
- `sportsbook/[sport]/[league].vue` — Lig detay (maç listesi)

### 4.3 Diğer Sayfalar (7 sayfa)

- `index.vue` — Root (→ /sportsbook redirect)
- `sign-in.vue` — Giriş sayfası
- `games/index.vue` — Oyunlar
- `live/index.vue` — Canlı (alternatif)
- `live/live-2.vue` — Canlı v2
- `prematch/index.vue` — Prematch
- `play/[game].vue` — Oyun detay

---

## 5. SAYFA ERİŞİM MATRİSİ

| Sayfa | SA | ADM | AGT | DLR | SD | PLR |
|-------|:--:|:---:|:---:|:---:|:--:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admins | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Agents | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Main Dealers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Sub Dealers | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Players | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Betting Rules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Sports/Countries/Leagues | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Categories/Markets | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Suspensions | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Coupon List | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Active Coupons | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Coupon Deletion | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Credit Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Credit Consumption | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Transaction History | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Feed Sayfaları (leagues/matches/markets) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 6. COMPOSABLE MİMARİSİ

| Composable | Kullanıldığı Yer | Temel İşlev |
|------------|-----------------|-------------|
| `useUserList` | agents, dealers, sub-dealers, players, dealers-balance | Rol bazlı kullanıcı listesi, pagination, selection, search (debounced) |
| `useCouponList` | coupon-list, active-coupons, coupon-trash, account-statement | Kupon listesi, stats, status filtreleme, bulk actions |
| `useEntityList` | sports, countries, leagues, betting-groups, matches, transactions | Genel CRUD listesi, bulkPatch, bulkDelete |
| `useFormValidation` | UserCreateModal, UserEditModal, change-password, change-passwords | Form validasyon (errors, visibleErrors, touch, submit) |
| `useParentSelection` | UserCreateModal, UserEditModal | Cascade parent dropdown (admin→agent→dealer→subdealer) |
| `useRoleGuard` | Panel component'ları | hasRole, isAbove, canCreate, canManage (computed) |
| `usePanelNav` | PanelNavContent | 9 gruplu rol bazlı navigasyon |
| `useTableExport` | agents (örnek, diğer sayfalara da eklenebilir) | CSV dışa aktarma (UTF-8 BOM) |
| `useSocket` | Socket plugin | WebSocket bağlantı yönetimi |
| `useSportsbookNav` | Sportsbook sidebar | Spor/lig navigasyonu |
| `useMarketColumns` | Sportsbook | Responsive market kolon sayısı |
| `useMockData` | Sportsbook sayfaları (geçici) | Mock veri sağlayıcı |

---

## 7. COMPONENT MİMARİSİ (49 component)

### 7.1 Admin Component'ları (21)

**Tablo Sistemi:**
- `UserTable` — Kullanıcı tablosu (checkbox, status badge, balance, pagination)
- `CouponTable` — Kupon tablosu (status, type, balance, live indicator, pagination)
- `UserToolbar` — Kullanıcı aksiyonları (CRUD, balance, credit, status, export)
- `CouponToolbar` — Kupon aksiyonları (status filter, bulk actions, details)
- `EntityToolbar` — Genel entity aksiyonları (CRUD, activate/deactivate, delete)
- `TableSortPopover` — Çoklu sıralama yönetimi
- `TableViewPopover` — Kolon görünürlük toggle

**Modal'lar:**
- `UserCreateModal` — Kullanıcı oluşturma (parent selection, availability check, wallet)
- `UserEditModal` — Kullanıcı düzenleme (parent chain resolve)
- `BalanceModal` — Bakiye ekleme/çıkarma (tek kullanıcı)
- `CreditModal` — Çoklu kullanıcı kredi işlemi (Promise.allSettled)
- `ConfirmActionModal` — Bulk activate/deactivate/delete onayı
- `EntityFormModal` — Genel entity create/edit (field-driven, dynamic)
- `MappingDialog` — Provider mapping CRUD

**Form Component'ları:**
- `BettingRulesLimitsForm` — Bahis limitleri (9 alan)
- `BettingRulesOddsForm` — Oran limitleri (4 alan)
- `BettingRulesFeaturesForm` — Feature toggle (9 switch, data-driven)
- `ParentSelectionFields` — Hiyerarşik parent dropdown'lar (4 seviye)

**Diğer:**
- `StatCard` — İstatistik kartı (icon, label, value, color)
- `CouponStatsAccordion` — Kupon istatistik accordion
- `SuspensionToggleList` — Entity suspension toggle listesi

---

## 8. SERVER API ENDPOİNTLERİ (95+)

### 8.1 Kaynak Bazlı Endpoint Sayıları

| Kaynak | Endpoint Sayısı | İşlemler |
|--------|----------------|----------|
| Auth | 14 | Login, logout, passkey, magic-link, impersonate, change-password |
| Users | 7 | CRUD, balance, availability check |
| Wallets | 6 | Deposit, withdraw, credit, credit-withdraw, me |
| Coupons | 8 | CRUD, cancel, force-cancel, refund, stats, active |
| Matches | 7 | CRUD, score, status, markets |
| Settings | 4 | Get all, get/put/delete by path |
| Sports | 4 | CRUD |
| Countries | 3 | Get, post, patch |
| Leagues | 3 | Get, post, patch |
| Betting Groups | 4 | CRUD |
| Market Types | 3 | Get, post, patch |
| Selection Templates | 4 | CRUD |
| Providers | 4 | CRUD |
| Provider Mappings | 3 | Get, post, delete |
| Odds Adjustments | 4 | CRUD |
| Transactions | 2 | Get list, get by id |
| Translations | 2 | Get, post |
| Sportsbook | 3 | Matches, live, match detail |
| Admin | 1 | Activity logs |
| User Preferences | 2 | Get, patch |

### 8.2 Kullanıcı API Detayı

| Method | Path | Açıklama | Güvenlik |
|--------|------|----------|----------|
| GET | `/api/users` | Liste (rol, status, search, pagination) | Auth + hiyerarşi scope (SQL subquery) |
| POST | `/api/users` | Oluştur | Auth + canCreateRole + uniqueness (transaction) |
| GET | `/api/users/[id]` | Tekil + wallet join | Auth + requireTreeAccess |
| PATCH | `/api/users/[id]` | Güncelle | Auth + requireTreeAccess + uniqueness |
| DELETE | `/api/users/[id]` | Soft delete | Auth + isRoleAbove |
| GET | `/api/users/check-availability` | Username/email kontrolü | Auth |
| POST | `/api/users/[id]/balance` | Bakiye işlemi | Auth + canManageBalance + atomic transaction |

---

## 9. VERİTABANI ŞEMASI (25 tablo)

### 9.1 Kullanıcı Tabloları

- `users` — id, username, email, passwordHash, role (enum), parentId, status, walletType, preferences (JSONB)
- `user_tree` — ancestorId, descendantId, depth (closure table pattern)
- `wallets` — userId (unique), balance, creditLimit, currency, version (optimistic lock)
- `activity_logs` — userId, action, entityType, entityId, details (JSONB), ipAddress

### 9.2 Finans Tabloları

- `transactions` — type (enum), idempotencyKey, referenceType, referenceId, description, metadata
- `ledger_entries` — transactionId, walletId, direction (DEBIT/CREDIT), amount, balanceBefore, balanceAfter
- `credit_ranges` — minAmount, maxAmount, creditDeduction, active

### 9.3 Bahis Tabloları

- `coupons` — betSlipNo, playerId, dealerId, type, status, stake, totalOdds, potentialPayout, creditDeduction, hasLiveSelections
- `coupon_selections` — couponId, matchId, marketId, selectionId, snapshotOdds, status, isLive
- `betting_settings` — scope, scopeRef, key, value (JSONB) — hiyerarşik settings

### 9.4 Spor Tabloları

- `sports`, `countries`, `leagues`, `matches`, `markets`, `selections`
- `market_types`, `selection_templates`, `betting_groups`
- `odds_adjustments`, `providers`, `provider_mappings`, `translations`

---

## 10. BETSLIP STORE (Pinia)

| Özellik | Detay |
|---------|-------|
| **State** | selections (Map), originalOddsMap, stakes, category, couponName, isLocked, rules |
| **Getters** | selectionList, selectionCount, isEmpty, totalStake, totalOdds, potentialPayout, hasLiveSelections, hasLineSelections, hasOddChange |
| **Same-event check** | allowSameEventSelections=false ise aynı event'teki eski seçimi siler |
| **Odds change** | originalOddsMap ile ekleme anı oranı saklanır, hasOddChange karşılaştırır |
| **Auto-switch** | 2. seçim→combination, 1'e düşünce→single, <3 ise system'den düşür |
| **Toggle** | Zaten seçili item'a tıklayınca kaldırır |
| **Lock** | Gönderim sırasında tüm mutasyonlar engellenir |
| **Inactivity** | 15dk sonra otomatik temizleme |
| **Rules** | maxSelectionsCount, systemBetsEnabled, live/line enabled, mixLiveAndLine |

---

## 11. GÜVENLİK

| Katman | Uygulama |
|--------|----------|
| Authentication | Session-based cookie + WebAuthn Passkey desteği |
| Password Hashing | Argon2id (64MB, 3 iterations, 4 parallelism) |
| Server Middleware | Rate limiting, CSRF koruması, Security headers |
| Route Protection | `auth.global.ts` + `panel.ts` middleware + `allowedRoles` page meta |
| Hierarchy Access | `requireTreeAccess()` — user_tree closure table ile descendant kontrolü |
| Balance Atomicity | DB transaction + FOR UPDATE row-level lock |
| Input Validation | Zod schema validation tüm API endpoint'lerinde |
| Sort Injection | `z.enum()` allowlist — hassas kolonlara (passwordHash vb.) erişim engeli |
| Hierarchy Query | SQL subquery — massive IN clause yerine performanslı |
| Type Safety | `isRole()` type guard — unsafe `as` cast yerine runtime doğrulama |

---

## 12. ORİJİNAL PROJE İLE KARŞILAŞTIRMA

| Kriter | Next.js (Orijinal) | Nuxt (Yeni) |
|--------|-------------------|-------------|
| Panel sayfası | 42 | 39 (gereksizler birleştirildi) |
| Sportsbook sayfası | 11 | 6 + 7 diğer |
| State yönetimi | Zustand + Context + TanStack (3 strateji) | Pinia + useAsyncData (tek strateji) |
| Query/mutation dosyası | 189 | 12 composable |
| Component sayısı | ~200+ | 49 (ortak composable'lar sayesinde) |
| Backend | Ayrı Express.js projesi | Nitro (dahili, tek proje) |
| Auth sistemi | JWT deprecated + Session (karışık) | Session-only + Passkey (temiz) |
| DB ORM | Kysely | Drizzle (modern, migration desteği) |
| CSS yaklaşımı | SCSS modules | Tailwind + Nuxt UI |
| Toplam LOC | ~50,000+ (tahmin) | 21,573 (**~%57 azalma**) |
| Ortalama sayfa uzunluğu | ~160 satır | ~70 satır |
| Yeni CRUD sayfa maliyeti | ~200 satır + query + mutation | ~60 satır (composable sayesinde) |

---

## 13. TEKNİK KARARLAR VE GEREKÇELERİ

| Karar | Gerekçe |
|-------|---------|
| Tek proje (Nuxt + Nitro) | Deploy basitliği, tip paylaşımı, tek repo |
| Pinia over Vuex | Composition API uyumu, TypeScript desteği |
| Drizzle over Prisma/Kysely | Type-safe, lightweight, migration + push desteği |
| useAsyncData over TanStack Query | Nuxt native, SSR uyumlu, daha az boilerplate |
| reactive(new Set()) | Vue 3 native Set tracking, ref(new Set()) reactivity sorunu çözer |
| SQL subquery over IN clause | 1000+ descendant'ta performance |
| Composable pattern | Sayfa bazlı tekrar %70 azalma |
| Shared types | Frontend + backend arasında tek source of truth |
| Scope-based settings | GLOBAL → ROLE → USER katmanlı override |

---

*Bu rapor Claude Opus 4.6 tarafından otomatik oluşturulmuştur.*
