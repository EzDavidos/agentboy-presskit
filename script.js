/* ============================================================
   AGENTBOY — press kit
   i18n loader + language switcher + lightbox + small UI bits
   ============================================================ */

/* ---------- language registry ----------
   `ready: false` languages appear in the menu but stay disabled until
   i18n/<code>.js exists. Add the file, flip the flag, done. */
const LANGS = [
  { code: "en", short: "EN", name: "English",  ready: true  },
  { code: "ru", short: "RU", name: "Русский",  ready: true  },
  { code: "fr", short: "FR", name: "Français", ready: false },
  { code: "de", short: "DE", name: "Deutsch",  ready: false },
  { code: "es", short: "ES", name: "Español",  ready: false },
  { code: "el", short: "EL", name: "Ελληνικά", ready: false },
];

const FALLBACK = "en";
const STORE_KEY = "agentboy.lang";

window.I18N = window.I18N || {};

/* Dictionaries are plain scripts, not fetch()ed JSON — that way the page
   also works when opened straight from disk (file://), not only over http. */
const loading = {};
function loadLang(code) {
  if (window.I18N[code]) return Promise.resolve(code);
  if (loading[code]) return loading[code];

  loading[code] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `i18n/${code}.js`;
    s.onload = () => (window.I18N[code] ? resolve(code) : reject(new Error(`empty dict: ${code}`)));
    s.onerror = () => reject(new Error(`missing dict: ${code}`));
    document.head.appendChild(s);
  });
  return loading[code];
}

function translate(code) {
  const dict = window.I18N[code];
  if (!dict) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });

  // data-i18n-attr="content:meta.description" (comma-separated pairs)
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((x) => x.trim());
      const v = dict[key];
      if (attr && v != null) el.setAttribute(attr, v);
    });
  });

  document.documentElement.lang = code;
  const meta = LANGS.find((l) => l.code === code);
  const cur = document.querySelector(".lang__cur");
  if (cur && meta) cur.textContent = meta.short;
  document.querySelectorAll(".lang__menu [data-lang]").forEach((b) => {
    b.setAttribute("aria-current", b.dataset.lang === code ? "true" : "false");
  });

  syncAboutToggle();
}

function setLang(code) {
  loadLang(code)
    .then(() => {
      translate(code);
      try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* private mode */ }
    })
    .catch((err) => {
      console.warn(err.message, "— falling back to", FALLBACK);
      if (code !== FALLBACK) setLang(FALLBACK);
    });
}

function initialLang() {
  let saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
  if (saved && LANGS.some((l) => l.code === saved && l.ready)) return saved;

  const nav = (navigator.languages || [navigator.language || ""])
    .map((l) => String(l).slice(0, 2).toLowerCase());
  const hit = nav.find((l) => LANGS.some((x) => x.code === l && x.ready));
  return hit || FALLBACK;
}

/* ---------- language menu ---------- */
function buildLangMenu() {
  const wrap = document.querySelector(".lang");
  if (!wrap) return;
  const btn = wrap.querySelector(".lang__btn");
  const menu = wrap.querySelector(".lang__menu");

  menu.innerHTML = LANGS.map(
    (l) => `<li><button type="button" data-lang="${l.code}"${l.ready ? "" : " disabled"}>
      <span>${l.name}</span>${l.ready ? "" : '<small data-i18n="lang.soon">soon</small>'}
    </button></li>`
  ).join("");

  const close = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  const open = () => { menu.hidden = false; btn.setAttribute("aria-expanded", "true"); };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden ? open() : close();
  });
  menu.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-lang]");
    if (!b || b.disabled) return;
    setLang(b.dataset.lang);
    close();
  });
  document.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- about: expand the full story ---------- */
function syncAboutToggle() {
  const btn = document.querySelector(".about__toggle");
  const more = document.querySelector(".about__more");
  if (!btn || !more) return;
  const dict = window.I18N[document.documentElement.lang] || {};
  const key = more.hidden ? "about.more" : "about.less";
  btn.dataset.i18n = key;
  if (dict[key]) btn.textContent = dict[key];
}

function initAbout() {
  const btn = document.querySelector(".about__toggle");
  const more = document.querySelector(".about__more");
  if (!btn || !more) return;
  btn.addEventListener("click", () => {
    more.hidden = !more.hidden;
    syncAboutToggle();
  });
}

/* ---------- burger menu (phones) ---------- */
function initBurger() {
  const nav = document.querySelector(".nav");
  const btn = nav?.querySelector(".nav__burger");
  const menu = document.getElementById("nav-menu");
  if (!nav || !btn || !menu) return;

  const setOpen = (open) => {
    nav.classList.toggle("nav--open", open);
    btn.setAttribute("aria-expanded", String(open));
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains("nav--open"));
  });
  // any destination closes it — the panel covers the page underneath
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- swipeable video rows: "3 / 9" next to the heading ---------- */
function initCarouselCounters() {
  document.querySelectorAll(".vgrid").forEach((grid) => {
    const head = grid.previousElementSibling;
    if (!head || !head.classList.contains("sub-head")) return;

    const cards = [...grid.children];
    const out = document.createElement("span");
    out.className = "sub-head__count";
    head.appendChild(out);

    const sync = () => {
      // horizontal only: on the desktop grid every card shares the same offsetLeft row
      const scrollable = grid.scrollWidth - grid.clientWidth > 8;
      out.hidden = !scrollable;
      if (!scrollable) return;
      const i = cards.findIndex((c) => c.offsetLeft - grid.scrollLeft >= -4);
      out.textContent = `${(i < 0 ? cards.length : i + 1)} / ${cards.length}`;
    };
    grid.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    sync();
  });
}

/* ---------- copy-to-clipboard buttons (data-copy="<target id>") ---------- */
function initCopy() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const src = document.getElementById(btn.dataset.copy);
    if (!src) return;

    btn.addEventListener("click", async () => {
      const text = src.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // insecure origin or denied — select the text so ctrl+C still works
        const range = document.createRange();
        range.selectNodeContents(src);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      btn.classList.add("is-copied");
      setTimeout(() => btn.classList.remove("is-copied"), 1600);
    });
  });
}

/* ---------- sticky book bar: only between the hero and the booking block ---------- */
function initBookBar() {
  const bar = document.querySelector(".bookbar");
  if (!bar || !("IntersectionObserver" in window)) return;

  const zones = ["hero", "booking"].map((id) => document.getElementById(id)).filter(Boolean);
  if (!zones.length) return;

  // added from JS, never in the markup: without JS the bar just stays visible
  bar.classList.add("bookbar--off");

  const onScreen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? onScreen.add(en.target) : onScreen.delete(en.target)));
    bar.classList.toggle("bookbar--off", onScreen.size > 0);
  }, { threshold: 0 });

  zones.forEach((z) => io.observe(z));
}

/* ---------- reveal blocks as they scroll in ---------- */
function initReveal() {
  const targets = document.querySelectorAll(
    ".section__head, .about, .prose, .clip, .sub-head, .vgrid, .countries, .shots, .gallery, .label, .links, .contacts, .booking__line"
  );
  if (!("IntersectionObserver" in window)) return;

  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);           // one-shot: no flicker on the way back up
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  targets.forEach((el) => io.observe(el));
}

/* ---------- lightbox: photos + YouTube (loaded only on click) ---------- */
function initLightbox() {
  const lb = document.getElementById("lb");
  if (!lb) return;
  const stage = lb.querySelector(".lb__stage");
  const prevBtn = lb.querySelector(".lb__nav--prev");
  const nextBtn = lb.querySelector(".lb__nav--next");
  const cap = lb.querySelector(".lb__cap");
  const count = lb.querySelector(".lb__count");

  let group = [];   // sibling images for arrow navigation
  let index = 0;

  const showImage = () => {
    const src = group[index];
    const img = document.createElement("img");
    img.src = src.src;
    img.alt = src.alt || "";
    stage.replaceChildren(img);
    if (cap) cap.textContent = src.alt || "";
    if (count) count.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : "";
  };

  const openImages = (siblings, i) => {
    group = siblings;
    index = i;
    lb.classList.remove("lb--video");
    prevBtn.hidden = nextBtn.hidden = group.length < 2;
    showImage();
    openLb();
  };

  const openVideo = (id) => {
    group = [];
    lb.classList.add("lb--video");
    prevBtn.hidden = nextBtn.hidden = true;
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
    frame.title = "AGENTBOY";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allowFullscreen = true;
    stage.replaceChildren(frame);
    openLb();
  };

  const openLb = () => {
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lb.hidden = true;
    stage.innerHTML = "";      // kills the iframe -> stops playback
    document.body.style.overflow = "";
  };
  const step = (d) => {
    if (!group.length) return;
    index = (index + d + group.length) % group.length;
    showImage();
  };

  // gallery photos
  document.querySelectorAll(".shots").forEach((grid) => {
    const imgs = [...grid.querySelectorAll("img")];
    imgs.forEach((img, i) =>
      img.closest("button").addEventListener("click", () => openImages(imgs, i))
    );
  });

  // event posters — figures, made keyboard-operable here rather than in markup
  document.querySelectorAll(".gallery").forEach((grid) => {
    const figs = [...grid.querySelectorAll(".poster")];
    const imgs = figs.map((f) => f.querySelector("img"));
    figs.forEach((fig, i) => {
      fig.setAttribute("role", "button");
      fig.setAttribute("tabindex", "0");
      fig.addEventListener("click", () => openImages(imgs, i));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openImages(imgs, i); }
      });
    });
  });

  // YouTube cards
  document.querySelectorAll("[data-yt]").forEach((el) =>
    el.addEventListener("click", () => openVideo(el.dataset.yt))
  );

  lb.querySelector(".lb__close").addEventListener("click", closeLb);
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); step(1); });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === stage) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // swipe: on a phone the arrows are a fallback, the gesture is the real control
  let x0 = null, y0 = null;
  lb.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = y0 = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;  // ignore vertical drags
    step(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* ---------- misc ---------- */
function initChrome() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("nav--solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

buildLangMenu();
initBurger();
initAbout();
initLightbox();
initCarouselCounters();
initBookBar();
initCopy();
initReveal();
initChrome();
setLang(initialLang());
