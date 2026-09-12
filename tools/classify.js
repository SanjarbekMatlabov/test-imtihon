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
  /* icon — js/icons.js dagi chizma nomi (emoji emas)
     name — uch tilda: l = lotin, c = kirill, r = rus */
  { id: 'belgi',    icon: 'belgi',    name: { l: 'Yo‘l belgilari', c: 'Йўл белгилари', r: 'Дорожные знаки' } },
  { id: 'chiziq',   icon: 'chiziq',   name: { l: 'Yo‘l chiziqlari', c: 'Йўл чизиқлари', r: 'Дорожная разметка' } },
  { id: 'svetofor', icon: 'svetofor', name: { l: 'Svetofor va regulirovchi', c: 'Светофор ва регулировчи', r: 'Светофор и регулировщик' } },
  { id: 'chorraha', icon: 'chorraha', name: { l: 'Chorrahalardan o‘tish', c: 'Чорраҳалардан ўтиш', r: 'Проезд перекрёстков' } },
  { id: 'ustunlik', icon: 'ustunlik', name: { l: 'Ustunlik va yo‘l berish', c: 'Устунлик ва йўл бериш', r: 'Приоритет и уступить дорогу' } },
  { id: 'manevr',   icon: 'manevr',   name: { l: 'Manevr va burilish', c: 'Маневр ва бурилиш', r: 'Манёвр и поворот' } },
  { id: 'quvib',    icon: 'quvib',    name: { l: 'Quvib o‘tish', c: 'Қувиб ўтиш', r: 'Обгон' } },
  { id: 'tezlik',   icon: 'tezlik',   name: { l: 'Tezlik va masofa', c: 'Тезлик ва масофа', r: 'Скорость и дистанция' } },
  { id: 'toxtash',  icon: 'toxtash',  name: { l: 'To‘xtash va turish', c: 'Тўхташ ва туриш', r: 'Остановка и стоянка' } },
  { id: 'piyoda',   icon: 'piyoda',   name: { l: 'Piyoda va yo‘lovchilar', c: 'Пиёда ва йўловчилар', r: 'Пешеходы и пассажиры' } },
  { id: 'temiryol', icon: 'temiryol', name: { l: 'Temir yo‘l kesishmalari', c: 'Темир йўл кесишмалари', r: 'Железнодорожные переезды' } },
  { id: 'magistral',icon: 'magistral',name: { l: 'Avtomagistral va turar joy', c: 'Автомагистрал ва турар жой', r: 'Автомагистраль и жилая зона' } },
  { id: 'yoritish', icon: 'yoritish', name: { l: 'Yoritish va signallar', c: 'Ёритиш ва сигналлар', r: 'Световые приборы и сигналы' } },
  { id: 'shatak',   icon: 'shatak',   name: { l: 'Shatakka olish', c: 'Шатаккa олиш', r: 'Буксировка' } },
  { id: 'yuk',      icon: 'yuk',      name: { l: 'Yuk tashish', c: 'Юк ташиш', r: 'Перевозка грузов' } },
  { id: 'texnik',   icon: 'texnik',   name: { l: 'Texnik holat va nosozlik', c: 'Техник ҳолат ва носозлик', r: 'Техническое состояние и неисправности' } },
  { id: 'haydash',  icon: 'haydash',  name: { l: 'Haydash texnikasi va YTH', c: 'Ҳайдаш техникаси ва ЙТҲ', r: 'Техника вождения и ДТП' } },
  { id: 'tibbiy',   icon: 'tibbiy',   name: { l: 'Tibbiy yordam', c: 'Тиббий ёрдам', r: 'Первая помощь' } },
  { id: 'atama',    icon: 'atama',    name: { l: 'Atamalar va ta’riflar', c: 'Атамалар ва таърифлар', r: 'Термины и определения' } },
  { id: 'umumiy',   icon: 'umumiy',   name: { l: 'Boshqa qoidalar', c: 'Бошқа қоидалар', r: 'Прочие правила' } }
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
  console.log(String(n).padStart(4) + "  " + t.name.l.padEnd(30) + bar);
});
