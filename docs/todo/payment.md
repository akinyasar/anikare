# Ödeme Entegrasyonu — Todo

## Seçenek A: Shopier (Önerilen — Şirketsiz, Hızlı)

**Ne zaman:** İlk satışlar için. Şirket açmadan bireysel olarak çalışır.

### Shopier Nedir?
Türkiye'de TCKN + banka hesabıyla bireysel ürün satışı yapılabilen platform.
- Şirket gerekmez
- Komisyon: ~%4–6 + KDV (iyzico'dan yüksek ama bürokratik sıfır)
- Webhook API mevcut → otomatik paket aktivasyonu yapılabilir
- Para haftalık IBAN'a yatar

### Kurulum Adımları (Senin Yapacakların)

1. **shopier.com** → Hesap aç → Bireysel seç → TCKN + IBAN gir
2. İki ürün oluştur:
   - "AnıKare Standart" → ₺1.000
   - "AnıKare Premium" → ₺1.399
3. Her ürün için bir ödeme linki al
4. Shopier Dashboard → Entegrasyonlar → Webhook URL ekle:
   ```
   https://anikare.co/api/webhooks/shopier
   ```
5. Webhook Secret'ı kopyala → Vercel env'e ekle:
   ```
   SHOPIER_WEBHOOK_SECRET=xxx
   ```

### Kodlanacaklar (Claude Yapacak)

- [ ] `app/api/webhooks/shopier/route.ts` — Webhook handler
  - İmza doğrulama (HMAC-SHA256)
  - Ödeme başarılıysa: `events` tablosunda `package_type` güncelle
  - Kullanıcıyı `user_id` ile eşleştir (Shopier'da buyer_name/email üzerinden)
- [ ] `app/(dashboard)/etkinlik/yeni/page.tsx` — Ücretli paket seçilince ödeme linkine yönlendir
- [ ] `app/api/payment/create-checkout/route.ts` — Shopier ürün linkini + `user_id` parametresini return et
- [ ] Ödeme dönüşü sonrası `/odeme-tamamlandi` sayfası

### Akış

```
Kullanıcı paket seçer
→ "Ödemeye Geç" butonuna basar
→ /api/payment/create-checkout çağrılır
→ Shopier ürün linkine yönlendirilir (user_id query param ile)
→ Shopier'da ödeme tamamlanır
→ Shopier webhook'u /api/webhooks/shopier'e POST atar
→ Webhook handler: events.package_type güncellenir
→ Kullanıcı /odeme-tamamlandi sayfasına döner
```

### Shopier Sınırlaması
Shopier'da buyer email, Supabase'deki user email ile eşleşmeyebilir.
Çözüm: Shopier ürün linkine `?uye_id=USER_SUPABASE_ID` ekle, callback'te bu parametreyi oku.

---

## Seçenek B: iyzico (Şirket Açıldıktan Sonra)

**Ne zaman:** Hacim büyüyünce, daha profesyonel görünüm için.

### Gereksinimler
- Vergi levhası (Şahıs veya Limited şirket)
- İmza sirküsü
- E-fatura mükellefiyeti
- iyzico.com → Başvuru → 3-7 iş günü onay

### Gerekli Ortam Değişkenleri
```
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://api.iyzipay.com   # prod
# test: https://sandbox-api.iyzipay.com
```

### Kodlanacaklar

- [ ] `npm install iyzipay`
- [ ] `lib/iyzico/client.ts` — SDK wrapper
- [ ] `app/api/payment/create-checkout/route.ts` — CheckoutFormInitialize
- [ ] `app/api/payment/callback/route.ts` — Ödeme sonucu doğrulama
- [ ] `app/odeme/[token]/page.tsx` — iyzico iframe checkout sayfası
- [ ] Başarılı ödemede `events.package_type` güncelle
- [ ] `/odeme-tamamlandi` ve `/odeme-basarisiz` sayfaları

### iyzico Akışı

```
Kullanıcı ödemeye geç → /api/payment/create-checkout
→ iyzico'dan token alınır
→ /odeme/[token] sayfasında iframe gösterilir
→ Kullanıcı kart bilgilerini girer
→ iyzico /api/payment/callback'e POST atar
→ Token doğrulanır, payment status "SUCCESS" ise paket aktive edilir
```

---

## Ortak: Paket Aktivasyon Fonksiyonu

Her iki entegrasyon da aynı DB işlemini yapacak. Buraya merkezi bir fonksiyon:

```typescript
// lib/payment/activate-package.ts
export async function activatePackage(
  userId: string,
  eventId: string,
  packageType: 'standard' | 'premium'
) {
  const supabase = await createServiceClient()
  await supabase
    .from('events')
    .update({ package_type: packageType })
    .eq('id', eventId)
    .eq('host_id', userId)
}
```
