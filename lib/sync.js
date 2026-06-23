const { getDb } = require('./db');
const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json');

/**
 * Export entire database content to data/content.json
 * This file is tracked by git and gets pushed to GitHub.
 */
function exportToJson() {
  try {
    const db = getDb();
    if (!db) return false;

    const data = {
      exported_at: new Date().toISOString(),
      settings: db.prepare('SELECT key, value, updated_at FROM settings').all(),
      pages: db.prepare('SELECT * FROM pages').all(),
      blog_posts: db.prepare('SELECT * FROM blog_posts').all(),
      testimonials: db.prepare('SELECT * FROM testimonials').all(),
      projects: db.prepare('SELECT * FROM projects').all(),
      nav_items: db.prepare('SELECT * FROM nav_items').all(),
      footer_sections: db.prepare('SELECT * FROM footer_sections').all(),
      footer_links: db.prepare('SELECT * FROM footer_links').all(),
      contact_info: db.prepare('SELECT * FROM contact_info').all(),
      packages: db.prepare('SELECT * FROM packages').all(),
      faq_items: db.prepare('SELECT * FROM faq_items').all(),
      media: db.prepare('SELECT * FROM media').all(),
      users: db.prepare('SELECT id, username, created_at FROM users').all(),
    };

    const dir = path.dirname(CONTENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Database exported to data/content.json');
    return true;
  } catch (err) {
    console.error('Export failed:', err);
    return false;
  }
}

/**
 * Import data from content.json into the database.
 * Used during seed to restore admin-made changes.
 */
function importFromJson() {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return false;

    const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
    const data = JSON.parse(raw);

    // Only import if the file has actual content (more than just exported_at)
    const keys = Object.keys(data).filter(k => k !== 'exported_at');
    if (keys.length === 0) return false;

    const db = getDb();
    if (!db) return false;

    // Import settings
    if (data.settings && data.settings.length > 0) {
      for (const s of data.settings) {
        db.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`).run(s.key, s.value, s.updated_at);
      }
      console.log(`  → ${data.settings.length} settings`);
    }

    // Import pages
    if (data.pages && data.pages.length > 0) {
      for (const p of data.pages) {
        db.prepare(`INSERT OR REPLACE INTO pages (id, slug, title, hero_title, hero_subtitle, hero_image, content, meta_description, is_published, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.id, p.slug, p.title, p.hero_title, p.hero_subtitle, p.hero_image, p.content, p.meta_description, p.is_published, p.updated_at);
      }
      console.log(`  → ${data.pages.length} pages`);
    }

    // Import blog posts
    if (data.blog_posts && data.blog_posts.length > 0) {
      for (const p of data.blog_posts) {
        db.prepare(`INSERT OR REPLACE INTO blog_posts (id, slug, title, summary, content, category, tags, image, author, reading_time, published_at, is_published, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.id, p.slug, p.title, p.summary, p.content, p.category, p.tags, p.image, p.author, p.reading_time, p.published_at, p.is_published, p.created_at, p.updated_at);
      }
      console.log(`  → ${data.blog_posts.length} blog posts`);
    }

    // Import testimonials
    if (data.testimonials && data.testimonials.length > 0) {
      for (const t of data.testimonials) {
        db.prepare(`INSERT OR REPLACE INTO testimonials (id, name, title, company, content, rating, image, sort_order, is_published, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(t.id, t.name, t.title, t.company, t.content, t.rating, t.image, t.sort_order, t.is_published, t.created_at);
      }
      console.log(`  → ${data.testimonials.length} testimonials`);
    }

    // Import projects
    if (data.projects && data.projects.length > 0) {
      for (const p of data.projects) {
        db.prepare(`INSERT OR REPLACE INTO projects (id, title, description, image, category, client, sort_order, is_published, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.id, p.title, p.description, p.image, p.category, p.client, p.sort_order, p.is_published, p.created_at);
      }
      console.log(`  → ${data.projects.length} projects`);
    }

    // Import nav items
    if (data.nav_items && data.nav_items.length > 0) {
      for (const n of data.nav_items) {
        db.prepare(`INSERT OR REPLACE INTO nav_items (id, label, url, sort_order, is_active) VALUES (?, ?, ?, ?, ?)`).run(n.id, n.label, n.url, n.sort_order, n.is_active);
      }
      console.log(`  → ${data.nav_items.length} nav items`);
    }

    // Import footer sections
    if (data.footer_sections && data.footer_sections.length > 0) {
      for (const s of data.footer_sections) {
        db.prepare(`INSERT OR REPLACE INTO footer_sections (id, title, sort_order) VALUES (?, ?, ?)`).run(s.id, s.title, s.sort_order);
      }
      console.log(`  → ${data.footer_sections.length} footer sections`);
    }

    // Import footer links
    if (data.footer_links && data.footer_links.length > 0) {
      for (const l of data.footer_links) {
        db.prepare(`INSERT OR REPLACE INTO footer_links (id, section_id, label, url, sort_order) VALUES (?, ?, ?, ?, ?)`).run(l.id, l.section_id, l.label, l.url, l.sort_order);
      }
      console.log(`  → ${data.footer_links.length} footer links`);
    }

    // Import contact info
    if (data.contact_info && data.contact_info.length > 0) {
      for (const c of data.contact_info) {
        db.prepare(`INSERT OR REPLACE INTO contact_info (id, type, label, value, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(c.id, c.type, c.label, c.value, c.icon, c.sort_order);
      }
      console.log(`  → ${data.contact_info.length} contact info`);
    }

    // Import packages
    if (data.packages && data.packages.length > 0) {
      for (const p of data.packages) {
        db.prepare(`INSERT OR REPLACE INTO packages (id, slug, name, subtitle, price, price_label, features, pricing_json, category, is_popular, is_published, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.id, p.slug, p.name, p.subtitle, p.price, p.price_label, p.features, p.pricing_json, p.category, p.is_popular, p.is_published, p.sort_order);
      }
      console.log(`  → ${data.packages.length} packages`);
    }

    return true;
  } catch (err) {
    console.error('Import from JSON failed:', err);
    return false;
  }
}

module.exports = { exportToJson, importFromJson };
