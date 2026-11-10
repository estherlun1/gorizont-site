import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jrvukdqqrmfjbtskrayy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AAHg7Xgeq_KRm6PdropyMg_V6op0enJ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "gorizont-auth-session"
  }
});

let requestStarted = false;

function showMapHuntMessage(message) {
  const copy = document.querySelector("#huntTab .hunt-copy");
  if (copy) copy.textContent = message;
}

window.addEventListener("gorizont:map-hunt-completed", async (event) => {
  if (requestStarted) return;
  requestStarted = true;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      showMapHuntMessage("Вы всё нашли! Войдите в аккаунт, чтобы получить 20 горизонтИков. После входа пройдите игру ещё раз.");
      return;
    }

    const itemIds = event.detail?.item_ids;
    if (!Array.isArray(itemIds) || itemIds.length !== 8) {
      showMapHuntMessage("Не удалось подтвердить результат. Попробуй пройти игру ещё раз.");
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/complete-map-hunt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        item_ids: itemIds,
        idempotency_key: crypto.randomUUID()
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Не удалось отправить результат");
    }

    if (result.awarded) {
      showMapHuntMessage("Вы всё нашли! Держите 20 горизонтИков! ⭐");
    } else if (result.weekly_limit) {
      showMapHuntMessage("Вы всё нашли! Награду за эту игру на этой неделе вы уже получили. Возвращайтесь на следующей! ⭐");
    } else if (result.duplicate_request) {
      showMapHuntMessage("Результат этой игры уже был отправлен.");
    } else {
      showMapHuntMessage("Все предметы найдены! Результат отправлен на проверку.");
    }

    window.dispatchEvent(new CustomEvent("gorizont:points-updated"));
  } catch (error) {
    console.error("Map hunt reward error:", error);
    showMapHuntMessage("Предметы найдены, но не удалось отправить результат. Войди в аккаунт и попробуй позже.");
    requestStarted = false;
  }
});
