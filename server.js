const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.post('/api/teklif', (req, res) => {
  const { name, phone, service, message } = req.body;
  const logLine = `[${new Date().toLocaleString('tr-TR')}] ${name} | ${phone} | ${service} | ${(message||'').slice(0,100)}\n`;
  fs.appendFileSync(path.join(__dirname, 'teklifler.log'), logLine);
  console.log('TEKLIF:', name, phone, service);
  res.json({ success: true });
});

app.use((req, res, next) => {
  if (req.path === '/' || path.extname(req.path)) return next();
  const dir = path.join(__dirname, req.path);
  const indexPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  next();
});

app.use((req, res) => {
  const four04 = path.join(__dirname, '404', 'index.html');
  if (fs.existsSync(four04)) return res.status(404).sendFile(four04);
  res.status(404).send('Sayfa bulunamadı');
});

app.listen(PORT, () => console.log(`Kamera Sepeti -> http://localhost:${PORT}`));
