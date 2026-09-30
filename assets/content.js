(() => {
  function esc(v) {
    return String(v || '').replace(/[&<>"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }
  fetch('/data/content.json', {cache:'no-store'})
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      const s = data.settings || {};
      const hero = document.querySelector('.hero-image');
      const packaging = document.querySelector('.product-card img');
      const productName = document.querySelector('[data-product-name]');
      const price = document.querySelector('[data-product-price]');
      const pack = document.querySelector('[data-product-pack]');
      if (hero && s.heroImage) hero.src = s.heroImage;
      if (packaging && s.packagingImage) packaging.src = s.packagingImage;
      if (productName && s.productName) productName.textContent = s.productName;
      if (price && s.mrp) price.textContent = s.mrp;
      if (pack && s.packSize) pack.textContent = s.packSize;

      const root = document.getElementById('managed-content');
      if (!root) return;
      const offers = (data.offers || []).filter(function (x) { return x.active; });
      const reviews = (data.reviews || []).filter(function (x) { return x.approved; });
      const partners = (data.partners || []).filter(function (x) { return x.active; });
      let html = '';

      if (offers.length) {
        html += '<section class="section managed-section"><div class="shell"><div class="eyebrow">CURRENT OFFERS</div><h2 class="display">A little more Fursad.</h2><div class="managed-grid">';
        offers.forEach(function (x) {
          html += '<article class="managed-card">' + (x.image ? '<img src="' + esc(x.image) + '" alt="' + esc(x.title) + '">' : '') + '<div class="managed-copy"><h3>' + esc(x.title) + '</h3><p>' + esc(x.description) + '</p></div></article>';
        });
        html += '</div></div></section>';
      }

      if (reviews.length) {
        html += '<section class="section soft managed-section"><div class="shell"><div class="eyebrow">CUSTOMER VOICES</div><h2 class="display">What people say.</h2><div class="managed-grid">';
        reviews.forEach(function (x) {
          html += '<article class="managed-card review-card">' + (x.image ? '<img src="' + esc(x.image) + '" alt="' + esc(x.name) + '">' : '') + '<div class="managed-copy"><p>“' + esc(x.quote) + '”</p><strong>' + esc(x.name) + '</strong>' + (x.videoUrl ? '<a href="' + esc(x.videoUrl) + '" target="_blank" rel="noopener">Watch video ↗</a>' : '') + '</div></article>';
        });
        html += '</div></div></section>';
      }

      if (partners.length) {
        html += '<section class="section managed-section"><div class="shell"><div class="eyebrow">PARTNERS</div><h2 class="display">Better together.</h2><div class="partner-grid">';
        partners.forEach(function (x) {
          const open = x.url ? '<a class="partner-card" href="' + esc(x.url) + '" target="_blank" rel="noopener">' : '<div class="partner-card">';
          const close = x.url ? '</a>' : '</div>';
          html += open + (x.logo ? '<img src="' + esc(x.logo) + '" alt="' + esc(x.name) + '">' : '') + '<div><strong>' + esc(x.name) + '</strong><p>' + esc(x.description) + '</p></div>' + close;
        });
        html += '</div></div></section>';
      }
      root.innerHTML = html;
    })
    .catch(function () {});
})();
