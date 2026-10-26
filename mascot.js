(function(){
 const host=document.createElement('div');host.className='mascot-host bear';host.setAttribute('aria-label','Медведь — помощник сайта');host.innerHTML='<div class="mascot-sprite" aria-hidden="true"></div><div class="mascot-bubble" role="status" aria-live="polite"><button type="button" aria-label="Скрыть подсказку">×</button><strong>Медведь</strong><span class="bubble-text"></span></div>';document.body.appendChild(host);
 const bubble=host.querySelector('.mascot-bubble'), text=host.querySelector('.bubble-text'), sprite=host.querySelector('.mascot-sprite');let hideTimer, lastY=window.scrollY, scrollTimer, activePage=location.pathname.split('/').pop()||'index.html', introDone=false, currentMap='st', otherBubble=null;
 function bubbleDuration(msg){return Math.min(16000,Math.max(8500,msg.length*95))}
 function speak(msg,who){if(otherBubble)otherBubble.classList.remove('show');host.classList.remove('big','walking','waving');if(who && who!== 'bear') setMascot(who);text.textContent=msg;bubble.querySelector('strong').textContent=host.classList.contains('wolf')?'Волк':'Медведь';bubble.classList.add('show');clearTimeout(hideTimer);hideTimer=setTimeout(()=>bubble.classList.remove('show'),bubbleDuration(msg))}
 function setMascot(who){host.classList.remove('bear','wolf','waving');host.classList.add(who==='wolf'?'wolf':'bear');host.setAttribute('aria-label',(who==='wolf'?'Волк':'Медведь')+' — помощник сайта')}
 function observeDialogue(selector,msg,opts){const el=document.querySelector(selector);if(!el)return;let inside=false;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!inside){inside=true;setTimeout(()=>{if(inside)speak(msg)},140)}else if(!e.isIntersecting){inside=false}}),Object.assign({threshold:.25},opts||{}));io.observe(el);return io}
 function bigHello(){host.classList.add('big','waving');bubble.classList.add('show');const msg='Привет! Добро пожаловать в «Горизонт»! Листай дальше — впереди целый мир приключений!';text.textContent=msg;bubble.querySelector('strong').textContent='Медведь';clearTimeout(hideTimer);const dur=bubbleDuration(msg);hideTimer=setTimeout(()=>{host.classList.remove('big','waving');bubble.classList.remove('show');host.classList.add('walking')},dur);setTimeout(()=>host.classList.remove('walking'),dur+1400)}
 bubble.querySelector('button').addEventListener('click',()=>bubble.classList.remove('show'));
 function parentGate(){if(document.querySelector('.parent-modal'))return;const gate=document.createElement('section');gate.className='parent-gate';gate.id='parent-portal';gate.innerHTML='<h2>Эй, взрослые! Вам сюда?</h2><p>Тут заканчиваются приключения и начинаются документы, даты смен и серьёзные разговоры. Детям — дальше исследовать Горизонт, взрослым — отдельный портал.</p><button class="btn" type="button" id="parentOpen">Перейти на сайт для родителей ↗</button>';const footer=document.querySelector('footer');if(footer)footer.before(gate);const modal=document.createElement('div');modal.className='parent-modal';modal.hidden=true;modal.innerHTML='<div class="parent-dialog" role="dialog" aria-modal="true" aria-labelledby="parentTitle"><div class="parent-emoji">🧐</div><h2 id="parentTitle">Контроль взрослости</h2><p id="parentQuestion"></p><div class="parent-count" id="parentCount" hidden>10</div><div class="parent-actions"><button class="parent-confirm" id="parentYes">Подтвердить, я родитель</button><button class="parent-cancel" id="parentNo">Ой, я просто посмотреть</button></div><p class="fine">Не волнуйтесь: это шуточная проверка. Никаких данных вводить не нужно.</p></div>';document.body.appendChild(modal);
 const jokes=['Вы точно родитель? Вас не пугают слова «договор», «медсправка» и «оплата смены»?','Готовы обменять весёлые истории на документы, даты и списки вещей?','Последний шанс сбежать обратно к медведю. Всё ещё хотите к документам?','Вы готовы узнать стоимость смены и не спросить: «А скидка есть?»'];let joke=0;function openParentModal(){joke=Math.floor(Math.random()*jokes.length);modal.hidden=false;modal.querySelector('#parentQuestion').textContent=jokes[joke];modal.querySelector('#parentCount').hidden=true;modal.querySelector('#parentYes').hidden=false;modal.querySelector('#parentNo').textContent='Нет, верните меня к приключениям';modal.querySelector('#parentYes').textContent='Подтвердить, я родитель'};gate.querySelector('#parentOpen').onclick=openParentModal;document.querySelectorAll('.parent-shortcut').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openParentModal()}));modal.querySelector('#parentNo').onclick=()=>{modal.hidden=true;window.scrollTo({top:0,behavior:'smooth'});speak('Фух! Тогда оставайся, приключения ещё не закончились!')};modal.querySelector('#parentYes').onclick=()=>{const yes=modal.querySelector('#parentYes'),no=modal.querySelector('#parentNo'),count=modal.querySelector('#parentCount'),q=modal.querySelector('#parentQuestion');yes.hidden=true;no.hidden=true;count.hidden=false;q.textContent='Перепроверяем взрослость…';let n=10;count.textContent=n;const timer=setInterval(()=>{n--;count.textContent=n;if(n<=0){clearInterval(timer);q.textContent='Проверка пройдена. Взрослый портал открывается!';count.hidden=true;setTimeout(()=>window.location.href='https://klin-gorizont.ru/',650)}},1000)};modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});}
 parentGate();
 if(activePage==='index.html'){
   const hero=document.querySelector('.hero');if(hero){let heroInside=false;const heroIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!heroInside){heroInside=true;setTimeout(()=>{if(heroInside)bigHello()},120)}else if(!e.isIntersecting){heroInside=false}}),{threshold:.25});heroIO.observe(hero)}
   const play=document.getElementById('play');if(play){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){host.classList.add('walking');speak('Пс-с! Давай проверим, всё ли ты собрал в лагерь. Жми «Играть» — соберём рюкзак вместе!');play.classList.add('mascot-highlight');setTimeout(()=>play.classList.remove('mascot-highlight'),3500)}}),{threshold:.35});io.observe(play)}
   const map=document.getElementById('map');if(map){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(currentMap==='st'){setMascot('bear');speak('Это карта стационарного лагеря! Здесь корпуса, столовая, поле и главные ворота. Нажимай на точки — покажу, что где.')}else{speak('А здесь палаточный лагерь! Найдём палатки, костровую и места для игр. Я передам маршрут Волку!','wolf')}}}),{threshold:.25});io.observe(map)}
   document.querySelectorAll('[data-map]').forEach(btn=>btn.addEventListener('click',()=>{currentMap=btn.dataset.map;if(currentMap==='tent'){setMascot('bear');host.classList.add('walking');setTimeout(()=>{setMascot('wolf');speak('Моя очередь! Я покажу тебе палаточный лагерь и его секретные места.','wolf')},600)}else{setMascot('bear');speak('Снова я! Давай изучим стационарный лагерь.')}}));
   observeDialogue('#guides','А вот и наши вожатые! У каждого своя суперсила. Загляни познакомиться поближе.');
   observeDialogue('#legends','Волк и Медведь знают о лагере всё. Давай вместе заглянем в их истории — там есть дружба, приключения и настоящие лагерные моменты.');
   observeDialogue('#schedule','А вот расписание смен! Выбирай дату, тему и формат лагеря — впереди целая смена приключений.');
   observeDialogue('#about','А здесь можно узнать, какой «Горизонт» внутри: лес, игры, костры, сцена и много новых друзей. Загляни — я всё покажу!');
   observeDialogue('#album','И, конечно, фотоальбом! Здесь живут самые яркие моменты лагеря. Можно листать и вспоминать приключения снова и снова.');
   window.addEventListener('scroll',()=>{const y=window.scrollY;if(Math.abs(y-lastY)>90){host.classList.remove('big');host.classList.add('walking');clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>host.classList.remove('walking'),900)}lastY=y},{passive:true});
 } else if(activePage==='backpack.html'){
   setMascot('bear');setTimeout(()=>{host.classList.add('waving');speak('Привет, сборщик приключений! Проверим рюкзак вместе: полезное берём, лишнее оставляем дома — и я объясню почему.')},650);
   const game=document.getElementById('game');if(game){game.addEventListener('click',e=>{const item=e.target.closest('.item');if(!item)return;const label=item.textContent.trim();setTimeout(()=>{const say=document.getElementById('sayTx');if(say&&say.textContent){speak(say.textContent)}} ,80)});}
   const win=document.getElementById('win');if(win){new MutationObserver(()=>{if(!win.hidden){
          host.classList.add('big','waving');
          speak('Ура! Рюкзак собран! Ты готов к приключениям в «Горизонте» — отличная работа!');
          setTimeout(()=>host.classList.remove('big','waving'),3000);
        }}).observe(win,{attributes:true,attributeFilter:['hidden']})}
 } else if(activePage==='stories.html'){
   const duo=document.createElement('div');
   duo.className='mascot-duo-wolf'; duo.setAttribute('aria-label','Волк — помощник сайта');
   duo.innerHTML='<div class="duo-sprite" aria-hidden="true"></div><div class="duo-bubble" role="status" aria-live="polite"><strong>Волк</strong><span class="duo-text"></span></div>';
   document.body.appendChild(duo);
   const wolfBubble=duo.querySelector('.duo-bubble'),wolfText=duo.querySelector('.duo-text');let wolfTimer;
   otherBubble=wolfBubble;
   function wolfSpeak(msg){bubble.classList.remove('show');wolfText.textContent=msg;wolfBubble.classList.add('show');clearTimeout(wolfTimer);wolfTimer=setTimeout(()=>wolfBubble.classList.remove('show'),bubbleDuration(msg))}
   setTimeout(()=>{
     setMascot('bear'); host.classList.add('walking'); duo.classList.add('show','walking');
     setTimeout(()=>duo.classList.remove('walking'),900);
     setTimeout(()=>{
       host.classList.remove('walking');
       const m1='Волк, привет! Ну что, расскажем ребятам наши истории?';
       speak(m1);
       setTimeout(()=>wolfSpeak('Привет, Медведь! Конечно! Устраивайтесь поудобнее — я начну с самых необычных историй, а ты мне поможешь.'),bubbleDuration(m1)+400);
       setTimeout(()=>speak('Договорились! Будем вспоминать дружбу, приключения и маленькие победы вместе.'),bubbleDuration(m1)+bubbleDuration('Привет, Медведь! Конечно! Устраивайтесь поудобнее — я начну с самых необычных историй, а ты мне поможешь.')+800);
     },850);
   },700);
 } else if(activePage==='guides.html'){
   setTimeout(()=>speak('Сейчас познакомлю тебя с командой! Выбирай вожатого и узнавай его суперсилу.'),800);
 } else if(activePage==='day.html'){
   setTimeout(()=>speak('Хочешь узнать, как проходит день в лагере? Пойдём по расписанию вместе!'),800);
 }
})();
