(function(){
 const MOODS={
  positive:{name:'Позитивный',line:'с хорошим настроением и верой в лучшее'},
  dreamy:{name:'Мечтательный',line:'с фантазией и любовью к красивым мелочам'},
  sociable:{name:'Общительный',line:'который легко находит общий язык с другими'},
  calm:{name:'Спокойный',line:'без спешки и с вниманием к деталям'},
  shy:{name:'Застенчивый',line:'немного робкий, но очень искренний'},
  cheerful:{name:'Весёлый',line:'с улыбкой и готовностью пошутить'},
  thoughtful:{name:'Задумчивый',line:'который любит всё хорошенько обдумать'},
  mischievous:{name:'Озорной',line:'с искоркой и любовью к добрым шалостям'},
  determined:{name:'Решительный',line:'который не боится пробовать новое'},
  curious:{name:'Любопытный',line:'которому всегда интересно узнать чуть больше'}
 };
 const MAIN={
  explorer:{intro:'Давай присмотримся внимательнее —',win:'Ты заметил то, что другие могли пропустить. Отличная работа!'},
  creator:{intro:'Здесь даже привычные вещи могут вдохновить —',win:'Вот это фантазия! Ты справился по-своему, и это здорово!'},
  energizer:{intro:'Вперёд, нас ждёт насыщенный день —',win:'Вот это скорость и энергия! Отлично справился!'},
  social:{intro:'Самое интересное ещё лучше вместе —',win:'Здорово получилось! Такие победы хочется разделить с друзьями!'},
  guardian:{intro:'Не забудь замечать важные мелочи вокруг —',win:'Ты отлично справился и проявил заботу и внимание!'},
  inventor:{intro:'Посмотрим, какие необычные идеи здесь пригодятся —',win:'Задача решена! Твоя смекалка не подвела!'}
 };
 function profile(){
  try{return JSON.parse(localStorage.getItem('gorizont-participant')||'null')}catch(_){return null}
 }
 function get(){
  const p=profile(),cfg=p&&p.avatar_config||{},v=cfg.personality||{};
  return {primary:v.primary||null,secondary:v.secondary||null};
 }
 function intro(){
  const v=get(),main=MAIN[v.primary]||{intro:'Заглянем сюда поближе —',win:'Отличная работа! Ты справился!'},mood=MOODS[v.secondary];
  let line=main.intro;
  if(mood)line+=' Настроение героя — '+mood.name.toLowerCase()+'.';
  return line;
 }
 function instruction(){
  const v=get(),lines={explorer:'Приглядывайся к деталям — они подскажут верный путь.',creator:'Подключи воображение и попробуй свой подход.',energizer:'Готов? Тогда вперёд, не теряй темп!',social:'Давай справимся с этим приключением вместе!',guardian:'Будь внимателен и не забывай о мелочах.',inventor:'Проверь разные варианты — смекалка пригодится!'};
  const mood=MOODS[v.secondary];return (lines[v.primary]||'Готов? Тогда начинаем!')+(mood?' '+mood.line.charAt(0).toUpperCase()+mood.line.slice(1)+'.':'');
 }
 function win(){
  const v=get(),main=MAIN[v.primary]||{win:'Отличная работа! Ты справился!'},mood=MOODS[v.secondary];
  if(!mood)return main.win;
  const endings={
   positive:'И с таким настроем всё получилось ещё лучше!',
   dreamy:'Надеюсь, это приключение вдохновило тебя на новые мечты!',
   sociable:'Расскажи друзьям, как здорово ты справился!',
   calm:'Спокойствие и внимание помогли добиться результата.',
   shy:'Даже если ты немного стесняешься, твой результат заслуживает аплодисментов!',
   cheerful:'Вот это повод улыбнуться!',
   thoughtful:'А теперь можно спокойно обдумать, как здорово всё получилось.',
   mischievous:'Кажется, приключение удалось на славу!',
   determined:'Ты не сдавался — и это главное!',
   curious:'Интересно, какое приключение будет следующим?'
  };
  return main.win+' '+(endings[v.secondary]||'');
 }
 window.GorizontPersonalityText={get,intro,instruction,win,moods:MOODS};
})();