import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

(() => {
  const SUPABASE_URL = "https://jrvukdqqrmfjbtskrayy.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "gorizont-auth-session",
    },
  });

  const modal = document.getElementById("campAuthModal");
  if (!modal) return;

  const openers = [
    document.getElementById("campAuthOpen"),
    ...document.querySelectorAll("[data-open-auth]"),
  ].filter(Boolean);
  const closeButton = document.getElementById("campAuthClose");
  const registerTab = document.getElementById("authRegisterTab");
  const loginTab = document.getElementById("authLoginTab");
  const registerForm = document.getElementById("authRegisterForm");
  const loginForm = document.getElementById("authLoginForm");
  const status = document.getElementById("authStatus");

  let previousFocus = null;
  let busy = false;

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.style.color = isError ? "#a33d2b" : "#47734f";
  }

  function setBusy(value, form) {
    busy = value;
    const buttons = [registerForm.querySelector('button[type="submit"]'),
                     loginForm.querySelector('button[type="submit"]')];
    buttons.forEach(button => {
      button.disabled = value;
      button.style.opacity = value ? ".65" : "";
      button.style.cursor = value ? "wait" : "";
    });
    if (form) {
      const button = form.querySelector('button[type="submit"]');
      if (button) button.textContent = value ? "Подожди..." : (form === registerForm ? "Создать аккаунт →" : "Войти в аккаунт →");
    }
  }

  function open() {
    previousFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const activeForm = registerForm.hidden ? loginForm : registerForm;
    activeForm.querySelector("input")?.focus();
  }

  function close() {
    if (busy) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
  }

  function tab(which) {
    const isRegister = which === "register";
    registerTab.classList.toggle("active", isRegister);
    loginTab.classList.toggle("active", !isRegister);
    registerTab.setAttribute("aria-selected", String(isRegister));
    loginTab.setAttribute("aria-selected", String(!isRegister));
    registerForm.hidden = !isRegister;
    loginForm.hidden = isRegister;
    setStatus("");
  }

  async function callFunction(name, payload) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Сервер вернул непонятный ответ. Попробуй ещё раз.");
    }

    if (!response.ok || data?.error) {
      throw new Error(data?.error || "Не удалось выполнить запрос.");
    }
    return data;
  }

  function saveParticipant(participant) {
    if (participant) {
      localStorage.setItem("gorizont-participant", JSON.stringify(participant));
      window.dispatchEvent(new CustomEvent("gorizont:auth-changed", {
        detail: { participant },
      }));
    }
  }

  async function finishLogin(data) {
    if (!data?.session?.access_token || !data?.session?.refresh_token) {
      throw new Error("Вход выполнен, но сервер не вернул сессию. Обратись к администратору.");
    }

    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (error) throw new Error("Не удалось сохранить вход: " + error.message);

    saveParticipant(data.participant);
    setStatus(`Добро пожаловать, ${data.participant?.nickname || "участник"}! Вход выполнен.`);
    setTimeout(() => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 1100);
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

    if (payload.password.length < 10 || payload.password.length > 72) {
      setStatus("Пароль должен содержать от 10 до 72 символов.", true);
      return;
    }
    if (payload.nickname.length < 2 || payload.nickname.length > 30) {
      setStatus("Никнейм должен содержать от 2 до 30 символов.", true);
      return;
    }

    setBusy(true, registerForm);
    setStatus("Создаём твой аккаунт...");
    try {
      await callFunction("register-user", payload);
      setStatus("Аккаунт создан! Выполняем вход...");
      const loginData = await callFunction("login-user", {
        username: payload.username,
        password: payload.password,
      });
      await finishLogin(loginData);
      registerForm.reset();
    } catch (error) {
      setStatus(error.message || "Не удалось зарегистрироваться.", true);
    } finally {
      setBusy(false, registerForm);
    }
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !loginForm.reportValidity()) return;

    const form = new FormData(loginForm);
    const payload = {
      username: String(form.get("username") || "").trim().toLowerCase(),
      password: String(form.get("password") || ""),
    };

    setBusy(true, loginForm);
    setStatus("Проверяем логин и пароль...");
    try {
      const data = await callFunction("login-user", payload);
      await finishLogin(data);
      loginForm.reset();
    } catch (error) {
      setStatus(error.message || "Не удалось войти.", true);
    } finally {
      setBusy(false, loginForm);
    }
  });

  openers.forEach(element => element.addEventListener("click", open));
  closeButton?.addEventListener("click", close);
  registerTab?.addEventListener("click", () => tab("register"));
  loginTab?.addEventListener("click", () => tab("login"));

  let backdropPressed = false;
  modal.addEventListener("pointerdown", event => {
    backdropPressed = event.target === modal;
  });
  modal.addEventListener("pointerup", event => {
    if (backdropPressed && event.target === modal) close();
    backdropPressed = false;
  });
  modal.addEventListener("pointercancel", () => {
    backdropPressed = false;
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("open")) close();
  });

  // Restore existing session after page reload.
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      try {
        const participant = JSON.parse(localStorage.getItem("gorizont-participant") || "null");
        if (participant) {
          window.dispatchEvent(new CustomEvent("gorizont:auth-changed", {
            detail: { participant },
          }));
        }
      } catch {
        localStorage.removeItem("gorizont-participant");
      }
    } else {
      localStorage.removeItem("gorizont-participant");
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      localStorage.removeItem("gorizont-participant");
      window.dispatchEvent(new CustomEvent("gorizont:auth-changed", {
        detail: { participant: null },
      }));
    }
  });

  // Expose a small read-only integration surface for other site scripts.
  window.GorizontAuth = {
    getSession: () => supabase.auth.getSession(),
    getParticipant: () => {
      try {
        return JSON.parse(localStorage.getItem("gorizont-participant") || "null");
      } catch {
        return null;
      }
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
})();
