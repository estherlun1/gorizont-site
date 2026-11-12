(function () {
  const URL = "https://jrvukdqqrmfjbtskrayy.supabase.co";
  const KEY = "sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";
  const client = window.supabase?.createClient
    ? window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "gorizont-auth-session" } })
    : null;
  function message(text) {
    let el = document.getElementById("dailyRewardMessage");
    if (!el) {
      el = document.createElement("p");
      el.id = "dailyRewardMessage";
      el.style.cssText = "margin:14px auto;padding:12px 16px;max-width:680px;border-radius:12px;background:#fff4d8;color:#594321;text-align:center;font-weight:700;line-height:1.45";
      (document.querySelector("main") || document.body).appendChild(el);
    }
    el.textContent = text;
  }
  async function submit(gameSlug, score) {
    try {
      if (!client) throw new Error("Auth client unavailable");
      const { data: { session } } = await client.auth.getSession();
      if (!session?.access_token) {
        message("Результат сохранён на странице. Войди в аккаунт и пройди игру ещё раз, чтобы получить горизонтики.");
        return;
      }
      const response = await fetch(URL + "/functions/v1/complete-daily-game", {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": KEY, "Authorization": "Bearer " + session.access_token },
        body: JSON.stringify({ game_slug: gameSlug, score, idempotency_key: crypto.randomUUID() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Не удалось отправить результат");
      if (result.status === "awarded") message("Отлично! Тебе начислено " + result.points_awarded + " горизонтИков! ⭐");
      else if (result.status === "daily_limit") message("Ты уже получил награду за эту игру сегодня. Приходи завтра!");
      else if (result.status === "duplicate_request") message("Этот результат уже был принят сервером.");
      else message("Результат игры обработан.");
      window.dispatchEvent(new CustomEvent("gorizont:points-updated"));
    } catch (e) {
      console.error("Daily reward error:", e);
      message("Не удалось отправить результат. Проверь вход в аккаунт и попробуй ещё раз.");
    }
  }
  window.GorizontDailyRewards = { submit };
})();