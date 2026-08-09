# Masa Kartı Tasarım İyileştirmesi

## Amaç
Mevcut 3 masa kartı şablonu (botanical, floral, minimal) rakip ürünlere kıyasla amatör görünüyor. Rakip referans görselleri ("Hatıra Deposu" markası, `~/Downloads/WhatsApp Image 2026-07-19...jpeg`) ve Stitch MCP ile üretilen bir referans illüstrasyon (`floral-stitch-1.png` — yoğun gül+okaliptüs buketi) temel alınarak üç şablon da daha profesyonel/dolu hale getirilecek.

## Kapsam
Sadece mevcut 3 şablonun görsel iyileştirmesi. Yeni şablon eklenmiyor. Veri modeli, API, export mekanizması değişmiyor.

## Değişiklikler

### 1. Tipografi
- `next/font/google` ile **Playfair Display** eklenir (self-hosted, ekstra network isteği yok).
- 3 şablonun da başlık (`h1` - çift isim) alanında `Georgia, serif` yerine kullanılır.
- html2canvas export'ta da doğru render olması için font `next/font` ile CSS variable olarak enjekte edilir, `document.fonts.ready` beklenir (mevcut `setTimeout(resolve, 200)` render bekleme mantığı, font yüklenmeden snapshot alınmasını önlemek için gerekirse artırılır).

### 2. Botanical şablon (`components/table-card/card-botanical.tsx`)
- `BotanicalCorner` SVG'si elden geçirilir: mevcut seyrek 8-9 elips yaprak yerine katmanlı, çok daha yoğun okaliptüs dalı kompozisyonu (rakip görsel + Stitch referansındaki yoğunlukta).
- Yeşil (sage: `#5c7a3c`/`#7a9e6a`/`#a8c896`) + altın (`#c9a84c`) palet korunur.
- Köşe illüstrasyonu kapladığı alan büyütülür (mevcut 100x85 viewBox içinde daha fazla yaprak katmanı, gerekirse viewBox büyütülür).

### 3. Floral şablon (`components/table-card/card-floral.tsx`)
- `FloralCorner` SVG'si elden geçirilir: 3 basit "blob" gül yerine gerçek taç yaprağı katmanları olan 2-3 gül + tomurcuklar + eğrelti otu benzeri ince yapraklar karışımı, `floral-stitch-1.png` referansındaki yoğunlukta.
- Pembe (`#f4a0b0`/`#e07898`/`#f9c0cc`) + sage yeşili karışımı palet korunur.

### 4. Minimal şablon (`components/table-card/card-minimal.tsx`)
- Şu anki çok yalın hali (renk şeridi + QR çerçevesi) yerine: ince çift-çizgi çerçeve, küçük geometrik köşe motifi (botanik değil — "quiet luxury" hissi), Playfair Display başlık.
- Mevcut bordo (`#6D1A3E`) marka rengi korunur, minimal kimlik korunur (botanical/floral kadar süslü olmayacak).

### 5. Kritik kısıt — PDF köşe kayması regresyonu
- Köşe rotasyonu için **sadece** mevcut kanıtlanmış yöntem kullanılır: SVG içi `<g transform="rotate(180, cx, cy)">` (SVG viewBox koordinat sistemi içinde, DOM elemanına CSS `transform: rotate()` UYGULANMAZ).
- Yeni path'ler bu `<g>` bloğunun içine eklenir. Portrait'teki mevcut `transform: scale(0.65)` (CSS, DOM üzerinde) korunur — bu `rotate` değil `scale` olduğu için önceki html2canvas bug'ına neden olmuyordu, dokunulmayacak.
- `download-pdf-btn.tsx` içindeki render/export akışı (`html2canvas` + `jsPDF`) değişmiyor.

### 6. Geçici önizleme sayfası
- Yeni route: `app/dev/masa-karti-preview/page.tsx`.
- `process.env.NODE_ENV !== 'development'` ise `notFound()` döner — production build'e dahil olmaz, sadece `npm run dev` ile localde erişilebilir.
- 3 şablon × 2 yön (6 kart) tek sayfada `TableCard` bileşeni ile önizlenir, sahte veri (`title: "Efe & Yasemin"`, örnek tarih) kullanılır.
- Her kart için mevcut `DownloadPdfBtn` tekrar kullanılır + üstte "Tümünü İndir" butonu (6 PDF'i sırayla tetikler).

## Mimari / Dosya Etkisi
| Dosya | Değişiklik |
|---|---|
| `components/table-card/card-botanical.tsx` | `BotanicalCorner` SVG path'leri zenginleştirilir, font class eklenir |
| `components/table-card/card-floral.tsx` | `FloralCorner` SVG path'leri zenginleştirilir, font class eklenir |
| `components/table-card/card-minimal.tsx` | Çerçeve/köşe motifi + font class eklenir |
| `app/layout.tsx` (veya font tanımının olduğu yer) | Playfair Display `next/font/google` importu eklenir |
| `app/dev/masa-karti-preview/page.tsx` | Yeni — dev-only önizleme sayfası |
| `app/dev/masa-karti-preview/preview-client.tsx` | Yeni — "Tümünü İndir" client component |

## Test Planı
- `npm run build` hatasız geçmeli (TS + prod build, dev-only route `notFound()` dahil).
- Localde `npm run dev` ile `/dev/masa-karti-preview` açılıp 6 kartın da göründüğü doğrulanır.
- Her 3 şablon için hem yatay hem dikey PDF indirilip **köşelerin kaymadığı** (önceki bug'ın geri gelmediği) görsel olarak kontrol edilir.
- Production build sonrası (`npm run build && npm start`) `/dev/masa-karti-preview` 404 dönmeli.

## Kapsam Dışı (Non-goals)
- Yeni bir 4. şablon eklemek yok.
- Veritabanı şeması, API route'ları, paket limitleri değişmiyor.
- Commit/push yok — kullanıcı localde onaylayana kadar sadece dosya değişiklikleri yapılır, git commit kullanıcı açıkça isteyene kadar atılmaz.
