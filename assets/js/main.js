/* ==========================================================================
   EstatePro - main.js
   --------------------------------------------------------------------------
   All project scripts in one file. Every part only runs when the page has
   the elements it needs, so it is safe to load this file on every page.

     PART 1  Theme engine       theme, color, font, layout (runs immediately)
     PART 2  App shell          sidebar, header, customizer, search, toasts
     PART 3  Dashboard charts   needs Chart.js (assets/js/chart.umd.min.js)
     PART 4  Dashboard widgets  greeting, activity filters, property table
     PART 5  Property list      filters, grid / list view, favorites
     PART 6  Tables             search, filter, sort, pagination, export
     PART 7  Forms              validation, photo preview
     PART 8  Gallery            viewer, details gallery, gallery manager
     PART 9  Catalog            property types and amenities
     PART 10 Rentals            rent calendar, application review, lease forms, deposits
     PART 11 Sales              deal pipeline board, closing checklist
     PART 12 Leads              follow-up tasks, viewing status
     PART 13 Maintenance        assign a vendor, inspection checklist
     PART 14 Finance            invoice line items, approve / pay buttons, payment form
     PART 15 Communication      chat, email, SMS, notification center, templates
     PART 16 Reports            charts drawn from data attributes, date range, export
     PART 17 Settings and login    password fields, 2FA code boxes, permissions, tags, integrations
     PART 18 Calendar           events calendar (month, week, day, list)

   Load it in the <head> (no defer). PART 1 then applies the saved theme
   before the page paints, so there is no flash of the wrong theme.
   Bootstrap's bundle is loaded at the end of the page, which is fine
   because every part waits for DOMContentLoaded before using it.
   ========================================================================== */




/* ##########################################################################
   PART 1: THEME ENGINE
   theme mode, color, font, layout settings, presets, localStorage
   (this part used to be theme.js)
   ########################################################################## */



(function () {
  "use strict";


  /* ------------------------------------------------------------------------
     1. Defaults and storage key
     ------------------------------------------------------------------------ */
  var STORAGE_KEY = "estatepro-settings";

  var DEFAULTS = {
    mode: "light",            // light | dark | system
    color: "#2563eb",         // primary color (any hex)
    font: "Inter",
    fontSize: "default",      // small | default | large
    sidebar: "dark",          // light | dark | primary
    sidebarState: "expanded", // expanded | collapsed
    container: "fluid",       // fluid | boxed
    header: "fixed",          // fixed | static
    sidebarPosition: "fixed", // fixed | static
    density: "comfortable",   // comfortable | compact
    radius: "medium"          // sharp | medium | rounded
  };



  /* ------------------------------------------------------------------------
     2. Presets (Customizer > Presets)
     Each preset only lists what it changes, the rest stays as the user had it.
     ------------------------------------------------------------------------ */
  var PRESETS = {
    default:   { color: "#2563eb", mode: "light", sidebar: "dark",    radius: "medium" },
    ocean:     { color: "#0891b2", mode: "light", sidebar: "dark",    radius: "rounded" },
    indigo:    { color: "#4f46e5", mode: "light", sidebar: "light",   radius: "medium" },
    emerald:   { color: "#059669", mode: "light", sidebar: "dark",    radius: "medium" },
    sunset:    { color: "#ea580c", mode: "light", sidebar: "dark",    radius: "rounded" },
    corporate: { color: "#1e40af", mode: "light", sidebar: "light",   radius: "sharp" },
    luxury:    { color: "#b08d57", mode: "light", sidebar: "dark",    radius: "sharp" },
    darkestate:{ color: "#60a5fa", mode: "dark",  sidebar: "dark",    radius: "medium" }
  };



  /* ------------------------------------------------------------------------
     3. Read and write saved settings
     ------------------------------------------------------------------------ */
  function loadSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Object.assign({}, DEFAULTS, saved);
    } catch (err) {
      // Private mode or corrupted JSON, just fall back to defaults
      return Object.assign({}, DEFAULTS);
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      /* storage is blocked, settings simply won't persist */
    }
  }

  var settings = loadSettings();



  /* ------------------------------------------------------------------------
     4. Small color helpers
     Used to build the hover shade and the soft tint from one chosen color.
     ------------------------------------------------------------------------ */
  function hexToRgb(hex) {
    var clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map(function (c) { return c + c; }).join("");
    }
    var num = parseInt(clean, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  // Positive amount lightens, negative darkens (range -1 to 1)
  function shade(hex, amount) {
    var rgb = hexToRgb(hex);
    function adjust(channel) {
      var value = amount < 0 ? channel * (1 + amount) : channel + (255 - channel) * amount;
      return Math.round(Math.min(255, Math.max(0, value)));
    }
    return "rgb(" + adjust(rgb.r) + "," + adjust(rgb.g) + "," + adjust(rgb.b) + ")";
  }



  /* ------------------------------------------------------------------------
     5. Apply settings to the page
     Everything is done through attributes and CSS variables on <html>,
     so no component needs to know about the customizer.
     ------------------------------------------------------------------------ */
  var root = document.documentElement;
  var systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function applyMode() {
    // "system" means we follow whatever the operating system is using
    var resolved = settings.mode;
    if (settings.mode === "system") {
      resolved = systemQuery.matches ? "dark" : "light";
    }
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-bs-theme", resolved);   // Bootstrap forms, tables and text follow dark mode
    root.setAttribute("data-theme-mode", settings.mode);
  }

  function applyColor() {
    var rgb = hexToRgb(settings.color);
    root.style.setProperty("--primary-color", settings.color);
    root.style.setProperty("--primary-hover", shade(settings.color, -0.15));
    root.style.setProperty("--primary-soft", "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.1)");
    root.style.setProperty("--primary-rgb", rgb.r + "," + rgb.g + "," + rgb.b);
  }

  function applyFont() {
    root.style.setProperty("--font-family", '"' + settings.font + '", system-ui, sans-serif');
  }

  function applyLayout() {
    root.setAttribute("data-font-size", settings.fontSize);
    root.setAttribute("data-sidebar", settings.sidebar);
    root.setAttribute("data-sidebar-state", settings.sidebarState);
    root.setAttribute("data-container", settings.container);
    root.setAttribute("data-header", settings.header);
    root.setAttribute("data-sidebar-position", settings.sidebarPosition);
    root.setAttribute("data-density", settings.density);
    root.setAttribute("data-radius", settings.radius);
  }

  function applyAll() {
    applyMode();
    applyColor();
    applyFont();
    applyLayout();
  }



  /* ------------------------------------------------------------------------
     6. Public API
     The customizer panel in components.js calls these. Charts listen for
     the "estatepro:themechange" event so they can redraw with new colors.
     ------------------------------------------------------------------------ */
  function announceChange() {
    document.dispatchEvent(new CustomEvent("estatepro:themechange", { detail: settings }));
  }

  window.EstateTheme = {

    // Change one setting, for example set("mode", "dark")
    set: function (key, value) {
      settings[key] = value;
      saveSettings(settings);
      applyAll();
      announceChange();
    },

    get: function (key) {
      return settings[key];
    },

    // Apply one of the named presets above
    applyPreset: function (name) {
      if (!PRESETS[name]) return;
      Object.assign(settings, PRESETS[name]);
      saveSettings(settings);
      applyAll();
      announceChange();
    },

    // Reset Settings button
    reset: function () {
      settings = Object.assign({}, DEFAULTS);
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
      root.removeAttribute("style");   // clears the inline color variables
      applyAll();
      announceChange();
    }
  };



  /* ------------------------------------------------------------------------
     7. Run on load, and keep "system" mode in sync with the OS
     ------------------------------------------------------------------------ */
  applyAll();

  systemQuery.addEventListener("change", function () {
    if (settings.mode === "system") {
      applyMode();
      announceChange();
    }
  });

})();




/* ##########################################################################
   PART 2: APP SHELL
   sidebar, header, customizer, search palette, toasts
   (this part used to be app.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");
  var toggleBtn = document.getElementById("sidebarToggle");

  // Login, error and documentation pages have no sidebar, so this whole part is skipped there
  if (!sidebar) return;


  /* ------------------------------------------------------------------------
     1. Sidebar toggle
     Desktop: collapse / expand and remember it.
     Mobile: slide the drawer in and out with an overlay.
     ------------------------------------------------------------------------ */
  function isMobile() {
    return window.innerWidth < 992;
  }

  function closeMobileSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
  }

  toggleBtn.addEventListener("click", function () {
    if (isMobile()) {
      sidebar.classList.toggle("is-open");
      overlay.classList.toggle("is-open");
    } else {
      var next = EstateTheme.get("sidebarState") === "collapsed" ? "expanded" : "collapsed";
      EstateTheme.set("sidebarState", next);
    }
  });

  overlay.addEventListener("click", closeMobileSidebar);



  /* ------------------------------------------------------------------------
     2. Tooltips on sidebar icons
     Bootstrap tooltips, only shown while the sidebar is collapsed.
     ------------------------------------------------------------------------ */
  document.querySelectorAll(".sidebar .nav-link-item").forEach(function (link) {
    var label = link.querySelector(".nav-label");
    link.setAttribute("title", label ? label.textContent.trim() : "");
    new bootstrap.Tooltip(link, { placement: "right", trigger: "hover" });
  });

  // Tooltips are pointless on an expanded sidebar, so only enable them when collapsed
  function syncTooltips() {
    var collapsed = EstateTheme.get("sidebarState") === "collapsed";
    document.querySelectorAll(".sidebar .nav-link-item").forEach(function (link) {
      var tip = bootstrap.Tooltip.getInstance(link);
      if (tip) { collapsed ? tip.enable() : tip.disable(); }
    });
  }

  syncTooltips();
  document.addEventListener("estatepro:themechange", syncTooltips);



  /* ------------------------------------------------------------------------
     3. Customizer panel
     Any button with data-setting="key" data-value="value" updates that
     setting. The color picker, font list and preset list have their own hooks.
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-setting]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      EstateTheme.set(btn.dataset.setting, btn.dataset.value);
      markActiveButtons();
    });
  });

  document.querySelectorAll("[data-color]").forEach(function (swatch) {
    swatch.addEventListener("click", function () {
      EstateTheme.set("color", swatch.dataset.color);
    });
  });

  var colorPicker = document.getElementById("customColor");
  colorPicker.addEventListener("input", function () {
    EstateTheme.set("color", colorPicker.value);
  });

  var fontSelect = document.getElementById("fontSelect");
  fontSelect.value = EstateTheme.get("font");
  fontSelect.addEventListener("change", function () {
    EstateTheme.set("font", fontSelect.value);
  });

  document.querySelectorAll("[data-preset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      EstateTheme.applyPreset(btn.dataset.preset);
      colorPicker.value = EstateTheme.get("color");
      markActiveButtons();
    });
  });

  document.getElementById("resetSettings").addEventListener("click", function () {
    EstateTheme.reset();
    showToast("Settings reset to default.", "success");
    fontSelect.value = EstateTheme.get("font");
    colorPicker.value = EstateTheme.get("color");
    markActiveButtons();
  });



  /* ------------------------------------------------------------------------
     4. Highlight the currently selected option in the customizer
     ------------------------------------------------------------------------ */
  function markActiveButtons() {
    document.querySelectorAll("[data-setting]").forEach(function (btn) {
      var isActive = EstateTheme.get(btn.dataset.setting) === btn.dataset.value;
      btn.classList.toggle("active", isActive);
    });
  }

  markActiveButtons();



  /* ------------------------------------------------------------------------
     5. Header: dark mode toggle
     Flips between light and dark, and swaps the moon / sun icon.
     ------------------------------------------------------------------------ */
  var themeIcon = document.getElementById("themeIcon");

  function syncThemeIcon() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeIcon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
  }

  document.getElementById("themeToggle").addEventListener("click", function () {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    EstateTheme.set("mode", isDark ? "light" : "dark");
    markActiveButtons();
  });

  syncThemeIcon();
  document.addEventListener("estatepro:themechange", syncThemeIcon);



  /* ------------------------------------------------------------------------
     6. Header: fullscreen
     ------------------------------------------------------------------------ */
  document.getElementById("fullscreenBtn").addEventListener("click", function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });



  /* ------------------------------------------------------------------------
     7. Header: notifications (mark all as read)
     ------------------------------------------------------------------------ */
  document.getElementById("markAllRead").addEventListener("click", function () {
    document.querySelectorAll(".notice-item.unread").forEach(function (item) {
      item.classList.remove("unread");
    });
    document.getElementById("notifDot").style.display = "none";
    showToast("All notifications marked as read.", "success");
  });



  /* ------------------------------------------------------------------------
     8. Header: language menu
     Only remembers the choice for now. Hook your translation files in here.
     ------------------------------------------------------------------------ */
  var languageItems = document.querySelectorAll("#languageMenu [data-lang]");
  var savedLang = localStorage.getItem("estatepro-lang") || "en";

  var currentFlag = document.getElementById("currentFlag");

  // Highlights the chosen language and shows its flag on the header button
  function markLanguage(code) {
    languageItems.forEach(function (item) {
      var isChosen = item.dataset.lang === code;
      item.classList.toggle("active", isChosen);
      if (isChosen) currentFlag.className = "flag flag-" + item.dataset.flag;
    });
  }

  languageItems.forEach(function (item) {
    item.addEventListener("click", function () {
      localStorage.setItem("estatepro-lang", item.dataset.lang);
      document.documentElement.setAttribute("lang", item.dataset.lang);
      markLanguage(item.dataset.lang);
      showToast("Language set to " + item.querySelector(".menu-title").textContent + ".", "info");
    });
  });

  markLanguage(savedLang);



  /* ------------------------------------------------------------------------
     9. Sidebar: opening a submenu while collapsed expands the sidebar first
     ------------------------------------------------------------------------ */
  document.querySelectorAll(".has-sub").forEach(function (parent) {
    parent.addEventListener("click", function () {
      if (!isMobile() && EstateTheme.get("sidebarState") === "collapsed") {
        EstateTheme.set("sidebarState", "expanded");
      }
    });
  });



  /* ------------------------------------------------------------------------
     10. Keep customizer buttons in sync with every change
     (for example when the sidebar toggle in the header collapses the menu)
     ------------------------------------------------------------------------ */
  document.addEventListener("estatepro:themechange", markActiveButtons);



  /* ------------------------------------------------------------------------
     11. Toast messages
     Usage: showToast("Property added successfully.", "success")
     Types: success, error, warning, info
     ------------------------------------------------------------------------ */
  function showToast(message, type) {
    var box = document.getElementById("toastBox");
    var el = document.createElement("div");

    el.className = "toast toast-" + (type || "info");
    el.setAttribute("role", "status");
    el.innerHTML =
      '<div class="d-flex">' +
        '<div class="toast-body">' + message + '</div>' +
        '<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>' +
      '</div>';

    box.appendChild(el);
    el.addEventListener("hidden.bs.toast", function () { el.remove(); });
    new bootstrap.Toast(el, { delay: 3500 }).show();
  }

  window.showToast = showToast;   // other parts of this file can call it



  /* ------------------------------------------------------------------------
     12. Global search palette (Ctrl + K)
     Demo items only. Replace paletteItems with results from your backend.
     ------------------------------------------------------------------------ */
  var paletteItems = [
    { type: "Property",    title: "The Grand Oak Residence",   sub: "214 Oak Avenue, Austin, TX",       icon: "bi-building" },
    { type: "Property",    title: "Parkview Heights",          sub: "88 Park Lane, Denver, CO",         icon: "bi-buildings" },
    { type: "Property",    title: "Riverside Apartments",      sub: "12 River Road, Portland, OR",      icon: "bi-building-check" },
    { type: "Unit",        title: "Unit 4B, Grand Oak",        sub: "2 bed, 2 bath, $1,850 per month",  icon: "bi-door-open" },
    { type: "Tenant",      title: "Michael Anderson",          sub: "Unit 4B, The Grand Oak Residence", icon: "bi-person" },
    { type: "Tenant",      title: "Sophia Williams",           sub: "Unit 12A, Parkview Heights",       icon: "bi-person" },
    { type: "Agent",       title: "Olivia Parker",             sub: "14 active listings",               icon: "bi-person-badge" },
    { type: "Agent",       title: "Ethan Wilson",              sub: "9 active listings",                icon: "bi-person-badge" },
    { type: "Lease",       title: "LS-2026-0142",              sub: "Michael Anderson, ends Mar 2027",  icon: "bi-file-earmark-text" },
    { type: "Invoice",     title: "INV-10482",                 sub: "$1,850, paid",                     icon: "bi-receipt" },
    { type: "Invoice",     title: "INV-10497",                 sub: "$2,150, pending",                  icon: "bi-receipt" },
    { type: "Maintenance", title: "MR-3021 Leaking faucet",    sub: "Maple Grove Villas 2D",            icon: "bi-wrench-adjustable" }
  ];

  // Where each result type opens (detail pages)
  // "" on the dashboard, "../../" on pages inside pages/<section>/ (set on <body data-base>)
  var base = document.body.dataset.base || "";

  var paletteLinks = {
    Property:    "pages/properties/property-details.html",
    Unit:        "pages/units/unit-details.html",
    Tenant:      "pages/tenants/tenant-profile.html",
    Agent:       "pages/agents/agent-profile.html",
    Lease:       "pages/leases/lease-details.html",
    Invoice:     "pages/finance/invoice-details.html",
    Maintenance: "pages/maintenance/maintenance-details.html"
  };

  var searchModalEl = document.getElementById("searchModal");
  var searchModal = new bootstrap.Modal(searchModalEl);
  var paletteInput = document.getElementById("paletteInput");
  var paletteList = document.getElementById("paletteList");

  function renderPalette(query) {
    var q = query.trim().toLowerCase();

    var matches = paletteItems.filter(function (item) {
      return (item.title + " " + item.sub + " " + item.type).toLowerCase().indexOf(q) !== -1;
    });

    if (!matches.length) {
      paletteList.innerHTML =
        '<div class="palette-empty"><i class="bi bi-search fs-3 d-block mb-2"></i>' +
        'No results found. Try a property name, tenant or invoice number.</div>';
      return;
    }

    paletteList.innerHTML = matches.map(function (item) {
      return '<a href="' + base + paletteLinks[item.type] + '" class="palette-item">' +
               '<span class="thumb"><i class="bi ' + item.icon + '"></i></span>' +
               '<span><span class="cell-main d-block">' + item.title + '</span>' +
               '<span class="cell-sub d-block">' + item.sub + '</span></span>' +
               '<span class="palette-type">' + item.type + '</span>' +
             '</a>';
    }).join("");
  }

  paletteInput.addEventListener("input", function () { renderPalette(paletteInput.value); });

  // Picking a result closes the palette (link it to the real page in your backend)
  paletteList.addEventListener("click", function (e) {
    if (e.target.closest(".palette-item")) searchModal.hide();
  });

  searchModalEl.addEventListener("shown.bs.modal", function () {
    paletteInput.value = "";
    renderPalette("");
    paletteInput.focus();
  });

  // Click on the header search box, or press Ctrl + K (Cmd + K on Mac)
  document.getElementById("headerSearch").addEventListener("click", function () { searchModal.show(); });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchModal.show();
    }
  });



  /* ------------------------------------------------------------------------
     13. Demo links
     Links that point to "#" are placeholders, so stop them from jumping the
     page to the top. Remove this block once every link has a real address.
     ------------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="#"]');
    if (link) e.preventDefault();
  });



  /* ------------------------------------------------------------------------
     14. Demo buttons
     <button data-toast="Downloaded." data-toast-type="success"> shows a toast.
     Replace with real actions when you connect a backend.
     ------------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-toast]");
    if (trigger) showToast(trigger.dataset.toast, trigger.dataset.toastType || "info");
  });

});




/* ##########################################################################
   PART 3: DASHBOARD CHARTS
   Chart.js charts on the home dashboard
   (this part used to be charts.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  // Only run on the page that has this part
  if (!document.getElementById("revenueChart")) return;

  var charts = {};   // keeps each chart so it can be destroyed before a redraw



  /* ------------------------------------------------------------------------
     1. Theme colors, read from CSS
     ------------------------------------------------------------------------ */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function themeColors() {
    return {
      primary: cssVar("--primary-color"),
      rgb: cssVar("--primary-rgb"),
      soft: "rgba(" + cssVar("--primary-rgb") + ", 0.12)",
      text: cssVar("--muted-text"),
      grid: cssVar("--border-color"),
      success: cssVar("--success-color"),
      warning: cssVar("--warning-color"),
      danger: cssVar("--danger-color"),
      info: cssVar("--info-color"),
      card: cssVar("--card-bg")
    };
  }



  /* ------------------------------------------------------------------------
     2. Demo data (replace with real data from your backend)
     ------------------------------------------------------------------------ */
  var revenueData = {
    monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      collected: [182, 190, 198, 205, 212, 219, 224, 231, 236, 241, 245, 249],
      pending: [24, 21, 19, 22, 18, 17, 20, 16, 15, 14, 13, 12]
    },
    quarterly: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      collected: [570, 636, 691, 735],
      pending: [64, 57, 51, 39]
    },
    yearly: {
      labels: ["2022", "2023", "2024", "2025", "2026"],
      collected: [1850, 2240, 2520, 2710, 2830],
      pending: [210, 188, 170, 152, 135]
    }
  };

  // Order: Occupied, Vacant, Reserved, Under Maintenance
  var occupancyData = {
    month:   [412, 38, 21, 9],
    quarter: [405, 44, 24, 7],
    year:    [388, 52, 29, 11]
  };

  var portfolio = {
    labels: ["Residential", "Commercial", "Office", "Retail", "Industrial", "Land"],
    values: [34, 18, 12, 10, 7, 5]
  };

  var rent = [221.4, 12.5, 9.9, 4.9];   // Collected, Pending, Overdue, Partially Paid ($K)

  var maintenance = {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    created: [31, 28, 35, 26, 29, 27],
    completed: [29, 27, 33, 27, 28, 25]
  };



  /* ------------------------------------------------------------------------
     3. Helpers
     ------------------------------------------------------------------------ */

  // Create a chart, destroying the old one first so redraws never stack
  function build(id, config) {
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(document.getElementById(id), config);
  }

  function legendBottom() {
    return { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } };
  }

  var baseOptions = { responsive: true, maintainAspectRatio: false };



  /* ------------------------------------------------------------------------
     4. Individual charts
     ------------------------------------------------------------------------ */
  function drawRevenue() {
    var c = themeColors();
    var d = revenueData[document.getElementById("revenueFilter").value];

    build("revenueChart", {
      type: "line",
      data: {
        labels: d.labels,
        datasets: [
          { label: "Collected rent ($K)", data: d.collected, borderColor: c.primary, backgroundColor: c.soft,
            fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
          { label: "Pending rent ($K)", data: d.pending, borderColor: c.warning, backgroundColor: "transparent",
            tension: 0.4, pointRadius: 0, borderWidth: 2 }
        ]
      },
      options: Object.assign({}, baseOptions, {
        interaction: { mode: "index", intersect: false },
        plugins: { legend: legendBottom() },
        scales: { x: { grid: { display: false } }, y: { grid: { color: c.grid }, border: { display: false } } }
      })
    });
  }

  function drawOccupancy() {
    var c = themeColors();

    build("occupancyChart", {
      type: "doughnut",
      data: {
        labels: ["Occupied", "Vacant", "Reserved", "Under Maintenance"],
        datasets: [{
          data: occupancyData[document.getElementById("occupancyFilter").value],
          backgroundColor: [c.primary, c.danger, c.warning, c.success],
          borderColor: c.card,
          borderWidth: 3
        }]
      },
      options: Object.assign({}, baseOptions, { cutout: "68%", plugins: { legend: legendBottom() } })
    });
  }

  function drawPortfolio() {
    var c = themeColors();
    var shades = [1, 0.85, 0.7, 0.55, 0.4, 0.28];   // one hue, fading, so it follows the primary color

    build("portfolioChart", {
      type: "bar",
      data: {
        labels: portfolio.labels,
        datasets: [{
          data: portfolio.values,
          backgroundColor: shades.map(function (a) { return "rgba(" + c.rgb + "," + a + ")"; }),
          borderRadius: 6
        }]
      },
      options: Object.assign({}, baseOptions, {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: c.grid }, border: { display: false } }, y: { grid: { display: false } } }
      })
    });
  }

  function drawRent() {
    var c = themeColors();

    build("rentChart", {
      type: "doughnut",
      data: {
        labels: ["Collected", "Pending", "Overdue", "Partially Paid"],
        datasets: [{ data: rent, backgroundColor: [c.success, c.warning, c.danger, c.info], borderColor: c.card, borderWidth: 3 }]
      },
      options: Object.assign({}, baseOptions, { cutout: "70%", plugins: { legend: legendBottom() } })
    });
  }

  function drawMaintenance() {
    var c = themeColors();

    build("maintenanceChart", {
      type: "bar",
      data: {
        labels: maintenance.labels,
        datasets: [
          { label: "Created", data: maintenance.created, backgroundColor: c.primary, borderRadius: 4 },
          { label: "Completed", data: maintenance.completed, backgroundColor: c.success, borderRadius: 4 }
        ]
      },
      options: Object.assign({}, baseOptions, {
        plugins: { legend: legendBottom() },
        scales: { x: { grid: { display: false } }, y: { grid: { color: c.grid }, border: { display: false } } }
      })
    });
  }



  /* ------------------------------------------------------------------------
     5. Draw everything, and redraw on filter or theme change
     ------------------------------------------------------------------------ */
  function drawAll() {
    Chart.defaults.font.family = cssVar("--font-family");
    Chart.defaults.color = cssVar("--muted-text");

    drawRevenue();
    drawOccupancy();
    drawPortfolio();
    drawRent();
    drawMaintenance();
  }

  document.getElementById("revenueFilter").addEventListener("change", drawRevenue);
  document.getElementById("occupancyFilter").addEventListener("change", drawOccupancy);
  document.addEventListener("estatepro:themechange", drawAll);

  drawAll();

});




/* ##########################################################################
   PART 4: DASHBOARD WIDGETS
   greeting, activity filters, property table
   (this part used to be dashboard.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  // Only run on the page that has this part
  if (!document.getElementById("greeting")) return;


  /* ------------------------------------------------------------------------
     1. Greeting and today's date
     Picks Morning / Afternoon / Evening from the visitor's clock.
     ------------------------------------------------------------------------ */
  var now = new Date();
  var hour = now.getHours();
  var part = hour < 12 ? "Morning" : (hour < 18 ? "Afternoon" : "Evening");

  document.getElementById("greeting").textContent = "Good " + part + ", Admin";
  document.getElementById("todayDate").textContent = now.toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric", year: "numeric"
  });



  /* ------------------------------------------------------------------------
     2. Recent activity filters
     Each feed item has data-group, each pill has data-filter.
     ------------------------------------------------------------------------ */
  var filterPills = document.querySelectorAll("#feedFilters .pill");
  var feedItems = document.querySelectorAll("#feedList .feed-item");

  filterPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      var wanted = pill.dataset.filter;

      filterPills.forEach(function (other) { other.classList.toggle("active", other === pill); });

      feedItems.forEach(function (item) {
        var show = wanted === "all" || item.dataset.group === wanted;
        item.classList.toggle("d-none", !show);
      });
    });
  });




  /* ------------------------------------------------------------------------
     3. Property performance table: search and sort
     ------------------------------------------------------------------------ */
  var propertyTable = document.getElementById("propertyTable");
  var propertyBody = propertyTable.tBodies[0];
  var propertyEmpty = document.getElementById("propertyEmpty");

  // Search: hide rows that don't match, show the empty message when nothing is left
  document.getElementById("propertySearch").addEventListener("input", function (e) {
    var q = e.target.value.trim().toLowerCase();
    var visible = 0;

    propertyBody.querySelectorAll("tr[data-row]").forEach(function (row) {
      var match = row.textContent.toLowerCase().indexOf(q) !== -1;
      row.classList.toggle("d-none", !match);
      if (match) visible++;
    });

    propertyEmpty.classList.toggle("d-none", visible !== 0);
  });

  // Sort: click a column title, click again to reverse
  propertyTable.querySelectorAll("th[data-sort]").forEach(function (th) {

    function sortByThisColumn() {
      var col = th.cellIndex;
      var isNumber = th.dataset.sort === "num";
      var dir = th.dataset.dir === "asc" ? "desc" : "asc";

      propertyTable.querySelectorAll("th[data-sort]").forEach(function (other) {
        other.removeAttribute("data-dir");
        other.removeAttribute("aria-sort");
      });
      th.dataset.dir = dir;
      th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");

      var rows = Array.from(propertyBody.querySelectorAll("tr[data-row]"));

      rows.sort(function (a, b) {
        var x = a.cells[col].textContent.trim();
        var y = b.cells[col].textContent.trim();

        if (isNumber) {
          x = parseFloat(x.replace(/[^0-9.-]/g, ""));
          y = parseFloat(y.replace(/[^0-9.-]/g, ""));
          return dir === "asc" ? x - y : y - x;
        }
        return dir === "asc" ? x.localeCompare(y) : y.localeCompare(x);
      });

      rows.forEach(function (row) { propertyBody.insertBefore(row, propertyEmpty); });
    }

    th.addEventListener("click", sortByThisColumn);
    th.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortByThisColumn(); }
    });
  });

});




/* ##########################################################################
   PART 5: PROPERTY LIST
   filters, grid and list view, favorites, pagination
   (this part used to be properties.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  // Only run on the page that has this part
  if (!document.getElementById("propertyList")) return;


  /* ------------------------------------------------------------------------
     1. Settings and demo data
     ------------------------------------------------------------------------ */
  var IMAGE_PATH = "assets/images/properties/index.html";
  var TODAY = new Date("2026-10-05");   // "Date added" filter counts back from this day
  var PAGE_SIZE = { grid: 9, list: 6 };

  var properties = [
    { id: 1,  name: "The Grand Oak Residence",   type: "Residential", kind: "Apartment",  address: "214 Oak Avenue",       city: "Austin",     state: "TX", price: 1850,    mode: "rent", beds: 2, baths: 2, area: 1150,  status: "Occupied",          occupancy: 96,   agent: "Olivia Parker", added: "2026-09-28", image: "p1.svg" },
    { id: 2,  name: "Parkview Heights",          type: "Residential", kind: "Apartment",  address: "88 Park Lane",         city: "Denver",     state: "CO", price: 2150,    mode: "rent", beds: 3, baths: 2, area: 1420,  status: "Reserved",          occupancy: 88,   agent: "Ethan Wilson",  added: "2026-09-12", image: "p2.svg" },
    { id: 3,  name: "Riverside Apartments",      type: "Residential", kind: "Apartment",  address: "12 River Road",        city: "Portland",   state: "OR", price: 1620,    mode: "rent", beds: 1, baths: 1, area: 780,   status: "Available",         occupancy: 93,   agent: "Amelia Brooks", added: "2026-10-02", image: "p3.svg" },
    { id: 4,  name: "Skyline Business Center",   type: "Office",      kind: "Office",     address: "500 Main Street",      city: "Chicago",    state: "IL", price: 8400,    mode: "rent", beds: 0, baths: 2, area: 4200,  status: "Under Maintenance", occupancy: 72,   agent: "Noah Bennett",  added: "2026-08-19", image: "p4.svg" },
    { id: 5,  name: "Maple Grove Villas",        type: "Residential", kind: "Villa",      address: "7 Maple Grove Drive",  city: "Raleigh",    state: "NC", price: 685000,  mode: "sale", beds: 4, baths: 3, area: 3100,  status: "Available",         occupancy: null, agent: "Olivia Parker", added: "2026-09-30", image: "p5.svg" },
    { id: 6,  name: "Central Plaza",             type: "Retail",      kind: "Retail",     address: "1200 Central Avenue",  city: "Phoenix",    state: "AZ", price: 6200,    mode: "rent", beds: 0, baths: 1, area: 2800,  status: "Available",         occupancy: 80,   agent: "Ethan Wilson",  added: "2026-09-21", image: "p6.svg" },
    { id: 7,  name: "Harbor View Lofts",         type: "Residential", kind: "Apartment",  address: "45 Pier Street",       city: "Seattle",    state: "WA", price: 2780,    mode: "rent", beds: 2, baths: 2, area: 1260,  status: "Occupied",          occupancy: 100,  agent: "Amelia Brooks", added: "2026-07-30", image: "p7.svg" },
    { id: 8,  name: "Cedar Ridge Townhomes",     type: "Residential", kind: "Townhouse",  address: "310 Cedar Ridge Road", city: "Nashville",  state: "TN", price: 495000,  mode: "sale", beds: 3, baths: 3, area: 1980,  status: "Reserved",          occupancy: null, agent: "Noah Bennett",  added: "2026-10-01", image: "p8.svg" },
    { id: 9,  name: "Lakeside Industrial Park",  type: "Industrial",  kind: "Warehouse",  address: "900 Lakeside Boulevard", city: "Dallas",   state: "TX", price: 12500,   mode: "rent", beds: 0, baths: 2, area: 18000, status: "Occupied",          occupancy: 85,   agent: "Noah Bennett",  added: "2026-06-14", image: "p9.svg" },
    { id: 10, name: "Willow Creek Estate",       type: "Residential", kind: "Villa",      address: "22 Willow Creek Lane", city: "Scottsdale", state: "AZ", price: 1150000, mode: "sale", beds: 5, baths: 4, area: 4600,  status: "Reserved",          occupancy: null, agent: "Olivia Parker", added: "2026-09-05", image: "p10.svg" },
    { id: 11, name: "Downtown Commerce Tower",   type: "Office",      kind: "Office",     address: "75 Peachtree Street",  city: "Atlanta",    state: "GA", price: 14900,   mode: "rent", beds: 0, baths: 4, area: 9500,  status: "Occupied",          occupancy: 91,   agent: "Ethan Wilson",  added: "2026-05-22", image: "p11.svg" },
    { id: 12, name: "Sunset Acres",              type: "Land",        kind: "Land",       address: "Highway 21 Frontage",  city: "Boise",      state: "ID", price: 320000,  mode: "sale", beds: 0, baths: 0, area: 43560, status: "Off Market",        occupancy: null, agent: "Amelia Brooks", added: "2026-04-10", image: "p12.svg" }
  ];

  var STATUS_CLASS = {
    "Available": "status-info",
    "Occupied": "status-success",
    "Reserved": "status-warning",
    "Under Maintenance": "status-danger",
    "Off Market": "status-muted"
  };

  var STATUSES = ["Available", "Occupied", "Reserved", "Under Maintenance", "Off Market"];



  /* ------------------------------------------------------------------------
     2. Current state (filters, sort, view and page)
     ------------------------------------------------------------------------ */
  var state = {
    status: "all", search: "", type: "", city: "", price: "", beds: "", baths: "",
    occupancy: "", agent: "", date: "", sort: "newest", page: 1,
    view: localStorage.getItem("estatepro-prop-view") || "grid"
  };

  var favorites = [];
  try { favorites = JSON.parse(localStorage.getItem("estatepro-favorites")) || []; } catch (err) {}

  var listEl = document.getElementById("propertyList");
  var emptyEl = document.getElementById("emptyState");
  var pagerEl = document.getElementById("pagination");
  var countEl = document.getElementById("resultCount");
  var pillsEl = document.getElementById("statusPills");



  /* ------------------------------------------------------------------------
     3. Small helpers
     ------------------------------------------------------------------------ */
  function money(n) { return "$" + n.toLocaleString("en-US"); }

  function initials(name) {
    return name.split(" ").map(function (w) { return w[0]; }).join("");
  }

  function priceHtml(p) {
    return p.mode === "rent" ? money(p.price) + "<small>/mo</small>" : money(p.price);
  }

  // "rent-2000-5000" -> { mode: "rent", min: 2000, max: 5000 }
  function parsePrice(value) {
    var parts = value.split("-");
    return { mode: parts[0], min: Number(parts[1]), max: parts[2] === "up" ? Infinity : Number(parts[2]) };
  }



  /* ------------------------------------------------------------------------
     4. Filtering and sorting
     ------------------------------------------------------------------------ */
  function matches(p) {
    if (state.status !== "all" && p.status !== state.status) return false;
    if (state.type && p.type !== state.type) return false;
    if (state.city && p.city !== state.city) return false;
    if (state.agent && p.agent !== state.agent) return false;
    if (state.beds && p.beds < Number(state.beds)) return false;
    if (state.baths && p.baths < Number(state.baths)) return false;

    if (state.search) {
      var haystack = (p.name + " " + p.address + " " + p.city + " " + p.state + " " + p.kind).toLowerCase();
      if (haystack.indexOf(state.search.toLowerCase()) === -1) return false;
    }

    if (state.price) {
      var band = parsePrice(state.price);
      if (p.mode !== band.mode || p.price < band.min || p.price >= band.max) return false;
    }

    if (state.occupancy) {
      if (p.occupancy === null) return false;
      if (state.occupancy === "90" && p.occupancy < 90) return false;
      if (state.occupancy === "75" && (p.occupancy < 75 || p.occupancy >= 90)) return false;
      if (state.occupancy === "0" && p.occupancy >= 75) return false;
    }

    if (state.date) {
      var days = (TODAY - new Date(p.added)) / 86400000;
      if (days > Number(state.date)) return false;
    }

    return true;
  }

  function getResults() {
    var results = properties.filter(matches);

    results.sort(function (a, b) {
      if (state.sort === "oldest") return new Date(a.added) - new Date(b.added);
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "area") return b.area - a.area;
      return new Date(b.added) - new Date(a.added);   // newest
    });

    return results;
  }



  /* ------------------------------------------------------------------------
     5. Drawing the cards
     ------------------------------------------------------------------------ */
  function cardHtml(p) {
    var isFav = favorites.indexOf(p.id) !== -1;
    var stats = "";
    if (p.beds)  stats += '<li><i class="bi bi-door-closed"></i>' + p.beds + (p.beds === 1 ? ' Bed' : ' Beds') + '</li>';
    if (p.baths) stats += '<li><i class="bi bi-droplet"></i>' + p.baths + (p.beds ? (p.baths === 1 ? ' Bath' : ' Baths') : (p.baths === 1 ? ' Restroom' : ' Restrooms')) + '</li>';
    stats += '<li><i class="bi bi-arrows-angle-expand"></i>' + p.area.toLocaleString("en-US") + ' sqft</li>';

    var occupancy = p.occupancy === null ? "" :
      '<div class="prop-occ"><div class="d-flex justify-content-between mb-1"><span>Occupancy</span><strong>' + p.occupancy + '%</strong></div>' +
      '<div class="progress" role="progressbar" aria-label="Occupancy" aria-valuenow="' + p.occupancy + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:' + p.occupancy + '%"></div></div></div>';

    return '' +
      '<div class="' + (state.view === "list" ? "col-12" : "col-sm-6 col-xl-4") + '">' +
        '<article class="prop-card">' +
          '<div class="prop-media">' +
            '<i class="bi bi-building prop-fallback"></i>' +
            '<img src="' + IMAGE_PATH + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.remove()">' +
            '<span class="status ' + STATUS_CLASS[p.status] + ' prop-status">' + p.status + '</span>' +
            '<span class="prop-type">' + p.kind + '</span>' +
            '<button type="button" class="prop-fav' + (isFav ? ' is-fav' : '') + '" data-id="' + p.id + '" aria-pressed="' + isFav + '" aria-label="Add ' + p.name + ' to favorites">' +
              '<i class="bi ' + (isFav ? 'bi-heart-fill' : 'bi-heart') + '"></i></button>' +
          '</div>' +
          '<div class="prop-main">' +
            '<div class="prop-body">' +
              '<div class="prop-price">' + priceHtml(p) + '</div>' +
              '<h3 class="prop-name"><a href="property-details.html">' + p.name + '</a></h3>' +
              '<div class="prop-loc"><i class="bi bi-geo-alt me-1"></i>' + p.address + ', ' + p.city + ', ' + p.state + '</div>' +
              '<ul class="prop-stats">' + stats + '</ul>' + occupancy +
            '</div>' +
            '<div class="prop-foot">' +
              '<span class="avatar sm">' + initials(p.agent) + '</span>' +
              '<div class="prop-agent text-truncate">' + p.agent + ' <span>&middot; Agent</span></div>' +
              '<div class="dropdown">' +
                '<button class="icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Actions for ' + p.name + '"><i class="bi bi-three-dots-vertical"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end">' +
                  '<li><a class="dropdown-item" href="property-details.html"><i class="bi bi-eye me-2"></i>View details</a></li>' +
                  '<li><a class="dropdown-item" href="edit-property.html"><i class="bi bi-pencil-square me-2"></i>Edit property</a></li>' +
                  '<li><a class="dropdown-item" href="property-gallery.html"><i class="bi bi-images me-2"></i>Gallery</a></li>' +
                  '<li><hr class="dropdown-divider"></li>' +
                  '<li><button class="dropdown-item text-danger" type="button" data-delete="' + p.id + '"><i class="bi bi-trash me-2"></i>Remove</button></li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>' +
      '</div>';
  }

  function renderPager(totalPages) {
    if (totalPages <= 1) { pagerEl.innerHTML = ""; return; }

    var html = '<ul class="pagination mb-0">';
    html += '<li class="page-item' + (state.page === 1 ? ' disabled' : '') + '"><button class="page-link" data-page="' + (state.page - 1) + '" aria-label="Previous page"><i class="bi bi-chevron-left"></i></button></li>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<li class="page-item' + (i === state.page ? ' active' : '') + '"><button class="page-link" data-page="' + i + '">' + i + '</button></li>';
    }
    html += '<li class="page-item' + (state.page === totalPages ? ' disabled' : '') + '"><button class="page-link" data-page="' + (state.page + 1) + '" aria-label="Next page"><i class="bi bi-chevron-right"></i></button></li>';
    pagerEl.innerHTML = html + '</ul>';
  }

  function renderPills() {
    var html = '<button type="button" class="pill' + (state.status === "all" ? ' active' : '') + '" data-status="all">All (' + properties.length + ')</button>';
    STATUSES.forEach(function (name) {
      var count = properties.filter(function (p) { return p.status === name; }).length;
      html += '<button type="button" class="pill' + (state.status === name ? ' active' : '') + '" data-status="' + name + '">' + name + ' (' + count + ')</button>';
    });
    pillsEl.innerHTML = html;
  }

  // Number shown on the "Filters" button (status pills and sorting do not count)
  function countActiveFilters() {
    return ["search", "type", "city", "price", "beds", "baths", "occupancy", "agent", "date"]
      .filter(function (key) { return state[key] !== ""; }).length;
  }

  function render() {
    var results = getResults();
    var size = PAGE_SIZE[state.view];
    var totalPages = Math.max(1, Math.ceil(results.length / size));
    if (state.page > totalPages) state.page = totalPages;

    var start = (state.page - 1) * size;
    var pageItems = results.slice(start, start + size);

    listEl.classList.toggle("is-list", state.view === "list");
    listEl.innerHTML = pageItems.map(cardHtml).join("");
    emptyEl.classList.toggle("d-none", results.length !== 0);

    countEl.textContent = results.length
      ? "Showing " + (start + 1) + "-" + (start + pageItems.length) + " of " + results.length + " properties"
      : "No properties found";

    var active = countActiveFilters();
    var badge = document.getElementById("filterCount");
    badge.textContent = active;
    badge.classList.toggle("d-none", active === 0);

    document.querySelectorAll("[data-view]").forEach(function (btn) {
      var on = btn.dataset.view === state.view;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on);
    });

    renderPills();
    renderPager(totalPages);
  }



  /* ------------------------------------------------------------------------
     6. Filter controls
     Every control has data-filter="<key>" and writes straight into state.
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-filter]").forEach(function (control) {
    var eventName = control.tagName === "INPUT" ? "input" : "change";
    control.addEventListener(eventName, function () {
      state[control.dataset.filter] = control.value.trim();
      state.page = 1;
      render();
    });
  });

  function resetFilters() {
    ["search", "type", "city", "price", "beds", "baths", "occupancy", "agent", "date"].forEach(function (key) { state[key] = ""; });
    state.status = "all";
    state.page = 1;
    document.querySelectorAll("[data-filter]").forEach(function (control) {
      if (control.dataset.filter !== "sort") control.value = "";
    });
    render();
  }

  document.querySelectorAll("[data-reset]").forEach(function (btn) { btn.addEventListener("click", resetFilters); });

  pillsEl.addEventListener("click", function (e) {
    var pill = e.target.closest("[data-status]");
    if (!pill) return;
    state.status = pill.dataset.status;
    state.page = 1;
    render();
  });



  /* ------------------------------------------------------------------------
     7. View toggle, pagination, favorites and the remove action
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.view = btn.dataset.view;
      state.page = 1;
      localStorage.setItem("estatepro-prop-view", state.view);
      render();
    });
  });

  pagerEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-page]");
    if (!btn) return;
    state.page = Number(btn.dataset.page);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  listEl.addEventListener("click", function (e) {
    var fav = e.target.closest(".prop-fav");
    var remove = e.target.closest("[data-delete]");

    if (fav) {
      var id = Number(fav.dataset.id);
      var at = favorites.indexOf(id);
      if (at === -1) { favorites.push(id); } else { favorites.splice(at, 1); }
      try { localStorage.setItem("estatepro-favorites", JSON.stringify(favorites)); } catch (err) {}

      var nowFav = at === -1;
      fav.classList.toggle("is-fav", nowFav);
      fav.setAttribute("aria-pressed", nowFav);
      fav.querySelector("i").className = "bi " + (nowFav ? "bi-heart-fill" : "bi-heart");
      window.showToast(nowFav ? "Added to favorites." : "Removed from favorites.", nowFav ? "success" : "info");
    }

    if (remove) {
      var gone = Number(remove.dataset.delete);
      var name = properties.filter(function (p) { return p.id === gone; })[0].name;
      properties = properties.filter(function (p) { return p.id !== gone; });
      render();
      window.showToast(name + " was removed from the list.", "warning");
    }
  });



  /* ------------------------------------------------------------------------
     8. Export the current results as a CSV file
     ------------------------------------------------------------------------ */
  document.getElementById("exportBtn").addEventListener("click", function () {
    var rows = [["Name", "Type", "Address", "City", "State", "Price", "Beds", "Baths", "Area (sqft)", "Status", "Agent"]];

    getResults().forEach(function (p) {
      rows.push([p.name, p.type, p.address, p.city, p.state, p.price, p.beds, p.baths, p.area, p.status, p.agent]);
    });

    var csv = rows.map(function (row) {
      return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");

    var link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "properties.csv";
    link.click();
    URL.revokeObjectURL(link.href);

    window.showToast("Properties exported to properties.csv.", "success");
  });



  /* ------------------------------------------------------------------------
     9. First draw
     ------------------------------------------------------------------------ */
  render();

});




/* ##########################################################################
   PART 6: TABLES AND CARD SEARCH
   search, filter, sort, pagination, export
   (this part used to be tables.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  /* ------------------------------------------------------------------------
     1. Interactive tables
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-table]").forEach(function (box) {

    var table = box.querySelector("table");
    var body = table.tBodies[0];
    var allRows = Array.from(body.rows);
    var pageSize = Number(box.dataset.pageSize) || 8;
    var page = 1;
    var query = "";
    var filters = {};          // column index -> wanted text
    var sorted = { col: -1, dir: "asc" };

    var searchInput = box.querySelector("[data-table-search]");
    var infoEl = box.querySelector("[data-table-info]");
    var pagerEl = box.querySelector("[data-table-pager]");
    var emptyEl = box.querySelector("[data-table-empty]");
    var selectAll = box.querySelector("[data-table-select-all]");


    // Rows that pass the search box and every filter
    function visibleRows() {
      return allRows.filter(function (row) {
        var text = row.textContent.toLowerCase();
        if (query && text.indexOf(query) === -1) return false;

        return Object.keys(filters).every(function (col) {
          return !filters[col] || row.cells[col].textContent.trim() === filters[col];
        });
      });
    }

    function render() {
      var rows = visibleRows();
      var pages = Math.max(1, Math.ceil(rows.length / pageSize));
      if (page > pages) page = pages;
      var start = (page - 1) * pageSize;

      allRows.forEach(function (row) { row.classList.add("d-none"); });
      rows.slice(start, start + pageSize).forEach(function (row) { row.classList.remove("d-none"); });

      if (infoEl) {
        // Count only the selected rows that match the current search and filters
        var selected = rows.filter(function (row) { return row.querySelector(".row-check:checked"); }).length;
        infoEl.textContent = (rows.length ? "Showing " + (start + 1) + "-" + Math.min(start + pageSize, rows.length) + " of " + rows.length : "No results") +
                             (selected ? "  |  " + selected + " selected" : "");
      }

      if (emptyEl) emptyEl.classList.toggle("d-none", rows.length !== 0);
      table.classList.toggle("d-none", rows.length === 0);

      if (pagerEl) {
        if (pages <= 1) { pagerEl.innerHTML = ""; return; }
        var html = '<ul class="pagination pagination-sm mb-0">';
        html += '<li class="page-item' + (page === 1 ? " disabled" : "") + '"><button class="page-link" data-go="' + (page - 1) + '" aria-label="Previous page"><i class="bi bi-chevron-left"></i></button></li>';
        for (var i = 1; i <= pages; i++) {
          html += '<li class="page-item' + (i === page ? " active" : "") + '"><button class="page-link" data-go="' + i + '">' + i + '</button></li>';
        }
        html += '<li class="page-item' + (page === pages ? " disabled" : "") + '"><button class="page-link" data-go="' + (page + 1) + '" aria-label="Next page"><i class="bi bi-chevron-right"></i></button></li></ul>';
        pagerEl.innerHTML = html;
      }
    }


    // Search
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        query = searchInput.value.trim().toLowerCase();
        page = 1;
        render();
      });
    }

    // Filters (a select that matches the exact text of one column)
    box.querySelectorAll("[data-table-filter]").forEach(function (select) {
      select.addEventListener("change", function () {
        filters[select.dataset.tableFilter] = select.value;
        page = 1;
        render();
      });
    });

    // Sorting
    table.querySelectorAll("th.sortable").forEach(function (th) {
      function sortColumn() {
        var col = th.cellIndex;
        var dir = sorted.col === col && sorted.dir === "asc" ? "desc" : "asc";
        sorted = { col: col, dir: dir };

        table.querySelectorAll("th.sortable").forEach(function (other) {
          other.removeAttribute("data-dir");
          other.removeAttribute("aria-sort");
        });
        th.dataset.dir = dir;
        th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");

        var isNumber = th.dataset.sort === "num";
        allRows.sort(function (a, b) {
          var x = a.cells[col].textContent.trim();
          var y = b.cells[col].textContent.trim();
          if (isNumber) {
            x = parseFloat(x.replace(/[^0-9.-]/g, "")) || 0;
            y = parseFloat(y.replace(/[^0-9.-]/g, "")) || 0;
            return dir === "asc" ? x - y : y - x;
          }
          return dir === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        });
        allRows.forEach(function (row) { body.appendChild(row); });
        render();
      }

      th.addEventListener("click", sortColumn);
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortColumn(); }
      });
    });

    // Pagination
    if (pagerEl) {
      pagerEl.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-go]");
        if (!btn) return;
        page = Number(btn.dataset.go);
        render();
      });
    }

    // Row selection
    box.addEventListener("change", function (e) {
      if (e.target === selectAll) {
        visibleRows().slice((page - 1) * pageSize, page * pageSize).forEach(function (row) {
          var check = row.querySelector(".row-check");
          if (check) { check.checked = selectAll.checked; row.classList.toggle("is-selected", selectAll.checked); }
        });
        render();
      } else if (e.target.classList.contains("row-check")) {
        e.target.closest("tr").classList.toggle("is-selected", e.target.checked);
        render();
      }
    });

    // CSV export of whatever the filters currently show
    var exportBtn = box.querySelector("[data-table-export]");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var skip = table.querySelector("th.check-col") ? 1 : 0;
        var head = Array.from(table.tHead.rows[0].cells).slice(skip).map(function (th) { return th.textContent.trim(); });
        var lines = [head].concat(visibleRows().map(function (row) {
          return Array.from(row.cells).slice(skip).map(function (td) { return td.textContent.replace(/\s+/g, " ").trim(); });
        }));

        var csv = lines.map(function (line) {
          return line.map(function (cell) { return '"' + cell.replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");

        var link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        link.download = (box.dataset.exportName || "export") + ".csv";
        link.click();
        URL.revokeObjectURL(link.href);
        window.showToast("Table exported as CSV.", "success");
      });
    }

    render();
  });



  /* ------------------------------------------------------------------------
     2. Card grid search
     <input data-card-search="#grid">  hides the .filter-item cards that
     do not contain the typed text.
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-card-search]").forEach(function (input) {
    var grid = document.querySelector(input.dataset.cardSearch);
    var note = document.querySelector(input.dataset.cardEmpty || "[data-card-empty]");

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;

      grid.querySelectorAll(".filter-item").forEach(function (item) {
        var match = item.textContent.toLowerCase().indexOf(q) !== -1;
        item.classList.toggle("d-none", !match);
        if (match) shown++;
      });

      if (note) note.classList.toggle("d-none", shown !== 0);
    });
  });

});




/* ##########################################################################
   PART 7: FORMS
   validation and photo preview
   (this part used to be forms.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  /* ------------------------------------------------------------------------
     1. Validation and submit
     This is a demo: nothing is sent anywhere. Connect the form to your
     backend where the toast is shown.
     ------------------------------------------------------------------------ */
  document.querySelectorAll("form.needs-validation").forEach(function (form) {

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        var firstBad = form.querySelector(":invalid");
        if (firstBad) firstBad.focus();
        window.showToast("Please fill in the required fields.", "error");
        return;
      }

      window.showToast(form.dataset.success || "Saved successfully.", "success");

      if (form.dataset.redirect) {
        setTimeout(function () { window.location.href = form.dataset.redirect; }, 1400);
      }
    });

  });

  // "Save draft" buttons skip validation
  document.querySelectorAll("[data-save-draft]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.showToast("Draft saved.", "info"); });
  });



  /* ------------------------------------------------------------------------
     2. Photo preview
     <input type="file" multiple data-preview="#previewBox">
     <div class="dropzone" data-dropfor="fileInputId"> lets people click or drop files
     ------------------------------------------------------------------------ */
  function showPreviews(input) {
    var box = document.querySelector(input.dataset.preview);
    if (!box) return;

    Array.from(input.files).forEach(function (file) {
      if (file.type.indexOf("image/") !== 0) return;

      var reader = new FileReader();
      reader.onload = function (ev) {
        var cell = document.createElement("div");
        cell.className = "pv";
        cell.innerHTML = '<img src="' + ev.target.result + '" alt="Preview of ' + file.name.replace(/"/g, "") + '">';
        box.appendChild(cell);
      };
      reader.readAsDataURL(file);
    });
  }

  document.querySelectorAll("input[type=file][data-preview]").forEach(function (input) {
    input.addEventListener("change", function () { showPreviews(input); });
  });

  document.querySelectorAll("[data-dropfor]").forEach(function (zone) {
    var input = document.getElementById(zone.dataset.dropfor);

    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("is-over"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      zone.classList.remove("is-over");
      input.files = e.dataTransfer.files;
      showPreviews(input);
    });
  });

});




/* ##########################################################################
   PART 8: GALLERY
   full screen viewer, details gallery, gallery manager
   (this part used to be gallery.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  /* ------------------------------------------------------------------------
     1. Lightbox
     The viewer markup is created the first time it is needed, so pages
     only need data attributes. Each image needs data-src and data-caption.
     ------------------------------------------------------------------------ */
  var viewer = null;
  var viewerModal = null;
  var slides = [];
  var current = 0;

  function buildViewer() {
    if (viewer) return;

    viewer = document.createElement("div");
    viewer.className = "modal fade";
    viewer.tabIndex = -1;
    viewer.setAttribute("aria-label", "Image viewer");
    viewer.innerHTML =
      '<div class="modal-dialog modal-xl modal-dialog-centered"><div class="modal-content border-0 bg-transparent">' +
        '<div class="lb-stage">' +
          '<img src="" alt="">' +
          '<button type="button" class="lb-close" data-bs-dismiss="modal" aria-label="Close viewer"><i class="bi bi-x-lg"></i></button>' +
          '<button type="button" class="lb-nav lb-prev" aria-label="Previous image"><i class="bi bi-chevron-left"></i></button>' +
          '<button type="button" class="lb-nav lb-next" aria-label="Next image"><i class="bi bi-chevron-right"></i></button>' +
          '<div class="lb-caption"><span class="lb-text"></span><span class="lb-count"></span></div>' +
        '</div>' +
      '</div></div>';
    document.body.appendChild(viewer);
    viewerModal = new bootstrap.Modal(viewer);

    viewer.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    viewer.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });

    document.addEventListener("keydown", function (e) {
      if (!viewer.classList.contains("show")) return;
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    var slide = slides[current];
    var img = viewer.querySelector("img");
    img.src = slide.src;
    img.alt = slide.caption;
    viewer.querySelector(".lb-text").textContent = slide.caption;
    viewer.querySelector(".lb-count").textContent = (current + 1) + " / " + slides.length;
  }

  function openViewer(list, index) {
    buildViewer();
    slides = list;
    show(index);
    viewerModal.show();
  }

  // Any element with data-lightbox="group" opens the viewer for its group
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    e.preventDefault();

    var group = Array.from(document.querySelectorAll('[data-lightbox="' + trigger.dataset.lightbox + '"]'));
    var list = group.map(function (el) { return { src: el.dataset.src, caption: el.dataset.caption || "" }; });
    openViewer(list, group.indexOf(trigger));
  });



  /* ------------------------------------------------------------------------
     2. Property details gallery
     ------------------------------------------------------------------------ */
  var main = document.querySelector("[data-gallery-main]");

  if (main) {
    var thumbs = Array.from(document.querySelectorAll("[data-gallery-thumb]"));
    var mainImg = main.querySelector("img");
    var active = 0;

    function pick(index) {
      active = index;
      mainImg.src = thumbs[index].dataset.src;
      mainImg.alt = thumbs[index].dataset.caption;
      thumbs.forEach(function (t, i) { t.classList.toggle("active", i === index); });
    }

    thumbs.forEach(function (thumb, i) { thumb.addEventListener("click", function () { pick(i); }); });

    // Clicking the big image opens the full screen viewer
    main.addEventListener("click", function () {
      openViewer(thumbs.map(function (t) { return { src: t.dataset.src, caption: t.dataset.caption }; }), active);
    });
  }



  /* ------------------------------------------------------------------------
     3. Gallery manager
     ------------------------------------------------------------------------ */
  var grid = document.getElementById("galleryGrid");

  if (grid) {
    var countEl = document.getElementById("galleryCount");

    function updateCount() {
      var n = grid.querySelectorAll(".gal-item").length;
      countEl.textContent = n + (n === 1 ? " photo" : " photos");
    }

    // Filter pills (All / Exterior / Interior / Amenities)
    document.querySelectorAll("[data-gal-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll("[data-gal-filter]").forEach(function (p) { p.classList.toggle("active", p === pill); });
        grid.querySelectorAll(".gal-item").forEach(function (item) {
          item.classList.toggle("d-none", pill.dataset.galFilter !== "all" && item.dataset.category !== pill.dataset.galFilter);
        });
      });
    });

    // Set cover and remove
    grid.addEventListener("click", function (e) {
      var item = e.target.closest(".gal-item");
      if (!item) return;

      if (e.target.closest(".gal-set-cover")) {
        grid.querySelectorAll(".gal-cover").forEach(function (badge) { badge.remove(); });
        item.querySelector(".gal-tile").insertAdjacentHTML("afterbegin", '<span class="gal-cover">Cover photo</span>');
        window.showToast("Cover photo updated.", "success");
      }

      if (e.target.closest(".gal-remove")) {
        item.remove();
        updateCount();
        window.showToast("Photo removed.", "warning");
      }
    });

    // Upload: show the chosen files straight away (demo, nothing is sent)
    var fileInput = document.getElementById("galleryFiles");

    function addFiles(files) {
      Array.from(files).forEach(function (file) {
        if (file.type.indexOf("image/") !== 0) return;

        var reader = new FileReader();
        reader.onload = function (ev) {
          var name = file.name.replace(/\.[^.]+$/, "");
          var cell = document.createElement("div");
          cell.className = "col-6 col-md-4 col-xl-3 gal-item";
          cell.dataset.category = "Interior";
          cell.innerHTML =
            '<div class="gal-tile"><img src="' + ev.target.result + '" alt="' + name.replace(/"/g, "") + '" data-lightbox="manager" data-src="' + ev.target.result + '" data-caption="' + name.replace(/"/g, "") + '">' +
              '<div class="gal-bar"><span class="text-truncate">' + name + '</span><span class="d-flex gap-1">' +
              '<button type="button" class="gal-set-cover" aria-label="Set as cover" title="Set as cover"><i class="bi bi-star"></i></button>' +
              '<button type="button" class="gal-remove" aria-label="Remove photo" title="Remove"><i class="bi bi-trash"></i></button></span></div></div>';
          grid.insertBefore(cell, grid.firstChild);
          updateCount();
        };
        reader.readAsDataURL(file);
      });
      window.showToast("Photos added to the gallery.", "success");
    }

    fileInput.addEventListener("change", function () { addFiles(fileInput.files); });

    var zone = document.getElementById("dropzone");
    zone.addEventListener("click", function () { fileInput.click(); });
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("is-over"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
    zone.addEventListener("drop", function (e) { e.preventDefault(); zone.classList.remove("is-over"); addFiles(e.dataTransfer.files); });

    updateCount();
  }

});



/* ==========================================================================
   Property details: favorite and share buttons
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {

  var fav = document.getElementById("favBtn");
  var share = document.getElementById("shareBtn");

  if (fav) {
    fav.addEventListener("click", function () {
      var on = fav.getAttribute("aria-pressed") !== "true";
      fav.setAttribute("aria-pressed", on);
      fav.querySelector("i").className = "bi me-1 " + (on ? "bi-heart-fill text-danger" : "bi-heart");
      window.showToast(on ? "Added to favorites." : "Removed from favorites.", on ? "success" : "info");
    });
  }

  if (share) {
    share.addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
      window.showToast("Property link copied.", "success");
    });
  }

});




/* ##########################################################################
   PART 9: CATALOG
   property types and amenities
   (this part used to be catalog.js)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  var grid = document.getElementById("catalogGrid");
  if (!grid) return;

  var modalEl = document.getElementById("catalogModal");
  var modal = new bootstrap.Modal(modalEl);
  var form = document.getElementById("catalogForm");
  var title = document.getElementById("catalogModalTitle");
  var nameInput = document.getElementById("catalogName");
  var iconInput = document.getElementById("catalogIcon");
  var noun = grid.dataset.noun || "Item";      // "Property type" or "Amenity"
  var editing = null;                          // the card being edited, or null when adding


  function updateTotals() {
    var all = grid.querySelectorAll(".filter-item");
    var on = grid.querySelectorAll(".filter-item:not(.is-off)");
    var el = document.getElementById("catalogTotals");
    if (el) el.textContent = all.length + " total, " + on.length + " active";
  }


  /* ------------------------------------------------------------------------
     1. Open the modal to add or edit
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-catalog-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      editing = null;
      form.reset();
      form.classList.remove("was-validated");
      title.textContent = "Add " + noun.toLowerCase();
      modal.show();
    });
  });

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".filter-item");
    if (!card) return;

    if (e.target.closest("[data-catalog-edit]")) {
      editing = card;
      form.classList.remove("was-validated");
      nameInput.value = card.querySelector("h3").textContent;
      iconInput.value = card.dataset.icon;
      title.textContent = "Edit " + noun.toLowerCase();
      modal.show();
    }

    if (e.target.closest("[data-catalog-remove]")) {
      var name = card.querySelector("h3").textContent;
      card.remove();
      updateTotals();
      window.showToast(name + " was removed.", "warning");
    }
  });

  // On / off switch
  grid.addEventListener("change", function (e) {
    if (!e.target.matches(".form-check-input")) return;
    var card = e.target.closest(".filter-item");
    card.classList.toggle("is-off", !e.target.checked);
    updateTotals();
  });



  /* ------------------------------------------------------------------------
     2. Save from the modal
     ------------------------------------------------------------------------ */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    var name = nameInput.value.trim();
    var icon = iconInput.value;

    if (editing) {
      editing.dataset.icon = icon;
      editing.querySelector("h3").textContent = name;
      editing.querySelector(".catalog-icon i").className = "bi " + icon;
      window.showToast(name + " was updated.", "success");
    } else {
      var col = document.createElement("div");
      col.className = grid.dataset.colClass + " filter-item";
      col.dataset.icon = icon;
      col.innerHTML =
        '<div class="card catalog-card">' +
          '<span class="catalog-icon"><i class="bi ' + icon + '"></i></span>' +
          '<div class="flex-grow-1 min-w-0"><h3>' + name + '</h3><div class="cell-sub">0 properties</div></div>' +
          '<div class="d-flex align-items-center gap-1">' +
            '<div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" role="switch" checked aria-label="Active"></div>' +
            '<button type="button" class="icon-btn" data-catalog-edit aria-label="Edit"><i class="bi bi-pencil"></i></button>' +
            '<button type="button" class="icon-btn" data-catalog-remove aria-label="Remove"><i class="bi bi-trash"></i></button>' +
          '</div>' +
        '</div>';
      grid.insertBefore(col, grid.firstChild);
      window.showToast(name + " was added.", "success");
    }

    updateTotals();
    modal.hide();
  });

  updateTotals();

});



/* ##########################################################################
   PART 10: RENTALS
   rent schedule calendar, application review, lease forms, deposits,
   lease termination and print buttons. Each block only runs on its page.
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  function money(n) { return "$" + Number(n).toLocaleString("en-US"); }

  // Sets a status badge to new text and the matching color
  function setBadge(el, text, tone) {
    el.className = "status status-" + tone;
    el.textContent = text;
  }

  function openModal(id) {
    var el = document.getElementById(id);
    return el ? bootstrap.Modal.getOrCreateInstance(el) : null;
  }



  /* ------------------------------------------------------------------------
     1. Rent schedule calendar (month, week and list views)
     Every tenant pays on the same day each month. Past months show Paid,
     October 2026 shows the real status, future months show Scheduled.
     ------------------------------------------------------------------------ */
  var calendarEl = document.getElementById("rentCalendar");

  if (calendarEl) {

    var rentals = [
      { tenant: "Michael Anderson",      unit: "4B",         day: 1,  amount: 1850, status: "Paid" },
      { tenant: "Emma Thompson",         unit: "2A",         day: 1,  amount: 1450, status: "Paid" },
      { tenant: "Isabella Moore",        unit: "8A",         day: 5,  amount: 1980, status: "Pending" },
      { tenant: "Sophia Williams",       unit: "3A",         day: 1,  amount: 2150, status: "Paid" },
      { tenant: "Liam Harris",           unit: "1C",         day: 1,  amount: 1520, status: "Paid" },
      { tenant: "Daniel Carter",         unit: "3C",         day: 1,  amount: 1620, status: "Overdue" },
      { tenant: "Charlotte Young",       unit: "5A",         day: 5,  amount: 1790, status: "Partially Paid" },
      { tenant: "Benjamin Hall",         unit: "2D",         day: 1,  amount: 1840, status: "Paid" },
      { tenant: "Northwind Legal LLP",   unit: "Suite 1204", day: 1,  amount: 6400, status: "Paid" },
      { tenant: "Brightpath Consulting", unit: "Suite 305",  day: 10, amount: 3100, status: "Pending" },
      { tenant: "James Mitchell",        unit: "V-12",       day: 1,  amount: 3850, status: "Paid" },
      { tenant: "Mia Robinson",          unit: "V-07",       day: 1,  amount: 3200, status: "Paid" },
      { tenant: "Bean & Brew Cafe",      unit: "Shop 1",     day: 1,  amount: 3100, status: "Paid" },
      { tenant: "Lucas Walker Studio",   unit: "Suite 204",  day: 15, amount: 2400, status: "Pending" }
    ];

    var TONE = { "Paid": "success", "Pending": "warning", "Overdue": "danger", "Partially Paid": "info", "Scheduled": "info" };
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var TODAY = new Date(2026, 9, 5);       // demo "today": Oct 5, 2026

    var current = new Date(TODAY);
    var view = "month";

    function statusFor(item, date) {
      var diff = (date.getFullYear() * 12 + date.getMonth()) - (TODAY.getFullYear() * 12 + TODAY.getMonth());
      if (diff < 0) return "Paid";
      if (diff === 0) return item.status;
      return "Scheduled";
    }

    function itemsOn(date) {
      return rentals.filter(function (r) { return r.day === date.getDate(); })
                    .map(function (r) { return { tenant: r.tenant, unit: r.unit, amount: r.amount, status: statusFor(r, date) }; });
    }

    function sameDay(a, b) { return a.toDateString() === b.toDateString(); }

    function chip(item, full) {
      var label = full ? item.tenant + " " + money(item.amount) : item.tenant.split(" ")[0] + " " + money(item.amount);
      return '<span class="cal-chip c-' + TONE[item.status] + '" title="' + item.tenant + ", " + item.unit + ", " + item.status + '">' + label + '</span>';
    }

    function cellHtml(date, inMonth, full) {
      var items = itemsOn(date);
      var shown = full ? items : items.slice(0, 3);
      var html = '<div class="cal-cell' + (inMonth ? "" : " is-out") + (sameDay(date, TODAY) ? " is-today" : "") + '">';
      html += '<span class="cal-day">' + date.getDate() + '</span>' + shown.map(function (i) { return chip(i, full); }).join("");
      if (items.length > shown.length) html += '<div class="cal-more">+' + (items.length - shown.length) + ' more</div>';
      return html + '</div>';
    }

    function gridHeader() {
      return DAYS.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join("");
    }

    function weekStart(date) {
      var start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      return start;
    }

    function drawMonth() {
      var first = new Date(current.getFullYear(), current.getMonth(), 1);
      var last = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      var cursor = weekStart(first);
      var html = '<div class="cal-scroll"><div class="cal-grid">' + gridHeader();

      while (cursor <= last || cursor.getDay() !== 0) {
        html += cellHtml(cursor, cursor.getMonth() === current.getMonth(), false);
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
      }
      calendarEl.innerHTML = html + '</div></div>';
      document.getElementById("calTitle").textContent = MONTHS[current.getMonth()] + " " + current.getFullYear();
      return rentals.map(function (r) { return { amount: r.amount }; });
    }

    function drawWeek() {
      var start = weekStart(current);
      var html = '<div class="cal-scroll"><div class="cal-grid cal-week">' + gridHeader();
      var found = [];

      for (var i = 0; i < 7; i++) {
        var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        html += cellHtml(day, true, true);
        found = found.concat(itemsOn(day));
      }
      calendarEl.innerHTML = html + '</div></div>';

      var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      document.getElementById("calTitle").textContent = MONTHS[start.getMonth()].slice(0, 3) + " " + start.getDate() + " - " + MONTHS[end.getMonth()].slice(0, 3) + " " + end.getDate() + ", " + end.getFullYear();
      return found;
    }

    function drawList() {
      var rows = rentals.slice().sort(function (a, b) { return a.day - b.day; });
      var html = '<div class="table-responsive"><table class="table data-table"><thead><tr><th>Due date</th><th>Tenant</th><th>Unit</th><th>Amount</th><th>Status</th></tr></thead><tbody>';

      rows.forEach(function (r) {
        var date = new Date(current.getFullYear(), current.getMonth(), r.day);
        var status = statusFor(r, date);
        html += '<tr><td>' + MONTHS[date.getMonth()].slice(0, 3) + " " + r.day + '</td><td class="cell-main">' + r.tenant + '</td><td>' + r.unit + '</td><td>' + money(r.amount) + '</td>' +
                '<td><span class="status status-' + TONE[status] + '">' + status + '</span></td></tr>';
      });
      calendarEl.innerHTML = html + '</tbody></table></div>';
      document.getElementById("calTitle").textContent = MONTHS[current.getMonth()] + " " + current.getFullYear();
      return rows;
    }

    function draw() {
      var shown = view === "week" ? drawWeek() : (view === "list" ? drawList() : drawMonth());
      var total = shown.reduce(function (sum, i) { return sum + i.amount; }, 0);
      document.getElementById("calSummary").textContent = shown.length + (shown.length === 1 ? " payment due, " : " payments due, ") + money(total) + " expected";

      document.querySelectorAll("[data-cal-view]").forEach(function (btn) {
        var on = btn.dataset.calView === view;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-pressed", on);
      });
    }

    function move(direction) {
      if (view === "week") {
        current.setDate(current.getDate() + 7 * direction);
      } else {
        current = new Date(current.getFullYear(), current.getMonth() + direction, 1);
      }
      draw();
    }

    document.getElementById("calPrev").addEventListener("click", function () { move(-1); });
    document.getElementById("calNext").addEventListener("click", function () { move(1); });
    document.getElementById("calToday").addEventListener("click", function () { current = new Date(TODAY); draw(); });

    document.querySelectorAll("[data-cal-view]").forEach(function (btn) {
      btn.addEventListener("click", function () { view = btn.dataset.calView; draw(); });
    });

    draw();
  }



  /* ------------------------------------------------------------------------
     2. Application review (Approve, Reject, Mark under review)
     ------------------------------------------------------------------------ */
  var reviewBox = document.getElementById("reviewActions");

  if (reviewBox) {
    var DECISION_TONE = { "Approved": "success", "Accepted": "success", "Rejected": "danger", "Under Review": "warning", "Negotiating": "warning", "Withdrawn": "muted",
                          "Confirmed": "success", "Completed": "muted", "Cancelled": "muted", "No Show": "danger",
                          "In Progress": "warning", "Waiting": "muted",
                          "Paid": "success", "On hold": "muted" };
    var subject = reviewBox.dataset.label || "Application";   // "Offer" on the offer page
    var appBadge = document.getElementById("appStatus");
    var note = document.getElementById("reviewNote");

    reviewBox.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-decision]");
      if (!btn) return;

      var decision = btn.dataset.decision;
      var tone = btn.dataset.tone || DECISION_TONE[decision];
      var needsNote = decision === "Rejected" || btn.hasAttribute("data-need-note");

      if (needsNote && !note.value.trim()) {
        note.classList.add("is-invalid");
        note.focus();
        showToast("Add a short note first, so the team knows why.", "error");
        return;
      }
      note.classList.remove("is-invalid");

      setBadge(appBadge, decision, tone);
      var timeline = document.getElementById("appTimeline");
      timeline.insertAdjacentHTML("afterbegin",
        '<li><div class="cell-main">Marked as ' + decision.toLowerCase() + '</div><div class="cell-sub">' + (note.value.trim() || "No note added") + '</div><div class="timeline-time">Just now, by Alexander Reed</div></li>');
      note.value = "";
      showToast(subject + " marked as " + decision.toLowerCase() + ".", tone === "success" ? "success" : (decision === "Rejected" ? "warning" : "info"));
    });
  }



  /* ------------------------------------------------------------------------
     3. Lease forms: the end date follows the start date and the term
     ------------------------------------------------------------------------ */
  var leaseStart = document.getElementById("lstart");
  var leaseTerm = document.getElementById("lterm");
  var leaseEnd = document.getElementById("lend");

  if (leaseStart && leaseTerm && leaseEnd) {
    function setEndDate() {
      if (!leaseStart.value || !leaseTerm.value) return;
      var end = new Date(leaseStart.value + "T00:00:00");
      end.setMonth(end.getMonth() + Number(leaseTerm.value));
      end.setDate(end.getDate() - 1);
      leaseEnd.value = end.getFullYear() + "-" + String(end.getMonth() + 1).padStart(2, "0") + "-" + String(end.getDate()).padStart(2, "0");
    }
    leaseStart.addEventListener("change", setEndDate);
    leaseTerm.addEventListener("change", setEndDate);
    setEndDate();
  }



  /* ------------------------------------------------------------------------
     4. Security deposits: collect and refund
     The list page uses two windows (modals), the detail page has the refund
     form directly on the page.
     ------------------------------------------------------------------------ */
  var refundForm = document.getElementById("refundForm");
  var activeRow = null;

  if (refundForm) {
    var refundModal = openModal("refundModal");
    var depositField = document.getElementById("refundDeposit");
    var deductionField = document.getElementById("refundDeduction");
    var resultField = document.getElementById("refundAmount");

    function recalc() {
      var left = Number(depositField.value) - Number(deductionField.value || 0);
      resultField.value = money(Math.max(0, left));
    }

    deductionField.addEventListener("input", recalc);
    recalc();

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-refund]");
      if (!btn) return;
      activeRow = btn.closest("tr");
      document.getElementById("refundTenant").textContent = btn.dataset.tenant;
      depositField.value = btn.dataset.amount;
      deductionField.value = 0;
      recalc();
      refundModal.show();
    });

    refundForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var deducted = Number(deductionField.value || 0);
      var text = deducted > 0 ? "Partially Refunded" : "Refunded";
      var tone = deducted > 0 ? "info" : "muted";
      var badge = activeRow ? activeRow.querySelector(".status") : document.getElementById("depositStatus");

      setBadge(badge, text, tone);
      if (activeRow) {
        var button = activeRow.querySelector("[data-refund]");
        if (button) button.remove();
        refundModal.hide();
      }
      showToast("Refund of " + resultField.value + " processed.", "success");
    });
  }

  var collectForm = document.getElementById("collectForm");

  if (collectForm) {
    var collectModal = openModal("collectModal");
    var collectTenant = document.getElementById("collectTenant");

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-collect]");
      if (!btn) return;
      collectTenant.value = btn.dataset.tenant;
      collectModal.show();
    });

    collectForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var row = document.querySelector('#depositTable tr[data-tenant="' + collectTenant.value + '"]');

      if (row) {
        setBadge(row.querySelector(".status"), "Held", "success");
        var button = row.querySelector("[data-collect]");
        if (button) button.remove();
      }
      collectModal.hide();
      showToast("Deposit recorded for " + collectTenant.value + ".", "success");
    });
  }



  /* ------------------------------------------------------------------------
     5. Terminate lease and print buttons
     ------------------------------------------------------------------------ */
  var terminateForm = document.getElementById("terminateForm");

  if (terminateForm) {
    var terminateModal = openModal("terminateModal");

    terminateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      setBadge(document.getElementById("leaseStatus"), "Terminated", "muted");
      terminateModal.hide();
      showToast("Lease termination has been scheduled.", "warning");
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-print]")) window.print();
  });

});



/* ##########################################################################
   PART 11: SALES
   deal pipeline board (drag and drop) and the closing checklist
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  /* ------------------------------------------------------------------------
     1. Pipeline board
     <div data-kanban> with .k-col[data-stage] columns, each holding a
     .k-body with draggable .k-card items (data-id, data-name, data-value).
     Cards move by drag and drop, or with the card menu [data-move-to].
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-kanban]").forEach(function (board) {

    var dragged = null;

    function money(n) { return "$" + Number(n).toLocaleString("en-US"); }

    // Update the card count and the total value shown on every column
    function refresh() {
      board.querySelectorAll(".k-col").forEach(function (col) {
        var cards = Array.from(col.querySelectorAll(".k-card"));
        col.querySelector(".k-count").textContent = cards.length;

        var total = cards.reduce(function (sum, card) { return sum + Number(card.dataset.value || 0); }, 0);
        var totalEl = col.querySelector(".k-total");
        if (totalEl) totalEl.textContent = money(total);
      });
    }

    function moveCard(card, body) {
      if (!card || !body || card.parentElement === body) return;
      body.appendChild(card);
      refresh();
      var stage = body.closest(".k-col").dataset.stage;
      showToast(card.dataset.name + " moved to " + stage + ".", "success");
    }

    board.addEventListener("dragstart", function (e) {
      var card = e.target.closest(".k-card");
      if (!card) return;
      dragged = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.dataset.id || "");   // Firefox needs some data to start a drag
    });

    board.addEventListener("dragend", function () {
      if (dragged) dragged.classList.remove("dragging");
      board.querySelectorAll(".k-body.is-over").forEach(function (el) { el.classList.remove("is-over"); });
      dragged = null;
    });

    board.addEventListener("dragover", function (e) {
      var body = e.target.closest(".k-body");
      if (!body || !dragged) return;
      e.preventDefault();
      body.classList.add("is-over");
    });

    board.addEventListener("dragleave", function (e) {
      var body = e.target.closest(".k-body");
      if (body && !body.contains(e.relatedTarget)) body.classList.remove("is-over");
    });

    board.addEventListener("drop", function (e) {
      var body = e.target.closest(".k-body");
      if (!body || !dragged) return;
      e.preventDefault();
      body.classList.remove("is-over");
      moveCard(dragged, body);
    });

    // "Move to" in the card menu
    board.addEventListener("click", function (e) {
      var item = e.target.closest("[data-move-to]");
      if (!item) return;
      var target = board.querySelector('.k-col[data-stage="' + item.dataset.moveTo + '"] .k-body');
      moveCard(item.closest(".k-card"), target);
    });

    refresh();
  });



  /* ------------------------------------------------------------------------
     2. Closing checklist
     <div data-checklist> with checkboxes, plus #checkBar and #checkText.
     ------------------------------------------------------------------------ */
  var checklist = document.querySelector("[data-checklist]");

  if (checklist) {
    var bar = document.getElementById("checkBar");
    var text = document.getElementById("checkText");

    function updateChecklist() {
      var all = checklist.querySelectorAll("input[type=checkbox]").length;
      var done = checklist.querySelectorAll("input[type=checkbox]:checked").length;
      var percent = Math.round(done * 100 / all);

      bar.style.width = percent + "%";
      bar.parentElement.setAttribute("aria-valuenow", percent);
      text.textContent = done + " of " + all + " tasks done";
      return done === all;
    }

    checklist.addEventListener("change", function () {
      if (updateChecklist()) showToast("All closing tasks are complete.", "success");
    });

    updateChecklist();
  }

});



/* ##########################################################################
   PART 12: LEADS
   Mark a follow-up task as done. (The lead pipeline board uses the same
   drag and drop code as the deal pipeline in PART 11.)
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  // <button data-mark-done data-task="Call Ryan Cooper"> inside a table row
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-mark-done]");
    if (!btn) return;

    var row = btn.closest("tr");
    var badge = row.querySelector(".status");
    badge.className = "status status-success";
    badge.textContent = "Done";
    row.classList.add("text-secondary");
    btn.remove();

    showToast((btn.dataset.task || "Task") + " marked as done.", "success");
  });

});



/* ##########################################################################
   PART 13: MAINTENANCE
   assign a vendor to a work order, and the inspection checklist
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  /* ------------------------------------------------------------------------
     1. Assign a vendor (work order details page)
     ------------------------------------------------------------------------ */
  var assignForm = document.getElementById("assignForm");

  if (assignForm) {
    assignForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var vendor = document.getElementById("assignVendor");
      if (!vendor.value) {
        vendor.classList.add("is-invalid");
        showToast("Choose a vendor first.", "error");
        return;
      }
      vendor.classList.remove("is-invalid");

      document.getElementById("assignedVendor").textContent = vendor.value;

      var badge = document.getElementById("woStatus");
      badge.className = "status status-info";
      badge.textContent = "Assigned";

      showToast("Maintenance request assigned to " + vendor.value + ".", "success");
    });
  }



  /* ------------------------------------------------------------------------
     2. Inspection checklist
     Every item has three radio buttons named itemN with the values pass,
     fail and na. The totals and the progress bar follow the choices.
     ------------------------------------------------------------------------ */
  var inspection = document.querySelector("[data-inspection]");

  if (inspection) {
    var rows = inspection.querySelectorAll(".insp-row");

    function tally() {
      var pass = inspection.querySelectorAll('input[value="pass"]:checked').length;
      var fail = inspection.querySelectorAll('input[value="fail"]:checked').length;
      var na = inspection.querySelectorAll('input[value="na"]:checked').length;
      var done = pass + fail + na;

      document.getElementById("inspPass").textContent = pass;
      document.getElementById("inspFail").textContent = fail;
      document.getElementById("inspNA").textContent = na;
      document.getElementById("inspBar").style.width = Math.round(done * 100 / rows.length) + "%";
      document.getElementById("inspText").textContent = done + " of " + rows.length + " items checked";

      rows.forEach(function (row) {
        row.classList.toggle("is-fail", !!row.querySelector('input[value="fail"]:checked'));
      });
      return fail;
    }

    inspection.addEventListener("change", tally);
    tally();

    // "Create work orders" button turns the failed items into jobs
    var createBtn = document.getElementById("createFromFailed");
    if (createBtn) {
      createBtn.addEventListener("click", function () {
        var fails = tally();
        showToast(fails ? fails + " work order" + (fails > 1 ? "s" : "") + " created for the failed items." : "No failed items, nothing to create.", fails ? "success" : "info");
      });
    }
  }

});



/* ##########################################################################
   PART 14: FINANCE
   invoice line item editor, approve / pay buttons and the payment form
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }



  /* ------------------------------------------------------------------------
     1. Invoice line items
     <div data-invoice> holds the table (#lineBody), the "Add line" button
     (#addLine), the tax rate (#taxRate), the discount (#discount) and the
     total boxes (#subTotal, #taxAmount, #discountAmount, #grandTotal).
     ------------------------------------------------------------------------ */
  var invoice = document.querySelector("[data-invoice]");

  if (invoice) {
    var body = document.getElementById("lineBody");

    function recalc() {
      var subtotal = 0;

      body.querySelectorAll(".line-row").forEach(function (row) {
        var qty = Number(row.querySelector(".line-qty").value) || 0;
        var price = Number(row.querySelector(".line-price").value) || 0;
        row.querySelector(".line-total").textContent = money(qty * price);
        subtotal += qty * price;
      });

      var tax = subtotal * (Number(document.getElementById("taxRate").value) || 0) / 100;
      var discount = Number(document.getElementById("discount").value) || 0;

      document.getElementById("subTotal").textContent = money(subtotal);
      document.getElementById("taxAmount").textContent = money(tax);
      document.getElementById("discountAmount").textContent = "-" + money(discount);
      document.getElementById("grandTotal").textContent = money(Math.max(0, subtotal + tax - discount));
    }

    invoice.addEventListener("input", recalc);

    document.getElementById("addLine").addEventListener("click", function () {
      body.insertAdjacentHTML("beforeend",
        '<tr class="line-row">' +
          '<td><input type="text" class="form-control form-control-sm" placeholder="Description" aria-label="Description"></td>' +
          '<td><input type="number" class="form-control form-control-sm line-qty" value="1" min="0" aria-label="Quantity"></td>' +
          '<td><input type="number" class="form-control form-control-sm line-price" value="0" min="0" step="0.01" aria-label="Price"></td>' +
          '<td class="line-total fw-semibold">$0.00</td>' +
          '<td><button type="button" class="icon-btn remove-line" aria-label="Remove line"><i class="bi bi-trash"></i></button></td>' +
        '</tr>');
      recalc();
    });

    // Remove a line (the last one stays, so the invoice is never empty)
    body.addEventListener("click", function (e) {
      var remove = e.target.closest(".remove-line");
      if (!remove) return;
      if (body.querySelectorAll(".line-row").length === 1) {
        showToast("An invoice needs at least one line.", "warning");
        return;
      }
      remove.closest("tr").remove();
      recalc();
    });

    recalc();
  }



  /* ------------------------------------------------------------------------
     2. Approve / pay / waive buttons in a table row
     <button data-set-status="Approved" data-tone="success" data-msg="...">
     changes the badge in the same row and removes the row's action buttons.
     ------------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-status]");
    if (!btn) return;

    var row = btn.closest("tr");
    var badge = row.querySelector(".status");

    badge.className = "status status-" + (btn.dataset.tone || "success");
    badge.textContent = btn.dataset.setStatus;

    btn.parentElement.querySelectorAll("[data-set-status]").forEach(function (b) { b.remove(); });
    showToast(btn.dataset.msg || "Status updated.", btn.dataset.tone === "danger" ? "warning" : "success");
  });



  /* ------------------------------------------------------------------------
     3. Record payment: picking an invoice fills in the tenant and amount
     ------------------------------------------------------------------------ */
  var payInvoice = document.getElementById("payInvoice");

  if (payInvoice) {
    payInvoice.addEventListener("change", function () {
      var option = payInvoice.selectedOptions[0];
      if (!option || !option.dataset.amount) return;
      document.getElementById("payAmount").value = option.dataset.amount;
      document.getElementById("payTenant").value = option.dataset.tenant;
    });
  }

});



/* ##########################################################################
   PART 15: COMMUNICATION
   messages (chat), email, SMS, notification center and message templates.
   Demo data only. Replace the arrays with data from your backend.
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  function esc(text) {
    var box = document.createElement("div");
    box.textContent = text;
    return box.innerHTML;
  }

  function initials(name) {
    return name.split(" ").slice(0, 2).map(function (w) { return w[0]; }).join("");
  }

  function nowTime() {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }



  /* ------------------------------------------------------------------------
     1. Messages (chat between admin, tenants, owners, agents and vendors)
     ------------------------------------------------------------------------ */
  var thread = document.getElementById("chatThread");

  if (thread) {

    var conversations = [
      { id: 1, name: "Michael Anderson", role: "Tenant", sub: "Unit 4B, The Grand Oak Residence", unread: 2, messages: [
          { from: "them", text: "Hi, the hallway light outside 4B keeps flickering. Could someone take a look?", time: "9:12 AM" },
          { from: "me", text: "Thanks for letting us know, Michael. I have opened request MR-3101 and an electrician will visit this week.", time: "9:40 AM" },
          { from: "them", text: "Great, I am home on Thursday afternoon if that helps.", time: "9:52 AM" },
          { from: "them", text: "Also, could I get a copy of my lease agreement?", time: "9:53 AM" } ] },
      { id: 2, name: "Olivia Parker", role: "Agent", sub: "Senior agent", unread: 0, messages: [
          { from: "them", text: "The viewing at Maple Grove is confirmed for 10 AM tomorrow.", time: "Yesterday" },
          { from: "me", text: "Perfect. Please send me the client's feedback after the visit.", time: "Yesterday" } ] },
      { id: 3, name: "Marcus Hale", role: "Owner", sub: "Harrington Property Group", unread: 1, messages: [
          { from: "them", text: "Could you send the September owner statement for The Grand Oak Residence?", time: "8:30 AM" } ] },
      { id: 4, name: "Tom Reyes", role: "Vendor", sub: "Elite Plumbing", unread: 0, messages: [
          { from: "them", text: "We can be at 5B at 3 PM today. The water supply is already off.", time: "Mon" },
          { from: "me", text: "Great, the key is at the front desk.", time: "Mon" } ] },
      { id: 5, name: "Sophia Williams", role: "Tenant", sub: "Unit 3A, Parkview Heights", unread: 0, messages: [
          { from: "me", text: "Hi Sophia, your lease ends on December 1. Would you like to renew?", time: "Oct 2" },
          { from: "them", text: "Yes please, I would like to stay another year.", time: "Oct 2" } ] },
      { id: 6, name: "Ethan Wilson", role: "Agent", sub: "Leasing agent", unread: 0, messages: [
          { from: "them", text: "Daniel Carter's rent is still unpaid. Should I send a reminder?", time: "Oct 4" } ] }
    ];

    var listEl = document.getElementById("convList");
    var current = conversations[0];
    var roleFilter = "All";
    var query = "";
    var layout = document.getElementById("chatLayout");

    function drawList() {
      var shown = conversations.filter(function (c) {
        return (roleFilter === "All" || c.role === roleFilter) && c.name.toLowerCase().indexOf(query) !== -1;
      });

      if (!shown.length) {
        listEl.innerHTML = '<div class="empty-state py-4"><p class="mb-0">No conversations found.</p></div>';
        return;
      }

      listEl.innerHTML = shown.map(function (c) {
        var last = c.messages[c.messages.length - 1];
        return '<button type="button" class="conv-item' + (c === current ? " active" : "") + '" data-id="' + c.id + '">' +
                 '<span class="avatar">' + initials(c.name) + '</span>' +
                 '<span class="min-w-0 flex-grow-1">' +
                   '<span class="d-flex justify-content-between gap-2"><span class="cell-main text-truncate">' + esc(c.name) + '</span><span class="cell-sub">' + last.time + '</span></span>' +
                   '<span class="d-flex justify-content-between gap-2"><span class="cell-sub text-truncate">' + esc(last.text) + '</span>' + (c.unread ? '<span class="nav-badge">' + c.unread + '</span>' : "") + '</span>' +
                 '</span></button>';
      }).join("");
    }

    function drawThread() {
      document.getElementById("chatName").textContent = current.name;
      document.getElementById("chatSub").textContent = current.role + ", " + current.sub;
      document.getElementById("chatAvatar").textContent = initials(current.name);

      thread.innerHTML = current.messages.map(function (m) {
        return '<div class="d-flex"><div class="bubble' + (m.from === "me" ? " me" : "") + '">' + esc(m.text) + '<small>' + m.time + '</small></div></div>';
      }).join("");
      thread.scrollTop = thread.scrollHeight;
    }

    listEl.addEventListener("click", function (e) {
      var item = e.target.closest(".conv-item");
      if (!item) return;
      current = conversations.filter(function (c) { return c.id === Number(item.dataset.id); })[0];
      current.unread = 0;
      drawList();
      drawThread();
      layout.classList.add("chat-open");      // phones show the thread full screen
    });

    document.getElementById("chatBack").addEventListener("click", function () { layout.classList.remove("chat-open"); });

    document.getElementById("chatSearch").addEventListener("input", function (e) { query = e.target.value.trim().toLowerCase(); drawList(); });

    document.querySelectorAll("[data-chat-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        roleFilter = pill.dataset.chatFilter;
        document.querySelectorAll("[data-chat-filter]").forEach(function (p) { p.classList.toggle("active", p === pill); });
        drawList();
      });
    });

    document.getElementById("chatForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("chatInput");
      var text = input.value.trim();
      if (!text) return;

      current.messages.push({ from: "me", text: text, time: nowTime() });
      input.value = "";
      drawList();
      drawThread();
    });

    drawList();
    drawThread();
  }



  /* ------------------------------------------------------------------------
     2. Email (folders, reading pane, star, compose)
     ------------------------------------------------------------------------ */
  var mailList = document.getElementById("mailList");

  if (mailList) {

    var mails = [
      { id: 1, from: "Marcus Hale", subject: "September owner statement", preview: "Could you send the statement for The Grand Oak Residence?", body: "Hello,\n\nCould you send the September owner statement for The Grand Oak Residence? I would like to review it before our call on Friday.\n\nThanks,\nMarcus", time: "8:30 AM", folder: "Inbox", unread: true, star: true },
      { id: 2, from: "Tom Reyes", subject: "Invoice 4471 for unit 5B", preview: "Attached is our invoice for the pipe replacement.", body: "Hi,\n\nAttached is our invoice 4471 for the pipe replacement in unit 5B. Total is $450. Payment terms are net 14.\n\nBest,\nTom, Elite Plumbing", time: "Yesterday", folder: "Inbox", unread: true, star: false },
      { id: 3, from: "Nashville Credit Union", subject: "Pre-approval letter, Jennifer Collins", preview: "The pre-approval for $520,000 is confirmed.", body: "Dear team,\n\nThe pre-approval for Jennifer Collins is confirmed at $520,000. The letter is valid for 90 days.\n\nRegards,\nDana Cole", time: "Mon", folder: "Inbox", unread: false, star: false },
      { id: 4, from: "Lone Star Title Co.", subject: "Closing documents for Sunset Acres", preview: "Please review the closing disclosure before Oct 12.", body: "Hello,\n\nPlease review the closing disclosure for Sunset Acres before October 12. Closing is scheduled for October 15.\n\nElena Petrova", time: "Oct 2", folder: "Inbox", unread: false, star: true },
      { id: 5, from: "Zillow Premier Agent", subject: "Your listings performance, September", preview: "Your listings received 4,210 views last month.", body: "Your listings received 4,210 views and 86 inquiries in September. Featured listings had 2.4 times more views.", time: "Oct 1", folder: "Inbox", unread: false, star: false },
      { id: 6, from: "To: Michael Anderson", subject: "Your lease agreement", preview: "Attached is a copy of your lease agreement.", body: "Hi Michael,\n\nAttached is a copy of your lease agreement LS-2026-0142.\n\nBest regards,\nEstatePro team", time: "Oct 3", folder: "Sent", unread: false, star: false },
      { id: 7, from: "To: Sophia Williams", subject: "Lease renewal offer", preview: "We would be happy to extend your lease for another year.", body: "Hi Sophia,\n\nWe would be happy to extend your lease for another year at $2,215 per month.\n\nBest regards,\nEstatePro team", time: "Oct 2", folder: "Sent", unread: false, star: false },
      { id: 8, from: "Draft", subject: "Rent increase notice", preview: "Dear tenant, we are writing to let you know...", body: "Dear tenant,\n\nWe are writing to let you know about a change in rent from January 1.", time: "Oct 1", folder: "Drafts", unread: false, star: false }
    ];

    var folder = "Inbox";
    var openMail = null;
    var paneEl = document.getElementById("mailPane");

    function drawFolders() {
      document.querySelectorAll("[data-folder]").forEach(function (btn) {
        var name = btn.dataset.folder;
        var count = mails.filter(function (m) { return name === "Starred" ? m.star : m.folder === name; }).length;
        var unread = mails.filter(function (m) { return m.folder === name && m.unread; }).length;
        btn.classList.toggle("active", name === folder);
        btn.querySelector(".folder-count").textContent = name === "Inbox" && unread ? unread : count;
      });
    }

    function drawMails() {
      var shown = mails.filter(function (m) { return folder === "Starred" ? m.star : m.folder === folder; });

      mailList.innerHTML = shown.length ? shown.map(function (m) {
        return '<button type="button" class="mail-item' + (m.unread ? " unread" : "") + (m === openMail ? " active" : "") + '" data-id="' + m.id + '">' +
                 '<span class="d-flex justify-content-between gap-2"><span class="mail-from text-truncate">' + esc(m.from) + '</span><span class="cell-sub">' + m.time + '</span></span>' +
                 '<span class="mail-subject text-truncate d-block">' + (m.star ? '<i class="bi bi-star-fill text-warning me-1"></i>' : "") + esc(m.subject) + '</span>' +
                 '<span class="cell-sub text-truncate d-block">' + esc(m.preview) + '</span></button>';
      }).join("") : '<div class="empty-state py-5"><div class="empty-icon"><i class="bi bi-inbox"></i></div><p class="mb-0">Nothing in this folder.</p></div>';
    }

    function drawPane() {
      if (!openMail) {
        paneEl.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="bi bi-envelope-open"></i></div><h2>Select an email</h2><p>Choose a message on the left to read it here.</p></div>';
        return;
      }
      paneEl.innerHTML =
        '<div class="d-flex justify-content-between align-items-start gap-3 mb-3"><div><h2 class="h5 mb-1">' + esc(openMail.subject) + '</h2><div class="cell-sub">' + esc(openMail.from) + ' &middot; ' + openMail.time + '</div></div>' +
        '<div class="d-flex gap-1"><button type="button" class="icon-btn" data-mail-star aria-label="Star"><i class="bi ' + (openMail.star ? "bi-star-fill text-warning" : "bi-star") + '"></i></button>' +
        '<button type="button" class="icon-btn" data-mail-delete aria-label="Delete"><i class="bi bi-trash"></i></button></div></div>' +
        '<div class="mail-body">' + esc(openMail.body).replace(/\n/g, "<br>") + '</div>' +
        '<div class="mt-4"><button type="button" class="btn btn-outline-primary btn-sm" data-toast="Reply window opened." data-toast-type="info"><i class="bi bi-reply me-1"></i>Reply</button></div>';
    }

    function redraw() { drawFolders(); drawMails(); drawPane(); }

    document.querySelectorAll("[data-folder]").forEach(function (btn) {
      btn.addEventListener("click", function () { folder = btn.dataset.folder; openMail = null; redraw(); });
    });

    mailList.addEventListener("click", function (e) {
      var item = e.target.closest(".mail-item");
      if (!item) return;
      openMail = mails.filter(function (m) { return m.id === Number(item.dataset.id); })[0];
      openMail.unread = false;
      redraw();
      document.getElementById("mailLayout").classList.add("mail-open");
    });

    paneEl.addEventListener("click", function (e) {
      if (e.target.closest("[data-mail-star]")) { openMail.star = !openMail.star; redraw(); }
      if (e.target.closest("[data-mail-delete]")) {
        mails = mails.filter(function (m) { return m !== openMail; });
        openMail = null;
        redraw();
        showToast("Email deleted.", "warning");
      }
    });

    document.getElementById("mailBack").addEventListener("click", function () { document.getElementById("mailLayout").classList.remove("mail-open"); });

    // Compose window
    var composeModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("composeModal"));
    document.getElementById("composeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      if (!form.checkValidity()) { form.classList.add("was-validated"); return; }

      mails.unshift({ id: Date.now(), from: "To: " + document.getElementById("mailTo").value, subject: document.getElementById("mailSubject").value, preview: document.getElementById("mailText").value.slice(0, 80),
                      body: document.getElementById("mailText").value, time: nowTime(), folder: "Sent", unread: false, star: false });
      form.reset();
      form.classList.remove("was-validated");
      composeModal.hide();
      redraw();
      showToast("Email sent.", "success");
    });

    redraw();
  }



  /* ------------------------------------------------------------------------
     3. SMS: character counter, templates and recipients
     ------------------------------------------------------------------------ */
  var smsText = document.getElementById("smsText");

  if (smsText) {
    var smsCount = document.getElementById("smsCount");
    var recipients = document.getElementById("smsRecipients");

    function countSms() {
      var length = smsText.value.length;
      var parts = Math.max(1, Math.ceil(length / 160));
      smsCount.textContent = length + " characters, " + parts + (parts === 1 ? " message" : " messages") + " per person";
    }

    smsText.addEventListener("input", countSms);

    document.getElementById("smsTemplate").addEventListener("change", function (e) {
      if (e.target.value) { smsText.value = e.target.value; countSms(); }
    });

    document.getElementById("smsForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!smsText.value.trim()) { smsText.classList.add("is-invalid"); showToast("Write a message first.", "error"); return; }
      smsText.classList.remove("is-invalid");

      var count = Number(recipients.selectedOptions[0].dataset.count);
      showToast("SMS sent to " + count + (count === 1 ? " person." : " people."), "success");
      smsText.value = "";
      countSms();
    });

    countSms();
  }



  /* ------------------------------------------------------------------------
     4. Notification center: filter, read / unread, mark all as read
     <div id="notifList"> holds .notif-item[data-category] (add .unread)
     ------------------------------------------------------------------------ */
  var notifList = document.getElementById("notifList");

  if (notifList) {
    var items = notifList.querySelectorAll(".notif-item");

    function countUnread() {
      var unread = notifList.querySelectorAll(".notif-item.unread").length;
      document.getElementById("notifUnread").textContent = unread + (unread === 1 ? " unread" : " unread");
    }

    notifList.addEventListener("click", function (e) {
      var item = e.target.closest(".notif-item");
      if (item) { item.classList.remove("unread"); countUnread(); }
    });

    document.getElementById("notifMarkAll").addEventListener("click", function () {
      items.forEach(function (item) { item.classList.remove("unread"); });
      countUnread();
      showToast("All notifications marked as read.", "success");
    });

    document.querySelectorAll("[data-notif-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        var wanted = pill.dataset.notifFilter;
        document.querySelectorAll("[data-notif-filter]").forEach(function (p) { p.classList.toggle("active", p === pill); });
        items.forEach(function (item) {
          var show = wanted === "all" || (wanted === "unread" ? item.classList.contains("unread") : item.dataset.category === wanted);
          item.classList.toggle("d-none", !show);
        });
      });
    });

    countUnread();
  }



  /* ------------------------------------------------------------------------
     5. Message templates: edit window with a live preview
     ------------------------------------------------------------------------ */
  var tplModalEl = document.getElementById("tplModal");

  if (tplModalEl) {
    var tplModal = bootstrap.Modal.getOrCreateInstance(tplModalEl);
    var tplBody = document.getElementById("tplBody");
    var tplName = document.getElementById("tplName");
    var sample = { "{{tenant_name}}": "Michael Anderson", "{{unit}}": "4B", "{{rent_amount}}": "$1,850", "{{due_date}}": "Nov 1, 2026", "{{property}}": "The Grand Oak Residence", "{{agent_name}}": "Olivia Parker" };

    function preview() {
      var text = esc(tplBody.value);
      Object.keys(sample).forEach(function (key) { text = text.split(key).join("<strong>" + sample[key] + "</strong>"); });
      document.getElementById("tplPreview").innerHTML = text.replace(/\n/g, "<br>");
    }

    tplBody.addEventListener("input", preview);

    document.addEventListener("click", function (e) {
      var edit = e.target.closest("[data-edit-template]");
      if (edit) {
        tplName.value = edit.dataset.name;
        tplBody.value = edit.dataset.body;
        preview();
        tplModal.show();
      }

      var chip = e.target.closest("[data-var]");
      if (chip) {
        var start = tplBody.selectionStart;
        tplBody.setRangeText(chip.dataset.var, start, tplBody.selectionEnd, "end");
        tplBody.focus();
        preview();
      }
    });

    document.getElementById("tplForm").addEventListener("submit", function (e) {
      e.preventDefault();
      tplModal.hide();
      showToast("Template \"" + tplName.value + "\" saved.", "success");
    });
  }

});



/* ##########################################################################
   PART 16: REPORTS
   Every <canvas data-chart='{...}'> on a report page becomes a Chart.js
   chart. Colors come from the theme, so charts follow dark mode and the
   primary color. Needs assets/js/chart.umd.min.js on the page.

   Example of the data-chart value:
   {"type":"bar","labels":["May","Jun"],"unit":"$","stacked":false,
    "series":[{"name":"Income","data":[10,12],"color":"primary"}]}
   Types: bar, line, doughnut. Doughnut series use "colors": ["primary", ...]
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  // Header buttons that only make sense on report pages
  document.addEventListener("click", function (e) {
    var exportBtn = e.target.closest("[data-export-table]");
    if (exportBtn) document.querySelector(exportBtn.dataset.exportTable + " [data-table-export]").click();
  });

  var rangeSelect = document.querySelector("[data-report-range]");
  if (rangeSelect) {
    rangeSelect.addEventListener("change", function () {
      document.getElementById("rangeLabel").textContent = rangeSelect.value;
      showToast("Report updated for " + rangeSelect.value.toLowerCase() + ".", "info");
    });
  }

  var canvases = document.querySelectorAll("canvas[data-chart]");
  if (!canvases.length || typeof Chart === "undefined") return;

  var drawn = [];

  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function tone(name) {
    var map = { primary: "--primary-color", success: "--success-color", warning: "--warning-color", danger: "--danger-color", info: "--info-color", muted: "--muted-text" };
    return name === "violet" ? "#8b5cf6" : cssVar(map[name]);
  }

  function format(value, unit) {
    if (unit === "$") return "$" + Number(value).toLocaleString("en-US");
    if (unit === "$K") return "$" + value + "K";
    if (unit === "%") return value + "%";
    return value;
  }

  function drawAll() {
    drawn.forEach(function (chart) { chart.destroy(); });
    drawn = [];

    Chart.defaults.font.family = cssVar("--font-family");
    Chart.defaults.color = cssVar("--muted-text");
    var grid = cssVar("--border-color");
    var card = cssVar("--card-bg");

    canvases.forEach(function (canvas) {
      var cfg = JSON.parse(canvas.dataset.chart);
      var round = cfg.type === "doughnut";

      var datasets = cfg.series.map(function (s) {
        var color = tone(s.color || "primary");
        if (round) return { label: s.name, data: s.data, backgroundColor: s.colors.map(tone), borderColor: card, borderWidth: 3 };
        if (cfg.type === "line") return { label: s.name, data: s.data, borderColor: color, backgroundColor: color + "26", fill: !!s.fill, tension: 0.4, pointRadius: 3, borderWidth: 2.5 };
        return { label: s.name, data: s.data, backgroundColor: color, borderRadius: 6, maxBarThickness: 38 };
      });

      var options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: cfg.horizontal ? "y" : "x",
        plugins: {
          legend: { display: datasets.length > 1 || round, position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: { callbacks: { label: function (item) { return item.dataset.label + ": " + format(item.parsed.y !== undefined && !cfg.horizontal && !round ? item.parsed.y : (cfg.horizontal ? item.parsed.x : item.parsed), cfg.unit); } } }
        }
      };

      if (round) {
        options.cutout = "66%";
      } else {
        var valueAxis = { stacked: !!cfg.stacked, beginAtZero: true, grid: { color: grid }, border: { display: false }, ticks: { callback: function (v) { return format(v, cfg.unit); } } };
        var labelAxis = { stacked: !!cfg.stacked, grid: { display: false } };
        options.scales = cfg.horizontal ? { x: valueAxis, y: labelAxis } : { x: labelAxis, y: valueAxis };
      }

      drawn.push(new Chart(canvas, { type: cfg.type, data: { labels: cfg.labels, datasets: datasets }, options: options }));
    });
  }

  document.addEventListener("estatepro:themechange", drawAll);
  drawAll();

});



/* ##########################################################################
   PART 17: SETTINGS AND LOGIN PAGES
   Works on login, error and documentation pages too (they have no sidebar).
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {


  function esc(text) {
    var box = document.createElement("div");
    box.textContent = text;
    return box.innerHTML;
  }



  /* ------------------------------------------------------------------------
     1. Pages without the app shell need their own toast and demo buttons
     ------------------------------------------------------------------------ */
  if (!window.showToast) {
    window.showToast = function (message, type) {
      var box = document.getElementById("toastBox");
      if (!box) return;
      var el = document.createElement("div");
      el.className = "toast toast-" + (type || "info");
      el.setAttribute("role", "status");
      el.innerHTML = '<div class="d-flex"><div class="toast-body">' + message + '</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
      box.appendChild(el);
      el.addEventListener("hidden.bs.toast", function () { el.remove(); });
      new bootstrap.Toast(el, { delay: 3500 }).show();
    };

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-toast]");
      if (trigger) window.showToast(trigger.dataset.toast, trigger.dataset.toastType || "info");
      var link = e.target.closest('a[href="#"]');
      if (link) e.preventDefault();
    });
  }



  /* ------------------------------------------------------------------------
     2. Password fields: show / hide, strength meter and "must match"
     ------------------------------------------------------------------------ */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-toggle-password]");
    if (!btn) return;
    var input = document.querySelector(btn.dataset.togglePassword);
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.querySelector("i").className = "bi " + (show ? "bi-eye-slash" : "bi-eye");
  });

  document.querySelectorAll("[data-strength]").forEach(function (input) {
    var bar = document.querySelector(input.dataset.strength);
    var label = document.getElementById(bar.dataset.label);
    var colors = ["danger", "danger", "warning", "info", "success"];
    var names = ["Enter a password", "Weak", "Fair", "Good", "Strong"];

    input.addEventListener("input", function () {
      var v = input.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      if (!v) score = 0;
      else if (score === 0) score = 1;   // something typed but very weak

      bar.style.width = (score * 25) + "%";
      bar.className = "progress-bar bg-" + colors[score];
      label.textContent = names[score];
    });
  });

  document.querySelectorAll("[data-match]").forEach(function (field) {
    var other = document.querySelector(field.dataset.match);
    function check() { field.setCustomValidity(field.value === other.value ? "" : "Passwords do not match"); }
    field.addEventListener("input", check);
    other.addEventListener("input", check);
  });



  /* ------------------------------------------------------------------------
     3. Two-factor code boxes
     Typing moves to the next box, Backspace goes back, pasting fills all.
     ------------------------------------------------------------------------ */
  document.querySelectorAll(".otp-row").forEach(function (row) {
    var boxes = row.querySelectorAll(".otp-input");

    boxes.forEach(function (box, i) {
      box.addEventListener("input", function () {
        box.value = box.value.replace(/\D/g, "").slice(0, 1);
        if (box.value && boxes[i + 1]) boxes[i + 1].focus();
      });

      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !box.value && boxes[i - 1]) boxes[i - 1].focus();
      });

      box.addEventListener("paste", function (e) {
        var digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, boxes.length);
        if (!digits) return;
        e.preventDefault();
        digits.split("").forEach(function (d, k) { boxes[k].value = d; });
        boxes[Math.min(digits.length, boxes.length - 1)].focus();
      });
    });
  });

  var otpForm = document.getElementById("otpForm");
  if (otpForm) {
    otpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = Array.from(otpForm.querySelectorAll(".otp-input")).map(function (b) { return b.value; }).join("");
      if (code.length < 6) { showToast("Enter all 6 digits of the code.", "error"); return; }
      showToast("Code accepted. Signing you in...", "success");
      setTimeout(function () { window.location.href = otpForm.dataset.redirect; }, 1200);
    });
  }



  /* ------------------------------------------------------------------------
     4. Close a modal after its form is sent: <form data-close-modal>
     ------------------------------------------------------------------------ */
  document.querySelectorAll("form[data-close-modal]").forEach(function (form) {
    form.addEventListener("submit", function () {
      setTimeout(function () {
        if (form.checkValidity()) bootstrap.Modal.getOrCreateInstance(form.closest(".modal")).hide();
      }, 0);
    });
  });



  /* ------------------------------------------------------------------------
     5. Tag editor (property types, unit types, statuses)
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-tags]").forEach(function (box) {
    var list = box.querySelector(".tag-list");
    var input = box.querySelector("input");

    function add() {
      var text = input.value.trim();
      if (!text) return;
      list.insertAdjacentHTML("beforeend", '<span class="tag">' + esc(text) + '<button type="button" data-tag-remove aria-label="Remove ' + esc(text) + '"><i class="bi bi-x"></i></button></span>');
      input.value = "";
    }

    box.querySelector("[data-tag-add]").addEventListener("click", add);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } });
    list.addEventListener("click", function (e) {
      var remove = e.target.closest("[data-tag-remove]");
      if (remove) remove.closest(".tag").remove();
    });
  });



  /* ------------------------------------------------------------------------
     6. Roles and permissions matrix
     Columns: View, Create, Edit, Delete, Approve, Export (in that order).
     "111011" means everything except Delete.
     ------------------------------------------------------------------------ */
  var matrix = document.getElementById("permMatrix");

  if (matrix) {
    var all = "111111", none = "000000", view = "100001", staff = "111011";
    var ROLES = {
      "Super Admin": { "*": all },
      "Property Manager": { Dashboard: view, Properties: staff, Buildings: staff, Units: staff, Tenants: staff, Leases: "111111", Rent: "110101", Maintenance: all, Vendors: staff, Reports: view, Communication: "110001" },
      "Leasing Manager": { Dashboard: view, Properties: view, Units: "100000", Tenants: staff, Leases: all, Rent: "100001", Reports: view, Communication: "110001" },
      "Sales Manager": { Dashboard: view, Properties: view, Sales: all, Leads: all, Reports: view, Communication: "110001" },
      "Finance Manager": { Dashboard: view, Tenants: view, Rent: all, Finance: all, Reports: "100001", Communication: "100000" },
      "Maintenance Manager": { Dashboard: view, Properties: view, Units: view, Maintenance: all, Vendors: all, Communication: "110001" },
      "Agent": { Dashboard: "100000", Properties: "110000", Tenants: "100000", Sales: "110000", Leads: "111000", Communication: "110000" },
      "Accountant": { Dashboard: view, Rent: "100001", Finance: "110101", Reports: "100001" },
      "Support Staff": { Dashboard: "100000", Tenants: "110000", Maintenance: "110000", Communication: "110000" },
      "Tenant": { Dashboard: "100000", Rent: "100000", Maintenance: "110000", Communication: "110000" }
    };

    function apply(role) {
      var rules = ROLES[role];
      matrix.querySelectorAll("tbody tr").forEach(function (row) {
        var perms = rules["*"] || rules[row.dataset.module] || none;
        row.querySelectorAll("input[data-action]").forEach(function (box, i) { box.checked = perms.charAt(i) === "1"; });
      });
    }

    document.getElementById("roleSelect").addEventListener("change", function (e) {
      apply(e.target.value);
      document.getElementById("roleName").textContent = e.target.value;
    });

    // Tick a whole column from the header
    matrix.querySelectorAll("thead input[data-col]").forEach(function (head) {
      head.addEventListener("change", function () {
        matrix.querySelectorAll('tbody input[data-action="' + head.dataset.col + '"]').forEach(function (box) { box.checked = head.checked; });
      });
    });

    document.getElementById("savePerms").addEventListener("click", function () {
      showToast("Permissions saved for " + document.getElementById("roleSelect").value + ".", "success");
    });

    apply("Super Admin");
  }



  /* ------------------------------------------------------------------------
     7. Appearance page: font list and reset (the other controls reuse the
        same data-setting / data-color / data-preset buttons as the customizer)
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-font-select]").forEach(function (select) {
    select.value = EstateTheme.get("font");
    select.addEventListener("change", function () { EstateTheme.set("font", select.value); });
  });

  document.querySelectorAll("[data-reset-settings]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      EstateTheme.reset();
      document.querySelectorAll("[data-font-select]").forEach(function (s) { s.value = EstateTheme.get("font"); });
      showToast("Appearance settings reset to default.", "success");
    });
  });



  /* ------------------------------------------------------------------------
     8. Integrations: connect and disconnect
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-integration]").forEach(function (box) {
    box.addEventListener("change", function () {
      var card = box.closest(".int-card");
      var status = card.querySelector("[data-int-status]");
      status.className = "status status-" + (box.checked ? "success" : "muted");
      status.textContent = box.checked ? "Connected" : "Not connected";
      showToast(box.dataset.integration + (box.checked ? " connected." : " disconnected."), box.checked ? "success" : "info");
    });
  });



  /* ------------------------------------------------------------------------
     9. Localization: show today's date in the chosen format
     ------------------------------------------------------------------------ */
  var dateFormat = document.getElementById("dateFormat");

  if (dateFormat) {
    var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sample = new Date(2026, 9, 5);

    function showDate() {
      var d = String(sample.getDate()).padStart(2, "0");
      var m = String(sample.getMonth() + 1).padStart(2, "0");
      var formats = { "MM/DD/YYYY": m + "/" + d + "/2026", "DD/MM/YYYY": d + "/" + m + "/2026", "YYYY-MM-DD": "2026-" + m + "-" + d, "MMM D, YYYY": shortMonths[sample.getMonth()] + " " + sample.getDate() + ", 2026" };
      document.getElementById("datePreview").textContent = formats[dateFormat.value];
    }

    dateFormat.addEventListener("change", showDate);
    showDate();
  }



  /* ------------------------------------------------------------------------
     10. Loading demos: a button that spins and a card that swaps skeleton
         shapes for real content
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-loading-demo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
      setTimeout(function () { btn.disabled = false; btn.innerHTML = original; showToast("Saved successfully.", "success"); }, 1800);
    });
  });

  document.querySelectorAll("[data-skeleton-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.dataset.skeletonToggle);
      target.querySelector(".sk-view").classList.toggle("d-none");
      target.querySelector(".real-view").classList.toggle("d-none");
    });
  });

});



/* ##########################################################################
   PART 18: CALENDAR
   One calendar for viewings, rent due dates, lease renewals, maintenance,
   inspections, meetings, listings and closings. Views: month, week, day, list.
   ########################################################################## */



document.addEventListener("DOMContentLoaded", function () {

  var host = document.getElementById("eventCalendar");
  if (!host) return;


  var TYPES = {
    viewing:     { label: "Viewing",          tone: "info" },
    rent:        { label: "Rent due",         tone: "success" },
    lease:       { label: "Lease renewal",    tone: "warning" },
    maintenance: { label: "Maintenance",      tone: "danger" },
    inspection:  { label: "Inspection",       tone: "violet" },
    meeting:     { label: "Meeting",          tone: "muted" },
    listing:     { label: "Property listing", tone: "primary" },
    closing:     { label: "Closing",          tone: "success" }
  };

  // date, time, type, title
  var events = [
    ["2026-10-01", "09:00", "rent", "Rent due, 10 tenants"], ["2026-10-02", "12:00", "viewing", "Viewing, Brookside Duplex"], ["2026-10-03", "17:00", "viewing", "Viewing, Riverbend Townhomes"],
    ["2026-10-05", "10:00", "viewing", "Viewing, Maple Grove Villas"], ["2026-10-05", "14:30", "viewing", "Viewing, Grand Oak 6C"], ["2026-10-05", "09:00", "rent", "Rent due, Isabella Moore and Charlotte Young"], ["2026-10-05", "15:00", "maintenance", "Elite Plumbing visits Unit 5B"],
    ["2026-10-06", "11:00", "viewing", "Viewing, Lakeview Cottage"], ["2026-10-07", "09:00", "inspection", "Move-out inspection, Riverside 2D"], ["2026-10-07", "16:00", "viewing", "Viewing, Harborview Penthouse"],
    ["2026-10-08", "10:30", "viewing", "Viewing, Skyline Suite 801"], ["2026-10-08", "11:00", "meeting", "Owner call, Harrington Property Group"], ["2026-10-08", "15:00", "viewing", "Viewing, Cedar Ridge Townhomes"],
    ["2026-10-09", "13:00", "viewing", "Viewing, Willow Creek Estate"], ["2026-10-10", "09:00", "rent", "Rent due, Brightpath Consulting"], ["2026-10-10", "11:30", "viewing", "Viewing, Parkview Heights 6A"],
    ["2026-10-12", "09:00", "meeting", "Weekly team meeting"], ["2026-10-12", "10:00", "inspection", "Routine inspection, Grand Oak 4B"], ["2026-10-14", "10:00", "listing", "Publish Riverbend Townhomes"],
    ["2026-10-15", "09:00", "rent", "Rent due, Lucas Walker Studio"], ["2026-10-15", "10:00", "closing", "Closing, Sunset Acres"], ["2026-10-20", "14:00", "meeting", "Quarterly review with owners"],
    ["2026-10-21", "10:00", "maintenance", "Elevator service, Grand Oak"], ["2026-10-28", "11:00", "closing", "Closing, Riverbend Townhomes"], ["2026-10-31", "12:00", "lease", "Lease ends, Lucas Walker Studio"],
    ["2026-11-01", "09:00", "rent", "Rent due, 11 tenants"], ["2026-11-05", "10:00", "closing", "Closing, Brookside Duplex"], ["2026-11-10", "10:00", "closing", "Closing, Willow Creek Estate"],
    ["2026-11-15", "12:00", "lease", "Lease ends, Daniel Carter"], ["2026-11-20", "10:00", "closing", "Closing, Cedar Ridge Townhomes"]
  ];

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var TODAY = new Date(2026, 9, 5);
  var current = new Date(TODAY);
  var view = "month";
  var filter = "all";


  function keyOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function sameDay(a, b) { return keyOf(a) === keyOf(b); }

  function clock(t) {
    var parts = t.split(":");
    var h = Number(parts[0]);
    return (h % 12 || 12) + ":" + parts[1] + (h < 12 ? " AM" : " PM");
  }

  function eventsOn(d) {
    return events.filter(function (e) { return e[0] === keyOf(d) && (filter === "all" || e[2] === filter); })
                 .sort(function (a, b) { return a[1].localeCompare(b[1]); });
  }

  function chip(e) {
    return '<button type="button" class="cal-chip c-' + TYPES[e[2]].tone + '" data-title="' + e[3] + '" data-time="' + clock(e[1]) + '" title="' + e[3] + '">' + clock(e[1]).replace(" ", "").toLowerCase() + " " + e[3] + '</button>';
  }

  function weekStart(d) { var s = new Date(d); s.setDate(s.getDate() - s.getDay()); return s; }
  function header() { return DAYS.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join(""); }

  function cell(d, inMonth, all) {
    var list = eventsOn(d);
    var shown = all ? list : list.slice(0, 3);
    return '<div class="cal-cell' + (inMonth ? "" : " is-out") + (sameDay(d, TODAY) ? " is-today" : "") + '"><span class="cal-day">' + d.getDate() + '</span>' +
           shown.map(chip).join("") + (list.length > shown.length ? '<div class="cal-more">+' + (list.length - shown.length) + ' more</div>' : "") + '</div>';
  }

  function drawMonth() {
    var first = new Date(current.getFullYear(), current.getMonth(), 1);
    var last = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    var d = weekStart(first);
    var html = '<div class="cal-scroll"><div class="cal-grid">' + header();
    var count = 0;

    while (d <= last || d.getDay() !== 0) {
      var inMonth = d.getMonth() === current.getMonth();
      html += cell(d, inMonth, false);
      if (inMonth) count += eventsOn(d).length;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    host.innerHTML = html + '</div></div>';
    document.getElementById("evTitle").textContent = MONTHS[current.getMonth()] + " " + current.getFullYear();
    return count;
  }

  function drawWeek() {
    var start = weekStart(current);
    var html = '<div class="cal-scroll"><div class="cal-grid cal-week">' + header();
    var count = 0;

    for (var i = 0; i < 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      html += cell(d, true, true);
      count += eventsOn(d).length;
    }
    host.innerHTML = html + '</div></div>';
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    document.getElementById("evTitle").textContent = MONTHS[start.getMonth()].slice(0, 3) + " " + start.getDate() + " - " + MONTHS[end.getMonth()].slice(0, 3) + " " + end.getDate() + ", " + end.getFullYear();
    return count;
  }

  function row(e, dateLabel) {
    return '<div class="day-event"><span class="day-time">' + (dateLabel || clock(e[1])) + '</span><span class="status status-' + TYPES[e[2]].tone + '">' + TYPES[e[2]].label + '</span><span class="flex-grow-1">' + e[3] + '</span>' + (dateLabel ? '<span class="cell-sub">' + clock(e[1]) + '</span>' : "") + '</div>';
  }

  function drawDay() {
    var list = eventsOn(current);
    host.innerHTML = list.length ? list.map(function (e) { return row(e); }).join("") :
      '<div class="empty-state"><div class="empty-icon"><i class="bi bi-calendar-x"></i></div><h2>Nothing planned</h2><p>There are no events on this day.</p></div>';
    document.getElementById("evTitle").textContent = DAYS[current.getDay()] + ", " + MONTHS[current.getMonth()].slice(0, 3) + " " + current.getDate() + ", " + current.getFullYear();
    return list.length;
  }

  function drawList() {
    var list = events.filter(function (e) {
      var d = new Date(e[0] + "T00:00:00");
      return d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear() && (filter === "all" || e[2] === filter);
    }).sort(function (a, b) { return (a[0] + a[1]).localeCompare(b[0] + b[1]); });

    host.innerHTML = list.length ? list.map(function (e) { var d = new Date(e[0] + "T00:00:00"); return row(e, MONTHS[d.getMonth()].slice(0, 3) + " " + d.getDate()); }).join("") :
      '<div class="empty-state"><div class="empty-icon"><i class="bi bi-calendar-x"></i></div><h2>Nothing planned</h2><p>There are no events this month.</p></div>';
    document.getElementById("evTitle").textContent = MONTHS[current.getMonth()] + " " + current.getFullYear();
    return list.length;
  }

  function draw() {
    var count = view === "week" ? drawWeek() : (view === "day" ? drawDay() : (view === "list" ? drawList() : drawMonth()));
    document.getElementById("evSummary").textContent = count + (count === 1 ? " event" : " events");
    document.querySelectorAll("[data-ev-view]").forEach(function (btn) {
      var on = btn.dataset.evView === view;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on);
    });
  }

  function move(step) {
    if (view === "week") current.setDate(current.getDate() + 7 * step);
    else if (view === "day") current.setDate(current.getDate() + step);
    else current = new Date(current.getFullYear(), current.getMonth() + step, 1);
    draw();
  }

  document.getElementById("evPrev").addEventListener("click", function () { move(-1); });
  document.getElementById("evNext").addEventListener("click", function () { move(1); });
  document.getElementById("evToday").addEventListener("click", function () { current = new Date(TODAY); draw(); });
  document.getElementById("evType").addEventListener("change", function (e) { filter = e.target.value; draw(); });
  document.querySelectorAll("[data-ev-view]").forEach(function (btn) { btn.addEventListener("click", function () { view = btn.dataset.evView; draw(); }); });

  host.addEventListener("click", function (e) {
    var chipEl = e.target.closest(".cal-chip");
    if (chipEl) showToast(chipEl.dataset.title + ", " + chipEl.dataset.time, "info");
  });

  draw();

});

