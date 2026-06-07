# E-posta Bildirimleri — Todo (Resend)

**Ne zaman:** Ödeme alındıktan sonra, platform canlıya geçince.

## Resend Nedir?

Modern transactional email servisi. Supabase'in auth emaillerinden farklı — özel iş mantığı emailleri için.

- Ücretsiz: 3.000 email/ay, 100/gün
- API: `resend.emails.send({...})` — tek satır
- resend.com → GitHub ile kayıt → API key al → hazır

## Supabase Yeterli mi?

Supabase kendi SMTP'si sadece auth emaillerini gönderir (doğrulama, şifre sıfırlama).
**Özel bildirimler için ayrı servis şart.**

## Gerekli Ortam Değişkenleri

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=bildirim@anikare.net    # domain doğrulaması gerekir
# veya: onboarding@resend.dev (doğrulama gerekmez, test için)
```

## Kodlanacaklar

- [ ] `npm install resend`
- [ ] `lib/email/client.ts` — Resend singleton
- [ ] `lib/email/templates/` — Email template'leri (React Email veya plain HTML)
- [ ] Trigger noktaları:

### Trigger 1 — Yeni Fotoğraf Yüklendi (Host'a)
**Nerede tetiklenir:** `app/api/upload/confirm/route.ts`
- Kime: Event'in host'una
- Konu: "Yeni anılar eklendi — [Etkinlik Adı]"
- İçerik: Kim yükledi, kaç fotoğraf, dashboard linki
- **Not:** Her yüklemede mail atma — 10 dakikada bir max 1 mail (rate limiting gerekli)

### Trigger 2 — Etkinlik Oluşturuldu (Host'a)
**Nerede tetiklenir:** `app/(dashboard)/etkinlik/yeni` submit sonrası
- Kime: Host'a
- Konu: "Etkinliğiniz hazır — QR kodunuz oluşturuldu"
- İçerik: Etkinlik adı, tarih, misafir QR linki, dashboard linki

### Trigger 3 — Hoş Geldin (Yeni Kayıt)
**Nerede tetiklenir:** Auth webhook veya `/api/upload/confirm` ilk çağrıda
- Kime: Yeni kayıt olan kullanıcıya
- Konu: "AnıKare'ye hoş geldiniz 🤍"
- İçerik: Nasıl başlanır, ilk etkinlik oluşturma linki

## Resend Domain Kurulumu

1. resend.com → Domains → Add Domain → `anikare.net`
2. DNS kayıtları ekle (3 adet TXT/MX): Cloudflare DNS Settings'te
3. ~24 saat sonra doğrulanır

Domain yoksa test için `onboarding@resend.dev` adresinden gönderim yapılabilir.

## Rate Limiting — Fotoğraf Bildirimi

Her yüklemede mail atmak spam'e dönüşür. Basit çözüm:

`profiles` tablosuna `last_upload_notified_at TIMESTAMPTZ` ekle.
Upload confirm'de: son bildirimden 10+ dk geçmişse mail at, güncelle.

```typescript
// lib/email/notification-throttle.ts
// profiles.last_upload_notified_at kontrolü:
// Aynı event için 10 dakikada bir max 1 mail.
```
