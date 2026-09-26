(() => {
  const wa = document.querySelectorAll('[data-whatsapp]');
  const configured = document.documentElement.dataset.whatsapp || '';
  const msg = encodeURIComponent('Hi FURSAD, I would like to know more about the Crunchy Tea Cracker.');
  wa.forEach(a => {
    if (configured) {
      a.href = `https://wa.me/${configured}?text=${msg}`;
      a.target = '_blank'; a.rel = 'noopener noreferrer';
    } else {
      a.href = '/contact/';
      a.title = 'WhatsApp number can be connected before launch';
    }
  });
})();
