/* Global Light / Dark / Auto theme controller. */
(function () {
    "use strict";

    const STORAGE_KEY = "nipun-khora:theme-preference";
    const PREFERENCES = ["light", "dark", "auto"];
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let preference = "auto";
    let menuButton;
    let menu;

    function readPreference() {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return PREFERENCES.includes(stored) ? stored : "auto";
        } catch (error) {
            return "auto";
        }
    }

    function effectiveTheme(value) {
        return value === "auto" ? (mediaQuery.matches ? "dark" : "light") : value;
    }

    function applyTheme() {
        const theme = effectiveTheme(preference);
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.themePreference = preference;
    }

    function savePreference(value) {
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch (error) {
            // The current page still works when storage is unavailable.
        }
    }

    function preferenceLabel(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function updateMenu() {
        if (!menuButton || !menu) return;

        menuButton.setAttribute("aria-label", `Theme: ${preferenceLabel(preference)}`);
        menu.querySelectorAll("[data-theme-choice]").forEach((item) => {
            const selected = item.dataset.themeChoice === preference;
            item.setAttribute("aria-checked", String(selected));
            item.classList.toggle("is-selected", selected);
            item.querySelector(".theme-check").textContent = selected ? "✓" : "";
        });
    }

    function closeMenu(restoreFocus) {
        if (!menu || menu.hidden) return;
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        if (restoreFocus) menuButton.focus();
    }

    function openMenu() {
        menu.hidden = false;
        menuButton.setAttribute("aria-expanded", "true");
        const selected = menu.querySelector(`[data-theme-choice="${preference}"]`);
        (selected || menu.querySelector("[data-theme-choice]")).focus();
    }

    function setPreference(value) {
        if (!PREFERENCES.includes(value)) return;
        preference = value;
        savePreference(value);
        applyTheme();
        updateMenu();
        closeMenu(true);
    }

    function moveFocus(event) {
        const items = [...menu.querySelectorAll("[data-theme-choice]")];
        const current = items.indexOf(document.activeElement);
        if (!items.length || current < 0) return;

        event.preventDefault();
        let next = current;
        if (event.key === "ArrowDown") next = (current + 1) % items.length;
        if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = items.length - 1;
        items[next].focus();
    }

    function createControl() {
        const nav = document.querySelector("header nav");
        if (!nav || nav.querySelector(".theme-control")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "theme-control";

        menuButton = document.createElement("button");
        menuButton.type = "button";
        menuButton.className = "theme-button";
        menuButton.setAttribute("aria-haspopup", "menu");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.innerHTML = '<span class="theme-button-icon" aria-hidden="true">◐</span><span class="theme-button-text">Theme</span>';

        menu = document.createElement("div");
        menu.className = "theme-menu";
        menu.setAttribute("role", "menu");
        menu.hidden = true;
        menu.innerHTML = [
            ["light", "☼", "Light"],
            ["dark", "☾", "Dark"],
            ["auto", "▣", "Auto"]
        ].map(([value, icon, label]) => `
            <button type="button" role="menuitemradio" aria-checked="false" data-theme-choice="${value}">
                <span class="theme-choice-icon" aria-hidden="true">${icon}</span>
                <span>${label}</span>
                <span class="theme-check" aria-hidden="true"></span>
            </button>`).join("");

        wrapper.append(menuButton, menu);
        nav.appendChild(wrapper);

        menuButton.addEventListener("click", () => {
            if (menu.hidden) openMenu();
            else closeMenu(false);
        });

        menu.querySelectorAll("[data-theme-choice]").forEach((item) => {
            item.addEventListener("click", () => setPreference(item.dataset.themeChoice));
            item.addEventListener("keydown", (event) => {
                if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) moveFocus(event);
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeMenu(true);
                }
            });
        });

        menuButton.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMenu();
            }
            if (event.key === "Escape") closeMenu(false);
        });

        document.addEventListener("click", (event) => {
            if (!wrapper.contains(event.target)) closeMenu(false);
        });

        updateMenu();
    }

    function handleSystemChange() {
        if (preference === "auto") applyTheme();
    }

    preference = readPreference();
    applyTheme();

    if (mediaQuery.addEventListener) mediaQuery.addEventListener("change", handleSystemChange);
    else mediaQuery.addListener(handleSystemChange);

    document.addEventListener("DOMContentLoaded", createControl, { once: true });
}());
