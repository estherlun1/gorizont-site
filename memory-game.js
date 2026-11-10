(() => {
"use strict";
const BANK = [
 {id:"backpack",q:"Какого цвета рюкзак?",a:["Жёлтый","Красный","Синий","Зелёный"],correct:0,why:"Слева на пледе стоит большой жёлтый рюкзак."},
 {id:"squirrel",q:"Какое животное сидит на пеньке?",a:["Заяц","Белка","Ёж","Лиса"],correct:1,why:"На пеньке справа сидит рыжая белка."},
 {id:"guitar",q:"На каком инструменте играет девочка?",a:["На скрипке","На флейте","На гитаре","На укулеле"],correct:2,why:"Девочка играет на акустической гитаре."},
 {id:"butterflies",q:"Сколько бабочек видно на картинке?",a:["Одну","Две","Три","Четыре"],correct:1,why:"На иллюстрации две бабочки: оранжевая и светлая."},
 {id:"thermos",q:"Какой рисунок изображён на термосе?",a:["Звезда","Горы","Сосна","Палатка"],correct:1,why:"На красном термосе белый знак с силуэтом гор."},
 {id:"books",q:"Сколько книг лежит на пледе?",a:["Одна","Две","Три","Четыре"],correct:1,why:"На пледе рядом с рюкзаком лежат две книги."},
 {id:"camera",q:"Что находится рядом с фотоаппаратом справа?",a:["Компас","Бинокль","Термос","Фонарик"],correct:1,why:"Справа от фотоаппарата лежит чёрный бинокль."},
 {id:"mug",q:"Какой рисунок на кружке возле девочки?",a:["Белка","Медведь","Лиса","Гора"],correct:2,why:"На кружке возле девочки изображена мордочка лисы."},
 {id:"blanket",q:"Какого цвета клетчатый плед?",a:["Сине-белый","Красно-белый","Зелёно-жёлтый","Оранжево-белый"],correct:1,why:"Плед красно-белый, в клетку."},
 {id:"sign",q:"Что написано на деревянной табличке?",a:["Лесная поляна","Лагерь друзей","Горизонт","Летний маршрут"],correct:2,why:"На табличке на дереве написано «Горизонт»."}
];
const LEVELS = {
 easy:{label:"Лёгкий",seconds:60,count:5,ids:["backpack","squirrel","guitar","sign","thermos"]},
 medium:{label:"Средний",seconds:45,count:8,ids:["backpack","squirrel","guitar","butterflies","thermos","books","camera","mug"]},
 hard:{label:"Сложный",seconds:30,count:10,ids:BANK.map(x=>x.id)}
};
const $=id=>document.getElementById(id);
const screens=["startScreen","memoryScreen","quizScreen","resultScreen"];
let levelKey="medium",questions=[],index=0,score=0,selected=null,timerId=null,remaining=0,locked=false;
function show(id){screens.forEach(x=>$(x).classList.toggle("hidden",x!==id));window.scrollTo({top:0,behavior:"smooth"});}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function formatTime(s){return `00:${String(s).padStart(2,"0")}`;}
function start(level){
 levelKey=level;const cfg=LEVELS[level];questions=shuffle(cfg.ids.map(id=>BANK.find(q=>q.id===id)));index=0;score=0;selected=null;locked=false;remaining=cfg.seconds;
 $("memoryTimer").textContent=formatTime(remaining);$("memoryTimer").classList.remove("warning");show("memoryScreen");
 clearInterval(timerId);
 timerId=setInterval(()=>{remaining--; $("memoryTimer").textContent=formatTime(remaining);if(remaining<=10)$("memoryTimer").classList.add("warning");if(remaining<=0){clearInterval(timerId);beginQuiz();}},1000);
}
function beginQuiz(){clearInterval(timerId);show("quizScreen");renderQuestion();}
function renderQuestion(){
 selected=null;locked=false;const q=questions[index],total=questions.length;
 $("questionCount").textContent=`Вопрос ${index+1} из ${total}`;$("scoreCount").textContent=`Верно: ${score}`;
 $("progressBar").style.width=`${index/total*100}%`;$("questionText").textContent=q.q;$("feedback").textContent="";$("nextButton").classList.add("hidden");
 const answers=$("answers");answers.replaceChildren();
 // Shuffle answer options while retaining the correct answer.
 const opts=shuffle(q.a.map((label,i)=>({label,correct:i===q.correct})));
 opts.forEach(opt=>{const btn=document.createElement("button");btn.type="button";btn.className="answer";btn.textContent=opt.label;btn.addEventListener("click",()=>choose(btn,opt,q));answers.appendChild(btn);});
}
function choose(btn,opt,q){
 if(locked)return;locked=true;selected=opt;const buttons=[...$("answers").querySelectorAll("button")];
 buttons.forEach(b=>{b.disabled=true;if(b.textContent===q.a[q.correct])b.classList.add("correct");});
 if(opt.correct){score++;$("feedback").textContent="Верно! Отличная память! ⭐";}
 else{btn.classList.add("wrong");$("feedback").textContent=`Почти! Правильный ответ: ${q.a[q.correct]}.`;}
 $("scoreCount").textContent=`Верно: ${score}`;$("nextButton").textContent=index===questions.length-1?"Результат →":"Дальше →";$("nextButton").classList.remove("hidden");
}
function finish(){
 show("resultScreen");const total=questions.length,percent=score/total;
 $("resultTitle").textContent=percent===1?"Безупречная память!":percent>=.7?"Отличная память!":percent>=.4?"Хорошая попытка!":"Попробуй ещё раз!";
 $("resultSubtitle").textContent=`Уровень: ${LEVELS[levelKey].label}. Ты ответил правильно на ${score} из ${total} вопросов.`;
 $("resultScore").textContent=`${score} / ${total}`;
 const list=$("reviewList");list.replaceChildren();
 questions.forEach((q,i)=>{const item=document.createElement("div");item.className="review-item";const title=document.createElement("b");title.textContent=`${i+1}. ${q.q}`;const answer=document.createElement("div");answer.textContent=`Правильный ответ: ${q.a[q.correct]}. ${q.why}`;item.append(title,answer);list.appendChild(item);});
}
document.querySelectorAll("[data-level]").forEach(btn=>btn.addEventListener("click",()=>start(btn.dataset.level)));
$("nextButton").addEventListener("click",()=>{index++;if(index>=questions.length)finish();else renderQuestion();});
$("replayButton").addEventListener("click",()=>show("startScreen"));
})();
