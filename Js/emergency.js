/* ==========================================================================
   KHPA Emergency Assistance (emergency.html)
   - Verifies the signed QR code printed on KHPA ID cards (ECDSA P-256, checked
     on the viewer's device; KHPA keeps no online records).
   - Shows emergency contacts that the card holder put into their own QR code.
   - Lets holders create that emergency QR code. Nothing is sent or stored:
     all data lives in the URL fragment (#...), which browsers never send to
     the server.
   QR format (shared with KHPA Forms):
     https://khpa.io/e#v=<token>[&e=<contacts>]
     token    = b64url("1|<kind I/O>|<ID number>|<name>|<YYYYMMDD exp>") "." b64url(signature r||s)
     contacts = b64url(JSON {c:[[name,relationship,phone]...], t:notes, i:id, m:name})
   ========================================================================== */
(function () {
  'use strict';
  var PUBKEYS = [{"kty": "EC", "crv": "P-256", "x": "YDZyENmaMxeP2hYcYxNRPh2cblf9xdy7_EwfujZH42k", "y": "-pW2zTK6e4_k9Pmj5UiEg868nP7Hyjt8ilkRCaZNH-U", "kid": "khpa-2026-1"}];            // KHPA public signing key(s); the private key stays at the office
  var BASE = 'https://khpa.io/e#';
  var KIND = { I: 'Identification Certificate', O: 'Motor Vehicle Operators Certificate' };
  var ID_RE = /^[A-Z]{2}\d{7}$/;

  function $(s) { return document.querySelector(s); }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ---------- base64url + UTF-8 ---------- */
  function b64uDec(s) {
    s = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function b64uEnc(bytes) {
    var bin = ''; for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  var enc = new TextEncoder(), dec = new TextDecoder();

  /* ---------- token parsing + signature check ---------- */
  function parseToken(tok) {
    var parts = String(tok || '').split('.');
    if (parts.length !== 2) return null;
    try {
      var raw = b64uDec(parts[0]), f = dec.decode(raw).split('|');
      if (f[0] !== '1' || f.length !== 5) return null;
      return { raw: raw, sig: b64uDec(parts[1]), kind: f[1], id: f[2], name: f[3], exp: f[4] };
    } catch (e) { return null; }
  }
  function verify(t) {
    if (!window.crypto || !crypto.subtle) return Promise.resolve(null);   // cannot check on this browser
    return PUBKEYS.reduce(function (p, jwk) {
      return p.then(function (ok) {
        if (ok) return true;
        return crypto.subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
          .then(function (k) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, t.sig, t.raw); });
      });
    }, Promise.resolve(false)).catch(function () { return false; });
  }
  function expDate(s) { return /^\d{8}$/.test(s) ? new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), 23, 59, 59) : null; }
  function fmt(d) { return d ? ('0' + (d.getMonth() + 1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2) + '.' + d.getFullYear() : 'not shown'; }

  function parseContacts(s) {
    if (!s) return null;
    try {
      var j = JSON.parse(dec.decode(b64uDec(s)));
      if (!j || typeof j !== 'object') return null;
      var c = (Array.isArray(j.c) ? j.c : []).slice(0, 3).map(function (x) {
        return Array.isArray(x) ? [String(x[0] || '').slice(0, 60), String(x[1] || '').slice(0, 40), String(x[2] || '').slice(0, 30)] : null;
      }).filter(function (x) { return x && (x[0] || x[2]); });
      return { c: c, t: String(j.t || '').slice(0, 200), i: String(j.i || '').slice(0, 12), m: String(j.m || '').slice(0, 60) };
    } catch (e) { return null; }
  }
  function telHref(p) { var d = String(p).replace(/[^\d+]/g, ''); return d ? 'tel:' + d : null; }

  /* ---------- state from the URL fragment ---------- */
  var state = { tok: null, card: null, ok: null, ice: null };
  function readHash() {
    var h = location.hash.replace(/^#/, ''), q = {};
    h.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) q[kv.slice(0, i)] = kv.slice(i + 1); });
    state.tok = q.v || null; state.card = q.v ? parseToken(q.v) : null; state.ice = parseContacts(q.e); state.ok = null;
    return !!(q.v || q.e);
  }

  /* ---------- result panel ---------- */
  function row(dl, k, v) { dl.appendChild(el('dt', null, k)); dl.appendChild(el('dd', null, v)); }
  function showResult() {
    var box = $('#iceResult'), st = $('#iceStatus'), dl = $('#iceId'), cw = $('#iceContacts'), badge = $('#iceBadge');
    box.hidden = false; st.innerHTML = ''; dl.innerHTML = ''; cw.innerHTML = '';
    var c = state.card, ice = state.ice, now = new Date();
    if (state.tok && !c) { st.className = 'ice-status bad'; st.textContent = 'This code is damaged or not a KHPA ID code.'; badge.textContent = 'Not verified'; }
    else if (c) {
      var ex = expDate(c.exp);
      row(dl, 'Name', c.name); row(dl, 'ID number', c.id); row(dl, 'Card', KIND[c.kind] || 'KHPA card'); row(dl, 'Expires', fmt(ex));
      if (state.ok === null) { st.className = 'ice-status'; st.textContent = 'Checking the KHPA signature…'; badge.textContent = 'Checking…'; }
      else if (state.ok === 'na') { st.className = 'ice-status warn'; st.textContent = 'This browser cannot check signatures. Open the page in an up-to-date Safari or Chrome to verify.'; badge.textContent = 'Not checked'; }
      else if (!state.ok) { st.className = 'ice-status bad'; st.textContent = '✗ NOT VERIFIED. This code was not issued by KHPA, or its details were changed.'; badge.textContent = 'Not verified'; }
      else if (ex && ex < now) { st.className = 'ice-status warn'; st.textContent = '⚠ Genuine KHPA card, but it EXPIRED on ' + fmt(ex) + '.'; badge.textContent = 'Expired'; }
      else { st.className = 'ice-status good'; st.textContent = '✓ VERIFIED. Genuine KHPA card, valid until ' + fmt(ex) + '.'; badge.textContent = 'Verified'; }
    } else if (ice) {
      st.className = 'ice-status warn'; st.textContent = 'Emergency contacts entered by the card holder. The ID was not checked by KHPA.'; badge.textContent = 'Holder provided';
      if (ice.m) row(dl, 'Name', ice.m); if (ice.i) row(dl, 'ID number (as typed)', ice.i);
    }
    if (ice && ice.c.length) {
      cw.appendChild(el('h4', null, 'Emergency contacts'));
      var ul = el('ul', 'ice-list');
      ice.c.forEach(function (x) {
        var li = el('li'), who = el('div', 'ice-who');
        who.appendChild(el('strong', null, x[0] || 'Contact'));
        if (x[1]) who.appendChild(el('span', null, ' · ' + x[1]));
        li.appendChild(who);
        var href = telHref(x[2]);
        if (href) { var a = el('a', 'button ice-callbtn', 'Call ' + x[2]); a.href = href; li.appendChild(a); }
        ul.appendChild(li);
      });
      cw.appendChild(ul);
      if (ice.t) { cw.appendChild(el('h4', null, 'Notes from the card holder')); cw.appendChild(el('p', 'ice-notes', ice.t)); }
      $('#iceSource').textContent = 'Contacts and notes were provided by the card holder and are stored only in this QR code, not by KHPA.';
    } else if (c) {
      $('#iceSource').textContent = 'No emergency contacts on this code. If this is your card, add them below.';
    } else $('#iceSource').textContent = '';
    syncAddForm();
  }
  function load() {
    if (!readHash()) { $('#iceResult').hidden = true; syncAddForm(); return; }
    showResult();
    if (state.card) verify(state.card).then(function (ok) { state.ok = ok === null ? 'na' : ok; showResult(); });
    document.querySelector('.ice-call').scrollIntoView({ block: 'start' });   // keep "Call 911" in view above the result
  }

  /* ---------- ID number check ---------- */
  $('#checkForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#chkId').value.trim().toUpperCase().replace(/\s+/g, ''), out = $('#chkOut');
    $('#chkId').value = v;
    if (!ID_RE.test(v)) { out.className = 'ice-status bad'; out.textContent = 'That is not a KHPA ID number. It should be two letters and seven digits, for example HA0000000.'; return; }
    if (state.card && state.card.id === v && state.ok === true) { out.className = 'ice-status good'; out.textContent = 'This number matches the verified card scanned above.'; return; }
    out.className = 'ice-status warn';
    out.textContent = v + ' is written correctly. KHPA does not publish ID records online, so to confirm the card is genuine and not expired, scan the QR code on the back of the card.';
  });

  /* ---------- holder: build the emergency QR ---------- */
  function syncAddForm() {
    var c = state.card, verified = c && state.ok === true;
    $('#addIdRow').hidden = !!verified; $('#addNameRow').hidden = !!verified;
    var note = $('#addVerified');
    if (!note) { note = el('p', 'ice-status good'); note.id = 'addVerified'; $('#addForm').insertBefore(note, $('#addForm').firstChild); }
    note.hidden = !verified; if (verified) note.textContent = '✓ Using your verified card: ' + c.name + ' · ' + c.id;
    if (state.ice) {   // prefill from the scanned code so holders can update their contacts
      [1, 2, 3].forEach(function (n) { var x = state.ice.c[n - 1] || ['', '', '']; $('#c' + n + 'n').value = x[0]; $('#c' + n + 'r').value = x[1]; $('#c' + n + 'p').value = x[2]; });
      $('#addNotes').value = state.ice.t || '';
      if (!verified) { $('#addId').value = state.ice.i || ''; $('#addName').value = state.ice.m || ''; }
    }
  }
  var lastUrl = '';
  $('#addForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#addErr'); err.textContent = '';
    var verified = state.card && state.ok === true, data = { c: [], t: $('#addNotes').value.trim().slice(0, 200) };
    [1, 2, 3].forEach(function (n) {
      var nm = $('#c' + n + 'n').value.trim(), rl = $('#c' + n + 'r').value.trim(), ph = $('#c' + n + 'p').value.trim();
      if (nm || ph) data.c.push([nm.slice(0, 60), rl.slice(0, 40), ph.slice(0, 30)]);
    });
    if (!data.c.length || !data.c[0][0] || !telHref(data.c[0][2])) { err.textContent = 'Enter a name and phone number for Contact 1.'; $('#c1n').focus(); return; }
    for (var i = 0; i < data.c.length; i++) if (!telHref(data.c[i][2])) { err.textContent = 'Each contact needs a phone number.'; return; }
    if (!verified) {
      var id = $('#addId').value.trim().toUpperCase().replace(/\s+/g, '');
      if (id && !ID_RE.test(id)) { err.textContent = 'Check your ID number: two letters and seven digits.'; $('#addId').focus(); return; }
      data.i = id; data.m = $('#addName').value.trim().slice(0, 60);
    }
    if (!data.t) delete data.t;
    var e64 = b64uEnc(enc.encode(JSON.stringify(data)));
    lastUrl = BASE + (verified ? 'v=' + state.tok + '&' : '') + 'e=' + e64;
    $('#addQr').innerHTML = KHPAQR.svg(lastUrl, { ecl: 'L', margin: 4, title: 'Emergency QR code' });
    $('#addQrNote').textContent = verified ? 'This code shows your verified KHPA card and your emergency contacts.' : 'This code shows your emergency contacts. Your ID is not marked as verified because the card QR code was not scanned.';
    $('#addOpen').href = lastUrl.replace('https://khpa.io', '');
    $('#addOut').hidden = false; $('#addOut').scrollIntoView({ block: 'start' });
  });

  /* ---------- saving / printing ---------- */
  function qrPng(text, ecl, name) {
    var m = KHPAQR.matrix(text, ecl), sc = 12, mg = 4, sz = (m.n + mg * 2) * sc, cv = document.createElement('canvas'), x = cv.getContext('2d');
    cv.width = cv.height = sz; x.fillStyle = '#fff'; x.fillRect(0, 0, sz, sz); x.fillStyle = '#000';
    for (var r = 0; r < m.n; r++) for (var c = 0; c < m.n; c++) if (m.dark(r, c)) x.fillRect((c + mg) * sc, (r + mg) * sc, sc, sc);
    cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); });
  }
  function printSheet(html) {
    var p = $('#icePrint'); if (!p) { p = el('div'); p.id = 'icePrint'; document.body.appendChild(p); }
    p.innerHTML = html; document.body.classList.add('ice-printing');
    setTimeout(function () { window.print(); }, 50);
  }
  window.addEventListener('afterprint', function () { document.body.classList.remove('ice-printing'); });
  function escTxt(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  $('#addPng').addEventListener('click', function () { if (lastUrl) qrPng(lastUrl, 'L', 'khpa-emergency-qr.png'); });
  $('#addCopy').addEventListener('click', function () {
    var b = this; if (!lastUrl) return;
    (navigator.clipboard ? navigator.clipboard.writeText(lastUrl) : Promise.reject()).then(function () { b.textContent = 'Link copied'; }, function () { window.prompt('Copy this link:', lastUrl); });
  });
  $('#addPrint').addEventListener('click', function () {
    if (!lastUrl) return;
    var c1 = $('#c1n').value.trim(), p1 = $('#c1p').value.trim(), nm = state.card && state.ok === true ? state.card.name : $('#addName').value.trim();
    printSheet('<div class="ice-wallet"><div class="ice-wallet-qr">' + KHPAQR.svg(lastUrl, { ecl: 'L', margin: 2 }) + '</div><div class="ice-wallet-txt"><b>IN CASE OF EMERGENCY</b><span>Scan for contacts</span>'
      + (nm ? '<span>' + escTxt(nm) + '</span>' : '') + '<span>ICE: ' + escTxt(c1) + '</span><span>' + escTxt(p1) + '</span><small>Ko Hawaiʻi Pae ʻĀina · khpa.io/e</small></div></div>'
      + '<p class="ice-cut">Cut out along the border. Wallet card size 3.375 × 2.125 in.</p>');
  });
  var PAGE_URL = 'https://khpa.io/emergency.html';
  $('#pageQr').innerHTML = KHPAQR.svg(PAGE_URL, { ecl: 'M', margin: 4, title: 'QR code for khpa.io/emergency.html' });
  $('#posterPng').addEventListener('click', function () { qrPng(PAGE_URL, 'M', 'khpa-emergency-page-qr.png'); });
  $('#posterPrint').addEventListener('click', function () {
    printSheet('<div class="ice-poster"><h1>In Case of Emergency</h1><p class="ice-poster-911">Life-threatening emergency? <b>Call 911.</b></p><div class="ice-poster-code">' + KHPAQR.svg(PAGE_URL, { ecl: 'M', margin: 2 })
      + '</div><p>Scan to verify a KHPA ID card and reach the holder&rsquo;s emergency contacts.</p><p class="ice-poster-url">khpa.io/emergency.html</p><p class="ice-poster-org">Ko Hawaiʻi Pae ʻĀina · (808) 333-3459</p></div>');
  });

  window.addEventListener('hashchange', load);
  load();
})();
