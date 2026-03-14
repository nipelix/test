# Sportbooks - Production Backend Mimari Tasarımı

> Senior Backend Architect seviyesinde, finans sistemi ölçeklenebilirliği gözetilerek hazırlanmıştır.
> Bu doküman kod içermez. Tablo yapıları, akışlar ve kararlar saf mimari seviyededir.

---

## 1. Genel Mimari Görünüm

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                   Nuxt App (SSR + SPA)                       │
│              Pinia Store ← useFetch / $fetch                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP-only Cookie (session_id)
                           │ CSRF Token (header)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     NITRO SERVER (Monolith)                   │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  Middleware  │  │  API Routes  │  │   Server Utilities   │ │
│  │             │  │  /api/auth/* │  │                     │ │
│  │  auth.ts    │→│  /api/users/*│  │  useDb()            │ │
│  │  rbac.ts    │  │  /api/...    │  │  useSession()       │ │
│  │  rate-limit │  │              │  │  useTree()          │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│         │                │                    │               │
│         ▼                ▼                    ▼               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │    Redis     │  │  PostgreSQL  │  │   Drizzle ORM       │ │
│  │  (Sessions)  │  │  (Data)      │  │   (Query Builder)   │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Monolith Gerekçesi:** Tek deployment unit. Nuxt SSR + Nitro API aynı process'te. Network hop yok, latency minimum. Finans modülü eklendiğinde aynı transaction context'te çalışabilir. Microservice'e geçiş gerekirse Nitro route'ları kolayca extract edilir.

---

## 2. Rol Hiyerarşisi ve Yetkilendirme Modeli

### 2.1 Rol Tanımları

```
Seviye 0: SUPER_ADMIN  ─── Sistemin sahibi, tek veya birkaç kişi
Seviye 1: ADMIN        ─── Bölgesel yönetici
Seviye 2: AGENT        ─── Saha yöneticisi
Seviye 3: DEALER       ─── Bayi
Seviye 4: SUB_DEALER   ─── Alt bayi
Seviye 5: PLAYER       ─── Son kullanıcı (sadece kendini görür)
```

### 2.2 Hiyerarşi Kuralları

| Kural | Açıklama |
|-------|----------|
| parent_id zorunlu | SUPER_ADMIN hariç her kullanıcının bir üstü var |
| Görünürlük | Her kullanıcı sadece kendi alt ağacını (subtree) görebilir |
| Oluşturma | Bir rol sadece bir alt seviye kullanıcı oluşturabilir |
| Silme/Güncelleme | Sadece kendi subtree'sindeki kullanıcıları yönetebilir |
| Player izolasyonu | Player sadece kendi profilini görebilir/güncelleyebilir |

### 2.3 Ağaç Stratejisi Kararı: Hybrid (Adjacency List + Closure Table)

**Neden sadece Adjacency List değil?**
- "User X'in tüm alt kullanıcılarını getir" sorgusu recursive CTE gerektirir
- Derinlik arttıkça performans düşer
- Her yetkilendirme kontrolünde recursive sorgu maliyetli

**Neden sadece Closure Table değil?**
- Direct parent bilgisi için ayrı sorgu gerekir
- Adjacency list doğal ve anlaşılır

**Hybrid Karar:**
- `users.parent_id` → doğrudan üst ilişki (adjacency list)
- `user_tree` tablosu → tüm ancestor-descendant ilişkileri (closure table)
- Okuma ağır, yazma nadir (kullanıcı oluşturma/taşıma nadir)
- `is_descendant_of(user_a, user_b)` → tek satır sorgu, O(1)
- `get_all_descendants(user_id)` → tek sorgu, index scan

**Closure Table Çalışma Prensibi:**

```
Kullanıcı oluşturulduğunda (örn: Admin → Agent → Dealer):

user_tree tablosu:
┌──────────────┬───────────────┬───────┐
│ ancestor_id  │ descendant_id │ depth │
├──────────────┼───────────────┼───────┤
│ admin        │ admin         │   0   │  ← kendisi
│ agent        │ agent         │   0   │  ← kendisi
│ admin        │ agent         │   1   │  ← admin → agent
│ dealer       │ dealer        │   0   │  ← kendisi
│ admin        │ dealer        │   2   │  ← admin → dealer
│ agent        │ dealer        │   1   │  ← agent → dealer
└──────────────┴───────────────┴───────┘

Sorgu: "admin kullanıcısının tüm alt ağacı"
SELECT descendant_id FROM user_tree WHERE ancestor_id = 'admin' AND depth > 0

Sorgu: "dealer, admin'in altında mı?"
SELECT 1 FROM user_tree WHERE ancestor_id = 'admin' AND descendant_id = 'dealer'
→ Satır varsa: EVET. Index scan, O(1).
```

---

## 3. Veritabanı Tasarımı

### 3.1 Enum Tanımları

```
role_enum: SUPER_ADMIN | ADMIN | AGENT | DEALER | SUB_DEALER | PLAYER

user_status_enum: ACTIVE | PASSIVE

wallet_type_enum: CREDIT | MONEY | NONE

login_method_enum: PASSWORD | MAGIC_LINK | PASS_KEY
```

### 3.2 `users` Tablosu

```
┌────────────────┬──────────────────┬─────────────────────────────────────────────┐
│ Kolon          │ Tip              │ Kısıtlar                                     │
├────────────────┼──────────────────┼─────────────────────────────────────────────┤
│ id             │ UUID             │ PK, DEFAULT gen_random_uuid()                │
│ username       │ VARCHAR(50)      │ UNIQUE, NOT NULL                             │
│ email          │ VARCHAR(255)     │ UNIQUE, NOT NULL                             │
│ password_hash  │ VARCHAR(255)     │ NOT NULL                                     │
│ role           │ role_enum        │ NOT NULL                                     │
│ parent_id      │ UUID             │ FK → users(id), NULL (SUPER_ADMIN için)      │
│ status         │ user_status_enum │ NOT NULL, DEFAULT 'ACTIVE'                   │
│ wallet_type    │ wallet_type_enum │ NOT NULL, DEFAULT 'NONE'                     │
│ created_at     │ TIMESTAMPTZ      │ NOT NULL, DEFAULT NOW()                      │
│ updated_at     │ TIMESTAMPTZ      │ NOT NULL, DEFAULT NOW()                      │
│ deleted_at     │ TIMESTAMPTZ      │ NULL                                         │
└────────────────┴──────────────────┴─────────────────────────────────────────────┘
```

### 3.3 `user_tree` Tablosu (Closure Table)

```
┌────────────────┬──────────────────┬─────────────────────────────────────────────┐
│ Kolon          │ Tip              │ Kısıtlar                                     │
├────────────────┼──────────────────┼─────────────────────────────────────────────┤
│ ancestor_id    │ UUID             │ FK → users(id), NOT NULL                     │
│ descendant_id  │ UUID             │ FK → users(id), NOT NULL                     │
│ depth          │ INTEGER          │ NOT NULL, DEFAULT 0                          │
├────────────────┴──────────────────┴─────────────────────────────────────────────┤
│ PK: (ancestor_id, descendant_id)                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 `magic_links` Tablosu

```
┌────────────────┬──────────────────┬─────────────────────────────────────────────┐
│ Kolon          │ Tip              │ Kısıtlar                                     │
├────────────────┼──────────────────┼─────────────────────────────────────────────┤
│ id             │ UUID             │ PK, DEFAULT gen_random_uuid()                │
│ user_id        │ UUID             │ FK → users(id), NOT NULL                     │
│ token_hash     │ VARCHAR(64)      │ NOT NULL (SHA-256 hex)                       │
│ expires_at     │ TIMESTAMPTZ      │ NOT NULL                                     │
│ used_at        │ TIMESTAMPTZ      │ NULL (kullanılınca set edilir)                │
│ created_at     │ TIMESTAMPTZ      │ NOT NULL, DEFAULT NOW()                      │
└────────────────┴──────────────────┴─────────────────────────────────────────────┘
```

### 3.5 `login_attempts` Tablosu (Brute Force Koruması)

```
┌────────────────┬──────────────────┬─────────────────────────────────────────────┐
│ Kolon          │ Tip              │ Kısıtlar                                     │
├────────────────┼──────────────────┼─────────────────────────────────────────────┤
│ id             │ UUID             │ PK, DEFAULT gen_random_uuid()                │
│ identifier     │ VARCHAR(255)     │ NOT NULL (username veya email)                │
│ ip_address     │ VARCHAR(45)      │ NOT NULL (IPv6 uyumlu)                       │
│ success        │ BOOLEAN          │ NOT NULL                                     │
│ created_at     │ TIMESTAMPTZ      │ NOT NULL, DEFAULT NOW()                      │
└────────────────┴──────────────────┴─────────────────────────────────────────────┘
```

### 3.6 Soft Delete Kararı

**Karar: EVET, soft delete kullanılacak.**

Gerekçe:
1. **Finans sistemi ileride gelecek** → Silinen kullanıcının transaction geçmişi korunmalı
2. **Audit trail** → Kimin ne zaman silindiği izlenebilmeli
3. **Hiyerarşi bütünlüğü** → Alt ağaçtaki kullanıcılar orphan kalmamalı
4. **Geri alma** → Yanlışlıkla silinen kullanıcı restore edilebilmeli

Uygulama:
- `deleted_at IS NULL` filtresi tüm sorgularda varsayılan
- Drizzle'da global filter veya her query'de explicit kontrol
- Silinen kullanıcının username/email'i tekrar kullanılabilmeli → unique index'ler `WHERE deleted_at IS NULL` partial index olmalı

### 3.7 Index Stratejisi

```
users tablosu:
  idx_users_username        → UNIQUE WHERE deleted_at IS NULL (partial)
  idx_users_email           → UNIQUE WHERE deleted_at IS NULL (partial)
  idx_users_parent_id       → B-TREE (alt kullanıcıları hızlı bul)
  idx_users_role            → B-TREE (role bazlı filtreleme)
  idx_users_status          → B-TREE (aktif/pasif filtreleme)
  idx_users_role_status     → COMPOSITE (role + status birlikte sorgulanır)
  idx_users_deleted_at      → B-TREE WHERE deleted_at IS NOT NULL (soft delete cleanup)

user_tree tablosu:
  PK (ancestor_id, descendant_id)         → clustered index, yeterli
  idx_tree_descendant       → B-TREE on descendant_id (ters yönlü sorgu: "üstlerim kim?")
  idx_tree_ancestor_depth   → COMPOSITE (ancestor_id, depth) (belirli derinlikteki alt kullanıcılar)

magic_links tablosu:
  idx_magic_token_hash      → UNIQUE on token_hash
  idx_magic_user_id         → B-TREE (kullanıcının aktif linkleri)
  idx_magic_expires_at      → B-TREE (cleanup job için)

login_attempts tablosu:
  idx_attempts_identifier   → B-TREE on (identifier, created_at)
  idx_attempts_ip           → B-TREE on (ip_address, created_at)
  idx_attempts_cleanup      → B-TREE on created_at (eski kayıtları temizlemek için)
```

---

## 4. Session Mimarisi

### 4.1 Session Yapısı (Redis'te)

```
Key format:  session:{session_id}
TTL:         24 saat (configurable)
Value type:  Hash

┌──────────────────┬──────────────────────────────────────────┐
│ Alan             │ Açıklama                                  │
├──────────────────┼──────────────────────────────────────────┤
│ user_id          │ UUID                                      │
│ role             │ role_enum değeri                           │
│ parent_id        │ UUID veya null                             │
│ impersonator_id  │ UUID (impersonation aktifse)               │
│ login_method     │ PASSWORD | MAGIC_LINK | PASS_KEY           │
│ created_at       │ ISO 8601 timestamp                         │
│ expires_at       │ ISO 8601 timestamp                         │
│ ip_address       │ Login yapılan IP                           │
│ user_agent       │ Browser bilgisi (kısaltılmış)              │
└──────────────────┴──────────────────────────────────────────┘
```

### 4.2 Cookie Konfigürasyonu

```
Name:       sportbooks_session
HttpOnly:   true
Secure:     true (production), false (development)
SameSite:   Strict
Path:       /
MaxAge:     86400 (24 saat)
Domain:     ana domain (subdomain dahil değil)
```

### 4.3 Session Lifecycle

```
LOGIN:
  1. Credentials doğrula
  2. Mevcut session varsa → destroy et (session fixation önleme)
  3. Yeni session_id üret (crypto.randomUUID)
  4. Redis'e session data yaz
  5. Cookie'ye session_id set et
  6. login_attempts tablosuna başarılı kayıt

HER REQUEST:
  1. Cookie'den session_id oku
  2. Redis'ten session data çek
  3. expires_at kontrol et
  4. Geçerliyse → event.context.session'a ata
  5. Geçersizse → 401 döndür, cookie sil

LOGOUT:
  1. Redis'ten session sil
  2. Cookie'yi expire et (MaxAge=0)
  3. impersonation aktifse → üst kullanıcının session'ına dön (ayrı akış)

SESSION ROTATION:
  Login sonrası ve hassas işlemlerden (şifre değiştirme, role değiştirme) sonra
  eski session_id → sil, yeni session_id → aynı data ile oluştur
```

### 4.4 Redis DB Fallback Stratejisi

Redis'in down olma ihtimaline karşı:

**Seçenek: Redis Sentinel (Önerilen)**
- Redis Sentinel ile automatic failover
- PostgreSQL'e session yazmaya GEREK YOK
- Sentinel 3 node ile çalışır (1 master, 2 replica)
- Failover süresi: ~5-30 saniye

**Neden PostgreSQL fallback önerilmiyor:**
- Session her request'te okunur → PostgreSQL'e her request'te sorgu = ağır yük
- Redis zaten in-memory, PostgreSQL disk-based → performans farkı çok büyük
- İki store'u sync tutmak complexity ekler, bug kaynağı

**Gerçekçi yaklaşım:**
- Redis Sentinel VEYA Redis Cluster ile HA sağla
- Redis tamamen ölürse kullanıcılar yeniden login olur (kabul edilebilir)
- Critical durumda: Redis restart süresi < 1 dakika

---

## 5. Authentication Akışları

### 5.1 Username/Password Login

```
Client                          Server                           Redis         PostgreSQL
  │                                │                               │               │
  │ POST /api/auth/login           │                               │               │
  │ {username, password}           │                               │               │
  │──────────────────────────────→│                               │               │
  │                                │──── rate limit check ────────→│               │
  │                                │←── ok / blocked ─────────────│               │
  │                                │                               │               │
  │                                │ (blocked ise → 429 döndür)    │               │
  │                                │                               │               │
  │                                │──── find user by username ───→│←─────────────│
  │                                │                               │               │
  │                                │ (user yoksa → genel hata      │               │
  │                                │  "Invalid credentials")       │               │
  │                                │                               │               │
  │                                │──── argon2.verify() ─────────│               │
  │                                │                               │               │
  │                                │ (yanlış şifre → genel hata,   │               │
  │                                │  login_attempts kayıt)        │               │
  │                                │                               │               │
  │                                │──── status=ACTIVE kontrol ───│               │
  │                                │──── deleted_at=NULL kontrol ──│               │
  │                                │                               │               │
  │                                │──── eski session destroy ────→│               │
  │                                │──── yeni session oluştur ────→│               │
  │                                │──── login_attempts (başarılı)→│───────────────│
  │                                │                               │               │
  │←──── 200 + Set-Cookie ────────│                               │               │
  │      {user data}               │                               │               │
```

### 5.2 Magic Link Akışı

```
ADIM 1: Link Talep Et

Client                          Server                              PostgreSQL
  │                                │                                    │
  │ POST /api/auth/magic-link      │                                    │
  │ {email}                        │                                    │
  │──────────────────────────────→│                                    │
  │                                │──── find user by email ───────────→│
  │                                │                                    │
  │                                │ (user yoksa bile aynı response     │
  │                                │  → email enumeration önleme)       │
  │                                │                                    │
  │                                │──── random token üret (32 byte) ──│
  │                                │──── SHA-256 hash hesapla ─────────│
  │                                │──── magic_links'e kaydet ─────────→│
  │                                │     (token_hash, expires=+10dk)    │
  │                                │                                    │
  │                                │──── email gönder ─────────────────│
  │                                │     URL: /auth/verify?token=XXX    │
  │                                │                                    │
  │←──── 200 "Link gönderildi" ───│                                    │
  │      (her durumda aynı mesaj)  │                                    │


ADIM 2: Link Doğrula

Client                          Server                           Redis         PostgreSQL
  │                                │                               │               │
  │ POST /api/auth/verify-link     │                               │               │
  │ {token}                        │                               │               │
  │──────────────────────────────→│                               │               │
  │                                │──── SHA-256(token) hesapla ──│               │
  │                                │──── token_hash ile sorgula ──│───────────────→│
  │                                │                               │               │
  │                                │ Kontroller:                    │               │
  │                                │  - Kayıt var mı?              │               │
  │                                │  - used_at NULL mı?            │               │
  │                                │  - expires_at > NOW() mı?      │               │
  │                                │                               │               │
  │                                │──── used_at = NOW() set et ──│───────────────→│
  │                                │──── session oluştur ─────────→│               │
  │                                │     (login_method=MAGIC_LINK)  │               │
  │                                │                               │               │
  │←──── 200 + Set-Cookie ────────│                               │               │
```

**Magic Link Güvenlik Kuralları:**
- Token: 32 byte random → base64url encode → URL'e koy
- DB'de saklanan: SHA-256(token) → DB'ye sızsa bile token elde edilemez
- Tek kullanımlık: `used_at` set edilince geçersiz
- 10 dakika TTL: `expires_at` kontrolü
- Aynı kullanıcı için birden fazla aktif link olabilir (öncekiler expire olur)

### 5.3 Impersonation Akışı

```
IMPERSONATE (Üst → Alt)

Admin                           Server                           Redis
  │                                │                               │
  │ POST /api/auth/impersonate     │                               │
  │ {target_user_id}               │                               │
  │──────────────────────────────→│                               │
  │                                │──── session'dan mevcut user ──→│
  │                                │     al (role, user_id)         │
  │                                │                               │
  │                                │ Kontroller:                    │
  │                                │  1. target_user var mı?        │
  │                                │  2. target, requester'ın       │
  │                                │     subtree'sinde mi?          │
  │                                │     (closure table sorgusu)    │
  │                                │  3. target'ın rolü daha alt    │
  │                                │     seviyede mi?               │
  │                                │  4. Zaten impersonate'te       │
  │                                │     miyiz? (nested engelle)    │
  │                                │                               │
  │                                │──── mevcut session güncelle ──→│
  │                                │     user_id = target_user_id   │
  │                                │     role = target_role         │
  │                                │     parent_id = target_parent  │
  │                                │     impersonator_id = eski     │
  │                                │       user_id                  │
  │                                │     login_method = PASS_KEY    │
  │                                │                               │
  │←──── 200 {target user data} ──│                               │


UN-IMPERSONATE (Alt'tan çık → Üst'e dön)

Admin (as Dealer)               Server                           Redis
  │                                │                               │
  │ POST /api/auth/un-impersonate  │                               │
  │──────────────────────────────→│                               │
  │                                │──── session'dan                │
  │                                │     impersonator_id al ───────→│
  │                                │                               │
  │                                │ (impersonator_id yoksa → 400)  │
  │                                │                               │
  │                                │──── impersonator user'ı       │
  │                                │     DB'den çek                 │
  │                                │                               │
  │                                │──── session güncelle ─────────→│
  │                                │     user_id = impersonator_id  │
  │                                │     role = impersonator_role   │
  │                                │     impersonator_id = null     │
  │                                │     login_method = PASSWORD    │
  │                                │                               │
  │←──── 200 {original user} ─────│                               │
```

**Impersonation Kuralları:**
1. Sadece üst rol → alt rol (role level kontrolü)
2. Sadece kendi subtree'sinde (closure table kontrolü)
3. Nested impersonation YOK (zaten impersonate'teysen engel)
4. Impersonation sırasında `impersonator_id` session'da tutulur
5. Un-impersonate → session yeniden yazılır, orijinal kullanıcıya dönülür
6. Logout → her iki kullanıcı da logout olur (session tamamen silinir)

---

## 6. Middleware ve Yetkilendirme Mimarisi

### 6.1 Middleware Katmanları

```
Her request sırası:

1. RATE LIMIT MIDDLEWARE (en dış katman)
   │  IP bazlı kontrol
   │  Redis'te counter (sliding window)
   │  Aşılırsa → 429 Too Many Requests
   ▼
2. SESSION MIDDLEWARE
   │  Cookie'den session_id oku
   │  Redis'ten session data çek
   │  event.context.session = { user_id, role, ... }
   │  Public route'larda session opsiyonel
   │  Protected route'larda session zorunlu → 401
   ▼
3. CSRF MIDDLEWARE
   │  Mutation request'lerinde (POST, PATCH, DELETE)
   │  Origin header kontrolü
   │  SameSite=Strict zaten büyük koruma sağlar
   │  Ek olarak: custom header kontrolü (X-Requested-With)
   ▼
4. ROUTE HANDLER
   │  İş mantığı
   │  Handler içinde role + tree kontrolü (composable ile)
   ▼
5. RESPONSE
```

### 6.2 Route Protection Stratejisi

**Yaklaşım: Handler-level authorization (Nitro middleware ile session, handler içinde RBAC)**

Neden middleware'de değil handler'da:
- Her endpoint'in farklı role + tree kuralları var
- Middleware'de generic kontrol çok karmaşık olur
- Handler içinde composable ile temiz ve okunabilir

```
Route protection akışı:

/api/auth/*           → PUBLIC (login, magic-link, verify-link)
/api/auth/logout      → AUTHENTICATED (session gerekli)
/api/auth/impersonate → AUTHENTICATED + role >= ADMIN
/api/**               → AUTHENTICATED + handler-specific RBAC

Handler içinde:
  1. requireAuth(event)         → session yoksa 401
  2. requireRole(event, roles)  → role uygun değilse 403
  3. requireTreeAccess(event, targetUserId) → subtree kontrolü, 403
```

### 6.3 Role-Based + Tree-Based Authorization Kombinasyonu

```
Örnek: GET /api/users/:id

Adım 1 - Authentication:
  session var mı? → Yoksa 401

Adım 2 - Role Check (hızlı, O(1)):
  session.role PLAYER mı?
    → Evet ve :id !== session.user_id → 403
    → Evet ve :id === session.user_id → 200 (kendi profili)

Adım 3 - Tree Check (closure table sorgusu, O(1)):
  target_user_id = :id
  SELECT 1 FROM user_tree
  WHERE ancestor_id = session.user_id
    AND descendant_id = target_user_id
  → Satır yoksa → 403 (bu kullanıcı senin subtree'nde değil)
  → Satır varsa → devam et

Adım 4 - İş mantığı:
  Kullanıcı verisini döndür
```

### 6.4 Recursive Tree Optimizasyonu

**Closure table ile recursive sorgu GEREKMEZ.**

| İşlem | Sorgu | Karmaşıklık |
|-------|-------|-------------|
| Tüm alt kullanıcılar | `WHERE ancestor_id = X AND depth > 0` | O(1) index scan |
| X, Y'nin altında mı? | `WHERE ancestor_id = Y AND descendant_id = X` | O(1) index scan |
| Direkt çocuklar | `WHERE ancestor_id = X AND depth = 1` | O(1) index scan |
| N seviye altındakiler | `WHERE ancestor_id = X AND depth <= N` | O(1) index scan |
| Tüm üstler (ancestors) | `WHERE descendant_id = X AND depth > 0` | O(1) index scan |

**Closure table maintenance (kullanıcı oluşturulduğunda):**

```
Yeni kullanıcı C, parent'ı B olsun:

1. C'nin self-referans kaydı:
   INSERT (C, C, 0)

2. B'nin tüm ancestor'larına C'yi ekle:
   INSERT INTO user_tree (ancestor_id, descendant_id, depth)
   SELECT ancestor_id, C, depth + 1
   FROM user_tree
   WHERE descendant_id = B

Bu tek bir INSERT...SELECT ile yapılır. Recursive CTE yok.
```

**Kullanıcı taşıma (parent değişikliği):**

```
Kullanıcı C'nin parent'ı değiştiğinde:

1. C ve tüm descendant'larının eski ancestor bağlarını sil
   (C'nin subtree'si korunur, sadece üst bağlar değişir)
2. Yeni parent üzerinden yeniden hesapla

Bu nadir bir operasyon. Gerekirse transaction içinde yapılır.
```

---

## 7. API Tasarımı (REST)

### 7.1 Auth Endpoints

```
POST /api/auth/login
├── Erişim: PUBLIC
├── Body: { identifier: string, password: string }
│         (identifier = username VEYA email)
├── Response: 200 { user } + Set-Cookie
├── Hata: 401 "Invalid credentials" (genel mesaj)
├── Rate limit: 5 deneme / 15 dakika / IP+identifier
└── Güvenlik: Argon2 verify, session rotation, login_attempts kaydı

POST /api/auth/magic-link
├── Erişim: PUBLIC
├── Body: { email: string }
├── Response: 200 "Link gönderildi" (her durumda aynı mesaj)
├── Rate limit: 3 talep / 15 dakika / email
└── Güvenlik: Email enumeration yok, token hashli saklanır

POST /api/auth/verify-link
├── Erişim: PUBLIC
├── Body: { token: string }
├── Response: 200 { user } + Set-Cookie
├── Hata: 401 "Invalid or expired link"
└── Güvenlik: SHA-256 hash karşılaştırma, tek kullanım, TTL kontrolü

POST /api/auth/logout
├── Erişim: AUTHENTICATED
├── Response: 200
└── İşlem: Redis session destroy, cookie expire

POST /api/auth/impersonate
├── Erişim: SUPER_ADMIN, ADMIN, AGENT, DEALER
│           (PLAYER ve SUB_DEALER impersonate edemez)
├── Body: { target_user_id: string }
├── Kontrol: role seviyesi + subtree kontrolü
├── Response: 200 { target_user }
└── Güvenlik: Nested impersonation engeli, closure table check

POST /api/auth/un-impersonate
├── Erişim: AUTHENTICATED (impersonation aktif olmalı)
├── Response: 200 { original_user }
└── Kontrol: impersonator_id session'da mevcut olmalı

GET /api/auth/me
├── Erişim: AUTHENTICATED
├── Response: 200 { user, is_impersonating: boolean }
└── Not: Impersonation aktifse her iki kullanıcı bilgisi döner
```

### 7.2 User Endpoints

```
GET /api/users
├── Erişim: SUPER_ADMIN, ADMIN, AGENT, DEALER, SUB_DEALER
├── Davranış: Sadece kendi subtree'sindeki kullanıcıları döndürür
├── Query params: ?role=X&status=X&page=1&limit=20&search=X
├── Response: 200 { users[], total, page, limit }
├── Closure table: WHERE descendant_id IN (subtree of requester)
└── PLAYER erişemez (403)

GET /api/users/:id
├── Erişim: Tüm roller (kendisi dahil)
├── Kontrol:
│   ├── PLAYER → sadece kendi id'si
│   └── Diğerleri → subtree kontrolü
├── Response: 200 { user }
└── Hata: 403 (subtree dışı), 404 (bulunamadı)

POST /api/users
├── Erişim: SUPER_ADMIN, ADMIN, AGENT, DEALER, SUB_DEALER
├── Kural: Sadece bir alt seviye rol oluşturabilir
│   ├── SUPER_ADMIN → ADMIN oluşturur
│   ├── ADMIN → AGENT oluşturur
│   ├── AGENT → DEALER oluşturur
│   ├── DEALER → SUB_DEALER oluşturur
│   └── SUB_DEALER → PLAYER oluşturur
├── Body: { username, email, password, role, wallet_type }
├── İşlem:
│   ├── parent_id = requester'ın user_id'si
│   ├── Argon2 ile password hash
│   └── Closure table güncelle (yeni kullanıcı + tüm ancestor'lar)
├── Response: 201 { user }
└── Validation: Zod schema, unique username/email

PATCH /api/users/:id
├── Erişim: Subtree kontrolü
├── Güncellenebilir alanlar (role'e göre):
│   ├── SUPER_ADMIN → herşey (role, status, wallet_type, email, username)
│   ├── ADMIN/AGENT/DEALER/SUB_DEALER → status, wallet_type, email
│   │   (subtree'sindekiler için)
│   └── PLAYER → sadece kendi email'i
├── GÜNCELLENEMEYEN alanlar:
│   ├── id (asla)
│   ├── parent_id (ayrı bir endpoint ile taşıma yapılmalı)
│   ├── role (sadece SUPER_ADMIN değiştirebilir, yukarı çıkılamaz)
│   └── password_hash (ayrı endpoint: POST /api/users/:id/change-password)
├── Response: 200 { user }
└── Güvenlik: Zod validation, subtree + role check

DELETE /api/users/:id
├── Erişim: Subtree kontrolü
├── Kural:
│   ├── Kullanıcının alt ağacı boşsa → soft delete
│   ├── Alt ağacı doluysa → 409 Conflict
│   │   "Bu kullanıcının X alt kullanıcısı var. Önce onları taşıyın."
│   └── SUPER_ADMIN kendini silemez
├── İşlem: deleted_at = NOW(), status = PASSIVE
├── Response: 200
└── Not: İleride cascade soft delete veya subtree taşıma eklenebilir
```

### 7.3 Rol Bazlı Erişim Matrisi

```
Endpoint               │ SUPER_ADMIN │ ADMIN │ AGENT │ DEALER │ SUB_DEALER │ PLAYER
───────────────────────┼─────────────┼───────┼───────┼────────┼────────────┼───────
POST /auth/login       │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │   ✓
POST /auth/magic-link  │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │   ✓
POST /auth/logout      │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │   ✓
POST /auth/impersonate │      ✓      │   ✓   │   ✓   │   ✓    │     ✗      │   ✗
GET  /users            │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │   ✗
GET  /users/:id        │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │  self
POST /users            │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │   ✗
PATCH /users/:id       │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │  self
DELETE /users/:id      │      ✓      │   ✓   │   ✓   │   ✓    │     ✓      │   ✗
```

---

## 8. Güvenlik Analizi

### 8.1 Session Fixation Önleme

```
Tehdit:  Saldırgan kurbanın session_id'sini önceden belirler
Çözüm:
  1. Login sonrası HER ZAMAN yeni session_id üret (rotation)
  2. Eski session_id'yi Redis'ten sil
  3. Session_id'yi asla URL'de kabul etme, sadece cookie
  4. SameSite=Strict → cross-site request'lerde cookie gönderilmez
```

### 8.2 CSRF Koruması

```
Katman 1 - SameSite=Strict cookie:
  Cross-site request'lerde cookie gönderilmez.
  Bu tek başına büyük koruma sağlar.

Katman 2 - Origin/Referer header kontrolü:
  Mutation request'lerinde (POST, PATCH, DELETE):
  Origin header'ın beklenen domain ile eşleştiğini doğrula.

Katman 3 - Custom header zorunluluğu:
  Tüm API çağrılarında X-Requested-With: XMLHttpRequest header'ı zorunlu.
  HTML form'ları custom header gönderemez → CSRF engellenir.

NOT: SameSite=Strict + Origin kontrolü yeterlidir.
     Ayrı CSRF token mekanizması (double submit cookie) gerekmez.
```

### 8.3 Brute Force Koruması

```
Strateji: İki katmanlı rate limiting

Katman 1 - IP bazlı (Redis counter):
  Kural: Aynı IP'den 20 request / 15 dakika (login endpoint)
  Aşılırsa: 429 + Retry-After header
  Redis key: ratelimit:login:ip:{ip}
  TTL: 15 dakika

Katman 2 - Hesap bazlı (login_attempts tablosu):
  Kural: Aynı identifier için 5 başarısız deneme / 15 dakika
  Aşılırsa: 429 + "Hesap geçici olarak kilitlendi"
  Sorgulama: login_attempts tablosunda son 15 dk'daki başarısız kayıtlar
  NOT: Başarılı login sonrası counter sıfırlanmaz (timing attack önleme)

Katman 3 - Progressive delay:
  1. deneme → anında
  2. deneme → 1s bekleme
  3. deneme → 2s bekleme
  4. deneme → 4s bekleme
  5. deneme → hesap kilitleme (15 dk)

Magic link için:
  Aynı email → 3 talep / 15 dakika
  Aynı IP → 10 talep / 15 dakika
```

### 8.4 Password Hashing

**Karar: Argon2id**

| Kriter | bcrypt | Argon2id |
|--------|--------|----------|
| GPU direnci | Orta | Yüksek (memory-hard) |
| OWASP önerisi | Eski standart | Güncel öneri |
| Konfigürasyon | Cost factor | Memory, iterations, parallelism |
| Side-channel | Zayıf | id varyantı resistant |
| Node.js desteği | `bcrypt` paketi | `argon2` paketi (native binding) |

```
Önerilen Argon2id parametreleri:
  memoryCost:  65536 (64 MB)
  timeCost:    3 (iterasyon)
  parallelism: 4
  hashLength:  32

Bu parametreler ~200ms hash süresi verir.
Login endpoint'te kabul edilebilir.
```

### 8.5 Email Enumeration Önleme

```
Tehdit: Saldırgan farklı email'lerle login/magic-link deneyerek
        hangi email'lerin kayıtlı olduğunu tespit eder.

Çözümler:

1. Login endpoint:
   Hata mesajı: "Invalid credentials" (her durumda aynı)
   ASLA "User not found" veya "Wrong password" ayrı mesaj verme

2. Magic link endpoint:
   Response: "Eğer bu email kayıtlıysa, link gönderildi" (her durumda aynı)
   Response süresi: Her durumda aynı sürede dön (constant time)

3. Register/Create user:
   Bu endpoint sadece üst roller kullanır (public register yok)
   Üst rol kendi subtree'sine kullanıcı ekler
   → Email enumeration riski düşük

4. Timing attack önleme:
   User bulunamadığında bile argon2.hash() çalıştır (dummy hash)
   → Response süresi aynı olur
```

### 8.6 Ek Güvenlik Önlemleri

```
1. Password politikası:
   Minimum 8 karakter
   En az 1 büyük, 1 küçük, 1 rakam
   Zod validation ile kontrol

2. Session timeout:
   24 saat inactivity → session expire
   7 gün absolute timeout (ne olursa olsun)

3. Concurrent session limiti:
   Aynı kullanıcı max 3 aktif session
   Yeni login → en eski session destroy

4. Audit log (ileride):
   Tüm auth olayları loglanmalı
   Kim, ne zaman, nereden, ne yaptı

5. HTTP güvenlik header'ları:
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Strict-Transport-Security: max-age=31536000
   Content-Security-Policy: script-src 'self'
```

---

## 9. Ölçeklenebilirlik

### 9.1 Redis Stratejisi

```
Geliştirme ortamı:
  Tek Redis instance yeterli

Production - Küçük ölçek (< 10K eşzamanlı kullanıcı):
  Redis Sentinel (1 master + 2 replica)
  Automatic failover
  Read replica'dan okuma (session read'leri)

Production - Büyük ölçek (> 10K eşzamanlı kullanıcı):
  Redis Cluster (minimum 6 node: 3 master + 3 replica)
  Key-based sharding (session_id'nin hash'i ile dağıtım)
  Her shard kendi replica'sına sahip

Session-specific:
  Redis key prefix: session:
  TTL: 86400 (24 saat)
  Tahmini memory: ~500 byte/session
  10K session = ~5 MB (Redis için minimal)
  100K session = ~50 MB (hala minimal)
```

### 9.2 Horizontal Scaling

```
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Nuxt 1  │   │  Nuxt 2  │   │  Nuxt 3  │   (N instance)
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     └──────────┬───┴──────────────┘
                │
         ┌──────┴──────┐
         │ Load Balancer│ (nginx / HAProxy / cloud LB)
         └──────┬──────┘
                │
     ┌──────────┼──────────────┐
     │          │              │
┌────┴─────┐  ┌┴──────────┐  ┌┴──────────┐
│  Redis   │  │ PostgreSQL │  │PostgreSQL │
│ Sentinel │  │  Primary   │  │  Replica  │
└──────────┘  └────────────┘  └───────────┘

Sticky session GEREKLİ Mİ? → HAYIR

Sebep: Session verisi Redis'te, PostgreSQL'de.
       Herhangi bir Nuxt instance herhangi bir request'i işleyebilir.
       Load balancer round-robin veya least-connections kullanabilir.

Session replication GEREKLİ Mİ? → Redis seviyesinde EVET

  Redis Sentinel → otomatik replication (master → replica)
  Nuxt instance'lar arası replication → GEREKMEZ (Redis zaten paylaşımlı)
```

### 9.3 PostgreSQL Scaling

```
Mevcut ölçek (başlangıç):
  Tek PostgreSQL instance yeterli
  Connection pooling: postgres.js built-in pool (max 20)

Orta ölçek:
  Primary + Read replica
  Yazma → Primary
  Okuma (user listeleme, tree sorguları) → Replica
  Drizzle'da read/write splitting middleware ile

Büyük ölçek:
  PgBouncer connection pooler (Transaction mode)
  Birden fazla read replica
  Partitioning (login_attempts tablosu: tarih bazlı)
```

### 9.4 Finans Sistemi Hazırlığı

```
Şu an yapılmayanlar ama mimari olarak hazır olanlar:

1. wallet_type alanı:
   CREDIT → bakiye komisyon bazlı
   MONEY  → gerçek para bazlı
   NONE   → cüzdan yok
   İleride: wallets tablosu, wallet_type'a göre iş kuralları

2. Transaction hazırlığı:
   user_tree closure table → komisyon dağıtımında ağaç yürüme
   Hiyerarşik yapı → üst bayilere komisyon hesaplama
   parent_id + closure table → zincir takibi

3. Audit trail:
   soft delete → geçmiş veriler korunuyor
   login_attempts → güvenlik logları mevcut
   İleride: transactions, audit_logs tabloları eklenecek

4. Isolation:
   PostgreSQL transaction isolation level → SERIALIZABLE
   (para işlemlerinde race condition önleme)
   Şu an gerekli değil ama migration ile geçiş kolay
```

---

## 10. Dosya Yapısı (Nihai)

```
server/
├── api/
│   ├── auth/
│   │   ├── login.post.ts
│   │   ├── logout.post.ts
│   │   ├── magic-link.post.ts
│   │   ├── verify-link.post.ts
│   │   ├── impersonate.post.ts
│   │   ├── un-impersonate.post.ts
│   │   └── me.get.ts
│   ├── users/
│   │   ├── index.get.ts          (GET /api/users)
│   │   ├── index.post.ts         (POST /api/users)
│   │   ├── [id].get.ts           (GET /api/users/:id)
│   │   ├── [id].patch.ts         (PATCH /api/users/:id)
│   │   └── [id].delete.ts        (DELETE /api/users/:id)
│   └── ... (diğer modüller ileride)
│
├── database/
│   ├── schema/
│   │   ├── index.ts              (tüm tabloları re-export)
│   │   ├── users.ts              (users tablosu)
│   │   ├── user-tree.ts          (closure table)
│   │   ├── magic-links.ts
│   │   └── login-attempts.ts
│   ├── migrations/               (drizzle-kit generate çıktıları)
│   ├── index.ts                  (DB connection singleton)
│   └── seed.ts                   (başlangıç verileri: SUPER_ADMIN)
│
├── middleware/
│   ├── 01.rate-limit.ts          (IP bazlı rate limiting)
│   ├── 02.session.ts             (session çözümleme)
│   └── 03.csrf.ts                (CSRF kontrolü)
│
└── utils/
    ├── db.ts                     (useDb composable)
    ├── redis.ts                  (Redis client singleton)
    ├── session.ts                (session CRUD yardımcıları)
    ├── auth.ts                   (requireAuth, requireRole, requireTreeAccess)
    ├── password.ts               (Argon2 hash/verify)
    ├── tree.ts                   (closure table CRUD yardımcıları)
    └── validation.ts             (Zod şemaları: login, user create/update)
```

---

## 11. Ek Bağımlılık Gereksinimleri

```
Mevcut (zaten kurulu):
  drizzle-orm         → ORM
  postgres            → PostgreSQL driver
  nuxt-auth-utils     → session altyapısı (cookie yönetimi)
  zod                 → validation
  drizzle-kit         → migration CLI
  tsx                 → seed script çalıştırma

Eklenecek:
  argon2              → password hashing (npm install argon2)
  ioredis             → Redis client (npm install ioredis)

Opsiyonel:
  nanoid              → kısa unique ID üretimi (magic link token gibi)
                        (crypto.randomBytes de kullanılabilir)
```

---

## 12. Kritik Kararlar Özeti

| # | Karar | Seçim | Gerekçe |
|---|-------|-------|---------|
| 1 | Ağaç yapısı | Hybrid (adjacency + closure) | Okuma O(1), yazma nadir |
| 2 | Password hash | Argon2id | OWASP güncel önerisi, GPU-resistant |
| 3 | Session store | Redis (DB fallback yok) | Performans, Sentinel ile HA yeterli |
| 4 | Soft delete | Evet (deleted_at) | Finans audit trail, geri alma |
| 5 | CSRF | SameSite=Strict + Origin check | Token mekanizması gereksiz |
| 6 | Auth middleware | Session middleware global, RBAC handler'da | Endpoint-specific kurallar handler'da daha temiz |
| 7 | Sticky session | Gerekmez | Redis paylaşımlı, herhangi bir instance işleyebilir |
| 8 | UUID vs auto-increment | UUID (gen_random_uuid) | Distributed-safe, URL'de tahmin edilemez |
| 9 | Unique index | Partial (WHERE deleted_at IS NULL) | Silinen kullanıcının username'i tekrar kullanılabilir |
| 10 | Rate limiting | Redis sliding window | IP + hesap bazlı, distributed-safe |
| 11 | Impersonation | Session içi (ayrı session yok) | Basit, tek cookie, un-impersonate kolay |
| 12 | Magic link token | SHA-256 hash ile DB'de | DB sızsa bile token elde edilemez |
