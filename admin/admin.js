(() => {
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const defaults = {
    offers: [], partners: [], reviews: [], media: [],
    settings: {
      whatsappNumber: '', businessEmail: '', productName: 'FURSAD Crunchy Tea Cracker',
      mrp: 'Rs 20', packSize: 'Target ~60g',
      heroImage: '/assets/fursad-hero.webp', packagingImage: '/assets/fursad-packaging.webp'
    }
  };
  let state = clone(defaults);
  let password = sessionStorage.getItem('fursad-admin-password') || '';
  let dirty = false;

  function esc(v) {
    return String(v || '').replace(/[&<>"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }
  function status(el, msg, type) {
    el.textContent = msg;
    el.className = 'status' + (type ? ' ' + type : '');
  }
  function markDirty() {
    dirty = true;
    $('#saveState').textContent = 'Unsaved changes';
    $('#saveState').classList.add('dirty');
  }
  function markSaved() {
    dirty = false;
    $('#saveState').textContent = 'Saved';
    $('#saveState').classList.remove('dirty');
  }
  async function api(body) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {'content-type':'application/json','x-admin-password':password},
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(function () { return {error:'Invalid server response'}; });
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }
  async function load() {
    const res = await fetch('/data/content.json?ts=' + Date.now(), {cache:'no-store'});
    if (res.ok) {
      const loaded = await res.json();
      state = Object.assign(clone(defaults), loaded);
      state.settings = Object.assign({}, defaults.settings, loaded.settings || {});
    }
    state.offers = state.offers || [];
    state.partners = state.partners || [];
    state.reviews = state.reviews || [];
    state.media = state.media || [];
    renderAll();
  }
  function showAdmin() {
    $('#loginShell').hidden = true;
    $('#adminShell').hidden = false;
    load().catch(function (e) { alert(e.message); });
  }

  $('#loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    password = $('#password').value;
    status($('#loginStatus'), 'Checking…');
    try {
      await api({action:'authenticate'});
      sessionStorage.setItem('fursad-admin-password', password);
      status($('#loginStatus'), 'Authenticated', 'success');
      showAdmin();
    } catch (err) {
      status($('#loginStatus'), err.message, 'error');
    }
  });

  $('#logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('fursad-admin-password');
    location.reload();
  });

  $$('[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('[data-view]').forEach(function (x) { x.classList.toggle('active', x === btn); });
      $$('.view').forEach(function (panel) { panel.classList.toggle('active', panel.dataset.panel === btn.dataset.view); });
      $('#viewTitle').textContent = btn.textContent;
    });
  });

  function renderStats() {
    const stats = [
      ['Offers', state.offers.filter(function (x) { return x.active; }).length],
      ['Media', state.media.length],
      ['Approved reviews', state.reviews.filter(function (x) { return x.approved; }).length],
      ['Partners', state.partners.filter(function (x) { return x.active; }).length]
    ];
    $('#stats').innerHTML = stats.map(function (x) {
      return '<div class="stat"><strong>' + x[1] + '</strong><span>' + x[0] + '</span></div>';
    }).join('');
  }

  function input(label, key, value, type) {
    return '<label class="field">' + label + '<input data-key="' + key + '" type="' + (type || 'text') + '" value="' + esc(value) + '"></label>';
  }
  function area(label, key, value) {
    return '<label class="field">' + label + '<textarea data-key="' + key + '">' + esc(value) + '</textarea></label>';
  }

  function bindCards(type, el) {
    $$('[data-index]', el).forEach(function (card) {
      const i = Number(card.dataset.index);
      $$('[data-key]', card).forEach(function (control) {
        control.addEventListener('input', function () {
          state[type][i][control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value;
          markDirty();
          renderStats();
        });
      });
      const remove = $('.remove', card);
      if (remove) remove.addEventListener('click', function () {
        state[type].splice(i, 1);
        markDirty();
        renderAll();
      });
    });
  }

  function renderOffers() {
    const el = $('#offersList');
    if (!state.offers.length) { el.innerHTML = '<div class="empty">No offers yet.</div>'; return; }
    el.innerHTML = state.offers.map(function (x, i) {
      return '<div class="editor-card" data-index="' + i + '"><div class="card-head"><strong>Offer ' + (i+1) + '</strong><button class="remove">Remove</button></div><div class="editor-grid">' +
        input('Title','title',x.title) + input('Image path','image',x.image) + area('Description','description',x.description) + '<div></div>' +
        input('Start date','startDate',x.startDate,'date') + input('End date','endDate',x.endDate,'date') +
        '<label class="check"><input data-key="active" type="checkbox" ' + (x.active ? 'checked' : '') + '> Active</label></div></div>';
    }).join('');
    bindCards('offers', el);
  }

  function renderReviews() {
    const el = $('#reviewsList');
    if (!state.reviews.length) { el.innerHTML = '<div class="empty">No reviews yet.</div>'; return; }
    el.innerHTML = state.reviews.map(function (x, i) {
      return '<div class="editor-card" data-index="' + i + '"><div class="card-head"><strong>Review ' + (i+1) + '</strong><button class="remove">Remove</button></div><div class="editor-grid">' +
        input('Customer name','name',x.name) + input('Photo path','image',x.image) + area('Review','quote',x.quote) + input('Video URL','videoUrl',x.videoUrl) +
        '<label class="check"><input data-key="approved" type="checkbox" ' + (x.approved ? 'checked' : '') + '> Approved for website</label></div></div>';
    }).join('');
    bindCards('reviews', el);
  }

  function renderPartners() {
    const el = $('#partnersList');
    if (!state.partners.length) { el.innerHTML = '<div class="empty">No partners yet.</div>'; return; }
    el.innerHTML = state.partners.map(function (x, i) {
      return '<div class="editor-card" data-index="' + i + '"><div class="card-head"><strong>Partner ' + (i+1) + '</strong><button class="remove">Remove</button></div><div class="editor-grid">' +
        input('Name','name',x.name) + input('Logo path','logo',x.logo) + area('Description','description',x.description) + input('Website / link','url',x.url) +
        '<label class="check"><input data-key="active" type="checkbox" ' + (x.active ? 'checked' : '') + '> Active</label></div></div>';
    }).join('');
    bindCards('partners', el);
  }

  function renderMedia() {
    const el = $('#mediaList');
    if (!state.media.length) { el.innerHTML = '<div class="empty">No uploaded media yet.</div>'; return; }
    el.innerHTML = state.media.map(function (m, i) {
      const thumb = String(m.type || '').indexOf('image/') === 0 ? '<img src="' + esc(m.path) + '" alt="">' : '<span>Video</span>';
      return '<div class="media-card"><div class="media-thumb">' + thumb + '</div><div class="media-meta">' + esc(m.name || m.path) + '<br><code>' + esc(m.path) + '</code><br><button class="remove" data-remove-media="' + i + '">Remove from library</button></div></div>';
    }).join('');
    $$('[data-remove-media]', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.media.splice(Number(btn.dataset.removeMedia), 1);
        markDirty(); renderMedia(); renderStats();
      });
    });
  }

  function renderSettings() {
    $$('[data-setting]').forEach(function (control) {
      control.value = state.settings[control.dataset.setting] || '';
      control.oninput = function () {
        state.settings[control.dataset.setting] = control.value;
        markDirty();
      };
    });
  }

  function renderAll() {
    renderStats(); renderOffers(); renderReviews(); renderPartners(); renderMedia(); renderSettings();
  }

  $$('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const type = btn.dataset.add;
      if (type === 'offers') state.offers.unshift({title:'',description:'',image:'',startDate:'',endDate:'',active:true});
      if (type === 'reviews') state.reviews.unshift({name:'',quote:'',image:'',videoUrl:'',approved:false});
      if (type === 'partners') state.partners.unshift({name:'',description:'',logo:'',url:'',active:true});
      markDirty(); renderAll();
    });
  });

  $('#uploadBtn').addEventListener('click', async function () {
    const file = $('#mediaFile').files[0];
    const out = $('#uploadStatus');
    if (!file) return status(out, 'Choose a file first.', 'error');
    if (file.size > 3 * 1024 * 1024) return status(out, 'File must be 3 MB or smaller.', 'error');
    status(out, 'Uploading…');
    try {
      const dataUrl = await new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await api({action:'uploadMedia', name:file.name, dataUrl:dataUrl});
      state.media.unshift({name:file.name,path:result.path,type:file.type,uploadedAt:new Date().toISOString()});
      markDirty(); renderMedia(); renderStats();
      status(out, 'Uploaded. Publish changes to save it in the library.', 'success');
      $('#mediaFile').value = '';
    } catch (err) {
      status(out, err.message, 'error');
    }
  });

  $('#publishBtn').addEventListener('click', async function () {
    const btn = $('#publishBtn');
    btn.disabled = true; btn.textContent = 'Publishing…';
    try {
      await api({action:'saveContent', content:state});
      markSaved();
      btn.textContent = 'Published ✓';
      setTimeout(function () { btn.textContent = 'Publish changes'; }, 1600);
    } catch (err) {
      alert(err.message);
      btn.textContent = 'Publish changes';
    } finally {
      btn.disabled = false;
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  if (password) {
    api({action:'authenticate'}).then(showAdmin).catch(function () {
      sessionStorage.removeItem('fursad-admin-password');
    });
  }
})();
