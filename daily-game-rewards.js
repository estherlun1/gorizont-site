import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jrvukdqqrmfjbtskrayy.supabase.co";
const SUPABASE_KEY = "sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "gorizont-auth-session" }
});

function showMessage(text) {
  let el = document.getElementById("dailyRewardMessage");
  if (!el) {
    el = document.createElement("p");
    el.id = "dailyRewardMessage";
    el.style.cssText = "margin:14px auto;padding:12px 16px;max-width:680px;border-radius:12px;background:#fff4d8;color:#594321;text-align:center;font-weight:700;line-height:1.45";
    (document.getElementById("card") || document.querySelector("main") || document.body).appendChild(el);
  }
  el.textContent = text;
}

export async function submitDailyGameReward(gameSlug, score) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      showMessage("Войди в аккаунт, чтобы получить горизонтики, и пройди игру ещё раз.");
      return;
    }
    const response = await fetch(SUPABASE_URL + "/functions/v1/complete-daily-game", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": "Bearer " + session.access_token },
      body: JSON.stringify({ game_slug: gameSlug, score, idempotency_key: crypto.randomUUID() })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Не удалось отправить результат");
    if (result.status === "awarded") showMessage("Отлично! Тебе начислено " + result.points_awarded + " горизонтиков! ⭐");
    else if (result.status === "daily_limit") showMessage("Ты уже получил награду за эту игру сегодня. Приходи завтра!");
    else if (result.status === "duplicate_request") showMessage("Этот результат уже был принят сервером.");
    else showMessage("Результат игры обработан.");
    window.dispatchEvent(new CustomEvent("gorizont:points-updated"));
  } catch (error) {
    console.error("Daily reward error:", error);
    showMessage("Не удалось отправить результат. Проверь вход в аккаунт и попробуй ещё раз.");
  }
}