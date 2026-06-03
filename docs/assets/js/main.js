const $contentDiv = $("#doc-content");
const $heroWrapper = $("#home-hero-wrapper");
const $footerWrapper = $("#site-footer-wrapper");
const contentDiv = $contentDiv[0];

function configureMarkdownRenderer() {
  if (!window.marked) {
    throw new Error("Marked markdown renderer is not loaded");
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
  });
}

function renderMarkdown(markdown) {
  configureMarkdownRenderer();
  return marked.parse(markdown);
}

function renderPageLoader() {
  return `
    <div class="page-loader" role="status" aria-live="polite" aria-label="Loading documentation page">
      <div class="page-loader-head">
        <span class="page-loader-spinner" aria-hidden="true"></span>
        <div>
          <span class="page-loader-title">Loading documentation</span>
          <span class="page-loader-subtitle">Preparing the latest OmniStorage content...</span>
        </div>
      </div>
      <div class="page-loader-skeleton" aria-hidden="true">
        <span class="skeleton-line title"></span>
        <span class="skeleton-line"></span>
        <span class="skeleton-line"></span>
        <span class="skeleton-line short"></span>
        <span class="skeleton-card"></span>
      </div>
    </div>
  `;
}

// i18n
const initialLang = new URLSearchParams(window.location.search).get("lang");
let currentLang = ["en", "id"].includes(initialLang)
  ? initialLang
  : localStorage.getItem("omnistorage_lang") || "en";
let lastLoadedLang = null;
const translations = {
  en: {
    tagline:
      "A lightweight, type-safe, and universal storage layer for JavaScript. Store anything, anywhere, with a single unified API.",
    getStarted: "Get Started",
    viewGithub: "View on GitHub",
    features: {
      universal: {
        title: "Universal API",
        desc: "Works consistently across all platforms. Use the same code for LocalStorage, IndexedDB, or Node.js File System.",
      },
      typesafe: {
        title: "Type-Safe Validation",
        desc: "Built-in data validation to ensure your data is always valid and safe.",
      },
      pluggable: {
        title: "Pluggable Engines",
        desc: "Supports multiple storage engines. Switch engines easily without changing your app's logic flow.",
      },
    },
    engines: {
      title: "Supported Engines",
      desc: "Choose the right backend for browser apps, Node.js services, or shared runtime code.",
      categories: [
        {
          icon: "ri-loop-left-line",
          title: "Hybrid / Universal",
          engines: ["memory"],
        },
        {
          icon: "ri-window-line",
          title: "Client-side / Browser",
          engines: [
            "local",
            "session",
            "cookie",
            "cache",
            "indexeddb",
            "sqlite-client",
          ],
        },
        {
          icon: "ri-server-line",
          title: "Server-only / Node.js",
          engines: ["file", "sqlite-server"],
        },
      ],
    },
    footer: "Built with ❤️ for the JS Community.",
    nav: {
      docs: "Docs",
      examples: "Examples",
      logsStats: "Logs & Stats",
    },
    installation: "Installation",
    engines: "Storage Engines",
    api: "API Reference",
    sidebar: {
      intro: "Introduction",
      overview: "Overview",
      installation: "Installation",
      core: "Core",
      engines: "Storage Engines",
      engineGuide: "Engine Guide",
      interfaces: "Exports & Interfaces",
      api: "API Reference",
      cookbook: "Cookbook",
      usecases: "Use Cases",
      engineSub: {
        local: "LocalStorage",
        session: "SessionStorage",
        cookie: "Cookies",
        cache: "Cache Storage",
        indexeddb: "IndexedDB",
        memory: "In-Memory",
        file: "File System",
        "sqlite-server": "SQLite Server",
        "sqlite-client": "SQLite WASM",
      },
      apiSub: {
        config: "Configuration",
        basic: "Basic Operations",
        retrieval: "Data Retrieval",
        deletion: "Deletion",
        batch: "Batch Operations",
        advanced: "Advanced Features",
      },
      examplesSub: {
        auth: "Authentication",
        preferences: "Preferences",
        "multi-tab": "Multi-Tab Sync",
        "shopping-cart": "Shopping Cart",
        "api-cache": "API Cache",
        "form-draft": "Form Draft",
        "cookie-consent": "Cookie Consent",
        "server-settings": "Server Settings",
        "audit-log": "Audit Log",
        "browser-sqlite": "Browser SQLite",
        testing: "Testing",
      },
    },
  },
  id: {
    tagline:
      "Penyimpan data yang universal, ringan, dan aman untuk JavaScript. Simpan apa saja, di mana saja, dengan satu API terpadu.",
    getStarted: "Mulai Sekarang",
    viewGithub: "Lihat di GitHub",
    features: {
      universal: {
        title: "API Universal",
        desc: "Bekerja secara konsisten di semua platform. Gunakan kode yang sama untuk LocalStorage, IndexedDB, atau Node.js File System.",
      },
      typesafe: {
        title: "Validasi Type-Safe",
        desc: "Validasi data otomatis bawaan untuk memastikan data Anda selalu valid dan aman.",
      },
      pluggable: {
        title: "Engine Pluggable",
        desc: "Mendukung berbagai engine penyimpanan. Ganti engine dengan mudah tanpa mengubah alur logika aplikasi Anda.",
      },
    },
    engines: {
      title: "Dukungan Engine",
      desc: "Pilih backend penyimpanan yang tepat untuk aplikasi browser, layanan Node.js, atau kode lintas runtime.",
      categories: [
        {
          icon: "ri-loop-left-line",
          title: "Hybrid / Universal",
          engines: ["memory"],
        },
        {
          icon: "ri-window-line",
          title: "Client-side / Browser",
          engines: [
            "local",
            "session",
            "cookie",
            "cache",
            "indexeddb",
            "sqlite-client",
          ],
        },
        {
          icon: "ri-server-line",
          title: "Server-only / Node.js",
          engines: ["file", "sqlite-server"],
        },
      ],
    },
    footer: "Dibuat dengan ❤️ untuk Komunitas JS.",
    nav: {
      docs: "Dokumentasi",
      examples: "Contoh",
      logsStats: "Log & Statistik",
    },
    sidebar: {
      intro: "Pendahuluan",
      overview: "Gambaran Umum",
      installation: "Instalasi",
      core: "Inti",
      engines: "Engine Penyimpanan",
      engineGuide: "Panduan Engine",
      interfaces: "Export & Interface",
      api: "Referensi API",
      cookbook: "Buku Resep",
      usecases: "Contoh Kasus",
      logsStats: "Log & Statistik",
      engineSub: {
        local: "LocalStorage",
        session: "SessionStorage",
        cookie: "Cookies",
        cache: "Cache Storage",
        indexeddb: "IndexedDB",
        memory: "In-Memory",
        file: "File System",
        "sqlite-server": "SQLite Server",
        "sqlite-client": "SQLite WASM",
      },
      apiSub: {
        config: "Konfigurasi",
        basic: "Operasi Dasar",
        retrieval: "Pengambilan Data",
        deletion: "Penghapusan",
        batch: "Operasi Batch",
        advanced: "Fitur Lanjutan",
      },
      examplesSub: {
        auth: "Autentikasi",
        preferences: "Preferensi",
        "multi-tab": "Sinkron Antar Tab",
        "shopping-cart": "Keranjang Belanja",
        "api-cache": "Cache API",
        "form-draft": "Draft Form",
        "cookie-consent": "Persetujuan Cookie",
        "server-settings": "Pengaturan Server",
        "audit-log": "Audit Log",
        "browser-sqlite": "SQLite Browser",
        testing: "Testing",
      },
    },
  },
};

const SITE_URL = "https://omnistorage.js.org";
const pageSeo = {
  en: {
    home: {
      title: "OmniStorage — Universal Storage Layer for JavaScript",
      description:
        "A lightweight, type-safe, and universal storage layer for JavaScript. Store anything, anywhere, with one unified API.",
    },
    overview: {
      title: "OmniStorage Overview — Universal JavaScript Storage",
      description:
        "Learn what OmniStorage is, which storage engines it supports, and how it unifies browser and Node.js storage APIs.",
    },
    installation: {
      title: "Install OmniStorage — JavaScript Storage Library",
      description:
        "Install OmniStorage with npm and review its browser, Node.js, IndexedDB, Cache Storage, memory, and SQLite dependencies.",
    },
    engines: {
      title: "OmniStorage Engines — LocalStorage, IndexedDB, SQLite, Memory",
      description:
        "Compare OmniStorage engines including localStorage, sessionStorage, cookies, Cache Storage, memory, files, IndexedDB, and SQLite.",
    },
    "engine-guide": {
      title: "OmniStorage Engine Guide — Choose and Switch Storage Engines",
      description:
        "Understand OmniStorage's memory default, global .use() engine selection, and per-operation .engine() overrides.",
    },
    interfaces: {
      title: "OmniStorage Exports and Interfaces",
      description:
        "Review OmniStorage public methods, response shapes, configured store interface, namespace interface, hooks, and engine types.",
    },
    api: {
      title: "OmniStorage API Reference — ORM-like Storage Methods",
      description:
        "Explore OmniStorage API methods for create, save, find, update, delete, batch operations, namespaces, transactions, and statistics.",
    },
    "logs-stats": {
      title: "OmniStorage Logs and Statistics",
      description:
        "Inspect OmniStorage activity logs and storage statistics for debugging and monitoring storage usage.",
    },
    examples: {
      title: "OmniStorage Examples — JavaScript Storage Use Cases",
      description:
        "Browse OmniStorage examples for authentication, preferences, multi-tab sync, shopping carts, API cache, form drafts, audit logs, and testing.",
    },
  },
  id: {
    home: {
      title: "OmniStorage — Storage Layer Universal untuk JavaScript",
      description:
        "Storage layer JavaScript yang ringan, type-safe, dan universal. Simpan data di berbagai engine dengan satu API terpadu.",
    },
    overview: {
      title: "Gambaran Umum OmniStorage — Storage JavaScript Universal",
      description:
        "Pelajari OmniStorage, engine penyimpanan yang didukung, dan cara menyatukan API storage browser serta Node.js.",
    },
    installation: {
      title: "Instalasi OmniStorage — Library Storage JavaScript",
      description:
        "Install OmniStorage dengan npm dan lihat dependensi browser, Node.js, IndexedDB, Cache Storage, memory, dan SQLite.",
    },
    engines: {
      title: "Engine OmniStorage — LocalStorage, IndexedDB, SQLite, Memory",
      description:
        "Bandingkan engine OmniStorage termasuk localStorage, sessionStorage, cookies, Cache Storage, memory, file, IndexedDB, dan SQLite.",
    },
    "engine-guide": {
      title: "Panduan Engine OmniStorage — Pilih dan Ganti Storage Engine",
      description:
        "Pahami default memory OmniStorage, pemilihan engine global dengan .use(), dan override per operasi dengan .engine().",
    },
    interfaces: {
      title: "Export dan Interface OmniStorage",
      description:
        "Lihat method publik OmniStorage, bentuk respon, configured store, namespace, hook, dan tipe engine.",
    },
    api: {
      title: "Referensi API OmniStorage — Method Storage Bergaya ORM",
      description:
        "Jelajahi API OmniStorage untuk create, save, find, update, delete, operasi batch, namespace, transaksi, dan statistik.",
    },
    "logs-stats": {
      title: "Log dan Statistik OmniStorage",
      description:
        "Periksa log aktivitas dan statistik penyimpanan OmniStorage untuk debugging dan monitoring penggunaan storage.",
    },
    examples: {
      title: "Contoh OmniStorage — Use Case Storage JavaScript",
      description:
        "Lihat contoh OmniStorage untuk autentikasi, preferensi, sync multi-tab, shopping cart, API cache, draft form, audit log, dan testing.",
    },
  },
};

function setMeta(name, content, attr = "name") {
  let el = $(`meta[${attr}="${name}"]`)[0];
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    $(document.head).append(el);
  }
  $(el).attr("content", content);
}

function setLink(rel, href, hreflang = null) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = $(selector)[0];
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    $(document.head).append(el);
  }
  $(el).attr("href", href);
}

function buildPageUrl(pageName, lang = "en") {
  const query = lang === "id" ? "?lang=id" : "";
  const hash = pageName === "home" ? "" : `#${pageName}`;
  return `${SITE_URL}/${query}${hash}`;
}

function updateSeoMeta(pageName) {
  const meta = pageSeo[currentLang]?.[pageName] || pageSeo[currentLang]?.home;
  const url = buildPageUrl(pageName, currentLang);

  document.documentElement.lang = currentLang;
  document.title = meta.title;
  setMeta("description", meta.description);
  setLink("canonical", url);
  setLink("alternate", buildPageUrl(pageName, "en"), "en");
  setLink("alternate", buildPageUrl(pageName, "id"), "id");
  setLink("alternate", buildPageUrl(pageName, "en"), "x-default");

  setMeta("og:title", meta.title, "property");
  setMeta("og:description", meta.description, "property");
  setMeta("og:url", url, "property");
  setMeta("og:locale", currentLang === "id" ? "id_ID" : "en_US", "property");
  setMeta("twitter:title", meta.title);
  setMeta("twitter:description", meta.description);
}

function updateUIStrings() {
  const t = translations[currentLang];
  $("#nav-docs").text(t.nav.docs);
  $("#nav-examples").text(t.nav.examples);

  // Sidebar Groups
  $(".nav-section").each((index, section) => {
    const $title = $(section).find(".nav-title");
    if (!$title.length) return;
    if (index === 0)
      $title.html(`<i class="ri-book-open-line"></i> ${t.sidebar.intro}`);
    if (index === 1)
      $title.html(`<i class="ri-stack-line"></i> ${t.sidebar.core}`);
    if (index === 2)
      $title.html(`<i class="ri-lightbulb-line"></i> ${t.sidebar.cookbook}`);
  });

  // Sidebar Links
  const sidebarLinks = {
    overview: t.sidebar.overview,
    installation: t.sidebar.installation,
    engines: t.sidebar.engines,
    "engine-guide": t.sidebar.engineGuide,
    interfaces: t.sidebar.interfaces,
    api: t.sidebar.api,
    examples: t.sidebar.usecases,
  };

  Object.entries(sidebarLinks).forEach(([page, text]) => {
    $(`[data-page="${page}"]`).text(text);
  });

  // Sidebar Sub-items (Storage Engines, API & Examples)
  Object.entries({
    ...t.sidebar.engineSub,
    ...t.sidebar.apiSub,
    ...t.sidebar.examplesSub,
  }).forEach(([anchor, text]) => {
    $(`[data-anchor="${anchor}"]`).text(text);
  });

  // Language Buttons
  $(".lang-btn").removeClass("active");
  $(`#lang-${currentLang}`).addClass("active");
}

window.changeLang = function (lang) {
  currentLang = lang;
  localStorage.setItem("omnistorage_lang", lang);

  const url = new URL(window.location.href);
  if (lang === "id") url.searchParams.set("lang", "id");
  else url.searchParams.delete("lang");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);

  updateUIStrings();
  handleRoute();
};

function updateActiveNav(pageName, anchor) {
  // Update Active Main Nav
  $(".nav-item").each((_, el) => {
    $(el).toggleClass("active", el.dataset.page === pageName);
  });

  // Update Active Sub-items
  $(".nav-subitem").each((_, el) => {
    $(el).toggleClass("active", el.dataset.anchor === anchor);
  });
}

let scrollSpyObserver = null;

function initScrollSpy(pageName) {
  if (scrollSpyObserver) scrollSpyObserver.disconnect();
  if (!["api", "engines", "examples"].includes(pageName)) return;

  const headers = contentDiv.querySelectorAll("h2[id]");
  if (headers.length === 0) return;

  scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const anchor = entry.target.id;
          updateActiveNav(pageName, anchor);
        }
      });
    },
    { rootMargin: "-80px 0px -80% 0px" },
  );

  headers.forEach((h) => scrollSpyObserver.observe(h));
}

window.loadPage = async function (pageName, anchor) {
  // Normalize pageName for routing
  if (!pageName || pageName === "/" || pageName === "#") {
    pageName = "home";
  }

  const isHome = pageName === "home";
  const currentPage = $(".nav-item.active").data("page");

  // If already on the page and just moving to an anchor (and same language)
  if (currentPage === pageName && lastLoadedLang === currentLang && anchor) {
    updateActiveNav(pageName, anchor);
    scrollToAnchor(anchor);
    return;
  }

  $(document.body).attr("class", isHome ? "home-mode" : "docs-mode");
  updateSeoMeta(pageName);
  const t = translations[currentLang];

  // Handle Home Components
  if (isHome) {
    $heroWrapper.html(`
            <div class="home-hero">
                <img src="assets/images/icon.png" alt="OmniStorage logo">
                <h1>OmniStorage</h1>
                <p>${t.tagline}</p>
                <div class="home-badges" aria-label="OmniStorage package badges">
                    <a href="https://www.npmjs.com/package/@x-labs-myid/omnistorage" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@x-labs-myid/omnistorage?color=cb3837&label=npm&logo=npm" alt="npm version"></a>
                    <a href="https://www.npmjs.com/package/@x-labs-myid/omnistorage" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dm/@x-labs-myid/omnistorage?color=2ea44f&label=downloads" alt="npm downloads"></a>
                </div>
                <div class="home-quick-install">
                    <code>npm install @x-labs-myid/omnistorage</code>
                    <a class="install-action npm-link" href="https://www.npmjs.com/package/@x-labs-myid/omnistorage" target="_blank" rel="noopener noreferrer" aria-label="View OmniStorage package on npm" title="View on npm"><i class="ri-npmjs-line" aria-hidden="true"></i></a>
                    <button class="install-action copy-btn" type="button" aria-label="Copy installation command" title="Copy install command" onclick="copyInstallCmd(this)"><i class="ri-file-copy-line" aria-hidden="true"></i></button>
                </div>
                <div class="home-hero-btns">
                    <a href="#overview" class="btn-github btn-primary-github">${t.getStarted}</a>
                    <a href="https://github.com/x-labs-myid/omnistorage" class="btn-github" target="_blank" rel="noopener noreferrer">${t.viewGithub}</a>
                </div>
            </div>
        `);
  } else {
    $heroWrapper.empty();
  }

  // Global Footer
  $footerWrapper.html(`
        <footer class="site-footer">
            <div>© 2026 OmniStorage. ${t.footer} Developed by <a href="https://github.com/dyazincahya" class="footer-link-credit" target="_blank" rel="noopener noreferrer">Kang Cahya</a></div>
            <nav class="footer-links" aria-label="Footer navigation">
                <a href="https://github.com/x-labs-myid/omnistorage" class="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="#overview" class="footer-link">${t.nav.docs}</a>
                <a href="#examples" class="footer-link">${t.nav.examples}</a>
            </nav>
        </footer>
    `);

  updateActiveNav(pageName, anchor);

  // Close mobile menus on page load
  $("#header-nav, #sidebar").removeClass("active");
  $("#menu-toggle").attr("aria-expanded", "false");
  $("#menu-toggle i").attr("class", "ri-menu-line");

  try {
    $contentDiv.html(renderPageLoader());
    const path = `./md/${currentLang}/${pageName}.md`;
    const response = await fetch(path);
    if (!response.ok) throw new Error("Page not found");
    const markdown = await response.text();

    $contentDiv.html(renderMarkdown(markdown));
    Prism.highlightAll();
    lastLoadedLang = currentLang;
    initScrollSpy(pageName);

    // Clean up hash if it's home
    if (isHome && window.location.hash) {
      history.replaceState(
        null,
        null,
        window.location.pathname + window.location.search,
      );
    }

    if (anchor) {
      setTimeout(() => scrollToAnchor(anchor), 100);
    } else {
      window.scrollTo(0, 0);
    }
  } catch (error) {
    $contentDiv.html(`<div style="color: red;">Error: ${error.message}</div>`);
  }
};

function scrollToAnchor(anchorId) {
  const $element = $(`#${$.escapeSelector(anchorId)}`);
  if (!$element.length) return;

  const headerOffset = 80;
  const elementPosition = $element[0].getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

// Antigravity Background Logic
// ... (no changes here, keeping it for context)
const $bgCanvas = $("#bg-canvas");
const bgCanvas = $bgCanvas[0];
const icons = [
  "ri-database-2-line",
  "ri-hard-drive-2-line",
  "ri-save-line",
  "ri-cloud-line",
  "ri-server-line",
  "ri-cpu-line",
];
const particles = [];
const particleCount = 15;

if (bgCanvas) {
  for (let i = 0; i < particleCount; i++) {
    const $el = $("<i>", {
      class: `floating-icon ${icons[Math.floor(Math.random() * icons.length)]}`,
    }).css("font-size", `${Math.random() * 40 + 20}px`);
    $bgCanvas.append($el);

    particles.push({
      el: $el[0],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 2,
    });
  }

  function animate() {
    if ($("body").hasClass("home-mode")) {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.x < -50) p.x = window.innerWidth + 50;
        if (p.x > window.innerWidth + 50) p.x = -50;
        if (p.y < -50) p.y = window.innerHeight + 50;
        if (p.y > window.innerHeight + 50) p.y = -50;

        $(p.el).css(
          "transform",
          `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
        );
      });
    }
    requestAnimationFrame(animate);
  }

  animate();

  $(window).on("mousemove", (e) => {
    if (!$("body").hasClass("home-mode")) return;
    particles.forEach((p) => {
      const dx = p.x - e.clientX;
      const dy = p.y - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250) {
        p.vx += dx / 2000;
        p.vy += dy / 2000;
      }
    });
  });
}

window.copyInstallCmd = function (btn) {
  const $btn = $(btn);
  const $icon = $btn.find("i");
  const cmd = "npm install @x-labs-myid/omnistorage";
  navigator.clipboard.writeText(cmd).then(() => {
    $icon.attr("class", "ri-check-line");
    $btn.addClass("copied");
    setTimeout(() => {
      $icon.attr("class", "ri-file-copy-line");
      $btn.removeClass("copied");
    }, 2000);
  });
};

// Initial Load & Routing
window.handleRoute = () => {
  const hash = window.location.hash.replace("#", "");
  const [page, anchor] = hash.split(":");
  // Treat empty, #, or #/ as home
  const pageName = !page || page === "/" ? "home" : page;
  loadPage(pageName, anchor);
};

$(() => {
  updateUIStrings();

  // Mobile Menu Toggle
  $("#menu-toggle").on("click", function () {
    const isHome = $("body").hasClass("home-mode");
    const $target = isHome ? $("#header-nav") : $("#sidebar");
    const isActive = !$target.hasClass("active");

    $target.toggleClass("active", isActive);
    $(this).attr("aria-expanded", String(isActive));
    $(this)
      .find("i")
      .attr("class", isActive ? "ri-close-line" : "ri-menu-line");

    if (isActive) {
      if (isHome) $("#sidebar").removeClass("active");
      else $("#header-nav").removeClass("active");
    }
  });

  // Handle submenu anchors explicitly so page:section links scroll reliably.
  $(".nav-subitem").on("click", function (event) {
    const href = $(this).attr("href");
    if (!href || !href.startsWith("#") || !href.includes(":")) return;

    event.preventDefault();
    const hash = href.slice(1);
    const [page, anchor] = hash.split(":");

    if (window.location.hash !== href) {
      history.pushState(null, "", href);
    }

    loadPage(page, anchor);
  });

  // Listen for back/forward navigation
  $(window).on("hashchange popstate", handleRoute);

  // Initial trigger
  handleRoute();
});
