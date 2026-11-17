(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.8
      }
    });
  }

  const header = document.querySelector(".site-header");
  const progressBar = document.querySelector(".scroll-progress span");
  const nav = document.querySelector("#site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = [...document.querySelectorAll(".site-nav a")];

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;

    if (progressBar) {
      progressBar.style.width = `${percent * 100}%`;
    }

    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 24);
    }
  };

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });

  const closeMenu = () => {
    if (!nav || !menuButton) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "打开导航菜单");
    menuButton.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
    if (window.lucide) window.lucide.createIcons();
  };

  if (nav && menuButton) {
    menuButton.addEventListener("click", () => {
      const willOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
      menuButton.setAttribute("aria-expanded", String(willOpen));
      menuButton.setAttribute("aria-label", willOpen ? "关闭导航菜单" : "打开导航菜单");
      menuButton.innerHTML = `<i data-lucide="${willOpen ? "x" : "menu"}" aria-hidden="true"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const revealItems = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -7% 0px"
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const sections = [...document.querySelectorAll("main section[id]")];
  if (sections.length) {
    const updateActiveSection = () => {
      const probe = window.scrollY + (header?.offsetHeight || 0) + window.innerHeight * 0.28;
      let currentSection = null;

      sections.forEach((section) => {
        if (section.offsetTop <= probe) currentSection = section;
      });

      navLinks.forEach((link) => link.removeAttribute("aria-current"));
      if (!currentSection) return;

      const currentLink = navLinks.find((link) => link.getAttribute("href") === `#${currentSection.id}`);
      if (currentLink) currentLink.setAttribute("aria-current", "page");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });
  }

  const counters = [...document.querySelectorAll("[data-count]")];
  const animateCounter = (counter) => {
    const finalValue = Number.parseInt(counter.dataset.count, 10);
    if (Number.isNaN(finalValue)) return;

    if (reducedMotion.matches) {
      counter.textContent = String(finalValue);
      return;
    }

    const duration = 1100;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(finalValue * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.8 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const cursorFollower = document.querySelector(".cursor-follower");
  if (cursorFollower && finePointer.matches && !reducedMotion.matches) {
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let cursorFrame = 0;

    const drawCursor = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      cursorFollower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        cursorFrame = requestAnimationFrame(drawCursor);
      } else {
        cursorFrame = 0;
      }
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        cursorFollower.style.opacity = "1";
        if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursor);
      },
      { passive: true }
    );

    document.addEventListener("mouseover", (event) => {
      const interactive = event.target.closest("a, button, summary");
      cursorFollower.classList.toggle("is-active", Boolean(interactive));
    });

    document.addEventListener("mouseleave", () => {
      cursorFollower.style.opacity = "0";
    });
  }

  const portraitFrame = document.querySelector(".portrait-frame");
  const hero = document.querySelector(".hero");
  if (portraitFrame && hero && finePointer.matches && !reducedMotion.matches) {
    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        portraitFrame.style.setProperty("--portrait-x", `${x * 10}px`);
        portraitFrame.style.setProperty("--portrait-y", `${y * 8}px`);
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", () => {
      portraitFrame.style.setProperty("--portrait-x", "0px");
      portraitFrame.style.setProperty("--portrait-y", "0px");
    });
  }

  const tiltCards = [...document.querySelectorAll("[data-tilt]")];
  if (finePointer.matches && !reducedMotion.matches) {
    tiltCards.forEach((card) => {
      const visual = card.querySelector(".project-visual");
      if (!visual) return;

      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          visual.style.setProperty("--tilt-x", `${-y * 3.5}deg`);
          visual.style.setProperty("--tilt-y", `${x * 3.5}deg`);
        },
        { passive: true }
      );

      card.addEventListener("pointerleave", () => {
        visual.style.setProperty("--tilt-x", "0deg");
        visual.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  const copyButton = document.querySelector(".copy-email");
  const toast = document.querySelector(".toast");
  const toastMessage = toast?.querySelector("span");
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) throw new Error("Copy failed");
  };

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const email = copyButton.dataset.email;
      if (!email) return;

      try {
        await copyText(email);
        showToast("邮箱地址已复制");
      } catch {
        showToast("复制失败，请手动选择邮箱");
      }
    });
  }

  const canvas = document.querySelector("#hero-grid");
  if (canvas) {
    const context = canvas.getContext("2d");
    const heroElement = canvas.closest(".hero");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots = [];
    let pointer = { x: -999, y: -999, targetX: -999, targetY: -999 };
    let gridFrame = 0;

    const makeDots = () => {
      dots = [];
      const spacing = width < 700 ? 34 : 44;
      const startX = (width % spacing) / 2;
      const startY = (height % spacing) / 2;

      for (let x = startX; x <= width; x += spacing) {
        for (let y = startY; y <= height; y += spacing) {
          dots.push({ x, y });
        }
      }
    };

    const drawGrid = () => {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      const influence = width < 700 ? 105 : 150;
      for (const dot of dots) {
        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const force = Math.max(0, 1 - distance / influence);
        const offset = Math.pow(force, 2) * (width < 700 ? 10 : 18);
        const offsetX = distance > 0 ? (dx / distance) * offset : 0;
        const offsetY = distance > 0 ? (dy / distance) * offset : 0;
        const x = dot.x + offsetX;
        const y = dot.y + offsetY;

        if (force > 0.1) {
          context.beginPath();
          context.moveTo(dot.x, dot.y);
          context.lineTo(x, y);
          context.strokeStyle = `rgba(0, 47, 167, ${0.08 + force * 0.2})`;
          context.lineWidth = 1;
          context.stroke();
        }

        context.beginPath();
        context.arc(x, y, force > 0.18 ? 1.4 : 0.9, 0, Math.PI * 2);
        context.fillStyle = force > 0.18 ? "rgba(0, 47, 167, 0.62)" : "rgba(0, 47, 167, 0.2)";
        context.fill();
      }

      if (pointer.x > -100) {
        context.strokeStyle = "rgba(0, 47, 167, 0.36)";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(pointer.x - 22, pointer.y);
        context.lineTo(pointer.x + 22, pointer.y);
        context.moveTo(pointer.x, pointer.y - 22);
        context.lineTo(pointer.x, pointer.y + 22);
        context.stroke();
      }
    };

    const animateGrid = () => {
      pointer.x += (pointer.targetX - pointer.x) * 0.16;
      pointer.y += (pointer.targetY - pointer.y) * 0.16;
      drawGrid();

      const settled =
        Math.abs(pointer.targetX - pointer.x) < 0.15 &&
        Math.abs(pointer.targetY - pointer.y) < 0.15;

      if (settled && pointer.targetX < -100) {
        pointer.x = -999;
        pointer.y = -999;
        drawGrid();
        gridFrame = 0;
        return;
      }

      gridFrame = requestAnimationFrame(animateGrid);
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeDots();
      drawGrid();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    if (finePointer.matches && !reducedMotion.matches) {
      heroElement?.addEventListener(
        "pointermove",
        (event) => {
          const rect = canvas.getBoundingClientRect();
          pointer.targetX = event.clientX - rect.left;
          pointer.targetY = event.clientY - rect.top;
          if (!gridFrame) {
            pointer.x = pointer.targetX;
            pointer.y = pointer.targetY;
            gridFrame = requestAnimationFrame(animateGrid);
          }
        },
        { passive: true }
      );

      heroElement?.addEventListener("pointerleave", () => {
        pointer.targetX = -999;
        pointer.targetY = -999;
        if (!gridFrame) gridFrame = requestAnimationFrame(animateGrid);
      });
    }
  }
})();
