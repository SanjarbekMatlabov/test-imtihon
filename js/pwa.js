/* PWA qatlami: service worker, o'rnatish taklifi, oflayn holat,
   rasmlarni oflayn uchun yuklab olish. */
(function () {
'use strict';

var sw = null;          // faol service worker
var installEvent = null; // brauzerning o'rnatish taklifi
var imgTotal = 0;        // jami rasm soni
var imgCached = 0;       // keshlangan rasm soni
var busy = false;        // yuklash jarayonida

function imgUrls() {
  var seen = {}, out = [];
  var Q = window.QUESTIONS || [];
  for (var i = 0; i < Q.length; i++) {
    var f = Q[i].img;
    if (f && !seen[f]) { seen[f] = 1; out.push('images/' + f); }
  }
  return out;
}

function send(msg) {
  if (sw) sw.postMessage(msg);
}

function refresh() {
  var box = document.getElementById('pwaBox');
  if (box) box.innerHTML = inner();
}

/* --- service worker --- */
function register() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then(function (reg) {
    sw = reg.active || reg.waiting || reg.installing;
    navigator.serviceWorker.ready.then(function (r) {
      sw = r.active;
      send({ type: 'IMG_STATUS', total: imgTotal });
    });
  }).catch(function () { /* HTTPS yoki localhost bo'lmasa ro'yxatdan o'tmaydi */ });

  navigator.serviceWorker.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'IMG_STATUS') { imgCached = d.cached; busy = false; refresh(); }
    else if (d.type === 'IMG_PROGRESS') { imgCached = d.done; busy = true; refresh(); }
    else if (d.type === 'IMG_DONE') { imgCached = d.done; busy = false; refresh(); }
  });
}

/* --- amallar --- */
function install() {
  if (!installEvent) return;
  installEvent.prompt();
  installEvent.userChoice.then(function () { installEvent = null; refresh(); });
}
function download() {
  if (busy || !sw) return;
  busy = true; refresh();
  send({ type: 'CACHE_IMAGES', urls: imgUrls() });
}
function clear() {
  if (busy || !sw) return;
  send({ type: 'CLEAR_IMAGES', total: imgTotal });
}

/* --- bosh sahifadagi kartochka --- */
function inner() {
  var online = navigator.onLine;
  var pct = imgTotal ? Math.round(imgCached / imgTotal * 100) : 0;
  var full = imgTotal && imgCached >= imgTotal;
  var noSW = !('serviceWorker' in navigator) || !sw;

  var T = function (k, p) { return window.I18N ? I18N.t(k, p) : k; };

  var head =
    '<div class="pwa-head">' +
      '<span class="pwa-ic">' + Ico.svg(full ? 'check' : online ? 'phone' : 'offline', 20) + '</span>' +
      '<div><b>' + T('pwaTitle') + '</b>' +
        '<small>' + (noSW ? T('pwaNeedHttps')
              : full   ? T('pwaFull')
              : online ? T('pwaReady')
                       : T('pwaOffline')) +
        '</small>' +
      '</div>' +
    '</div>';

  if (noSW) return head;

  var bar =
    '<div class="pwa-bar"><i style="width:' + pct + '%"></i></div>' +
    '<div class="pwa-meta">' + T('pwaImages', { a: imgCached, b: imgTotal, p: pct }) +
      (busy ? ' · ' + T('pwaLoading') : '') + '</div>';

  var acts = '<div class="pwa-acts">';
  if (installEvent) {
    acts += '<button class="btn" onclick="PWA.install()">' + Ico.svg('phone', 17) + T('pwaInstall') + '</button>';
  }
  if (!full) {
    acts += '<button class="btn' + (installEvent ? ' ghost' : '') + '" onclick="PWA.download()"' +
            (busy || !navigator.onLine ? ' disabled' : '') + '>' +
            Ico.svg('download', 17) + (busy ? T('pwaDownloading') : T('pwaDownload')) + '</button>';
  } else {
    acts += '<button class="btn ghost" onclick="PWA.clear()">' + T('pwaClear') + '</button>';
  }
  acts += '</div>';

  return head + bar + acts;
}

function card() {
  imgTotal = imgUrls().length;
  return '<div class="pwa" id="pwaBox">' + inner() + '</div>';
}

/* --- hodisalar --- */
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault(); installEvent = e; refresh();
});
window.addEventListener('appinstalled', function () { installEvent = null; refresh(); });
window.addEventListener('online', refresh);
window.addEventListener('offline', refresh);

window.PWA = { card: card, install: install, download: download, clear: clear, register: register };

})();
