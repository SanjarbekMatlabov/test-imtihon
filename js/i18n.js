/* Interfeys matnlari uch tilda: l = lotin, c = kirill, r = rus.
   Ishlatish:  T('modeExam')  yoki  T('heroP', {q:1260, n:20}) */
(function () {
'use strict';

var STR = {
  /* ---------- bosh sahifa ---------- */
  hero1:          { l: 'Haqiqiy imtihon',  c: 'Ҳақиқий имтиҳон',  r: 'Тренируйтесь в условиях' },
  hero2:          { l: 'muhitida mashq qiling', c: 'муҳитида машқ қилинг', r: 'настоящего экзамена' },
  heroP:          { l: '{q} ta rasmiy savol · 63 bilet · uch tilda. {n} savol, {m} daqiqa, {e} tagacha xatoga ruxsat.',
                    c: '{q} та расмий савол · 63 билет · уч тилда. {n} савол, {m} дақиқа, {e} тагача хатога рухсат.',
                    r: '{q} официальных вопроса · 63 билета · на трёх языках. {n} вопросов, {m} минут, до {e} ошибок.' },
  statExams:      { l: 'imtihon',  c: 'имтиҳон',  r: 'экзамен' },
  statPass:       { l: 'o‘tish',   c: 'ўтиш',     r: 'сдано' },
  statErr:        { l: 'xato',     c: 'хато',     r: 'ошибки' },

  badgeMain:      { l: 'ASOSIY',   c: 'АСОСИЙ',   r: 'ГЛАВНОЕ' },

  modeExam:       { l: 'Imtihon',  c: 'Имтиҳон',  r: 'Экзамен' },
  modeExamP:      { l: 'Tasodifiy bilet, {m} daqiqa taymer, javob qulflanadi. {k}-xatoda imtihon to‘xtaydi.',
                    c: 'Тасодифий билет, {m} дақиқа таймер, жавоб қулфланади. {k}-хатода имтиҳон тўхтайди.',
                    r: 'Случайный билет, таймер {m} минут, ответ фиксируется. На {k}-й ошибке экзамен прерывается.' },
  modeMixed:      { l: 'Aralash imtihon', c: 'Аралаш имтиҳон', r: 'Смешанный экзамен' },
  modeMixedP:     { l: 'Butun bazadan {n} ta tasodifiy savol. Eng qiyin rejim.',
                    c: 'Бутун базадан {n} та тасодифий савол. Энг қийин режим.',
                    r: '{n} случайных вопросов из всей базы. Самый сложный режим.' },
  modeMarathon:   { l: 'Marafon',  c: 'Марафон',  r: 'Марафон' },
  modeMarathonP:  { l: 'Barcha {q} savol ketma-ket. Izoh bilan, joyi eslab qolinadi',
                    c: 'Барча {q} савол кетма-кет. Изоҳ билан, жойи эслаб қолинади',
                    r: 'Все {q} вопросов подряд. С пояснением, место запоминается' },
  marathonAt:     { l: ' — hozir {n}-savolda', c: ' — ҳозир {n}-саволда', r: ' — сейчас вопрос {n}' },
  modeMistakes:   { l: 'Xatolarim', c: 'Хатоларим', r: 'Мои ошибки' },
  modeMistakesP:  { l: '{n} ta savolda xato qildingiz. To‘g‘ri javob bersangiz ro‘yxatdan chiqadi.',
                    c: '{n} та саволда хато қилдингиз. Тўғри жавоб берсангиз рўйхатдан чиқади.',
                    r: 'Вы ошиблись в {n} вопросах. Ответите правильно — вопрос уйдёт из списка.' },
  modeMistakesNo: { l: 'Hozircha xato yo‘q. Imtihon topshiring.',
                    c: 'Ҳозирча хато йўқ. Имтиҳон топширинг.',
                    r: 'Пока ошибок нет. Сдайте экзамен.' },

  secTopics:      { l: 'Mavzular', c: 'Мавзулар', r: 'Темы' },
  secTopicsSub:   { l: 'Zaif mavzuni tanlab, faqat shu turdagi savollarni mashq qiling. Halqa — mavzuni qanchalik o‘zlashtirganingiz.',
                    c: 'Заиф мавзуни танлаб, фақат шу турдаги саволларни машқ қилинг. Ҳалқа — мавзуни қанчалик ўзлаштирганингиз.',
                    r: 'Выберите слабую тему и отрабатывайте только её вопросы. Кольцо — насколько тема освоена.' },
  secTickets:     { l: 'Biletlar', c: 'Билетлар', r: 'Билеты' },
  secTicketsSub:  { l: 'O‘rgatuvchi rejim — javobdan keyin darhol izoh ko‘rsatiladi, taymer yo‘q.',
                    c: 'Ўргатувчи режим — жавобдан кейин дарҳол изоҳ кўрсатилади, таймер йўқ.',
                    r: 'Обучающий режим — пояснение сразу после ответа, без таймера.' },
  tkNone:         { l: 'topshirilmagan', c: 'топширилмаган', r: 'не сдан' },
  tkBest:         { l: 'eng yaxshi: {n}/20', c: 'энг яхши: {n}/20', r: 'лучший: {n}/20' },

  /* ---------- imtihon ekrani ---------- */
  quit:           { l: 'Chiqish', c: 'Чиқиш', r: 'Выйти' },
  livesTitle:     { l: 'Ruxsat etilgan xatolar', c: 'Рухсат этилган хатолар', r: 'Допустимые ошибки' },
  titleExam:      { l: '{t}-bilet · imtihon', c: '{t}-билет · имтиҳон', r: 'билет {t} · экзамен' },
  titleTicket:    { l: '{t}-bilet', c: '{t}-билет', r: 'билет {t}' },
  titleMistakes:  { l: 'Xatolar ustida ishlash', c: 'Хатолар устида ишлаш', r: 'Работа над ошибками' },
  qword:          { l: 'savol', c: 'савол', r: 'вопрос' },
  izoh:           { l: 'Izoh', c: 'Изоҳ', r: 'Пояснение' },
  imgAlt:         { l: 'savol rasmi', c: 'савол расми', r: 'изображение к вопросу' },
  prev:           { l: 'Oldingi', c: 'Олдинги', r: 'Назад' },
  next:           { l: 'Keyingi', c: 'Кейинги', r: 'Далее' },
  finishBtn:      { l: 'Yakunlash', c: 'Якунлаш', r: 'Завершить' },
  hintAnswer:     { l: 'javob', c: 'жавоб', r: 'ответ' },
  hintMove:       { l: 'harakat', c: 'ҳаракат', r: 'навигация' },
  hintNext:       { l: 'keyingi', c: 'кейинги', r: 'далее' },

  /* ---------- tasdiqlash oynasi ---------- */
  confirmTitle:   { l: 'Haqiqatdan boshlamoqchimisiz?', c: 'Ҳақиқатдан бошламоқчимисиз?', r: 'Точно начать экзамен?' },
  confirmRandom:  { l: 'butun bazadan tasodifiy savollar', c: 'бутун базадан тасодифий саволлар', r: 'случайные вопросы из всей базы' },
  confirmLine:    { l: '{n} savol · {m} daqiqa · {e} tagacha xatoga ruxsat',
                    c: '{n} савол · {m} дақиқа · {e} тагача хатога рухсат',
                    r: '{n} вопросов · {m} минут · до {e} ошибок' },
  confirmWarn:    { l: 'Taymer darhol ishga tushadi, javobni o‘zgartirib bo‘lmaydi.',
                    c: 'Таймер дарҳол ишга тушади, жавобни ўзгартириб бўлмайди.',
                    r: 'Таймер запустится сразу, ответ изменить нельзя.' },
  yesStart:       { l: 'Ha, boshlash', c: 'Ҳа, бошлаш', r: 'Да, начать' },
  no:             { l: 'Yo‘q', c: 'Йўқ', r: 'Нет' },
  quitTitle:      { l: 'Imtihonni tark etasizmi?', c: 'Имтиҳонни тарк этасизми?', r: 'Выйти из экзамена?' },
  quitWarn:       { l: 'Natija saqlanmaydi, imtihon boshidan boshlanadi.',
                    c: 'Натижа сақланмайди, имтиҳон бошидан бошланади.',
                    r: 'Результат не сохранится, экзамен начнётся заново.' },
  yesQuit:        { l: 'Ha, chiqish', c: 'Ҳа, чиқиш', r: 'Да, выйти' },

  /* ---------- natija ---------- */
  passed:         { l: 'O‘TDINGIZ', c: 'ЎТДИНГИЗ', r: 'СДАНО' },
  failed:         { l: 'YIQILDINGIZ', c: 'ЙИҚИЛДИНГИЗ', r: 'НЕ СДАНО' },
  whyTime:        { l: 'Vaqt tugadi', c: 'Вақт тугади', r: 'Время вышло' },
  whyErr:         { l: 'Ruxsat etilgan xatolar chegarasi oshib ketdi',
                    c: 'Рухсат этилган хатолар чегараси ошиб кетди',
                    r: 'Превышен лимит допустимых ошибок' },
  whyPass:        { l: 'Imtihondan muvaffaqiyatli o‘tdingiz', c: 'Имтиҳондан муваффақиятли ўтдингиз', r: 'Вы успешно сдали экзамен' },
  whyFail:        { l: 'Imtihondan o‘ta olmadingiz', c: 'Имтиҳондан ўта олмадингиз', r: 'Экзамен не сдан' },
  rCorrect:       { l: 'to‘g‘ri', c: 'тўғри', r: 'верно' },
  rWrong:         { l: 'xato', c: 'хато', r: 'ошибки' },
  rBlank:         { l: 'javobsiz', c: 'жавобсиз', r: 'без ответа' },
  rTime:          { l: 'vaqt', c: 'вақт', r: 'время' },
  retry:          { l: 'Qayta topshirish', c: 'Қайта топшириш', r: 'Пройти заново' },
  homeBtn:        { l: 'Bosh sahifa', c: 'Бош саҳифа', r: 'На главную' },
  analysis:       { l: 'Savollar tahlili', c: 'Саволлар таҳлили', r: 'Разбор вопросов' },
  tagRight:       { l: 'TO‘G‘RI', c: 'ТЎҒРИ', r: 'ВЕРНО' },
  tagYou:         { l: 'SIZ', c: 'СИЗ', r: 'ВЫ' },
  noAnswer:       { l: 'javob berilmadi', c: 'жавоб берилмади', r: 'нет ответа' },
  rvMeta:         { l: '{i}-SAVOL · {t}-BILET', c: '{i}-САВОЛ · {t}-БИЛЕТ', r: 'ВОПРОС {i} · БИЛЕТ {t}' },

  /* ---------- mavzu ---------- */
  tpTitle:        { l: '{name} — {a}/{b} o‘zlashtirilgan', c: '{name} — {a}/{b} ўзлаштирилган', r: '{name} — освоено {a}/{b}' },

  /* ---------- mavzu / boshqa ---------- */
  themeLight:     { l: 'Yorug‘', c: 'Ёруғ', r: 'Светлая' },
  themeDark:      { l: 'Qorong‘i', c: 'Қоронғи', r: 'Тёмная' },
  noData:         { l: 'Savollar bazasi yuklanmadi.', c: 'Саволлар базаси юкланмади.', r: 'База вопросов не загружена.' },
  noDataP:        { l: 'data/questions.js fayli joyidami?', c: 'data/questions.js файли жойидами?', r: 'Файл data/questions.js на месте?' },

  /* ---------- oflayn kartochkasi ---------- */
  pwaTitle:       { l: 'Oflayn rejim', c: 'Офлайн режим', r: 'Офлайн-режим' },
  pwaNeedHttps:   { l: 'Ishlashi uchun sayt HTTPS orqali ochilishi kerak',
                    c: 'Ишлаши учун сайт HTTPS орқали очилиши керак',
                    r: 'Для работы сайт должен открываться по HTTPS' },
  pwaFull:        { l: 'Barcha rasmlar yuklangan — internetsiz to‘liq ishlaydi',
                    c: 'Барча расмлар юкланган — интернетсиз тўлиқ ишлайди',
                    r: 'Все изображения загружены — работает полностью без интернета' },
  pwaReady:       { l: 'Rasmlarni oldindan yuklab qo‘ysangiz internetsiz ishlaydi',
                    c: 'Расмларни олдиндан юклаб қўйсангиз интернетсиз ишлайди',
                    r: 'Загрузите изображения заранее — и всё заработает без интернета' },
  pwaOffline:     { l: 'Internet yo‘q — yuklangan qismi ishlayapti',
                    c: 'Интернет йўқ — юкланган қисми ишлаяпти',
                    r: 'Нет интернета — работает загруженная часть' },
  pwaImages:      { l: '{a} / {b} rasm · {p}%', c: '{a} / {b} расм · {p}%', r: '{a} / {b} изображений · {p}%' },
  pwaLoading:     { l: 'yuklanmoqda…', c: 'юкланмоқда…', r: 'загрузка…' },
  pwaInstall:     { l: 'Ilova sifatida o‘rnatish', c: 'Илова сифатида ўрнатиш', r: 'Установить как приложение' },
  pwaDownload:    { l: 'Rasmlarni yuklab olish (~63 MB)', c: 'Расмларни юклаб олиш (~63 MB)', r: 'Загрузить изображения (~63 МБ)' },
  pwaDownloading: { l: 'Yuklanmoqda…', c: 'Юкланмоқда…', r: 'Загрузка…' },
  pwaClear:       { l: 'Keshni tozalash', c: 'Кэшни тозалаш', r: 'Очистить кэш' }
};

/* joriy til app.js dagi holatdan olinadi */
var lang = 'l';

window.I18N = {
  set: function (l) { lang = (l === 'c' || l === 'r') ? l : 'l'; },
  get: function () { return lang; },
  t: function (key, p) {
    var row = STR[key];
    if (!row) return key;                       // kalit topilmasa o'zini qaytaramiz
    var s = row[lang] || row.l || '';
    if (p) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return p[k] != null ? p[k] : m;
      });
    }
    return s;
  }
};

})();
