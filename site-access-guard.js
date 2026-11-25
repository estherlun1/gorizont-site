import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

(() => {
  const SUPABASE_URL = "https://jrvukdqqrmfjbtskrayy.supabase.co";
  const SUPABASE_KEY = "sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "gorizont-auth-session" }
  });
  const path = location.pathname;
  if (path.endsWith("/admin.html")) return;
  const isHome = path.endsWith("/") || path.endsWith("/index.html");

  async function enforceAccess() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { "Content-Type": "application/json", "apikey": SUPABASE_KEY };
      if (session?.access_token) headers.Authorization = "Bearer " + session.access_token;
      const response = await fetch(SUPABASE_URL + "/functions/v1/site-access-status", {
        method: "POST", headers, body: "{}"
      });
      if (!response.ok) return;
      const access = await response.json();
      if (!access.profile_only) return;

      if (isHome) {
        document.querySelectorAll("body > section, main > section, .camp-world, .horizon-map, #guides, #legends, #map, .site-footer, footer, .scroll-cue")
          .forEach(node => { if (!node.classList.contains("hero")) node.hidden = true; });
        document.querySelectorAll(".menu-links, .menu-age").forEach(node => { node.hidden = true; });
        const registerTab = document.getElementById("authRegisterTab");
        const loginTab = document.getElementById("authLoginTab");
        const registerForm = document.getElementById("authRegisterForm");
        const loginForm = document.getElementById("authLoginForm");
        if (!session && registerTab && loginTab && registerForm && loginForm) {
          registerTab.hidden = true;
          registerForm.hidden = true;
          loginTab.hidden = false;
          loginForm.hidden = false;
          loginTab.classList.add("active");
          registerTab.classList.remove("active");
          loginTab.setAttribute("aria-selected", "true");
          registerTab.setAttribute("aria-selected", "false");
        }
        const intro = document.querySelector(".auth-intro");
        if (intro) intro.textContent = "Зимний тест завершён. Сейчас доступен только личный кабинет участника.";
        const opener = document.getElementById("campAuthOpen");
        if (opener) opener.setAttribute("aria-label", "Открыть личный кабинет");
        return;
      }

      document.body.innerHTML = "";
      document.body.style.cssText = "margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#e7f1e9;color:#20302d;font-family:Inter,system-ui,sans-serif";
      const panel = document.createElement("main");
      panel.style.cssText = "width:min(520px,100%);padding:32px;border-radius:24px;background:#fffaf1;box-shadow:0 14px 38px #244c3b18;text-align:center";
      const title = document.createElement("h1");
      title.textContent = "Зимний тест завершён";
      title.style.cssText = "font-family:Oswald,Inter,sans-serif;font-size:32px;margin:0 0 12px";
      const message = document.createElement("p");
      message.textContent = "Сейчас доступен только личный кабинет. Все игры, задания и остальные разделы временно закрыты.";
      message.style.cssText = "line-height:1.6;color:#64736b;margin:0 0 22px";
      const link = document.createElement("a");
      link.href = "/gorizont-site/index.html";
      link.textContent = "Перейти в личный кабинет";
      link.style.cssText = "display:inline-block;padding:13px 20px;border-radius:999px;background:#f36f3d;color:#fff;text-decoration:none;font-weight:800";
      panel.append(title,message,link);
      document.body.append(panel);
    } catch (error) {
      console.error("Не удалось проверить режим доступа:", error);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => void enforceAccess(), { once: true });
  else void enforceAccess();
})();