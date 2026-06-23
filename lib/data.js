const { getDb } = require('./db');

// ─── Settings ───
function getSetting(key, def = '') {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : def;
}

function setSetting(key, value) {
  getDb().prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(key, value);
}

function getAllSettings() {
  const rows = getDb().prepare('SELECT key, value FROM settings').all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  return obj;
}

// ─── Pages ───
function getPage(slug) {
  return getDb().prepare('SELECT * FROM pages WHERE slug = ? AND is_published = 1').get(slug);
}

function getAllPages() {
  return getDb().prepare('SELECT * FROM pages ORDER BY id').all();
}

function upsertPage(slug, data) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM pages WHERE slug = ?').get(slug);
  if (existing) {
    db.prepare(`UPDATE pages SET title=@title, hero_title=@hero_title, hero_subtitle=@hero_subtitle,
      hero_image=@hero_image, content=@content, meta_description=@meta_description,
      is_published=@is_published, updated_at=datetime('now') WHERE slug=@slug`).run({ slug, ...data });
  } else {
    db.prepare(`INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, content, meta_description, is_published)
      VALUES (@slug, @title, @hero_title, @hero_subtitle, @hero_image, @content, @meta_description, @is_published)`).run({ slug, ...data });
  }
}

function deletePage(slug) {
  getDb().prepare('DELETE FROM pages WHERE slug = ?').run(slug);
}

// ─── Blog ───
function getBlogPost(slug) {
  return getDb().prepare('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1').get(slug);
}

function getBlogPostById(id) {
  return getDb().prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
}

function getAllBlogPosts() {
  return getDb().prepare('SELECT * FROM blog_posts ORDER BY published_at DESC').all();
}

function getPublishedBlogPosts() {
  return getDb().prepare('SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC').all();
}

function createBlogPost(data) {
  const db = getDb();
  const r = db.prepare(`INSERT INTO blog_posts (slug, title, summary, content, category, tags, image, author, reading_time, published_at, is_published)
    VALUES (@slug, @title, @summary, @content, @category, @tags, @image, @author, @reading_time, @published_at, @is_published)`).run(data);
  return r.lastInsertRowid;
}

function updateBlogPost(id, data) {
  getDb().prepare(`UPDATE blog_posts SET slug=@slug, title=@title, summary=@summary, content=@content,
    category=@category, tags=@tags, image=@image, author=@author, reading_time=@reading_time,
    published_at=@published_at, is_published=@is_published, updated_at=datetime('now') WHERE id=@id`).run({ id, ...data });
}

function deleteBlogPost(id) {
  getDb().prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
}

function getAdjacentBlogPosts(slug) {
  const db = getDb();
  const current = db.prepare('SELECT published_at, id FROM blog_posts WHERE slug = ? AND is_published = 1').get(slug);
  if (!current) return { prev: null, next: null };
  const prev = db.prepare(`SELECT slug, title FROM blog_posts WHERE is_published = 1 AND (published_at < ? OR (published_at = ? AND id < ?)) ORDER BY published_at DESC, id DESC LIMIT 1`).get(current.published_at, current.published_at, current.id);
  const next = db.prepare(`SELECT slug, title FROM blog_posts WHERE is_published = 1 AND (published_at > ? OR (published_at = ? AND id > ?)) ORDER BY published_at ASC, id ASC LIMIT 1`).get(current.published_at, current.published_at, current.id);
  return { prev: prev || null, next: next || null };
}

function getBlogCategories() {
  return getDb().prepare(`SELECT category, COUNT(*) as count FROM blog_posts WHERE is_published = 1 AND category != '' GROUP BY category ORDER BY count DESC`).all();
}

// ─── Testimonials ───
function getAllTestimonials() {
  return getDb().prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, id DESC').all();
}

function getPublishedTestimonials() {
  return getDb().prepare('SELECT * FROM testimonials WHERE is_published = 1 ORDER BY sort_order ASC, id DESC').all();
}

function getTestimonial(id) {
  return getDb().prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
}

function createTestimonial(data) {
  return getDb().prepare(`INSERT INTO testimonials (name, title, company, content, rating, image, sort_order, is_published)
    VALUES (@name, @title, @company, @content, @rating, @image, @sort_order, @is_published)`).run(data).lastInsertRowid;
}

function updateTestimonial(id, data) {
  getDb().prepare(`UPDATE testimonials SET name=@name, title=@title, company=@company, content=@content,
    rating=@rating, image=@image, sort_order=@sort_order, is_published=@is_published WHERE id=@id`).run({ id, ...data });
}

function deleteTestimonial(id) {
  getDb().prepare('DELETE FROM testimonials WHERE id = ?').run(id);
}

// ─── Projects ───
function getAllProjects() {
  return getDb().prepare('SELECT * FROM projects ORDER BY sort_order ASC, id DESC').all();
}

function getPublishedProjects() {
  return getDb().prepare('SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, id DESC').all();
}

function getProject(id) {
  return getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function createProject(data) {
  return getDb().prepare(`INSERT INTO projects (title, description, image, category, client, sort_order, is_published)
    VALUES (@title, @description, @image, @category, @client, @sort_order, @is_published)`).run(data).lastInsertRowid;
}

function updateProject(id, data) {
  getDb().prepare(`UPDATE projects SET title=@title, description=@description, image=@image,
    category=@category, client=@client, sort_order=@sort_order, is_published=@is_published WHERE id=@id`).run({ id, ...data });
}

function deleteProject(id) {
  getDb().prepare('DELETE FROM projects WHERE id = ?').run(id);
}

// ─── Navigation ───
function getNavItems() {
  return getDb().prepare('SELECT * FROM nav_items WHERE is_active = 1 ORDER BY sort_order ASC').all();
}

function createNavItem(data) {
  return getDb().prepare(`INSERT INTO nav_items (label, url, sort_order, is_active)
    VALUES (@label, @url, @sort_order, @is_active)`).run(data).lastInsertRowid;
}

function updateNavItem(id, data) {
  getDb().prepare(`UPDATE nav_items SET label=@label, url=@url, sort_order=@sort_order, is_active=@is_active WHERE id=@id`).run({ id, ...data });
}

function deleteNavItem(id) {
  getDb().prepare('DELETE FROM nav_items WHERE id = ?').run(id);
}

// ─── Footer ───
function getFooterSections() {
  return getDb().prepare('SELECT * FROM footer_sections ORDER BY sort_order ASC').all();
}

function getFooterLinks(sectionId) {
  return getDb().prepare('SELECT * FROM footer_links WHERE section_id = ? ORDER BY sort_order ASC').all(sectionId);
}

function getAllFooterData() {
  const sections = getFooterSections();
  return sections.map(s => ({ ...s, links: getFooterLinks(s.id) }));
}

function createFooterSection(data) {
  return getDb().prepare(`INSERT INTO footer_sections (title, sort_order) VALUES (@title, @sort_order)`).run(data).lastInsertRowid;
}

function updateFooterSection(id, data) {
  getDb().prepare(`UPDATE footer_sections SET title=@title, sort_order=@sort_order WHERE id=@id`).run({ id, ...data });
}

function deleteFooterSection(id) {
  getDb().prepare('DELETE FROM footer_sections WHERE id = ?').run(id);
}

function createFooterLink(data) {
  return getDb().prepare(`INSERT INTO footer_links (section_id, label, url, sort_order) VALUES (@section_id, @label, @url, @sort_order)`).run(data).lastInsertRowid;
}

function updateFooterLink(id, data) {
  getDb().prepare(`UPDATE footer_links SET label=@label, url=@url, sort_order=@sort_order WHERE id=@id`).run({ id, ...data });
}

function deleteFooterLink(id) {
  getDb().prepare('DELETE FROM footer_links WHERE id = ?').run(id);
}

// ─── Contact Info ───
function getContactInfo() {
  return getDb().prepare('SELECT * FROM contact_info ORDER BY sort_order ASC').all();
}

function createContactInfo(data) {
  return getDb().prepare(`INSERT INTO contact_info (type, label, value, icon, sort_order)
    VALUES (@type, @label, @value, @icon, @sort_order)`).run(data).lastInsertRowid;
}

function updateContactInfo(id, data) {
  getDb().prepare(`UPDATE contact_info SET type=@type, label=@label, value=@value, icon=@icon, sort_order=@sort_order WHERE id=@id`).run({ id, ...data });
}

function deleteContactInfo(id) {
  getDb().prepare('DELETE FROM contact_info WHERE id = ?').run(id);
}

// ─── Packages ───
function getAllPackages() {
  return getDb().prepare('SELECT * FROM packages WHERE is_published = 1 ORDER BY sort_order ASC').all();
}

function getPackage(slug) {
  return getDb().prepare('SELECT * FROM packages WHERE slug = ? AND is_published = 1').get(slug);
}

function createPackage(data) {
  return getDb().prepare(`INSERT INTO packages (slug, name, subtitle, price, price_label, features, is_popular, is_published, sort_order)
    VALUES (@slug, @name, @subtitle, @price, @price_label, @features, @is_popular, @is_published, @sort_order)`).run(data).lastInsertRowid;
}

function updatePackage(id, data) {
  getDb().prepare(`UPDATE packages SET slug=@slug, name=@name, subtitle=@subtitle, price=@price,
    price_label=@price_label, features=@features, is_popular=@is_popular,
    is_published=@is_published, sort_order=@sort_order WHERE id=@id`).run({ id, ...data });
}

function deletePackage(id) {
  getDb().prepare('DELETE FROM packages WHERE id = ?').run(id);
}

// ─── FAQ ───
function getAllFaq() {
  return getDb().prepare('SELECT * FROM faq_items WHERE is_published = 1 ORDER BY sort_order ASC').all();
}

function createFaq(data) {
  return getDb().prepare(`INSERT INTO faq_items (question, answer, category, sort_order, is_published)
    VALUES (@question, @answer, @category, @sort_order, @is_published)`).run(data).lastInsertRowid;
}

function updateFaq(id, data) {
  getDb().prepare(`UPDATE faq_items SET question=@question, answer=@answer, category=@category,
    sort_order=@sort_order, is_published=@is_published WHERE id=@id`).run({ id, ...data });
}

function deleteFaq(id) {
  getDb().prepare('DELETE FROM faq_items WHERE id = ?').run(id);
}

// ─── Media ───
function getAllMedia() {
  return getDb().prepare('SELECT * FROM media ORDER BY created_at DESC').all();
}

function createMedia(data) {
  return getDb().prepare(`INSERT INTO media (filename, original_name, mime_type, size, alt_text)
    VALUES (@filename, @original_name, @mime_type, @size, @alt_text)`).run(data).lastInsertRowid;
}

function deleteMedia(id) {
  const m = getDb().prepare('SELECT * FROM media WHERE id = ?').get(id);
  getDb().prepare('DELETE FROM media WHERE id = ?').run(id);
  return m;
}

module.exports = {
  getSetting, setSetting, getAllSettings,
  getPage, getAllPages, upsertPage, deletePage,
  getBlogPost, getBlogPostById, getAllBlogPosts, getPublishedBlogPosts,
  createBlogPost, updateBlogPost, deleteBlogPost, getAdjacentBlogPosts, getBlogCategories,
  getAllTestimonials, getPublishedTestimonials, getTestimonial,
  createTestimonial, updateTestimonial, deleteTestimonial,
  getAllProjects, getPublishedProjects, getProject,
  createProject, updateProject, deleteProject,
  getNavItems, createNavItem, updateNavItem, deleteNavItem,
  getFooterSections, getFooterLinks, getAllFooterData,
  createFooterSection, updateFooterSection, deleteFooterSection,
  createFooterLink, updateFooterLink, deleteFooterLink,
  getContactInfo, createContactInfo, updateContactInfo, deleteContactInfo,
  getAllPackages, getPackage, createPackage, updatePackage, deletePackage,
  getAllFaq, createFaq, updateFaq, deleteFaq,
  getAllMedia, createMedia, deleteMedia,
};
