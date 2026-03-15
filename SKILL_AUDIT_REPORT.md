# SKILL AUDIT RAPORU — SPORTBOOKS-NUXT

**Tarih:** 2026-03-15
**Audit Kaynağı:** 33 Claude Code Skill (vue, nuxt, nuxt-ui, typescript-pro, postgres-pro, api-designer, secure-code-guardian, vibe-security, ve diğerleri)

---

## KRİTİK SEVİYE (Hemen Düzeltilmeli)

### K1. Finance — placeBetTransaction / cancelBetTransaction atomik değil
**Dosya:** `server/utils/finance.ts` (satır 112-207)
**Sorun:** İki ayrı `executeTransaction` çağrısı iki ayrı DB transaction açıyor. Player debit başarılı + dealer debit başarısız olursa para kaybolur.
**Düzeltme:** Tek bir outer transaction context'i kabul eden refactor.

### K2. Balance API — outer transaction iç transaction'ları sarmıyor
**Dosya:** `server/api/users/[id].balance.post.ts` (satır 51-83)
**Sorun:** `db.transaction()` içinde `executeTransaction()` çağrılıyor ama `executeTransaction` kendi `useDb()` ile yeni connection alıyor — nested transaction aslında ayrı transaction.
**Düzeltme:** `executeTransaction`'a opsiyonel `tx` parametresi ekle.

### K3. Odds precision yetersiz (scale: 2)
**Dosya:** `server/database/schema/selections.ts`, `coupons.ts`
**Sorun:** `baseOdds`, `snapshotOdds`, `totalOdds` hepsi `precision: 10, scale: 2`. Standart bahis oranları (1.85, 2.375) en az 3-4 ondalık gerektirir. System bet'lerde çarpma hatası birikir.
**Düzeltme:** Tüm odds kolonlarını `{ precision: 10, scale: 4 }` yap.

---

## YÜKSEK SEVİYE

### Y1. Floating-point parasal hesaplama
**Dosya:** `server/utils/finance.ts` (satır 39-48)
**Sorun:** `parseFloat(wallet.balance)` ile JS floating-point aritmetiği. `0.1 + 0.2 = 0.30000000000000004` sorunu finans sisteminde kabul edilemez.
**Düzeltme:** SQL `numeric` tipi ile doğrudan DB'de aritmetik yap veya decimal.js kullan.

### Y2. İdempotency key eksik
**Dosya:** `server/utils/finance.ts`, `[id].balance.post.ts`
**Sorun:** `idempotencyKey` nullable ve çoğu yerde null gönderiliyor. Network retry veya çift tıklama duplicate transaction yaratır.
**Düzeltme:** Tüm işlemlerde deterministic idempotency key zorunlu yap.

### Y3. moveUserInTree transaction'sız
**Dosya:** `server/utils/tree.ts` (satır 59-81)
**Sorun:** DELETE + INSERT iki ayrı operasyon. Crash olursa subtree orphan kalır.
**Düzeltme:** `db.transaction()` ile sar.

### Y4. credit_ranges overlap constraint yok
**Dosya:** `server/database/schema/credit-ranges.ts`
**Sorun:** Aynı anda 0-100 ve 50-200 aktif olabilir. `calculateCreditDeduction` ilk match'i alır — yanlış kredi düşürme.
**Düzeltme:** PostgreSQL `numrange` exclusion constraint ekle.

### Y5. Settings cache invalidation yok
**Dosya:** `server/utils/settings.ts`
**Sorun:** 60 saniye cache var ama güncelleme sonrası invalidate edilmiyor. `maxBetAmount` değiştirilse bile 60sn eski değer geçerli — bahis limitini aşan kupon kabul edilebilir.
**Düzeltme:** Her settings update endpoint'inde cache invalidation çağır.

### Y6. `any` type kullanımı yaygın
**Dosyalar:** manage-sports, matches-list, UserTable, EntityFormModal, useEntityList
**Sorun:** `useEntityList<any>`, `ref<any>(null)`, `data: any[]` — TypeScript güvenliği devre dışı.
**Düzeltme:** Her entity için interface tanımla (Sport, Country, League, Match, vb.)

### Y7. Form validation eksik
**Dosyalar:** betting-rules.vue, EntityFormModal.vue, CreditModal.vue
**Sorun:** Zod/Valibot schema validation yok. Geçersiz veri API'ye ulaşabiliyor.
**Düzeltme:** UForm + Zod schema ile validation ekle.

---

## ORTA SEVİYE

### O1. couponSelections foreign key eksik
**Dosya:** `server/database/schema/coupons.ts` (satır 59-61)
**Sorun:** `matchId`, `marketId`, `selectionId` referans constraint'i yok — orphan kayıtlar oluşabilir.

### O2. ledger_entries composite index eksik
**Dosya:** `server/database/schema/ledger.ts`
**Sorun:** `(wallet_id, created_at DESC)` composite index yok — wallet history sorguları büyüdükçe yavaşlar.

### O3. wallets version kolonu kullanılmıyor
**Dosya:** `server/utils/finance.ts`, `wallets.ts`
**Sorun:** Version artırılıyor ama WHERE'de kontrol edilmiyor. `SELECT FOR UPDATE` zaten pessimistic lock sağlıyor — version gereksiz veya tam implement edilmeli.

### O4. moveUserInTree circular reference kontrolü yok
**Dosya:** `server/utils/tree.ts`
**Sorun:** newParentId userId'nin descendant'ı ise döngü oluşur. Sonsuz loop riski.
**Düzeltme:** Move öncesi `isDescendant(userId, newParentId)` kontrolü ekle.

### O5. addUserToTree transaction'sız
**Dosya:** `server/utils/tree.ts` (satır 4-23)
**Sorun:** Self-reference + ancestor chain copy iki ayrı statement. Kısmi tree state riski.

### O6. LIKE special char escape yok
**Dosya:** `server/api/users/index.get.ts` (satır 29)
**Sorun:** `%` ve `_` karakterleri escape edilmiyor — `%a%b%c%` gibi pattern expensive scan'e neden olur.

### O7. Cache stampede (thundering herd)
**Dosya:** `server/utils/cache.ts`
**Sorun:** Key expire olunca tüm concurrent request'ler aynı anda DB'ye gider.
**Düzeltme:** Lock-based refresh veya stale-while-revalidate pattern.

### O8. Settings shallow merge
**Dosya:** `server/utils/settings.ts` (satır 74)
**Sorun:** `{ ...merged[key], ...globalSettings[key] }` tek seviye spread — nested object'ler override edilir, merge edilmez.

### O9. useUserList useEntityList'in kopyası
**Dosya:** `app/composables/useUserList.ts`
**Sorun:** %80 kod aynı (debounce, pagination, selection). DRY ihlali.
**Düzeltme:** useEntityList üzerine compose et.

### O10. Manuel debounce (setTimeout)
**Dosyalar:** `useEntityList.ts`, `useUserList.ts`, `useCouponList.ts`
**Sorun:** VueUse'da `refDebounced` hazır varken manuel setTimeout kullanımı.
**Düzeltme:** `const debouncedSearch = refDebounced(searchQuery, 300)`

### O11. Store'larda readonly() eksik
**Dosyalar:** `betslip.ts`, `auth.ts`
**Sorun:** State ref'leri doğrudan mutable döndürülüyor. Dışarıdan action'sız mutasyon riski.
**Düzeltme:** Return'de `readonly()` wrapper ekle.

### O12. Auth store çok fazla sorumluluk
**Dosya:** `app/stores/auth.ts`
**Sorun:** Auth, preferences, avatar picker, accent color, socket, table prefs tek store'da. Single Responsibility ihlali.
**Düzeltme:** `usePreferencesStore` olarak ayır.

---

## DÜŞÜK SEVİYE

### D1. activity_logs partitioning yok — sınırsız büyüme
### D2. Offset pagination yüksek sayfalarda yavaşlar
### D3. Redis KEYS komutu production'da blocking
### D4. Hardcoded i18n stringleri (CreditModal'da 'Active'/'Inactive')
### D5. nuxt.config'de `typescript: { strict: true }` eksik
### D6. Panel sayfalarında `ssr: false` route rule yok (gereksiz SSR overhead)
### D7. webauthnOrigin hardcoded localhost:3000 (devServer 3010)
### D8. formFields computed olmalı (locale değişiminde güncellenmez)
### D9. Props destructure edilmemiş (CreditModal, EntityFormModal)
### D10. Inconsistent ref(new Set) vs reactive(new Set)

---

## ÖZET TABLO

| Seviye | Sayı | Kategoriler |
|--------|------|-------------|
| **KRİTİK** | 3 | Transaction atomicity (2), odds precision (1) |
| **YÜKSEK** | 7 | Float arithmetic, idempotency, tree ops, credit overlap, cache, any types, validation |
| **ORTA** | 12 | FK eksik, index eksik, circular ref, LIKE escape, stampede, DRY, readonly |
| **DÜŞÜK** | 10 | Partitioning, pagination, Redis, i18n, strict mode, SSR, config |
| **Toplam** | **32 bulgu** | |

---

## ÖNCELİK SIRASI

1. **K1 + K2:** Finance transaction atomicity — para kaybı riski
2. **K3:** Odds scale 4'e çıkar — her bahiste hata birikimi
3. **Y1:** Float → SQL numeric aritmetik
4. **Y2:** İdempotency key zorunlu
5. **Y5:** Settings cache invalidation
6. **Y3 + O4 + O5:** Tree operations transaction + circular ref guard
7. **Y6:** any → typed interfaces
8. **Y7:** Form validation (Zod)

---

*Bu rapor 33 Claude Code Skill (vue, nuxt, nuxt-ui, typescript-pro, postgres-pro, api-designer, secure-code-guardian, vibe-security, code-reviewer, test-master, database-optimizer, websocket-engineer, architecture-designer, clean-code, testing-patterns, tdd-workflow, api-patterns, security-best-practices, api-security-best-practices, postgres-best-practices, postgres-schema-design, senior-fullstack, software-architecture, systematic-debugging, performance, i18n-localization, vitest, vueuse, ts-library, commit-smart, code-review-checklist, typescript-expert, vue-expert) tarafından paralel audit sonucu oluşturulmuştur.*
