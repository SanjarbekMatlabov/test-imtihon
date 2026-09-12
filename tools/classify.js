/* Savollarni mavzular bo'yicha tasniflash.
   Ishlatish:  node tools/classify.js
   Natija:     data/topics.js  (window.TOPICS + savol -> mavzu xaritasi)

   Mantiq: avval izohdagi YHQ ilova havolasi (eng ishonchli signal),
   so'ng savol matnidagi atamalar ustuvorlik tartibida tekshiriladi. */

const fs = require('fs');
const path = require('path');
const SRC = 'D:/data xauusdt/prava-test-2026/barcha-uz-lat.json';
const all = JSON.parse(fs.readFileSync(SRC, 'utf8'));

/* --- mavzular: id, nom, ikonka --- */
const TOPICS = [
  /* icon — js/icons.js dagi chizma nomi (emoji emas) */
  { id: 'belgi',    name: 'Yo‘l belgilari',            icon: 'belgi' },
  { id: 'chiziq',   name: 'Yo‘l chiziqlari',           icon: 'chiziq' },
  { id: 'svetofor', name: 'Svetofor va regulirovchi',  icon: 'svetofor' },
  { id: 'chorraha', name: 'Chorrahalardan o‘tish',     icon: 'chorraha' },
  { id: 'ustunlik', name: 'Ustunlik va yo‘l berish',   icon: 'ustunlik' },
  { id: 'manevr',   name: 'Manevr va burilish',        icon: 'manevr' },
  { id: 'quvib',    name: 'Quvib o‘tish',              icon: 'quvib' },
  { id: 'tezlik',   name: 'Tezlik va masofa',          icon: 'tezlik' },
  { id: 'toxtash',  name: 'To‘xtash va turish',        icon: 'toxtash' },
  { id: 'piyoda',   name: 'Piyoda va yo‘lovchilar',    icon: 'piyoda' },
  { id: 'temiryol', name: 'Temir yo‘l kesishmalari',   icon: 'temiryol' },
  { id: 'magistral',name: 'Avtomagistral va turar joy',icon: 'magistral' },
  { id: 'yoritish', name: 'Yoritish va signallar',     icon: 'yoritish' },
  { id: 'shatak',   name: 'Shatakka olish',            icon: 'shatak' },
  { id: 'yuk',      name: 'Yuk tashish',               icon: 'yuk' },
  { id: 'texnik',   name: 'Texnik holat va nosozlik',  icon: 'texnik' },
  { id: 'haydash',  name: 'Haydash texnikasi va YTH',  icon: 'haydash' },
  { id: 'tibbiy',   name: 'Tibbiy yordam',             icon: 'tibbiy' },
  { id: 'atama',    name: 'Atamalar va ta’riflar',     icon: 'atama' },
  { id: 'umumiy',   name: 'Boshqa qoidalar',           icon: 'umumiy' }
];

/* apostroflarni bir xillashtirish */
const norm = s => (s || '').toLowerCase().replace(/[‘’`´']/g, "'");
const has = (t, ...ws) => ws.some(w => t.includes(w));

/* --- qoidalar: ustuvorlik tartibida, birinchi mos kelgani yutadi --- */
function classify(q) {
  const qt = norm(q.content.uz_lat.text);
  const iz = norm(q.izoh && q.izoh.uz_lat);
  const t  = qt + ' ' + iz;

  // 1) juda aniq mavzular — boshqa atamalar bilan aralashmaydi
  if (has(t, 'temir yo\'l', 'temiryo\'l', 'shlagbaum'))            return 'temiryol';
  if (has(t, 'tibbiy', 'birinchi yordam', 'jarohat', 'qon keti', 'zararlangan',
             'reanimatsiya', 'massaj', 'sun\'iy nafas', 'bint', 'jgut', 'shikastlan'))
    return 'tibbiy';
  if (has(qt, 'shatak'))                                           return 'shatak';

  // 2) izohdagi YHQ ilova havolasi — eng ishonchli signal
  if (/3\s*-\s*ilova/.test(iz) || has(t, 'foydalanish taqiqlanadi', 'nosoz', 'tormoz tizimi', 'shina', 'texnik holat'))
    return 'texnik';
  if (/2\s*-\s*ilova/.test(iz) || has(qt, 'chiziq', 'razmetka'))   return 'chiziq';

  // 3) xulq-atvor mavzulari — belgidan ustun, chunki belgi rasmda shunchaki fon bo'lishi mumkin
  if (has(qt, 'svetofor', 'regulirovchi', 'qo\'l signal'))         return 'svetofor';
  if (has(qt, 'quvib o\'t', 'quvib-o\'t'))                         return 'quvib';
  if (has(qt, 'chorraha'))                                         return 'chorraha';
  if (has(qt, "piyoda", "yo'lovchi", "bolalar", "avtobus bekat", "bekat",
              "odam tash", "odamlarni tash", "yukxonasida odam", "o'rindig"))
    return 'piyoda';
  if (has(qt, 'avtomagistral', 'turar joy daha'))                  return 'magistral';
  if (has(qt, 'to\'xtash', 'to\'xtab turish', 'to\'xtatish taqiq')) return 'toxtash';
  if (has(qt, 'tezlik', 'masofa', 'oraliq'))                       return 'tezlik';

  // 4) ustunlik — «kim yo'l beradi» tipidagi savollar (chorraha aytilmagan holatlar)
  if (has(qt, "yo'l berishi", "yo'l berish", "ustunlik", "birinchi navbatda harakatlan",
              "birinchi bo'lib o't", "harakatlanish huquqiga ega", "kim birinchi", "imtiyoz"))
    return 'ustunlik';

  if (has(qt, "burilish", "manevr", "orqaga yur", "qayril", "bo'lak", "tasma",
              "qatnov qism", "yo'nalishlarda harakat", "yo'nalish bo'yicha harakat"))
    return 'manevr';
  if (has(qt, "fara", "yoritish", "gabarit", "chiroq", "tuman", "burilish ko'rsatkich",
              "ovoz signal", "ogohlantirish signal", "qorong'i", "ko'rinish"))
    return 'yoritish';
  if (has(qt, 'yuk tash', 'yukning', 'yuk ortil', 'yuk tirkama', 'tirkama'))  return 'yuk';

  // 5) haydash texnikasi va yo'l-transport hodisalari
  if (has(qt, "sirpanib", "sirpanish", "sirpanch", "turg'un", "tormozlanish", "tormozlash",
              "yo'l transport hodisa", "yth", "yonilg'i", "boshqarish usuli",
              "charcha", "spirtli", "mast", "ag'daril", "o'rganuvchi"))
    return 'haydash';

  // 6) belgi — 1-ilova havolasi yoki matnda belgi haqida so'ralsa
  if (/1\s*-\s*ilova/.test(iz) || has(qt, 'belgi'))                return 'belgi';

  // 7) atamalar va ta'riflar — «... deganda nima tushuniladi», «X - ...»
  if (has(qt, 'deganda nima', 'nima tushuniladi', 'ta\'rif', 'atama', 'nechta bob',
              'qanday nomlanadi', 'nima deb ataladi') || /^[^?]{3,40}\s[-–—]\s*\.\.\./.test(qt))
    return 'atama';

  return 'umumiy';
}

/* --- ishga tushirish --- */
const map = {};
const count = {};
TOPICS.forEach(t => count[t.id] = 0);

all.forEach(q => {
  const id = classify(q);
  map[q.task_info.global_id] = id;
  count[id]++;
});

const out =
  'window.TOPICS=' + JSON.stringify(TOPICS) + ';\n' +
  'window.QTOPIC=' + JSON.stringify(map) + ';';
const dest = path.join(__dirname, '..', 'data', 'topics.js');
fs.writeFileSync(dest, out);

console.log('Jami savol:', all.length);
console.log('Fayl:', dest, '(' + fs.statSync(dest).size + ' bayt)\n');
TOPICS.forEach(t => {
  const n = count[t.id], bar = '#'.repeat(Math.round(n / 8));
  console.log(String(n).padStart(4) + '  ' + t.name.padEnd(30) + bar);
});
