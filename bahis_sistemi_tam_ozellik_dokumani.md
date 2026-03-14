# BAHİS SİSTEMİ TAM ÖZELLİK DOKÜMANI

## 1. Rol Hiyerarşisi

-   super_admin
-   admin
-   agent
-   dealer
-   sub_dealer
-   player

Hiyerarşi:

super_admin\
→ admin\
→ agent\
→ dealer\
→ sub_dealer\
→ player

Her rol yalnızca kendi alt hiyerarşisini görebilir.

------------------------------------------------------------------------

## 2. Oran Modeli (Additive Sistem)

Final Oran Hesaplama:

FinalOdds = BaseOdds + Sistem Global Artış + Rol Artışı + Bahis Grup
Artışı + Maç Artışı + Kullanıcı Artışı

Kurallar:

-   Çarpan yok, sadece toplama/çıkarma
-   adjustment_type: fixed \| percentage
-   percentage hesaplaması baseOdds üzerinden yapılır
-   Minimum sistem oranı: 1.01
-   2 basamak yuvarlama
-   Negatif oran engellenir

------------------------------------------------------------------------

## 3. Oran Gösterim Filtresi (Minimum Oran Altını Gösterme)

Belirlenen limit altındaki oranlar:

-   UI'da gösterilmez
-   API'de filtrelenir
-   Kupona eklenemez

Ayarlar:

-   Normal minimum gösterim oranı
-   Canlı minimum gösterim oranı
-   Gizle modu
-   Tam kapatma modu

Öncelik sırası:

1.  User override
2.  Dealer override
3.  Admin override
4.  Global

------------------------------------------------------------------------

## 4. Sistem Limitleri

-   Minimum kupon limiti
-   Maksimum kupon limiti
-   Maksimum potansiyel kazanç
-   İzin verilen toplam oran
-   Minimum maç sayısı
-   Maksimum maç sayısı

------------------------------------------------------------------------

## 5. Oran Limitleri

Normal maç: - Minimum oran - Maksimum oran

Canlı maç: - Minimum oran - Maksimum oran

------------------------------------------------------------------------

## 6. Kredi Tüketim Sistemi

Player/Subdealer: MONEY\
Dealer: CREDIT

Kupon oluştuğunda:

1.  MONEY düşer
2.  Belirli aralıkta ise DEALER CREDIT düşer

Örnek kredi aralıkları:

0--2000 → 2 kredi\
2001--5000 → 3 kredi\
5001--20000 → 6 kredi\
20001--50000 → 8 kredi\
50001--200000 → 12 kredi\
200001+ → 16 kredi

Ek ayarlar:

-   Kupon iptal cezası
-   Bayi eksi limit
-   15 dk iptal kuralı (live varsa iptal yok)

------------------------------------------------------------------------

## 7. Bahis Özellikleri

Sistem aşağıdaki özellikleri destekler:

-   Canlı bahis izni
-   Normal bahis izni
-   Bayiler sistem bahisleri sunabilir
-   Canlı ve Normal bahisleri birleştirebilir
-   Kombinasyon Boost
-   Kombinasyon Sigortası
-   Aynı etkinlik seçimlerine izin ver
-   Oran değişikliği otomatik kabul

------------------------------------------------------------------------

## 8. Zaman ve Gecikme Ayarları

-   Kupon İptal Süresi (dk): 15
-   Canlı Bahis Gecikmesi (sn): 0

------------------------------------------------------------------------

## 9. Kupon Kuralları

-   Live maç varsa iptal edilemez
-   15 dk geçtiyse iptal edilemez
-   Dealer override edebilir
-   Odds snapshot alınır
-   Final odds lock edilir

------------------------------------------------------------------------

## 10. Finans Sistemi

Double-entry ledger yapısı:

Transaction Types:

-   BET
-   WIN
-   CANCEL
-   CREDIT_DEDUCTION
-   CREDIT_RETURN
-   BULK_ADJUSTMENT

Row-level locking önerilir.\
Serializable isolation önerilir.\
Idempotency key sistemi önerilir.

------------------------------------------------------------------------

## 11. Cache Stratejisi

Redis anahtar örnekleri:

odds:{match_id}:{market_id}:{user_id}\
display_limit:{user_id}\
limit_settings:{role_id}

TTL: 30--60 saniye

------------------------------------------------------------------------

## 12. Ölçeklenebilirlik

-   1M+ kullanıcı destekli
-   Server-side pagination
-   Datatable uyumlu listeler
-   Index optimizasyonu
-   Recursive hiyerarşi desteği

------------------------------------------------------------------------

Doküman Versiyon: 1.0
