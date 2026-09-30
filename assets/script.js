(() => {
  const config = window.FURSAD_CONFIG || {};
  const whatsapp = String(config.whatsappNumber || '').replace(/\D/g, '');
  const businessEmail = String(config.businessEmail || '').trim();
  const message = encodeURIComponent('Hi FURSAD, I would like to know more about the Crunchy Tea Cracker.');

  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    if (/^\d{8,15}$/.test(whatsapp)) {
      link.href = `https://wa.me/${whatsapp}?text=${message}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      if (link.textContent.trim() === 'WhatsApp coming soon') link.textContent = 'Open WhatsApp';
    } else {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.setAttribute('aria-disabled', 'true');
      link.title = 'WhatsApp number is not configured yet';
    }
  });

  document.querySelectorAll('[data-business-email]').forEach((link) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
      link.href = `mailto:${businessEmail}`;
      link.textContent = businessEmail;
      link.removeAttribute('aria-disabled');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.textContent = 'Business email coming soon';
    }
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    };
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  }
})();
