const root = document.documentElement;
const THEME_KEY = "owlsetup-theme";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// ---------- Thème ----------

function resolvedTheme() {
  const forced = root.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return systemDark.matches ? "dark" : "light";
}

function syncTheme() {
  const theme = resolvedTheme();
  root.dataset.resolvedTheme = theme;
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre");
  });
}

document.querySelectorAll("[data-theme-toggle]").forEach((button) =>
  button.addEventListener("click", () => {
    const next = resolvedTheme() === "dark" ? "light" : "dark";
    // Revenir au thème du système efface le choix : le site le suit à nouveau.
    const matchesSystem = next === (systemDark.matches ? "dark" : "light");
    try {
      if (matchesSystem) localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {}
    if (matchesSystem) delete root.dataset.theme;
    else root.dataset.theme = next;
    syncTheme();
  }),
);
systemDark.addEventListener("change", syncTheme);
syncTheme();

// ---------- Menu mobile ----------

const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const siteNav = document.getElementById("site-nav");

function setMenu(open: boolean) {
  siteNav?.classList.toggle("is-open", open);
  menuButton?.setAttribute("aria-expanded", String(open));
  menuButton?.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}

menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
siteNav?.addEventListener("click", (event) => {
  if ((event.target as Element).closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

// ---------- Copie dans le presse-papiers ----------

const toast = document.getElementById("site-toast");
let toastTimer: number | undefined;

function showToast(message: string) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) =>
  button.addEventListener("click", async () => {
    const value = button.dataset.copy ?? "";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    button.classList.add("is-copied");
    setTimeout(() => button.classList.remove("is-copied"), 1600);
    showToast(button.dataset.copyMessage ?? "Copié");
  }),
);

// ---------- Apparition au défilement ----------

const revealed = document.querySelectorAll<HTMLElement>("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );
  revealed.forEach((element) => observer.observe(element));
} else {
  revealed.forEach((element) => element.classList.add("is-visible"));
}
