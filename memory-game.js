(() => {
"use strict";
const SCENES = [
 {
  key:"picnic", title:"Лесной пикник", image:"assets/games/memory-picnic.webp",
  questions:[
   {q:"Какого цвета рюкзак?",a:["Жёлтый","Красный","Синий","Зелёный"],correct:0,why:"Слева на пледе стоит большой жёлтый рюкзак."},
   {q:"Какое животное сидит на пеньке?",a:["Заяц","Белка","Ёж","Лиса"],correct:1,why:"На пеньке справа сидит рыжая белка."},
   {q:"На каком инструменте играет девочка?",a:["На скрипке","На флейте","На гитаре","На укулеле"],correct:2,why:"Девочка играет на акустической гитаре."},
   {q:"Сколько бабочек видно на картинке?",a:["Одну","Две","Три","Четыре"],correct:1,why:"На иллюстрации две бабочки."},
   {q:"Какой рисунок изображён на термосе?",a:["Звезда","Горы","Сосна","Палатка"],correct:1,why:"На красном термосе белый знак с силуэтом гор."},
   {q:"Сколько книг лежит на пледе?",a:["Одна","Две","Три","Четыре"],correct:1,why:"На пледе рядом с рюкзаком лежат две книги."},
   {q:"Что находится рядом с фотоаппаратом справа?",a:["Компас","Бинокль","Термос","Фонарик"],correct:1,why:"Справа от фотоаппарата лежит чёрный бинокль."},
   {q:"Какой рисунок на кружке возле девочки?",a:["Белка","Медведь","Лиса","Гора"],correct:2,why:"На кружке возле девочки изображена мордочка лисы."},
   {q:"Какого цвета клетчатый плед?",a:["Сине-белый","Красно-белый","Зелёно-жёлтый","Оранжево-белый"],correct:1,why:"Плед красно-белый, в клетку."},
   {q:"Что написано на деревянной табличке?",a:["Лесная поляна","Лагерь друзей","Горизонт","Летний маршрут"],correct:2,why:"На табличке на дереве написано «Горизонт»."}
  ]
 },
 {
  key:"cabin", title:"Комната в лагере", image:"assets/games/memory-cabin.webp",
  questions:[
   {q:"Какой музыкальный инструмент стоит у левого края комнаты?",a:["Скрипка","Гитара","Барабан","Флейта"],correct:1,why:"У левого края комнаты стоит акустическая гитара."},
   {q:"Какая игрушка сидит на верхней кровати слева?",a:["Медвежонок","Заяц","Лисёнок","Белка"],correct:2,why:"На верхней левой кровати сидит плюшевая игрушка-лисёнок."},
   {q:"Кто спит на ковре между ребятами и фотоаппаратом?",a:["Щенок","Кот","Ёж","Белка"],correct:1,why:"На ковре свернулся клубочком спящий кот."},
   {q:"Какого цвета большой рюкзак справа?",a:["Синий","Красный","Жёлтый","Зелёный"],correct:2,why:"Справа у кровати стоит большой жёлтый рюкзак."},
   {q:"Какая головоломка лежит рядом с книгами?",a:["Пазл","Кубик Рубика","Домино","Шахматы"],correct:1,why:"На ковре рядом со стопкой книг лежит цветной кубик Рубика."},
   {q:"Что лежит на ковре рядом с фотоаппаратом?",a:["Компас","Фонарик","Бинокль","Ключи"],correct:2,why:"Справа от фотоаппарата лежит бинокль."},
   {q:"Что держит мальчик в руках?",a:["Карту","Открытую книгу","Фотоальбом","Блокнот"],correct:1,why:"Мальчик держит раскрытую книгу."},
   {q:"Что стоит на подоконнике слева?",a:["Ваза","Фонарик","Керосиновая лампа","Чайник"],correct:2,why:"На подоконнике слева горит керосиновая лампа."},
   {q:"Какие украшения развешаны под потолком?",a:["Бумажные фонарики","Звёздочки-гирлянды","Флажки с цифрами","Колокольчики"],correct:1,why:"Под потолком протянута гирлянда из светящихся звёздочек."},
   {q:"Что развешано на верёвочке перед окном?",a:["Открытки и фотографии","Носовые платки","Карты сокровищ","Листья"],correct:0,why:"На верёвочке перед окном закреплены фотографии и открытки."}
  ]
 },
 {
  key:"campfire", title:"Вечер у костра", image:"assets/games/memory-campfire.webp",
  questions:[
   {q:"Какая птица сидит на ветке над указателями?",a:["Сова","Ворона","Сорока","Дятел"],correct:0,why:"На ветке сверху сидит маленькая сова."},
   {q:"Сколько детей собрались у костра?",a:["Двое","Трое","Четверо","Пятеро"],correct:2,why:"Вокруг костра находятся четверо детей."},
   {q:"Что делает девочка с рыжими косами?",a:["Играет на гитаре","Помешивает котелок","Рисует карту","Жарит хлеб"],correct:1,why:"Девочка с рыжими косами помешивает еду в котелке над костром."},
   {q:"Что мальчик в оранжевой кофте держит над огнём?",a:["Сосиску","Маршмеллоу на палочке","Кружку","Фонарик"],correct:1,why:"Он жарит маршмеллоу на длинной палочке."},
   {q:"Какого цвета большой рюкзак у палатки слева?",a:["Синий","Жёлтый","Красный","Зелёный"],correct:1,why:"У палатки слева стоит большой жёлтый рюкзак."},
   {q:"Какое животное лежит рядом с костром в красной бандане?",a:["Лиса","Собака","Кот","Енот"],correct:1,why:"Рядом с костром лежит золотистая собака в красной бандане."},
   {q:"Кто свернулся клубочком на клетчатом пледе справа?",a:["Щенок","Белка","Кот","Заяц"],correct:2,why:"На пледе справа спит полосатый кот."},
   {q:"Что изображено на зелёной фляге рядом с аптечкой?",a:["Звезда","Горы","Ёлка","Рыба"],correct:1,why:"На зелёной фляге нарисован белый силуэт гор."},
   {q:"Какого цвета аптечка?",a:["Синяя","Зелёная","Красная","Жёлтая"],correct:2,why:"Аптечка рядом с флягой красная, с белым крестом."},
   {q:"Что лежит на деревянном ящике за флягой?",a:["Бинокль","Книга","Компас","Фонарик"],correct:0,why:"На ящике лежит чёрный бинокль."},
   {q:"Что девочка справа держит на коленях?",a:["Гитару","Блокнот для рисования","Поднос","Карту"],correct:1,why:"Девочка справа рисует в блокноте."},
   {q:"Что висит на ветке рядом с совой?",a:["Колокольчик","Ловец снов","Фонарик","Компас"],correct:1,why:"Рядом с совой на ветке висит ловец снов."},
   {q:"Какой предмет стоит на пне слева и светится?",a:["Свеча","Керосиновая лампа","Факел","Кружка"],correct:1,why:"На пне слева стоит зажжённая керосиновая лампа."},
   {q:"Что изображено на белой кружке у мальчика в зелёной кофте?",a:["Две ёлки","Медведь","Костёр","Горы"],correct:0,why:"На кружке нарисованы две зелёные ёлочки."},
   {q:"Какой предмет лежит перед фотоаппаратом ближе к нижнему краю картинки?",a:["Компас","Ложка","Ключ","Свисток"],correct:0,why:"Перед фотоаппаратом на земле лежит круглый компас."},
   {q:"Что находится рядом с компасом слева?",a:["Миска с ягодами","Кружка","Фонарик","Ботинок"],correct:0,why:"Рядом с компасом стоит миска с тёмными ягодами."},
   {q:"Какие фрукты лежат в миске внизу по центру?",a:["Груши и бананы","Яблоки и апельсины","Сливы и персики","Виноград и киви"],correct:1,why:"В миске внизу видны красные яблоки и оранжевые фрукты."},
   {q:"Что стоит на тарелке возле костра?",a:["Печенье","Бутерброды","Пирожки","Ягоды"],correct:0,why:"На тарелке возле костра лежит круглое печенье."},
   {q:"Что нарисовано на деревянных указателях справа?",a:["Только названия отрядов","Горы, палатка, волны и велосипед","Животные и птицы","Цифры и буквы"],correct:1,why:"На указателях изображены горы, палатка, волны и велосипед."},
   {q:"Что плавает у деревянного причала на озере?",a:["Парусник","Красная лодка","Каяк","Плот"],correct:1,why:"У причала на озере видна небольшая красная лодка."},
   {q:"Что висит между палаткой и деревьями над детьми?",a:["Гирлянда из лампочек и флажки","Верёвка с бельём","Сеть","Большой фонарь"],correct:0,why:"Над лагерем протянуты светящиеся лампочки и разноцветные флажки."},
   {q:"Что лежит рядом с картой внизу справа?",a:["Шишки","Ракушки","Мяч","Перчатки"],correct:0,why:"Рядом с картой лежат несколько сосновых шишек."},
   {q:"Какого цвета палатка слева?",a:["Синяя","Бежевая","Красная","Зелёная"],correct:1,why:"Большая палатка слева светло-бежевая."},
   {q:"Что находится на пне рядом с собакой?",a:["Кружка с рисунком костра","Книга","Фляга","Фонарик"],correct:0,why:"На пне рядом с собакой стоит белая кружка с изображением костра."},
   {q:"Сколько указателей видно на деревянном столбе справа?",a:["Три","Четыре","Пять","Шесть"],correct:1,why:"На столбе справа закреплены четыре деревянные стрелки."}
  ]
 }
];
const LEVELS = {
 easy:{label:"Лёгкий",seconds:60,count:5},
 medium:{label:"Средний",seconds:45,count:8},
 hard:{label:"Сложный",seconds:30,count:10}
};
const $=id=>document.getElementById(id);
const screens=["startScreen","memoryScreen","quizScreen","resultScreen"];
let levelKey="medium",scene=null,questions=[],index=0,score=0,timerId=null,remaining=0,locked=false,lastSceneKey=null;
function show(id){screens.forEach(x=>$(x).classList.toggle("hidden",x!==id));window.scrollTo({top:0,behavior:"smooth"});}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function formatTime(s){return `00:${String(s).padStart(2,"0")}`;}
function chooseScene(){
 const options=SCENES.filter(x=>x.key!==lastSceneKey);
 scene=options[Math.floor(Math.random()*options.length)]||SCENES[0];
 lastSceneKey=scene.key;
 $("memoryScreen").querySelector(".art").src=scene.image;
}
function start(level){
 levelKey=level;const cfg=LEVELS[level];chooseScene();
 questions=shuffle(scene.questions).slice(0,cfg.count);index=0;score=0;locked=false;remaining=cfg.seconds;
 $("memoryTimer").textContent=formatTime(remaining);$("memoryTimer").classList.remove("warning");show("memoryScreen");
 clearInterval(timerId);
 timerId=setInterval(()=>{remaining--; $("memoryTimer").textContent=formatTime(remaining);if(remaining<=10)$("memoryTimer").classList.add("warning");if(remaining<=0){clearInterval(timerId);beginQuiz();}},1000);
}
function beginQuiz(){clearInterval(timerId);show("quizScreen");renderQuestion();}
function renderQuestion(){
 locked=false;const q=questions[index],total=questions.length;
 $("questionCount").textContent=`Вопрос ${index+1} из ${total}`;$("scoreCount").textContent=`Верно: ${score}`;
 $("progressBar").style.width=`${index/total*100}%`;$("questionText").textContent=q.q;$("feedback").textContent="";$("nextButton").classList.add("hidden");
 const answers=$("answers");answers.replaceChildren();
 const opts=shuffle(q.a.map((label,i)=>({label,correct:i===q.correct})));
 opts.forEach(opt=>{const btn=document.createElement("button");btn.type="button";btn.className="answer";btn.textContent=opt.label;btn.addEventListener("click",()=>choose(btn,opt,q));answers.appendChild(btn);});
}
function choose(btn,opt,q){
 if(locked)return;locked=true;const buttons=[...$("answers").querySelectorAll("button")];
 buttons.forEach(b=>{b.disabled=true;if(b.textContent===q.a[q.correct])b.classList.add("correct");});
 if(opt.correct){score++;$("feedback").textContent="Верно! Отличная память! ⭐";}
 else{btn.classList.add("wrong");$("feedback").textContent=`Почти! Правильный ответ: ${q.a[q.correct]}.`;}
 $("scoreCount").textContent=`Верно: ${score}`;$("nextButton").textContent=index===questions.length-1?"Результат →":"Дальше →";$("nextButton").classList.remove("hidden");
}
function finish(){
 show("resultScreen");const total=questions.length,percent=score/total;
 $("resultTitle").textContent=percent===1?"Безупречная память!":percent>=.7?"Отличная память!":percent>=.4?"Хорошая попытка!":"Попробуй ещё раз!";
 $("resultSubtitle").textContent=`Сюжет: ${scene.title}. Уровень: ${LEVELS[levelKey].label}. Ты ответил правильно на ${score} из ${total} вопросов.`;
 $("resultScore").textContent=`${score} / ${total}`;
 const list=$("reviewList");list.replaceChildren();
 questions.forEach((q,i)=>{const item=document.createElement("div");item.className="review-item";const title=document.createElement("b");title.textContent=`${i+1}. ${q.q}`;const answer=document.createElement("div");answer.textContent=`Правильный ответ: ${q.a[q.correct]}. ${q.why}`;item.append(title,answer);list.appendChild(item);});
}
document.querySelectorAll("[data-level]").forEach(btn=>btn.addEventListener("click",()=>start(btn.dataset.level)));
$("nextButton").addEventListener("click",()=>{index++;if(index>=questions.length)finish();else renderQuestion();});
$("replayButton").addEventListener("click",()=>show("startScreen"));
})();