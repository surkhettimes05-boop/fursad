(() => {
  async function getConfig() {
    try {
      const response = await fetch('/data/content.json', {cache:'no-store'});
      if (response.ok) {
        const content = await response.json();
        return Object.assign({}, window.FURSAD_CONFIG || {}, content.settings || {});
      }
    } catch (_) {}
    return window.FURSAD_CONFIG || {};
  }

  getConfig().then(function (config) {
    const whatsapp = String(config.whatsappNumber || '').replace(/\D/g, '');
    const businessEmail = String(config.businessEmail || '').trim();
    const defaultMessage = 'नमस्ते FURSAD, FURSAD Crunchy Tea Cracker बारे जानकारी चाहन्छु।';

    document.querySelectorAll('[data-whatsapp]').forEach(function (link) {
      const customMessage = String(link.getAttribute('data-whatsapp-message') || defaultMessage).trim();
      if (/^\d{8,15}$/.test(whatsapp)) {
        link.href = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(customMessage);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.removeAttribute('aria-disabled');
        link.removeAttribute('data-contact-fallback');
        link.title = 'Open WhatsApp';
      } else {
        const currentHref = link.getAttribute('href');
        link.href = currentHref && currentHref !== '#' ? currentHref : '/contact/';
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.removeAttribute('aria-disabled');
        link.setAttribute('data-contact-fallback', 'true');
        link.title = 'WhatsApp number is not configured yet; opening contact options.';
      }
    });

    document.querySelectorAll('[data-business-email]').forEach(function (link) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
        link.href = 'mailto:' + businessEmail;
        link.textContent = businessEmail;
        link.removeAttribute('aria-disabled');
      } else {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.textContent = 'Business email not configured';
      }
    });
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (toggle && nav) {
    const closeMenu = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    };
    toggle.addEventListener('click', function () {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });
  }
})();