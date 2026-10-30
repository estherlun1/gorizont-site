// Координаты отличий указаны в процентах относительно каждой картинки.
const levels = [
  {
    title: 'Домик у озера',
    instruction: 'Найди 7 отличий между картинками',
    total: 7,
    imageA: 'assets/find-difference/level-1-a.jpg',
    imageB: 'assets/find-difference/level-1-b.jpg',
    alt: 'Домик у озера',
    spots: [
      { id: 1, x: 37, y: 32, label: 'Крыша домика' },
      { id: 2, x: 16, y: 70, label: 'Рюкзак у забора' },
      { id: 3, x: 75, y: 75, label: 'Лодка у причала' },
      { id: 4, x: 13, y: 10, label: 'Птица на ветке' },
      { id: 5, x: 17, y: 53, label: 'Столик у дома' },
      { id: 6, x: 92, y: 14, label: 'Чайки' },
      { id: 7, x: 24, y: 90, label: 'Цветы у камней' }
    ]
  },
  {
    title: 'Вечер у костра',
    instruction: 'Найди 7 отличий между картинками',
    total: 7,
    imageA: 'assets/find-difference/level-2-a.jpg',
    imageB: 'assets/find-difference/level-2-b.jpg',
    alt: 'Вечер у костра в палаточном лагере',
    spots: [
      { id: 1, x: 8.2, y: 50.8, label: 'Гитара у палатки' },
      { id: 2, x: 10.8, y: 58.5, label: 'Кружка на пеньке' },
      { id: 3, x: 67.3, y: 33.2, label: 'Парусник на озере' },
      { id: 4, x: 66.8, y: 43.5, label: 'Утки на воде' },
      { id: 5, x: 81.2, y: 46.8, label: 'Полотенце на верёвке' },
      { id: 6, x: 80.8, y: 79.0, label: 'Книга на столе' },
      { id: 7, x: 94.0, y: 75.8, label: 'Фонарь справа' }
    ]
  },
  {
    title: 'Рыбалка у причала',
    instruction: 'Найди 7 отличий между картинками',
    total: 7,
    imageA: 'assets/find-difference/level-3-a.jpg',
    imageB: 'assets/find-difference/level-3-b.jpg',
    alt: 'Дети на рыбацком мостике у озера',
    spots: [
      { id: 1, x: 88, y: 80, label: 'Лодка у причала' },
      { id: 2, x: 8, y: 63, label: 'Рюкзак у дерева' },
      { id: 3, x: 76, y: 72, label: 'Спасательный круг' },
      { id: 4, x: 49, y: 73, label: 'Ведро на мостике' },
      { id: 5, x: 80, y: 55, label: 'Утки на воде' },
      { id: 6, x: 22, y: 9, label: 'Белка на площадке' },
      { id: 7, x: 67, y: 34, label: 'Флаг у домика' }
    ]
  }
];

let levelIndex = 0;
let found = new Set();
let hintTimer = null;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const status = $('#status');
const count = $('#found-count');
const win = $('#win-panel');
const nextButton = $('#next-level-btn');

function render() {
  const level = levels[levelIndex];
  $('#level-title').textContent = level.title;
  $('.instruction').textContent = level.instruction;
  $('#total-count').textContent = level.total;
  count.textContent = found.size;
  const images = $$('.picture-wrap img');
  images[0].src = level.imageA;
  images[1].src = level.imageB;
  images[0].alt = `Картинка А: ${level.alt}`;
  images[1].alt = `Картинка Б: ${level.alt}`;
  win.hidden = true;
  nextButton.hidden = levelIndex >= levels.length - 1;
  $$('.hotspots').forEach((layer) => {
    layer.innerHTML = '';
    level.spots.forEach((spot) => {
      const button = document.createElement('button');
      button.className = 'spot';
      button.type = 'button';
      button.style.left = `${spot.x}%`;
      button.style.top = `${spot.y}%`;
      button.setAttribute('aria-label', `Проверить отличие: ${spot.label}`);
      button.title = spot.label;
      button.addEventListener('click', () => checkSpot(spot));
      layer.appendChild(button);
    });
  });
  status.textContent = 'Удачи! Отличия можно искать на любой из двух картинок.';
  syncFound();
}

function checkSpot(spot) {
  if (found.has(spot.id)) return;
  found.add(spot.id);
  $$('.hotspots .spot').forEach((button, index) => {
    if (levels[levelIndex].spots[index]?.id === spot.id) button.classList.add('found');
  });
  count.textContent = found.size;
  status.textContent = `Отличие найдено! ${spot.label}.`;
  if (found.size === levels[levelIndex].total) {
    status.textContent = 'Все отличия найдены!';
    $('#win-title').textContent = `Ура, уровень «${levels[levelIndex].title}» пройден!`;
    $('#win-message').textContent = levelIndex < levels.length - 1
      ? 'Отличная работа! Готов попробовать следующий сюжет?'
      : 'Ты прошёл все доступные уровни. Скоро добавим новые приключения!';
    nextButton.hidden = levelIndex >= levels.length - 1;
    win.hidden = false;
  }
}

function syncFound() {
  $$('.hotspots').forEach((layer) => [...layer.children].forEach((button, index) => {
    if (levels[levelIndex].spots[index] && found.has(levels[levelIndex].spots[index].id)) {
      button.classList.add('found');
    }
  }));
}

$('#reset-btn').addEventListener('click', () => {
  found.clear();
  render();
  status.textContent = `Начали заново. Найди все ${levels[levelIndex].total} отличий.`;
});
$('#again-btn').addEventListener('click', () => {
  found.clear();
  render();
});
nextButton.addEventListener('click', () => {
  if (levelIndex >= levels.length - 1) return;
  levelIndex += 1;
  found.clear();
  render();
});
$('#hint-btn').addEventListener('click', () => {
  const remaining = levels[levelIndex].spots.filter((spot) => !found.has(spot.id));
  if (!remaining.length) return;
  const target = remaining[0];
  $$('.hotspots .spot').forEach((button, index) => {
    if (levels[levelIndex].spots[index]?.id === target.id) button.classList.add('hint');
  });
  status.textContent = `Подсказка: присмотрись к области «${target.label}».`;
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => $$('.spot.hint').forEach((button) => button.classList.remove('hint')), 1800);
});

render();
