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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function transformCodeTabs(markdown) {
  let groupIndex = 0;

  return markdown.replace(/:::code-tabs\s*\n([\s\S]*?)\n:::/g, (_, block) => {
    const tabs = [];
    const tabRegex = /@tab\s+([^\n]+)\n\s*```([\w-]*)\n([\s\S]*?)```/g;
    let match;

    while ((match = tabRegex.exec(block)) !== null) {
      tabs.push({
        label: match[1].trim(),
        language: match[2].trim() || "text",
        code: match[3].replace(/\n$/, ""),
      });
    }

    if (!tabs.length) return block;

    const currentGroup = groupIndex++;
    const buttons = tabs
      .map(
        (tab, index) =>
          `<button type="button" class="code-tab-button${index === 0 ? " active" : ""}" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-code-tab-group="${currentGroup}" data-code-tab-index="${index}">${escapeHtml(tab.label)}</button>`,
      )
      .join("");

    const panels = tabs
      .map(
        (tab, index) =>
          `<div class="code-tab-panel${index === 0 ? " active" : ""}" role="tabpanel" data-code-tab-group="${currentGroup}" data-code-tab-index="${index}"><pre><code class="language-${escapeHtml(tab.language)}">${escapeHtml(tab.code)}</code></pre></div>`,
      )
      .join("");

    return `<div class="code-tabs" data-code-tab-group="${currentGroup}"><div class="code-tab-buttons" role="tablist" aria-label="Code examples">${buttons}</div>${panels}</div>`;
  });
}

function renderMarkdown(markdown) {
  configureMarkdownRenderer();
  return marked.parse(transformCodeTabs(markdown));
}

function renderPageLoader() {
  return `
    <div class="page-loader" role="status" aria-live="polite" aria-label="Loading documentation page">
      <span class="page-loader-spinner" aria-hidden="true"></span>
      <span class="page-loader-text">Loading...</span>
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
    homeFlow: {
      title: "How OmniStorage works",
      subtitle:
        "Different storage engines go through one universal API, then return a consistent result shape.",
      storagesLabel: "Supported Storage",
      storagesDesc: "Multiple engines, one API",
      omniLabel: "OmniStorage",
      inputLabel: "Universal Input",
      inputDesc: "Save / insert with Basic API syntax",
      outputLabel: "Consistent Output",
      outputDesc: "Always returns the same response shape",
      coreDesc: "Universal API Layer",
      coreMeta: "Routes • Normalizes • Returns",
      storages: [
        { name: "LocalStorage", icon: "ri-database-line" },
        { name: "SessionStorage", icon: "ri-history-line" },
        { name: "Cookies", icon: "ri-cookie-line" },
        { name: "Cache Storage", icon: "ri-archive-line" },
        { name: "IndexedDB", icon: "ri-hard-drive-2-line" },
        { name: "Memory", icon: "ri-temp-hot-line" },
        { name: "File System", icon: "ri-folder-open-line" },
        { name: "SQLite Server", icon: "ri-server-line" },
        { name: "SQLite Client WASM", icon: "ri-globe-line" },
      ],
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
        "command-payload": "JSON Payload",
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
        "command-runner": "JSON Command Runner",
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
    homeFlow: {
      title: "Cara kerja OmniStorage",
      subtitle:
        "Berbagai engine storage masuk lewat satu API universal, lalu menghasilkan format respon yang konsisten.",
      storagesLabel: "Storage yang Didukung",
      storagesDesc: "Banyak engine, satu API",
      omniLabel: "OmniStorage",
      inputLabel: "Input Universal",
      inputDesc: "Save / insert dengan sintaks Basic API",
      outputLabel: "Output Konsisten",
      outputDesc: "Selalu mengembalikan bentuk respon yang sama",
      coreDesc: "Universal API Layer",
      coreMeta: "Routes • Normalizes • Returns",
      storages: [
        { name: "LocalStorage", icon: "ri-database-line" },
        { name: "SessionStorage", icon: "ri-history-line" },
        { name: "Cookies", icon: "ri-cookie-line" },
        { name: "Cache Storage", icon: "ri-archive-line" },
        { name: "IndexedDB", icon: "ri-hard-drive-2-line" },
        { name: "Memory", icon: "ri-temp-hot-line" },
        { name: "File System", icon: "ri-folder-open-line" },
        { name: "SQLite Server", icon: "ri-server-line" },
        { name: "SQLite Client WASM", icon: "ri-globe-line" },
      ],
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
        "command-payload": "JSON Payload",
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
        "command-runner": "JSON Command Runner",
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
        "Explore OmniStorage API methods for JSON payloads, create, save, find, update, delete, batch operations, namespaces, transactions, and statistics.",
    },
    "logs-stats": {
      title: "OmniStorage Logs and Statistics",
      description:
        "Inspect OmniStorage activity logs and storage statistics for debugging and monitoring storage usage.",
    },
    examples: {
      title: "OmniStorage Examples — JavaScript Storage Use Cases",
      description:
        "Browse OmniStorage examples for authentication, preferences, multi-tab sync, shopping carts, API cache, form drafts, JSON command runners, audit logs, and testing.",
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
        "Jelajahi API OmniStorage untuk JSON payload, create, save, find, update, delete, operasi batch, namespace, transaksi, dan statistik.",
    },
    "logs-stats": {
      title: "Log dan Statistik OmniStorage",
      description:
        "Periksa log aktivitas dan statistik penyimpanan OmniStorage untuk debugging dan monitoring penggunaan storage.",
    },
    examples: {
      title: "Contoh OmniStorage — Use Case Storage JavaScript",
      description:
        "Lihat contoh OmniStorage untuk autentikasi, preferensi, sync multi-tab, shopping cart, API cache, draft form, JSON command runner, audit log, dan testing.",
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
    const storageItems = t.homeFlow.storages
      .map(
        (storage) =>
          `<li><i class="${storage.icon}" aria-hidden="true"></i><span>${storage.name}</span></li>`,
      )
      .join("");

    $heroWrapper.html(`
            <div class="home-hero">
                <section class="home-flow" aria-label="${t.homeFlow.title}">
                    <div class="home-flow-diagram" aria-label="${t.homeFlow.title}">
                        <div class="home-flow-card home-flow-storage">
                            <div class="home-flow-card-title">
                                <span class="home-flow-card-icon"><i class="ri-database-2-line" aria-hidden="true"></i></span>
                                <span><strong>${t.homeFlow.storagesLabel}</strong><small>${t.homeFlow.storagesDesc}</small></span>
                            </div>
                            <ul>${storageItems}</ul>
                        </div>
                        <div class="home-flow-connector home-flow-connector-left" aria-hidden="true"><span><i class="ri-arrow-right-line"></i></span></div>
                        <div class="home-flow-core">
                            <img class="home-flow-core-logo" src="assets/images/icon.png" alt="OmniStorage logo">
                            <strong>${t.homeFlow.omniLabel}</strong>
                            <p>${t.tagline}</p>
                            <div class="home-badges home-flow-badges" aria-label="OmniStorage package badges">
                                <a href="https://www.npmjs.com/package/@x-labs-myid/omnistorage" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@x-labs-myid/omnistorage?color=cb3837&label=npm&logo=npm" alt="npm version"></a>
                                <a href="https://www.npmjs.com/package/@x-labs-myid/omnistorage" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dm/@x-labs-myid/omnistorage?color=2ea44f&label=downloads" alt="npm downloads"></a>
                            </div>
                            <div class="home-quick-install home-flow-install">
                                <code>npm install @x-labs-myid/omnistorage</code>
                                <a class="install-action npm-link" href="https://www.npmjs.com/package/@x-labs-myid/omnistorage" target="_blank" rel="noopener noreferrer" aria-label="View OmniStorage package on npm" title="View on npm"><i class="ri-npmjs-line" aria-hidden="true"></i></a>
                                <button class="install-action copy-btn" type="button" aria-label="Copy installation command" title="Copy install command" onclick="copyInstallCmd(this)"><i class="ri-file-copy-line" aria-hidden="true"></i></button>
                            </div>
                            <a href="#overview" class="btn-github btn-primary-github home-flow-core-cta">${t.getStarted}</a>
                        </div>
                        <div class="home-flow-connector home-flow-connector-right" aria-hidden="true"><span><i class="ri-arrow-right-line"></i></span></div>
                        <div class="home-flow-card home-flow-result home-flow-accordion">
                            <div class="home-flow-io-block active">
                                <button class="home-flow-accordion-toggle" type="button" aria-expanded="true">
                                    <span class="home-flow-card-title">
                                        <span class="home-flow-card-icon code"><i class="ri-code-s-slash-line" aria-hidden="true"></i></span>
                                        <span><strong>${t.homeFlow.inputLabel}</strong><small>${t.homeFlow.inputDesc}</small></span>
                                    </span>
                                    <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
                                </button>
                                <div class="home-flow-accordion-panel">
                                    <pre><code class="language-javascript">const result = await store
  .engine("indexeddb")
  .save("user:1", {
    name: "Kang Cahya",
    role: "developer"
  });</code></pre>
                                </div>
                            </div>
                            <div class="home-flow-io-block">
                                <button class="home-flow-accordion-toggle" type="button" aria-expanded="false">
                                    <span class="home-flow-card-title">
                                        <span class="home-flow-card-icon success"><i class="ri-check-line" aria-hidden="true"></i></span>
                                        <span><strong>${t.homeFlow.outputLabel}</strong><small>${t.homeFlow.outputDesc}</small></span>
                                    </span>
                                    <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
                                </button>
                                <div class="home-flow-accordion-panel">
                                    <pre><code class="language-javascript">{
  ok: true,
  data: {
    name: "Kang Cahya",
    role: "developer"
  },
  message: "Upsert successful",
  engine: "indexeddb",
  timestamp: 1717200010000
}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
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
  $("#header-nav").removeClass("active");
  closeMobileSidebar();

  try {
    $contentDiv.html(renderPageLoader());
    const path = `./md/${currentLang}/${pageName}.md`;
    const response = await fetch(path);
    if (!response.ok) throw new Error("Page not found");
    const markdown = await response.text();

    $contentDiv.html(renderMarkdown(markdown));
    Prism.highlightAll();
    initCodeTabs();
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

function initCodeTabs() {
  $(".code-tab-button")
    .off("click.codeTabs")
    .on("click.codeTabs", function () {
      const $button = $(this);
      const group = $button.data("code-tab-group");
      const index = $button.data("code-tab-index");

      $(`.code-tab-button[data-code-tab-group="${group}"]`)
        .removeClass("active")
        .attr("aria-selected", "false");
      $button.addClass("active").attr("aria-selected", "true");

      $(`.code-tab-panel[data-code-tab-group="${group}"]`).removeClass(
        "active",
      );
      $(
        `.code-tab-panel[data-code-tab-group="${group}"][data-code-tab-index="${index}"]`,
      ).addClass("active");
    });
}

function closeMobileSidebar() {
  $("#sidebar").removeClass("active");
  $("#menu-toggle").attr("aria-expanded", "false");
  $("#menu-toggle i").attr("class", "ri-menu-line");
}

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
  $("#menu-toggle").on("click", function (event) {
    event.stopPropagation();
    const $target = $("#sidebar");
    const isActive = !$target.hasClass("active");

    $target.toggleClass("active", isActive);
    $("#header-nav").removeClass("active");
    $(this).attr("aria-expanded", String(isActive));
    $(this)
      .find("i")
      .attr("class", isActive ? "ri-close-line" : "ri-menu-line");
  });

  $(document).on("click", (event) => {
    const $sidebar = $("#sidebar");
    if (!$sidebar.hasClass("active")) return;
    if ($(event.target).closest("#sidebar, #menu-toggle").length) return;
    closeMobileSidebar();
  });

  $(document).on("click", ".home-flow-accordion-toggle", function () {
    const $block = $(this).closest(".home-flow-io-block");
    if ($block.hasClass("active")) return;

    const $accordion = $block.closest(".home-flow-accordion");

    $accordion
      .find(".home-flow-io-block")
      .removeClass("active")
      .find(".home-flow-accordion-toggle")
      .attr("aria-expanded", "false");

    $block.addClass("active");
    $(this).attr("aria-expanded", "true");
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

    closeMobileSidebar();
    loadPage(page, anchor);
  });

  // Listen for back/forward navigation
  $(window).on("hashchange popstate", handleRoute);

  // Initial trigger
  handleRoute();
});
