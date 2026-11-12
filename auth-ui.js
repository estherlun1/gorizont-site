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
  const logoutButton = document.getElementById("authLogout");
  const menuAccountTab = document.getElementById("menuAccountTab");
  const menuAccount = document.getElementById("menuAccount");
  const menuAccountGreeting = document.getElementById("menuAccountGreeting");
  const pointsValue = profile?.querySelector(".auth-points-preview small");
  const pointsHistory = document.getElementById("authPointsHistory");
  const status = document.getElementById("authStatus");
  let previousFocus = null;
  let busy = false;
  let participant = null;

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
      refreshPoints();
    }
  }

  function open() {
    previousFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!participant) {
      const form = registerForm.hidden ? loginForm : registerForm;
      form.querySelector("input")?.focus();
    }
  }
  function close() {
    if (busy) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    previousFocus?.focus();
  }
  function tab(which) {
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
    localStorage.setItem("gorizont-participant", JSON.stringify(data.participant));
    showProfile(data.participant);
    window.dispatchEvent(new CustomEvent("gorizont:auth-changed", { detail: { participant: data.participant } }));
    setStatus("Ты успешно вошёл в Горизонт!");
    setTimeout(() => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
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
      await acceptSession(data);
      loginForm.reset();
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

  openers.forEach(element => element.addEventListener("click", open));
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
      const saved = JSON.parse(localStorage.getItem("gorizont-participant") || "null");
      if (saved) showProfile(saved);
      else {
        // Session exists, but no cached profile: keep the UI honest until profile reload is implemented.
        showProfile({ nickname: "Участник", username: "", full_name: "Участник Горизонта" });
      }
    } catch {
      localStorage.removeItem("gorizont-participant");
      showProfile({ nickname: "Участник", username: "", full_name: "Участник Горизонта" });
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
})();
