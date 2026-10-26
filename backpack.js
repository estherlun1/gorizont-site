(function () {
  var TOWEL = '<svg viewBox="0 0 40 40"><rect x="8" y="3" width="24" height="34" rx="3" fill="#8fbcec"/><rect x="8" y="12" width="24" height="5" fill="#fff"/><rect x="8" y="23" width="24" height="5" fill="#fff"/></svg>';
  var COMB = '<svg viewBox="0 0 40 40"><rect x="3" y="9" width="34" height="9" rx="3" fill="#e08a3c"/><path d="M7 18v14M14 18v14M20 18v14M26 18v14M33 18v14" stroke="#e08a3c" stroke-width="3" stroke-linecap="round"/></svg>';

  // Нужные вещи: [значок, название]
  var GOOD = [
    ['👕', 'Футболка'], ['🩳', 'Шорты'], ['🧦', 'Носки'], ['🩲', 'Нижнее бельё'],
    ['🧢', 'Панама'], ['🧥', 'Тёплая кофта'], ['👖', 'Брюки'], ['👗', 'Наряд для дискотеки'],
    ['👟', 'Кроссовки'], ['🥾', 'Резиновые сапоги'], ['🪥', 'Зубная щётка'], ['🧼', 'Мыло'],
    ['🧴', 'Шампунь'], [TOWEL, 'Полотенце'], [COMB, 'Расчёска'], ['🌞', 'Крем от солнца']
  ];
  // Запрещённые вещи: [значок, название, почему нельзя]
  var BAD = [
    ['🍰', 'Торты и пирожные', 'кремовые сладости быстро портятся'],
    ['🥛', 'Йогурт и творожки', 'молочные продукты быстро портятся без холодильника'],
    ['🥗', 'Салат из дома', 'домашние салаты быстро портятся'],
    ['🌭', 'Колбаса и сосиски', 'колбасы и копчёности брать нельзя'],
    ['🍟', 'Чипсы и фри', 'в них слишком много добавок'],
    ['🥤', 'Газировка', 'сладкая газировка запрещена'],
    ['⚡', 'Энергетик', 'энергетические напитки запрещены'],
    ['🍜', 'Лапша быстрого приготовления', 'в ней много добавок'],
    ['🥜', 'Арахис', 'арахис запрещён'],
    ['🍓', 'Свежая клубника и малина', 'свежие ягоды брать нельзя'],
    ['🌶️', 'Острые соусы и кетчуп', 'острые соусы и кетчуп запрещены'],
    ['🥫', 'Консервы', 'закусочные консервы брать нельзя'],
    ['🍱', 'Еда, приготовленная дома', 'домашнюю еду в лагерь брать нельзя'],
    ['🐟', 'Сырая рыба', 'рыбу без готовки (строганину) брать нельзя']
  ];
  var CHEER = [
    'Отлично! Именно это пригодится.',
    'В точку! Рюкзак становится умнее.',
    'Так держать — ещё одна полезная вещь!',
    'Правильный выбор! Лагерь одобряет.',
    'Молодец! Место в рюкзаке потрачено не зря.',
    'Супер! Берём с собой.',
    'Есть! Такая вещь точно пригодится.'
  ];
  var GOOD_TALK = [
    ' пригодится в лагере — берём!',
    ' точно понадобится в лагере. Кладём!',
    ' отправляется в рюкзак. Хороший выбор!',
    ' — полезная вещь для смены. Забираем!',
    ' нам пригодится. Рюкзак говорит: «да!»'
  ];
  var BAD_TALK = [
    'Ой-ой! ',
    'Стоп, путешественник! ',
    'Хитрая ловушка! ',
    'Медведь бы такое тоже не взял. ',
    'Рюкзак качает головой: '
  ];
  var ITEMS = GOOD.map(function (g) { return { e: g[0], n: g[1], ok: true }; })
    .concat(BAD.map(function (b) { return { e: b[0], n: b[1], ok: false, why: b[2] }; }));
  var TOTAL = GOOD.length;

  function $(id) { return document.getElementById(id); }
  var left = $('left'), right = $('right'), stuff = $('stuff'), bag = $('bag'), say = $('say'),
      sayTx = $('sayTx'), bar = $('bar'), cnt = $('cnt'), win = $('win'), conf = $('confetti');
  var packed = 0, drag = null;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function talk(msg, cls) { sayTx.textContent = msg; say.className = 'say ' + cls; }
  function kick(el, cls) { el.classList.remove('pop', 'shake'); void el.offsetWidth; el.classList.add(cls); }
  function update() {
    bar.style.width = (packed / TOTAL * 100) + '%';
    cnt.textContent = packed + ' из ' + TOTAL;
  }

  function build() {
    left.innerHTML = right.innerHTML = stuff.innerHTML = '';
    packed = 0; update();
    talk(pick([
      'Поехали! Выбирай вещи для лагеря и перетаскивай их в рюкзак.',
      'Проверим твою лагерную интуицию: что действительно нужно взять?',
      'Рюкзак открыт! Собери всё полезное, а лишнее оставь дома.',
      'Твой квест начинается: найди вещи, которые пригодятся на смене!'
    ]), '');
    shuffle(ITEMS.slice()).forEach(function (it, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'item'; b._it = it;
      b.style.setProperty('--r', (Math.random() * 6 - 3).toFixed(1) + 'deg');
      b.innerHTML = '<span>' + it.e + '</span>' + it.n;
      b.addEventListener('pointerdown', down);
      b.addEventListener('click', function (e) { if (e.detail === 0) attempt(b, null); }); // с клавиатуры
      (i % 2 ? right : left).appendChild(b);
    });
  }

  // ---- перетаскивание ----
  function down(e) {
    if (drag || e.button) return;
    var t = e.currentTarget, r = t.getBoundingClientRect();
    drag = { t: t, id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, g: null };
    try { t.setPointerCapture(e.pointerId); } catch (_) {}
    t.addEventListener('pointermove', move);
    t.addEventListener('pointerup', up);
    t.addEventListener('pointercancel', cancel);
  }
  function over(e) {
    var r = bag.getBoundingClientRect();
    return e.clientX > r.left - 12 && e.clientX < r.right + 12 && e.clientY > r.top - 12 && e.clientY < r.bottom + 12;
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.g) {
      if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 8) return;
      var g = drag.t.cloneNode(true);
      g.classList.add('ghost'); g.style.width = drag.w + 'px';
      document.body.appendChild(g);
      drag.g = g; drag.t.classList.add('up');
    }
    drag.g.style.left = (e.clientX - drag.dx) + 'px';
    drag.g.style.top = (e.clientY - drag.dy) + 'px';
    bag.classList.toggle('hot', over(e));
  }
  function end() {
    var d = drag, t = d.t;
    t.removeEventListener('pointermove', move);
    t.removeEventListener('pointerup', up);
    t.removeEventListener('pointercancel', cancel);
    drag = null; bag.classList.remove('hot'); t.classList.remove('up');
    return d;
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var hit = drag.g ? over(e) : true; // короткий тап = «положить в рюкзак»
    var d = end();
    if (hit) attempt(d.t, d.g); else back(d.t, d.g);
  }
  function cancel() { if (drag) { var d = end(); back(d.t, d.g); } }
  function back(t, g) {
    if (!g) return;
    var r = t.getBoundingClientRect();
    g.classList.add('back');
    g.style.left = r.left + 'px'; g.style.top = r.top + 'px';
    setTimeout(function () { g.remove(); }, 380);
  }

  // ---- правильно / неправильно ----
  function attempt(t, g) {
    var it = t._it;
    if (it.ok) {
      if (g) g.remove();
      t.hidden = true; packed++;
      var i = document.createElement('i');
      i.innerHTML = it.e; i.title = it.n; stuff.appendChild(i);
      kick(bag, 'pop'); update();
      talk('✅ ' + it.n + pick(GOOD_TALK) + ' ' + pick(CHEER), 'yes');
      if (packed === TOTAL) setTimeout(finish, 700);
    } else {
      if (g) back(t, g); else kick(t, 'shake');
      kick(bag, 'shake');
      talk('✋ ' + pick(BAD_TALK) + it.n + ': ' + it.why + '. Оставляем дома!', 'no');
    }
  }

  function finish() {
    conf.innerHTML = '';
    var em = ['🎉', '⭐', '✨', '🎒', '☀️'];
    for (var k = 0; k < 40; k++) {
      var s = document.createElement('span');
      s.textContent = pick(em);
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
      s.style.animationDelay = (Math.random() * 1.5) + 's';
      conf.appendChild(s);
    }
    win.hidden = false;
    $('again').focus();
  }
  $('again').addEventListener('click', function () { win.hidden = true; conf.innerHTML = ''; build(); });

  build();
})();
