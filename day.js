(function () {
  var A = 'assets/';
  // Чтобы поменять время, текст или фото — правьте этот список.
  // c: цвет времени суток; m: маскот ('wolf' | 'bear') и его реплика; photos: файлы из assets (пусто = заглушка)
  var C1 = '#f2b84b', C2 = '#118d84', C3 = '#a58be0', C4 = '#24384f';
  var DAY = [
    { t: '08:00', e: '🌅', c: C1, n: 'Подъём', s: 'Доброе утро, Горизонт!',
      d: 'Вожатые включают бодрую музыку и будят отряд. Умывайся, застилай кровать — впереди целый день приключений.',
      m: 'bear', say: 'Я бы ещё поспал… но завтрак сам себя не съест!', photos: ['d-podem.jpg'] },
    { t: '08:20', e: '🤸', c: C1, n: 'Зарядка', s: 'Проснуться по-настоящему',
      d: 'Общая весёлая разминка на свежем воздухе: потянулись, попрыгали — и сон как рукой сняло.',
      m: 'wolf', say: 'Раз-два, раз-два! Я уже размялся, а ты?', photos: ['d-zaradka.jpg', 'd-zarya.jpg'] },
    { t: '09:00', e: '🍳', c: C1, n: 'Завтрак', s: 'Заряд сил на весь день',
      d: 'Всем отрядом идём в столовую. Хороший завтрак — и сил хватит на всё самое интересное.',
      photos: ['d-zavtrak.jpg'] },
    { t: '10:30', e: '🎨', c: C2, n: 'Кружки', s: 'Творчество, мастерилки и идеи',
      d: 'Выбирай занятие по душе: рисуй, мастери, придумывай. Здесь рождаются поделки, которые так приятно увезти домой.',
      m: 'bear', say: 'Я тут слепил из шишек целого лесного жителя!', photos: ['d-krug.jpg', 'd-krugi.jpg', 'd-kruzh.jpg'] },
    { t: '13:00', e: '🍲', c: C2, n: 'Обед', s: 'Самое время подкрепиться',
      d: 'После весёлого утра все собираются в столовой — обсуждают, что успели, и пробуют горячий обед.',
      photos: ['s-dining-hall.jpg', 'd-obed.jpg', 'd-obedd.jpg'] },
    { t: '15:00', e: '⚽', c: C2, n: 'Спортивные активности', s: 'Бегаем, прыгаем, побеждаем',
      d: 'Волейбол, футбол, эстафеты, верёвочные испытания и батут. Главное — командный дух и хорошее настроение.',
      m: 'wolf', say: 'Лови мяч! Бегаю я быстро — попробуй догнать.', photos: ['g-volleyball.jpg', 'g-ropes-girl.jpg', 'g-trampoline.jpg'] },
    { t: '16:30', e: '🥪', c: C2, n: 'Полдник', s: 'Небольшая пауза на перекус',
      d: 'Лёгкий перекус между активностями, чтобы хватило сил до самого ужина.', photos: ['d-poldnik.jpg', 'd-poldnikk.jpg'] },
    { t: '17:00', e: '🛝', c: C3, n: 'Свободное время', s: 'Занимайся тем, что нравится',
      d: 'Покачайся на качелях, прогуляйся с друзьями, поболтай на лавочке или просто отдохни.',
      m: 'bear', say: 'Лучшее время, чтобы найти новых друзей.', photos: ['g-swing.jpg', 's-hug-bench.jpg', 's-selfie-walk.jpg'] },
    { t: '18:00', e: '🎭', c: C3, n: 'Подготовка к мероприятию', s: 'Репетиции, костюмы и декорации',
      d: 'Отряд готовится к вечеру: придумывает номера, репетирует, делает декорации. Каждый может внести свою идею.',
      photos: ['d-podgotov.jpg', 'd-podgotovk.jpg', 'd-pogotovka.jpg'] },
    { t: '19:00', e: '🍽️', c: C3, n: 'Ужин', s: 'Вкусное завершение дня',
      d: 'Собираемся за столами и делимся впечатлениями дня.', photos: ['d-uzhin.jpg', 'd-uahin.jpg'] },
    { t: '20:00', e: '🎤', c: C3, n: 'Вечернее мероприятие', s: 'Концерт, игра или праздник',
      d: 'Главное событие дня: концерт, большая игра, дискотека или костёр. Каждый вечер — новая история.',
      m: 'wolf', say: 'Огни, музыка, сцена — вот это вечер!', photos: ['d-vechern.jpg', 'd-vecher.jpg', 's-night-disco.jpg', 's-ogonek-lights.jpg'] },
    { t: '21:30', e: '🌙', c: C4, n: 'Пятое питание', s: 'Последний перекус дня',
      d: 'Небольшой перекус перед сном — и можно готовиться ко сну.',
      m: 'bear', say: 'Последний вкусный сюрприз дня!', photos: [] },
    { t: '22:00', e: '😴', c: C4, n: 'Отбой', s: 'Спокойной ночи, Горизонт',
      d: 'Чистим зубы, переодеваемся, а вожатые желают всем доброй ночи. Завтра будет новый классный день!',
      m: 'wolf', say: 'Тсс… Лес засыпает. Спокойной ночи!', photos: ['d-otboi.jpg', 's-ogonek-candle.jpg'] }
  ];
  var MASC = { wolf: 'Волк', bear: 'Медведь' };
  var tl = document.getElementById('tl'), cur = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function toggle(li) {
    var open = !li.classList.contains('open');
    if (cur && cur !== li) close(cur);
    li.classList.toggle('open', open);
    li.querySelector('.t').setAttribute('aria-expanded', open);
    cur = open ? li : null;
    if (open) setTimeout(function () { li.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 380);
  }
  function close(li) { li.classList.remove('open'); li.querySelector('.t').setAttribute('aria-expanded', 'false'); }

  DAY.forEach(function (ev, i) {
    var li = document.createElement('li');
    li.className = 'ev reveal'; li.style.setProperty('--c', ev.c);
    var ph = ev.photos.length
      ? ev.photos.map(function (f) { return '<img src="' + A + f + '" alt="' + esc(ev.n) + '" loading="lazy">'; }).join('')
      : '<div class="ph">📷 Фото скоро появится</div>';
    var mm = ev.m
      ? '<div class="say-m"><img src="' + A + ev.m + '.png" alt="' + MASC[ev.m] + '"><p><b>' + MASC[ev.m] + ':</b> «' + esc(ev.say) + '»</p></div>' : '';
    li.innerHTML =
      '<button class="t" type="button" aria-expanded="false" aria-controls="ev' + i + '">' + ev.t + '</button>' +
      '<div class="dot" aria-hidden="true">' + ev.e + '</div>' +
      '<div class="body"><div class="head"><div><h3>' + esc(ev.n) + '</h3><small>' + esc(ev.s) + '</small></div>' +
      (ev.m ? '<img class="peek" src="' + A + ev.m + '.png" alt="">' : '') + '</div>' +
      '<div class="more" id="ev' + i + '"><div><div class="card-ev"><p>' + esc(ev.d) + '</p><div class="photos">' + ph + '</div>' + mm + '</div></div></div></div>';
    li.querySelector('.t').addEventListener('click', function () { toggle(li); });
    li.querySelector('.head').addEventListener('click', function () { toggle(li); });
    tl.appendChild(li);
  });
})();
