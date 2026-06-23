const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  links?.classList.toggle('open');
  toggle.setAttribute('aria-expanded', links?.classList.contains('open') ? 'true' : 'false');
});

document.querySelectorAll('.package-select').forEach((select) => {
  const card = select.closest('.package-card');
  const price = card?.querySelector('.price-value');
  select.addEventListener('change', () => {
    if (price) price.textContent = select.selectedOptions[0].dataset.price;
  });
});

document.getElementById('contactForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    service: form.service.value,
    message: form.message.value.trim()
  };

  // Sunucuya POST
  try {
    await fetch('/api/teklif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (_) { /* sessiz */ }

  // WhatsApp'a yönlendir
  const text = `Merhaba,%20Kamera%20Sepeti%20ile%20iletişime%20geçmek%20istiyorum.%0A%0AAdım:%20${encodeURIComponent(data.name)}%0ATelefon:%20${encodeURIComponent(data.phone)}%0AHizmet:%20${encodeURIComponent(data.service)}%0AMesaj:%20${encodeURIComponent(data.message)}`;
  window.open(`https://wa.me/905524602020?text=${text}`, '_blank');

  button.textContent = 'Talebiniz Alındı ✓';
  button.style.background = '#15a642';
  setTimeout(() => {
    button.textContent = "WhatsApp'tan Gönder ◉";
    button.style.background = '';
  }, 4000);
});

const hidePreloader = () => {
  document.querySelector('.preloader')?.classList.add('is-hidden');
};

if (document.readyState === 'complete') {
  window.setTimeout(hidePreloader, 120);
} else {
  window.addEventListener('load', () => window.setTimeout(hidePreloader, 120), { once: true });
}

window.setTimeout(hidePreloader, 1500);
