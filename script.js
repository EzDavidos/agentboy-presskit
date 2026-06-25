// AGENTBOY press kit (demo) — minimal JS

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Shrink/darken nav after scrolling past hero + reveal orange fog on scroll
const nav = document.querySelector(".nav");
const fog = document.querySelector(".fog");

const onScroll = () => {
  const y = window.scrollY;

  // nav background after leaving hero
  nav.style.background = y > 40 ? "rgba(10,10,12,.92)" : "";

  // fog density: ~0 on the hero, ramps to 1 over the first ~1.6 viewports,
  // so the orange haze softly drifts in as you scroll the page.
  const start = window.innerHeight * 0.35;
  const span = window.innerHeight * 1.6;
  const fogVal = Math.min(1, Math.max(0, (y - start) / span));
  fog.style.setProperty("--fog", fogVal.toFixed(3));
};

// rAF-throttled for smoothness
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }
}, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
onScroll();
