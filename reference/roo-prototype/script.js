/* ============================================================
   GET-WELL-SOON GALAXY — Script
   ============================================================ */

(function () {
  "use strict";

  // ─── DOM refs ────────────────────────────────────────────
  const starfield = document.getElementById("starfield");
  const cursorGlow = document.querySelector(".cursor-glow");
  const nebula1 = document.querySelector(".nebula--1");
  const nebula2 = document.querySelector(".nebula--2");
  const nebula3 = document.querySelector(".nebula--3");
  const droidR2 = document.getElementById("droidR2");
  const droidC3PO = document.getElementById("droidC3PO");
  const r2Speech = document.getElementById("r2Speech");
  const c3poSpeech = document.getElementById("c3poSpeech");
  const heartsGrid = document.getElementById("heartsGrid");
  const btnExtraLove = document.getElementById("btnExtraLove");
  const extraLoveMessage = document.getElementById("extraLoveMessage");
  const finalSurprise = document.getElementById("finalSurprise");
  const finalSurpriseText = document.getElementById("finalSurpriseText");
  const recipientLine = document.getElementById("recipientLine");
  const senderNameEl = document.getElementById("senderName");

  // ─── Reduced motion check ────────────────────────────────
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ─── Inject config ───────────────────────────────────────
  recipientLine.textContent = `For ${CONFIG.recipientName}`;
  senderNameEl.textContent = CONFIG.senderName;
  finalSurpriseText.textContent = CONFIG.finalMessage;

  // ─── State ───────────────────────────────────────────────
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;
  let openedHeartCount = 0;
  const totalHearts = CONFIG.notes.length;
  let extraLoveIndex = 0;
  let speechTimeout = null;

  // ─── Starfield Canvas ────────────────────────────────────
  const ctx = starfield.getContext("2d");
  let stars = [];
  const STAR_COUNT = 200;

  function resizeCanvas() {
    starfield.width = window.innerWidth;
    starfield.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * starfield.width,
        y: Math.random() * starfield.height,
        r: Math.random() * 2 + 0.5,
        depth: Math.random() * 0.8 + 0.2, // 0.2–1.0 (near–far)
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.15 ? 40 + Math.random() * 20 : 220 + Math.random() * 40, // occasional gold
      });
    }
  }

  function drawStars(timestamp) {
    if (!ctx) return;
    ctx.clearRect(0, 0, starfield.width, starfield.height);

    // Parallax offset based on mouse
    const px = (targetMouseX / window.innerWidth - 0.5) * 30;
    const py = (targetMouseY / window.innerHeight - 0.5) * 30;

    for (const s of stars) {
      const parallaxX = px * s.depth;
      const parallaxY = py * s.depth;
      const sx = s.x + parallaxX;
      const sy = s.y + parallaxY;

      // Wrap around
      const wx = ((sx % starfield.width) + starfield.width) % starfield.width;
      const wy = ((sy % starfield.height) + starfield.height) % starfield.height;

      // Twinkle
      const twinkle =
        0.5 +
        0.5 * Math.sin(timestamp * s.twinkleSpeed + s.twinkleOffset);
      const alpha = 0.3 + twinkle * 0.7;

      ctx.beginPath();
      ctx.arc(wx, wy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 60%, 80%, ${alpha})`;
      ctx.fill();

      // Glow for brighter stars
      if (s.r > 1.3 && twinkle > 0.7) {
        ctx.beginPath();
        ctx.arc(wx, wy, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 60%, 85%, ${alpha * 0.15})`;
        ctx.fill();
      }
    }
  }

  // ─── Cursor Glow ─────────────────────────────────────────
  function updateCursorGlow() {
    if (prefersReducedMotion) {
      cursorGlow.style.opacity = "0";
      return;
    }
    cursorGlow.style.left = targetMouseX + "px";
    cursorGlow.style.top = targetMouseY + "px";
    cursorGlow.style.opacity = "1";
  }

  // ─── Nebula Parallax ─────────────────────────────────────
  function updateNebula() {
    if (prefersReducedMotion) return;
    const px = (targetMouseX / window.innerWidth - 0.5) * 20;
    const py = (targetMouseY / window.innerHeight - 0.5) * 20;
    if (nebula1) {
      nebula1.style.transform = `translate(${px * 0.6}px, ${py * 0.6}px)`;
    }
    if (nebula2) {
      nebula2.style.transform = `translate(${px * 0.4}px, ${py * 0.4}px)`;
    }
    if (nebula3) {
      nebula3.style.transform = `translate(${px * 0.3}px, ${py * 0.3}px)`;
    }
  }

  // ─── Animation Loop ──────────────────────────────────────
  function animate(timestamp) {
    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    drawStars(timestamp);
    updateCursorGlow();
    updateNebula();
    requestAnimationFrame(animate);
  }

  // ─── Mouse / Touch tracking ──────────────────────────────
  function onMouseMove(e) {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = e.touches[0].clientY;
    }
  }

  // ─── Droid Interactions ──────────────────────────────────
  const r2Phrases = [
    "beep boop beep! ♡",
    "bwoooop!",
    "beep beep whirrr!",
    "boop boop beep! ♡",
    "whee-ooo!",
  ];

  const c3poPhrases = [
    "Oh my! How delightful!",
    "Do take care of yourself!",
    "Oh, hello there!",
    "We're so glad you're here!",
    "Rest is most important!",
  ];

  function showSpeech(droidEl, speechEl, phrases) {
    if (speechTimeout) clearTimeout(speechTimeout);
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    speechEl.textContent = phrase;
    speechEl.classList.add("droid__speech--visible");
    speechTimeout = setTimeout(() => {
      speechEl.classList.remove("droid__speech--visible");
    }, 2500);
  }

  function triggerDroidReaction(droidEl, speechEl, phrases) {
    // Remove and re-add wiggle class to restart animation
    droidEl.classList.remove("droid--wiggle");
    void droidEl.offsetWidth; // force reflow
    droidEl.classList.add("droid--wiggle");
    showSpeech(droidEl, speechEl, phrases);

    // Remove wiggle after animation
    setTimeout(() => {
      droidEl.classList.remove("droid--wiggle");
    }, 700);
  }

  droidR2.addEventListener("click", () => {
    triggerDroidReaction(droidR2, r2Speech, r2Phrases);
  });

  droidC3PO.addEventListener("click", () => {
    triggerDroidReaction(droidC3PO, c3poSpeech, c3poPhrases);
  });

  // Keyboard activation
  droidR2.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerDroidReaction(droidR2, r2Speech, r2Phrases);
    }
  });

  droidC3PO.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerDroidReaction(droidC3PO, c3poSpeech, c3poPhrases);
    }
  });

  // ─── Heart Cards ─────────────────────────────────────────
  function createHeartSVG() {
    // Small folded heart SVG for the front of each card
    return `
      <svg viewBox="0 0 60 55" class="heart-card__heart-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M30 52
                 C10 38 0 28 0 18
                 C0 8 8 2 16 2
                 C22 2 27 6 30 12
                 C33 6 38 2 44 2
                 C52 2 60 8 60 18
                 C60 28 50 38 30 52Z"
              fill="#e87888" stroke="#c05060" stroke-width="1.5"/>
        <!-- Fold line -->
        <line x1="30" y1="8" x2="30" y2="50" stroke="rgba(180,100,120,0.3)" stroke-width="1" stroke-dasharray="3,3"/>
        <!-- Subtle highlight -->
        <path d="M18 14 C22 10 26 10 30 14" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
  }

  function createHeartCard(note, index) {
    const card = document.createElement("div");
    card.className = "heart-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open heart note ${index + 1}`);
    card.setAttribute("aria-expanded", "false");

    card.innerHTML = `
      <div class="heart-card__inner">
        <div class="heart-card__front">
          ${createHeartSVG()}
          <div class="heart-card__crease"></div>
        </div>
        <div class="heart-card__back">
          <p class="heart-card__note">${escapeHTML(note)}</p>
        </div>
      </div>
    `;

    function openHeart() {
      if (card.classList.contains("heart-card--opened")) return;
      card.classList.add("heart-card--opened");
      card.setAttribute("aria-expanded", "true");
      card.setAttribute("aria-label", `Heart note ${index + 1}: ${note}`);
      openedHeartCount++;

      // Check if all hearts opened
      if (openedHeartCount >= totalHearts) {
        revealFinalSurprise();
      }
    }

    card.addEventListener("click", openHeart);

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openHeart();
      }
    });

    return card;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function buildHearts() {
    heartsGrid.innerHTML = "";
    CONFIG.notes.forEach((note, i) => {
      const card = createHeartCard(note, i);
      heartsGrid.appendChild(card);
    });
  }

  // ─── Extra Love Button ───────────────────────────────────
  function spawnStarBurst(container) {
    const count = 12;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "btn-extra-love__star-particle";
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 30 + Math.random() * 40;
      particle.style.setProperty("--tx", Math.cos(angle) * distance + "px");
      particle.style.setProperty("--ty", Math.sin(angle) * distance + "px");
      particle.style.left = "50%";
      particle.style.top = "50%";
      particle.style.animationDelay = Math.random() * 0.15 + "s";
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);

    // Clean up particles after animation
    setTimeout(() => {
      container.innerHTML = "";
    }, 1000);
  }

  btnExtraLove.addEventListener("click", () => {
    // Spawn stars
    const starsContainer = btnExtraLove.querySelector(".btn-extra-love__stars");
    spawnStarBurst(starsContainer);

    // Show message
    const msg = CONFIG.extraLoveMessages[extraLoveIndex % CONFIG.extraLoveMessages.length];
    extraLoveIndex++;
    extraLoveMessage.textContent = msg;
    extraLoveMessage.classList.remove("extra-love-message--visible");
    void extraLoveMessage.offsetWidth;
    extraLoveMessage.classList.add("extra-love-message--visible");
  });

  // ─── Final Surprise ──────────────────────────────────────
  function revealFinalSurprise() {
    finalSurprise.classList.add("final-surprise--revealed");

    // Spawn floating stars
    const starsContainer = finalSurprise.querySelector(".final-surprise__stars");
    starsContainer.innerHTML = "";
    const count = 20;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "final-star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 2 + "s";
      star.style.animationDuration = 2 + Math.random() * 3 + "s";
      star.style.width = 3 + Math.random() * 6 + "px";
      star.style.height = star.style.width;
      starsContainer.appendChild(star);
    }

    // Scroll to surprise
    finalSurprise.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ─── Init ────────────────────────────────────────────────
  function init() {
    resizeCanvas();
    createStars();
    buildHearts();
    requestAnimationFrame(animate);
  }

  // ─── Event Listeners ─────────────────────────────────────
  window.addEventListener("resize", () => {
    resizeCanvas();
    createStars();
  });

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });

  // Hide cursor glow when mouse leaves
  window.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });

  window.addEventListener("mouseenter", () => {
    if (!prefersReducedMotion) {
      cursorGlow.style.opacity = "1";
    }
  });

  // ─── Start ───────────────────────────────────────────────
  init();
})();