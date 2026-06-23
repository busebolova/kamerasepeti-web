export const meta = {
  name: 'site-rewrite',
  description: 'Clean URL, blog, WhatsApp form, mobil iyileştirme, SEO',
  phases: [
    { title: 'Ana Sayfa ve Temel Yapı' },
    { title: 'Paketler ve Hakkımızda' },
    { title: 'İletişim ve Form' },
    { title: 'Blog' },
    { title: 'CSS, JS ve Server' },
  ],
}

phase('Ana Sayfa ve Temel Yapı')
const anaSayfaResult = await agent(`Ana sayfayi (index.html) temiz URL yapisina gore yeniden yaz. Su degisiklikleri yap:

**Link güncellemeleri (root-relative):**
- href="paketler.html" -> href="/paketler"
- href="hakkimizda.html" -> href="/hakkimizda"
- href="blog.html" -> href="/blog"
- href="iletisim.html" -> href="/iletisim"
- href="index.html" -> href="/"
- Tum asset yollari ayni kalsin (zaten root-relative)
- Tum canonical URL'lerden .html kaldir: https://www.kamerasepeti.com.tr/paketler.html -> https://www.kamerasepeti.com.tr/paketler

**SEO iyilestirmeleri:**
- OG tags ekle: og:title, og:description, og:image, og:url, og:type
- Twitter card: twitter:card, twitter:title, twitter:description
- Schema.org LocalBusiness'i daha detayli yap (telefon, adres, areaServed, openingHours, priceRange)
- H1'de "Kamera" yerine "Güvenlik Kamerası" gibi daha spesifik
- Anahtar kelime zenginligini artir

**Iletisim formu:**
- Formu guncelle: action="/api/teklif" method="POST" olsun (server.js var)

Dosyayi /Users/busebolova/kamerasepeti-web/index.html olarak YAZ.`, {label: 'Ana Sayfa', phase: 'Ana Sayfa ve Temel Yapı'})

phase('Paketler ve Hakkımızda')
const paketlerResult = await agent(`Iki sayfayi temiz URL yapisina gore yeniden yaz:

**1. /Users/busebolova/kamerasepeti-web/paketler/index.html** (paketler.html'den tasi)
- Tum linkleri root-relative yap: paketler.html -> /paketler, index.html -> /, hakkimizda.html -> /hakkimizda, blog.html -> /blog, iletisim.html -> /iletisim
- Canonical: https://www.kamerasepeti.com.tr/paketler
- OG tags ekle (og:title, og:description, og:image, og:url, og:type)
- Twitter card ekle
- Schema.org Product semasi ekle paketler icin (ItemAvailability, offers, price)
- Breadcrumb schema ekle (Ana Sayfa > Paketler)
- Tasarim aynen kalsin, paket kartlari, fiyatlar, select menuler aynen
- Kamera sayisi select menusu ve interaktif fiyat gosterme JS'si (app.js'den geliyor)
- Footer'daki linkleri de guncelle

**2. /Users/busebolova/kamerasepeti-web/hakkimizda/index.html** (hakkimizda.html'den tasi)
- Tum linkleri root-relative yap
- Canonical: https://www.kamerasepeti.com.tr/hakkimizda
- OG tags + Twitter card ekle
- Schema.org LocalBusiness + AboutPage ekle
- Breadcrumb schema
- Footer linkleri guncelle

Her iki dosyayi da YAZ.`, {label: 'Paketler ve Hakkimizda', phase: 'Paketler ve Hakkımızda'})

phase('İletişim ve Form')
const iletisimResult = await agent(`Iletisim sayfasini temiz URL yapisina ve WhatsApp baglantili forma gore yeniden yaz.

Dosya: /Users/busebolova/kamerasepeti-web/iletisim/index.html (iletisim.html'den tasiniyor)

Degisiklikler:

**Link guncellemeleri:** Tum linkler root-relative olsun

**SEO:**
- Canonical: https://www.kamerasepeti.com.tr/iletisim
- OG tags + Twitter card ekle
- Schema.org LocalBusiness + ContactPage ekle (telefon, email, address, areaServed)
- Breadcrumb schema

**WhatsApp entegrasyonu:**
- Iletisim formu submit olunca (app.js ile) su bilgileri al:
  1. Ad Soyad
  2. Telefon
  3. Hizmet Turu (select)
  4. Mesaj
- Ve bir WhatsApp linki ac: https://wa.me/905524602020?text=... (url-encoded mesaj)
- Ayrica form fetch ile /api/teklif endpoint'ine de POST yapsin (sunucuda logsun)
- Formdaki buton "WhatsApp'tan Gonder" olsun yesil renkli

**Tasarim guncellemeleri:**
- WhatsApp kutusu daha dikkat cekici olsun (yesil gradient, buyuk ikon)
- "WhatsApp'tan Hizli Teklif Al" basligi
- Numara tekrar vurgulansin
- Floating WhatsApp butonu zaten var (app.js ile)
- 6 adet contact card'i aynen koru

Dosyayi YAZ.`, {label: 'Iletisim', phase: 'İletişim ve Form'})

phase('Blog')
const blogResult = await agent(`Blog sayfasini ve 6 blog yazisini temiz URL yapisina gore olustur.

**1. /Users/busebolova/kamerasepeti-web/blog/index.html** (blog.html'den tasiniyor)

- Tum linkleri root-relative yap
- Canonical: https://www.kamerasepeti.com.tr/blog
- OG tags + Twitter card
- Schema.org Blog + CollectionPage
- Breadcrumb schema
- 6 blog kartini aynen koru ama her birinin linki /blog/yazi-adi olsun
- Kategoriler sidebar aynen

**2. Her blog yazisi icin ayri dizin ve index.html olustur:**

**a) /Users/busebolova/kamerasepeti-web/blog/ev-icin-en-iyi-kamera-sistemi/index.html**
Baslik: Ev İçin En İyi Kamera Sistemi Nasıl Seçilir?
- 1000+ kelime, Turkce, samimi ve bilgilendirici
- H1, H2, H3 basliklariyla yapilandirilmis
- Icerik: Görüntü kalitesi (2MP vs 5MP), gece görüşü, kayit, mobil izleme, butceye gore oneriler
- Ana sayfaya, paketlere ve iletisime link ver
- OG tags, Schema.org Article, breadcrumb
- CTA: "Sizin icin en uygun paketi mi merak ediyorsunuz? Ucretsiz kesif icin bize ulasin."
- WhatsApp linki: https://wa.me/905524602020

**b) /Users/busebolova/kamerasepeti-web/blog/telefondan-kamera-izleme/index.html**
Baslik: Telefonunuzdan Kameraları Nasıl İzlersiniz?
- iOS ve Android kurulum adimlari, uygulama ayarlari, guvenli uzaktan erisim
- CTA + WhatsApp link

**c) /Users/busebolova/kamerasepeti-web/blog/gece-goruslu-kamera/index.html**
Baslik: Gece Görüşlü Kamera Alırken Nelere Dikkat Edilmeli?
- IR LED mesafesi, renkli gece görüşü, starlight teknolojisi

**d) /Users/busebolova/kamerasepeti-web/blog/is-yeri-kamera-kurulumu/index.html**
Baslik: İş Yeri İçin Kamera Sistemi Kurulum Rehberi
- Kor noktalar, kac kameraya ihtiyac var, yasal gereklilikler

**e) /Users/busebolova/kamerasepeti-web/blog/kamera-kayit-suresi/index.html**
Baslik: Kamera Kayıtları Kaç Gün Saklanır?
- Disk kapasitesi, çözünürlük, kare hizi hesaplamalari

**f) /Users/busebolova/kamerasepeti-web/blog/kamera-arizasi-cozum/index.html**
Baslik: Kamera Arızaları ve İlk Müdahale Rehberi
- Goruntu gelmiyor, kayit yok, gece gormuyor gibi sorunlara pratik cozumler

Her blog yazisi su yapida olsun:
- <!doctype html>, <html lang="tr">
- <head>: charset, viewport, title, meta description, canonical (/blog/yazi-adi), OG tags, Twitter card, Schema.org Article, breadcrumb schema, favicon, styles.css
- <body>: preloader, header (nav linkler root-relative), main (makale icerigi + CTA), footer, floating WhatsApp, app.js
- Nav'da active class blog'a ver
- Sayfa sonu CTA: WhatsApp'a yonlendiren bir section
- Linkler: /, /paketler, /hakkimizda, /blog, /iletisim (root-relative)

Her dosyayi YAZ.`, {label: 'Blog', phase: 'Blog'})

phase('CSS, JS ve Server')
const cssJsResult = await agent(`CSS, JS ve server dosyalarinda guncelleme yap.

**1. /Users/busebolova/kamerasepeti-web/styles.css**
Degisiklikler:
- Mobil navigasyonu iyilestir (980px alti):
  - Bottom navbar zaten var ama "Hakkımızda" linki display:none su anda. Onu goster:
    - 5 link de gorunsun (Ana Sayfa, Paketler, Hakkımızda, Blog, İletişim)
    - 980px altinda 5 grid column yap (simdiki 4'ten 5'e cik)
    - Hakkimizda linkine de icon ekle: content: "ℹ" veya uygun bir sembol
  - nav-links a::before icon'larini guncelle:
    - hakkimizda.html icin icon: content: "ℹ"
    - Hepsini 5 sutuna uygun yap
  - Menu arka plani daha yumusak olsun

- Mobilde yazi fontunu ve spacing'i iyilestir:
  - 680px alti h1 43px -> belki 36px
  - Hero mobilde padding duzelt

- WhatsApp floating buton:
  - Bottom degerini mobilde ayarla (bottom: 100px)

- Formdaki buton yesil olsun
- .page-hero padding biraz azalt
- Blog yazilari icin yeni stiller ekle:
  - .article-content: max-width 760px, line-height 1.8, font-size 18px
  - .article-content h2: margin-top 40px
  - .article-content p: color #34455a
  - .article-content ul, ol: color #34455a
  - .article-hero: minimalist baslik bolumu
  - .article-cta: yazi sonu CTA kutusu (navy background, white text, WhatsApp butonu)

**2. /Users/busebolova/kamerasepeti-web/app.js**
- Iletisim formu submit:
  1. event.preventDefault()
  2. Form verilerini al (name, phone, service, message)
  3. WhatsApp mesaji olustur: "Merhaba, ben ${name}. ${service} hakkında bilgi almak istiyorum. Telefon: ${phone}. ${message}"
  4. URL encode yap
  5. window.open ile WhatsApp linki ac: https://wa.me/905524602020?text=...
  6. Ayni anda fetch ile /api/teklif'e POST (sunucu loglasin)

- Paket select menusu (mevcut kodu koru)

- Preloader (mevcut kodu koru)

- Tumunu YAZ.`, {label: 'CSS JS Server', phase: 'CSS, JS ve Server'})

return { anaSayfaResult, paketlerResult, iletisimResult, blogResult, cssJsResult }
