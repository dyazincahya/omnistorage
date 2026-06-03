const contentDiv = document.getElementById("doc-content");
const heroWrapper = document.getElementById("home-hero-wrapper");

const footerWrapper = document.getElementById("site-footer-wrapper");

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

// i18n
let currentLang = localStorage.getItem("omnistorage_lang") || "en";
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

function updateUIStrings() {
  const t = translations[currentLang];
  document.getElementById("nav-docs").innerText = t.nav.docs;
  document.getElementById("nav-examples").innerText = t.nav.examples;

  // Sidebar Groups
  document.querySelectorAll(".nav-section").forEach((section, index) => {
    const title = section.querySelector(".nav-title");
    if (title) {
      if (index === 0)
        title.innerHTML = `<i class="ri-book-open-line"></i> ${t.sidebar.intro}`;
      if (index === 1)
        title.innerHTML = `<i class="ri-stack-line"></i> ${t.sidebar.core}`;
      if (index === 2)
        title.innerHTML = `<i class="ri-lightbulb-line"></i> ${t.sidebar.cookbook}`;
    }
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
    const el = document.querySelector(`[data-page="${page}"]`);
    if (el) el.innerText = text;
  });

  // Sidebar Sub-items (Storage Engines, API & Examples)
  Object.entries({
    ...t.sidebar.engineSub,
    ...t.sidebar.apiSub,
    ...t.sidebar.examplesSub,
  }).forEach(([anchor, text]) => {
    const el = document.querySelector(`[data-anchor="${anchor}"]`);
    if (el) el.innerText = text;
  });

  // Language Buttons
  document
    .querySelectorAll(".lang-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`lang-${currentLang}`);
  if (activeBtn) activeBtn.classList.add("active");
}

window.changeLang = function (lang) {
  currentLang = lang;
  localStorage.setItem("omnistorage_lang", lang);
  updateUIStrings();
  handleRoute();
};

function updateActiveNav(pageName, anchor) {
  // Update Active Main Nav
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === pageName);
  });

  // Update Active Sub-items
  document.querySelectorAll(".nav-subitem").forEach((el) => {
    el.classList.toggle("active", el.dataset.anchor === anchor);
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
  const currentPage = document.querySelector(".nav-item.active")?.dataset.page;

  // If already on the page and just moving to an anchor (and same language)
  if (currentPage === pageName && lastLoadedLang === currentLang && anchor) {
    updateActiveNav(pageName, anchor);
    scrollToAnchor(anchor);
    return;
  }

  document.body.className = isHome ? "home-mode" : "docs-mode";
  const t = translations[currentLang];

  // Handle Home Components
  if (isHome) {
    heroWrapper.innerHTML = `
            <div class="home-hero">
                <img src="assets/images/icon.png" alt="Store Icon">
                <h1>OmniStorage</h1>
                <p>${t.tagline}</p>
                <div class="home-quick-install">
                    <code>npm install @x-labs-myid/omnistorage</code>
                    <button class="copy-btn" onclick="copyInstallCmd(this)"><i class="ri-file-copy-line"></i></button>
                </div>
                <div class="home-hero-btns">
                    <a href="#overview" class="btn-github btn-primary-github">${t.getStarted}</a>
                    <a href="https://github.com/x-labs-myid/omnistorage" class="btn-github" target="_blank">${t.viewGithub}</a>
                </div>
            </div>
        `;
  } else {
    heroWrapper.innerHTML = "";
  }

  // Global Footer
  footerWrapper.innerHTML = `
        <footer class="site-footer">
            <div>© 2026 OmniStorage. ${t.footer} Developed by <a href="https://github.com/dyazincahya" class="footer-link-credit" target="_blank">Kang Cahya</a></div>
            <div class="footer-links">
                <a href="https://github.com/x-labs-myid/omnistorage" class="footer-link" target="_blank">GitHub</a>
                <a href="#overview" class="footer-link">${t.nav.docs}</a>
                <a href="#examples" class="footer-link">${t.nav.examples}</a>
            </div>
        </footer>
    `;

  updateActiveNav(pageName, anchor);

  // Close mobile menus on page load
  document.getElementById("header-nav")?.classList.remove("active");
  document.getElementById("sidebar")?.classList.remove("active");
  const toggleIcon = document.querySelector("#menu-toggle i");
  if (toggleIcon) toggleIcon.className = "ri-menu-line";

  try {
    contentDiv.innerHTML = "<p>Loading...</p>";
    const path = `./md/${currentLang}/${pageName}.md`;
    const response = await fetch(path);
    if (!response.ok) throw new Error("Page not found");
    const markdown = await response.text();

    contentDiv.innerHTML = renderMarkdown(markdown);
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
    contentDiv.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
  }
};

function scrollToAnchor(anchorId) {
  const element = document.getElementById(anchorId);
  if (!element) return;

  const headerOffset = 80;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

// Antigravity Background Logic
// ... (no changes here, keeping it for context)
const bgCanvas = document.getElementById("bg-canvas");
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
    const el = document.createElement("i");
    el.className = `floating-icon ${icons[Math.floor(Math.random() * icons.length)]}`;
    const size = Math.random() * 40 + 20;
    el.style.fontSize = `${size}px`;
    bgCanvas.appendChild(el);

    particles.push({
      el,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 2,
    });
  }

  function animate() {
    if (document.body.classList.contains("home-mode")) {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.x < -50) p.x = window.innerWidth + 50;
        if (p.x > window.innerWidth + 50) p.x = -50;
        if (p.y < -50) p.y = window.innerHeight + 50;
        if (p.y > window.innerHeight + 50) p.y = -50;

        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
      });
    }
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("mousemove", (e) => {
    if (!document.body.classList.contains("home-mode")) return;
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
  const cmd = "npm install @x-labs-myid/omnistorage";
  navigator.clipboard.writeText(cmd).then(() => {
    const icon = btn.querySelector("i");
    icon.className = "ri-check-line";
    btn.classList.add("copied");
    setTimeout(() => {
      icon.className = "ri-file-copy-line";
      btn.classList.remove("copied");
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

document.addEventListener("DOMContentLoaded", () => {
  updateUIStrings();

  // Mobile Menu Toggle
  const menuToggle = document.getElementById("menu-toggle");
  const headerNav = document.getElementById("header-nav");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isHome = document.body.classList.contains("home-mode");
      const target = isHome ? headerNav : sidebar;
      const isActive = target.classList.toggle("active");

      // Update icon
      const icon = menuToggle.querySelector("i");
      if (icon) {
        icon.className = isActive ? "ri-close-line" : "ri-menu-line";
      }

      // If opening sidebar, close header nav and vice versa
      if (isActive) {
        if (isHome) sidebar.classList.remove("active");
        else headerNav.classList.remove("active");
      }
    });
  }

  // Handle submenu anchors explicitly so page:section links scroll reliably.
  document.querySelectorAll(".nav-subitem").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#") || !href.includes(":")) return;

      event.preventDefault();
      const hash = href.slice(1);
      const [page, anchor] = hash.split(":");

      if (window.location.hash !== href) {
        history.pushState(null, "", href);
      }

      loadPage(page, anchor);
    });
  });

  // Listen for back/forward navigation
  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("popstate", handleRoute);

  // Initial trigger
  handleRoute();
});
