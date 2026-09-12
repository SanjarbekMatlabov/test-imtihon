/* Ikonkalar — barchasi 24x24 chizmada, currentColor bilan bo'yaladi.
   Tashqi kutubxona yo'q, emoji yo'q. Ico.svg(nom) HTML qaytaradi. */
(function () {
'use strict';

var P = {
  /* --- mavzular --- */
  // ogohlantiruvchi uchburchak belgi
  belgi:    '<path d="M12 3.2 21.8 20.4H2.2Z"/><path d="M12 9.6v4.2"/><path d="M12 17.1h.01"/>',
  // yo'l va uzuq markaziy chiziq
  chiziq:   '<path d="M5.5 3v18M18.5 3v18"/><path d="M12 3.6v3.2M12 10.4v3.2M12 17.2v3.2"/>',
  // svetofor
  svetofor: '<rect x="7" y="2.2" width="10" height="19.6" rx="3.2"/><circle cx="12" cy="7" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="17" r="1.7"/>',
  // chorraha
  chorraha: '<path d="M9.2 2.5v6.7H2.5v5.6h6.7v6.7h5.6v-6.7h6.7V9.2h-6.7V2.5Z"/>',
  // yo'l bering — teskari uchburchak
  ustunlik: '<path d="M2.6 3.8h18.8L12 20.4Z"/><path d="M12 9v3.4"/>',
  // burilish o'qi
  manevr:   '<path d="M6 20.5v-7.8a4.5 4.5 0 0 1 4.5-4.5H18"/><path d="m14.6 4.7 3.9 3.5-3.9 3.5"/>',
  // quvib o'tish — ustki o'q uzunroq
  quvib:    '<path d="M3 7.5h13.5"/><path d="m13.6 4.6 3 2.9-3 2.9"/><path d="M3 16.5h7.5"/><path d="m7.6 13.6 3 2.9-3 2.9"/>',
  // spidometr
  tezlik:   '<path d="M3.4 18.2a9.2 9.2 0 1 1 17.2 0"/><path d="m12 14.4 4.2-4.6"/><circle cx="12" cy="15.6" r="1.5"/>',
  // to'xtash — doiradagi P
  toxtash:  '<circle cx="12" cy="12" r="9.2"/><path d="M10 16.8V7.6h3.1a2.9 2.9 0 0 1 0 5.8H10"/>',
  // piyoda
  piyoda:   '<circle cx="12" cy="3.9" r="1.9"/><path d="M12 7.4v6.3"/><path d="m12 13.7 2.9 6.9M12 13.7l-2.9 6.9"/><path d="m8.3 9.4 3.7-1.6 3.7 1.6"/>',
  // temir yo'l — Andrey xochi
  temiryol: '<path d="m4.4 4.4 15.2 15.2M19.6 4.4 4.4 19.6"/><circle cx="12" cy="12" r="1.3"/>',
  // avtomagistral — ko'prik
  magistral:'<path d="M2.8 19.8v-5.3a9.2 9.2 0 0 1 18.4 0v5.3"/><path d="M12 8.2v11.6"/><path d="M2.8 14.5h18.4"/>',
  // faralar
  yoritish: '<path d="M4.6 6.4h3.2a5.6 5.6 0 0 1 0 11.2H4.6a.9.9 0 0 1-.9-.9V7.3a.9.9 0 0 1 .9-.9Z"/><path d="M13.4 8.4h2.8M13.4 12h5.4M13.4 15.6h2.8"/>',
  // shatak — zanjir bo'g'ini
  shatak:   '<path d="M10.4 13.6a3.4 3.4 0 0 1 0-4.8l2.1-2.1a3.4 3.4 0 0 1 4.8 4.8l-1 1"/><path d="M13.6 10.4a3.4 3.4 0 0 1 0 4.8l-2.1 2.1a3.4 3.4 0 0 1-4.8-4.8l1-1"/>',
  // yuk quti
  yuk:      '<path d="m12 2.6 9 4.9v9L12 21.4 3 16.5v-9Z"/><path d="m3 7.5 9 4.9 9-4.9"/><path d="M12 12.4v9"/>',
  // kalit — texnik holat
  texnik:   '<path d="M15.4 3.2a5.3 5.3 0 0 0-5.1 8.9L3.6 18.8a1.9 1.9 0 0 0 2.7 2.7l6.7-6.7a5.3 5.3 0 0 0 6.6-7.1l-3 3-2.8-2.8 3-3a5.3 5.3 0 0 0-1.4-1.7Z"/>',
  // rul — haydash texnikasi
  haydash:  '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="2.6"/><path d="M12 2.8v6.6M4.1 16.6l5.7-3.3M19.9 16.6l-5.7-3.3"/>',
  // tibbiy yordam
  tibbiy:   '<rect x="2.8" y="6.6" width="18.4" height="14.6" rx="2.4"/><path d="M8.8 6.6V4.8a1.8 1.8 0 0 1 1.8-1.8h2.8a1.8 1.8 0 0 1 1.8 1.8v1.8"/><path d="M12 10.8v6M9 13.8h6"/>',
  // kitob — atamalar
  atama:    '<path d="M4 4.8A1.8 1.8 0 0 1 5.8 3H20v14.4H5.8A1.8 1.8 0 0 0 4 19.2Z"/><path d="M4 19.2A1.8 1.8 0 0 0 5.8 21H20"/><path d="M8 7.4h7.4M8 11h7.4"/>',
  // hujjat — boshqa qoidalar
  umumiy:   '<path d="M5.4 2.8h8.2l5 5v13.4a1 1 0 0 1-1 1H5.4a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1Z"/><path d="M13.4 2.8v5h5"/><path d="M8 12.6h8M8 16.4h5.4"/>',

  /* --- rejimlar --- */
  // sekundomer — imtihon
  exam:     '<circle cx="12" cy="13.6" r="8.2"/><path d="M12 9.4v4.2l2.7 2"/><path d="M9.6 2.4h4.8M12 2.4v3"/>',
  // aralashtirish
  mixed:    '<path d="M17 3.4h4v4"/><path d="M21 3.4 13.4 11"/><path d="M17 20.6h4v-4"/><path d="M21 20.6 13.4 13"/><path d="M3 3.4 8.6 9"/><path d="M3 20.6 8.6 15"/>',
  // marra bayrog'i
  marathon: '<path d="M5 21.4V2.8"/><path d="M5 3.6h14l-3.4 4.6L19 12.8H5Z"/><path d="M12 3.6v9.2M5 8.2h14"/>',
  // nishon — xatolar
  mistakes: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.4"/>',
  // savol belgisi
  warn:     '<circle cx="12" cy="12" r="9.2"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.7-2.6 2.7"/><path d="M12 16.8h.01"/>',

  /* --- oflayn / o'rnatish --- */
  // telefon
  phone:    '<rect x="6" y="2.2" width="12" height="19.6" rx="2.6"/><path d="M10.6 18.6h2.8"/>',
  // yuklab olish
  download: '<path d="M12 3.4v12.2"/><path d="m7.4 11.2 4.6 4.4 4.6-4.4"/><path d="M4 18.4v1.2a1.4 1.4 0 0 0 1.4 1.4h13.2a1.4 1.4 0 0 0 1.4-1.4v-1.2"/>',
  // bulut uzilgan — oflayn
  offline:  '<path d="M2.6 2.6l18.8 18.8"/><path d="M7.5 8.1A5.2 5.2 0 0 0 6.6 18.4h10a4.3 4.3 0 0 0 3-1.2"/><path d="M10.6 5.3a5.2 5.2 0 0 1 7.3 4.2 4.3 4.3 0 0 1 2.3 7"/>',
  // belgilangan — tayyor
  check:    '<circle cx="12" cy="12" r="9.2"/><path d="m8 12.3 2.8 2.8L16.4 9.5"/>',

  /* --- navigatsiya --- */
  prev:     '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
  next:     '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  // yakunlash — belgilangan katak
  done:     '<path d="M20.5 11.3V12a8.5 8.5 0 1 1-5-7.8"/><path d="m8.6 11.6 3.1 3.1 8.8-8.8"/>'
};

window.Ico = {
  /* nom bo'yicha SVG qaytaradi; size — piksel */
  svg: function (name, size, cls) {
    var d = P[name] || P.umumiy;
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" width="' + (size || 24) + '" height="' + (size || 24) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  },
  has: function (name) { return !!P[name]; }
};

})();
