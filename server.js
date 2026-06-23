const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { initDb, getDb, closeDb } = require('./lib/db');
const data = require('./lib/data');
const { hashPassword, checkPassword, requireAuth } = require('./lib/auth');

// ─── Init ───
initDb();
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Settings ───
const STATIC_ROOT = __dirname;

// ─── Middleware ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'kamerasepeti-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// Static files — assets, uploads, css, js at root
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(STATIC_ROOT, { index: false, redirect: false }));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Global template vars ───
app.use(async (req, res, next) => {
  const navItems = data.getNavItems();
  const footerData = data.getAllFooterData();
  const contactInfo = data.getContactInfo();
  const siteName = data.getSetting('site_name', 'Kamera Sepeti');
  const sitePhone = data.getSetting('site_phone', '0552 460 20 20');
  const whatsappUrl = data.getSetting('whatsapp_url', 'https://wa.me/905524602020');
  const logoLight = data.getSetting('logo_light', '/assets/logo-beyaz.png');
  const logoDark = data.getSetting('logo_dark', '/assets/logo-renkli.png');
  const favicon = data.getSetting('favicon', '/assets/favicon.png');

  res.locals = {
    navItems,
    footerData,
    contactInfo,
    siteName,
    sitePhone,
    whatsappUrl,
    logoLight,
    logoDark,
    favicon,
    currentPath: req.path,
    admin: req.session?.admin || null,
  };
  next();
});

// ─── Public Routes ───

// Home
app.get('/', (req, res) => {
  const services = JSON.parse(data.getSetting('home_services', '[]'));
  const steps = JSON.parse(data.getSetting('home_steps', '[]'));
  const trustItems = JSON.parse(data.getSetting('home_trust', '[]'));
  const heroTitle = data.getSetting('hero_title');
  const heroDesc = data.getSetting('hero_desc');
  const heroBg = data.getSetting('hero_bg', '/assets/hero-kurulum-v2.webp');
  res.render('index', { services, steps, trustItems, heroTitle, heroDesc, heroBg });
});

// Packages
app.get('/paketler', (req, res) => {
  const packages = data.getAllPackages();
  const faq = JSON.parse(data.getSetting('paketler_faq', '[]'));
  res.render('paketler', { packages, faq });
});

// Hakkimizda
app.get('/hakkimizda', (req, res) => {
  const page = data.getPage('hakkimizda');
  res.render('hakkimizda', { page });
});

// Referanslar
app.get('/referanslar', (req, res) => {
  const testimonials = data.getPublishedTestimonials();
  const projects = data.getPublishedProjects();
  res.render('referanslar', { testimonials, projects });
});

// Blog index
app.get('/blog', (req, res) => {
  const posts = data.getPublishedBlogPosts();
  const categories = data.getBlogCategories();
  res.render('blog/index', { posts, categories });
});

// Blog single
app.get('/blog/:slug', (req, res) => {
  const post = data.getBlogPost(req.params.slug);
  if (!post) return res.status(404).render('404');
  const { prev, next } = data.getAdjacentBlogPosts(req.params.slug);
  res.render('blog/post', { post, prev, next });
});

// Iletisim
app.get('/iletisim', (req, res) => {
  res.render('iletisim');
});

// KVKK
app.get('/kvkk', (req, res) => {
  const page = data.getPage('kvkk');
  res.render('kvkk', { page });
});

// ─── API Routes ───
app.post('/api/teklif', (req, res) => {
  const { name, phone, service, message } = req.body;
  const logLine = `[${new Date().toLocaleString('tr-TR')}] ${name} | ${phone} | ${service} | ${(message||'').slice(0,100)}\n`;
  fs.appendFileSync(path.join(__dirname, 'teklifler.log'), logLine);
  console.log('TEKLIF:', name, phone, service);
  res.json({ success: true });
});

// ─── Admin Auth Routes ───
app.get('/admin/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin/login');
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (user && checkPassword(password, user.password_hash)) {
    req.session.admin = { id: user.id, username: user.username };
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: 'Hatalı kullanıcı adı veya şifre' });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ─── Admin Panel Routes ───
app.get('/admin', requireAuth, (req, res) => {
  const db = getDb();
  const postCount = db.prepare('SELECT COUNT(*) as c FROM blog_posts').get().c;
  const testimonialCount = db.prepare('SELECT COUNT(*) as c FROM testimonials').get().c;
  const projectCount = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  const mediaCount = db.prepare('SELECT COUNT(*) as c FROM media').get().c;
  res.render('admin/dashboard', { postCount, testimonialCount, projectCount, mediaCount });
});

// ─── Admin: Settings ───
app.get('/admin/ayarlar', requireAuth, (req, res) => {
  const allSettings = data.getAllSettings();
  res.render('admin/ayarlar', { settings: allSettings });
});

app.post('/admin/ayarlar', requireAuth, (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    data.setSetting(key, value);
  }
  res.redirect('/admin/ayarlar');
});

// ─── Admin: Blog ───
app.get('/admin/blog', requireAuth, (req, res) => {
  const posts = data.getAllBlogPosts();
  res.render('admin/blog-list', { posts });
});

app.get('/admin/blog/yeni', requireAuth, (req, res) => {
  res.render('admin/blog-form', { post: null });
});

app.get('/admin/blog/duzenle/:id', requireAuth, (req, res) => {
  const post = data.getBlogPostById(req.params.id);
  if (!post) return res.redirect('/admin/blog');
  res.render('admin/blog-form', { post });
});

app.post('/admin/blog/kaydet', requireAuth, (req, res) => {
  const { id, slug, title, summary, content, category, tags, image, author, reading_time, published_at, is_published } = req.body;
  const item = { slug, title, summary, content, category, tags, image, author, reading_time, published_at, is_published: is_published ? 1 : 0 };
  if (id) {
    data.updateBlogPost(id, item);
  } else {
    data.createBlogPost(item);
  }
  res.redirect('/admin/blog');
});

app.post('/admin/blog/sil/:id', requireAuth, (req, res) => {
  data.deleteBlogPost(req.params.id);
  res.redirect('/admin/blog');
});

// ─── Admin: Testimonials ───
app.get('/admin/referanslar', requireAuth, (req, res) => {
  const testimonials = data.getAllTestimonials();
  res.render('admin/testimonial-list', { testimonials });
});

app.get('/admin/referanslar/yeni', requireAuth, (req, res) => {
  res.render('admin/testimonial-form', { t: null });
});

app.get('/admin/referanslar/duzenle/:id', requireAuth, (req, res) => {
  const t = data.getTestimonial(req.params.id);
  if (!t) return res.redirect('/admin/referanslar');
  res.render('admin/testimonial-form', { t });
});

app.post('/admin/referanslar/kaydet', requireAuth, (req, res) => {
  const { id, name, title, company, content, rating, image, sort_order, is_published } = req.body;
  const item = { name, title, company, content, rating: parseInt(rating) || 5, image, sort_order: parseInt(sort_order) || 0, is_published: is_published ? 1 : 0 };
  if (id) {
    data.updateTestimonial(id, item);
  } else {
    data.createTestimonial(item);
  }
  res.redirect('/admin/referanslar');
});

app.post('/admin/referanslar/sil/:id', requireAuth, (req, res) => {
  data.deleteTestimonial(req.params.id);
  res.redirect('/admin/referanslar');
});

// ─── Admin: Projects ───
app.get('/admin/projeler', requireAuth, (req, res) => {
  const projects = data.getAllProjects();
  res.render('admin/project-list', { projects });
});

app.get('/admin/projeler/yeni', requireAuth, (req, res) => {
  res.render('admin/project-form', { p: null });
});

app.get('/admin/projeler/duzenle/:id', requireAuth, (req, res) => {
  const p = data.getProject(req.params.id);
  if (!p) return res.redirect('/admin/projeler');
  res.render('admin/project-form', { p });
});

app.post('/admin/projeler/kaydet', requireAuth, (req, res) => {
  const { id, title, description, image, category, client, sort_order, is_published } = req.body;
  const item = { title, description, image, category, client, sort_order: parseInt(sort_order) || 0, is_published: is_published ? 1 : 0 };
  if (id) {
    data.updateProject(id, item);
  } else {
    data.createProject(item);
  }
  res.redirect('/admin/projeler');
});

app.post('/admin/projeler/sil/:id', requireAuth, (req, res) => {
  data.deleteProject(req.params.id);
  res.redirect('/admin/projeler');
});

// ─── Admin: Navigation ───
app.get('/admin/menu', requireAuth, (req, res) => {
  const navItems = data.getNavItems();
  const allNav = getDb().prepare('SELECT * FROM nav_items ORDER BY sort_order ASC').all();
  res.render('admin/menu', { navItems, allNav });
});

app.post('/admin/menu/kaydet', requireAuth, (req, res) => {
  const { id, label, url, sort_order, is_active } = req.body;
  const item = { label, url, sort_order: parseInt(sort_order) || 0, is_active: is_active ? 1 : 0 };
  if (id) {
    data.updateNavItem(id, item);
  } else {
    data.createNavItem(item);
  }
  res.redirect('/admin/menu');
});

app.post('/admin/menu/sil/:id', requireAuth, (req, res) => {
  data.deleteNavItem(req.params.id);
  res.redirect('/admin/menu');
});

// ─── Admin: Footer ───
app.get('/admin/footer', requireAuth, (req, res) => {
  const sections = data.getFooterSections();
  const sectionLinks = {};
  for (const s of sections) {
    sectionLinks[s.id] = data.getFooterLinks(s.id);
  }
  res.render('admin/footer', { sections, sectionLinks });
});

app.post('/admin/footer/section/kaydet', requireAuth, (req, res) => {
  const { id, title, sort_order } = req.body;
  if (id) {
    data.updateFooterSection(id, { title, sort_order: parseInt(sort_order) || 0 });
  } else {
    data.createFooterSection({ title, sort_order: parseInt(sort_order) || 0 });
  }
  res.redirect('/admin/footer');
});

app.post('/admin/footer/section/sil/:id', requireAuth, (req, res) => {
  data.deleteFooterSection(req.params.id);
  res.redirect('/admin/footer');
});

app.post('/admin/footer/link/kaydet', requireAuth, (req, res) => {
  const { id, section_id, label, url, sort_order } = req.body;
  if (id) {
    data.updateFooterLink(id, { section_id, label, url, sort_order: parseInt(sort_order) || 0 });
  } else {
    data.createFooterLink({ section_id, label, url, sort_order: parseInt(sort_order) || 0 });
  }
  res.redirect('/admin/footer');
});

app.post('/admin/footer/link/sil/:id', requireAuth, (req, res) => {
  data.deleteFooterLink(req.params.id);
  res.redirect('/admin/footer');
});

// ─── Admin: İletişim ───
app.get('/admin/iletisim', requireAuth, (req, res) => {
  const info = data.getContactInfo();
  res.render('admin/contact', { info });
});

app.post('/admin/iletisim/kaydet', requireAuth, (req, res) => {
  const { id, type, label, value, icon, sort_order } = req.body;
  const item = { type, label, value, icon, sort_order: parseInt(sort_order) || 0 };
  if (id) {
    data.updateContactInfo(id, item);
  } else {
    data.createContactInfo(item);
  }
  res.redirect('/admin/iletisim');
});

app.post('/admin/iletisim/sil/:id', requireAuth, (req, res) => {
  data.deleteContactInfo(req.params.id);
  res.redirect('/admin/iletisim');
});

// ─── Admin: Packages ───
app.get('/admin/paketler', requireAuth, (req, res) => {
  const packages = getDb().prepare('SELECT * FROM packages ORDER BY sort_order ASC').all();
  res.render('admin/package-list', { packages });
});

app.get('/admin/paketler/yeni', requireAuth, (req, res) => {
  res.render('admin/package-form', { p: null });
});

app.get('/admin/paketler/duzenle/:id', requireAuth, (req, res) => {
  const p = getDb().prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id);
  if (!p) return res.redirect('/admin/paketler');
  res.render('admin/package-form', { p });
});

app.post('/admin/paketler/kaydet', requireAuth, (req, res) => {
  const { id, slug, name, subtitle, price, price_label, features, is_popular, is_published, sort_order } = req.body;
  const item = { slug, name, subtitle, price: parseInt(price) || 0, price_label, features, is_popular: is_popular ? 1 : 0, is_published: is_published ? 1 : 0, sort_order: parseInt(sort_order) || 0 };
  if (id) {
    data.updatePackage(id, item);
  } else {
    data.createPackage(item);
  }
  res.redirect('/admin/paketler');
});

app.post('/admin/paketler/sil/:id', requireAuth, (req, res) => {
  data.deletePackage(req.params.id);
  res.redirect('/admin/paketler');
});

// ─── Admin: Media ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, ''))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/admin/medya', requireAuth, (req, res) => {
  const media = data.getAllMedia();
  res.render('admin/media', { media });
});

app.post('/admin/medya/yukle', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.redirect('/admin/medya');
  data.createMedia({
    filename: req.file.filename,
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    size: req.file.size,
    alt_text: req.body.alt_text || ''
  });
  res.redirect('/admin/medya');
});

app.post('/admin/medya/sil/:id', requireAuth, (req, res) => {
  const m = data.deleteMedia(req.params.id);
  if (m) {
    const fp = path.join(__dirname, 'uploads', m.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  res.redirect('/admin/medya');
});

// ─── 404 ───
app.use((req, res) => {
  if (req.path.startsWith('/admin/')) return res.redirect('/admin/login');
  res.status(404).render('404');
});

// ─── Start ───
app.listen(PORT, () => console.log(`Kamera Sepeti -> http://localhost:${PORT}`));
