document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // Initialize EmailJS first (important!)
    emailjs.init('9v2S0tJnvRBwlG7mo');

    initLenisSmoothScroll();
    initCustomCursor();
    initThemeControl();
    initHeroAnimations();
    initScrollRevealAnimations();
    initProjectFilters();
    initProjectCardTilt();
    initEmailJS();
    initMobileNavigation();
});

/* ==========================================================================
   1. LENIS SMOOTH SCROLL INTEGRATION
   ========================================================================== */
function initLenisSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

/* ==========================================================================
   2. CUSTOM CURSOR INTERACTION TRAILING
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.querySelector(".custom-cursor");
    const dot = document.querySelector(".custom-cursor-dot");
    if (!cursor) return;

    window.addEventListener("mousemove", (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.35, ease: "power2.out" });
        gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08 });
    });

    document.querySelectorAll("a, button, .project-card, .filter-btn").forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
    });
}

/* ==========================================================================
   3. THEME SELECTION MATRIX
   ========================================================================== */
function initThemeControl() {
    const themeToggle = document.querySelector(".theme-toggle");
    const rootEl = document.documentElement;
    const storedTheme = localStorage.getItem("theme") || "dark";
    
    rootEl.setAttribute("data-theme", storedTheme);

    themeToggle.addEventListener("click", () => {
        const nextTheme = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
        
        gsap.to("body", {
            opacity: 0.9, duration: 0.12, yoyo: true, repeat: 1,
            onRepeat: () => {
                rootEl.setAttribute("data-theme", nextTheme);
                localStorage.setItem("theme", nextTheme);
            }
        });
    });
}

/* ==========================================================================
   4. SYSTEM SEQUENTIAL ENTRANCE TIMELINE
   ========================================================================== */
function initHeroAnimations() {
    const tl = gsap.timeline();
    gsap.set(".reveal-text", { overflow: "hidden", display: "block" });

    tl.from(".navbar", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".hero-title .reveal-text", { y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: "power4.out" }, "-=0.4")
      .from(".hero-subtitle, .hero-ctas", { y: 25, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, "-=0.6")
      .from(".scroll-indicator", { opacity: 0, duration: 0.5 }, "-=0.2");
}

/* ==========================================================================
   5. COMPONENT SCROLL-DRIVEN REVEALS
   ========================================================================== */
function initScrollRevealAnimations() {
    document.querySelectorAll(".scroll-reveal").forEach((section) => {
        const header = section.querySelector(".section-header");
        const internalBody = section.querySelector(".container > *:not(.section-header)");

        const tl = gsap.timeline({
            scrollTrigger: { trigger: section, start: "top 82%", toggleActions: "play none none none" }
        });

        if (header) tl.from(header, { opacity: 0, y: 35, duration: 0.6, ease: "power2.out" });
        if (internalBody) tl.from(internalBody, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" }, "-=0.3");
    });
}

/* ==========================================================================
   6. ECOSYSTEM PROJECT PACK FILTER MATRIX
   ========================================================================== */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const targetedFilter = btn.getAttribute("data-filter");

            gsap.to(cards, {
                scale: 0.9, opacity: 0, duration: 0.25, stagger: 0.03, ease: "power2.in",
                onComplete: () => {
                    cards.forEach((card) => {
                        const cat = card.getAttribute("data-category");
                        if (targetedFilter === "all" || cat === targetedFilter) {
                            card.style.display = "block";
                            gsap.to(card, { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" });
                        } else {
                            card.style.display = "none";
                        }
                    });
                    ScrollTrigger.refresh();
                }
            });
        });
    });
}

/* ==========================================================================
   7. 3D STRUCTURAL CARD PARALLAX TILT
   ========================================================================== */
function initProjectCardTilt() {
    if (window.innerWidth > 992) {
        document.querySelectorAll(".project-card").forEach((card) => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotX = ((y - (rect.height / 2)) / (rect.height / 2)) * -8;
                const rotY = (((rect.width / 2) - x) / (rect.width / 2)) * -8;

                gsap.to(card, { rotateX: rotX, rotateY: rotY, scale: 1.015, duration: 0.3, ease: "power2.out" });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.4, ease: "power2.out" });
            });
        });
    }
}

/* ==========================================================================
   8. EMAILJS FORM HANDLER (Validation + Submission)
   ========================================================================== */
function initEmailJS() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        let isValid = true;

        // Validation
        form.querySelectorAll("input, textarea").forEach((field) => {
            const parent = field.parentElement;
            if (!field.value.trim() || 
                (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value))) {
                parent.classList.add("error");
                isValid = false;
            } else {
                parent.classList.remove("error");
            }
        });

        if (!isValid) return;

        // Show loading state
        form.classList.add("submitting");

        // Send via EmailJS
        emailjs.sendForm('service_bqqz3cl', 'template_nyn3l78', this)
            .then(function() {
                form.classList.remove("submitting");
                alert('Message sent successfully! Thank you.');
                form.reset();
            }, function(error) {
                form.classList.remove("submitting");
                console.error("EmailJS Error:", error);
                alert('Failed to send message. Please try again or contact me directly via email.');
            });
    });
}

/* ==========================================================================
   9. MOBILE BREAKPOINT MENUS
   ========================================================================== */
function initMobileNavigation() {
    const btn = document.querySelector(".mobile-menu-btn");
    const linksMenu = document.querySelector(".nav-links");

    if (!btn || !linksMenu) return;

    btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        linksMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", () => {
            btn.classList.remove("active");
            linksMenu.classList.remove("active");
        });
    });
}