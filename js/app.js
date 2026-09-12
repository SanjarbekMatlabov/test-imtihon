/* ============================================================
   YHQ Imtihon — B toifa
   Real imtihon muhiti: 20 savol / 25 daqiqa / 2 ta xatoga ruxsat
   ============================================================ */
(function () {
'use strict';

var Q = window.QUESTIONS || [];
var TOPICS = window.TOPICS || [];     // mavzular ro'yxati
var QTOPIC = window.QTOPIC || {};     // savol id -> mavzu id
var EXAM_COUNT = 20;          // imtihondagi savollar soni
var EXAM_SECONDS = 25 * 60;   // 25 daqiqa
var MAX_ERRORS = 2;           // 2 tagacha xatoga ruxsat, 3-chisida yiqiladi

/* ---------------- saqlash ---------------- */
var SKEY = 'yhq_b_state_v1';
var S = load();

function load() {
  try {
    var raw = localStorage.getItem(SKEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (!s.solved) s.solved = {};      // eski saqlangan holat bilan moslik
      if (!s.mistakes) s.mistakes = {};
      if (!s.tickets) s.tickets = {};
      if (!s.pos) s.pos = {};            // bilet/mavzuda to'xtagan joy
      return s;
    }
  } catch (e) {}
  return { lang: 'l', theme: 'dark', exams: 0, passed: 0, mistakes: {}, tickets: {}, marathon: 0, solved: {}, pos: {} };
}
function save() {
  try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {}
}

/* ---------------- yordamchilar ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function shuffle(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)), t = a[i];
    a[i] = a[j]; a[j] = t;
  }
  return a;
}
function byTicket(n) {
  return Q.filter(function (q) { return q.t === n; })
          .sort(function (a, b) { return a.o - b.o; });
}
function byTopic(id) {
  return Q.filter(function (q) { return QTOPIC[q.id] === id; });
}
/* ro'yxat bo'yicha o'zlashtirish: to'g'ri yechilgan / jami */
function progressOf(list) {
  var done = 0;
  for (var i = 0; i < list.length; i++) if (S.solved[list[i].id]) done++;
  return { total: list.length, done: done, pct: list.length ? Math.round(done / list.length * 100) : 0 };
}
function topicProgress(id)  { return progressOf(byTopic(id)); }
function ticketProgress(n)  { return progressOf(byTicket(n)); }

/* to'xtagan joyni saqlash kaliti */
function posKey(mode, opts) {
  if (mode === 'ticket') return 't' + opts.ticket;
  if (mode === 'topic')  return 'p' + opts.topic;
  return '';
}
function mm(sec) {
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
function L(obj) { return (obj && obj[S.lang]) || (obj && obj.l) || ''; }
/* interfeys matni — js/i18n.js dan */
function T(key, p) { return window.I18N ? I18N.t(key, p) : key; }
/* mavzu nomi joriy tilda */
function topicName(id) {
  for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return L(TOPICS[i].name);
  return '';
}
var el = function (id) { return document.getElementById(id); };
var view = function () { return el('view'); };

/* ---------------- tasdiqlash oynasi ---------------- */
var askYes = null;   // "Ha" bosilganda chaqiriladigan funksiya

function ask(opts) {
  askYes = opts.onYes;
  var box = el('modal');
  box.innerHTML =
    '<div class="modal-box" role="dialog" aria-modal="true">' +
      '<div class="modal-ic">' + Ico.svg(opts.icon || 'warn', 30) + '</div>' +
      '<h3>' + esc(opts.title) + '</h3>' +
      (opts.text ? '<p>' + opts.text + '</p>' : '') +
      '<div class="modal-acts">' +
        '<button class="btn ghost" onclick="App.askNo()">' + esc(T('no')) + '</button>' +
        '<button class="btn" id="askYesBtn" onclick="App.askYes()">' + esc(opts.yes || T('yesStart')) + '</button>' +
      '</div>' +
    '</div>';
  box.classList.add('on');
  var b = el('askYesBtn');
  if (b) b.focus();
}
function askNo() { el('modal').classList.remove('on'); askYes = null; }
function askOk() {
  var fn = askYes;
  askNo();
  if (fn) fn();
}

/* ---------------- sessiya ---------------- */
var ses = null;   // {mode,list,idx,ans[],instant,timed,left,timer,dead}

function start(mode, opts) {
  opts = opts || {};

  // imtihon rejimlari taymer bilan ishlaydi va statistikaga yoziladi —
  // shuning uchun boshlashdan oldin tasdiq so'raymiz
  if ((mode === 'exam' || mode === 'mixed') && !opts.ok) {
    var tk = opts.ticket ? T('titleTicket', { t: opts.ticket }) : T('confirmRandom');
    return ask({
      icon: 'exam',
      title: T('confirmTitle'),
      text: '<b>' + esc(tk) + '</b><br>' +
            esc(T('confirmLine', { n: EXAM_COUNT, m: EXAM_SECONDS / 60, e: MAX_ERRORS })) + '<br>' +
            '<span class="warn-txt">' + esc(T('confirmWarn')) + '</span>',
      yes: T('yesStart'),
      onYes: function () { start(mode, { ticket: opts.ticket, ok: true }); }
    });
  }

  var list;
  if (mode === 'exam')        list = byTicket(opts.ticket);
  else if (mode === 'mixed')  list = shuffle(Q).slice(0, EXAM_COUNT);
  else if (mode === 'ticket') list = byTicket(opts.ticket);
  else if (mode === 'marathon') list = Q.slice();
  else if (mode === 'topic')  list = byTopic(opts.topic);
  else if (mode === 'mistakes') {
    var ids = Object.keys(S.mistakes);
    list = Q.filter(function (q) { return ids.indexOf(q.id) >= 0; });
  }
  if (!list || !list.length) return home();

  var timed = (mode === 'exam' || mode === 'mixed');
  var ans = new Array(list.length).fill(-1);
  var idx = 0;

  // bilet va mavzuda: avval yechilgan savollar yashil holda tiklanadi,
  // "Boshidan" bosilgan bo'lsa (opts.fresh) toza boshlanadi
  var key = posKey(mode, opts);
  if (key && !opts.fresh) {
    for (var pi = 0; pi < list.length; pi++) {
      if (S.solved[list[pi].id]) {
        for (var oi = 0; oi < list[pi].a.length; oi++) {
          if (list[pi].a[oi].ok) { ans[pi] = oi; break; }
        }
      }
    }
    // saqlangan joy, bo'lmasa birinchi yechilmagan savol
    var saved = S.pos[key];
    if (saved != null && saved >= 0 && saved < list.length) idx = saved;
    else {
      var first = ans.indexOf(-1);
      idx = first >= 0 ? first : 0;
    }
  } else if (key && opts.fresh) {
    delete S.pos[key]; save();
  } else if (mode === 'marathon' && S.marathon < list.length) {
    idx = S.marathon;
  }

  ses = {
    mode: mode,
    ticket: opts.ticket || 0,
    topic: opts.topic || '',
    list: list,
    idx: idx,
    ans: ans,
    instant: !timed,
    timed: timed,
    left: EXAM_SECONDS,
    dead: false,
    timer: null
  };
  if (timed) {
    ses.timer = setInterval(function () {
      ses.left--;
      var t = el('timer');
      if (t) {
        t.textContent = mm(ses.left);
        t.className = 'timer' + (ses.left <= 60 ? ' crit' : ses.left <= 300 ? ' warn' : '');
      }
      if (ses.left <= 0) finish('vaqt');
    }, 1000);
  }
  renderExam();
}

function errorCount() {
  var n = 0;
  for (var i = 0; i < ses.list.length; i++) {
    var a = ses.ans[i];
    if (a >= 0 && !ses.list[i].a[a].ok) n++;
  }
  return n;
}
function correctCount() {
  var n = 0;
  for (var i = 0; i < ses.list.length; i++) {
    var a = ses.ans[i];
    if (a >= 0 && ses.list[i].a[a].ok) n++;
  }
  return n;
}

/* ---------------- javob berish ---------------- */
function answer(i) {
  if (!ses || ses.dead) return;
  var k = ses.idx;
  if (ses.ans[k] >= 0) return;            // javob qulflangan
  ses.ans[k] = i;

  var q = ses.list[k], ok = !!q.a[i].ok;

  if (!ok) {
    S.mistakes[q.id] = (S.mistakes[q.id] || 0) + 1;
    delete S.solved[q.id];                       // o'zlashtirish bekor bo'ladi
  } else {
    S.solved[q.id] = 1;                          // mavzu progressi uchun
    if (ses.mode === 'mistakes') delete S.mistakes[q.id];
  }
  save();

  if (ses.timed && errorCount() > MAX_ERRORS) {
    renderExam();
    setTimeout(function () { finish('xato'); }, 650);
    return;
  }
  renderExam();

  // o'rgatuvchi rejimda to'g'ri javobdan keyin avtomatik oldinga
  if (ses.instant && ok) {
    setTimeout(function () { if (ses && ses.ans[ses.idx] >= 0) next(); }, 750);
  }
}
function go(i) {
  if (!ses || i < 0 || i >= ses.list.length) return;
  ses.idx = i;
  if (ses.mode === 'marathon') { S.marathon = i; save(); }
  else {
    var k = posKey(ses.mode, { ticket: ses.ticket, topic: ses.topic });
    if (k) { S.pos[k] = i; save(); }      // to'xtagan joy eslab qolinadi
  }
  renderExam();
}
/* bilet yoki mavzuni boshidan boshlash — shu ro'yxatdagi progress tozalanadi */
function restart() {
  if (!ses) return;
  var m = ses.mode, tk = ses.ticket, tp = ses.topic, list = ses.list;
  var p = progressOf(list);
  if (!p.done) return start(m, { ticket: tk, topic: tp, fresh: true });

  ask({
    icon: 'warn',
    title: T('restartTitle'),
    text: '<span class="warn-txt">' + esc(T('restartWarn', { n: p.done })) + '</span>',
    yes: T('yesRestart'),
    onYes: function () {
      for (var i = 0; i < list.length; i++) delete S.solved[list[i].id];
      save();
      start(m, { ticket: tk, topic: tp, fresh: true });
    }
  });
}
function next() {
  if (!ses) return;
  if (ses.idx >= ses.list.length - 1) {
    if (ses.timed) return finish('tugadi');
    if (ses.mode === 'marathon') { S.marathon = 0; save(); }
    return finish('tugadi');
  }
  go(ses.idx + 1);
}

/* ---------------- imtihon ekrani ---------------- */
function renderExam() {
  var q = ses.list[ses.idx], picked = ses.ans[ses.idx];
  var reveal = ses.instant && picked >= 0;
  var errs = errorCount();

  var lives = '';
  if (ses.timed) {
    lives = '<div class="lives" title="' + esc(T('livesTitle')) + '">';
    for (var i = 0; i <= MAX_ERRORS; i++) {
      lives += '<span class="life' + (i < errs ? ' lost' : '') + '"></span>';
    }
    lives += '</div>';
  }

  var title = ses.mode === 'exam' ? T('titleExam', { t: ses.ticket })
            : ses.mode === 'mixed' ? T('modeMixed')
            : ses.mode === 'ticket' ? T('titleTicket', { t: ses.ticket })
            : ses.mode === 'marathon' ? T('modeMarathon')
            : ses.mode === 'topic' ? topicName(ses.topic)
            : T('titleMistakes');

  // o'rgatuvchi rejimlarda: nechta savol yechilgani va boshidan boshlash tugmasi
  var trainer = (ses.mode === 'ticket' || ses.mode === 'topic');
  var prog = '';
  if (trainer) {
    var p = progressOf(ses.list);
    prog = '<div class="bar-prog" title="' + esc(T('solvedOf', { a: p.done, b: p.total })) + '">' +
             '<div class="bar-prog-line"><i style="width:' + p.pct + '%"></i></div>' +
             '<span>' + p.done + ' / ' + p.total + '</span>' +
           '</div>';
  }

  var bar =
    '<div class="bar">' +
      (ses.timed ? '<div class="timer" id="timer">' + mm(ses.left) + '</div>' : '') +
      '<div class="counter"><b>' + (ses.idx + 1) + '</b> / ' + ses.list.length + '</div>' +
      lives + prog +
      '<div class="spacer"></div>' +
      (trainer ? '<button class="chip" onclick="App.restart()">' + esc(T('restart')) + '</button>' : '') +
      '<button class="chip" onclick="App.quit()">' + esc(T('quit')) + '</button>' +
    '</div>';

  // navigator (marafonda 1260 ta tugma chizmaymiz)
  var nav = '';
  if (ses.list.length <= 60) {
    nav = '<div class="nav-grid">';
    for (var n = 0; n < ses.list.length; n++) {
      var a = ses.ans[n], cls = 'nv';
      if (n === ses.idx) cls += ' cur';
      // javob berilgan savol darhol yashil (to'g'ri) yoki qizil (xato) bo'ladi
      if (a >= 0) cls += ses.list[n].a[a].ok ? ' ok' : ' bad';
      nav += '<button class="' + cls + '" onclick="App.go(' + n + ')">' + (n + 1) + '</button>';
    }
    nav += '</div>';
  }

  var opts = q.a.map(function (o, i) {
    var cls = 'opt';
    if (picked >= 0) cls += ' dis';
    if (reveal) {
      if (o.ok) cls += ' right';
      else if (i === picked) cls += ' wrong';
    } else if (i === picked) cls += ' sel';
    return '<button class="' + cls + '" onclick="App.answer(' + i + ')">' +
             '<span class="k">' + (i + 1) + '</span><span>' + esc(L(o)) + '</span>' +
           '</button>';
  }).join('');

  var izoh = '';
  if (reveal && L(q.ex)) {
    izoh = '<div class="izoh"><b>' + esc(T('izoh')) + '</b>' + esc(L(q.ex)) + '</div>';
  }

  var last = ses.idx === ses.list.length - 1;
  var acts =
    '<div class="acts">' +
      '<button class="btn ghost" onclick="App.go(' + (ses.idx - 1) + ')"' + (ses.idx === 0 ? ' disabled' : '') + '>' +
        Ico.svg('prev', 18) + esc(T('prev')) + '</button>' +
      '<button class="btn" onclick="App.next()">' +
        (last ? Ico.svg('done', 18) + esc(T('finishBtn')) : esc(T('next')) + Ico.svg('next', 18)) +
      '</button>' +
    '</div>';

  // o'ng ustun: rasm va (ochilgan bo'lsa) izoh. Ikkalasi ham yo'q bo'lsa bitta ustun.
  var hasRight = !!q.img || !!izoh;
  var right = hasRight
    ? '<div class="qcol-r">' +
        (q.img ? '<div class="qimg"><img src="images/' + esc(q.img) + '" alt="' + esc(T('imgAlt')) + '"></div>' : '') +
        izoh +
      '</div>'
    : '';

  document.body.classList.add('exam-view');

  view().innerHTML = bar + nav +
    '<div class="card">' +
      '<div class="qgrid' + (hasRight ? '' : ' solo') + '">' +
        '<div class="qcol-l">' +
          '<div class="qmeta">' + esc(title) + ' · ' + esc(T('qword')) + ' ' + (ses.idx + 1) + '</div>' +
          '<div class="qtext">' + esc(L(q.q)) + '</div>' +
          '<div class="opts">' + opts + '</div>' +
        '</div>' +
        right +
      '</div>' +
      acts +
    '</div>' +
    '<div class="hint"><span class="kbd">1</span>–<span class="kbd">4</span> ' + esc(T('hintAnswer')) + ' · ' +
      '<span class="kbd">&larr;</span><span class="kbd">&rarr;</span> ' + esc(T('hintMove')) + ' · ' +
      '<span class="kbd">Enter</span> ' + esc(T('hintNext')) + '</div>';
}

/* ---------------- natija ---------------- */
function finish(reason) {
  if (!ses) return;
  if (ses.timer) clearInterval(ses.timer);
  ses.dead = true;
  document.body.classList.remove('exam-view');   // natija ekranida tahlil uzun bo'ladi

  var total = ses.list.length, ok = correctCount(), errs = errorCount();
  var answered = ses.ans.filter(function (a) { return a >= 0; }).length;
  var pct = total ? Math.round(ok / total * 100) : 0;
  var pass = ses.timed ? (errs <= MAX_ERRORS && answered === total) : (pct >= 90);

  if (ses.timed) {
    S.exams++;
    if (pass) S.passed++;
    if (ses.mode === 'exam') {
      var prev = S.tickets[ses.ticket];
      if (!prev || ok > prev) S.tickets[ses.ticket] = ok;
    }
    save();
  } else if (ses.mode === 'ticket') {
    var p = S.tickets[ses.ticket];
    if (!p || ok > p) { S.tickets[ses.ticket] = ok; save(); }
  }

  var why = reason === 'vaqt'  ? T('whyTime')
          : reason === 'xato'  ? T('whyErr')
          : pass ? T('whyPass') : T('whyFail');

  var C = 2 * Math.PI * 56;
  var ring =
    '<div class="ring"><svg width="132" height="132">' +
      '<circle cx="66" cy="66" r="56" fill="none" stroke="var(--line)" stroke-width="11"></circle>' +
      '<circle cx="66" cy="66" r="56" fill="none" stroke="var(--' + (pass ? 'ok' : 'bad') + ')" stroke-width="11" ' +
        'stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C - C * pct / 100) + '"></circle>' +
    '</svg><div class="val">' + pct + '%</div></div>';

  var review = ses.list.map(function (q, i) {
    var a = ses.ans[i], good = a >= 0 && q.a[a].ok;
    var right = q.a.filter(function (o) { return o.ok; })[0];
    var lines = '<div class="ln g"><span class="tag">' + esc(T('tagRight')) + '</span><span>' + esc(L(right)) + '</span></div>';
    if (a >= 0 && !good) lines += '<div class="ln r"><span class="tag">' + esc(T('tagYou')) + '</span><span>' + esc(L(q.a[a])) + '</span></div>';
    if (a < 0) lines += '<div class="ln r"><span class="tag">' + esc(T('tagYou')) + '</span><span>' + esc(T('noAnswer')) + '</span></div>';
    return '<div class="rv' + (good ? ' ok' : '') + '">' +
        '<div class="n">' + esc(T('rvMeta', { i: i + 1, t: q.t })) + '</div>' +
        '<div class="q">' + esc(L(q.q)) + '</div>' +
        (q.img ? '<img src="images/' + esc(q.img) + '" loading="lazy" alt="">' : '') +
        lines +
        (L(q.ex) ? '<div class="izoh"><b>' + esc(T('izoh')) + '</b>' + esc(L(q.ex)) + '</div>' : '') +
      '</div>';
  }).join('');

  var again = ses.mode === 'exam' ? 'App.start(\'exam\',{ticket:' + ses.ticket + '})'
            : ses.mode === 'ticket' ? 'App.start(\'ticket\',{ticket:' + ses.ticket + '})'
            : ses.mode === 'topic' ? 'App.start(\'topic\',{topic:\'' + ses.topic + '\'})'
            : 'App.start(\'' + ses.mode + '\')';

  view().innerHTML =
    '<div class="card res ' + (pass ? 'pass' : 'fail') + '">' +
      ring +
      '<div class="verdict">' + esc(pass ? T('passed') : T('failed')) + '</div>' +
      '<div class="sub">' + esc(why) + '</div>' +
      '<div class="rstats">' +
        '<div class="stat"><b>' + ok + '</b><small>' + esc(T('rCorrect')) + '</small></div>' +
        '<div class="stat"><b>' + errs + '</b><small>' + esc(T('rWrong')) + '</small></div>' +
        '<div class="stat"><b>' + (total - answered) + '</b><small>' + esc(T('rBlank')) + '</small></div>' +
        (ses.timed ? '<div class="stat"><b>' + mm(EXAM_SECONDS - ses.left) + '</b><small>' + esc(T('rTime')) + '</small></div>' : '') +
      '</div>' +
      '<div class="acts" style="justify-content:center">' +
        '<button class="btn" onclick="' + again + '">' + esc(T('retry')) + '</button>' +
        '<button class="btn ghost" onclick="App.home()">' + esc(T('homeBtn')) + '</button>' +
      '</div>' +
    '</div>' +
    '<div class="sec-title">' + esc(T('analysis')) + '</div>' +
    '<div class="review">' + review + '</div>';

  ses = null;
  window.scrollTo(0, 0);
}

function quit() {
  if (ses && ses.timed) {
    return ask({
      icon: 'warn',
      title: T('quitTitle'),
      text: '<span class="warn-txt">' + esc(T('quitWarn')) + '</span>',
      yes: T('yesQuit'),
      onYes: function () {
        if (ses && ses.timer) clearInterval(ses.timer);
        ses = null;
        home();
      }
    });
  }
  if (ses && ses.timer) clearInterval(ses.timer);
  ses = null;
  home();
}

/* ---------------- bosh sahifa ---------------- */
function home() {
  if (ses && ses.timer) clearInterval(ses.timer);
  ses = null;
  document.body.classList.remove('exam-view');   // bosh sahifa odatdagidek aylanadi

  var mist = Object.keys(S.mistakes).length;
  var rate = S.exams ? Math.round(S.passed / S.exams * 100) : 0;

  var tk = '';
  var TC = 2 * Math.PI * 17;                       // bilet halqasining aylanasi
  for (var i = 1; i <= 63; i++) {
    var tp = ticketProgress(i);
    var tcol = tp.pct >= 100 ? 'var(--ok-solid)' : tp.pct > 0 ? 'var(--accent)' : 'transparent';
    var tip = T('tkSolved', { a: tp.done, b: tp.total });
    if (S.tickets[i] != null) tip += ' · ' + T('tkBest', { n: S.tickets[i] });
    tk += '<button class="tk' + (tp.pct >= 100 ? ' full' : '') + '" ' +
            'onclick="App.start(\'ticket\',{ticket:' + i + '})" title="' + esc(tip) + '">' +
            '<span class="tk-ring">' +
              '<svg width="42" height="42" viewBox="0 0 42 42">' +
                '<circle cx="21" cy="21" r="17" fill="none" stroke="var(--line)" stroke-width="3"></circle>' +
                '<circle cx="21" cy="21" r="17" fill="none" stroke="' + tcol + '" stroke-width="3" ' +
                  'stroke-linecap="round" stroke-dasharray="' + TC + '" ' +
                  'stroke-dashoffset="' + (TC - TC * tp.pct / 100) + '" transform="rotate(-90 21 21)"></circle>' +
              '</svg>' +
              '<b>' + i + '</b>' +
            '</span>' +
          '</button>';
  }

  view().innerHTML =
    '<section class="hero">' +
      '<h1>' + esc(T('hero1')) + '<br><span>' + esc(T('hero2')) + '</span></h1>' +
      '<p>' + esc(T('heroP', { q: Q.length, n: EXAM_COUNT, m: EXAM_SECONDS / 60, e: MAX_ERRORS })) + '</p>' +
      '<div class="stats">' +
        '<div class="stat"><b>' + S.exams + '</b><small>' + esc(T('statExams')) + '</small></div>' +
        '<div class="stat"><b>' + rate + '%</b><small>' + esc(T('statPass')) + '</small></div>' +
        '<div class="stat"><b>' + mist + '</b><small>' + esc(T('statErr')) + '</small></div>' +
      '</div>' +
    '</section>' +

    '<div class="modes">' +
      '<button class="mode hero-mode" onclick="App.randomExam()">' +
        '<span class="badge">' + esc(T('badgeMain')) + '</span>' +
        '<div class="ic">' + Ico.svg('exam', 28) + '</div><h3>' + esc(T('modeExam')) + '</h3>' +
        '<p>' + esc(T('modeExamP', { m: EXAM_SECONDS / 60, k: MAX_ERRORS + 1 })) + '</p></button>' +

      '<button class="mode" onclick="App.start(\'mixed\')">' +
        '<div class="ic">' + Ico.svg('mixed', 28) + '</div><h3>' + esc(T('modeMixed')) + '</h3>' +
        '<p>' + esc(T('modeMixedP', { n: EXAM_COUNT })) + '</p></button>' +

      '<button class="mode" onclick="App.start(\'marathon\')">' +
        '<div class="ic">' + Ico.svg('marathon', 28) + '</div><h3>' + esc(T('modeMarathon')) + '</h3>' +
        '<p>' + esc(T('modeMarathonP', { q: Q.length }) +
          (S.marathon ? T('marathonAt', { n: S.marathon + 1 }) : '') + '.') + '</p></button>' +

      '<button class="mode" onclick="App.start(\'mistakes\')">' +
        '<div class="ic">' + Ico.svg('mistakes', 28) + '</div><h3>' + esc(T('modeMistakes')) + '</h3>' +
        '<p>' + esc(mist ? T('modeMistakesP', { n: mist }) : T('modeMistakesNo')) + '</p></button>' +
    '</div>' +

    (window.PWA ? PWA.card() : '') +

    '<div class="sec-title">' + esc(T('secTopics')) + '</div>' +
    '<div class="sec-sub">' + esc(T('secTopicsSub')) + '</div>' +
    '<div class="topics">' + topicCards() + '</div>' +

    '<div class="sec-title">' + esc(T('secTickets')) + '</div>' +
    '<div class="sec-sub">' + esc(T('secTicketsSub')) + '</div>' +
    '<div class="tickets">' + tk + '</div>';

  window.scrollTo(0, 0);
}

/* mavzu kartochkalari — kichik halqa diagramma bilan */
function topicCards() {
  return TOPICS.map(function (t) {
    var p = topicProgress(t.id);
    if (!p.total) return '';
    var C = 2 * Math.PI * 15;
    var col = p.pct >= 80 ? 'var(--ok)' : p.pct >= 40 ? 'var(--accent)' : 'var(--line)';
    var nm = L(t.name);
    return '<button class="tp" onclick="App.start(\'topic\',{topic:\'' + t.id + '\'})" ' +
             'title="' + esc(T('tpTitle', { name: nm, a: p.done, b: p.total })) + '">' +
        '<div class="tp-ring">' +
          '<svg width="38" height="38"><circle cx="19" cy="19" r="15" fill="none" stroke="var(--line)" stroke-width="3.5"></circle>' +
          '<circle cx="19" cy="19" r="15" fill="none" stroke="' + col + '" stroke-width="3.5" stroke-linecap="round" ' +
            'stroke-dasharray="' + C + '" stroke-dashoffset="' + (C - C * p.pct / 100) + '" transform="rotate(-90 19 19)"></circle></svg>' +
          '<span class="tp-ic">' + Ico.svg(t.icon, 17) + '</span>' +
        '</div>' +
        '<div class="tp-txt"><b>' + esc(nm) + '</b><small>' + p.done + ' / ' + p.total + '</small></div>' +
      '</button>';
  }).join('');
}

function randomExam() {
  start('exam', { ticket: 1 + Math.floor(Math.random() * 63) });
}

/* ---------------- til / mavzu ---------------- */
function setLang(l) {
  S.lang = l; save();
  if (window.I18N) I18N.set(l);                 // interfeys matnlari ham shu tilga o'tadi
  document.documentElement.lang = l === 'r' ? 'ru' : 'uz';
  [].forEach.call(document.querySelectorAll('#langSeg button'), function (b) {
    b.classList.toggle('on', b.dataset.lang === l);
  });
  setTheme(S.theme || 'dark');                  // mavzu tugmasi yozuvi ham yangilanadi
  ses ? renderExam() : home();
}
function setTheme(t) {
  S.theme = t; save();
  document.documentElement.dataset.theme = t;
  el('themeBtn').textContent = t === 'dark' ? T('themeLight') : T('themeDark');
}

/* ---------------- klaviatura ---------------- */
document.addEventListener('keydown', function (e) {
  // tasdiqlash oynasi ochiq bo'lsa — faqat Esc va Enter ishlaydi
  var modal = el('modal');
  if (modal && modal.classList.contains('on')) {
    if (e.key === 'Escape') { e.preventDefault(); askNo(); }
    else if (e.key === 'Enter') { e.preventDefault(); askOk(); }
    return;
  }
  if (!ses || ses.dead) return;
  if (e.key >= '1' && e.key <= '4') {
    var i = +e.key - 1;
    if (i < ses.list[ses.idx].a.length) { e.preventDefault(); answer(i); }
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault(); next();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault(); go(ses.idx - 1);
  }
});

/* ---------------- ishga tushirish ---------------- */
window.App = {
  start: start, answer: answer, go: go, next: next, home: home, quit: quit,
  randomExam: randomExam, askYes: askOk, askNo: askNo, restart: restart
};

document.addEventListener('DOMContentLoaded', function () {
  if (!Q.length) {
    view().innerHTML = '<div class="empty"><div class="ic">' + Ico.svg('warn', 44) + '</div>' +
      '<b>' + esc(T('noData')) + '</b><br>' + esc(T('noDataP')) + '</div>';
    return;
  }
  if (window.I18N) I18N.set(S.lang || 'l');
  setTheme(S.theme || 'dark');
  setLang(S.lang || 'l');
  if (window.PWA) PWA.register();

  el('themeBtn').onclick = function () { setTheme(S.theme === 'dark' ? 'light' : 'dark'); };
  [].forEach.call(document.querySelectorAll('#langSeg button'), function (b) {
    b.onclick = function () { setLang(b.dataset.lang); };
  });
  window.addEventListener('beforeunload', function (e) {
    if (ses && ses.timed) { e.preventDefault(); e.returnValue = ''; }
  });
});

})();
