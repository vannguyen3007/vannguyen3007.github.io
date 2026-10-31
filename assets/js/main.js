/* =====================================================================
   Van Nguyen — research site script
   ---------------------------------------------------------------------
   Four small features, each independent. If an element is missing on a
   page, that feature simply does nothing.
     1. Light / dark theme toggle (remembered per visitor)
     2. Mobile menu
     3. Research filter on the home page
     4. Hero animation: isodose-style contour lines (home page only)
   ===================================================================== */

/* ---------- 1. Theme toggle ---------- */
(function theme() {
  const root = document.documentElement;
  const btn = document.querySelector("[data-theme-toggle]");
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch (e) { /* storage blocked: stay on the default dark theme */ }

  if (!btn) return;
  btn.addEventListener("click", () => {
    const isLight = root.dataset.theme === "light";
    root.dataset.theme = isLight ? "dark" : "light";
    btn.setAttribute("aria-label", isLight ? "Switch to light theme" : "Switch to dark theme");
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();

/* ---------- 2. Mobile menu ---------- */
(function menu() {
  const btn = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector(".nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
  });
})();

/* ---------- 3. Research filter ----------
   Each project has data-topics="imaging stats ..." and each button has
   data-filter="imaging". "all" shows everything.                       */
(function filter() {
  const buttons = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll("[data-topics]");
  if (!buttons.length) return;
  buttons.forEach((btn) => btn.addEventListener("click", () => {
    const topic = btn.dataset.filter;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    items.forEach((item) => {
      item.hidden = topic !== "all" && !item.dataset.topics.split(" ").includes(topic);
    });
  }));
})();

/* ---------- 4. Hero: isodose contour lines ----------
   A smooth "dose" field is built from a few drifting Gaussian sources.
   Marching squares traces level sets at 20%…95%, colored low → high
   like a treatment-planning isodose display. The pointer adds a source.
   Respects reduced motion (draws one still frame) and pauses offscreen. */
(function isodose() {
  const canvas = document.getElementById("isodose");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LEVELS = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
  const COLORS = ["--iso-1", "--iso-2", "--iso-3", "--iso-4", "--iso-5", "--iso-6"];
  const CELL = 10; // grid spacing in CSS pixels; larger = faster, blockier

  // Drifting sources: position (0–1), radius, weight, orbit speed
  const sources = [
    { x: 0.70, y: 0.45, r: 0.20, w: 1.00, sx: 0.00021, sy: 0.00017, p: 0.0 },
    { x: 0.82, y: 0.62, r: 0.13, w: 0.70, sx: 0.00031, sy: 0.00023, p: 1.7 },
    { x: 0.60, y: 0.30, r: 0.11, w: 0.55, sx: 0.00027, sy: 0.00035, p: 3.1 },
    { x: 0.90, y: 0.28, r: 0.09, w: 0.45, sx: 0.00019, sy: 0.00029, p: 4.4 },
  ];
  const pointer = { x: -1, y: -1, w: 0 };

  let w = 0, h = 0, cols = 0, rows = 0, field = null, colors = [], running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / CELL) + 1; rows = Math.ceil(h / CELL) + 1;
    field = new Float32Array(cols * rows);
    readColors();
  }
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    colors = COLORS.map((c) => s.getPropertyValue(c).trim());
  }

  function sample(t) {
    const aspect = w / h;
    const pts = sources.map((s) => ({
      x: s.x + 0.06 * Math.sin(t * s.sx + s.p),
      y: s.y + 0.08 * Math.cos(t * s.sy + s.p),
      r2: s.r * s.r, w: s.w,
    }));
    if (pointer.w > 0.01) pts.push({ x: pointer.x, y: pointer.y, r2: 0.012, w: 0.6 * pointer.w });
    for (let j = 0; j < rows; j++) {
      const y = (j * CELL) / h;
      for (let i = 0; i < cols; i++) {
        const x = (i * CELL) / w;
        let v = 0;
        for (const p of pts) {
          const dx = (x - p.x) * aspect, dy = y - p.y;
          v += p.w * Math.exp(-(dx * dx + dy * dy) / (2 * p.r2));
        }
        field[j * cols + i] = v;
      }
    }
  }

  // Marching squares for one level; draws line segments directly
  function contour(level) {
    ctx.beginPath();
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = field[j * cols + i], b = field[j * cols + i + 1];
        const c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
        const idx = (a > level) | ((b > level) << 1) | ((c > level) << 2) | ((d > level) << 3);
        if (idx === 0 || idx === 15) continue;
        const x = i * CELL, y = j * CELL;
        const top = [x + CELL * (level - a) / (b - a), y];
        const right = [x + CELL, y + CELL * (level - b) / (c - b)];
        const bottom = [x + CELL * (level - d) / (c - d), y + CELL];
        const left = [x, y + CELL * (level - a) / (d - a)];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (idx) {
          case 1: case 14: seg(left, top); break;
          case 2: case 13: seg(top, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(right, bottom); break;
          case 6: case 9:  seg(top, bottom); break;
          case 7: case 8:  seg(left, bottom); break;
          case 5:  seg(left, top); seg(right, bottom); break;
          case 10: seg(top, right); seg(left, bottom); break;
        }
      }
    }
    ctx.stroke();
  }

  function draw(t) {
    sample(t);
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.4;
    LEVELS.forEach((level, k) => {
      ctx.strokeStyle = colors[k];
      ctx.globalAlpha = 0.55 + 0.07 * k;
      contour(level);
    });
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    pointer.w *= 0.985; // pointer source fades out when idle
    draw(t);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", () => { resize(); if (reduce) draw(0); });
  // Re-read colors when the theme changes
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (reduce) { draw(0); return; }

  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width;
    pointer.y = (e.clientY - r.top) / r.height;
    pointer.w = Math.min(1, pointer.w + 0.08);
  });
  // Pause when the hero is offscreen or the tab is hidden
  new IntersectionObserver(([entry]) => {
    const was = running; running = entry.isIntersecting;
    if (running && !was) requestAnimationFrame(loop);
  }).observe(canvas);
  requestAnimationFrame(loop);
})();
