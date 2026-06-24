const { getDb } = require('./db');
const { hashPassword } = require('./auth');
const data = require('./data');
const { importFromJson } = require('./sync');

function seedIfEmpty() {
  const db = getDb();
  if (!db) return;
  const existing = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (existing && existing.c > 0) {
    // DB already has data — check if content.json has newer admin data to import
    const imported = importFromJson();
    if (imported) console.log('✅ Admin data loaded from content.json');
    return;
  }

  console.log('Seeding database...');

  // ─── Admin User ───
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hashPassword('admin123'));

  // ─── Settings ───
  const settings = {
    site_name: 'Kamera Sepeti',
    site_phone: '0552 460 20 20',
    whatsapp_url: 'https://wa.me/905524602020',
    favicon: '/assets/favicon.png',
    logo_light: '/assets/logo-beyaz.png',
    logo_dark: '/assets/logo-renkli.png',
    hero_title: 'Profesyonel Güvenlik Kamerası Çözümleri',
    hero_desc: '7 gün 24 saat güvenliğiniz için en kaliteli kamera sistemlerini kurulum desteğiyle sunuyoruz.',
    hero_bg: '/assets/hero-kurulum-v2.webp',
    home_trust: JSON.stringify([
      { number: '250+', label: 'Kurulum' },
      { number: '4.9', label: 'Puan' },
      { number: '50+', label: 'Proje' },
      { number: '2', label: 'Yıl Garanti' }
    ]),
    home_services: JSON.stringify([
      { image: '/assets/kurulum-uzmani.png', title: 'İç Mekan Kamera Sistemleri', desc: 'Ev ve ofis içi kullanım için yüksek çözünürlüklü, gece görüşlü kamera sistemleri.' },
      { image: '/assets/is-yeri-kamera-sistemi.webp', title: 'Dış Mekan Kamera Sistemleri', desc: 'Hava koşullarına dayanıklı, 7/24 kesintisiz kayıt yapabilen dış mekan kameraları.' },
      { image: '/assets/ip-kamera-paketi.webp', title: 'IP Kamera Çözümleri', desc: 'Uzaktan erişim ve mobil izleme desteği ile dilediğiniz yerden güvenliğinizi kontrol edin.' }
    ]),
    home_steps: JSON.stringify([
      { title: 'Ücretsiz Keşif', desc: 'Uzman ekibimiz alanınızı ziyaret eder, ihtiyaçlarınızı dinler ve en uygun çözümü belirler.' },
      { title: 'Özelleştirilmiş Teklif', desc: 'Keşif sonrası size özel kamera paketi ve fiyat teklifimizi hazırlarız.' },
      { title: 'Profesyonel Kurulum', desc: 'Kablo düzeninden kamera açılarına kadar titizlikle kurulum yapar, sistemi teslim ederiz.' },
      { title: '7/24 Destek', desc: 'Kurulum sonrası her türlü sorunuzda yanınızda olur, kesintisiz güvenlik sağlarız.' }
    ]),
    paketler_faq: JSON.stringify([
      { question: 'Kamera kurulumu ne kadar sürer?', answer: 'Ortalama bir ev/ofis kurulumu 1-3 saat arasında tamamlanır. Büyük projelerde süre değişebilir.' },
      { question: 'Garanti kapsamı neleri içerir?', answer: 'Tüm ürünlerimiz 2 yıl garantilidir. Garanti, donanım arızalarını ve üretim hatalarını kapsar.' },
      { question: 'Telefonumdan kameraları izleyebilir miyim?', answer: 'Evet, tüm IP kamera sistemlerimiz mobil uygulama desteği sunar. Dilediğiniz yerden 7/24 izleme yapabilirsiniz.' },
      { question: 'Kamera kayıtları ne kadar süre saklanır?', answer: 'Kayıt süresi, harddisk kapasitesine ve kamera sayısına göre değişir. Ortalama 15-30 gün kayıt saklanabilir.' }
    ]),
  };
  for (const [key, value] of Object.entries(settings)) {
    data.setSetting(key, value);
  }

  // ─── Pages ───
  data.upsertPage('hakkimizda', {
    title: 'Hakkımızda',
    hero_title: 'Güvenliğinizi İşimiz Kadar Ciddiye Alıyoruz',
    hero_subtitle: 'Doğru ürün, temiz işçilik ve ulaşılabilir teknik destek anlayışıyla İstanbul genelinde profesyonel kamera sistemleri kuruyoruz.',
    hero_image: '/assets/hero-kurulum-v2.webp',
    content: '<p>Her mekânın güvenlik ihtiyacı farklıdır. Bu nedenle hazır bir sistemi dayatmak yerine alanı, kullanım amacını ve bütçeyi değerlendirerek doğru güvenlik kamerası çözümünü tasarlarız.</p>',
    meta_description: 'Kamera Sepeti hakkında bilgi alın.',
    is_published: 1
  });
  data.upsertPage('kvkk', {
    title: 'KVKK Aydınlatma Metni',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    content: '<p>Kamera Sepeti olarak, kişisel verilerinizin güvenliğine önem vermekteyiz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında sizleri bilgilendirmek amacıyla hazırlanmıştır.</p><p>Kişisel verileriniz, hizmetlerimizi sunabilmek, sizlerle iletişim kurabilmek ve yasal yükümlülüklerimizi yerine getirebilmek amacıyla işlenmektedir.</p>',
    meta_description: 'KVKK Aydınlatma Metni',
    is_published: 1
  });

  // ─── Navigation Items ───
  const navItems = [
    { label: 'Ana Sayfa', url: '/', sort_order: 1, is_active: 1 },
    { label: 'Paketler', url: '/paketler', sort_order: 2, is_active: 1 },
    { label: 'Hizmetlerimiz', url: '/hizmetlerimiz', sort_order: 3, is_active: 1 },
    { label: 'Hakkımızda', url: '/hakkimizda', sort_order: 4, is_active: 1 },
    { label: 'Referanslar', url: '/referanslar', sort_order: 5, is_active: 1 },
    { label: 'Blog', url: '/blog', sort_order: 6, is_active: 1 },
    { label: 'İletişim', url: '/iletisim', sort_order: 7, is_active: 1 },
  ];
  for (const item of navItems) data.createNavItem(item);

  // ─── Footer Sections & Links ───
  const footerSections = [
    { title: 'Menü', sort_order: 1, links: [
      { label: 'Ana Sayfa', url: '/' },
      { label: 'Paketler', url: '/paketler' },
      { label: 'Referanslar', url: '/referanslar' },
    ]},
    { title: 'İçerik', sort_order: 2, links: [
      { label: 'Blog', url: '/blog' },
      { label: 'İletişim', url: '/iletisim' },
      { label: 'KVKK', url: '/kvkk' },
    ]},
    { title: 'Teklif Hattı', sort_order: 3, links: [
      { label: '0552 460 20 20', url: 'tel:05524602020' },
      { label: 'WhatsApp', url: 'https://wa.me/905524602020' },
    ]},
  ];
  for (const section of footerSections) {
    const sectionId = data.createFooterSection({ title: section.title, sort_order: section.sort_order });
    for (const link of section.links) {
      data.createFooterLink({ section_id: sectionId, label: link.label, url: link.url, sort_order: 0 });
    }
  }

  // ─── Contact Info ───
  const contactItems = [
    { type: 'phone', label: 'Telefon', value: '0552 460 20 20', icon: '📞', sort_order: 1 },
    { type: 'email', label: 'E-posta', value: 'info@kamerasepeti.com.tr', icon: '✉', sort_order: 2 },
    { type: 'address', label: 'Adres', value: 'İstanbul, Türkiye', icon: '📍', sort_order: 3 },
    { type: 'text', label: 'Çalışma Saatleri', value: 'Hafta içi 09:00 - 19:00', icon: '🕐', sort_order: 4 },
  ];
  for (const item of contactItems) data.createContactInfo(item);

  // ─── Testimonials ───
  const testimonials = [
    { name: 'Ayşe Yılmaz', title: 'İşletme Sahibi', company: 'Cafe Plus', content: 'Kamera sistemimizi kurdukları günden beri gönül rahatlığıyla işletmemizi izliyorum. Profesyonel ekip ve kaliteli hizmet.', rating: 5, image: '', sort_order: 1, is_published: 1 },
    { name: 'Mehmet Kaya', title: 'Site Yöneticisi', company: 'Yıldız Rezidans', content: 'Bloklarımızın güvenliği için 16 kameralık bir sistem kuruldu. Montaj çok temiz yapıldı, görüntü kalitesi harika.', rating: 5, image: '', sort_order: 2, is_published: 1 },
    { name: 'Zeynep Demir', title: 'Müdür', company: 'Özel Eğitim Merkezi', content: 'Özellikle çocukların güvenliği için kurduğumuz sistem sayesinde velilerimiz çok memnun. Teşekkürler Kamera Sepeti.', rating: 5, image: '', sort_order: 3, is_published: 1 },
    { name: 'Ali Öztürk', title: 'İşletme Sahibi', company: 'Öztürk Oto Galeri', content: 'Gece görüş kameraları sayesinde araçlarımız 7/24 güvende. Kurulum sonrası teknik destek de çok iyi.', rating: 4, image: '', sort_order: 4, is_published: 1 },
    { name: 'Elif Şahin', title: 'Ev Sahibi', company: '', content: 'Evim için 4 kameralık bir paket aldım. Mobil uygulamadan anlık izleme yapabiliyorum, çok kullanışlı.', rating: 5, image: '', sort_order: 5, is_published: 1 },
  ];
  for (const t of testimonials) data.createTestimonial(t);

  // ─── Projects ───
  const projects = [
    { title: 'Yıldız Rezidans Güvenlik Sistemi', description: '16 adet IP kamera, NVR kayıt cihazı ve mobil izleme altyapısı ile site genelinde kapsamlı güvenlik çözümü.', image: '/assets/ev-kamera-sistemi.webp', category: 'Toplu Konut', client: 'Yıldız Rezidans', sort_order: 1, is_published: 1 },
    { title: 'Cafe Plus İç Mekan Güvenlik', description: '4 adet mini dome kamera ile kafe içi ve dış alan güvenliği sağlandı. Gece görüş destekli sistem.', image: '/assets/gece-goruslu-kamera.webp', category: 'İşletme', client: 'Cafe Plus', sort_order: 2, is_published: 1 },
    { title: 'Özel Eğitim Merkezi Kamera Sistemi', description: '8 kameralı sistem ile tüm sınıflar ve giriş çıkışlar 7/24 izleniyor. Veli bilgilendirme panosu entegre edildi.', image: '/assets/is-yeri-kamera-sistemi.webp', category: 'Eğitim', client: 'Özel Eğitim Merkezi', sort_order: 3, is_published: 1 },
    { title: 'Öztürk Oto Galeri Dış Mekan Çözümü', description: '6 adet gece görüşlü ultra HD kamera ile açık otopark 7/24 güvenlik altında.', image: '/assets/mobil-kamera-izleme.webp', category: 'Ticari', client: 'Öztürk Oto Galeri', sort_order: 4, is_published: 1 },
  ];
  for (const p of projects) data.createProject(p);

  // ─── Packages ───
  const packages = [
    // Ekonomik Paketler
    { slug: 'baslangic-paketi', name: 'Başlangıç Paketi', subtitle: '2 Kameralı Sistem', price: 7990, price_label: 'TL + KDV', features: '2 Adet Full HD Kamera\n1080p Çözünürlük\nGece Görüş (30m)\n4 Kanal Kayıt Cihazı\n500GB Harddisk\nMobil İzleme Desteği\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":2,"price":7990},{"count":4,"price":12990}]', category: 'ekonomik', is_popular: 0, is_published: 1, sort_order: 1 },
    { slug: 'standart-paket', name: 'Standart Paket', subtitle: '4 Kameralı Sistem', price: 12990, price_label: 'TL + KDV', features: '4 Adet Full HD Kamera\n1080p Çözünürlük\nGece Görüş (40m)\n8 Kanal Kayıt Cihazı\n1TB Harddisk\nMobil İzleme Desteği\nSes Kaydı Desteği\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":4,"price":12990},{"count":8,"price":21990}]', category: 'ekonomik', is_popular: 1, is_published: 1, sort_order: 2 },

    // Premium Paketler
    { slug: 'premium-4', name: 'Premium 4', subtitle: '4 Kameralı Sistem', price: 14990, price_label: 'TL + KDV', features: '4 Adet 2K Kamera\n2K Çözünürlük\nGece Görüş (40m)\n8 Kanal Kayıt Cihazı\n1TB Harddisk\nMobil İzleme Desteği\nSes Kaydı Desteği\nHareket Algılama\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":4,"price":14990},{"count":8,"price":21990}]', category: 'premium', is_popular: 0, is_published: 1, sort_order: 3 },
    { slug: 'premium-8', name: 'Premium 8', subtitle: '8 Kameralı Sistem', price: 21990, price_label: 'TL + KDV', features: '8 Adet 2K Kamera\n2K Çözünürlük\nGece Görüş (50m)\n16 Kanal Kayıt Cihazı\n2TB Harddisk\nMobil İzleme Desteği\nSes Kaydı Desteği\nHareket Algılama\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":4,"price":14990},{"count":8,"price":21990},{"count":16,"price":34990}]', category: 'premium', is_popular: 1, is_published: 1, sort_order: 4 },
    { slug: 'premium-16', name: 'Premium 16', subtitle: '16 Kameralı Sistem', price: 34990, price_label: 'TL + KDV', features: '16 Adet 2K Kamera\n2K Çözünürlük\nGece Görüş (60m)\n32 Kanal Kayıt Cihazı\n4TB Harddisk\nMobil İzleme Desteği\nSes Kaydı Desteği\nHareket Algılama + Alarm\nUPS Kesintisiz Güç\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":8,"price":26990},{"count":16,"price":34990},{"count":32,"price":59990}]', category: 'premium', is_popular: 0, is_published: 1, sort_order: 5 },

    // Pro IP Paketler
    { slug: 'pro-ip-8', name: 'Pro IP 8', subtitle: '8 Kameralı 4K Sistem', price: 32990, price_label: 'TL + KDV', features: '8 Adet 4K Ultra HD IP Kamera\n4K Çözünürlük\nGece Görüş (50m)\n16 Kanal NVR Kayıt Cihazı\n2TB Harddisk\nPoE Switch Dahil\nMobil İzleme Desteği\nSes Kaydı Desteği\nHareket Algılama\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":8,"price":32990},{"count":16,"price":49990}]', category: 'pro_ip', is_popular: 0, is_published: 1, sort_order: 6 },
    { slug: 'pro-ip-16', name: 'Pro IP 16', subtitle: '16 Kameralı 4K Sistem', price: 49990, price_label: 'TL + KDV', features: '16 Adet 4K Ultra HD IP Kamera\n4K Çözünürlük\nGece Görüş (60m)\n32 Kanal NVR Kayıt Cihazı\n4TB Harddisk\nPoE Switch Dahil\nMobil İzleme Desteği\nSes Kaydı Desteği\nHareket Algılama + Alarm\nUPS Kesintisiz Güç\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":8,"price":32990},{"count":16,"price":49990},{"count":32,"price":89990}]', category: 'pro_ip', is_popular: 1, is_published: 1, sort_order: 7 },
    { slug: 'pro-ip-32', name: 'Pro IP 32', subtitle: '32 Kameralı 4K Sistem', price: 89990, price_label: 'TL + KDV', features: '32 Adet 4K Ultra HD IP Kamera\n4K Çözünürlük\nGece Görüş (60m)\n64 Kanal NVR Kayıt Cihazı\n8TB Harddisk\nPoE Switch Dahil\nMobil İzleme Desteği\nSes Kaydı Desteği\nHareket Algılama + Alarm\nUPS Kesintisiz Güç\nKablo & Ekipman Dahil\nProfesyonel Kurulum', pricing_json: '[{"count":16,"price":74990},{"count":32,"price":89990}]', category: 'pro_ip', is_popular: 0, is_published: 1, sort_order: 8 },
  ];
  for (const p of packages) data.createPackage(p);

  // ─── Blog Posts ───
  const posts = [
    {
      slug: 'ev-guvenlik-kamerasi-sistemi-kurulum-rehberi',
      title: 'Ev Güvenlik Kamerası Sistemi Kurulum Rehberi',
      summary: 'Eviniz için doğru güvenlik kamerası sistemini seçmek ve kurulum süreci hakkında bilmeniz gereken her şey.',
      content: '<p>Ev güvenliği, modern yaşamın en önemli ihtiyaçlarından biri haline geldi. Doğru kamera sistemi seçimi ve profesyonel kurulum, evinizi 7/24 güvende tutmanın ilk adımıdır.</p><h3>Kamera Seçerken Nelere Dikkat Etmelisiniz?</h3><p>Öncelikle evinizin büyüklüğü ve hangi alanları izlemek istediğiniz önemlidir. Giriş kapısı, arka bahçe, garaj gibi kritik noktalara öncelik vermelisiniz.</p><h3>Profesyonel Kurulum Neden Önemlidir?</h3><p>Kablolama, kamera açıları ve kayıt cihazı konfigürasyonu profesyonel bir ekip tarafından yapıldığında sistemin verimliliği maksimum seviyeye çıkar.</p>',
      category: 'Güvenlik',
      tags: 'güvenlik, ev güvenliği, kamera sistemi, kurulum',
      image: '/assets/ev-kamera-sistemi.webp',
      is_published: 1,
      published_at: '2026-06-15'
    },
    {
      slug: 'ip-kamera-ve-ahd-kamera-arasindaki-farklar',
      title: 'IP Kamera ve AHD Kamera Arasındaki Farklar',
      summary: 'IP ve AHD kamera teknolojileri arasındaki farkları, avantajları ve hangi durumda hangisini tercih etmeniz gerektiğini açıklıyoruz.',
      content: '<p>Güvenlik kamerası alırken en çok karşılaşılan sorulardan biri: IP mi yoksa AHD mi? Her iki teknolojinin de kendine özgü avantajları bulunuyor.</p><h3>IP Kamera Sistemleri</h3><p>IP kameralar, yüksek çözünürlük ve esneklik sunar. CAT6 kablo ile hem veri hem de güç iletimi yapılabilir (PoE). Uzaktan erişim ve mobil izleme için idealdir.</p><h3>AHD Kamera Sistemleri</h3><p>AHD kameralar, mevcut koaksiyel kablo altyapısını kullanabilir. Daha ekonomik bir çözüm sunar ve yeterli görüntü kalitesi sağlar.</p>',
      category: 'Teknoloji',
      tags: 'IP kamera, AHD kamera, kamera teknolojisi, güvenlik',
      image: '/assets/ip-kamera-paketi.webp',
      author: 'Kamera Sepeti Uzman Ekibi',
      reading_time: '5 dk okuma',
      is_published: 1,
      published_at: '2026-06-10'
    },
    {
      slug: 'is-yeri-guvenlik-kamerasi-sistemi-rehberi',
      title: 'İş Yeri Güvenlik Kamerası Sistemi Rehberi',
      summary: 'İş yeriniz için güvenlik kamerası sistemi kurarken dikkat etmeniz gerekenler ve yasal yükümlülükler.',
      content: '<p>İş yeri güvenliği, çalışanlarınızın ve işletmenizin huzuru için kritik öneme sahiptir. Doğru planlanmış bir kamera sistemi, olası riskleri minimize eder.</p><h3>Yasal Düzenlemeler</h3><p>İş yerlerinde kamera kullanımı, KVKK kapsamında belirli kurallara tabidir. Çalışanların ve müşterilerin bilgilendirilmesi zorunludur.</p><h3>Hangi Alanlar İzlenmeli?</h3><p>Giriş-çıkış noktaları, kasa bölgesi, depo alanları ve ortak kullanım alanları öncelikli izlenmesi gereken bölgelerdir.</p>',
      category: 'Güvenlik',
      tags: 'iş yeri güvenliği, kamera sistemi, KVKK, güvenlik',
      image: '/assets/mobil-kamera-izleme.webp',
      author: 'Kamera Sepeti Uzman Ekibi',
      reading_time: '4 dk okuma',
      is_published: 1,
      published_at: '2026-06-05'
    },
  ];
  for (const post of posts) data.createBlogPost(post);

  console.log('Seed complete!');

  // After seed, try to load admin data from content.json (for Vercel deploys)
  const imported = importFromJson();
  if (imported) console.log('✅ Admin data loaded from content.json');
}

module.exports = { seedIfEmpty };
