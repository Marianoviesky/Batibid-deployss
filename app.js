/**
 * BatiBid Redesign - Client-side Interactive Application Logic
 * Implements: Dynamic template preloading, Hash-based routing, Mock database,
 * 360° interactive Canvas, Payment simulation, Drawer search panel, Password validation.
 */

// ==========================================
// MOCK DATABASE & STATE
// (mockDb, mockUsers, mockBiens, mockTransactions, mockIncidents,
//  mockNotifications - définis dans js/db.js chargé avant ce fichier)
// ==========================================

// Global App State
let state = {
  currentUser: null,
  activeView: "#home",
  authOnboardingStep: 1,
  authSelectedRole: "",
  authLocataireGere: false,
  currentFilter: {
    city: "",
    radius: 5,
    types: ["appartement", "maison", "bureau"], // default checked
    minPrice: 0,
    maxPrice: 2000000,
    rooms: 1 // default active
  },
  currentCoords: null,
  catalogViewMode: 'list',
  currentViewingPropertyId: null,
  activeTestimonialIdx: 0,
  panoramaYaw: 0,
  isDraggingPanorama: false,
  lastMouseX: 0
};

// ==========================================
// CLIENT ROUTER & DYNAMIC PRELOADER
// ==========================================
async function loadAllPages() {
  // Standalone multi-page architecture: each page has its own HTML structure.
  return;
}

function getCurrentPageId() {
  if (document.body && document.body.dataset && document.body.dataset.page) {
    return document.body.dataset.page;
  }
  const currentSection = document.querySelector(".view-section");
  if (currentSection && currentSection.id) {
    return currentSection.id;
  }
  const path = window.location.pathname.toLowerCase();
  const pages = ['home', 'gerer', 'mise-en-location', 'construire', 'juridique', 'corporate-housing', 'private-market', 'partenariats', 'blog', 'contact', 'detail'];
  for (const p of pages) {
    if (path.includes(p)) return p;
  }
  return "home";
}

function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      const targetHash = link.getAttribute("href");
      if (targetHash && targetHash !== "#" && !targetHash.startsWith("#!")) {
        const anchorEl = document.querySelector(targetHash);
        if (anchorEl) {
          anchorEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDemoModal();
      closeGererDemoModal();
      closeGererModal();
      closeCorporateModal();
    }
  });
  handleRoute();
}

function handleRoute() {
  const currentPageId = getCurrentPageId();
  const hash = window.location.hash || "";
  
  // Parse query parameters from hash or search query
  let queryParams = {};
  const searchStr = window.location.search ? window.location.search.substring(1) : "";
  if (searchStr) {
    searchStr.split("&").forEach(param => {
      if (!param) return;
      const kv = param.split("=");
      queryParams[kv[0]] = decodeURIComponent(kv[1] || "");
    });
  }
  if (hash.includes("?")) {
    const parts = hash.split("?");
    const queryStr = parts[1];
    queryStr.split("&").forEach(param => {
      if (!param) return;
      const kv = param.split("=");
      queryParams[kv[0]] = decodeURIComponent(kv[1] || "");
    });
  }

  // If there's an id in query params and the view is #detail, load that property
  if ((currentPageId === "detail" || hash.startsWith("#detail")) && queryParams.id) {
    state.currentViewingPropertyId = parseInt(queryParams.id, 10);
  }

  // Determine active view identifier
  let viewId = "#" + currentPageId;
  state.activeView = viewId;
  
  // Make sure the section on the current page is active
  const sections = document.querySelectorAll(".view-section");
  if (sections.length > 1) {
    sections.forEach(sec => sec.classList.remove("active"));
    let targetView = document.querySelector("#" + currentPageId);
    if (!targetView) targetView = document.querySelector("#home");
    if (targetView) targetView.classList.add("active");
  } else if (sections.length === 1) {
    sections[0].classList.add("active");
  }
  
  // Highlight active link in header nav menu
  document.querySelectorAll("#header-nav-menu .nav-link").forEach(link => {
    const href = link.getAttribute("href") || "";
    const cleanHref = href.replace(/^\/|\.html$|^#/g, "");
    if (cleanHref === currentPageId || (currentPageId === "home" && (cleanHref === "" || cleanHref === "index"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Highlight active link in mobile menu
  document.querySelectorAll("#mobile-nav-links .mobile-nav-link").forEach(link => {
    const href = link.getAttribute("href") || "";
    const cleanHref = href.replace(/^\/|\.html$|^#/g, "");
    if (cleanHref === currentPageId || (currentPageId === "home" && (cleanHref === "" || cleanHref === "index"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Dynamic Page Titles & SEO meta
  const routeTitles = {
    "#home": "BatiBid - Refonte Digitale & Gestion Locative au Bénin",
    "#gerer": "Gérer mon patrimoine | BatiBid",
    "#mise-en-location": "Mise en location de biens | BatiBid",
    "#construire": "Construire & Rénover au Bénin | BatiBid",
    "#juridique": "Sécurisation Juridique & Foncière | BatiBid",
    "#corporate-housing": "Corporate Housing | BatiBid",
    "#private-market": "Private Market | BatiBid Off-Market",
    "#partenariats": "Partenariats Stratégiques | BatiBid",
    "#blog": "Blog Immobilier & Foncier | BatiBid",
    "#contact": "Contact & Siège Social | BatiBid",
    "#detail": "Détails du bien immobilier | BatiBid"
  };
  if (routeTitles[viewId] && !document.title) {
    document.title = routeTitles[viewId];
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && !metaDesc.getAttribute("content")) {
    if (viewId === '#corporate-housing') {
      metaDesc.setAttribute('content', 'Solutions de logement pensées pour la mobilité de vos collaborateurs au Bénin. BatiBid accompagne les entreprises dans la recherche, la vérification, l\'installation et le suivi du logement avec les offres Essential et Premium.');
    } else {
      metaDesc.setAttribute('content', 'Plateforme proptech de confiance au Bénin pour propriétaires, locataires et professionnels. Gérez vos biens, trouvez votre prochain logement ou menez à bien vos projets.');
    }
  }

  // Hide footer & scroll bar on full-screen pages (dashboard, pay, invoices)
  const fullScreenPages = ["#dashboard", "#pay", "#invoice-detail-view"];
  const footer = document.querySelector(".footer");
  const scrollBar = document.getElementById("scroll-progress-bar");
  const mobileStickyCta = document.getElementById("mobile-sticky-cta");
  const isDashboard = fullScreenPages.some(p => hash.startsWith(p));
  if (footer)          footer.style.display          = isDashboard ? "none" : "";
  if (scrollBar)       scrollBar.style.display       = isDashboard ? "none" : "";
  if (mobileStickyCta) mobileStickyCta.style.display = (isDashboard || state.currentUser) ? "none" : "";

  // Toggle dashboard body class
  if (isDashboard) {
    document.body.classList.add("dashboard-active-mode");
  } else {
    document.body.classList.remove("dashboard-active-mode");
  }

  // Handle in-page hash anchor scrolling if present
  if (hash && hash !== "#" && hash !== "#!" && hash !== ("#" + currentPageId)) {
    const targetAnchor = document.querySelector(hash);
    if (targetAnchor) {
      setTimeout(() => {
        targetAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  } else {
    window.scrollTo(0, 0);
  }

  // Trigger view-specific initializations
  onViewLoad(viewId + (hash ? hash : ""));
}

function onViewLoad(hash) {
  // Trigger scroll animations on all public pages
  const publicPages = ['#home', '#gerer', '#mise-en-location', '#trouver', '#construire', '#juridique', '#private-market', '#corporate-housing', '#partenariats', '#blog', '#contact'];
  if (publicPages.some(p => hash.startsWith(p))) {
    setTimeout(initScrollAnimations, 150);
  }

  if (hash === "#home" || hash === "" || hash === "#") {
    renderTestimonials();
    renderTestimonialsGrid();
    setTimeout(initCounterUp, 250);
    setTimeout(triggerHeroReveals, 100);
    // Initialize interactive tabs and team workflow simulator
    setTimeout(() => {
      initExpertiseTabs();
      initWorkflowSimulator();
    }, 100);
  } else if (hash.startsWith("#gerer")) {
    const savedTab = localStorage.getItem('bb_gerer_tab');
    if (savedTab) {
      localStorage.removeItem('bb_gerer_tab');
      setTimeout(() => switchGererPricingTab(savedTab), 150);
    } else if (hash.includes("digitale")) {
      setTimeout(() => switchGererPricingTab('digitale'), 150);
    } else if (hash.includes("serenite")) {
      setTimeout(() => switchGererPricingTab('serenite'), 150);
    }
    setTimeout(initCounterUp, 250);
    setTimeout(triggerGererReveals, 100);
    setTimeout(initGererSolutionsMotion, 300);
    if (hash.includes("tech") || hash.includes("section=4") || hash.includes("insights")) {
      setTimeout(() => {
        const techSec = document.getElementById("gerer-tech");
        if (techSec) {
          techSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  } else if (hash.startsWith("#mise-en-location")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerMiseEnLocationReveals, 100);
    if (hash.includes("b2b")) {
      setTimeout(() => switchMiseEnLocationTab('b2b'), 150);
    }
  } else if (hash.startsWith("#construire")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerConstruireReveals, 100);
    setTimeout(initConstruirePiliersMotion, 300);
    setTimeout(initHeroChantierCarousel, 350);
    if (hash.includes("comment-ca-marche")) {
      setTimeout(() => {
        const sec = document.getElementById("comment-ca-marche");
        if (sec) {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  } else if (hash.startsWith("#juridique")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerJuridiqueReveals, 100);
  } else if (hash.startsWith("#private-market")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerPrivateMarketReveals, 100);
    setTimeout(initPrivatePipelineGlowLoop, 200);
    setTimeout(initPrivateTeasersAutoScroll, 300);
    if (hash.includes("acquereur")) {
      setTimeout(() => switchPrivateTrack('acquereur', false), 150);
    } else if (hash.includes("vendeur")) {
      setTimeout(() => switchPrivateTrack('vendeur', false), 150);
    }
  } else if (hash.startsWith("#corporate-housing")) {
    setTimeout(initCounterUp, 200);
    setTimeout(initScrollAnimations, 100);
    if (hash.includes("premium")) {
      setTimeout(() => switchCorporateTab('premium'), 150);
    } else if (hash.includes("pass")) {
      setTimeout(() => switchCorporateTab('pass'), 150);
    } else if (hash.includes("essential")) {
      setTimeout(() => switchCorporateTab('essential'), 150);
    }
  } else if (hash.startsWith("#partenariats")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerPartenariatsReveals, 100);
  } else if (hash.startsWith("#blog")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerBlogReveals, 100);
  } else if (hash.startsWith("#contact")) {
    setTimeout(initCounterUp, 250);
    setTimeout(triggerContactReveals, 100);
  } else if (hash === "#trouver") {
    showPropertySkeletons(6);
    initSearchFilters();
    setTimeout(() => {
      renderPropertyList();
      updateRadiusSlider();
    }, 600);
  } else if (hash === "#detail") {
    renderPropertyDetails();
  } else if (hash === "#pay") {
    initPaymentForm();
  } else if (hash === "#invoices") {
    renderInvoicesTable();
  } else if (hash === "#dashboard") {
    renderDashboard();
  } else if (hash === "#auth") {
    toggleAuthForm('register');
  }
}

function navigateTo(target) {
  if (!target) return;
  if (target.startsWith("#")) {
    const anchorEl = document.querySelector(target);
    if (anchorEl) {
      anchorEl.scrollIntoView({ behavior: "smooth" });
      window.location.hash = target;
      return;
    }
    const pageId = target.replace("#", "");
    window.location.href = pageId;
    return;
  }
  window.location.href = target;
}

// ==========================================
// MOBILE MENU
// ==========================================
function toggleMobileMenu() {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (!overlay) return;
  const isOpen = overlay.classList.contains("open");
  if (isOpen) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  } else {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

// Close mobile menu when clicking on the backdrop
document.addEventListener("DOMContentLoaded", function() {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (overlay) {
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) {
        toggleMobileMenu();
      }
    });
  }
  
  // Initialize radius slider fill on first load
  setTimeout(() => {
    updateRadiusSlider();
  }, 800);
});

// Update radius slider track fill dynamically
function updateRadiusSlider() {
  const slider = document.getElementById("search-radius-input");
  if (!slider) return;
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #D95E2B 0%, #D95E2B ${pct}%, #E2E2E2 ${pct}%, #E2E2E2 100%)`;
}

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
window.addEventListener("scroll", function() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = pct + "%";
}, { passive: true });

// ==========================================
// COUNTER-UP ANIMATION (IntersectionObserver + Luxury Deceleration)
// ==========================================
function animateCounter(el) {
  const rawTarget = el.dataset.target || el.textContent;
  const isFloat = rawTarget.includes('.') || el.dataset.decimals;
  const target = parseFloat(rawTarget);
  if (isNaN(target)) return;
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : (isFloat ? 1 : 0);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = parseInt(el.dataset.duration, 10) || 1600;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Luxury cubic ease-out deceleration: 1 - (1 - progress)^3
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = progress === 1 ? target : (target * easeOut);
    
    let formattedVal;
    if (decimals > 0) {
      formattedVal = currentVal.toFixed(decimals).replace('.', ',');
    } else {
      formattedVal = Math.round(currentVal).toLocaleString('fr-FR');
    }
    
    el.textContent = `${prefix}${formattedVal}${suffix}`;
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.classList.add('counter-pulse');
      setTimeout(() => el.classList.remove('counter-pulse'), 800);
    }
  }
  
  requestAnimationFrame(updateCount);
}

function initCounterUp() {
  const counters = document.querySelectorAll(".counter-num[data-target]");
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = "1";
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  counters.forEach(c => obs.observe(c));
}

// ==========================================
// LUXURY MOTION DESIGN: HERO REVEALS & STAGGER
// ==========================================
function triggerHeroReveals() {
  const homeHero = document.querySelector('#home .home-hero');
  if (!homeHero) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = homeHero.querySelectorAll('.reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Hero image scale unmasking
  const heroImg = homeHero.querySelector('.hero-img-cinematic');
  if (heroImg) {
    setTimeout(() => {
      heroImg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Social proof avatar stack cascade
  const avatars = homeHero.querySelectorAll('.hero-avatar-stack img');
  avatars.forEach((img, idx) => {
    setTimeout(() => {
      img.classList.add('is-visible');
    }, 500 + idx * 80);
  });

  // 4. Sparkline SVG drawing
  const sparklinePath = homeHero.querySelector('.sparkline-draw-path');
  const sparklineArea = homeHero.querySelector('.sparkline-area');
  if (sparklinePath) {
    setTimeout(() => {
      sparklinePath.classList.add('is-drawn');
      if (sparklineArea) sparklineArea.classList.add('is-drawn');
    }, 380);
  }
}

// ==========================================
// LUXURY MOTION DESIGN: GÉRER HERO REVEALS
// ==========================================
function triggerGererReveals() {
  const gererSection = document.querySelector('#gerer');
  if (!gererSection) return;

  // 1. Reveal headline lines sequentially
  const lines = gererSection.querySelectorAll('.gerer-hero-section .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Hero image scale-in
  const heroImg = gererSection.querySelector('.gerer-hero-img.hero-img-cinematic');
  if (heroImg) {
    setTimeout(() => {
      heroImg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Mini-chart histogram bars rise
  const miniChart = gererSection.querySelector('.kpi-mini-chart');
  if (miniChart) {
    setTimeout(() => {
      miniChart.classList.add('is-drawn');
    }, 450);
  }

  // 4. Avatars cascade
  const avatars = gererSection.querySelectorAll('.gerer-avatar-group .gerer-avatar');
  avatars.forEach((av, idx) => {
    setTimeout(() => {
      av.classList.add('is-visible');
    }, 500 + idx * 80);
  });
}

// ==========================================
// LUXURY MOTION DESIGN: MISE EN LOCATION HERO REVEALS
// ==========================================
function triggerMiseEnLocationReveals() {
  const locSection = document.querySelector('#mise-en-location');
  if (!locSection) return;

  // 1. Reveal headline lines sequentially
  const lines = locSection.querySelectorAll('.loc-hero .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Hero image scale-in
  const heroImg = locSection.querySelector('.loc-hero-main-img.hero-img-cinematic');
  if (heroImg) {
    setTimeout(() => {
      heroImg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Avatars cascade
  const avatars = locSection.querySelectorAll('.loc-avatar-stack img');
  avatars.forEach((av, idx) => {
    setTimeout(() => {
      av.classList.add('is-visible');
    }, 450 + idx * 75);
  });
}

// ==========================================
// LUXURY MOTION DESIGN: CONSTRUIRE & RÉNOVER HERO REVEALS
// ==========================================
function triggerConstruireReveals() {
  const construireSection = document.querySelector('#construire');
  if (!construireSection) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = construireSection.querySelectorAll('.construire-hero .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Hero image scale-in unmasking
  const heroImg = construireSection.querySelector('.chantier-hero-img.hero-img-cinematic');
  if (heroImg) {
    setTimeout(() => {
      heroImg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Hero glassmorphism progress bar fill
  const heroFill = construireSection.querySelector('#hero-progress-fill');
  if (heroFill) {
    setTimeout(() => {
      heroFill.classList.add('is-filled');
    }, 420);
  }

  // 4. Social proof avatars stack cascade
  const avatars = construireSection.querySelectorAll('.hero-avatar-stack img');
  avatars.forEach((av, idx) => {
    setTimeout(() => {
      av.classList.add('is-visible');
    }, 480 + idx * 75);
  });
}

// ==========================================
// LUXURY MOTION DESIGN: JURIDIQUE & FONCIER HERO REVEALS
// ==========================================
function triggerJuridiqueReveals() {
  const juridiqueSection = document.querySelector('#juridique');
  if (!juridiqueSection) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = juridiqueSection.querySelectorAll('.juridique-hero .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Cadastre drone image unmasking
  const droneImg = juridiqueSection.querySelector('.cadastre-drone-img.hero-img-cinematic');
  if (droneImg) {
    setTimeout(() => {
      droneImg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Cadastral overlay grid activation
  const cadastreGrid = juridiqueSection.querySelector('.cadastre-overlay-grid');
  if (cadastreGrid) {
    setTimeout(() => {
      cadastreGrid.classList.add('is-active');
    }, 350);
  }

  // 4. Social proof avatars stack cascade
  const avatars = juridiqueSection.querySelectorAll('.hero-avatar-stack img');
  avatars.forEach((av, idx) => {
    setTimeout(() => {
      av.classList.add('is-visible');
    }, 450 + idx * 75);
  });
}

// ==========================================
// LUXURY MOTION DESIGN: PRIVATE MARKET HERO REVEALS
// ==========================================
function triggerPrivateMarketReveals() {
  const pmSection = document.querySelector('#private-market');
  if (!pmSection) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = pmSection.querySelectorAll('.pm-hero .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Hero image scale-in unmasking
  const heroImg = pmSection.querySelector('.pm-hero-main-img.hero-img-cinematic');
  if (heroImg) {
    setTimeout(() => {
      heroImg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Pipeline progress line drawing
  const pipeLine = pmSection.querySelector('#pm-hero-pipeline-line');
  if (pipeLine) {
    setTimeout(() => {
      pipeLine.classList.add('is-drawn');
    }, 400);
  }
}

// ==========================================
// LUXURY MOTION DESIGN: PARTENARIATS HERO REVEALS
// ==========================================
function triggerPartenariatsReveals() {
  const partSection = document.querySelector('#partenariats');
  if (!partSection) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = partSection.querySelectorAll('.partner-hero .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cinematic Hero background image scale-in unmasking
  const heroBg = partSection.querySelector('.partner-hero-bg.hero-img-cinematic');
  if (heroBg) {
    setTimeout(() => {
      heroBg.classList.add('is-loaded');
    }, 180);
  }

  // 3. Central Hub & Orbit entrance
  const hubCenter = partSection.querySelector('.partner-hub-center');
  if (hubCenter) {
    setTimeout(() => {
      hubCenter.classList.add('is-visible');
    }, 300);
  }

  // 4. Satellite nodes cascade entrance
  const satellites = partSection.querySelectorAll('.partner-satellite');
  satellites.forEach((sat, idx) => {
    setTimeout(() => {
      sat.classList.add('is-visible');
    }, 380 + idx * 85);
  });
}

// ==========================================
// LUXURY MOTION DESIGN: BLOG HERO REVEALS
// ==========================================
function triggerBlogReveals() {
  const blogSection = document.querySelector('#blog');
  if (!blogSection) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = blogSection.querySelectorAll('.blog-header .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Featured card cinematic image scale
  const featImg = blogSection.querySelector('.blog-featured-img.hero-img-cinematic');
  if (featImg) {
    setTimeout(() => {
      featImg.classList.add('is-loaded');
    }, 180);
  }
}

// ==========================================
// LUXURY MOTION DESIGN: CONTACT HERO REVEALS
// ==========================================
function triggerContactReveals() {
  const contactSection = document.querySelector('#contact');
  if (!contactSection) return;

  // 1. Reveal headline lines sequentially with luxury mask
  const lines = contactSection.querySelectorAll('.contact-left-col .reveal-line');
  lines.forEach((line, idx) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 120 + idx * 110);
  });

  // 2. Cascade channels list
  const channels = contactSection.querySelectorAll('.contact-channels-list .contact-channel-item');
  channels.forEach((item, idx) => {
    setTimeout(() => {
      item.classList.add('is-visible');
    }, 350 + idx * 80);
  });
}

// ==========================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ==========================================
let _scrollAnimObserver = null;

function initScrollAnimations() {
  // Disconnect previous observer to avoid leaks on SPA navigation
  if (_scrollAnimObserver) {
    _scrollAnimObserver.disconnect();
  }

  _scrollAnimObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Stagger children: animate each child with an increasing delay
      if (el.classList.contains('stagger-children')) {
        Array.from(el.children).forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('is-visible');
          }, i * 90);
        });
        el.classList.add('is-visible');
      } else {
        el.classList.add('is-visible');
      }

      // SVG Draw Path trigger
      const chartPath = el.querySelector('.dash-chart-draw-path');
      if (chartPath) {
        chartPath.classList.add('is-drawn');
      }

      // Donut segment draw trigger
      const donutSegment = el.querySelector('.dash-donut-segment');
      if (donutSegment) {
        donutSegment.classList.add('is-drawn');
      }

      // Pipeline line draw trigger
      const pipeLine = el.querySelector('#pm-hero-pipeline-line');
      if (pipeLine) {
        pipeLine.classList.add('is-drawn');
      }

      _scrollAnimObserver.unobserve(el);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  // Observe all animatable elements in the current active view
  const activeView = document.querySelector('.view-section.active');
  if (!activeView) return;

  const selectors = [
    '.reveal', '.reveal-left', '.reveal-right', '.reveal-scale',
    '.stagger-children', '.timeline-step', '.data-dashboard-card'
  ];

  activeView.querySelectorAll(selectors.join(', ')).forEach(el => {
    // Reset visibility for re-entry on SPA navigation
    el.classList.remove('is-visible');
    if (el.classList.contains('stagger-children')) {
      Array.from(el.children).forEach(child => child.classList.remove('is-visible'));
    }
    _scrollAnimObserver.observe(el);
  });
}

// ==========================================
// SKELETON LOADER FOR PROPERTY CARDS
// ==========================================
function showPropertySkeletons(count = 6) {
  const grid = document.querySelector(".properties-list-grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line-short"></div>
        <div class="skeleton skeleton-line-mid"></div>
        <div class="skeleton skeleton-line-full"></div>
        <div class="skeleton skeleton-line-full"></div>
      </div>
    `;
    grid.appendChild(card);
  }
}

// ==========================================
// CONTACT FORM MULTI-STEP NAVIGATION
// ==========================================
function nextContactStep(step) {
  const current = step - 1;
  if (current === 1) {
    const nameInput = document.getElementById("contact-name");
    const group = document.getElementById("group-contact-name");
    if (!nameInput || !nameInput.value.trim()) {
      if (group) group.classList.add("has-error");
      if (nameInput) nameInput.focus();
      return;
    }
    if (group) group.classList.remove("has-error");
  } else if (current === 2) {
    const phoneInput = document.getElementById("contact-phone");
    const emailInput = document.getElementById("contact-email");
    const phoneGroup = document.getElementById("group-contact-phone");
    const emailGroup = document.getElementById("group-contact-email");

    let hasError = false;
    if (!phoneInput || phoneInput.value.trim().length < 6) {
      if (phoneGroup) phoneGroup.classList.add("has-error");
      hasError = true;
    } else {
      if (phoneGroup) phoneGroup.classList.remove("has-error");
    }

    if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes("@")) {
      if (emailGroup) emailGroup.classList.add("has-error");
      hasError = true;
    } else {
      if (emailGroup) emailGroup.classList.remove("has-error");
    }

    if (hasError) {
      if (phoneInput && phoneGroup && phoneGroup.classList.contains("has-error")) phoneInput.focus();
      else if (emailInput) emailInput.focus();
      return;
    }
  }
  showContactStep(step);
}

function prevContactStep(step) {
  showContactStep(step);
}

function showContactStep(step) {
  [1, 2, 3, 'success'].forEach(s => {
    const el = document.getElementById(`contact-step-${s}`);
    if (el) {
      if (s === step) el.classList.add("active");
      else el.classList.remove("active");
    }
  });

  [1, 2, 3].forEach(s => {
    const stepNode = document.getElementById(`cp-step-${s}`);
    if (stepNode) {
      stepNode.classList.remove("active", "done");
      if (step === 'success' || s < step) {
        stepNode.classList.add("done");
      } else if (s === step) {
        stepNode.classList.add("active");
      }
    }
  });

  const fill1 = document.getElementById("cp-line-fill-1");
  const fill2 = document.getElementById("cp-line-fill-2");
  if (fill1) fill1.style.width = (step > 1 || step === 'success') ? "100%" : "0%";
  if (fill2) fill2.style.width = (step > 2 || step === 'success') ? "100%" : "0%";
}

function submitContactForm(e) {
  e.preventDefault();
  const nameInput = document.getElementById("contact-name");
  const phoneInput = document.getElementById("contact-phone");
  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const email = document.getElementById("contact-email") ? document.getElementById("contact-email").value.trim() : "";
  const subjectEl = document.getElementById("contact-subject");
  const subjectVal = subjectEl ? subjectEl.options[subjectEl.selectedIndex].text : "Demande de renseignement";
  const msgInput = document.getElementById("contact-msg");
  const groupName = document.getElementById("group-contact-name");
  const groupPhone = document.getElementById("group-contact-phone");
  const groupMsg = document.getElementById("group-contact-msg");

  let hasError = false;
  if (!name) {
    if (groupName) groupName.classList.add("has-error");
    hasError = true;
  } else if (groupName) {
    groupName.classList.remove("has-error");
  }

  if (!phone) {
    if (groupPhone) groupPhone.classList.add("has-error");
    hasError = true;
  } else if (groupPhone) {
    groupPhone.classList.remove("has-error");
  }

  if (!msgInput || !msgInput.value.trim()) {
    if (groupMsg) groupMsg.classList.add("has-error");
    hasError = true;
  } else if (groupMsg) {
    groupMsg.classList.remove("has-error");
  }

  if (hasError) return;

  const messageVal = msgInput.value.trim();

  // Déclencher le client de messagerie
  const subject = encodeURIComponent(`[BatiBid] ${subjectVal} — ${name}`);
  const body = encodeURIComponent(`Nom : ${name}\nTéléphone : ${phone}\nEmail : ${email}\nSujet : ${subjectVal}\n\nMessage :\n${messageVal}`);
  const mailtoUrl = `mailto:contact@batibid.com?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, '_blank');

  // Affichage direct du succès
  const fieldsContainer = document.getElementById('contact-fields-container');
  const successBox = document.getElementById('contact-step-success');
  if (fieldsContainer && successBox) {
    fieldsContainer.style.display = 'none';
    successBox.style.display = 'block';
  } else {
    showContactStep('success');
  }
}

function resetContactForm() {
  const form = document.getElementById("contact-form");
  if (form) form.reset();
  const fieldsContainer = document.getElementById('contact-fields-container');
  const successBox = document.getElementById('contact-step-success');
  if (fieldsContainer && successBox) {
    fieldsContainer.style.display = 'block';
    successBox.style.display = 'none';
  } else {
    showContactStep(1);
  }
}

// ==========================================
// MOBILE STICKY CTA - Toggle on auth state
// ==========================================
function updateMobileStickyCtaVisibility() {
  const cta = document.getElementById("mobile-sticky-cta");
  if (!cta) return;
  cta.style.display = state.currentUser ? "none" : "";
}

// ==========================================
// PARTENARIATS FORM VALIDATION
// ==========================================
function validatePartnerName(input) {
  const val = input.value.trim();
  const hint = document.getElementById("partner-name-hint");
  if (val.length < 3) {
    input.style.borderColor = "var(--error)";
    if (hint) { hint.textContent = "Minimum 3 caractères requis."; hint.style.color = "var(--error)"; }
    return false;
  }
  input.style.borderColor = "var(--success)";
  if (hint) { hint.textContent = "✓"; hint.style.color = "var(--success)"; }
  return true;
}

function validatePartnerPhone(input) {
  const val = input.value.replace(/\s+/g, "");
  const hint = document.getElementById("partner-phone-hint");
  // Accept: 01XXXXXXXX (10 digits starting with 01) or +22901XXXXXXXX
  const beninLocal = /^01\d{8}$/.test(val);
  const beninIntl  = /^\+22901\d{8}$/.test(val);
  if (!beninLocal && !beninIntl) {
    input.style.borderColor = "var(--error)";
    if (hint) { hint.textContent = "Format invalide. Utilisez : 01 XX XX XX XX (10 chiffres)"; hint.style.color = "var(--error)"; }
    return false;
  }
  input.style.borderColor = "var(--success)";
  if (hint) { hint.textContent = "✓ Numéro valide"; hint.style.color = "var(--success)"; }
  return true;
}

function handlePartnerTypeChange(select) {
  const autreGroup = document.getElementById("partner-autre-group");
  if (!autreGroup) return;
  if (select.value === "autre") {
    autreGroup.style.display = "block";
    document.getElementById("partner-autre").required = true;
  } else {
    autreGroup.style.display = "none";
    document.getElementById("partner-autre").required = false;
    document.getElementById("partner-autre").value = "";
  }
}

function submitPartnerForm(event) {
  event.preventDefault();
  const nameInput = document.getElementById("partner-name");
  const phoneInput = document.getElementById("partner-phone");
  const typeSelect = document.getElementById("partner-type");

  let valid = true;
  if (!validatePartnerName(nameInput)) valid = false;
  if (!validatePartnerPhone(phoneInput)) valid = false;
  if (!typeSelect.value) {
    typeSelect.style.borderColor = "var(--error)";
    valid = false;
  }
  if (typeSelect.value === "autre") {
    const autreInput = document.getElementById("partner-autre");
    if (!autreInput.value.trim()) {
      autreInput.style.borderColor = "var(--error)";
      valid = false;
    }
  }
  if (!valid) {
    showAlert("error", "Formulaire incomplet", "Veuillez corriger les champs en rouge avant d'envoyer votre demande.");
    return;
  }
  showAlert("success", "Demande reçue !", "Notre responsable partenariats prendra contact avec vous sous 48h. Merci de votre intérêt pour BatiBid !");
  event.target.reset();
  // Reset visual states
  ["partner-name","partner-phone","partner-type"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.borderColor = "";
  });
  document.getElementById("partner-autre-group").style.display = "none";
  document.getElementById("partner-name-hint").textContent = "";
  document.getElementById("partner-phone-hint").textContent = "Format : 01 XX XX XX XX (nouveau format béninois)";
}

// ==========================================
// TESTIMONIALS GRID (Rich cards with stars & initials)
// ==========================================
const testimonialAvatars = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=100"
];

function renderTestimonials() {
  // Legacy slider support (keep for any remaining slider references)
  const sliderContainer = document.getElementById("testimonial-slider-content");
  if (sliderContainer) {
    sliderContainer.innerHTML = "";
    mockDb.testimonials.forEach((t, idx) => {
      const card = document.createElement("div");
      card.className = `testimonial-card ${idx === state.activeTestimonialIdx ? "active" : ""}`;
      card.innerHTML = `<p class="testimonial-quote">"${t.quote}"</p><div class="testimonial-avatar">${t.author.charAt(0)}</div><h4 class="testimonial-author">${t.author}</h4><p class="testimonial-role">${t.role}</p>`;
      sliderContainer.appendChild(card);
    });
  }
  // New rich grid
  renderTestimonialsGrid();
}

function renderTestimonialsGrid() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;
  grid.innerHTML = "";
  mockDb.testimonials.forEach((t, idx) => {
    const initials = t.author.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const hasPhoto = idx < testimonialAvatars.length;
    const stars = `<span class="testimonial-stars">${'<i class="fas fa-star"></i>'.repeat(5)}</span>`;
    const avatarContent = hasPhoto
      ? `<img src="${testimonialAvatars[idx]}" alt="${t.author}">`
      : initials;
    const card = document.createElement("div");
    card.className = "testimonial-card-rich";
    card.innerHTML = `
      ${stars}
      <p class="testimonial-text">${t.quote}</p>
      <div class="testimonial-author-row">
        <div class="testimonial-author-avatar">${avatarContent}</div>
        <div>
          <div class="testimonial-author-name">${t.author}</div>
          <div class="testimonial-author-role">${t.role}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function slideTestimonial(direction) {
  const len = mockDb.testimonials.length;
  if (direction === "next") {
    state.activeTestimonialIdx = (state.activeTestimonialIdx + 1) % len;
  } else {
    state.activeTestimonialIdx = (state.activeTestimonialIdx - 1 + len) % len;
  }
  renderTestimonials();
}

// ==========================================
// INTEGRATED AUTHENTICATION & ONBOARDING SYSTEM
// ==========================================
function selectAuthRole(role) {
  state.authSelectedRole = role;
  document.querySelectorAll(".auth-role-card").forEach(c => {
    c.classList.remove("selected");
  });
  const card = document.getElementById(`auth-role-${role}`);
  if (card) card.classList.add("selected");
  const nextBtn = document.getElementById("auth-next-1");
  if (nextBtn) nextBtn.removeAttribute("disabled");
  
  // Toggle formula visibility (proprietaire only)
  const formulaGroup = document.getElementById("auth-formula-group");
  if (formulaGroup) {
    formulaGroup.style.display = role === "proprietaire" ? "block" : "none";
  }

  // Toggle locataire-type checkbox (locataire only)
  const locataireGroup = document.getElementById("auth-locataire-type-group");
  if (locataireGroup) {
    locataireGroup.style.display = role === "locataire" ? "block" : "none";
  }
  // Reset locataire sub-type when role changes
  state.authLocataireGere = false;
  const gereCheckbox = document.getElementById("auth-locataire-gere");
  if (gereCheckbox) gereCheckbox.checked = false;
}

function nextAuthStep() {
  if (!state.authSelectedRole) return;
  state.authOnboardingStep = 2;
  document.getElementById("auth-step-1-view").classList.remove("active");
  document.getElementById("auth-step-2-view").classList.add("active");
  document.getElementById("auth-step-indicator-2").classList.add("active");
  document.getElementById("auth-step-indicator-1").classList.remove("active");
  document.getElementById("auth-step-indicator-1").classList.add("completed");
}

function prevAuthStep() {
  state.authOnboardingStep = 1;
  document.getElementById("auth-step-2-view").classList.remove("active");
  document.getElementById("auth-step-1-view").classList.add("active");
  document.getElementById("auth-step-indicator-2").classList.remove("active");
  document.getElementById("auth-step-indicator-1").classList.remove("completed");
  document.getElementById("auth-step-indicator-1").classList.add("active");
}

function toggleAuthForm(mode) {
  const registerView = document.getElementById("auth-register-view");
  const loginView = document.getElementById("auth-login-view");
  
  if (mode === "login") {
    if (registerView) registerView.classList.remove("active");
    if (loginView) loginView.classList.add("active");
  } else {
    if (loginView) loginView.classList.remove("active");
    if (registerView) registerView.classList.add("active");
  }
}

function focusLogin() {
  const emailInput = document.getElementById("login-email");
  if (emailInput) {
    emailInput.focus();
    emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function updateCriterion(id, isValid, text) {
  const el = document.getElementById(id);
  if (!el) return;
  if (isValid) {
    el.classList.add("valid");
    el.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> ${text}`;
  } else {
    el.classList.remove("valid");
    el.innerHTML = `<i class="fas fa-circle-notch" style="color: var(--gray-500);"></i> ${text}`;
  }
}

function validatePasswordStrength() {
  const password = document.getElementById("auth-reg-password").value;
  
  const lengthValid = password.length >= 8;
  const upperValid = /[A-Z]/.test(password);
  const numberValid = /[0-9]/.test(password);
  const specialValid = /[^A-Za-z0-9]/.test(password);
  
  updateCriterion("crit-length", lengthValid, "Au moins 8 caractères");
  updateCriterion("crit-upper", upperValid, "Une lettre majuscule");
  updateCriterion("crit-number", numberValid, "Un chiffre (0-9)");
  updateCriterion("crit-special", specialValid, "Un caractère spécial (ex: @, #, $, !)");
  
  const allValid = lengthValid && upperValid && numberValid && specialValid;
  const submitBtn = document.getElementById("auth-reg-submit-btn");
  if (submitBtn) {
    if (allValid) {
      submitBtn.removeAttribute("disabled");
    } else {
      submitBtn.setAttribute("disabled", "true");
    }
  }
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("login-email");
  const pwdInput   = document.getElementById("login-password");
  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const pwd   = pwdInput   ? pwdInput.value : "";

  // Lookup in mockUsers
  const found = (typeof mockUsers !== "undefined")
    ? mockUsers.find(u => u.email.toLowerCase() === email && u.password === pwd)
    : null;

  if (!found) {
    showAlert("error", "Identifiants incorrects",
      "Vérifiez votre email et mot de passe. Comptes démo :\n• simplice@batibid.com\n• marie@batibid.com\n• jean@batibid.com\n• carine@batibid.com\nMot de passe : Demo@1234");
    return;
  }

  state.currentUser = { ...found };
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
  updateHeaderAuth();
  updateMobileStickyCtaVisibility();
  navigateTo("#dashboard");
  showAlert("success", "Connexion réussie !", `Bienvenue, ${found.name.split(" ")[1]} !`);
}

function handleAuthRegisterSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("auth-reg-name").value;
  const email = document.getElementById("auth-reg-email").value;
  const phone = document.getElementById("auth-reg-phone").value;
  const formulaSelect = document.getElementById("auth-reg-formula");
  const formula = formulaSelect ? formulaSelect.value : "";
  
  state.currentUser = {
    name: name || "Utilisateur BatiBid",
    email: email || "user@batibid.com",
    phone: phone || "+229 97 00 00 00",
    role: state.authSelectedRole,
    formula: formula,
    locataireGere: state.authLocataireGere || false  // true = géré par BatiBid, false = locataire chercheur
  };
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
  
  updateHeaderAuth();
  updateMobileStickyCtaVisibility();
  navigateTo("#dashboard");
  
  // Personalized success message based on locataire sub-type
  if (state.currentUser.role === "locataire" && state.currentUser.locataireGere) {
    showAlert("success", "Compte créé !", "Bienvenue ! Votre espace locataire BatiBid vous permet de payer votre loyer et de signaler des incidents en ligne.");
  } else {
    showAlert("success", "Profil créé !", "Votre compte a été configuré avec succès.");
  }
  
  // Reset fields
  state.authOnboardingStep = 1;
  state.authSelectedRole = "";
  document.getElementById("auth-reg-name").value = "";
  document.getElementById("auth-reg-phone").value = "";
  document.getElementById("auth-reg-email").value = "";
  document.getElementById("auth-reg-password").value = "";
  prevAuthStep();
}

function handleLogout() {
  state.currentUser = null;
  localStorage.removeItem("currentUser");
  updateHeaderAuth();
  navigateTo("#home");
  showAlert("info", "Déconnexion", "Vous avez été déconnecté avec succès.");
}

function updateHeaderAuth() {
  // Static showcase mode: Navbar and mobile navigation are preserved from index.html
  // and point to https://app.batibid.com for application sign-in/sign-up.
  const visitorActions = document.getElementById("header-visitor-actions");
  if (visitorActions) visitorActions.style.display = "flex";
}


// ==========================================
// SEARCH FILTERS & CATALOG
// ==========================================
let currentSortMode = "recent";
let catalogMap = null;
let catalogMapCircle = null;
let catalogMapMarkers = [];

function initSearchFilters() {
  const cityInput = document.getElementById("search-city-input");
  const budgetMin = document.getElementById("budget-min");
  const budgetMax = document.getElementById("budget-max");
  const radiusInput = document.getElementById("search-radius-input");
  const radiusDisplay = document.getElementById("radius-display");
  
  if (!cityInput) return;
  
  cityInput.value = state.currentFilter.city;
  budgetMin.value = state.currentFilter.minPrice || "";
  budgetMax.value = state.currentFilter.maxPrice || "";
  
  if (radiusInput) {
    radiusInput.value = state.currentFilter.radius || 5;
    if (radiusDisplay) {
      radiusDisplay.textContent = radiusInput.value + " km";
    }
    updateRadiusSlider();
  }
  
  document.querySelectorAll("input[name='type-bien']").forEach(cb => {
    cb.checked = state.currentFilter.types.includes(cb.value);
  });
  
  document.querySelectorAll(".rooms-btn").forEach(btn => {
    const rVal = parseInt(btn.innerText);
    if (rVal === state.currentFilter.rooms) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
    
    // Clean old listeners to prevent duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", () => {
      document.querySelectorAll(".rooms-btn").forEach(b => b.classList.remove("active"));
      newBtn.classList.add("active");
    });
  });
}

function applySearchFilters() {
  const checkedTypes = [];
  document.querySelectorAll("input[name='type-bien']:checked").forEach(cb => {
    checkedTypes.push(cb.value);
  });
  
  const minPrice = parseInt(document.getElementById("budget-min").value) || 0;
  const maxPrice = parseInt(document.getElementById("budget-max").value) || 2000000;
  
  const activeRoomsBtn = document.querySelector(".rooms-btn.active");
  const roomsVal = activeRoomsBtn ? parseInt(activeRoomsBtn.innerText) : 1;
  
  const radiusInput = document.getElementById("search-radius-input");
  const radiusVal = radiusInput ? parseInt(radiusInput.value) : 5;
  
  state.currentFilter = {
    city: document.getElementById("search-city-input").value.trim(),
    radius: radiusVal,
    types: checkedTypes,
    minPrice: minPrice,
    maxPrice: maxPrice,
    rooms: roomsVal
  };
  
  updateGeocodingAndRender();
}

window.resetSearchFilters = function() {
  state.currentFilter = {
    city: "",
    radius: 5,
    types: ["appartement", "maison", "bureau"],
    minPrice: 0,
    maxPrice: 2000000,
    rooms: 1
  };
  state.currentCoords = null;
  initSearchFilters();
  applySearchFilters();
};

async function updateGeocodingAndRender() {
  if (state.currentFilter.city) {
    const coords = await getCoordinatesForQuery(state.currentFilter.city);
    state.currentCoords = coords;
  } else {
    state.currentCoords = null;
  }
  
  renderPropertyList();
  
  // If map container is visible, update Leaflet map
  const mapContainer = document.getElementById("catalog-map-container");
  if (mapContainer && mapContainer.style.display !== "none") {
    initCatalogMap();
  }
}

async function getCoordinatesForQuery(query) {
  const mockCoords = {
    "cotonou": { lat: 6.36, lng: 2.41 },
    "calavi": { lat: 6.42, lng: 2.30 },
    "abomey-calavi": { lat: 6.42, lng: 2.30 },
    "haie vive": { lat: 6.362, lng: 2.397 },
    "fidjrossè": { lat: 6.364, lng: 2.368 },
    "ganhi": { lat: 6.353, lng: 2.433 },
    "cadjehoun": { lat: 6.365, lng: 2.411 },
    "cocotomey": { lat: 6.422, lng: 2.302 }
  };
  
  const clean = query.toLowerCase().trim();
  for (const key in mockCoords) {
    if (clean.includes(key)) {
      return mockCoords[key];
    }
  }
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Benin')}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim Geocoding API failed, using fallback.", err);
  }
  
  return { lat: 6.36, lng: 2.41 };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

window.switchCatalogViewMode = function(mode) {
  state.catalogViewMode = mode;
  const listGrid = document.querySelector(".properties-list-grid");
  const mapContainer = document.getElementById("catalog-map-container");
  const listBtn = document.getElementById("view-mode-list-btn");
  const mapBtn = document.getElementById("view-mode-map-btn");
  
  if (!listGrid || !mapContainer) return;
  
  if (mode === 'map') {
    listGrid.style.display = 'none';
    mapContainer.style.display = 'block';
    if (listBtn) listBtn.classList.remove('active');
    if (mapBtn) mapBtn.classList.add('active');
    
    setTimeout(() => {
      initCatalogMap();
    }, 100);
  } else {
    listGrid.style.display = 'grid';
    mapContainer.style.display = 'none';
    if (listBtn) listBtn.classList.add('active');
    if (mapBtn) mapBtn.classList.remove('active');
  }
};

window.sortCatalogProperties = function(sortVal) {
  currentSortMode = sortVal;
  renderPropertyList();
};

function initCatalogMap() {
  const mapElement = document.getElementById("catalog-map");
  if (!mapElement) return;
  
  if (catalogMap) {
    catalogMap.invalidateSize();
    updateCatalogMap();
    return;
  }
  
  const startLat = state.currentCoords ? state.currentCoords.lat : 6.36;
  const startLng = state.currentCoords ? state.currentCoords.lng : 2.41;
  
  catalogMap = L.map('catalog-map').setView([startLat, startLng], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(catalogMap);
  
  catalogMap.on('click', function(e) {
    updateSearchCenterByCoords(e.latlng.lat, e.latlng.lng, "Point sélectionné sur la carte");
  });
  
  updateCatalogMap();
}

function updateCatalogMap() {
  if (!catalogMap) return;
  
  catalogMapMarkers.forEach(m => catalogMap.removeLayer(m));
  catalogMapMarkers = [];
  
  if (catalogMapCircle) {
    catalogMap.removeLayer(catalogMapCircle);
    catalogMapCircle = null;
  }
  
  if (state.currentCoords) {
    const center = [state.currentCoords.lat, state.currentCoords.lng];
    catalogMap.setView(center, getZoomLevelForRadius(state.currentFilter.radius));
    
    catalogMapCircle = L.circle(center, {
      color: '#D95E2B',
      fillColor: '#D95E2B',
      fillOpacity: 0.15,
      radius: state.currentFilter.radius * 1000
    }).addTo(catalogMap);
    
    const centerMarker = L.marker(center, {
      icon: L.divIcon({
        className: 'center-marker',
        html: '<div style="background-color: var(--secondary); color: var(--white); padding: 5px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; border: 1px solid var(--primary);box-shadow: 0 2px 10px rgba(0,0,0,0.15);"><i class="fas fa-search-location"></i> Centre</div>',
        iconSize: [60, 25],
        iconAnchor: [30, 12]
      })
    }).addTo(catalogMap);
    catalogMapMarkers.push(centerMarker);
  }
}

window.selectCarrefourCenter = function(value) {
  const coordsMap = {
    etoile: { lat: 6.3776, lng: 2.4243, label: "Étoile Rouge" },
    toyota: { lat: 6.3685, lng: 2.3995, label: "Carrefour Toyota" },
    cadjehoun: { lat: 6.3552, lng: 2.3942, label: "Carrefour Cadjehoun" },
    fidjrosse: { lat: 6.3631, lng: 2.3614, label: "Carrefour Fidjrossè" },
    sacre_coeur: { lat: 6.3664, lng: 2.4112, label: "Carrefour Sacré-Cœur" },
    ganhi: { lat: 6.3533, lng: 2.4355, label: "Ganhi (Trois Banques)" },
    arconville: { lat: 6.4384, lng: 2.3482, label: "Carrefour Arconville" },
    kpota: { lat: 6.4258, lng: 2.3551, label: "Carrefour Kpota" },
    iita: { lat: 6.4187, lng: 2.3361, label: "Carrefour IITA" },
    cocotomey: { lat: 6.4011, lng: 2.2789, label: "Carrefour Cocotomey" }
  };

  if (!value || !coordsMap[value]) {
    return;
  }

  const target = coordsMap[value];
  updateSearchCenterByCoords(target.lat, target.lng, target.label);
};

window.updateSearchCenterByCoords = function(lat, lng, label) {
  state.currentCoords = { lat, lng };
  state.currentFilter.city = label;
  
  const input = document.getElementById("search-city-input");
  if (input) {
    input.value = label;
  }
  
  const select = document.getElementById("filter-carrefour");
  if (select) {
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value && select.options[i].text.includes(label)) {
        select.value = select.options[i].value;
        found = true;
        break;
      }
    }
    if (!found) {
      select.value = "";
    }
  }
  
  updateCatalogMap();
  renderPropertyList();
};

function getZoomLevelForRadius(radiusKm) {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 25) return 11;
  return 10;
}

function renderPropertyList() {
  const listContainer = document.querySelector(".properties-list-grid");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";
  
  let filtered = mockDb.properties.filter(p => {
    if (state.currentFilter.city) {
      if (state.currentCoords && p.latitude && p.longitude) {
        const dist = calculateDistance(state.currentCoords.lat, state.currentCoords.lng, p.latitude, p.longitude);
        p.currentDistance = dist;
        if (dist > state.currentFilter.radius) {
          return false;
        }
      } else {
        const cLower = state.currentFilter.city.toLowerCase();
        const matchCity = p.city.toLowerCase().includes(cLower);
        const matchAddr = p.address.toLowerCase().includes(cLower);
        if (!matchCity && !matchAddr) return false;
        p.currentDistance = null;
      }
    } else {
      p.currentDistance = null;
    }
    
    if (state.currentFilter.types.length > 0 && !state.currentFilter.types.includes(p.type)) {
      return false;
    }
    
    if (p.price < state.currentFilter.minPrice || p.price > state.currentFilter.maxPrice) {
      return false;
    }
    
    if (p.bedrooms < state.currentFilter.rooms && p.type !== "bureau") {
      return false;
    }
    
    return true;
  });
  
  // Sorting logic
  if (currentSortMode === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSortMode === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => b.id - a.id);
  }
  
  const badgeCount = document.getElementById("catalog-count-badge");
  if (badgeCount) {
    badgeCount.innerText = `${filtered.length} résultats trouvés`;
  }
  
  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center" style="grid-column: span 3; padding: 4rem 2rem;">
        <i class="fas fa-search-minus" style="font-size: 3rem; color: var(--gray-500); margin-bottom: 1rem;"></i>
        <h3 class="headline-md">Aucun bien ne correspond</h3>
        <p class="body-md" style="color: var(--gray-600);">Essayez d'élargir vos filtres ou d'augmenter le budget maximal.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "property-card";
    
    const isSaved = mockDb.savedProperties.includes(p.id);
    
    card.innerHTML = `
      <div class="property-card-img-wrapper">
        <img src="${p.image}" class="property-card-img" alt="${p.title}">
        <span class="property-card-badge" style="background-color: #ffebe6; color: var(--primary);">${p.status}</span>
        ${p.verified ? `<span class="property-card-badge" style="left: auto; right: 3.5rem; background-color: var(--success-light); color: var(--success);"><i class="fas fa-check-circle"></i> Vérifié</span>` : ''}
        <button class="property-card-save-btn ${isSaved ? "saved" : ""}" onclick="toggleSaveProperty(event, ${p.id})">
          <i class="${isSaved ? "fas" : "far"} fa-heart"></i>
        </button>
      </div>
      <div class="property-card-content">
        <div class="property-card-price">${formatCurrency(p.price)}<span>/mois</span></div>
        <h3 class="property-card-title">${p.title}</h3>
        <div class="property-card-location">
          <i class="fas fa-map-marker-alt"></i> ${p.address}, ${p.city}
          ${p.currentDistance !== undefined && p.currentDistance !== null ? `<span style="margin-left: 0.5rem; color: var(--primary); font-weight: 700;">(${p.currentDistance.toFixed(1)} km)</span>` : ''}
        </div>
        <div class="property-card-details">
          <span><i class="fas fa-ruler-combined"></i> ${p.surface}m²</span>
          <span><i class="fas fa-bed"></i> ${p.bedrooms} ch.</span>
          <span><i class="fas fa-bath"></i> ${p.bathrooms} sdb.</span>
        </div>
        <button class="btn btn-secondary mt-4" style="width: 100%;" onclick="viewPropertyDetails(${p.id})">
          <i class="fas fa-eye" style="margin-right: 0.5rem;"></i> Voir Détails
        </button>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

function toggleSaveProperty(event, id) {
  event.stopPropagation();
  const idx = mockDb.savedProperties.indexOf(id);
  if (idx > -1) {
    mockDb.savedProperties.splice(idx, 1);
    showAlert("info", "Bien retiré !", "Le bien a été retiré de vos favoris.");
  } else {
    mockDb.savedProperties.push(id);
    showAlert("success", "Bien sauvegardé !", "Le bien a été ajouté à vos favoris.");
  }
  renderPropertyList();
}

function viewPropertyDetails(id) {
  state.currentViewingPropertyId = id;
  navigateTo("#detail");
}

// ==========================================
// CUSTOM SEARCH POP OVER (SLIDE-OVER DRAWER)
// ==========================================
function openCustomSearchModal() {
  const modal = document.getElementById("custom-search-modal");
  if (modal) modal.classList.add("active");
}

function closeCustomSearchModal() {
  const modal = document.getElementById("custom-search-modal");
  if (modal) modal.classList.remove("active");
}

function submitCustomSearch(event) {
  event.preventDefault();
  closeCustomSearchModal();
  showAlert("success", "Recherche personnalisée enregistrée !", "Votre demande de recherche a été prise en compte avec succès. Un agent BatiBid va vous contacter sur WhatsApp pour vous proposer des biens.");
}

// ==========================================
// RENT ESTIMATOR DRAWERS & LOGIC
// ==========================================
const neighborhoodsByCity = {
  cotonou: [
    { value: "haievive", label: "Haie Vive" },
    { value: "fidjrosse", label: "Fidjrossè" },
    { value: "cadjehoun", label: "Cadjehoun" },
    { value: "akpakpa", label: "Akpakpa" }
  ],
  calavi: [
    { value: "cocotomey", label: "Cocotomey" },
    { value: "zogbadje", label: "UAC / Zogbadjè" },
    { value: "tankpe", label: "Tankpè" }
  ],
  portonovo: [
    { value: "ouando", label: "Ouando" },
    { value: "tokpota", label: "Tokpota" }
  ]
};

function updateEstNeighborhoods() {
  const citySelect = document.getElementById("est-city");
  const neighSelect = document.getElementById("est-neighborhood");
  if (!citySelect || !neighSelect) return;
  
  const selectedCity = citySelect.value;
  const list = neighborhoodsByCity[selectedCity] || [];
  
  neighSelect.innerHTML = "";
  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.innerText = item.label;
    neighSelect.appendChild(opt);
  });
}

function openRentEstimator() {
  const modal = document.getElementById("rent-estimator-modal");
  if (modal) modal.classList.add("active");
  const resContainer = document.getElementById("est-result-container");
  if (resContainer) resContainer.style.display = "none";
}

function closeRentEstimator() {
  const modal = document.getElementById("rent-estimator-modal");
  if (modal) modal.classList.remove("active");
}

function calculateRentEstimate(event) {
  event.preventDefault();
  
  const type = document.getElementById("est-type").value;
  const neighborhood = document.getElementById("est-neighborhood").value;
  const rooms = parseInt(document.getElementById("est-rooms").value) || 1;
  
  let basePrice = 100000;
  if (type === "maison") basePrice = 180000;
  else if (type === "studio") basePrice = 55000;
  else if (type === "bureau") basePrice = 220000;
  
  const neighborhoodMultipliers = {
    haievive: 1.8,
    fidjrosse: 1.4,
    cadjehoun: 1.3,
    akpakpa: 1.1,
    cocotomey: 0.8,
    zogbadje: 0.7,
    tankpe: 0.75,
    ouando: 0.6,
    tokpota: 0.55
  };
  
  const mult = neighborhoodMultipliers[neighborhood] || 1.0;
  
  let roomsMult = 1.0;
  if (rooms === 2) roomsMult = 1.5;
  else if (rooms === 3) roomsMult = 2.0;
  else if (rooms >= 4) roomsMult = 2.8;
  
  const estimated = basePrice * mult * roomsMult;
  
  const minVal = Math.round((estimated * 0.9) / 5000) * 5000;
  const maxVal = Math.round((estimated * 1.15) / 5000) * 5000;
  
  const formatVal = (val) => {
    return new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
      .format(val)
      .replace("XOF", "FCFA");
  };
  const resValue = document.getElementById("est-result-value");
  const resContainer = document.getElementById("est-result-container");
  
  if (resValue && resContainer) {
    resValue.innerText = `${formatVal(minVal)} - ${formatVal(maxVal)}`;
    resContainer.style.display = "block";
  }
}

// ==========================================
// PROPERTY DETAIL - GALLERY, VIDEO, 360°
// ==========================================
let detailGalleryIndex = 0;
let detailGalleryImages = [];

function renderPropertyDetails() {
  const p = mockDb.properties.find(item => item.id === state.currentViewingPropertyId) || mockDb.properties[0];
  detailGalleryIndex = 0;
  detailGalleryImages = p.images || [p.image];

  document.getElementById("detail-title").innerText = p.title;
  document.getElementById("detail-location").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.address}, ${p.city}`;
  document.getElementById("detail-desc").innerText = p.desc;
  document.getElementById("detail-beds").innerText = p.bedrooms;
  document.getElementById("detail-baths").innerText = p.bathrooms;
  document.getElementById("detail-surface").innerText = p.surface;
  document.getElementById("detail-type").innerText = p.type.charAt(0).toUpperCase() + p.type.slice(1);

  // Verified badge
  const badge = document.getElementById("detail-verified-badge");
  if (badge) badge.style.display = p.verified ? "inline-flex" : "none";

  // Video tab visibility
  const videoTabBtn = document.getElementById("detail-video-tab-btn");
  if (videoTabBtn) videoTabBtn.style.display = p.videoUrl ? "flex" : "none";

  // Populate gallery
  const mainImg = document.getElementById("detail-gallery-main-img");
  if (mainImg) mainImg.src = detailGalleryImages[0];
  updateGalleryCounter();
  renderGalleryThumbs();

  // CTA Box
  const ctaBox = document.getElementById("detail-cta-box");
  if (ctaBox) {
    const shareUrl = `${window.location.origin}${window.location.pathname}#detail?id=${p.id}`;
    const whatsappText = `Bonsoir l’agent de BatiBid. Je suis intéressé par ce bien : « ${shareUrl} »`;
    const whatsappUrl = `https://wa.me/2290142484848?text=${encodeURIComponent(whatsappText)}`;

    ctaBox.innerHTML = `
      <div class="detail-cta-card">
        <h4 style="margin-bottom: 1rem;">Intéressé par ce bien ?</h4>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">${formatCurrency(p.price)} <span style="font-size:1rem; font-weight:600; color:var(--gray-600);">/mois</span></div>
        ${p.verified ? `<div class="detail-verified-badge" style="margin-bottom:1.25rem;"><i class="fas fa-shield-halved"></i> Bien Vérifié BatiBid</div>` : ''}
        <p style="font-size: 0.85rem; color: var(--gray-600); margin-bottom: 1.5rem;">
          <i class="fas fa-shield-alt" style="color: var(--success); margin-right: 0.25rem;"></i> 
          Transactions sécurisées et garanties par BatiBid.
        </p>
        <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem;" onclick="startRentPayment(${p.id})">
          <i class="fas fa-key" style="margin-right: 0.5rem;"></i> Louer maintenant
        </button>
        <a href="${whatsappUrl}" class="btn btn-secondary" target="_blank" style="width: 100%; margin-bottom: 0.75rem; text-align:center; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
          <i class="fab fa-whatsapp" style="color:#25D366;"></i> Contacter un agent
        </a>
        <button class="btn btn-secondary" style="width: 100%; border:none; color:var(--gray-600); font-size:0.85rem;" onclick="navigateTo('#trouver')">
          <i class="fas fa-arrow-left" style="margin-right:0.4rem;"></i> Retour aux biens
        </button>
      </div>
    `;
  }

  // Show gallery tab by default
  switchDetailTab('gallery', document.querySelector('.detail-tab-btn'));

  // Initialize 360
  init360Canvas(p.title);

  // Set video URL
  const iframe = document.getElementById("detail-video-iframe");
  if (iframe && p.videoUrl) {
    iframe.src = p.videoUrl;
  } else if (iframe) {
    iframe.src = "";
  }
}

function renderGalleryThumbs() {
  const container = document.getElementById("detail-gallery-thumbs");
  if (!container) return;
  container.innerHTML = detailGalleryImages.map((src, i) => `
    <div class="detail-gallery-thumb ${i === detailGalleryIndex ? 'active' : ''}" onclick="galleryGoTo(${i})">
      <img src="${src}" alt="Photo ${i + 1}">
    </div>
  `).join('');
}

function updateGalleryCounter() {
  const counter = document.getElementById("detail-gallery-counter");
  if (counter) counter.innerText = `${detailGalleryIndex + 1} / ${detailGalleryImages.length}`;
}

function galleryGoTo(idx) {
  detailGalleryIndex = idx;
  const mainImg = document.getElementById("detail-gallery-main-img");
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = detailGalleryImages[idx];
      mainImg.style.opacity = '1';
    }, 180);
  }
  updateGalleryCounter();
  renderGalleryThumbs();
}

function galleryPrev() {
  const newIdx = (detailGalleryIndex - 1 + detailGalleryImages.length) % detailGalleryImages.length;
  galleryGoTo(newIdx);
}

function galleryNext() {
  const newIdx = (detailGalleryIndex + 1) % detailGalleryImages.length;
  galleryGoTo(newIdx);
}

function switchDetailTab(tabName, btn) {
  // Hide all panels
  document.querySelectorAll('.detail-media-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
  // Show target panel
  const panel = document.getElementById(`detail-panel-${tabName}`);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
  // Re-init 360 canvas if switching to panorama
  if (tabName === 'panorama') {
    const p = mockDb.properties.find(item => item.id === state.currentViewingPropertyId) || mockDb.properties[0];
    setTimeout(() => init360Canvas(p.title), 50);
  }
}

function init360Canvas(title) {
  const canvas = document.getElementById("panorama-360");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  const resizeCanvas = () => {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || 400;
  };
  
  resizeCanvas();
  state.panoramaYaw = 0;
  
  const drawRoom = () => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, h/2);
    ceilingGrad.addColorStop(0, "#2c2c2c");
    ceilingGrad.addColorStop(1, "#444444");
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(0, 0, w, h/2);
    
    const floorGrad = ctx.createLinearGradient(0, h/2, 0, h);
    floorGrad.addColorStop(0, "#FDF6ED");
    floorGrad.addColorStop(1, "#E5DACB");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h/2, w, h/2);
    
    const wallWidth = w * 0.8;
    const offset = (state.panoramaYaw % wallWidth);
    const colors = ["#FFFFFF", "#F9F9F9", "#E8E8E8", "#FFFFFF"];
    const textLabels = ["SALON PRINCIPAL", "Cuisine moderne", "Chambre principale", "Balcon vue dégagée"];
    
    for (let i = -2; i < 4; i++) {
      const xStart = offset + (i * wallWidth);
      ctx.fillStyle = colors[Math.abs(i) % colors.length];
      ctx.fillRect(xStart, h * 0.15, wallWidth, h * 0.7);
      
      ctx.strokeStyle = "rgba(28,28,28,0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(xStart, h * 0.15, wallWidth, h * 0.7);
      
      ctx.fillStyle = "rgba(217, 94, 43, 0.05)";
      ctx.fillRect(xStart + wallWidth * 0.2, h * 0.25, wallWidth * 0.25, h * 0.4);
      ctx.strokeStyle = "var(--primary)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(xStart + wallWidth * 0.2, h * 0.25, wallWidth * 0.25, h * 0.4);
      
      ctx.fillStyle = "var(--secondary)";
      ctx.font = "bold 14px 'Hanken Grotesk'";
      ctx.textAlign = "center";
      ctx.fillText(textLabels[Math.abs(i) % textLabels.length], xStart + wallWidth / 2, h * 0.5);
    }
    
    ctx.fillStyle = "rgba(28, 28, 28, 0.7)";
    ctx.beginPath();
    ctx.arc(w - 50, 50, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - 50, 50);
    const angle = (state.panoramaYaw / wallWidth) * 2 * Math.PI;
    ctx.lineTo(w - 50 + 20 * Math.sin(angle), 50 - 20 * Math.cos(angle));
    ctx.stroke();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px 'Hanken Grotesk'";
    ctx.fillText("N", w - 50, 32);
  };
  
  drawRoom();
  
  // Mouse drag
  canvas.addEventListener("mousedown", (e) => { state.isDraggingPanorama = true; state.lastMouseX = e.clientX; });
  window.addEventListener("mouseup", () => { state.isDraggingPanorama = false; });
  canvas.addEventListener("mousemove", (e) => {
    if (!state.isDraggingPanorama) return;
    const deltaX = e.clientX - state.lastMouseX;
    state.panoramaYaw += deltaX * 1.5;
    state.lastMouseX = e.clientX;
    drawRoom();
  });

  // Touch support for mobile
  canvas.addEventListener("touchstart", (e) => { state.isDraggingPanorama = true; state.lastMouseX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener("touchend", () => { state.isDraggingPanorama = false; });
  canvas.addEventListener("touchmove", (e) => {
    if (!state.isDraggingPanorama) return;
    const deltaX = e.touches[0].clientX - state.lastMouseX;
    state.panoramaYaw += deltaX * 1.5;
    state.lastMouseX = e.touches[0].clientX;
    drawRoom();
  }, { passive: true });
}

// ==========================================
// PAYMENT PROCESS & SIMULATOR
// ==========================================
let activePaymentProperty = null;

function startRentPayment(propertyId) {
  if (!state.currentUser) {
    navigateTo("#auth");
    showAlert("warning", "Connexion requise", "Veuillez vous connecter pour initier la location d'un bien.");
    return;
  }
  
  activePaymentProperty = mockDb.properties.find(p => p.id === propertyId);
  navigateTo("#pay");
}

function initPaymentForm() {
  if (!activePaymentProperty) {
    navigateTo("#trouver");
    return;
  }
  
  document.getElementById("pay-prop-title").innerText = activePaymentProperty.title;
  document.getElementById("pay-prop-price").innerText = formatCurrency(activePaymentProperty.price);
  document.getElementById("pay-total-amount").innerText = formatCurrency(activePaymentProperty.price);
  
  selectPaymentMethod("mtn");
}

function selectPaymentMethod(method) {
  document.querySelectorAll(".pay-method-btn").forEach(b => {
    b.classList.remove("selected");
  });
  document.getElementById(`method-${method}`).classList.add("selected");
  
  const labelPhone = document.getElementById("pay-phone-label");
  const phoneInput = document.getElementById("pay-phone-input");
  
  if (method === "mtn") {
    labelPhone.innerText = "Numéro MTN Mobile Money (MoMo)";
    phoneInput.placeholder = "Ex: 97 00 00 00";
  } else if (method === "moov") {
    labelPhone.innerText = "Numéro Moov Money (Flooz)";
    phoneInput.placeholder = "Ex: 95 00 00 00";
  } else {
    labelPhone.innerText = "Numéro Celtiis Cash";
    phoneInput.placeholder = "Ex: 40 00 00 00";
  }
}

function submitPayment(event) {
  event.preventDefault();
  
  const phone = document.getElementById("pay-phone-input").value;
  if (!phone) {
    showAlert("error", "Erreur de saisie", "Veuillez renseigner votre numéro de paiement.");
    return;
  }
  
  const modal = document.getElementById("ussd-simulator-modal");
  document.getElementById("ussd-modal-text").innerText = `BatiBid: Confirmez le paiement de ${formatCurrency(activePaymentProperty.price)} pour le bien "${activePaymentProperty.title}" en entrant votre code PIN de validation.`;
  modal.classList.add("active");
}

function cancelUssdPayment() {
  document.getElementById("ussd-simulator-modal").classList.remove("active");
  showAlert("error", "Paiement Annulé", "Vous avez annulé la transaction mobile money.");
}

function confirmUssdPayment() {
  document.getElementById("ussd-simulator-modal").classList.remove("active");
  
  if (state.currentUser && state.currentUser.role === "locataire" && state.currentUser.locataireGere) {
    if (typeof confirmPaymentP4 === "function") {
      confirmPaymentP4();
    }
    return;
  }
  
  if (state.currentUser && state.currentUser.role === "proprietaire" && state.currentUser.formula === "annonce") {
    if (typeof confirmBoostP2 === "function") {
      confirmBoostP2();
    }
    return;
  }
  
  const newTx = {
    id: "TX-" + Math.floor(1000 + Math.random() * 9000),
    date: getTodayDateString(),
    description: `Loyer initial - ${activePaymentProperty.title}`,
    amount: activePaymentProperty.price,
    method: document.querySelector(".pay-method-btn.selected").id.replace("method-", "").toUpperCase() + " Money",
    status: "Payé"
  };
  
  mockDb.transactions.unshift(newTx);
  showAlert("success", "Paiement validé !", "Votre reçu de paiement et votre contrat sont disponibles dans votre espace.");
  navigateTo("#invoices");
}

// ==========================================
// INVOICES & DATA TABLE
// ==========================================
function renderInvoicesTable() {
  const tbody = document.getElementById("invoices-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  mockDb.transactions.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.date}</td>
      <td>${tx.description}</td>
      <td>${formatCurrency(tx.amount)}</td>
      <td>${tx.method}</td>
      <td><span class="status-badge success"><i class="fas fa-check-circle"></i> ${tx.status}</span></td>
      <td>
        <button class="btn btn-ghost" style="padding: 0.35rem 0.75rem;" onclick="viewInvoiceDetails('${tx.id}')">
          <i class="fas fa-file-invoice"></i> Voir
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function viewInvoiceDetails(txId) {
  const tx = mockDb.transactions.find(t => t.id === txId);
  const wrapper = document.getElementById("invoice-view-wrapper");
  if (!wrapper) return;
  
  wrapper.innerHTML = `
    <div class="invoice-wrapper">
      <div class="invoice-header">
        <div class="invoice-logo-side">
          <h2>Bati<span>Bid</span></h2>
          <p>Technologie immobilière sécurisée</p>
          <p>Cotonou, Bénin</p>
        </div>
        <div class="invoice-details-side">
          <h3>FACTURE QUITTANCE</h3>
          <p>Référence: ${tx.id}</p>
          <p>Date d'émission: ${tx.date}</p>
          <p>Statut: <strong>PAYÉ</strong></p>
        </div>
      </div>
      
      <div class="invoice-parties">
        <div class="invoice-party">
          <h4>Émetteur</h4>
          <p><strong>BatiBid SARL</strong></p>
          <p>Zone Commerciale Akpakpa</p>
          <p>Cotonou, Bénin</p>
          <p>Email: contact@batibid.com</p>
        </div>
        <div class="invoice-party">
          <h4>Destinataire</h4>
          <p><strong>${state.currentUser ? state.currentUser.name : "Jean DUPONT"}</strong></p>
          <p>Email: ${state.currentUser ? state.currentUser.email : "jean.dupont@gmail.com"}</p>
          <p>Téléphone: ${state.currentUser ? state.currentUser.phone : "+229 97 22 33 44"}</p>
        </div>
      </div>
      
      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>Description de la prestation</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${tx.description}</strong><br>
              <span style="font-size: 0.85rem; color: var(--gray-600);">Règlement par ${tx.method}</span>
            </td>
            <td style="text-align: right; font-weight: 700;">${formatCurrency(tx.amount)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="invoice-total-section">
        <div class="invoice-total-box">
          <div class="invoice-total-row">
            <span>Sous-total:</span>
            <span>${formatCurrency(tx.amount)}</span>
          </div>
          <div class="invoice-total-row">
            <span>Frais de service (0%):</span>
            <span>0 FCFA</span>
          </div>
          <div class="invoice-total-row grand-total">
            <span>Montant Total:</span>
            <span>${formatCurrency(tx.amount)}</span>
          </div>
        </div>
      </div>
      
      <div class="invoice-footer-notes">
        <p>Merci pour votre confiance en BatiBid.</p>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; color: var(--gray-500);">Cette facture numérique sert de justificatif de paiement légal pour l'occupation du bien immobilier.</p>
      </div>
    </div>
    
    <div class="invoice-actions" style="margin-bottom: 4rem;">
      <button class="btn btn-secondary" onclick="navigateTo('#invoices')">
        <i class="fas fa-arrow-left"></i> Retour aux factures
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        <i class="fas fa-print"></i> Imprimer / PDF
      </button>
    </div>
  `;
  
  navigateTo("#invoice-detail-view");
}

// ==========================================
// DASHBOARD VIEWS GENERATION - Dispatcher
// ==========================================
function renderDashboard() {
  const layout = document.getElementById("dashboard-root-layout");
  if (!layout) return;

  const user = state.currentUser;

  if (!user) {
    layout.innerHTML = `<div style="padding:4rem; text-align:center;">
      <p>Vous n'êtes pas connecté. <a href="#auth" onclick="navigateTo('#auth')">Se connecter</a></p>
    </div>`;
    return;
  }

  // Profil 1 - Propriétaire Gestion Locative (Standard 8% ou Premium 10%)
  if (user.role === "proprietaire" && (user.formula === "integrale" || user.formula === "standard" || user.formula === "premium")) {
    if (typeof renderDashboardProprietaireIntegral === "function") {
      renderDashboardProprietaireIntegral(user);
    } else {
      renderOwnerDashboard(layout, user); // fallback
    }
    return;
  }

  // Profil 2 - Propriétaire Mise en Location (annonce)
  if (user.role === "proprietaire" && (user.formula === "annonce" || user.formula === "collecte" || user.formula === "simple")) {
    if (typeof renderDashboardProprietaireAnnonce === "function") {
      renderDashboardProprietaireAnnonce(user);
    } else {
      renderOwnerDashboard(layout, user);
    }
    return;
  }

  // Profil 4 - Locataire géré par BatiBid
  if (user.role === "locataire" && user.locataireGere) {
    if (typeof renderDashboardLocataireGere === "function") {
      renderDashboardLocataireGere(user);
    } else {
      renderTenantDashboard(layout, user);
    }
    return;
  }

  // Profil 3 - Locataire chercheur
  if (user.role === "locataire" && !user.locataireGere) {
    if (typeof renderDashboardLocataireChercheur === "function") {
      renderDashboardLocataireChercheur(user);
    } else {
      renderTenantDashboard(layout, user);
    }
    return;
  }
  
  renderTenantDashboard(layout, user);
}

// Global dashboard sidebar drawer toggle helper for mobile
window.toggleDashSidebar = function() {
  const sidebar = document.querySelector(".dash-sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  
  let backdrop = document.querySelector(".dash-sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "dash-sidebar-backdrop";
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("open");
      backdrop.classList.remove("active");
    });
    sidebar.parentNode.appendChild(backdrop);
  }
  
  if (sidebar.classList.contains("open")) {
    backdrop.classList.add("active");
  } else {
    backdrop.classList.remove("active");
  }
};

// ==========================================
// CUSTOM MODAL UTILITY
// ==========================================
function showCustomModal(html) {
  // Remove any existing modal
  closeCustomModal();
  const overlay = document.createElement("div");
  overlay.className = "custom-modal-overlay";
  overlay.id = "custom-modal-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCustomModal();
  });
  const box = document.createElement("div");
  box.className = "custom-modal-box";
  box.innerHTML = html;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function closeCustomModal() {
  const existing = document.getElementById("custom-modal-overlay");
  if (existing) existing.remove();
}

function renderTenantDashboard(layout, user) {
  layout.innerHTML = `
    <div class="sidebar">
      <ul class="sidebar-menu">
        <li class="sidebar-item active"><a href="#dashboard"><i class="fas fa-home"></i> Résumé</a></li>
        <li class="sidebar-item"><a href="#trouver"><i class="fas fa-search"></i> Catalogue de biens</a></li>
        <li class="sidebar-item"><a href="#invoices"><i class="fas fa-file-invoice-dollar"></i> Mes Factures</a></li>
        <li class="sidebar-item"><a href="#contact"><i class="fas fa-headset"></i> Support Client</a></li>
      </ul>
      <div class="sidebar-footer">
        <button class="btn btn-secondary" style="width: 100%;" onclick="handleLogout()">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
    </div>
    
    <div class="dashboard-main">
      <div class="dashboard-welcome">
        <h2 class="headline-lg">Bonjour, ${user.name} 👋</h2>
        <p class="body-md" style="color: var(--gray-600);">Ravi de vous revoir sur votre espace locataire BatiBid.</p>
      </div>
      
      <!-- Warning Alert: Loyer Dû (Profil 4) -->
      <div style="background-color: #ffebe6; border-left: 4px solid var(--primary); padding: 1.25rem; border-radius: var(--radius-sm); margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; text-align: left;">
        <div style="flex: 1; min-width: 280px;">
          <h4 style="color: var(--secondary); margin-bottom: 0.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-circle" style="color: var(--primary);"></i> Loyer mensuel en attente
          </h4>
          <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0; line-height: 1.4;">Votre loyer de Juin 2026 d'un montant de 350 000 FCFA est en attente de règlement.</p>
        </div>
        <button class="btn btn-primary" onclick="startRentPayment(1)" style="padding: 0.65rem 1.25rem; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem; border-radius: var(--radius-sm);">
          <i class="fas fa-wallet"></i> Payer mon loyer <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box orange"><i class="fas fa-home"></i></div>
          <div class="metric-info">
            <h5>Bien Occupé</h5>
            <div class="metric-value">1 appartement</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box red"><i class="fas fa-exclamation-triangle" style="color: var(--primary);"></i></div>
          <div class="metric-info">
            <h5>Statut Loyer</h5>
            <div class="metric-value" style="color: var(--primary); font-size: 1.1rem; font-weight: 700;">Dû (Juin 2026)</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box blue"><i class="fas fa-clock"></i></div>
          <div class="metric-info">
            <h5>Date Limite</h5>
            <div class="metric-value" style="font-size: 1.1rem; color: var(--primary); font-weight: 700;">05 Juin 2026</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box purple"><i class="fas fa-heart"></i></div>
          <div class="metric-info">
            <h5>Biens Favoris</h5>
            <div class="metric-value">${mockDb.savedProperties.length}</div>
          </div>
        </div>
      </div>
      
      <h3 class="headline-md mb-4">Mon Logement Actuel</h3>
      <div style="background-color: var(--white); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-300); display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem;">
        <div style="width: 150px; height: 100px; background-color: var(--gray-300); border-radius: var(--radius-md); overflow: hidden; position: relative;">
          <img src="./apt_kitchen.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Mon appartement">
        </div>
        <div style="flex-grow: 1;">
          <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">Appartement F3 Haut Standing</h4>
          <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> Haie Vive, Cotonou</p>
          <div style="font-weight: 700; color: var(--primary);">350 000 FCFA / mois</div>
        </div>
        <div>
          <button class="btn btn-secondary" onclick="viewPropertyDetails(1)">
            <i class="fas fa-info-circle"></i> Gérer mon bail
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOwnerDashboard(layout, user) {
  layout.innerHTML = `
    <div class="sidebar">
      <ul class="sidebar-menu">
        <li class="sidebar-item active"><a href="#dashboard"><i class="fas fa-chart-line"></i> Performance</a></li>
        <li class="sidebar-item"><a href="#dashboard" onclick="showAlert('info', 'Indisponible', 'Simulation : cette section affiche vos biens.')"><i class="fas fa-building"></i> Mes Biens</a></li>
        <li class="sidebar-item"><a href="#dashboard" onclick="showAlert('info', 'Indisponible', 'Simulation : liste de vos locataires.')"><i class="fas fa-users"></i> Mes Locataires</a></li>
        <li class="sidebar-item"><a href="#dashboard" onclick="triggerAutoReport()"><i class="fas fa-file-invoice"></i> Rapports auto.</a></li>
      </ul>
      <div class="sidebar-footer">
        <button class="btn btn-secondary" style="width: 100%;" onclick="handleLogout()">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
    </div>
    
    <div class="dashboard-main">
      <div class="dashboard-welcome" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 class="headline-lg">Tableau de bord, M. ${user.name.split(' ')[0]} 👋</h2>
          <p class="body-md" style="color: var(--gray-600);">Gestion locative garantie de vos propriétés.</p>
        </div>
        <div style="background-color: var(--success-light); color: var(--success); font-weight: 700; padding: 0.5rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; border: 1px solid var(--success);">
          <i class="fas fa-shield-alt" style="margin-right: 0.25rem;"></i> Garantie Recouvrement Active (100%)
        </div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box orange"><i class="fas fa-wallet"></i></div>
          <div class="metric-info">
            <h5>Revenus Mensuels</h5>
            <div class="metric-value">480 000 FCFA</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box green"><i class="fas fa-check-double"></i></div>
          <div class="metric-info">
            <h5>Taux de recouvrement</h5>
            <div class="metric-value">100%</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box blue"><i class="fas fa-chart-pie"></i></div>
          <div class="metric-info">
            <h5>Taux d'occupation</h5>
            <div class="metric-value">92%</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box purple"><i class="fas fa-tools"></i></div>
          <div class="metric-info">
            <h5>Tickets Maintenance</h5>
            <div class="metric-value">0 ouvert</div>
          </div>
        </div>
      </div>
      
      <div style="background-color: var(--white); padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-300); box-shadow: var(--shadow-soft); margin-bottom: 3rem;">
        <h3 class="headline-md mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-chart-bar" style="color: var(--primary);"></i> Suivi Financier Global
        </h3>
        
        <div style="height: 180px; width: 100%; background-color: var(--gray-100); border-radius: var(--radius-md); border: 1px dashed var(--gray-500); display: flex; align-items: center; justify-content: center; color: var(--gray-600); position: relative; overflow: hidden;">
          <svg viewBox="0 0 500 150" style="position: absolute; top:0; left:0; width:100%; height:100%;">
            <path d="M 50 120 L 150 90 L 250 110 L 350 70 L 450 40" fill="none" stroke="var(--primary)" stroke-width="4" />
            <circle cx="50" cy="120" r="6" fill="var(--primary)" />
            <circle cx="150" cy="90" r="6" fill="var(--primary)" />
            <circle cx="250" cy="110" r="6" fill="var(--primary)" />
            <circle cx="350" cy="70" r="6" fill="var(--primary)" />
            <circle cx="450" cy="40" r="6" fill="var(--primary)" />
          </svg>
          <div style="position: absolute; bottom: 1rem; right: 1rem; background-color: var(--white); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; border: 1px solid var(--gray-300);">
            Tendance revenus garantis 2026
          </div>
        </div>
      </div>
    </div>
  `;
}

function triggerAutoReport() {
  showAlert("success", "Rapport Généré !", "Le rapport de gestion mensuel automatique a été compilé et envoyé à votre adresse email.");
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatCurrency(val) {
  return new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
    .format(val)
    .replace("XOF", "FCFA");
}

// Pricing tab switching
window.switchPricingTab = function(tabName) {
  // Update active state on tab buttons
  document.querySelectorAll('.pricing-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update visibility of pricing panes
  document.querySelectorAll('.pricing-tab-pane').forEach(pane => {
    pane.classList.remove('active');
    pane.style.display = 'none';
  });
  const activePane = document.getElementById(`pane-${tabName}`);
  if (activePane) {
    activePane.style.display = 'block';
    // Small delay to trigger animation
    setTimeout(() => {
      activePane.classList.add('active');
    }, 10);
  }
};

// Toggle management sub-formula (Standard vs Premium)
window.toggleManagementPrice = function(mode) {
  const toggleBtnStandard = document.getElementById('m-toggle-standard');
  const toggleBtnPremium = document.getElementById('m-toggle-premium');
  const priceDisplay = document.getElementById('m-price-display');
  const descDisplay = document.getElementById('m-desc-display');
  const featuresList = document.getElementById('m-features-list');

  if (!toggleBtnStandard || !toggleBtnPremium || !priceDisplay || !descDisplay || !featuresList) return;

  if (mode === 'standard') {
    toggleBtnStandard.classList.add('active');
    toggleBtnPremium.classList.remove('active');
    priceDisplay.innerHTML = '8%<span> du loyer / mois</span>';
    descDisplay.innerText = 'Sécurisation courante de vos loyers et gestion technique de base.';
    featuresList.innerHTML = `
      <li><i class="fas fa-check-circle"></i> Collecte automatique des loyers par Mobile Money</li>
      <li><i class="fas fa-check-circle"></i> Suivi des paiements en temps réel</li>
      <li><i class="fas fa-check-circle"></i> Accès complet aux rapports financiers</li>
      <li><i class="fas fa-check-circle"></i> Support client standard</li>
      <li><i class="fas fa-check-circle"></i> Notifications par e-mail</li>
    `;
  } else {
    toggleBtnStandard.classList.remove('active');
    toggleBtnPremium.classList.add('active');
    priceDisplay.innerHTML = '10%<span> du loyer / mois</span>';
    descDisplay.innerText = 'Gestion locative intégrale avec assistance 24/7 et suivi fiscal complet.';
    featuresList.innerHTML = `
      <li><i class="fas fa-check-circle"></i> Toutes les fonctionnalités de l'offre Standard</li>
      <li><i class="fas fa-check-circle"></i> Assistance prioritaire et technique 24/7</li>
      <li><i class="fas fa-check-circle"></i> Rédaction et renouvellement des baux inclus</li>
      <li><i class="fas fa-check-circle"></i> Optimisation fiscale immobilière annuelle</li>
      <li><i class="fas fa-check-circle"></i> Notifications e-mail et SMS prioritaires</li>
    `;
  }
};

// Check legal services coverage simulator
window.checkLegalCoverage = function(issue) {
  const resultDiv = document.getElementById("legal-simulator-result");
  if (!resultDiv) return;

  if (!issue) {
    resultDiv.style.display = "none";
    return;
  }

  let title = "";
  let price = "";
  let statusClass = ""; // tag-included, tag-premium, tag-none
  let statusText = "";
  let description = "";
  let borderColor = "";

  switch (issue) {
    case "expulsion":
    case "recouvrement":
      title = "Procédure d'Expulsion et de Recouvrement";
      price = "100 000 - 300 000 XOF + 10% des sommes recouvrées";
      statusClass = "tag-included";
      statusText = "Totalement Inclus (Gratuit)";
      borderColor = "#2e7d32"; // green
      description = "Ce service est entièrement pris en charge par BatiBid dans le cadre de nos contrats de Gestion Locative Standard (8%) et Premium (10%). Vous n'avez aucun honoraire supplémentaire à payer à nos juristes.";
      break;
    case "strategie":
      title = "Plan d'Action Juridique / Stratégie Contentieuse";
      price = "50 000 - 100 000 XOF (Analyse initiale)";
      statusClass = "tag-included";
      statusText = "Totalement Inclus (Gratuit)";
      borderColor = "#2e7d32"; // green
      description = "Ce service est entièrement pris en charge dans le cadre de nos contrats de Gestion Locative Standard (8%) et Premium (10%). Nos experts analysent les pièces et élaborent la stratégie pour vous défendre.";
      break;
    case "fiscalite":
      title = "Optimisation Fiscale Immobilière";
      price = "75 000 - 200 000 XOF";
      statusClass = "tag-premium";
      statusText = "Inclus dans l'offre Premium (10%)";
      borderColor = "#d95e2b"; // orange
      description = "Ce service est couvert pour les propriétaires ayant souscrit à l'offre de Gestion Locative Premium (10%). Pour les clients de l'offre Standard (8%) ou hors gestion, ce service est disponible sous forme de forfait à la carte.";
      break;
    case "transaction":
      title = "Transaction Immobilière Sécurisée";
      price = "80 000 - 150 000 XOF (Conseil initial) + Commission";
      statusClass = "tag-none";
      statusText = "Non Couvert (Service à la carte)";
      borderColor = "#606060"; // grey
      description = "Ce service concerne l'achat ou la vente de biens immobiliers. Il est exclu des formules de gestion locative classique. Nos juristes vous accompagnent de manière indépendante pour sécuriser votre investissement.";
      break;
    case "bail":
      title = "Forfait Contrat de Location Sécurisé";
      price = "50 000 - 100 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte (Inclus lors de la mise en location)";
      borderColor = "#606060"; // grey
      description = "La rédaction du bail est offerte lors de la signature d'une formule de gestion locative ou d'une offre découverte. En dehors de ces cadres, la rédaction ou négociation d'un contrat de bail de manière isolée est facturée au tarif forfaitaire indiqué.";
      break;
    case "mediation":
      title = "Accords contradictoires de Règlement Amiable / Médiation";
      price = "50 000 - 200 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte";
      borderColor = "#606060";
      description = "Ce service permet d'intervenir en médiateur pour sceller un accord officiel écrit et éviter le tribunal. Disponible en prestation autonome pour tout propriétaire ou locataire hors gestion.";
      break;
    case "contrat":
      title = "Sécurisation de vos Contrats d'Affaires";
      price = "50 000 - 200 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte";
      borderColor = "#606060";
      description = "Rédaction et sécurisation juridique de vos contrats de construction, rénovation ou contrats d'artisans. Service à la carte indépendant.";
      break;
    case "precontentieux":
      title = "Acte de procédure préalable à la saisine (Précontentieux locatif)";
      price = "20 000 - 50 000 XOF";
      statusClass = "tag-none";
      statusText = "Service à la carte";
      borderColor = "#606060";
      description = "Préparation et envoi des mises en demeure formelles aux locataires avant toute saisine des juridictions. Service autonome à la carte.";
      break;
    default:
      resultDiv.style.display = "none";
      return;
  }

  resultDiv.innerHTML = `
    <h4 class="diagnostic-res-title" style="font-size: 1.25rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem;">${title}</h4>
    <div style="display: flex; gap: 0.85rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center;">
      <span class="coverage-tag ${statusClass}" style="margin: 0;"><i class="fas ${statusClass === 'tag-included' ? 'fa-check-double' : statusClass === 'tag-premium' ? 'fa-star' : 'fa-info-circle'}"></i> ${statusText}</span>
      <span class="diagnostic-res-price" style="font-size: 0.9rem; font-weight: 700; color: #FEF08A;"><i class="fas fa-tag" style="color: #FF9E66; margin-right: 0.35rem;"></i> Tarif indicatif : ${price}</span>
    </div>
    <p class="diagnostic-res-desc" style="color: #E2E8F0; margin: 0 0 1.25rem; line-height: 1.65; font-size: 0.95rem;">${description}</p>
    <div class="diagnostic-action-footer">
      <div class="daf-info">
        <i class="fas fa-file-shield" style="color: var(--clr-primary, #D9571E);"></i>
        <span>Situation pré-qualifiée : <strong>${title}</strong></span>
      </div>
      <button type="button" class="btn-proceed-audit btn-shimmer" onclick="proceedLegalAuditFromDiagnosis('${issue}')">
        <span>Poursuivre ma demande d'audit</span>
        <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </button>
    </div>
  `;
  resultDiv.style.borderColor = borderColor;
  resultDiv.style.display = "block";
  resultDiv.classList.remove('calc-pulse');
  void resultDiv.offsetWidth;
  resultDiv.classList.add('calc-pulse');
};

function getTodayDateString() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('fr-FR', options);
}

function showAlert(type, title, message) {
  const modal = document.getElementById("alert-modal");
  const icon = document.getElementById("alert-modal-icon");
  const modalTitle = document.getElementById("alert-modal-title");
  const modalText = document.getElementById("alert-modal-text");
  
  if (!modal) return;
  
  icon.className = "modal-icon";
  if (type === "success") {
    icon.classList.add("success", "fas", "fa-check-circle");
  } else if (type === "error") {
    icon.classList.add("error", "fas", "fa-exclamation-triangle");
  } else {
    icon.classList.add("fas", "fa-info-circle");
  }
  
  modalTitle.innerText = title;
  modalText.innerText = message;
  
  modal.classList.add("active");
}

function closeAlert() {
  document.getElementById("alert-modal").classList.remove("active");
}

function initExpertiseTabs() {
  const tabs = document.querySelectorAll(".expertise-tab");
  const panes = document.querySelectorAll(".expertise-pane");
  if (!tabs.length || !panes.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetIdx = tab.getAttribute("data-index");

      // Deactivate all tabs & panes
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));

      // Activate clicked tab & its pane
      tab.classList.add("active");
      const targetPane = document.getElementById(`ext-pane-${targetIdx}`);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });
}

function initWorkflowSimulator() {
  const scenarioBtns = document.querySelectorAll(".scenario-btn");
  if (!scenarioBtns.length) return;

  const WORKFLOW_SCENARIOS = {
    leak: {
      progress: "100%",
      highlightCount: 4,
      steps: [
        "<strong>Alerte reçue !</strong> Le gestionnaire prend en charge l'incident sous 10min et alerte le propriétaire sur son dashboard.",
        "Un artisan plombier partenaire qualifié intervient sous 24h à 48h avec devis validé.",
        "Validation de l'imputation de charge de réparation entre bailleur et locataire selon le Code du foncier béninois.",
        "Le conseiller se rend sur place pour valider la conformité des travaux et clore le ticket d'incident."
      ]
    },
    delay: {
      progress: "66.6%",
      highlightCount: 3,
      steps: [
        "<strong>Loyer impayé le 5 !</strong> Le gestionnaire lance des rappels amiables automatisés par SMS et e-mail le 6 du mois.",
        "<strong>Relance infructueuse ?</strong> Notre juriste rédige et envoie une mise en demeure formelle sous 48h.",
        "<strong>Procédure enclenchée :</strong> Le juriste gère 100% de la procédure de recouvrement forcée ou conciliation.",
        "<em>Étape finale non requise.</em> La Garantie Loyers Impayés (GLI) BatiBid prend le relais pour couvrir le propriétaire."
      ]
    },
    tenant: {
      progress: "100%",
      highlightCount: 4,
      steps: [
        "Le conseiller terrain effectue les visites et réalise l'état des lieux certifié de sortie/entrée sur tablette.",
        "Le gestionnaire vérifie la solvabilité des dossiers locataires sous 24h et les présente au propriétaire.",
        "Le juriste rédige le contrat de bail sécurisé en conformité avec le Code du foncier béninois.",
        "Le gestionnaire BatiBid valide les garanties de loyer (Mobile Money ou banque) et installe officiellement le locataire."
      ]
    }
  };

  function applyScenario(scenarioKey) {
    const config = WORKFLOW_SCENARIOS[scenarioKey];
    if (!config) return;

    // Update text content of tooltips
    for (let i = 0; i < 4; i++) {
      const tooltip = document.getElementById(`wf-text-${i}`);
      if (tooltip) {
        tooltip.innerHTML = config.steps[i];
      }
    }

    // Animate line & highlight active steps
    const progressLine = document.getElementById("wf-progress-line");
    if (progressLine) {
      const isMobile = window.innerWidth <= 992;
      if (isMobile) {
        progressLine.style.width = "100%";
        progressLine.style.height = config.progress;
      } else {
        progressLine.style.height = "100%";
        progressLine.style.width = config.progress;
      }
    }

    const steps = document.querySelectorAll(".workflow-step");
    steps.forEach(step => {
      const stepIdx = parseInt(step.getAttribute("data-step"), 10);
      if (stepIdx < config.highlightCount) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });
  }

  // Bind click handlers to scenario buttons
  scenarioBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      scenarioBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const scenarioKey = btn.getAttribute("data-scenario");
      applyScenario(scenarioKey);
    });
  });

  // Handle window resize to adjust progress line direction
  window.addEventListener("resize", () => {
    const activeBtn = document.querySelector(".scenario-btn.active");
    if (activeBtn) {
      const scenarioKey = activeBtn.getAttribute("data-scenario");
      applyScenario(scenarioKey);
    }
  });

  // Initialize with default scenario
  applyScenario("leak");
}

// ==========================================
// HOME PAGE & DEMO MODAL HANDLERS
// ==========================================
function openDemoModal() {
  const modal = document.getElementById("demo-modal");
  if (modal) {
    // S'assurer que la modale est rattachée directement au <body> pour garantir son positionnement absolu sur le viewport
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    const video = document.getElementById("demo-platform-video");
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay audio bloqué par la politique du navigateur, tentative en sourdine:", err);
          video.muted = true;
          video.play().catch((e) => console.warn("Lecture vidéo automatique impossible:", e));
        });
      }
    }
  }
}

function closeDemoModal() {
  const modal = document.getElementById("demo-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    const video = document.getElementById("demo-platform-video");
    if (video) {
      video.pause();
    }
  }
}

function openGererDemoModal() {
  const modal = document.getElementById("gerer-demo-modal");
  if (modal) {
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    const video = document.getElementById("gerer-platform-video");
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay audio bloqué par la politique du navigateur, tentative en sourdine:", err);
          video.muted = true;
          video.play().catch((e) => console.warn("Lecture vidéo automatique impossible:", e));
        });
      }
    }
  }
}

function closeGererDemoModal() {
  const modal = document.getElementById("gerer-demo-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    const video = document.getElementById("gerer-platform-video");
    if (video) {
      video.pause();
    }
  }
}

function navigateToGererSection4(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  if (window.location.hash === "#gerer") {
    const sec = document.getElementById("gerer-tech");
    if (sec) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else {
    window.location.hash = "#gerer";
    setTimeout(() => {
      const sec = document.getElementById("gerer-tech");
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 180);
  }
}

function openSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    const input = document.getElementById("search-modal-input");
    if (input) setTimeout(() => input.focus(), 100);
  }
}

function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function initHeaderSearch() {
  const searchInput = document.querySelector(".header-search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        const url = query 
          ? `https://app.batibid.com/search?q=${encodeURIComponent(query)}`
          : `https://app.batibid.com/search`;
        window.open(url, "_blank", "noopener");
      }
    });
  }
}

// ==========================================
// BLOG COMPONENT LOGIC & ARTICLE READER
// ==========================================
const blogArticlesDatabase = {
  calavi: {
    badge: "Actualités",
    badgeClass: "blog-badge-actu",
    date: "09 Juin 2026",
    title: "Investir à Abomey-Calavi : Les quartiers d'avenir en 2026",
    image: "./assets/images/blog_calavi.jpg",
    content: `
      <p>Abomey-Calavi est aujourd'hui la commune à la plus forte expansion démographique et économique du Grand Nokoué. Portée par la proximité immédiate de Cotonou, l'essor des infrastructures routières et les projets structurants de l'État, la commune attire de plus en plus d'investisseurs institutionnels et particuliers.</p>
      
      <h3>1. La dynamique des infrastructures et de l'asphaltage</h3>
      <p>Les phases récentes des programmes d'asphaltage et d'aménagement urbain ont désenclavé des zones autrefois difficiles d'accès pendant la saison des pluies. Les axes reliant Calavi-Centre, Akassato et Cocotomey bénéficient désormais d'une circulation fluide, augmentant directement la valeur foncière et locative des parcelles adjacentes.</p>
      
      <blockquote>
        « Le rendement locatif brut moyen à Abomey-Calavi s'établit entre 9% et 11,5% en 2026, surpassant de près de 3 points la moyenne de Cotonou intra-muros. »
      </blockquote>

      <h3>2. Les quartiers phares à cibler</h3>
      <p><strong>Arconville & Calavi-Centre :</strong> Très recherchés par les cadres et les fonctionnaires travaillant à Cotonou, ces quartiers offrent un taux d'occupation avoisinant 98% pour les appartements de type 2 et 3 pièces.</p>
      <p><strong>Zopah & Cité La Victoire :</strong> Idéals pour les résidences pavillonnaires sécurisées et les villas duplex familiales avec cour arborée.</p>
      <p><strong>Togba & Ouèdo :</strong> En plein boom grâce à la cité administrative et aux grands complexes immobiliers, ce secteur représente le plus fort potentiel de plus-value à 5 ans.</p>

      <h3>3. Conseils BatiBid pour sécuriser votre investissement</h3>
      <p>Avant toute signature ou versement d'acompte, vérifiez systématiquement l'état cadastral auprès de l'Agence Nationale du Domaine et du Foncier (ANDF). L'équipe BatiBid propose un audit juridique complet et un mandat de gestion locative avec garantie des loyers à 100%.</p>
    `
  },
  loyers: {
    badge: "Conseils",
    badgeClass: "blog-badge-conseils",
    date: "02 Juin 2026",
    title: "Loyers Impayés : Comment notre garantie à 100% protège les bailleurs",
    image: "./assets/images/apt_kitchen.png",
    content: `
      <p>Pour tout propriétaire bailleur au Bénin comme dans la diaspora, le risque d'impayé ou de retard de loyer constitue le premier frein psychologique et financier à l'investissement immobilier locatif.</p>

      <h3>1. Le modèle classique et ses limites</h3>
      <p>Traditionnellement, la gestion confiée à un démarcheur informel ou à des proches engendre des retards chroniques, des conflits relationnels et des procédures d'expulsion longues et coûteuses pouvant paralyser la trésorerie d'un bien pendant plusieurs mois.</p>

      <blockquote>
        « Avec BatiBid, le versement de votre loyer est garanti chaque 5 du mois, quel que soit le statut de paiement du locataire. Zéro retard, zéro incertitude. »
      </blockquote>

      <h3>2. Comment fonctionne le fonds de garantie BatiBid ?</h3>
      <p>BatiBid a constitué un fonds de réserve institutionnel adossé à un scoring rigoureux des locataires (analyse des revenus, contrat de travail, quittances antérieures et vérification d'identité sécurisée).</p>
      <p>Dès le 5 du mois civil, notre système bancaire automatisé crédite votre compte bancaire ou compte Mobile Money (MTN / Moov Money). Si un locataire accuse un retard, nos juristes spécialisés prennent en charge l'ensemble des relances et démarches légales sans aucun frais supplémentaire pour vous.</p>

      <h3>3. Une tranquillité totale pour la diaspora</h3>
      <p>Depuis Paris, Montréal, New York ou Dakar, vous suivez en direct l'état locatif de vos biens, vos quittances numérisées et l'historique complet des versements sur votre tableau de bord BatiBid.</p>
    `
  },
  parcelle: {
    badge: "Conseils",
    badgeClass: "blog-badge-conseils",
    date: "24 Mai 2026",
    title: "Les 5 pièges à éviter lors de l'achat d'une parcelle à Cotonou",
    image: "./assets/images/blog_parcelle.jpg",
    content: `
      <p>L'acquisition d'un terrain à Cotonou et dans ses environs immédiats représente un investissement d'une vie. Pourtant, le marché foncier béninois comporte des pièges récurrents qui peuvent transformer un projet prometteur en un contentieux judiciaire interminable.</p>

      <h3>Piège n°1 : Acheter sans Titre Foncier (TF) définitif</h3>
      <p>Ne vous fiez pas à une simple convention de vente ou à une attestation de recasement non finalisée. Exigez la vérification du numéro de Titre Foncier et l'état des charges au livre foncier tenu par l'ANDF pour certifier que le bien n'est pas hypothéqué ou saisi.</p>

      <h3>Piège n°2 : Les litiges d'héritage et mandats familiaux contestés</h3>
      <p>Une vente conclue avec un seul héritier sans le consentement officiel de tous les co-indivisaires ou sans jugement d'hérédité homologué est juridiquement nulle et attaquable à tout moment devant les tribunaux de conciliation.</p>

      <h3>Piège n°3 : Négliger le bornage contradictoire par un géomètre agréé</h3>
      <p>Ne prenez jamais possession d'une parcelle sans l'intervention d'un géomètre expert inscrit à l'Ordre des Géomètres Experts du Bénin (OGEB) pour vérifier les coordonnées GPS réelles et l'absence d'empiètement sur le domaine public ou le voisin.</p>

      <h3>Piège n°4 : Les zones inondables ou non constructibles</h3>
      <p>Pendant la saison sèche, certains terrains bas-fonds semblent parfaitement viabilisés. Vérifiez systématiquement le plan d'aménagement urbain communal et le niveau de nappe phréatique avant tout engagement de construction.</p>

      <h3>Piège n°5 : Les transactions en liquide de la main à la main</h3>
      <p>Toute transaction foncière sécurisée doit obligatoirement transiter par l'étude d'un notaire agréé, qui séquestre les fonds et garantit la régularité du transfert de propriété dans le respect du Code Foncier et Domanial.</p>
    `
  }
};

function filterBlogArticles(category, clickedBtn) {
  const tabs = document.querySelectorAll('.blog-tab');
  tabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  if (clickedBtn) {
    clickedBtn.classList.add('active');
    clickedBtn.setAttribute('aria-selected', 'true');
  }

  const featuredCard = document.querySelector('.blog-featured-card');
  const cards = document.querySelectorAll('.blog-cards-grid .blog-card');

  if (featuredCard) {
    const featCat = featuredCard.getAttribute('data-category');
    if (category === 'all' || category === featCat) {
      featuredCard.style.display = '';
      featuredCard.classList.remove('is-filtering');
      void featuredCard.offsetHeight; // force reflow
      featuredCard.classList.add('is-filtering');
    } else {
      featuredCard.style.display = 'none';
    }
  }

  let visibleIdx = 0;
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || category === cardCat) {
      card.style.display = '';
      card.classList.remove('is-filtering');
      void card.offsetHeight; // force reflow
      card.style.animationDelay = `${visibleIdx * 0.08}s`;
      card.classList.add('is-filtering');
      visibleIdx++;
    } else {
      card.style.display = 'none';
    }
  });
}

function openArticleReader(articleId) {
  const article = blogArticlesDatabase[articleId];
  if (!article) return;

  const modal = document.getElementById('article-reader-modal');
  if (!modal) return;

  const badgeEl = document.getElementById('arm-badge');
  const dateEl = document.getElementById('arm-date');
  const titleEl = document.getElementById('arm-title');
  const imageEl = document.getElementById('arm-image');
  const bodyEl = document.getElementById('arm-body');

  if (badgeEl) {
    badgeEl.textContent = article.badge;
    badgeEl.className = `blog-badge ${article.badgeClass || ''}`;
  }
  if (dateEl) dateEl.textContent = article.date;
  if (titleEl) titleEl.textContent = article.title;
  if (imageEl) {
    imageEl.src = article.image;
    imageEl.alt = article.title;
  }
  if (bodyEl) bodyEl.innerHTML = article.content;

  const ctaContainer = modal.querySelector('.arm-footer-cta');
  if (ctaContainer) {
    if (articleId === 'loyers') {
      ctaContainer.innerHTML = `<a href="gerer" class="btn btn-primary btn-shimmer" onclick="closeArticleReader()"><i class="fas fa-shield-alt"></i> Découvrir la formule Premium 10%</a>`;
    } else if (articleId === 'parcelle') {
      ctaContainer.innerHTML = `<a href="juridique" class="btn btn-primary btn-shimmer" onclick="closeArticleReader()"><i class="fas fa-balance-scale"></i> Auditer mon titre foncier</a>`;
    } else if (articleId === 'calavi') {
      ctaContainer.innerHTML = `<a href="https://app.batibid.com/search" target="_blank" rel="noopener" class="btn btn-primary btn-shimmer" onclick="closeArticleReader()"><i class="fas fa-search"></i> Explorer les biens à Calavi</a>`;
    } else {
      ctaContainer.innerHTML = `<a href="contact" class="btn btn-primary btn-shimmer" onclick="closeArticleReader()"><i class="fas fa-calendar-alt"></i> Prendre conseil avec un expert</a>`;
    }
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeArticleReader() {
  const modal = document.getElementById('article-reader-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

// ==========================================
// BATIBID PRIVATE MARKET INTERACTIVE LOGIC
// ==========================================
function switchPrivateTrack(track, shouldScroll) {
  const btnVendeur = document.getElementById('pm-mode-btn-vendeur');
  const btnAcquereur = document.getElementById('pm-mode-btn-acquereur');
  const viewVendeur = document.getElementById('pm-view-vendeur');
  const viewAcquereur = document.getElementById('pm-view-acquereur');

  const targetView = track === 'vendeur' ? viewVendeur : viewAcquereur;

  if (track === 'vendeur') {
    if (btnVendeur) btnVendeur.classList.add('active');
    if (btnAcquereur) btnAcquereur.classList.remove('active');
    if (viewVendeur) viewVendeur.classList.add('active');
    if (viewAcquereur) viewAcquereur.classList.remove('active');
  } else {
    if (btnVendeur) btnVendeur.classList.remove('active');
    if (btnAcquereur) btnAcquereur.classList.add('active');
    if (viewVendeur) viewVendeur.classList.remove('active');
    if (viewAcquereur) viewAcquereur.classList.add('active');
  }

  // Re-trigger stagger animation smoothly on the newly active track
  if (targetView) {
    const staggerGrid = targetView.querySelector('.stagger-children');
    if (staggerGrid) {
      staggerGrid.classList.remove('is-visible');
      void staggerGrid.offsetHeight; // force reflow
      staggerGrid.classList.add('is-visible');
      const children = staggerGrid.querySelectorAll('> *');
      children.forEach((c, idx) => {
        c.classList.remove('is-visible');
        setTimeout(() => c.classList.add('is-visible'), 40 + idx * 65);
      });
    }
  }

  if (shouldScroll) {
    const targetAnchor = document.getElementById('pm-operational-anchor');
    if (targetAnchor) {
      targetAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function updateAcquereurPreview() {
  const zonesInput = document.getElementById('acq_zones');
  const budgetInput = document.getElementById('acq_budget');
  const objectifInput = document.getElementById('acq_objectif');
  const delaiInput = document.getElementById('acq_delai');
  const financementInput = document.getElementById('acq_financement');

  const prevZones = document.getElementById('prev_zones');
  const prevBudget = document.getElementById('prev_budget');
  const prevObjectif = document.getElementById('prev_objectif');
  const prevDelai = document.getElementById('prev_delai');
  const prevFinancement = document.getElementById('prev_financement');

  if (zonesInput && prevZones) prevZones.textContent = zonesInput.value || 'Cotonou, Calavi, Ouidah';
  if (budgetInput && prevBudget) prevBudget.textContent = budgetInput.value;
  if (objectifInput && prevObjectif) prevObjectif.textContent = objectifInput.options[objectifInput.selectedIndex].text;
  if (delaiInput && prevDelai) prevDelai.textContent = delaiInput.value;
  if (financementInput && prevFinancement) prevFinancement.textContent = financementInput.value;

  // Visual feedback: micro-pulse on profile summary card
  const profileCard = document.getElementById('pm-profile-card-element') || document.querySelector('.pm-profile-card');
  if (profileCard) {
    profileCard.classList.remove('calc-pulse');
    void profileCard.offsetHeight; // force reflow
    profileCard.classList.add('calc-pulse');
  }
}

function submitPrivateVendeur(event) {
  event.preventDefault();
  const feedback = document.getElementById('pm-vendeur-feedback');
  if (feedback) {
    feedback.style.display = 'block';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function submitPrivateAcquereur(event) {
  event.preventDefault();
  const feedback = document.getElementById('pm-acquereur-feedback');
  if (feedback) {
    feedback.style.display = 'block';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function togglePrivateFaq(btn) {
  const card = btn.closest('.pm-faq-card');
  if (!card) return;
  const wasActive = card.classList.contains('active');
  card.classList.toggle('active', !wasActive);
}

function slidePrivateOpportunities(direction) {
  const track = document.getElementById('pm-teasers-track');
  if (track) {
    track.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }
}

function togglePrivateVendeurForm() {
  const container = document.getElementById('pm-vendeur-form-collapsible');
  const icon = document.getElementById('pm-vendeur-toggle-icon');
  const trigger = document.getElementById('pm-vendeur-collapsed-trigger');
  if (!container) return;

  const isHidden = container.style.display === 'none' || !container.style.display;
  if (isHidden) {
    container.style.display = 'block';
    container.style.opacity = '0';
    container.style.transform = 'translateY(-8px)';
    container.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    void container.offsetWidth; // force reflow
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    if (icon) icon.className = 'fas fa-chevron-up';
    if (trigger) trigger.classList.add('is-expanded');
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  } else {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      container.style.display = 'none';
      if (icon) icon.className = 'fas fa-chevron-down';
      if (trigger) trigger.classList.remove('is-expanded');
    }, 300);
  }
}

let privatePipelineGlowInterval = null;
function initPrivatePipelineGlowLoop() {
  const container = document.getElementById('pm-pipeline-glow-container');
  if (!container) return;

  if (privatePipelineGlowInterval) clearInterval(privatePipelineGlowInterval);

  const steps = [
    document.getElementById('pm-step-prive'),
    document.getElementById('pm-step-qualification'),
    document.getElementById('pm-step-acces'),
    document.getElementById('pm-step-revelation')
  ];

  const lines = [
    document.getElementById('pm-line-1'),
    document.getElementById('pm-line-2'),
    document.getElementById('pm-line-3')
  ];

  let currentStepIdx = 0;

  const cycleGlow = () => {
    steps.forEach(s => s && s.classList.remove('is-glowing'));
    lines.forEach(l => l && l.classList.remove('is-sweeping'));

    const activeStep = steps[currentStepIdx];
    if (activeStep) {
      activeStep.classList.add('is-glowing');
    }

    const nextLine = lines[currentStepIdx];
    if (nextLine) {
      nextLine.classList.add('is-sweeping');
    }

    currentStepIdx = (currentStepIdx + 1) % steps.length;
  };

  cycleGlow();
  privatePipelineGlowInterval = setInterval(cycleGlow, 2400);
}

let privateTeasersAutoScrollInterval = null;
function initPrivateTeasersAutoScroll() {
  const track = document.getElementById('pm-teasers-track');
  if (!track) return;

  if (privateTeasersAutoScrollInterval) clearInterval(privateTeasersAutoScrollInterval);

  const stepScroll = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  privateTeasersAutoScrollInterval = setInterval(stepScroll, 3500);

  if (!track._hasAutoScrollListeners) {
    track._hasAutoScrollListeners = true;
    track.addEventListener('mouseenter', () => {
      if (privateTeasersAutoScrollInterval) clearInterval(privateTeasersAutoScrollInterval);
    });
    track.addEventListener('mouseleave', () => {
      if (privateTeasersAutoScrollInterval) clearInterval(privateTeasersAutoScrollInterval);
      privateTeasersAutoScrollInterval = setInterval(stepScroll, 3500);
    });
    track.addEventListener('touchstart', () => {
      if (privateTeasersAutoScrollInterval) clearInterval(privateTeasersAutoScrollInterval);
    }, { passive: true });
    track.addEventListener('touchend', () => {
      if (privateTeasersAutoScrollInterval) clearInterval(privateTeasersAutoScrollInterval);
      privateTeasersAutoScrollInterval = setInterval(stepScroll, 3500);
    }, { passive: true });
  }
}

function requestPrivateAccess(ref, title) {
  const text = encodeURIComponent(`Bonjour BatiBid, je souhaite demander l'accès confidentiel au dossier Private Market [${ref}] : ${title}.`);
  window.open(`https://wa.me/2290142484848?text=${text}`, '_blank');
}

// ==========================================
// BATIBID PARTENARIATS INTERACTIVE LOGIC
// ==========================================
function openPartnerModal() {
  const modal = document.getElementById('partner-modal-backdrop');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePartnerModal() {
  const modal = document.getElementById('partner-modal-backdrop');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closePartnerModalOnBackdrop(event) {
  if (event.target.id === 'partner-modal-backdrop') {
    closePartnerModal();
  }
}

function openPartnerContactModal() {
  const text = encodeURIComponent("Bonjour BatiBid, je souhaite échanger au sujet d'un partenariat institutionnel ou commercial.");
  window.open(`https://wa.me/2290142484848?text=${text}`, '_blank');
}

function submitPartnerRegistration(event) {
  event.preventDefault();
  const feedback = document.getElementById('partner-modal-feedback');
  if (feedback) {
    feedback.style.display = 'flex';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ===================================================================
   BATIBID — GÉRER (GESTION PATRIMONIALE) INTERACTIVE FUNCTIONS
   =================================================================== */
function switchGererPricingTab(tab) {
  const pillDelegation = document.getElementById('pill-delegation');
  const pillDigitale = document.getElementById('pill-digitale');
  const tabDelegation = document.getElementById('tab-delegation');
  const tabDigitale = document.getElementById('tab-digitale');

  if (tab === 'delegation') {
    if (pillDelegation) pillDelegation.classList.add('active');
    if (pillDigitale) pillDigitale.classList.remove('active');
    if (tabDelegation) {
      tabDelegation.classList.add('active');
      tabDelegation.querySelectorAll('.pricing-tier-card').forEach((card) => {
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = '';
      });
    }
    if (tabDigitale) tabDigitale.classList.remove('active');
  } else {
    if (pillDelegation) pillDelegation.classList.remove('active');
    if (pillDigitale) pillDigitale.classList.add('active');
    if (tabDelegation) tabDelegation.classList.remove('active');
    if (tabDigitale) {
      tabDigitale.classList.add('active');
      tabDigitale.querySelectorAll('.pricing-tier-card').forEach((card) => {
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = '';
      });
    }
  }
}



function toggleGererPricingDetails() {
  const table = document.getElementById('gerer-pricing-details-table');
  const btn = document.getElementById('btn-pricing-details-toggle');
  if (!table || !btn) return;
  const isHidden = table.style.display === 'none' || !table.style.display;
  table.style.display = isHidden ? 'block' : 'none';
  btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  const icon = btn.querySelector('.toggle-icon i');
  if (icon) {
    icon.className = isHidden ? 'fas fa-minus' : 'fas fa-plus';
  }
}

function openGererModal(formula) {
  const modal = document.getElementById('gerer-modal-backdrop');
  if (!modal) return;

  // Hoist to body to ensure fixed positioning is relative to viewport with zero scroll offset
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  const offerSelect = document.getElementById('lead-offer');
  const titleEl = document.getElementById('gerer-modal-title');
  const descEl = document.getElementById('gerer-modal-desc');

  if (titleEl && descEl) {
    if (formula === 'brochure') {
      titleEl.textContent = "Télécharger la brochure tarifaire BatiBid";
      descEl.textContent = "Renseignez vos coordonnées pour recevoir le guide PDF complet et nos grilles d'offres sous 24h.";
    } else {
      titleEl.textContent = "Optimisez la gestion de votre patrimoine";
      descEl.textContent = "Renseignez vos coordonnées pour recevoir une proposition d'accompagnement personnalisée sous 24h.";
    }
  }

  if (offerSelect && formula) {
    if (formula === 'serenite' || formula === 'premium') offerSelect.value = 'premium';
    else if (formula === 'essentiel') offerSelect.value = 'essentiel';
    else if (formula === 'digital' || formula === 'gestion-digitale') offerSelect.value = 'digital';
    else if (formula === 'avance-loyer') offerSelect.value = 'avance-loyer';
    else if (formula === 'pack-duo') offerSelect.value = 'pack-duo';
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Reset internal modal scroll to top
  const dialog = modal.querySelector('.gerer-modal-dialog');
  if (dialog) dialog.scrollTop = 0;
}

function closeGererModal(event) {
  if (event && event.target && event.target.id !== 'gerer-modal-backdrop' && !event.target.closest('.gerer-modal-close')) {
    return;
  }
  const modal = document.getElementById('gerer-modal-backdrop');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function submitGererLead(event) {
  event.preventDefault();
  const form = document.getElementById('gerer-lead-form');
  const success = document.getElementById('gerer-modal-success');
  if (form && success) {
    form.style.display = 'none';
    success.style.display = 'block';
  }
}

// ==========================================
// PARCOURS DE MISE EN LOCATION : FORMAT DÉPLIANT (ACCORDÉON)
// ==========================================
function toggleLocProcessStep(stepIndex) {
  const container = document.getElementById('loc-process-accordion');
  if (!container) return;
  const items = container.querySelectorAll('.loc-accordion-item');
  if (!items || items.length === 0) return;

  items.forEach((item, idx) => {
    const isTarget = idx === stepIndex;
    const header = item.querySelector('.loc-accordion-header');
    if (isTarget) {
      const willBeActive = !item.classList.contains('active');
      item.classList.toggle('active', willBeActive);
      if (header) header.setAttribute('aria-expanded', willBeActive ? 'true' : 'false');
    } else {
      item.classList.remove('active');
      if (header) header.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==========================================
// FORMULAIRE D'ESTIMATION CONSTRUIRE : DÉPLIAGE FLUIDE
// ==========================================
function toggleConstruireEstimationForm() {
  const formWrap = document.getElementById('estimation-form-collapsible');
  const btn = document.getElementById('btn-toggle-estimation-form');
  if (!formWrap) return;
  const isOpen = formWrap.classList.contains('open');
  if (isOpen) {
    formWrap.classList.remove('open');
    if (btn) {
      btn.innerHTML = 'Demander mon estimation gratuite sous 24h <i class="fas fa-arrow-down" style="margin-left: 0.5rem;"></i>';
      btn.setAttribute('aria-expanded', 'false');
    }
  } else {
    formWrap.classList.add('open');
    if (btn) {
      btn.innerHTML = 'Masquer le formulaire d\'estimation <i class="fas fa-arrow-up" style="margin-left: 0.5rem;"></i>';
      btn.setAttribute('aria-expanded', 'true');
    }
    setTimeout(() => {
      formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
  }
}

// ==========================================
// SECTION 03 : MOTION ANIMATION CYCLE (Page Gérer)
// Mise en avant séquentielle automatique (Spotlight)
// ==========================================
let gererSolutionsInterval = null;

function initGererSolutionsMotion() {
  const container = document.getElementById('gerer-solutions');
  if (!container) return;
  const cards = container.querySelectorAll('.gerer-solution-card');
  if (!cards || cards.length === 0) return;

  if (gererSolutionsInterval) {
    clearInterval(gererSolutionsInterval);
    gererSolutionsInterval = null;
  }

  let currentIndex = 0;
  let isPaused = false;

  function setActiveCard(index) {
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('is-spotlight');
      } else {
        card.classList.remove('is-spotlight');
      }
    });
  }

  // Activer immédiatement la première carte (Clés en main)
  setActiveCard(currentIndex);

  // Cycle automatique toutes les 3.5 secondes
  gererSolutionsInterval = setInterval(() => {
    if (isPaused) return;
    currentIndex = (currentIndex + 1) % cards.length;
    setActiveCard(currentIndex);
  }, 3500);

  // Pause et activation immédiate au survol ou au toucher
  cards.forEach((card, index) => {
    if (card.dataset.motionBound === 'true') return;
    card.dataset.motionBound = 'true';

    card.addEventListener('mouseenter', () => {
      isPaused = true;
      currentIndex = index;
      setActiveCard(index);
    });

    card.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    card.addEventListener('touchstart', () => {
      isPaused = true;
      currentIndex = index;
      setActiveCard(index);
    }, { passive: true });
  });
}

// ==========================================
// CONSTRUIRE & RÉNOVER INTERACTIVE FUNCTIONS
// ==========================================
let construirePiliersInterval = null;

function initConstruirePiliersMotion() {
  const container = document.getElementById('construire-piliers');
  if (!container) return;
  const cards = container.querySelectorAll('.pilier-card');
  if (!cards || cards.length === 0) return;

  if (construirePiliersInterval) {
    clearInterval(construirePiliersInterval);
    construirePiliersInterval = null;
  }

  let currentIndex = 0;
  let isPaused = false;

  function setActiveCard(index) {
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('is-spotlight');
      } else {
        card.classList.remove('is-spotlight');
      }
    });
  }

  // Activer immédiatement la première carte (Suivi de chantier en temps réel)
  setActiveCard(currentIndex);

  // Cycle automatique toutes les 3.5 secondes
  construirePiliersInterval = setInterval(() => {
    if (isPaused) return;
    currentIndex = (currentIndex + 1) % cards.length;
    setActiveCard(currentIndex);
  }, 3500);

  // Pause et activation immédiate au survol ou au toucher
  cards.forEach((card, index) => {
    if (card.dataset.motionBound === 'true') return;
    card.dataset.motionBound = 'true';

    card.addEventListener('mouseenter', () => {
      isPaused = true;
      currentIndex = index;
      setActiveCard(index);
    });

    card.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    card.addEventListener('touchstart', () => {
      isPaused = true;
      currentIndex = index;
      setActiveCard(index);
    }, { passive: true });
  });
}

// ==========================================
// MISE EN LOCATION INTERACTIVE FUNCTIONS
// ==========================================
function switchMiseEnLocationTab(tab) {
  const btnB2c = document.getElementById('tab-btn-b2c');
  const btnB2b = document.getElementById('tab-btn-b2b');
  const paneB2c = document.getElementById('loc-pane-b2c');
  const paneB2b = document.getElementById('loc-pane-b2b');

  if (!btnB2c || !btnB2b || !paneB2c || !paneB2b) return;

  if (tab === 'b2c') {
    btnB2c.classList.add('active');
    btnB2c.setAttribute('aria-selected', 'true');
    btnB2b.classList.remove('active');
    btnB2b.setAttribute('aria-selected', 'false');

    paneB2c.classList.add('active');
    paneB2b.classList.remove('active');
  } else {
    btnB2b.classList.add('active');
    btnB2b.setAttribute('aria-selected', 'true');
    btnB2c.classList.remove('active');
    btnB2c.setAttribute('aria-selected', 'false');

    paneB2b.classList.add('active');
    paneB2c.classList.remove('active');
  }

  const activePane = tab === 'b2c' ? paneB2c : paneB2b;
  activePane.querySelectorAll('.loc-pricing-card, .loc-b2b-card').forEach(card => {
    card.style.animation = 'none';
    void card.offsetHeight;
    card.style.animation = '';
  });

  if (typeof initScrollReveal === 'function') {
    initScrollReveal();
  }
}

function openMiseEnLocationModal(offer) {
  window.location.href = "https://app.batibid.com/register";
}

function closeMiseEnLocationModal(event) {
  if (event && event.target && event.target.id !== 'loc-depot-modal' && !event.target.closest('.loc-modal-close')) {
    return;
  }
  const modal = document.getElementById('loc-depot-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function submitMiseEnLocation(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('loc-modal-submit-btn');
  const typeBien = document.getElementById('loc-form-type')?.value || '';
  const ville = document.getElementById('loc-form-ville')?.value || '';
  const nom = document.getElementById('loc-form-nom')?.value || '';
  const tel = document.getElementById('loc-form-tel')?.value || '';
  const formule = document.getElementById('loc-form-formule')?.value || '';

  if (submitBtn) {
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enregistrement en cours...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Bien enregistré avec succès !';
      submitBtn.style.backgroundColor = '#1EBE5D';
      submitBtn.style.borderColor = '#1EBE5D';

      setTimeout(() => {
        closeMiseEnLocationModal();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.backgroundColor = '';
        submitBtn.style.borderColor = '';
        
        // Prompt WhatsApp with official number
        const confirmWhatsapp = confirm("Votre demande a bien été prise en compte ! Souhaitez-vous échanger directement avec un conseiller BatiBid sur WhatsApp (+229 01 42 48 48 48) ?");
        if (confirmWhatsapp) {
          const msg = encodeURIComponent(`Bonjour BatiBid, je viens de déposer mon bien (${typeBien} à ${ville}) sous la formule ${formule}. Mon nom est ${nom} (${tel}).`);
          window.open(`https://wa.me/2290142484848?text=${msg}`, '_blank');
        }
      }, 1000);
    }, 700);
  }
}

// ==========================================
// CONSTRUIRE & RÉNOVER INTERACTIVE HANDLERS
// ==========================================
let chantierCarouselInterval = null;

function selectChantierThumb(el, imgSrc, title, progress) {
  const parent = el.closest('.chantier-hero-col') || document.querySelector('.chantier-hero-col');
  if (!parent) return;

  // Update active thumbnail state
  parent.querySelectorAll('.chantier-thumb-item').forEach(thumb => thumb.classList.remove('active'));
  el.classList.add('active');

  // Smooth image swap with micro cross-fade
  const heroImg = parent.querySelector('.chantier-hero-img') || document.getElementById('hero-chantier-img');
  if (heroImg && imgSrc) {
    heroImg.style.opacity = '0.75';
    heroImg.style.transform = 'scale(1.02)';
    setTimeout(() => {
      heroImg.src = imgSrc;
      heroImg.style.opacity = '1';
      heroImg.style.transform = 'scale(1.0)';
    }, 140);
  }

  // Update badge title and progress if present
  const badgeTitle = parent.querySelector('.cpb-title');
  if (badgeTitle && title) {
    badgeTitle.textContent = title;
  }
  const badgeProgress = parent.querySelector('.cpb-progress-value');
  const badgeFill = parent.querySelector('.cpb-progress-fill');
  if (badgeProgress && progress) {
    badgeProgress.textContent = progress;
  }
  if (badgeFill && progress) {
    badgeFill.style.width = progress;
  }
}

function initHeroChantierCarousel() {
  if (chantierCarouselInterval) {
    clearInterval(chantierCarouselInterval);
    chantierCarouselInterval = null;
  }

  const container = document.getElementById('chantier-thumbs-carousel') || document.querySelector('.chantier-thumbs-row');
  if (!container) return;

  const thumbs = container.querySelectorAll('.chantier-thumb-item');
  if (thumbs.length <= 1) return;

  let currentIndex = 0;
  thumbs.forEach((t, idx) => {
    if (t.classList.contains('active')) currentIndex = idx;
  });

  const rotateNext = () => {
    currentIndex = (currentIndex + 1) % thumbs.length;
    const nextThumb = thumbs[currentIndex];
    const imgSrc = nextThumb.getAttribute('data-img-src') || nextThumb.querySelector('img')?.src;
    selectChantierThumb(nextThumb, imgSrc);
  };

  chantierCarouselInterval = setInterval(rotateNext, 4000);

  // Pause on hover or touch, resume on leave
  const heroCol = container.closest('.chantier-hero-col') || container;
  if (heroCol && !heroCol._hasCarouselListeners) {
    heroCol._hasCarouselListeners = true;
    heroCol.addEventListener('mouseenter', () => {
      if (chantierCarouselInterval) clearInterval(chantierCarouselInterval);
    });
    heroCol.addEventListener('mouseleave', () => {
      if (chantierCarouselInterval) clearInterval(chantierCarouselInterval);
      chantierCarouselInterval = setInterval(rotateNext, 4000);
    });
    heroCol.addEventListener('touchstart', () => {
      if (chantierCarouselInterval) clearInterval(chantierCarouselInterval);
    }, { passive: true });
  }
}

function switchDashboardTab(el, tabKey) {
  const tabsWrap = el.closest('.dmc-tabs');
  if (!tabsWrap) return;
  tabsWrap.querySelectorAll('.dmc-tab').forEach(tab => tab.classList.remove('active'));
  el.classList.add('active');
}

function switchRenovationOffer(btn, offerKey) {
  const container = btn.closest('.section-renover-offres') || document;
  const tabs = container.querySelectorAll('.renov-offer-tab');
  const panels = container.querySelectorAll('.renov-offer-panel');
  
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  panels.forEach(p => {
    if (p.id === `renov-panel-${offerKey}`) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

function toggleConstruireMetiersDetails() {
  const table = document.getElementById('construire-metiers-table-wrapper');
  const btn = document.getElementById('btn-metiers-toggle');
  if (!table || !btn) return;
  const isHidden = table.style.display === 'none' || !table.style.display;
  table.style.display = isHidden ? 'block' : 'none';
  btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  const icon = btn.querySelector('.toggle-icon i');
  if (icon) {
    icon.className = isHidden ? 'fas fa-minus' : 'fas fa-plus';
  }
}

function selectEstimationServiceTab(btn, serviceType) {
  const parent = btn.closest('.est-service-selector');
  if (parent) {
    parent.querySelectorAll('.est-service-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  }
  const typeSelect = document.getElementById('est-proj-type');
  if (typeSelect) {
    for (let i = 0; i < typeSelect.options.length; i++) {
      if (typeSelect.options[i].value.toLowerCase().includes(serviceType.toLowerCase())) {
        typeSelect.selectedIndex = i;
        break;
      }
    }
  }
}

function updateEstimationLivePreview() {
  // Safe fallback if preview element exists
  const previewBox = document.getElementById('est-live-preview');
  if (!previewBox) return;
  const surfaceInput = document.getElementById('est-proj-surface');
  const typeSelect = document.getElementById('est-proj-type');
  const valEl = document.getElementById('est-live-value');
  const surfEl = document.getElementById('est-live-surface');

  if (!surfaceInput || !valEl) return;
  const surface = parseFloat(surfaceInput.value) || 180;
  if (surfEl) surfEl.textContent = Math.round(surface);

  let pricePerM2 = 250000;
  if (typeSelect) {
    const val = typeSelect.value.toLowerCase();
    if (val.includes('immeuble')) pricePerM2 = 380000;
    else if (val.includes('rénovation')) pricePerM2 = 140000;
    else if (val.includes('extension')) pricePerM2 = 200000;
    else if (val.includes('clôture') || val.includes('aménagement')) pricePerM2 = 95000;
    else pricePerM2 = 260000;
  }

  const estMin = Math.round((surface * pricePerM2 * 0.9) / 500000) * 500000;
  const estMax = Math.round((surface * pricePerM2 * 1.15) / 500000) * 500000;
  valEl.textContent = `${estMin.toLocaleString('fr-FR')} – ${estMax.toLocaleString('fr-FR')} FCFA`;
}

function handleConstruireEstimation(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-submit-estimation');
  const fullname = document.getElementById('est-fullname')?.value || 'Client';
  const email = document.getElementById('est-email')?.value || '';
  const phone = document.getElementById('est-proj-phone')?.value || '';
  const country = document.getElementById('est-country')?.value || 'Bénin';
  const typeProj = document.getElementById('est-proj-type')?.value || 'Construction';
  const ville = document.getElementById('est-proj-city')?.value || 'Cotonou';
  const surface = document.getElementById('est-proj-surface')?.value || '';
  const levels = document.getElementById('est-proj-levels')?.value || '';
  const landStatus = document.getElementById('est-land-status')?.value || '';
  const techDocs = document.getElementById('est-tech-docs')?.value || '';
  const budget = document.getElementById('est-proj-budget')?.value || '';
  const startDate = document.getElementById('est-start-date')?.value || '';
  const message = document.getElementById('est-message')?.value || '';

  if (submitBtn) {
    const origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Transmission du dossier à l\'ingénieur...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Dossier transmis avec succès (Étude sous 24h) !';
      submitBtn.style.backgroundColor = '#2E7D32';

      setTimeout(() => {
        submitBtn.innerHTML = origHtml;
        submitBtn.disabled = false;
        submitBtn.style.backgroundColor = '';

        const goToWhatsapp = confirm("Votre demande d'estimation a été transmise à notre bureau d'études techniques avec succès !\n\nSouhaitez-vous échanger directement sur WhatsApp avec notre équipe d'ingénieurs (+229 01 42 48 48 48) pour transmettre vos plans ou accélérer votre chiffrage ?");
        if (goToWhatsapp) {
          const text = encodeURIComponent(`Bonjour BatiBid, je viens d'enregistrer mon projet (${typeProj} à ${ville}${surface ? ', ' + surface + ' m²' : ''}). Mon contact : ${fullname} (${phone}, ${email} - Résidence : ${country}).`);
          window.open(`https://wa.me/2290142484848?text=${text}`, '_blank');
        }
      }, 1200);
    }, 800);
  }
}

// ==========================================
// BATIBID MODALS EXPRESS (JURIDIQUE & HOME CALLBACK)
// ==========================================

// Modal Juridique
function proceedLegalAuditFromDiagnosis(issue) {
  const select = document.getElementById("legal-issue-select");
  let situationText = "";
  if (select && select.selectedOptions && select.selectedOptions[0]) {
    situationText = select.selectedOptions[0].text;
  }
  openJuridiqueModal(issue, situationText);
}

function openJuridiqueModal(topic, topicLabel) {
  const modal = document.getElementById("juridique-lead-modal");
  if (!modal) return;
  modal.style.display = "flex";
  void modal.offsetWidth;
  modal.classList.add("is-active");
  document.body.style.overflow = "hidden";

  const banner = document.getElementById("jur-selected-situation-banner");
  const bannerText = document.getElementById("jur-selected-situation-text");

  if (topic) {
    const select = document.getElementById("jur-topic");
    if (select) {
      select.value = topic;
      // If exact value wasn't matched, try partial matching
      if (!select.value && select.options.length > 0) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value.includes(topic) || topic.includes(select.options[i].value)) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    }

    if (banner && bannerText) {
      const selectedOptionText = topicLabel || (document.getElementById("jur-topic")?.selectedOptions[0]?.text) || topic;
      bannerText.textContent = selectedOptionText;
      banner.style.display = "inline-flex";
    }
  } else {
    if (banner) banner.style.display = "none";
  }

  // Focus on name input for immediate effortless completion
  setTimeout(() => {
    const nameInput = document.getElementById("jur-name");
    if (nameInput) nameInput.focus();
  }, 200);
}

function closeJuridiqueModal(event) {
  if (event && event.target && event.target !== event.currentTarget) return;
  const modal = document.getElementById("juridique-lead-modal");
  if (!modal) return;
  modal.classList.remove("is-active");
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
}

function submitJuridiqueLead(event) {
  event.preventDefault();
  const name = document.getElementById("jur-name")?.value || "";
  const phone = document.getElementById("jur-phone")?.value || "";
  const city = document.getElementById("jur-city")?.value || "";
  const topic = document.getElementById("jur-topic")?.value || "";
  
  const form = document.getElementById("juridique-lead-form");
  const success = document.getElementById("juridique-modal-success");
  if (form) form.style.display = "none";
  if (success) success.style.display = "block";

  setTimeout(() => {
    const goToWhatsapp = confirm("Votre demande d'audit juridique a bien été transmise !\n\nSouhaitez-vous échanger directement avec un juriste BatiBid sur WhatsApp (+229 01 42 48 48 48) ?");
    if (goToWhatsapp) {
      const text = encodeURIComponent(`Bonjour BatiBid, j'ai soumis une demande d'audit juridique (${topic}) à ${city}. Nom : ${name}, Tel : ${phone}.`);
      window.open(`https://wa.me/2290142484848?text=${text}`, '_blank');
    }
  }, 1000);
}

// Modal Home Callback
function openHomeCallbackModal(service) {
  const modal = document.getElementById("home-callback-modal");
  if (!modal) return;
  modal.style.display = "flex";
  void modal.offsetWidth;
  modal.classList.add("is-active");
  document.body.style.overflow = "hidden";
  if (service) {
    const select = document.getElementById("hcb-service");
    if (select) select.value = service;
  }
}

function closeHomeCallbackModal(event) {
  if (event && event.target && event.target !== event.currentTarget) return;
  const modal = document.getElementById("home-callback-modal");
  if (!modal) return;
  modal.classList.remove("is-active");
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
}

function submitHomeCallback(event) {
  event.preventDefault();
  const name = document.getElementById("hcb-name")?.value || "";
  const phone = document.getElementById("hcb-phone")?.value || "";
  const service = document.getElementById("hcb-service")?.value || "";

  const form = document.getElementById("home-callback-form");
  const success = document.getElementById("home-callback-success");
  if (form) form.style.display = "none";
  if (success) success.style.display = "block";

  setTimeout(() => {
    const goToWhatsapp = confirm("Votre demande de rappel a bien été enregistrée !\n\nSouhaitez-vous échanger dès maintenant avec un conseiller sur WhatsApp (+229 01 42 48 48 48) ?");
    if (goToWhatsapp) {
      const text = encodeURIComponent(`Bonjour BatiBid, je souhaite être rappelé concernant le service "${service}". Nom : ${name}, Tel : ${phone}.`);
      window.open(`https://wa.me/2290142484848?text=${text}`, '_blank');
    }
  }, 1000);
}

// ==========================================
// MISE EN LOCATION : ACCORDION PROCESS
// ==========================================
function toggleLocProcessStep(index) {
  const container = document.getElementById("loc-process-accordion");
  if (!container) return;
  const items = container.querySelectorAll(".loc-accordion-item");
  items.forEach((item, idx) => {
    if (idx === index) {
      const isActive = item.classList.contains("active");
      if (isActive) {
        item.classList.remove("active");
        item.querySelector(".loc-accordion-header")?.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        item.querySelector(".loc-accordion-header")?.setAttribute("aria-expanded", "true");
      }
    } else {
      item.classList.remove("active");
      item.querySelector(".loc-accordion-header")?.setAttribute("aria-expanded", "false");
    }
  });
}

// ==========================================
// CONSTRUIRE & RÉNOVER : ESTIMATION FORM ACCORDION/TOGGLE
// ==========================================
function toggleConstruireEstimationForm() {
  const formWrap = document.getElementById("estimation-form-collapsible");
  const toggleBtn = document.getElementById("btn-toggle-estimation-form");
  if (!formWrap) return;
  const isExpanded = formWrap.classList.contains("open") || formWrap.classList.contains("is-open");
  if (isExpanded) {
    formWrap.classList.remove("open");
    formWrap.classList.remove("is-open");
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-calculator"></i> <span>Estimer mon projet en ligne</span> <i class="fas fa-chevron-down"></i>';
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  } else {
    formWrap.classList.add("open");
    formWrap.classList.add("is-open");
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> <span>Masquer le formulaire</span>';
      toggleBtn.setAttribute("aria-expanded", "true");
    }
    setTimeout(() => {
      formWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
  }
}

function handleConstruireEstimation(event) {
  event.preventDefault();
  const fullname = document.getElementById("est-fullname")?.value || "";
  const phone = document.getElementById("est-proj-phone")?.value || "";
  const type = document.getElementById("est-proj-type")?.value || "";
  const city = document.getElementById("est-proj-city")?.value || "";

  const submitBtn = document.getElementById("btn-submit-estimation");
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Demande transmise avec succès !</span>';
    submitBtn.style.background = '#2E7D32';
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    const goToWhatsapp = confirm("Votre demande d'estimation indicative a bien été transmise à notre équipe technique !\n\nSouhaitez-vous échanger directement avec un ingénieur BatiBid sur WhatsApp (+229 01 42 48 48 48) pour préciser votre projet ?");
    if (goToWhatsapp) {
      const text = encodeURIComponent(`Bonjour BatiBid, j'ai soumis une demande d'estimation de projet (${type}) à ${city}. Nom : ${fullname}, Tel : ${phone}.`);
      window.open(`https://wa.me/2290142484848?text=${text}`, '_blank');
    }
  }, 800);
}

// Initialize on execution after pages are loaded
document.addEventListener("DOMContentLoaded", async () => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    try {
      state.currentUser = JSON.parse(storedUser);
    } catch {
      state.currentUser = null;
    }
  }
  await loadAllPages();
  initRouter();
  updateHeaderAuth();
  initHeaderSearch();
  
  // Navbar transparency & scrolled glassmorphism
  const headerEl = document.querySelector(".header");
  const onHeaderScroll = () => {
    if (headerEl) {
      headerEl.classList.toggle("scrolled", window.scrollY > 20);
    }
  };
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();
});

// ==========================================
// CORPORATE HOUSING INTERACTIVE FUNCTIONS
// ==========================================
function switchCorporateTab(tab) {
  const btnEssential = document.getElementById('ch-tab-btn-essential');
  const btnPremium = document.getElementById('ch-tab-btn-premium');
  const btnPass = document.getElementById('ch-tab-btn-pass');
  const paneEssential = document.getElementById('ch-pane-essential');
  const panePremium = document.getElementById('ch-pane-premium');
  const panePass = document.getElementById('ch-pane-pass');

  const allBtns = [btnEssential, btnPremium, btnPass].filter(Boolean);
  const allPanes = [paneEssential, panePremium, panePass].filter(Boolean);

  allBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  allPanes.forEach(pane => {
    pane.classList.remove('active');
  });

  let activeBtn = btnEssential;
  let activePane = paneEssential;

  if (tab === 'premium') {
    activeBtn = btnPremium;
    activePane = panePremium;
  } else if (tab === 'pass') {
    activeBtn = btnPass;
    activePane = panePass;
  } else {
    activeBtn = btnEssential;
    activePane = paneEssential;
  }

  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
  }

  if (activePane) {
    activePane.classList.add('active');
    activePane.querySelectorAll('.ch-pricing-card, .ch-factor-item').forEach(card => {
      card.style.animation = 'none';
      void card.offsetHeight;
      card.style.animation = '';
    });
  }

  if (typeof initScrollAnimations === 'function') {
    initScrollAnimations();
  }
}

function toggleCorporatePricingDetails() {
  const table = document.getElementById('ch-pricing-details-table');
  const btn = document.getElementById('btn-ch-pricing-details-toggle');
  if (!table || !btn) return;
  const isHidden = table.style.display === 'none' || !table.style.display;
  table.style.display = isHidden ? 'block' : 'none';
  btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  const icon = btn.querySelector('.toggle-icon i');
  if (icon) {
    icon.className = isHidden ? 'fas fa-minus' : 'fas fa-plus';
  }
}

function openCorporateModal(formula) {
  const modal = document.getElementById('modal-corporate-proposition');
  if (!modal) return;
  const formulaSelect = document.getElementById('ch-formula-select');
  if (formulaSelect && formula) {
    if (formula === 'Essential') {
      formulaSelect.value = 'essential';
    } else if (formula === 'Premium') {
      formulaSelect.value = 'premium';
    } else if (formula === 'Pass' || formula === 'Employee Pass') {
      formulaSelect.value = 'pass';
    } else {
      formulaSelect.value = 'sur-mesure';
    }
  }
  const formEl = document.getElementById('ch-proposition-form');
  const successEl = document.getElementById('ch-modal-success');
  if (formEl) formEl.style.display = 'block';
  if (successEl) successEl.style.display = 'none';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCorporateModal() {
  const modal = document.getElementById('modal-corporate-proposition');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleCorporateSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const formEl = document.getElementById('ch-proposition-form');
  const successEl = document.getElementById('ch-modal-success');
  if (formEl && successEl) {
    formEl.style.display = 'none';
    successEl.style.display = 'block';
  }
  return false;
}

function openLegalModal(type) {
  let modal = document.getElementById('legal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'legal-modal';
    modal.className = 'legal-modal-backdrop';
    modal.onclick = function(e) { if(e.target === this) closeLegalModal(); };
    modal.innerHTML = `
      <div class="legal-modal-dialog">
        <div class="legal-modal-header">
          <h3 class="legal-modal-title" id="legal-modal-title">Informations Légales</h3>
          <button type="button" class="legal-modal-close" onclick="closeLegalModal()" aria-label="Fermer"><i class="fas fa-times"></i></button>
        </div>
        <div class="legal-modal-body" id="legal-modal-body"></div>
        <div class="legal-modal-footer">
          <button type="button" class="btn btn-primary" onclick="closeLegalModal()">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const titleEl = document.getElementById('legal-modal-title');
  const bodyEl = document.getElementById('legal-modal-body');

  if (type === 'mentions') {
    titleEl.textContent = 'Mentions Légales';
    bodyEl.innerHTML = `
      <h4>1. Éditeur de la plateforme</h4>
      <p>La plateforme <strong>BatiBid</strong> (batibid.com) est éditée par la société <strong>BatiBid Technologies SAS</strong>, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Cotonou sous le numéro RB/COT/24 B 12894 — IFU : 0202416892301.</p>
      <p><strong>Siège social :</strong> Zone Commerciale Akpakpa, Lot 402, Cotonou, République du Bénin.<br>
      <strong>Téléphone :</strong> +229 01 42 48 48 48<br>
      <strong>Email de contact :</strong> contact@batibid.com</p>
      <h4>2. Direction de la publication</h4>
      <p>La direction de la publication est assurée par la Direction Générale de BatiBid Technologies SAS.</p>
      <h4>3. Hébergement</h4>
      <p>L'hébergement des services web et données est assuré par des infrastructures sécurisées conformes aux normes ISO 27001 et aux règles de protection des données.</p>
      <h4>4. Propriété intellectuelle</h4>
      <p>L'ensemble des marques, logos, visuels, algorithmes et textes présents sur la plateforme sont la propriété exclusive de BatiBid Technologies SAS.</p>
    `;
  } else if (type === 'confidentialite') {
    titleEl.textContent = 'Politique de Confidentialité';
    bodyEl.innerHTML = `
      <h4>1. Protection des données personnelles</h4>
      <p>BatiBid s'engage à garantir la confidentialité des données personnelles de ses utilisateurs conformément au Code du Numérique en République du Bénin et aux directives de l'APDP.</p>
      <h4>2. Données collectées</h4>
      <p>Nous collectons les données strictement indispensables à l'exécution de nos missions : identité, coordonnées téléphoniques/WhatsApp, informations relatives aux biens ou aux critères de recherche de location ou de devis de travaux.</p>
      <h4>3. Finalités de traitement</h4>
      <p>Les données sont destinées à la gestion des dossiers locatifs, à la sécurisation des contrats, au suivi technique des chantiers et à la relation directe avec nos conseillers dédiés. Vos données ne sont jamais cédées ou vendues à des tiers.</p>
      <h4>4. Vos droits</h4>
      <p>Conformément à la loi, vous pouvez exercer votre droit d'accès, de rectification et d'effacement de vos données sur simple demande par email à <strong>contact@batibid.com</strong>.</p>
    `;
  } else {
    titleEl.textContent = "Conditions Générales d'Utilisation (CGU)";
    bodyEl.innerHTML = `
      <h4>1. Objet des conditions</h4>
      <p>Les présentes CGU encadrent l'accès et l'utilisation des solutions BatiBid pour propriétaires bailleurs, acquéreurs, locataires et partenaires professionnels.</p>
      <h4>2. Services proposés</h4>
      <p>BatiBid met à disposition des services de gestion locative et digitalisation des loyers, de mise en location avec vérification des locataires, de suivi de travaux sur devis et d'audit documentaire foncier et juridique.</p>
      <h4>3. Responsabilité & Authenticité</h4>
      <p>Tout utilisateur s'engage à transmettre des pièces et déclarations exactes. BatiBid procède à des audits de conformité documentaire préalablement à tout engagement contractuel.</p>
      <h4>4. Mandats & Conventions</h4>
      <p>Chaque formule souscrite donne lieu à une convention de prestation ou un mandat écrit fixant de manière transparente les obligations réciproques et les honoraires convenus.</p>
    `;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLegalModal() {
  const modal = document.getElementById('legal-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

window.openLegalModal = openLegalModal;
window.closeLegalModal = closeLegalModal;


// Unregister all active Service Workers to avoid cache-poisoning/stale content bugs
if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

// Clear all browser caches for BatiBid
if ("caches" in window && window.location.protocol !== "file:") {
  caches.keys().then((keys) => {
    return Promise.all(keys.map((key) => caches.delete(key)));
  }).catch(() => {});
}

