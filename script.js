/* ===== КАРТА ЛАГЕРЯ =====
   Чтобы отредактировать точки: меняйте x,y (0-560 по ширине, 0-360 по высоте) и text.
   Чтобы добавить точку: скопируйте объект в массиве pins нужной карты. */
var MAPS = {
 st: {
  bg: '#8fd17a',
  label: 'Стационарный лагерь',
  shapes:
   '<rect x="0" y="0" width="560" height="360" fill="#8fd17a"/>' +
   '<path d="M0 40 L560 10 L560 0 L0 0 Z" fill="#c7b98a"/>' + // дорога/улица сверху
   '<path d="M330 60 L360 250" stroke="#e7dcae" stroke-width="14" fill="none"/>' + // подъездная дорога
   '<path d="M330 60 L360 250" stroke="#fff" stroke-width="2" stroke-dasharray="6 8" fill="none" opacity=".6"/>' +
   '<rect x="380" y="150" width="140" height="120" rx="6" fill="#9fb8ec" stroke="#6f8fd0" stroke-width="3"/>' + // парковка
   '<g fill="#5c9a4a" opacity=".9">' +
     '<circle cx="60" cy="90" r="16"/><circle cx="95" cy="70" r="14"/><circle cx="40" cy="150" r="15"/><circle cx="80" cy="200" r="16"/>' +
     '<circle cx="480" cy="60" r="15"/><circle cx="520" cy="100" r="14"/><circle cx="30" cy="290" r="16"/><circle cx="90" cy="320" r="14"/>' +
   '</g>',
  pins: [
   {x:355, y:55,  t:'Ворота', d:'Главный въезд с Зелёной улицы.'},
   {x:300, y:110, t:'Спальный корпус (А)', d:'Жилые комнаты и ресепшн на 1 этаже.'},
   {x:255, y:150, t:'Столовая (Б)', d:'Питание на 1 этаже корпуса.'},
   {x:250, y:95,  t:'Административный корпус (В)', d:'Аудитории и актовый зал на 2 этаже.'},
   {x:395, y:120, t:'Футбольное поле', d:'Спортивная площадка для игр и тренировок.'},
   {x:450, y:145, t:'Парковка', d:'Место для встречи и проводов детей.'}
  ]
 },
 tent: {
  bg: '#6fbf5c',
  label: 'Палаточный лагерь',
  shapes:
   '<rect x="0" y="0" width="560" height="360" fill="#6fbf5c"/>' +
   '<path d="M40 40 L120 60 L110 250 L30 260 Z" fill="#8ed6c8" stroke="#fff" stroke-width="3"/>' + // тюбинговая трасса/горка
   '<path d="M150 330 L520 330" stroke="#c7b98a" stroke-width="16"/>' + // главная дорога
   '<g fill="#3d6b2c">' + Array.from({length:24}).map(function(_,i){var x=250+ (i%8)*40, y=20+Math.floor(i/8)*40; return '<circle cx="'+x+'" cy="'+y+'" r="13"/>'}).join('') + '</g>' + // лес
   '<rect x="150" y="120" width="30" height="24" fill="#7a6a3a"/><rect x="190" y="120" width="30" height="24" fill="#7a6a3a"/>' + // гостевые домики
   '<rect x="150" y="155" width="30" height="24" fill="#7a6a3a"/><rect x="190" y="155" width="30" height="24" fill="#7a6a3a"/>' +
   '<circle cx="235" cy="170" r="16" fill="#e8622f"/>' + // костровая
   '<rect x="270" y="150" width="90" height="50" rx="4" fill="#3f8f6f" stroke="#fff" stroke-width="2"/>' + // стадион/спортплощадка
   '<rect x="380" y="150" width="110" height="60" fill="#e0743a"/>' // спортплощадка/арена
   ,
  pins: [
   {x:80, y:150,  t:'Тюбинговая трасса', d:'Горка и спуск у входа в лагерь.'},
   {x:165, y:132, t:'Жилые палатки', d:'Палаточный городок для проживания.'},
   {x:235, y:170, t:'Костровая площадка', d:'Вечера у костра и общие сборы отряда.'},
   {x:315, y:175, t:'Спортивная площадка', d:'Утренняя зарядка и командные игры.'},
   {x:435, y:180, t:'Арена / столовая', d:'Питание и большие мероприятия смены.'},
   {x:330, y:330, t:'Главная дорога', d:'Связывает жилую зону со спортивной.'}
  ]
 }
};

(function(){
 var state = { key:'st', zoom:1, active:null };
 var stage = document.getElementById('stage');
 var cap = document.getElementById('cap');
 var chips = document.getElementById('chips');
 var tabs = document.getElementById('tabs');
 var mapSection = document.getElementById('map');

 function render(){
  var m = MAPS[state.key];
  var pinsSvg = m.pins.map(function(p,i){
   return '<g class="pin'+(state.active===i?' on':'')+'" data-i="'+i+'" transform="translate('+p.x+','+p.y+')">' +
     '<circle r="11"/><text x="0" y="4" text-anchor="middle" font-size="12" font-weight="700" fill="#0d5c57">'+(i+1)+'</text></g>';
  }).join('');
  stage.innerHTML = '<svg viewBox="0 0 560 360" style="transform:scale('+state.zoom+');transform-origin:center;transition:transform .2s">' + m.shapes + pinsSvg + '</svg>';
  chips.innerHTML = m.pins.map(function(p,i){return '<button class="'+(state.active===i?'on':'')+'" data-i="'+i+'">'+(i+1)+'. '+p.t+'</button>'}).join('');
  cap.textContent = state.active===null ? 'Нажмите на точку или метку списка, чтобы узнать, что здесь находится.' : m.pins[state.active].t+' — '+m.pins[state.active].d;
  stage.querySelectorAll('.pin').forEach(function(el){el.addEventListener('click',function(){state.active=+el.dataset.i;render();});});
  chips.querySelectorAll('button').forEach(function(el){el.addEventListener('click',function(){state.active=+el.dataset.i;render();});});
 }

 tabs.querySelectorAll('button').forEach(function(b){
  b.addEventListener('click',function(){
   tabs.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});
   b.classList.add('on'); state.key=b.dataset.map; state.active=null; state.zoom=1; render();
  });
 });
 document.getElementById('zin').addEventListener('click',function(){state.zoom=Math.min(2.2,state.zoom+.2);render();});
 document.getElementById('zout').addEventListener('click',function(){state.zoom=Math.max(.6,state.zoom-.2);render();});
 document.getElementById('zrs').addEventListener('click',function(){state.zoom=1;render();});
 document.getElementById('full').addEventListener('click',function(){
  mapSection.classList.toggle('full');
  document.getElementById('full').textContent = mapSection.classList.contains('full') ? 'Закрыть ✕' : 'Открыть карту ⌖';
 });

 render();
})();
