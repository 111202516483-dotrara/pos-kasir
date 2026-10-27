/* Tambahan khusus versi desktop. Dimuat di <head> index.html.
   Tidak aktif jika dibuka di browser biasa (window.desktop tidak ada). */
(() => {
  if (!window.desktop) return;
  const _fetch = window.fetch.bind(window);
  const KEYS = ['pos_set', 'pos_sales', 'pos_exp', 'pos_stock', 'pos_closed', 'pos_pending'];
  const ok = o => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });
  let badge;

  /* ---------- Antrean transaksi (mode offline) ---------- */
  const getQ = () => { try { return JSON.parse(localStorage.getItem('pos_pending')) || []; } catch (e) { return []; } };
  const showBadge = () => {
    if (!badge) return;
    const n = getQ().length;
    badge.style.display = n ? 'inline' : 'none';
    badge.textContent = '⏳ ' + n + ' transaksi belum terkirim';
  };
  const setQ = q => { localStorage.setItem('pos_pending', JSON.stringify(q)); showBadge(); };

  let flushing = false;
  async function flush() {
    if (flushing) return;
    flushing = true;
    const sent = new Set();
    for (const u of getQ()) {
      try {
        const r = await (await _fetch(u)).json();
        if (r.status === 'success') sent.add(u);
      } catch (e) { /* tetap di antrean */ }
    }
    setQ(getQ().filter(u => !sent.has(u)));
    flushing = false;
  }
  window.addEventListener('online', flush);

  // Bungkus fetch: produk di-cache, transaksi yang gagal dikirim masuk antrean
  window.fetch = (url, opt) => {
    const u = String(url);
    if (u.includes('action=getProducts')) {
      return _fetch(u, opt).then(r => r.json()).then(res => {
        if (res.status !== 'success' || !res.data) throw 0;
        localStorage.setItem('pos_products', JSON.stringify(res));
        flush();
        return ok(res);
      }).catch(() => {
        const c = JSON.parse(localStorage.getItem('pos_products') || 'null');
        if (!c) throw new Error('offline');
        // pakai stok lokal terbaru, bukan stok lama di cache
        c.data.forEach(p => {
          const n = p.Nama || p.NAMA || p.nama;
          if (typeof stock !== 'undefined' && stock[n] !== undefined) p.Stok = stock[n];
        });
        return ok(c);
      });
    }
    if (u.includes('action=saveTransaction')) {
      return _fetch(u, opt).then(r => r.json()).then(res => {
        if (res.status !== 'success') throw 0;
        return ok(res);
      }).catch(() => { setQ(getQ().concat(u)); return ok({ status: 'success', queued: true }); });
    }
    return _fetch(u, opt);
  };

  /* ---------- Cetak (senyap / ukuran kertas) ---------- */
  const nativePrint = window.print.bind(window);
  window.print = () => {
    const s = typeof settings !== 'undefined' ? settings : {};
    document.body.dataset.paper = s.paper || '80';
    if (s.silent) {
      desktop.print({ printer: s.printer || '', paper: s.paper || '80' })
        .then(r => { if (!r.ok) alert('Gagal mencetak: ' + r.error); });
    } else nativePrint();
  };

  /* ---------- Backup ---------- */
  const snapshot = () => JSON.stringify(Object.assign(
    { _app: 'pos-kasir', _at: new Date().toISOString() },
    Object.fromEntries(KEYS.map(k => [k, JSON.parse(localStorage.getItem(k))]))
  ));

  window.backupData = async () => {
    const r = await desktop.exportBackup(snapshot());
    if (r.ok) alert('Backup tersimpan:\n' + r.path);
  };

  window.restoreData = async () => {
    if (!confirm('Restore akan MENIMPA semua data di perangkat ini. Lanjutkan?')) return;
    const r = await desktop.importBackup();
    if (!r.ok) return;
    try {
      const o = JSON.parse(r.data);
      if (o._app !== 'pos-kasir') throw 0;
      KEYS.forEach(k => o[k] == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(o[k])));
      alert('Data berhasil dipulihkan. Aplikasi dimuat ulang.');
      location.reload();
    } catch (e) { alert('File backup tidak valid.'); }
  };

  /* ---------- Tampilan pengaturan ---------- */
  const DESK_UI =
    '<div class="form-group"><label>Printer Struk</label><select id="sPrinter" class="in"><option value="">Printer default Windows</option></select></div>' +
    '<div class="form-group"><label>Ukuran Kertas</label><select id="sPaper" class="in"><option value="80">Thermal 80 mm</option><option value="58">Thermal 58 mm</option><option value="A4">A4</option></select></div>' +
    '<label class="opt"><input type="checkbox" id="sSilent"><span><b>Cetak langsung tanpa dialog</b><small>Struk langsung dikirim ke printer di atas</small></span></label>';

  const BACKUP_UI =
    '<div style="max-width:400px"><h4 style="margin-top:22px">Backup Data</h4>' +
    '<p class="muted">Simpan riwayat penjualan, pengeluaran, stok, dan pengaturan ke file. Backup otomatis harian juga tersimpan di komputer ini.</p>' +
    '<button class="btn-submit" style="background:#28a745" onclick="backupData()">Backup Data</button>' +
    '<button class="btn-cancel" onclick="restoreData()">Restore Data</button>' +
    '<button class="btn-cancel" style="background:#eef0f3;color:#1e2a4a" onclick="desktop.openBackupFolder()">Buka Folder Backup Otomatis</button></div>';

  function fillPrinters() {
    const s = $('sPrinter');
    if (!s) return;
    $('sPaper').value = settings.paper || '80';
    $('sSilent').checked = !!settings.silent;
    desktop.getPrinters().then(l => {
      s.innerHTML = '<option value="">Printer default Windows</option>' +
        l.map(p => `<option value="${esc(p.name)}">${esc(p.displayName || p.name)}</option>`).join('');
      s.value = settings.printer || '';
    });
  }

  // Style cetak untuk kertas thermal + font lokal (tetap jalan tanpa internet)
  const st = document.createElement('style');
  st.textContent = '@media print{body[data-paper="58"] #receiptPrintArea,body[data-paper="58"] #dailyPrintArea{width:48mm;font-size:10px;padding:0!important;border:0!important}' +
    'body[data-paper="80"] #receiptPrintArea,body[data-paper="80"] #dailyPrintArea{width:72mm;font-size:11px;padding:0!important;border:0!important}}';
  document.head.appendChild(st);
  [400, 500, 700].forEach(w => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `node_modules/@fontsource/roboto/${w}.css`;
    document.head.appendChild(l);
  });

  // Override dilakukan setelah script utama selesai dimuat
  document.addEventListener('DOMContentLoaded', () => {
    badge = document.createElement('span');
    badge.style.cssText = 'display:none;background:#fff3cd;color:#856404;padding:4px 10px;border-radius:12px;font-size:12px';
    document.querySelector('.user-info').prepend(badge);
    showBadge();
    flush();

    // Backup otomatis 3 detik setelah data apa pun berubah
    let timer;
    const baseSv = window.sv;
    window.sv = (k, v) => {
      baseSv(k, v);
      clearTimeout(timer);
      timer = setTimeout(() => desktop.autoBackup(snapshot()), 3000);
    };

    const baseSetting = R.setting;
    R.setting = () => baseSetting().replace(
      '<button class="btn-submit" onclick="saveSettings()">', m => DESK_UI + m
    ) + BACKUP_UI;

    const baseRefresh = window.refresh;
    window.refresh = () => { baseRefresh(); if (view === 'setting') fillPrinters(); };

    const baseSave = window.saveSettings;
    window.saveSettings = () => {
      const pr = $('sPrinter');
      const extra = {
        printer: pr && pr.options.length > 1 ? pr.value : (settings.printer || ''),
        paper: $('sPaper').value,
        silent: $('sSilent').checked
      };
      baseSave();
      settings = Object.assign(settings, extra);
      sv('pos_set', settings);
    };
  });
})();
