(() => {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.id = "winterSnowCanvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999;opacity:.72";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) { canvas.remove(); return; }
  let width = 0, height = 0, dpr = 1, flakes = [], raf = 0, last = 0;
  const makeFlake = (fromTop = false) => ({
    x: Math.random() * width,
    y: fromTop ? -Math.random() * height : Math.random() * height,
    r: .8 + Math.random() * 2.2,
    speed: .35 + Math.random() * 1.05,
    drift: .2 + Math.random() * .65,
    phase: Math.random() * Math.PI * 2,
    alpha: .28 + Math.random() * .52
  });
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(115, Math.max(42, Math.round(width * height / 12500)));
    flakes = Array.from({ length: count }, () => makeFlake(true));
  }
  function frame(time) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(34, time - (last || time)) / 16.67;
    last = time;
    ctx.clearRect(0, 0, width, height);
    for (const f of flakes) {
      f.phase += .008 * dt;
      f.y += f.speed * dt;
      f.x += Math.sin(f.phase) * f.drift * dt;
      if (f.y > height + 8) { f.y = -8; f.x = Math.random() * width; }
      if (f.x < -8) f.x = width + 8;
      if (f.x > width + 8) f.x = -8;
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255," + f.alpha + ")";
      ctx.shadowColor = "rgba(255,255,255,.55)";
      ctx.shadowBlur = f.r > 2 ? 4 : 1.5;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
  });
  raf = requestAnimationFrame(frame);
})();