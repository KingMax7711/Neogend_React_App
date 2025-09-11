const THEMES = ["neogendMain"];
const FALLBACK = "neogendMain";

export function getTheme() {
    const saved =
        typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    return THEMES.includes(saved) ? saved : FALLBACK;
}

export function setTheme(theme) {
    const next = THEMES.includes(theme) ? theme : FALLBACK;
    try {
        localStorage.setItem("theme", next);
    } catch {
        // ignore write errors (e.g., private mode or disabled storage)
    }
    document.documentElement.setAttribute("data-theme", next);
    return next;
}

export function toggleTheme() {
    const current = getTheme();
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    return setTheme(next);
}

export function initTheme() {
    // Ensure HTML has the correct theme on boot
    setTheme(getTheme());
}

export function nextTheme() {
    const current = getTheme();
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    return next;
}
