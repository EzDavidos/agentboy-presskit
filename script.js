// AGENTBOY press kit (demo) — minimal JS

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Shrink/darken nav after scrolling past hero
const nav = document.querySelector(".nav");
const onScroll = () => {
  if (window.scrollY > 40) nav.style.background = "rgba(10,10,12,.92)";
  else nav.style.background = "";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
