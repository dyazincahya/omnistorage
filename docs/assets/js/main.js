const contentDiv = document.getElementById("doc-content");
const heroWrapper = document.getElementById("home-hero-wrapper");
const featuresWrapper = document.getElementById("home-features-wrapper");
const footerWrapper = document.getElementById("site-footer-wrapper");

// i18n
let currentLang = localStorage.getItem("omnistorage_lang") || "en";
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
        desc: "Supports over 7 storage engines. Switch engines easily without changing your app's logic flow.",
      },
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
      api: "API Reference",
      cookbook: "Cookbook",
      usecases: "Use Cases",
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
        desc: "Mendukung lebih dari 7 engine penyimpanan. Ganti engine dengan mudah tanpa mengubah alur logika aplikasi Anda.",
      },
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
      api: "Referensi API",
      cookbook: "Buku Resep",
      usecases: "Contoh Kasus",
      logsStats: "Log & Statistik",
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
    api: t.sidebar.api,
    examples: t.sidebar.usecases,
  };

  Object.entries(sidebarLinks).forEach(([page, text]) => {
    const el = document.querySelector(`[data-page="${page}"]`);
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

window.loadPage = async function (pageName) {
  // Normalize pageName for routing
  if (!pageName || pageName === "/" || pageName === "#") {
    pageName = "home";
  }

  const isHome = pageName === "home";
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
                    <code>npm install omnistorage</code>
                    <button class="copy-btn" onclick="copyInstallCmd(this)"><i class="ri-file-copy-line"></i></button>
                </div>
                <div class="home-hero-btns">
                    <a href="#overview" class="btn-github btn-primary-github">${t.getStarted}</a>
                    <a href="https://github.com/dyazincahya/omnistorage" class="btn-github" target="_blank">${t.viewGithub}</a>
                </div>
            </div>
        `;
    featuresWrapper.innerHTML = `
            <div class="features-container">
                <div class="feature-card">
                    <div class="feature-card-icon"><i class="ri-global-line"></i></div>
                    <h3>${t.features.universal.title}</h3>
                    <p>${t.features.universal.desc}</p>
                </div>
                <div class="feature-card">
                    <div class="feature-card-icon"><i class="ri-shield-check-line"></i></div>
                    <h3>${t.features.typesafe.title}</h3>
                    <p>${t.features.typesafe.desc}</p>
                </div>
                <div class="feature-card">
                    <div class="feature-card-icon"><i class="ri-plug-2-line"></i></div>
                    <h3>${t.features.pluggable.title}</h3>
                    <p>${t.features.pluggable.desc}</p>
                </div>
            </div>
        `;
  } else {
    heroWrapper.innerHTML = "";
    featuresWrapper.innerHTML = "";
  }

  // Global Footer
  footerWrapper.innerHTML = `
        <footer class="site-footer">
            <div>© 2026 OmniStorage. ${t.footer}</div>
            <div class="footer-links">
                <a href="https://github.com/dyazincahya/omnistorage" class="footer-link" target="_blank">GitHub</a>
                <a href="#overview" class="footer-link">${t.nav.docs}</a>
                <a href="#examples" class="footer-link">${t.nav.examples}</a>
            </div>
        </footer>
    `;

  // Update Active Nav
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === pageName);
  });

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

    contentDiv.innerHTML = marked.parse(markdown);
    Prism.highlightAll();

    // Clean up hash if it's home
    if (isHome && window.location.hash) {
      history.replaceState(
        null,
        null,
        window.location.pathname + window.location.search,
      );
    }

    window.scrollTo(0, 0);
  } catch (error) {
    contentDiv.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
  }
};

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
  const cmd = "npm install omnistorage";
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
  // Treat empty, #, or #/ as home
  const page = !hash || hash === "/" ? "home" : hash;
  loadPage(page);
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

  // Listen for back/forward navigation
  window.addEventListener("hashchange", handleRoute);

  // Initial trigger
  handleRoute();
});
