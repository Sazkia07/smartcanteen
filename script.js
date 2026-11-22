/* ==========================================================================
   SmartCanteen Rush — script.js
   Satu file JS untuk semua halaman (index, menu, slot, status).
   Halaman dikenali lewat atribut <body data-page="home|menu|slot|status">.
   Seluruh data pesanan disimpan di localStorage (key: STORAGE_KEY).
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     1. KONFIGURASI
     ====================================================================== */
  const STORAGE_KEY = 'smartcanteen_rush_v1';
  const LOCATION_NAME = 'Kantin FILKOM UB';

  // Simulasi status: waktu (ms) sejak pesanan dibuat untuk masuk ke tiap tahap.
  // [Diterima, Dimasak, Siap diambil]  -> ubah angkanya kalau mau lebih cepat/lambat.
  const STAGE_AT = [0, 6000, 16000];

  const PAYMENT_LABELS = {
    qris: 'QRIS',
    kasir: 'Bayar di kasir',
    ewallet: 'Dompet digital'
  };

  /* ======================================================================
     2. DATA KATALOG (kios + menu)
     Foto memakai Unsplash. Kalau ada foto yang gagal dimuat, otomatis
     diganti ilustrasi emoji (lihat handler 'error' di initCommon).
     ====================================================================== */
  const PHOTOS = {
    friedRice: '1512058564366-18510be2db19',
    katsu: '1626645738196-c2a7c87a8f58',
    noodles: '1582878826629-29b7ad1cdc43',
    noodles2: '1569718212165-3a8278d5f624',
    soup: '1547592166-23ac45744acd',
    salad: '1540189549336-e6e99c3679fe',
    friedChicken: '1626645738196-c2a7c87a8f58',
    duck: '1544025162-d76694265947',
    satay: '1555939594-58d7cb561ad1',
    dumpling: '1563245372-f21724e3856d',
    dumpling2: '1496116218417-1a781b1c416c',
    tea: '1556679343-c7306c1976bc',
    orange: '1621263764928-df1444c5e859',
    water: '1548839140-29a749e1cf4d',
    coffee: '1461023058943-07fcbe16d735',
    fries: '1573080496219-bb080dd4f877',
    donut: '1551024601-bec78aea704b',
    cookie: '1499636136210-6f4ee915583e',
    toast: '1484723091739-30a097e8f929',
    hero: '1555396273-367ea4eb4db5'
  };

  function photo(key, width) {
    if (!key || !PHOTOS[key]) return '';
    return 'https://images.unsplash.com/photo-' + PHOTOS[key] +
      '?auto=format&fit=crop&w=' + (width || 240) + '&q=70';
  }

  function m(id, name, desc, price, cat, type, photoKey, emoji, soldOut) {
    return {
      id: id, name: name, desc: desc, price: price,
      cat: cat, type: type, photo: photoKey, emoji: emoji || '🍽️',
      soldOut: !!soldOut
    };
  }

  const STALLS = [
    {
      id: 'nasi-goreng-gila', name: 'Nasi Goreng Gila', prep: 10, rating: 4.8, reviews: 120,
      open: true, popular: true, photo: 'friedRice', emoji: '🍛',
      items: [
        m('ngg-mawut', 'Nasi Goreng Mawut', 'Nasi goreng dengan telur, mie, dan sayuran', 15000, 'Nasi', 'makanan', 'friedRice', '🍛'),
        m('ngg-katsu', 'Nasi Goreng Katsu', 'Nasi goreng dengan ayam katsu renyah', 15000, 'Nasi', 'makanan', 'katsu', '🍛'),
        m('ngg-yamin', 'Mie Yamin', 'Mie manis gurih dengan topping ayam', 15000, 'Mie', 'makanan', 'noodles', '🍜', true),
        m('ngg-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 10000, 'Minuman', 'minuman', 'tea', '🧋'),
        m('ngg-esjeruk', 'Es Jeruk', 'Jeruk peras dingin tanpa pengawet', 15000, 'Minuman', 'minuman', 'orange', '🍊'),
        m('ngg-air', 'Air Mineral', 'Air mineral botol 600 ml', 10000, 'Minuman', 'minuman', 'water', '💧'),
        m('ngg-mendoan', 'Tempe Mendoan', 'Tempe tipis goreng tepung, 3 potong', 8000, 'Snack', 'snack', null, '🍘'),
        m('ngg-kerupuk', 'Kerupuk Udang', 'Kerupuk udang renyah', 5000, 'Snack', 'snack', null, '🍤')
      ]
    },
    {
      id: 'bakso-sayur-ub', name: 'Bakso Sayur UB', prep: 15, rating: 4.7, reviews: 96,
      open: true, popular: true, photo: 'soup', emoji: '🍲',
      items: [
        m('bs-komplit', 'Bakso Sayur Komplit', 'Bakso, tahu, sayur, dan mie dalam kuah kaldu', 15000, 'Bakso', 'makanan', 'soup', '🍲'),
        m('bs-urat', 'Bakso Urat', 'Bakso urat kenyal dengan kuah gurih', 17000, 'Bakso', 'makanan', 'soup', '🍲'),
        m('bs-mieayam', 'Mie Ayam Bakso', 'Mie ayam dengan dua butir bakso', 16000, 'Mie', 'makanan', 'noodles2', '🍜'),
        m('bs-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 6000, 'Minuman', 'minuman', 'tea', '🧋'),
        m('bs-esjeruk', 'Es Jeruk', 'Jeruk peras dingin tanpa pengawet', 8000, 'Minuman', 'minuman', 'orange', '🍊'),
        m('bs-pangsit', 'Pangsit Goreng', 'Isi 5 pangsit goreng renyah', 8000, 'Snack', 'snack', 'dumpling', '🥟')
      ]
    },
    {
      id: 'lalapan-mbak-eli', name: 'Lalapan Mbak Eli', prep: 15, rating: 4.7, reviews: 88,
      open: true, popular: true, photo: 'friedChicken', emoji: '🍗',
      items: [
        m('le-ayam', 'Ayam Lalapan', 'Ayam goreng, nasi, lalapan, dan sambal terasi', 18000, 'Nasi', 'makanan', 'friedChicken', '🍗'),
        m('le-lele', 'Lele Lalapan', 'Lele goreng, nasi, lalapan, dan sambal', 16000, 'Nasi', 'makanan', null, '🐟'),
        m('le-tahutempe', 'Tahu Tempe Lalapan', 'Tahu dan tempe goreng, nasi, lalapan segar', 12000, 'Nasi', 'makanan', 'salad', '🥗'),
        m('le-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 6000, 'Minuman', 'minuman', 'tea', '🧋'),
        m('le-esjeruk', 'Es Jeruk', 'Jeruk peras dingin tanpa pengawet', 8000, 'Minuman', 'minuman', 'orange', '🍊')
      ]
    },
    {
      id: 'snack-corner-gkm', name: 'Snack Corner GKM', prep: 2, rating: 4.7, reviews: 64,
      open: true, popular: false, photo: 'donut', emoji: '🍩',
      items: [
        m('sc-fries', 'Kentang Goreng', 'Kentang goreng renyah dengan saus sambal', 12000, 'Snack', 'snack', 'fries', '🍟'),
        m('sc-donat', 'Donat Gula', 'Donat lembut dengan taburan gula halus', 6000, 'Snack', 'snack', 'donut', '🍩'),
        m('sc-roti', 'Roti Bakar Cokelat', 'Roti bakar isi cokelat dan keju', 10000, 'Snack', 'snack', 'toast', '🍞'),
        m('sc-cookies', 'Choco Cookies', 'Cookies cokelat renyah, 3 buah', 8000, 'Snack', 'snack', 'cookie', '🍪'),
        m('sc-kopi', 'Kopi Susu Es', 'Espresso, susu, dan gula aren', 14000, 'Minuman', 'minuman', 'coffee', '☕'),
        m('sc-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 5000, 'Minuman', 'minuman', 'tea', '🧋')
      ]
    },
    {
      id: 'soto-ayam-lamongan', name: 'Soto Ayam Lamongan', prep: 5, rating: 4.6, reviews: 75,
      open: true, popular: false, photo: 'soup', emoji: '🍲',
      items: [
        m('sa-soto', 'Soto Ayam', 'Soto ayam kuah kuning dengan koya', 14000, 'Soto', 'makanan', 'soup', '🍲'),
        m('sa-sotonasi', 'Soto Ayam + Nasi', 'Soto ayam lengkap dengan seporsi nasi', 17000, 'Soto', 'makanan', 'soup', '🍲'),
        m('sa-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 5000, 'Minuman', 'minuman', 'tea', '🧋'),
        m('sa-tehhangat', 'Teh Hangat', 'Teh panas manis', 4000, 'Minuman', 'minuman', null, '🍵'),
        m('sa-perkedel', 'Perkedel Kentang', 'Perkedel goreng, 2 buah', 4000, 'Snack', 'snack', null, '🥔')
      ]
    },
    {
      id: 'kedai-mie-tumplek', name: 'Kedai Mie Tumplek', prep: 12, rating: 4.8, reviews: 110,
      open: true, popular: false, photo: 'noodles', emoji: '🍜',
      items: [
        m('mt-ori', 'Mie Tumplek Original', 'Mie dengan kuah kental, sayur, dan telur', 15000, 'Mie', 'makanan', 'noodles', '🍜'),
        m('mt-pedas', 'Mie Tumplek Pedas', 'Versi pedas dengan cabai rawit pilihan', 16000, 'Mie', 'makanan', 'noodles2', '🌶️'),
        m('mt-goreng', 'Mie Goreng Jawa', 'Mie goreng bumbu kecap khas Jawa', 14000, 'Mie', 'makanan', 'noodles', '🍜'),
        m('mt-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 6000, 'Minuman', 'minuman', 'tea', '🧋'),
        m('mt-esjeruk', 'Es Jeruk', 'Jeruk peras dingin tanpa pengawet', 8000, 'Minuman', 'minuman', 'orange', '🍊'),
        m('mt-pangsit', 'Pangsit Goreng', 'Isi 5 pangsit goreng renyah', 8000, 'Snack', 'snack', 'dumpling', '🥟')
      ]
    },
    {
      id: 'dapur-nusantara', name: 'Dapur Nusantara', prep: 10, rating: 4.4, reviews: 41,
      open: false, popular: false, photo: 'satay', emoji: '🍢',
      items: [
        m('dn-rames', 'Nasi Rames', 'Nasi dengan aneka lauk pilihan', 18000, 'Nasi', 'makanan', 'satay', '🍛'),
        m('dn-rendang', 'Nasi Rendang', 'Nasi dengan rendang sapi empuk', 22000, 'Nasi', 'makanan', null, '🍛'),
        m('dn-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 6000, 'Minuman', 'minuman', 'tea', '🧋')
      ]
    },
    {
      id: 'dimsum-gyoza', name: 'Dimsum & Gyoza', prep: 8, rating: 4.5, reviews: 52,
      open: true, popular: false, photo: 'dumpling2', emoji: '🥟',
      items: [
        m('dg-dimsum', 'Dimsum Ayam', 'Dimsum ayam kukus, isi 4', 15000, 'Dimsum', 'makanan', 'dumpling2', '🥟'),
        m('dg-siomay', 'Siomay Udang', 'Siomay udang kukus, isi 4', 18000, 'Dimsum', 'makanan', 'dumpling2', '🥟'),
        m('dg-gyoza', 'Gyoza Goreng', 'Gyoza isi ayam, isi 5', 16000, 'Gyoza', 'makanan', 'dumpling', '🥟'),
        m('dg-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 6000, 'Minuman', 'minuman', 'tea', '🧋')
      ]
    },
    {
      id: 'nasi-bebek', name: 'Nasi Bebek', prep: 10, rating: 4.6, reviews: 70,
      open: true, popular: false, photo: 'duck', emoji: '🦆',
      items: [
        m('nb-goreng', 'Nasi Bebek Goreng', 'Bebek goreng, nasi, dan sambal bawang', 25000, 'Nasi', 'makanan', 'duck', '🦆'),
        m('nb-ijo', 'Nasi Bebek Sambal Ijo', 'Bebek goreng dengan sambal ijo pedas', 26000, 'Nasi', 'makanan', 'duck', '🦆'),
        m('nb-esteh', 'Es Teh Manis', 'Teh dingin segar dengan gula asli', 5000, 'Minuman', 'minuman', 'tea', '🧋'),
        m('nb-tahu', 'Tahu Tempe Penyet', 'Tahu dan tempe penyet sambal', 6000, 'Snack', 'snack', null, '🍢')
      ]
    }
  ];

  /* ======================================================================
     3. UTILITAS
     ====================================================================== */
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rupiah(n) {
    return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function fmtRating(n) { return n.toFixed(1).replace('.', ','); }

  function getStall(id) {
    for (let i = 0; i < STALLS.length; i++) if (STALLS[i].id === id) return STALLS[i];
    return null;
  }

  function placeholder(emoji) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#FDE7D6"/><stop offset="1" stop-color="#F3D2AE"/>' +
      '</linearGradient></defs><rect width="120" height="120" fill="url(#g)"/>' +
      '<text x="60" y="80" font-size="52" text-anchor="middle">' + emoji + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function imgTag(photoKey, width, emoji, alt) {
    const src = photo(photoKey, width) || placeholder(emoji);
    return '<img src="' + src + '" alt="' + esc(alt || '') + '" loading="lazy" data-emoji="' + esc(emoji) + '">';
  }

  function setImg(el, photoKey, width, emoji, alt) {
    if (!el) return;
    el.setAttribute('data-emoji', emoji);
    el.alt = alt || '';
    el.src = photo(photoKey, width) || placeholder(emoji);
  }

  let toastTimer = null;
  function toast(message) {
    let el = $('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    void el.offsetWidth; // restart transition
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function go(url) { window.location.href = url; }

  /* ======================================================================
     4. STATE (localStorage)
     ====================================================================== */
  let memoryState = null; // cadangan jika localStorage diblokir browser

  function defaultState() {
    return {
      stallId: null,   // kios yang dipilih
      cart: {},        // { idMenu: jumlahPorsi }
      count: 0,        // total porsi
      total: 0,        // total harga
      slot: null,      // contoh: "11.30"
      note: '',
      payment: 'qris',
      order: null      // pesanan yang sudah dikonfirmasi
    };
  }

  function load() {
    let parsed = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      parsed = memoryState;
    }
    const state = Object.assign(defaultState(), parsed || {});
    if (!state.cart || typeof state.cart !== 'object') state.cart = {};
    return state;
  }

  function save(state) {
    memoryState = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* abaikan, pakai memoryState */ }
  }

  function resetAll() {
    memoryState = null;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* abaikan */ }
  }

  // Hitung ulang jumlah porsi + total harga dari isi keranjang, lalu simpan di state.
  function recalc(state) {
    const stall = getStall(state.stallId);
    let count = 0;
    let total = 0;
    if (stall) {
      stall.items.forEach(function (it) {
        const q = state.cart[it.id] || 0;
        count += q;
        total += q * it.price;
      });
    }
    state.count = count;
    state.total = total;
    return state;
  }

  function cartLines(state) {
    const stall = getStall(state.stallId);
    if (!stall) return [];
    return stall.items
      .filter(function (it) { return (state.cart[it.id] || 0) > 0; })
      .map(function (it) {
        return { id: it.id, name: it.name, price: it.price, qty: state.cart[it.id] };
      });
  }

  function selectStall(id) {
    const state = load();
    if (state.stallId !== id) {
      state.stallId = id;
      state.cart = {};      // keranjang dikosongkan jika pindah kios
      state.count = 0;
      state.total = 0;
    }
    save(state);
  }

  /* ----- Tahapan status pesanan ----- */
  function orderStage(order) {
    if (order.pickedUp) return 3;
    const elapsed = Date.now() - order.createdAt;
    if (elapsed >= STAGE_AT[2]) return 2;
    if (elapsed >= STAGE_AT[1]) return 1;
    return 0;
  }

  function stageInfo(stage, stall) {
    const prep = stall ? stall.prep : 10;
    return [
      { badge: 'Diterima', cls: 'badge-info', title: 'Pesanan diterima', note: 'Kios sedang mengonfirmasi pesananmu' },
      { badge: 'Diproses', cls: 'badge-info', title: 'Pesananmu lagi dimasak', note: 'Siap sekitar ' + prep + ' menit' },
      { badge: 'Siap diambil', cls: 'badge-ready', title: 'Pesananmu sudah siap!', note: 'Tunjukkan kode ambil ke kios' },
      { badge: 'Selesai', cls: 'badge-done', title: 'Pesanan selesai', note: 'Terima kasih, selamat menikmati!' }
    ][stage];
  }

  function makeCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    return code + '-' + String(Math.floor(Math.random() * 900) + 100);
  }

  /* ======================================================================
     5. FUNGSI UMUM (semua halaman)
     ====================================================================== */
  function initCommon() {
    // Gambar gagal dimuat -> ganti ilustrasi emoji (error tidak bubbling, pakai capture)
    document.addEventListener('error', function (e) {
      const el = e.target;
      if (el && el.tagName === 'IMG' && el.dataset.emoji && !el.dataset.fallback) {
        el.dataset.fallback = '1';
        el.src = placeholder(el.dataset.emoji);
      }
    }, true);

    // Tombol/tautan navigasi generik: <button data-href="index.html">
    document.addEventListener('click', function (e) {
      const nav = e.target.closest('[data-href]');
      if (nav) {
        e.preventDefault();
        go(nav.getAttribute('data-href'));
        return;
      }
      const soon = e.target.closest('[data-soon]');
      if (soon) {
        e.preventDefault();
        toast('Fitur ini segera hadir');
      }
    });

    // Kembali lewat tombol back browser (bfcache) -> muat ulang supaya data segar
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) window.location.reload();
    });
  }

  /* ======================================================================
     6. HALAMAN BERANDA
     ====================================================================== */
  function initHome() {
    let filter = 'semua';
    let query = '';

    const popularList = $('#popularList');
    const popularSection = $('#popularSection');
    const stallList = $('#stallList');
    const stallCount = $('#stallCount');
    const emptyState = $('#emptyState');
    const searchInput = $('#searchInput');
    const chips = $$('.chip');

    /* --- badge keranjang & tombol keranjang --- */
    const state = load();
    const badge = $('#cartBadge');
    if (state.count > 0) {
      badge.textContent = state.count;
      badge.hidden = false;
    }
    $('#cartBtn').addEventListener('click', function () {
      const s = load();
      if (s.count > 0) go('slot.html');
      else toast('Keranjang masih kosong, pilih kios dulu');
    });

    /* --- kartu pesanan aktif --- */
    const orderCard = $('#activeOrder');
    function renderOrderCard() {
      const s = load();
      if (!s.order) { orderCard.hidden = true; return; }
      const stall = getStall(s.order.stallId);
      const stage = orderStage(s.order);
      const info = stageInfo(stage, stall);
      orderCard.hidden = false;
      setImg($('#orderImg'), stall && stall.photo, 120, stall ? stall.emoji : '🍽️', s.order.stallName);
      $('#orderTitle').textContent = info.title;
      $('#orderSub').textContent = s.order.stallName + ', ' + info.note.charAt(0).toLowerCase() + info.note.slice(1);
      const b = $('#orderBadge');
      b.textContent = info.badge;
      b.className = 'badge ' + info.cls;
    }
    renderOrderCard();
    setInterval(renderOrderCard, 1000);

    /* --- logika filter --- */
    function itemMatches(item) {
      if (filter !== 'semua' && item.type !== filter) return false;
      return (item.name + ' ' + item.cat).toLowerCase().indexOf(query) !== -1;
    }

    function stallMatches(stall) {
      if (filter !== 'semua' && !stall.items.some(function (i) { return i.type === filter; })) return false;
      if (!query) return true;
      if (stall.name.toLowerCase().indexOf(query) !== -1) return true;
      return stall.items.some(itemMatches);
    }

    function menuHint(stall) {
      if (!query || stall.name.toLowerCase().indexOf(query) !== -1) return null;
      return stall.items.filter(itemMatches)[0] || null;
    }

    /* --- render --- */
    function popularCard(s) {
      return '<a class="pcard" href="menu.html" data-stall="' + s.id + '">' +
        '<div class="pcard-img">' + imgTag(s.photo, 360, s.emoji, s.name) + '</div>' +
        '<h3 class="pcard-name">' + esc(s.name) + '</h3>' +
        '<div class="pcard-meta"><span>Siap ' + s.prep + ' menit</span>' +
        '<b><span class="star" aria-hidden="true">★</span> ' + fmtRating(s.rating) + '</b></div>' +
        '</a>';
    }

    function stallRow(s) {
      const hint = menuHint(s);
      const sub = !s.open ? 'Buka lagi besok 07.00'
        : hint ? 'Ada: ' + hint.name
        : 'Siap ' + s.prep + ' menit';
      const side = s.open
        ? '<b class="rating"><span class="star" aria-hidden="true">★</span> ' + fmtRating(s.rating) + '</b>'
        : '<span class="closed-badge">Tutup</span>';
      return '<li><a class="stall' + (s.open ? '' : ' stall-closed') + '" href="menu.html" data-stall="' + s.id + '">' +
        '<span class="thumb">' + imgTag(s.photo, 120, s.emoji, s.name) + '</span>' +
        '<span class="stall-text"><span class="stall-name">' + esc(s.name) + '</span>' +
        '<span class="stall-sub">' + esc(sub) + '</span></span>' + side + '</a></li>';
    }

    function render() {
      const popular = STALLS.filter(function (s) { return s.popular && stallMatches(s); });
      const others = STALLS.filter(function (s) { return !s.popular && stallMatches(s); });

      popularList.innerHTML = popular.map(popularCard).join('');
      popularSection.hidden = popular.length === 0;

      stallList.innerHTML = others.map(stallRow).join('');
      stallCount.textContent = others.length + ' kios';
      emptyState.hidden = popular.length + others.length > 0;
    }

    /* --- event --- */
    searchInput.addEventListener('input', function () {
      query = searchInput.value.trim().toLowerCase();
      render();
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.getAttribute('data-filter');
        chips.forEach(function (c) {
          const on = c === chip;
          c.classList.toggle('chip-active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        render();
      });
    });

    $('#seeAll').addEventListener('click', function (e) {
      e.preventDefault();
      query = '';
      searchInput.value = '';
      filter = 'semua';
      chips.forEach(function (c) {
        const on = c.getAttribute('data-filter') === 'semua';
        c.classList.toggle('chip-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      render();
      $('#allStalls').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Klik kartu kios (populer maupun daftar)
    document.addEventListener('click', function (e) {
      const link = e.target.closest('[data-stall]');
      if (!link) return;
      e.preventDefault();
      const stall = getStall(link.getAttribute('data-stall'));
      if (!stall) return;
      if (!stall.open) { toast(stall.name + ' sedang tutup'); return; }
      selectStall(stall.id);
      go('menu.html');
    });

    // Promo -> pilih jam ambil
    $('#promoBtn').addEventListener('click', function () { go('slot.html'); });

    render();
  }

  /* ======================================================================
     7. HALAMAN MENU
     ====================================================================== */
  const ICON_PLUS = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_MINUS = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function initMenu() {
    let state = load();
    let stall = getStall(state.stallId);
    if (!stall) {
      // Halaman dibuka langsung tanpa memilih kios -> pakai kios pertama
      stall = STALLS[0];
      selectStall(stall.id);
      state = load();
    }

    let activeCat = 'Semua';
    let query = '';

    const listEl = $('#menuList');
    const tabsEl = $('#tabs');
    const bar = $('#cartBar');
    const barBtn = $('#cartBarBtn');

    /* --- header kios --- */
    document.title = stall.name + ' - Menu';
    $('#topTitle').textContent = stall.name;
    $('#stallName').textContent = stall.name;
    $('#stallPrep').textContent = 'Siap sekitar ' + stall.prep + ' menit';
    $('#stallRating').textContent = fmtRating(stall.rating).replace('.', ',') + ' dari ' + stall.reviews + ' ulasan';
    setImg($('#stallImg'), stall.photo, 200, stall.emoji, stall.name);

    /* --- tab kategori (dibuat dari menu kios) --- */
    const cats = ['Semua'];
    stall.items.forEach(function (it) { if (cats.indexOf(it.cat) === -1) cats.push(it.cat); });
    tabsEl.innerHTML = cats.map(function (c) {
      return '<button class="tab' + (c === 'Semua' ? ' active' : '') + '" type="button" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');

    /* --- daftar menu --- */
    function controlHTML(item) {
      const q = state.cart[item.id] || 0;
      if (item.soldOut) return '<span class="badge-sold">Habis</span>';
      if (!q) {
        return '<button class="add-btn" type="button" data-action="add" aria-label="Tambah ' + esc(item.name) + '">' + ICON_PLUS + '</button>';
      }
      return '<div class="qty">' +
        '<button type="button" data-action="dec" aria-label="Kurangi ' + esc(item.name) + '">' + ICON_MINUS + '</button>' +
        '<span class="qty-num">' + q + '</span>' +
        '<button type="button" data-action="inc" aria-label="Tambah ' + esc(item.name) + '">' + ICON_PLUS + '</button>' +
        '</div>';
    }

    function cardHTML(item) {
      return '<article class="menu-card' + (item.soldOut ? ' unavailable' : '') + '" data-id="' + item.id + '">' +
        '<div class="menu-img">' + imgTag(item.photo, 240, item.emoji, item.name) + '</div>' +
        '<div class="menu-body">' +
        '<div><h3 class="menu-name">' + esc(item.name) + '</h3><p class="menu-desc">' + esc(item.desc) + '</p></div>' +
        '<div class="menu-footer"><span class="price">' + rupiah(item.price) + '</span>' +
        '<div class="ctrl">' + controlHTML(item) + '</div></div>' +
        '</div></article>';
    }

    function renderList() {
      const q = query;
      const groups = [];
      cats.slice(1).forEach(function (cat) {
        if (activeCat !== 'Semua' && activeCat !== cat) return;
        const items = stall.items.filter(function (it) {
          return it.cat === cat && (!q || (it.name + ' ' + it.desc).toLowerCase().indexOf(q) !== -1);
        });
        if (items.length) {
          groups.push('<h2 class="category-title">' + esc(cat) + '</h2><div class="menu-list">' +
            items.map(cardHTML).join('') + '</div>');
        }
      });
      listEl.innerHTML = groups.length ? groups.join('') : '<p class="empty">Menu tidak ditemukan.</p>';
    }

    /* --- bar bawah --- */
    function renderBar() {
      if (state.count > 0) {
        bar.classList.remove('is-empty');
        $('#barInfo').textContent = state.count + ' item';
        $('#barTotal').textContent = rupiah(state.total);
        $('#barAction').textContent = 'Pilih jam ambil';
      } else {
        bar.classList.add('is-empty');
        $('#barInfo').textContent = 'Belum ada item';
        $('#barTotal').textContent = rupiah(0);
        $('#barAction').textContent = 'Pilih menu dulu';
      }
    }

    function setQty(id, qty) {
      if (qty <= 0) delete state.cart[id];
      else state.cart[id] = qty;
      recalc(state);
      save(state);

      const card = $('.menu-card[data-id="' + id + '"]', listEl);
      const item = stall.items.filter(function (it) { return it.id === id; })[0];
      if (card && item) {
        $('.ctrl', card).innerHTML = controlHTML(item);
        const num = $('.qty-num', card);
        if (num) { num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump'); }
      }
      renderBar();
    }

    /* --- event --- */
    listEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const card = btn.closest('.menu-card');
      const id = card.getAttribute('data-id');
      const current = state.cart[id] || 0;
      const action = btn.getAttribute('data-action');
      if (action === 'add' || action === 'inc') setQty(id, Math.min(current + 1, 20));
      if (action === 'dec') setQty(id, current - 1);
    });

    tabsEl.addEventListener('click', function (e) {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      activeCat = tab.getAttribute('data-cat');
      $$('.tab', tabsEl).forEach(function (t) { t.classList.toggle('active', t === tab); });
      renderList();
    });

    // Pencarian menu (ikon kaca pembesar di kanan atas)
    const searchBar = $('#menuSearchBar');
    const searchInput = $('#menuSearch');
    $('#searchToggle').addEventListener('click', function () {
      searchBar.hidden = !searchBar.hidden;
      if (!searchBar.hidden) searchInput.focus();
      else { searchInput.value = ''; query = ''; renderList(); }
    });
    searchInput.addEventListener('input', function () {
      query = searchInput.value.trim().toLowerCase();
      renderList();
    });

    barBtn.addEventListener('click', function () {
      if (state.count > 0) go('slot.html');
      else toast('Pilih minimal satu menu dulu');
    });

    renderList();
    renderBar();
  }

  /* ======================================================================
     8. HALAMAN PILIH SLOT
     ====================================================================== */
  function initSlot() {
    let state = load();
    const stall = getStall(state.stallId);
    const hasCart = !!stall && state.count > 0;

    /* --- ringkasan kios --- */
    const change = $('#changeLink');
    if (hasCart) {
      $('#orderName').textContent = stall.name;
      $('#orderCount').textContent = state.count + ' item';
      setImg($('#orderImg'), stall.photo, 120, stall.emoji, stall.name);
      change.textContent = 'Ubah';
      change.setAttribute('data-href', 'menu.html');
    } else {
      $('#orderName').textContent = 'Belum ada pesanan';
      $('#orderCount').textContent = 'Pilih menu terlebih dahulu';
      setImg($('#orderImg'), null, 120, '🍽️', '');
      change.textContent = 'Pilih menu';
      change.setAttribute('data-href', stall ? 'menu.html' : 'index.html');
    }

    /* --- rincian pembayaran --- */
    $('#subLabel').textContent = 'Subtotal (' + state.count + ' item)';
    $('#subValue').textContent = rupiah(state.total);
    $('#totalValue').textContent = rupiah(state.total);
    $('#barTotal').textContent = rupiah(state.total);

    /* --- slot waktu --- */
    const slotsEl = $('#slots');
    const slotBtns = $$('.slot', slotsEl);

    function markSlot(time) {
      slotBtns.forEach(function (b) {
        const on = b.getAttribute('data-time') === time && !b.classList.contains('is-full');
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    }
    markSlot(state.slot);

    slotsEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.slot');
      if (!btn || btn.classList.contains('is-full')) return;
      state.slot = btn.getAttribute('data-time');
      markSlot(state.slot);
      save(state);
    });

    /* --- catatan --- */
    const noteInput = $('#noteInput');
    noteInput.value = state.note || '';
    noteInput.addEventListener('input', function () {
      state.note = noteInput.value;
      save(state);
    });

    /* --- metode pembayaran --- */
    const payInputs = $$('.pay input');
    function markPay() {
      payInputs.forEach(function (i) {
        i.closest('.pay').classList.toggle('is-selected', i.checked);
      });
    }
    payInputs.forEach(function (i) {
      i.checked = i.value === state.payment;
      i.addEventListener('change', function () {
        if (i.checked) { state.payment = i.value; save(state); }
        markPay();
      });
    });
    markPay();

    /* --- konfirmasi --- */
    $('#confirmBtn').addEventListener('click', function () {
      state = load();
      if (!stall || state.count <= 0) {
        toast('Keranjang masih kosong, pilih menu dulu');
        return;
      }
      if (!state.slot) {
        toast('Pilih jam ambil dulu');
        slotsEl.classList.remove('shake');
        void slotsEl.offsetWidth;
        slotsEl.classList.add('shake');
        slotsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      state.order = {
        code: makeCode(),
        stallId: stall.id,
        stallName: stall.name,
        items: cartLines(state),
        count: state.count,
        total: state.total,
        slot: state.slot,
        payment: state.payment,
        note: state.note,
        location: LOCATION_NAME,
        createdAt: Date.now(),
        pickedUp: false
      };

      // keranjang dikosongkan untuk transaksi berikutnya
      state.cart = {};
      state.count = 0;
      state.total = 0;
      state.slot = null;
      state.note = '';
      save(state);
      go('status.html');
    });
  }

  /* ======================================================================
     9. HALAMAN STATUS
     ====================================================================== */
  // QR dekoratif (simulasi) yang konsisten untuk setiap kode ambil.
  function qrSVG(text) {
    const N = 25;
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
    function rnd() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    function inFinder(x, y, ox, oy) {
      const dx = x - ox, dy = y - oy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
    function reserved(x, y) {
      return (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
    }
    let d = '';
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let dark;
        if (reserved(x, y)) {
          dark = inFinder(x, y, 0, 0) || inFinder(x, y, N - 7, 0) || inFinder(x, y, 0, N - 7);
        } else {
          dark = rnd() > 0.5;
        }
        if (dark) d += 'M' + x + ' ' + y + 'h1v1h-1z';
      }
    }
    return '<svg viewBox="-1 -1 ' + (N + 2) + ' ' + (N + 2) + '" shape-rendering="crispEdges" role="img" aria-label="Kode QR ' + esc(text) + '">' +
      '<rect x="-1" y="-1" width="' + (N + 2) + '" height="' + (N + 2) + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="#2B1D14"/></svg>';
  }

  function initStatus() {
    const content = $('#statusContent');
    const empty = $('#statusEmpty');
    const order0 = load().order;

    if (!order0) {
      content.hidden = true;
      empty.hidden = false;
      return;
    }
    content.hidden = false;
    empty.hidden = true;

    /* --- bagian yang tidak berubah --- */
    $('#stallTitle').textContent = order0.stallName;
    $('#pickupCode').textContent = order0.code;
    $('#qr').innerHTML = qrSVG(order0.code);
    $('#infoSlot').textContent = order0.slot;
    $('#infoLocation').textContent = order0.location || LOCATION_NAME;
    $('#infoPay').textContent = PAYMENT_LABELS[order0.payment] || '-';

    $('#detailRows').innerHTML = order0.items.map(function (it) {
      return '<div class="row"><span>' + it.qty + 'x ' + esc(it.name) + '</span>' +
        '<span class="price">' + rupiah(it.qty * it.price) + '</span></div>';
    }).join('');
    $('#detailTotal').textContent = rupiah(order0.total);

    if (order0.note) {
      $('#noteRow').hidden = false;
      $('#noteText').textContent = order0.note;
    }

    /* --- bagian yang berubah mengikuti tahap --- */
    const steps = $$('.step');
    const stepsEl = $('#steps');
    let timer = null;

    function render() {
      const order = load().order;
      if (!order) return;
      const stall = getStall(order.stallId);
      const stage = orderStage(order);
      const info = stageInfo(stage, stall);

      const badge = $('#statusBadge');
      badge.textContent = info.badge;
      badge.className = 'badge ' + info.cls;
      $('#statusHeading').textContent = info.title;
      $('#statusNote').textContent = info.note;
      stepsEl.style.setProperty('--p', String(stage / 3));

      steps.forEach(function (li, i) {
        const done = stage === 3 || i < stage;
        li.classList.toggle('done', done);
        li.classList.toggle('current', !done && i === stage);
        li.classList.toggle('active', i <= stage);
        li.setAttribute('aria-current', i === stage ? 'step' : 'false');
      });

      $('#pickedBtn').hidden = stage !== 2;
      $('#contactBtn').hidden = stage === 3;
      $('#cancelBtn').hidden = stage >= 2;

      if (stage === 3 && timer) { clearInterval(timer); timer = null; }
    }

    render();
    timer = setInterval(render, 1000);

    /* --- tombol --- */
    $('#pickedBtn').addEventListener('click', function () {
      const s = load();
      if (!s.order) return;
      s.order.pickedUp = true;
      save(s);
      render();
      toast('Selamat menikmati!');
    });

    $('#contactBtn').addEventListener('click', function () {
      toast('Menghubungi ' + order0.stallName + '... (simulasi)');
    });

    $('#cancelBtn').addEventListener('click', function () {
      if (window.confirm('Batalkan pesanan ini?')) {
        resetAll();
        go('index.html');
      }
    });

    // Kembali ke beranda = reset data pesanan untuk transaksi baru
    $('#homeBtn').addEventListener('click', function () {
      const s = load();
      const running = s.order && orderStage(s.order) < 3;
      if (running && !window.confirm('Pesananmu belum selesai. Data pesanan akan direset untuk transaksi baru. Lanjutkan?')) {
        return;
      }
      resetAll();
      go('index.html');
    });
  }

  // Tombol "Mulai pesan" pada kondisi kosong
  function initStatusEmpty() {
    const btn = $('#emptyBtn');
    if (btn) btn.addEventListener('click', function () { go('index.html'); });
  }

  /* ======================================================================
     10. ENTRY POINT
     ====================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initCommon();
    const page = document.body.getAttribute('data-page');
    if (page === 'home') initHome();
    else if (page === 'menu') initMenu();
    else if (page === 'slot') initSlot();
    else if (page === 'status') { initStatus(); initStatusEmpty(); }
  });
})();