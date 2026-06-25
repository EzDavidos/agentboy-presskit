// AGENTBOY press kit (demo) — minimal JS

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Darken nav background after leaving the hero
const nav = document.querySelector(".nav");
const onScroll = () => {
  nav.style.background = window.scrollY > 40 ? "rgba(10,10,12,.92)" : "";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
