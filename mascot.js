(function(){
 const host=document.createElement('div');host.className='mascot-host bear';host.setAttribute('aria-label','Медведь — помощник сайта');host.innerHTML='<div class="mascot-sprite" aria-hidden="true"></div><div class="mascot-bubble" role="status" aria-live="polite"><button type="button" aria-label="Скрыть подсказку">×</button><strong>Медведь</strong><span class="bubble-text"></span></div>';document.body.appendChild(host);
 const bubble=host.querySelector('.mascot-bubble'), text=host.querySelector('.bubble-text'), sprite=host.querySelector('.mascot-sprite');let hideTimer, lastY=window.scrollY, scrollTimer, activePage=location.pathname.split('/').pop()||'index.html', introDone=false, currentMap='st', otherBubble=null;
 let heroPersonality=null;
 const personalityLines={
  explorer:{welcome:'Привет, исследователь! Кажется, сегодня вокруг спрятано немало интересного. Держи глаза открытыми!',play:'Давай проверим твою наблюдательность! В каждой игре можно найти что-нибудь неожиданное.',map:'Карта — настоящая сокровищница открытий. Интересно, что ты заметишь первым?',guides:'У каждого вожатого своя история. Давай познакомимся и узнаем все подробности!',legends:'В этих историях спрятано столько интересных деталей. Давай разгадаем их вместе!',schedule:'Посмотрим, какие приключения приготовила смена? Вдруг среди них есть настоящее открытие!',about:'Давай заглянем за кулисы Горизонта и исследуем, как всё устроено!',album:'В фотоальбоме можно найти целую коллекцию маленьких открытий!'},
  creator:{welcome:'Привет, творец! Сегодня отличный день, чтобы придумать что-нибудь необычное.',play:'Готов придумать свой способ пройти испытание? В играх всегда есть место фантазии!',map:'Представь, сколько историй можно придумать для этих мест. С чего начнём?',guides:'Давай познакомимся с вожатыми — у каждого наверняка есть своя творческая суперсила!',legends:'Устраивайся поудобнее. Хорошая история всегда начинается с воображения!',schedule:'Посмотрим, какие творческие события ждут тебя в этой смене!',about:'Здесь столько всего, что может вдохновить на новые идеи!',album:'Каждая фотография — как маленькая история. Может, придумаем ей название?'},
  energizer:{welcome:'Привет! Ну что, готов к новым приключениям? У нас сегодня много интересного!',play:'Вперёд! Выбирай игру и покажи, на что способен. Главное — получать удовольствие!',map:'Вперёд изучать лагерь! Посмотрим, куда приведёт нас любопытство.',guides:'Пойдём знакомиться с командой! У каждого вожатого припасено что-то интересное.',legends:'Ух, вот это истории! Давай скорее узнаем, что было дальше!',schedule:'Скорее посмотрим расписание — вдруг там уже ждёт что-то захватывающее!',about:'В Горизонте столько всего происходит. Давай всё посмотрим!',album:'Сколько событий! Кажется, тут можно снова пережить целую смену.'},
  social:{welcome:'Привет! Как здорово, что ты заглянул. Приключения веселее, когда мы вместе!',play:'Выбирай игру! А потом можно позвать друга и поделиться впечатлениями.',map:'Давай посмотрим, где собираются ребята и где можно провести время вместе.',guides:'Пойдём знакомиться с вожатыми! Они всегда рады новым друзьям.',legends:'У каждой хорошей истории есть место для друзей. Давай послушаем!',schedule:'Посмотрим, какие общие события и встречи ждут тебя в этой смене.',about:'Горизонт — это люди, дружба и общие воспоминания. Давай покажу!',album:'Вот это воспоминания! Самое интересное — переживать их вместе.'},
  guardian:{welcome:'Привет, хранитель! Хорошо, что ты здесь. Вместе сделаем этот день ещё лучше.',play:'Выбирай игру и не забывай: главное — играть честно и поддерживать друг друга.',map:'Давай посмотрим, где в лагере особенно уютно и какие места стоит беречь.',guides:'Наши вожатые всегда рядом. Пойдём узнаем, кто чем любит помогать ребятам.',legends:'В этих историях много доброты и заботы. Давай послушаем.',schedule:'Посмотрим, что полезного и интересного приготовила смена.',about:'Здесь живёт наш общий дом на лето. Давай покажу, как мы о нём заботимся.',album:'Такие тёплые моменты хочется беречь. Давай вспомним их!'},
  inventor:{welcome:'Привет, изобретатель! Я тут кое-что придумал. Поможешь проверить?',play:'Готов испытать смекалку? Попробуй разные решения — иногда самое интересное неочевидно.',map:'Карта — почти схема большого механизма. Давай разберёмся, как устроен лагерь!',guides:'Пойдём знакомиться с командой. У каждого наверняка есть полезный секрет!',legends:'Время разобраться, как всё начиналось. Люблю истории с неожиданными поворотами!',schedule:'Посмотрим расписание и выберем, где можно попробовать что-то новое.',about:'Давай разберёмся, как устроен Горизонт. У каждого места есть своя задача!',album:'Интересно, сколько историй можно собрать из этих кадров!'}
 };
 const secondaryFlavors={explorer:'И давай внимательно смотреть по сторонам.',creator:'Вдруг появится идея для чего-то нового?',energizer:'Только не будем долго сидеть на месте!',social:'А если что — позовём друзей.',guardian:'И будем внимательны друг к другу.',inventor:'А потом попробуем придумать свой вариант.'};
 function personalityMessage(context,fallback){
  const primary=heroPersonality?.primary,secondary=heroPersonality?.secondary;
  const base=personalityLines[primary]?.[context]||fallback;
  if(context==='welcome'&&secondary&&secondaryFlavors[secondary])return base+' '+secondaryFlavors[secondary];
  return base;
 }
 async function loadHeroPersonality(){
  try{
   const cached=JSON.parse(localStorage.getItem('gorizont-participant')||'null');
   const cp=cached?.avatar_config?.personality;
   if(cp?.primary)heroPersonality=cp;
   const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
   const client=createClient('https://jrvukdqqrmfjbtskrayy.supabase.co','sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'gorizont-auth-session'}});
   const {data:{session}}=await client.auth.getSession();
   if(!session?.user?.id)return;
   const {data}=await client.from('participants').select('avatar_config').eq('id',session.user.id).maybeSingle();
   if(data?.avatar_config?.personality?.primary){
    heroPersonality=data.avatar_config.personality;
    if(cached){cached.avatar_config=data.avatar_config;localStorage.setItem('gorizont-participant',JSON.stringify(cached))}
   }
  }catch(error){console.warn('Не удалось загрузить характер героя:',error)}
 }
 loadHeroPersonality();

 function bubbleDuration(msg){return Math.min(16000,Math.max(8500,msg.length*95))}
 function speak(msg,who,context){if(context)msg=personalityMessage(context,msg);if(otherBubble)otherBubble.classList.remove('show');host.classList.remove('big','walking','waving');if(who && who!== 'bear') setMascot(who);text.textContent=msg;bubble.querySelector('strong').textContent=host.classList.contains('wolf')?'Волк':'Медведь';bubble.classList.add('show');clearTimeout(hideTimer);hideTimer=setTimeout(()=>bubble.classList.remove('show'),bubbleDuration(msg))}
 function setMascot(who){host.classList.remove('bear','wolf','waving');host.classList.add(who==='wolf'?'wolf':'bear');host.setAttribute('aria-label',(who==='wolf'?'Волк':'Медведь')+' — помощник сайта')}
 function observeDialogue(selector,msg,opts,context){const el=document.querySelector(selector);if(!el)return;let inside=false;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!inside){inside=true;setTimeout(()=>{if(inside)speak(msg,undefined,context)},140)}else if(!e.isIntersecting){inside=false}}),Object.assign({threshold:.25},opts||{}));io.observe(el);return io}
 function bigHello(){host.classList.add('big','waving');bubble.classList.add('show');const msg=personalityMessage('welcome','Привет! Добро пожаловать в «Горизонт»! Листай дальше — впереди целый мир приключений!');text.textContent=msg;bubble.querySelector('strong').textContent='Медведь';clearTimeout(hideTimer);const dur=bubbleDuration(msg);hideTimer=setTimeout(()=>{host.classList.remove('big','waving');bubble.classList.remove('show');host.classList.add('walking')},dur);setTimeout(()=>host.classList.remove('walking'),dur+1400)}
 bubble.querySelector('button').addEventListener('click',()=>bubble.classList.remove('show'));
 function parentGate(){if(document.querySelector('.parent-modal'))return;const gate=document.createElement('section');gate.className='parent-gate';gate.id='parent-portal';gate.innerHTML='<h2>Эй, взрослые! Вам сюда?</h2><p>Тут заканчиваются приключения и начинаются документы, даты смен и серьёзные разговоры. Детям — дальше исследовать Горизонт, взрослым — отдельный портал.</p><button class="btn" type="button" id="parentOpen">Перейти на сайт для родителей ↗</button>';const footer=document.querySelector('footer');if(footer)footer.before(gate);const modal=document.createElement('div');modal.className='parent-modal';modal.hidden=true;modal.innerHTML='<div class="parent-dialog" role="dialog" aria-modal="true" aria-labelledby="parentTitle"><div class="parent-emoji">🧐</div><h2 id="parentTitle">Контроль взрослости</h2><p id="parentQuestion"></p><div class="parent-count" id="parentCount" hidden>10</div><div class="parent-actions"><button class="parent-confirm" id="parentYes">Подтвердить, я родитель</button><button class="parent-cancel" id="parentNo">Ой, я просто посмотреть</button></div><p class="fine">Не волнуйтесь: это шуточная проверка. Никаких данных вводить не нужно.</p></div>';document.body.appendChild(modal);
 const jokes=['Вы точно родитель? Вас не пугают слова «договор», «медсправка» и «оплата смены»?','Готовы обменять весёлые истории на документы, даты и списки вещей?','Последний шанс сбежать обратно к медведю. Всё ещё хотите к документам?','Вы готовы узнать стоимость смены и не спросить: «А скидка есть?»'];let joke=0;function openParentModal(){joke=Math.floor(Math.random()*jokes.length);modal.hidden=false;modal.querySelector('#parentQuestion').textContent=jokes[joke];modal.querySelector('#parentCount').hidden=true;modal.querySelector('#parentYes').hidden=false;modal.querySelector('#parentNo').textContent='Нет, верните меня к приключениям';modal.querySelector('#parentYes').textContent='Подтвердить, я родитель'};gate.querySelector('#parentOpen').onclick=openParentModal;document.querySelectorAll('.parent-shortcut').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openParentModal()}));modal.querySelector('#parentNo').onclick=()=>{modal.hidden=true;window.scrollTo({top:0,behavior:'smooth'});speak('Фух! Тогда оставайся, приключения ещё не закончились!')};modal.querySelector('#parentYes').onclick=()=>{const yes=modal.querySelector('#parentYes'),no=modal.querySelector('#parentNo'),count=modal.querySelector('#parentCount'),q=modal.querySelector('#parentQuestion');yes.hidden=true;no.hidden=true;count.hidden=false;q.textContent='Перепроверяем взрослость…';let n=10;count.textContent=n;const timer=setInterval(()=>{n--;count.textContent=n;if(n<=0){clearInterval(timer);q.textContent='Проверка пройдена. Взрослый портал открывается!';count.hidden=true;setTimeout(()=>window.location.href='https://klin-gorizont.ru/',650)}},1000)};modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});}
 parentGate();
 if(activePage==='index.html'){
   const hero=document.querySelector('.hero');if(hero){let heroInside=false;const heroIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!heroInside){heroInside=true;setTimeout(()=>{if(heroInside)bigHello()},120)}else if(!e.isIntersecting){heroInside=false}}),{threshold:.25});heroIO.observe(hero)}
   const play=document.getElementById('play');if(play){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){host.classList.add('walking');speak('Пс-с! Давай проверим, всё ли ты собрал в лагерь. Жми «Играть» — соберём рюкзак вместе!',undefined,'play');play.classList.add('mascot-highlight');setTimeout(()=>play.classList.remove('mascot-highlight'),3500)}}),{threshold:.35});io.observe(play)}
   const map=document.getElementById('map');if(map){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(currentMap==='st'){setMascot('bear');speak('Это карта стационарного лагеря! Здесь корпуса, столовая, поле и главные ворота. Нажимай на точки — покажу, что где.',undefined,'map')}else{speak('А здесь палаточный лагерь! Найдём палатки, костровую и места для игр. Я передам маршрут Волку!','wolf','map')}}}),{threshold:.25});io.observe(map)}
   document.querySelectorAll('[data-map]').forEach(btn=>btn.addEventListener('click',()=>{currentMap=btn.dataset.map;if(currentMap==='tent'){setMascot('bear');host.classList.add('walking');setTimeout(()=>{setMascot('wolf');speak('Моя очередь! Я покажу тебе палаточный лагерь и его секретные места.','wolf','map')},600)}else{setMascot('bear');speak('Снова я! Давай изучим стационарный лагерь.',undefined,'map')}}));
   observeDialogue('#guides','А вот и наши вожатые! У каждого своя суперсила. Загляни познакомиться поближе.',null,'guides');
   observeDialogue('#legends','Волк и Медведь знают о лагере всё. Давай вместе заглянем в их истории — там есть дружба, приключения и настоящие лагерные моменты.',null,'legends');
   observeDialogue('#schedule','А вот расписание смен! Выбирай дату, тему и формат лагеря — впереди целая смена приключений.',null,'schedule');
   observeDialogue('#about','А здесь можно узнать, какой «Горизонт» внутри: лес, игры, костры, сцена и много новых друзей. Загляни — я всё покажу!',null,'about');
   observeDialogue('#album','И, конечно, фотоальбом! Здесь живут самые яркие моменты лагеря. Можно листать и вспоминать приключения снова и снова.',null,'album');
   let scrollRaf=0;
   window.addEventListener('scroll',()=>{
     if(scrollRaf)return;
     scrollRaf=requestAnimationFrame(()=>{
       scrollRaf=0;
       const y=window.scrollY;
       if(Math.abs(y-lastY)>90){
         host.classList.remove('big');
         host.classList.add('walking');
         clearTimeout(scrollTimer);
         scrollTimer=setTimeout(()=>host.classList.remove('walking'),900);
       }
       lastY=y;
     });
   },{passive:true});
 } else if(activePage==='backpack.html'){
   setMascot('bear');setTimeout(()=>{host.classList.add('waving');speak('Привет, сборщик приключений! Проверим рюкзак вместе: полезное берём, лишнее оставляем дома — и я объясню почему.',undefined,'play')},650);
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
