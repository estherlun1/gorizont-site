import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

(() => {
  const SUPABASE_URL = "https://jrvukdqqrmfjbtskrayy.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "gorizont-auth-session" },
  });

  const modal = document.getElementById("campAuthModal");
  if (!modal) return;
  const openers = [document.getElementById("campAuthOpen"), ...document.querySelectorAll("[data-open-auth]")].filter(Boolean);
  const mainOpener = document.getElementById("campAuthOpen");
  const closeButton = document.getElementById("campAuthClose");
  const registerTab = document.getElementById("authRegisterTab");
  const loginTab = document.getElementById("authLoginTab");
  const registerForm = document.getElementById("authRegisterForm");
  const loginForm = document.getElementById("authLoginForm");
  const tabs = modal.querySelector(".auth-tabs");
  const intro = modal.querySelector(".auth-intro");
  const title = document.getElementById("authTitle");
  const profile = document.getElementById("authProfile");
  const profileName = document.getElementById("authProfileName");
  const profileNick = document.getElementById("authProfileNick");
  const profileAvatar = document.getElementById("authProfileAvatar");
  const heroCard = document.getElementById("authHeroCard");
  const heroPrimary = document.getElementById("authHeroPrimary");
  const heroSecondary = document.getElementById("authHeroSecondary");
  const heroNextChange = document.getElementById("authHeroNextChange");
  const logoutButton = document.getElementById("authLogout");
  const menuAccountTab = document.getElementById("menuAccountTab");
  const menuAccount = document.getElementById("menuAccount");
  const menuAccountGreeting = document.getElementById("menuAccountGreeting");
  const pointsValue = profile?.querySelector(".auth-points-preview small");
  const pointsHistory = document.getElementById("authPointsHistory");
  const status = document.getElementById("authStatus");
  let previousFocus = null;
  let savedScrollY = 0;
  let bodyLockStyles = null;
  let busy = false;
  let participant = null;

  function setProfileTab(name) {
    const allowed = ["achievements", "friends", "balance"];
    const active = allowed.includes(name) ? name : "balance";
    if (profile) profile.dataset.activeTab = active;
    profile?.querySelectorAll("[data-profile-tab]").forEach(button => {
      const selected = button.dataset.profileTab === active;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    profile?.querySelectorAll("[data-profile-panel]").forEach(panel => {
      panel.hidden = panel.dataset.profilePanel !== active;
    });
  }
  profile?.addEventListener("click", event => {
    const button = event.target.closest("[data-profile-tab]");
    if (button) setProfileTab(button.dataset.profileTab);
  });

  function setStatus(message, error = false) {
    status.textContent = message;
    status.style.color = error ? "#a33d2b" : "#47734f";
  }
  function setBusy(value) {
    busy = value;
    [registerForm, loginForm].forEach(form => {
      const button = form.querySelector('button[type="submit"]');
      button.disabled = value;
      button.style.opacity = value ? ".65" : "";
      button.style.cursor = value ? "wait" : "";
    });
  }
  let passwordChangePanel = null;
  function showPasswordChange(username, temporaryPassword) {
    if (passwordChangePanel) passwordChangePanel.remove();
    passwordChangePanel = document.createElement("form");
    passwordChangePanel.className = "auth-form";
    passwordChangePanel.innerHTML = `
      <p style="line-height:1.5;margin:0 0 14px">Это временный пароль. Придумай новый пароль, чтобы продолжить.</p>
      <label style="display:block;margin:12px 0 6px">Новый пароль</label>
      <input name="new_password" type="password" minlength="10" maxlength="72" autocomplete="new-password" required style="width:100%;padding:13px;border:1px solid #d9ded7;border-radius:12px">
      <label style="display:block;margin:12px 0 6px">Повтори новый пароль</label>
      <input name="confirm_password" type="password" minlength="10" maxlength="72" autocomplete="new-password" required style="width:100%;padding:13px;border:1px solid #d9ded7;border-radius:12px">
      <button type="submit" style="width:100%;margin-top:16px;padding:14px;border:0;border-radius:999px;background:#f36f3d;color:white;font-weight:700;cursor:pointer">Сохранить новый пароль</button>
    `;
    loginForm.parentElement.insertBefore(passwordChangePanel, loginForm);
    registerForm.hidden = true;
    loginForm.hidden = true;
    if (tabs) tabs.hidden = true;
    if (title) title.textContent = "Придумай новый пароль";
    if (intro) intro.textContent = "Это нужно сделать один раз для защиты аккаунта.";
    setStatus("Временный пароль принят. Остался последний шаг.");
    passwordChangePanel.querySelector('input[name="new_password"]').focus();
    passwordChangePanel.addEventListener("submit", async event => {
      event.preventDefault();
      if (busy || !passwordChangePanel.reportValidity()) return;
      const form = new FormData(passwordChangePanel);
      const next = String(form.get("new_password") || "");
      const confirm = String(form.get("confirm_password") || "");
      if (next.length < 10 || next.length > 72) return setStatus("Новый пароль должен содержать от 10 до 72 символов.", true);
      if (next !== confirm) return setStatus("Пароли не совпадают.", true);
      const button = passwordChangePanel.querySelector('button[type="submit"]');
      busy = true; button.disabled = true; button.textContent = "Сохраняем...";
      setStatus("Меняем пароль...");
      try {
        const result = await callFunction("change-participant-password", {
          username, temporary_password: temporaryPassword, new_password: next
        });
        passwordChangePanel.remove(); passwordChangePanel = null;
        if (result.session) {
          await acceptSession(result);
        } else {
          if (tabs) tabs.hidden = false;
          tab("login");
          setStatus(result.message || "Пароль изменён. Теперь войди с новым паролем.");
        }
      } catch (error) {
        button.disabled = false; button.textContent = "Сохранить новый пароль";
        setStatus(error.message || "Не удалось изменить пароль.", true);
      } finally { busy = false; }
    });
  }

  function renderPointsHistory(rows) {
    if (!pointsHistory) return;
    pointsHistory.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "auth-history-empty";
      empty.textContent = "Пока операций нет. Играй и собирай свои первые горизонтики!";
      pointsHistory.appendChild(empty);
      return;
    }
    const titles = {
      game_reward: "Награда за игру",
      achievement: "Достижение",
      manual_reward: "Награда от вожатого",
      purchase: "Покупка в магазине",
      adjustment: "Корректировка баланса"
    };
    const list = document.createElement("div");
    list.className = "auth-history-list";
    rows.forEach(row => {
      const item = document.createElement("div");
      item.className = "auth-history-row";
      const info = document.createElement("div");
      info.className = "auth-history-info";
      const title = document.createElement("div");
      title.className = "auth-history-title";
      const rawDescription = String(row.description || "");
      const gameNames = {
        memory_easy: "Запомни картинку",
        memory_medium: "Запомни картинку",
        memory_hard: "Запомни картинку",
        map_hunt: "Найди на карте",
        backpack: "Собери рюкзак",
        character_builder: "Собери персонажа",
        maze: "Лабиринт",
        find_difference_1: "Найди отличия",
        find_difference_2: "Найди отличия",
        find_difference_3: "Найди отличия",
        find_difference_4: "Найди отличия"
      };
      const match = rawDescription.match(/(?:Ежедневная награда:\s*|Награда за игру\s*:?)?([a-z_]+)$/i);
      const friendlyGame = match ? gameNames[match[1]] : null;
      const isTechnicalDailyReward = /^Ежедневная награда:/i.test(rawDescription);
      title.textContent = friendlyGame
        ? `Награда за игру «${friendlyGame}»`
        : (isTechnicalDailyReward ? "Награда за игру" : (rawDescription || titles[row.transaction_type] || "Операция с горизонтиками"));
      const dateLabel = document.createElement("div");
      dateLabel.className = "auth-history-date";
      const date = new Date(row.created_at);
      dateLabel.textContent = Number.isNaN(date.getTime()) ? "" :
        date.toLocaleString("ru-RU", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
      const amount = document.createElement("div");
      const value = Number(row.amount || 0);
      amount.className = "auth-history-amount" + (value < 0 ? " negative" : "");
      amount.textContent = `${value > 0 ? "+" : ""}${value} ${currencyWord(value)} ⭐`;
      info.append(title, dateLabel);
      item.append(info, amount);
      list.appendChild(item);
    });
    pointsHistory.appendChild(list);
  }

  function currencyWord(value) {
    const n = Math.abs(Number(value)) % 100;
    const last = n % 10;
    if (n > 10 && n < 20) return "горизонтиков";
    if (last > 1 && last < 5) return "горизонтика";
    if (last === 1) return "горизонтик";
    return "горизонтиков";
  }

  async function refreshPoints() {
    if (!participant || !pointsValue) return;
    pointsValue.textContent = "Загружаем баланс...";
    if (pointsHistory) pointsHistory.textContent = "Загружаем историю...";
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      pointsValue.textContent = "Войди в аккаунт, чтобы увидеть горизонтики";
      if (pointsHistory) pointsHistory.textContent = "История доступна после входа в аккаунт.";
      return;
    }
    const { data: rows, error } = await supabase
      .from("point_transactions")
      .select("amount, transaction_type, description, created_at")
      .eq("participant_id", participant.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error("Не удалось загрузить историю горизонтиков:", error);
      pointsValue.textContent = "Не удалось загрузить баланс горизонтиков";
      if (pointsHistory) pointsHistory.textContent = "Не удалось загрузить историю операций.";
      return;
    }
    const { data: allRows, error: balanceError } = await supabase
      .from("point_transactions")
      .select("amount")
      .eq("participant_id", participant.id);
    if (balanceError) {
      console.error("Не удалось рассчитать баланс горизонтиков:", balanceError);
      pointsValue.textContent = "Не удалось загрузить баланс горизонтиков";
    } else {
      const total = (allRows || []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
      pointsValue.textContent = `${total} ${currencyWord(total)} на твоём счету`;
    }
    renderPointsHistory(rows || []);
  }

  // Обновляем баланс после начисления награды в любой игре.
  window.addEventListener("gorizont:points-updated", () => {
    refreshPoints();
  });

  let socialPanelInitialized = false;
  async function socialRequest(payload) {
    const {data:{session}} = await supabase.auth.getSession();
    if(!session?.access_token) throw new Error("Войди в аккаунт.");
    const response=await fetch(SUPABASE_URL+"/functions/v1/gorizont-social-achievements",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_PUBLISHABLE_KEY,"Authorization":"Bearer "+session.access_token},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||"Не удалось выполнить действие.");
    return result;
  }
  function addFriendRow(container, person, action) {
    const row=document.createElement("div"); row.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid #e1e8dc";
    const name=document.createElement("span"); name.textContent=person.nickname||person.full_name||"Участник";
    const button=document.createElement("button"); button.type="button"; button.textContent=action.label; button.style.cssText="border:0;border-radius:10px;padding:8px 10px;background:#315846;color:#fff;font-weight:700;cursor:pointer";
    button.addEventListener("click",async()=>{button.disabled=true;try{await action.run();button.textContent=action.done||"Готово";}catch(e){button.disabled=false;setStatus(e.message,true);}});
    row.append(name,button);container.appendChild(row);
  }
  function renderFriendProfile(out,data){
    out.replaceChildren();
    const person=data.person||{},config=person.avatar_config||{},traits=config.personality||{};
    const names={mila:"Мила",misha:"Миша",rosa:"Роза",petya:"Петя"};
    const personalityNames={explorer:"Исследователь",creator:"Творец",energizer:"Энерджайзер",social:"Душа компании",guardian:"Хранитель",inventor:"Изобретатель",positive:"Позитивный",dreamy:"Мечтательный",sociable:"Общительный",calm:"Спокойный",shy:"Застенчивый",cheerful:"Весёлый",thoughtful:"Задумчивый",mischievous:"Озорной",determined:"Решительный",curious:"Любопытный"};
    const card=document.createElement("section");card.className="gorizont-friend-profile";
    card.style.cssText="margin:18px 0 6px;padding:16px;border:1px solid #d7dfd2;border-radius:18px;background:linear-gradient(145deg,#fffdf5,#f2f6e9);box-shadow:0 5px 18px #304b3514";
    const top=document.createElement("div");top.style.cssText="display:flex;align-items:center;gap:13px;flex-wrap:wrap";
    const avatar=document.createElement("div");avatar.style.cssText="width:88px;height:88px;flex:0 0 88px;border-radius:22px;overflow:hidden;background:#e8efd9;display:grid;place-items:center;font-size:42px;border:2px solid #d3dfc7";
    if(person.avatar_url){const img=document.createElement("img");img.src=person.avatar_url;img.alt="Аватар "+(person.nickname||"друга");img.style.cssText="width:100%;height:100%;object-fit:cover";img.onerror=()=>{avatar.textContent="🌲"};avatar.appendChild(img)}else avatar.textContent="🌲";
    const identity=document.createElement("div");identity.style.cssText="flex:1;min-width:160px";
    const kicker=document.createElement("small");kicker.textContent="ПРОФИЛЬ ДРУГА";kicker.style.cssText="display:block;font-size:10px;letter-spacing:.12em;color:#71816c;font-weight:800;margin-bottom:4px";
    const title=document.createElement("h4");title.textContent=person.nickname||person.full_name||"Участник Горизонта";title.style.cssText="font-size:21px;margin:0 0 5px;color:#294b38";
    const char=document.createElement("p");char.textContent="Герой: "+(names[config.character]||"ещё не выбран");char.style.cssText="margin:0;color:#65735f;font-size:12px";
    identity.append(kicker,title,char);top.append(avatar,identity);
    const close=document.createElement("button");close.type="button";close.textContent="Скрыть профиль";close.style.cssText="border:1px solid #cbd8c4;border-radius:999px;background:#fff;color:#49614a;padding:8px 11px;font-weight:700;cursor:pointer";close.addEventListener("click",()=>out.replaceChildren());top.append(close);card.appendChild(top);
    const hero=document.createElement("div");hero.style.cssText="margin-top:12px;padding:12px;border-radius:13px;background:#e9efd9;color:#405a31";
    const main=document.createElement("strong");main.style.cssText="display:block;font-size:14px";main.textContent=personalityNames[traits.primary]||"Характер ещё не выбран";
    const sub=document.createElement("span");sub.style.cssText="display:block;font-size:12px;margin-top:4px";sub.textContent=traits.secondary?"Дополнительная черта: "+(personalityNames[traits.secondary]||"не указана"):"Дополнительная черта пока не выбрана";
    hero.append(main,sub);card.appendChild(hero);
    const balance=document.createElement("div");balance.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding:13px 14px;border-radius:13px;background:#315846;color:#fff";
    const balanceLabel=document.createElement("strong");balanceLabel.textContent="Баланс горизонтиков";const balanceValue=document.createElement("strong");balanceValue.style.cssText="font-size:20px;white-space:nowrap";const total=Number(data.balance||0);balanceValue.textContent=total+" "+currencyWord(total)+" ⭐";balance.append(balanceLabel,balanceValue);card.appendChild(balance);
    const achTitle=document.createElement("h5");achTitle.textContent="Достижения";achTitle.style.cssText="margin:16px 0 9px;color:#315846;font-size:16px";card.appendChild(achTitle);
    const achievements=data.achievements||[],unlocked=achievements.filter(x=>x.unlocked).length;
    const count=document.createElement("p");count.textContent="Открыто "+unlocked+" из "+achievements.length;count.style.cssText="margin:-4px 0 10px;color:#71816c;font-size:12px";card.appendChild(count);
    const grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px";
    achievements.forEach(x=>{
      const item=document.createElement("article");item.style.cssText="min-width:0;padding:10px 8px;border-radius:12px;background:#fff;border:1px solid #e2e9dc;text-align:center";
      const img=document.createElement("img");img.src=x.icon_path||"assets/achievements/first-look.png";img.alt="";img.loading="lazy";img.style.cssText="width:58px;height:58px;object-fit:contain"+(x.unlocked?"":";filter:grayscale(1);opacity:.5");
      const name=document.createElement("strong");name.textContent=x.name;name.style.cssText="display:block;margin:5px 0;font-size:12px;color:#3c5140";
      const desc=document.createElement("small");desc.textContent=x.description||"";desc.style.cssText="display:block;font-size:10px;line-height:1.35;color:#788273";
      const status=document.createElement("small");status.textContent=x.unlocked?"Получено · уровень "+(x.level||1):"Прогресс "+(x.progress||0)+" / "+(x.thresholds?.[Math.min(x.level||0,(x.thresholds||[1]).length-1)]||1);status.style.cssText="display:block;margin-top:6px;font-size:10px;font-weight:700;color:"+(x.unlocked?"#47734f":"#8b7656");
      item.append(img,name,desc,status);grid.appendChild(item);
    });
    card.appendChild(grid);out.appendChild(card);
  }

  async function loadFriends() {
    const incoming=document.getElementById("gorizont-friend-incoming"), list=document.getElementById("gorizont-friend-list"); if(!incoming||!list)return;
    incoming.textContent="Загружаем…";list.textContent="Загружаем…";
    try {
      const results=await Promise.all([socialRequest({action:"friend_incoming"}),socialRequest({action:"friend_list"})]);
      const requests=results[0],friends=results[1]; incoming.replaceChildren();list.replaceChildren();
      if(!requests.results.length) incoming.textContent="Новых заявок пока нет.";
      requests.results.forEach(item=>addFriendRow(incoming,item.person||{nickname:"Участник"},{label:"Принять",done:"Принято",run:async()=>{await socialRequest({action:"friend_respond",request_id:item.id,accept:true});await loadFriends();}}));
      if(!friends.results.length) list.textContent="Пока нет друзей. Найди знакомых по игровому нику!";
      friends.results.forEach(person=>{
        const row=document.createElement("div");row.className="gorizont-friend-row";
        row.style.cssText="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #e1e8dc";
        const avatar=document.createElement("span");avatar.style.cssText="width:42px;height:42px;flex:0 0 42px;border-radius:50%;overflow:hidden;background:#e9efd9;display:grid;place-items:center;font-size:22px";
        if(person.avatar_url){const img=document.createElement("img");img.src=person.avatar_url;img.alt="";img.style.cssText="width:100%;height:100%;object-fit:cover";img.onerror=()=>{avatar.textContent="🌲"};avatar.appendChild(img)}else avatar.textContent="🌲";
        const name=document.createElement("strong");name.textContent=person.nickname||person.full_name||"Участник";name.style.cssText="flex:1;min-width:0;font-size:14px";
        const btn=document.createElement("button");btn.type="button";btn.textContent="Профиль";btn.style.cssText="border:0;border-radius:10px;padding:9px 13px;background:#315846;color:white;font-weight:700;cursor:pointer";
        btn.addEventListener("click",async()=>{
          const out=document.getElementById("gorizont-friend-progress");out.replaceChildren();
          const loading=document.createElement("p");loading.textContent="Загружаем профиль…";out.appendChild(loading);
          try{const data=await socialRequest({action:"friend_progress",participant_id:person.id});renderFriendProfile(out,data)}
          catch(e){out.textContent=e.message}
        });
        row.append(avatar,name,btn);list.appendChild(row);
      });
    } catch(e) { incoming.textContent=e.message;list.textContent="Не удалось загрузить друзей."; }
  }
  async function loadAchievements() {
    const target=document.getElementById("gorizont-achievement-list"); if(!target||!participant)return; target.textContent="Загружаем достижения…";
    try {
      const results=await Promise.all([supabase.from("achievements").select("id,code,name,description,reward_points,category,icon_path,is_secret,hint,criteria,sort_order").eq("is_active",true).order("sort_order"),supabase.from("achievement_progress").select("achievement_id,progress,level").eq("participant_id",participant.id),supabase.from("participant_achievements").select("achievement_id,level,earned_at").eq("participant_id",participant.id)]);
      const defs=results[0].data||[], progress=results[1].data||[], earned=results[2].data||[]; const err=results.find(x=>x.error); if(err)throw err.error;
      target.replaceChildren();
      defs.forEach(a=>{
        const p=progress.find(x=>x.achievement_id===a.id), earnedRow=earned.find(x=>x.achievement_id===a.id), thresholds=Array.isArray(a.criteria?.thresholds)?a.criteria.thresholds:[1];
        const unlocked=!!earnedRow, secret=a.is_secret&&!unlocked;
        const card=document.createElement("article");card.style.cssText="padding:10px;border-radius:13px;background:#fff;box-shadow:0 1px 5px #60451a18;text-align:center;min-width:0";
        const img=document.createElement("img");img.src=a.icon_path||"assets/achievements/first-look.png";img.alt="";img.loading="lazy";img.style.cssText="width:76px;height:76px;object-fit:contain;"+(unlocked?"":"filter:grayscale(1);opacity:.55");
        const title=document.createElement("strong");title.style.cssText="display:block;font-size:13px;margin:5px 0";title.textContent=secret?"Секретное достижение":a.name;
        const desc=document.createElement("small");desc.style.cssText="display:block;font-size:11px;line-height:1.35;color:#75664e";desc.textContent=secret?(a.hint||"Здесь скрыта маленькая тайна."):a.description||"";
        const status=document.createElement("small");status.style.cssText="display:block;margin-top:6px;font-size:11px;color:#47734f;font-weight:700";
        status.textContent=unlocked?"Получено · уровень "+(earnedRow.level||1):"Прогресс: "+(p?.progress||0)+(thresholds.length>1?" / "+(thresholds[Math.min(p?.level||0,thresholds.length-1)]||thresholds[thresholds.length-1]):"")+" · награда "+a.reward_points+" горизонтиков";
        card.append(img,title,desc,status);target.appendChild(card);
      });
    } catch(e) { target.textContent="Не удалось загрузить достижения. "+e.message; }
  }
  function initSocialAndAchievements() {
    if(socialPanelInitialized||!participant)return; socialPanelInitialized=true;
    document.getElementById("gorizont-friend-search")?.addEventListener("submit",async event=>{
      event.preventDefault();const q=document.getElementById("gorizont-friend-query").value.trim(),out=document.getElementById("gorizont-friend-search-results");
      if(q.length<2){out.textContent="Введи хотя бы 2 символа.";return;} out.textContent="Ищем…";
      try { const data=await socialRequest({action:"friend_search",query:q});out.replaceChildren();if(!data.results.length){out.textContent="Никого не нашли. Проверь написание ника.";return;}
        data.results.forEach(person=>addFriendRow(out,person,{label:"Добавить",done:"Заявка отправлена",run:async()=>{await socialRequest({action:"friend_send",participant_id:person.id});}}));
      } catch(e) { out.textContent=e.message; }
    });
    const nicknameForm=document.getElementById("gorizont-nickname-form");
    nicknameForm?.addEventListener("submit",async event=>{event.preventDefault();const input=document.getElementById("gorizont-nickname-input"),out=document.getElementById("gorizont-nickname-status"),button=nicknameForm.querySelector("button");button.disabled=true;out.textContent="Проверяем ник…";try{const result=await socialRequest({action:"nickname_change",nickname:input.value});participant={...participant,nickname:result.nickname};localStorage.setItem("gorizont-participant",JSON.stringify(participant));profileNick.textContent="Игровой ник: "+result.nickname+" · Логин: "+(participant.username||"—");if(mainOpener)mainOpener.firstChild.textContent="Мой профиль · "+result.nickname;if(menuAccountTab)menuAccountTab.textContent="Привет, "+result.nickname+"!";input.value=result.nickname;out.textContent="Ник успешно изменён.";}catch(e){out.textContent=e.message;}finally{button.disabled=false;}});
    const nicknameInput=document.getElementById("gorizont-nickname-input");if(nicknameInput)nicknameInput.value=participant.nickname||"";
    loadAchievements();loadFriends();
  }

  function showProfile(data) {
    participant = data || null;
    const signedIn = !!participant;
    if (mainOpener) {
      const arrow = mainOpener.querySelector(".arrow");
      mainOpener.classList.toggle("is-authenticated", signedIn);
      mainOpener.firstChild.textContent = signedIn
        ? `Мой профиль · ${participant.nickname || participant.username}`
        : "войти в лагерь ";
      if (arrow) arrow.textContent = signedIn ? " ↗" : "→";
    }
    if (menuAccountTab) {
      menuAccountTab.hidden = false;
      menuAccountTab.textContent = signedIn
        ? `Привет, ${participant.nickname || participant.full_name || "друг"}!`
        : "Войти в аккаунт";
    }
    if (menuAccount) {
      menuAccount.hidden = !signedIn;
      if (menuAccountGreeting) {
        const firstName = (participant.full_name || participant.nickname || "друг").trim().split(/\\s+/)[0];
        menuAccountGreeting.textContent = `Привет, ${firstName}!`;
      }
    }
    if (profile) profile.hidden = !signedIn;
    if (signedIn) setProfileTab(profile?.dataset.activeTab || "balance");
    if (tabs) tabs.hidden = signedIn;
    registerForm.hidden = signedIn || !registerForm.dataset.active;
    loginForm.hidden = signedIn || registerForm.dataset.active;
    if (intro) intro.textContent = signedIn
      ? "Твой аккаунт Горизонта. Здесь твой лагерный профиль и баланс горизонтиков."
      : "Создай аккаунт, собирай горизонтики за игры и меняй их на лагерные подарки.";
    if (title) title.textContent = signedIn ? "Твой профиль" : "Добро пожаловать в Горизонт!";
    if (signedIn) {
      profileName.textContent = participant.full_name || participant.nickname || "Участник Горизонта";
      profileNick.textContent = `Игровой ник: ${participant.nickname || "—"} · Логин: ${participant.username || "—"}`;
      const personalityNames = {explorer:"Исследователь",creator:"Творец",energizer:"Энерджайзер",social:"Душа компании",guardian:"Хранитель",inventor:"Изобретатель",positive:"Позитивный",dreamy:"Мечтательный",sociable:"Общительный",calm:"Спокойный",shy:"Застенчивый",cheerful:"Весёлый",thoughtful:"Задумчивый",mischievous:"Озорной",determined:"Решительный",curious:"Любопытный"};
      const heroPersonality = participant.avatar_config?.personality;
      if(heroCard){
        const valid = heroPersonality?.primary && heroPersonality?.secondary && personalityNames[heroPersonality.primary] && personalityNames[heroPersonality.secondary];
        heroCard.hidden = false;
        if(valid){
          heroPrimary.textContent = personalityNames[heroPersonality.primary];
          heroSecondary.textContent = "Дополнительная черта: " + personalityNames[heroPersonality.secondary];
          const changedAt = participant.avatar_config?.personality_changed_at;
          if(changedAt){
            const next = new Date(changedAt); const day = next.getDate(); next.setDate(1); next.setMonth(next.getMonth()+1); next.setDate(Math.min(day,new Date(next.getFullYear(),next.getMonth()+1,0).getDate()));
            heroNextChange.textContent = "Характер можно будет изменить с " + next.toLocaleDateString("ru-RU",{day:"numeric",month:"long"}) + ".";
          }else heroNextChange.textContent = "Ты можешь выбрать новый характер в конструкторе героя.";
        }else{
          heroPrimary.textContent = "Характер ещё не выбран";
          heroSecondary.textContent = "Выбери основной и дополнительный характер.";
          heroNextChange.textContent = "";
        }
      }
      if (profileAvatar) {
        profileAvatar.replaceChildren();
        if (participant.avatar_url) {
          const image = document.createElement("img");
          image.src = participant.avatar_url;
          image.alt = "Твой персонаж";
          image.onerror = () => { profileAvatar.replaceChildren(); profileAvatar.textContent = "🌲"; };
          profileAvatar.appendChild(image);
        } else {
          profileAvatar.textContent = "🌲";
        }
      }
      refreshPoints();
      initSocialAndAchievements();
    } else { socialPanelInitialized = false; }
  }

  function lockPageScroll() {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    bodyLockStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow
    };
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }
  function unlockPageScroll() {
    const body = document.body;
    if (bodyLockStyles) {
      Object.assign(body.style, bodyLockStyles);
      bodyLockStyles = null;
    } else {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
    }
    window.scrollTo(0, savedScrollY);
  }
  function open() {
    if (modal.classList.contains("open")) return;
    previousFocus = document.activeElement;
    lockPageScroll();
    modal.scrollTop = 0;
    const dialog = modal.querySelector(".auth-dialog");
    if (dialog) dialog.scrollTop = 0;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (!participant) {
      const form = registerForm.hidden ? loginForm : registerForm;
      const firstInput = form.querySelector("input");
      if (firstInput) requestAnimationFrame(() => {
        try { firstInput.focus({ preventScroll: true }); }
        catch { firstInput.focus(); }
      });
    }
  }
  function close() {
    if (busy) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    unlockPageScroll();
    if (previousFocus?.isConnected) {
      try { previousFocus.focus({ preventScroll: true }); }
      catch { previousFocus.focus(); }
    }
  }
  function tab(which) {
    if (passwordChangePanel) { passwordChangePanel.remove(); passwordChangePanel = null; }
    const isRegister = which === "register";
    registerTab.classList.toggle("active", isRegister);
    loginTab.classList.toggle("active", !isRegister);
    registerTab.setAttribute("aria-selected", String(isRegister));
    loginTab.setAttribute("aria-selected", String(!isRegister));
    registerForm.dataset.active = String(isRegister);
    registerForm.hidden = !isRegister;
    loginForm.hidden = isRegister;
    setStatus("");
  }
  async function callFunction(name, payload) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.error || "Не удалось выполнить запрос.");
    return data;
  }
  async function acceptSession(data) {
    if (!data?.session?.access_token || !data?.session?.refresh_token) throw new Error("Сервер не вернул сессию. Попробуй войти ещё раз.");
    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (error) throw error;
    let participantData = data.participant;
    const { data: freshParticipant, error: profileError } = await supabase
      .from("participants")
      .select("id, full_name, nickname, username, avatar_url, avatar_config")
      .eq("id", data.participant.id)
      .maybeSingle();
    if (!profileError && freshParticipant) participantData = { ...data.participant, ...freshParticipant };
    localStorage.setItem("gorizont-participant", JSON.stringify(participantData));
    showProfile(participantData);
    window.dispatchEvent(new CustomEvent("gorizont:auth-changed", { detail: { participant: participantData } }));
    setStatus("Ты успешно вошёл в Горизонт!");
    setTimeout(() => {
      close();
    }, 900);
  }

  registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !registerForm.reportValidity()) return;
    const form = new FormData(registerForm);
    const payload = {
      full_name: String(form.get("full_name") || "").trim(),
      nickname: String(form.get("nickname") || "").trim(),
      username: String(form.get("username") || "").trim().toLowerCase(),
      password: String(form.get("password") || ""),
    };
    if (payload.password.length < 10 || payload.password.length > 72) return setStatus("Пароль должен содержать от 10 до 72 символов.", true);
    if (payload.nickname.length < 2 || payload.nickname.length > 30) return setStatus("Никнейм должен содержать от 2 до 30 символов.", true);
    setBusy(true); setStatus("Создаём аккаунт...");
    try {
      await callFunction("register-user", payload);
      setStatus("Аккаунт создан! Выполняем вход...");
      const loginData = await callFunction("login-user", { username: payload.username, password: payload.password });
      await acceptSession(loginData);
      registerForm.reset();
    } catch (error) { setStatus(error.message || "Не удалось зарегистрироваться.", true); }
    finally { setBusy(false); }
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !loginForm.reportValidity()) return;
    const form = new FormData(loginForm);
    const payload = {
      username: String(form.get("username") || "").trim().toLowerCase(),
      password: String(form.get("password") || ""),
    };
    setBusy(true); setStatus("Проверяем логин и пароль...");
    try {
      const data = await callFunction("login-user", payload);
      if (data.must_change_password) {
        showPasswordChange(data.username, payload.password);
      } else {
        await acceptSession(data);
        loginForm.reset();
      }
    } catch (error) { setStatus(error.message || "Не удалось войти.", true); }
    finally { setBusy(false); }
  });

  logoutButton?.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true); setStatus("Выходим из аккаунта...");
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) return setStatus("Не удалось выйти. Попробуй ещё раз.", true);
    localStorage.removeItem("gorizont-participant");
    showProfile(null);
    tab("register");
    setStatus("Ты вышел из аккаунта.");
  });

  openers.forEach(element => element.addEventListener("click", () => {
    const menuBookmark = document.getElementById("menu");
    const menuTab = document.getElementById("menuTab");
    menuBookmark?.classList.remove("open");
    menuTab?.setAttribute("aria-expanded", "false");
    open();
  }));
  closeButton?.addEventListener("click", close);
  registerTab?.addEventListener("click", () => tab("register"));
  loginTab?.addEventListener("click", () => tab("login"));

  let backdropPressed = false;
  modal.addEventListener("pointerdown", e => { backdropPressed = e.target === modal; });
  modal.addEventListener("pointerup", e => { if (backdropPressed && e.target === modal) close(); backdropPressed = false; });
  modal.addEventListener("pointercancel", () => { backdropPressed = false; });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });

  supabase.auth.getSession().then(async ({ data, error }) => {
    if (error || !data.session) {
      localStorage.removeItem("gorizont-participant");
      showProfile(null);
      return;
    }
    try {
      const { data: freshParticipant, error: profileError } = await supabase
        .from("participants")
        .select("id, full_name, nickname, username, avatar_url, avatar_config")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (!profileError && freshParticipant) {
        localStorage.setItem("gorizont-participant", JSON.stringify(freshParticipant));
        showProfile(freshParticipant);
      } else {
        const saved = JSON.parse(localStorage.getItem("gorizont-participant") || "null");
        showProfile(saved || { nickname: "Участник", username: "", full_name: "Участник Горизонта" });
      }
    } catch {
      const saved = JSON.parse(localStorage.getItem("gorizont-participant") || "null");
      showProfile(saved || { nickname: "Участник", username: "", full_name: "Участник Горизонта" });
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      localStorage.removeItem("gorizont-participant");
      showProfile(null);
    }
  });

  window.GorizontAuth = {
    getSession: () => supabase.auth.getSession(),
    getParticipant: () => participant,
    signOut: async () => supabase.auth.signOut(),
  };
  tab("register");
  if (new URLSearchParams(window.location.search).get("auth") === "login") {
    tab("login");
    open();
    history.replaceState({}, "", window.location.pathname + window.location.hash);
  }
})();
