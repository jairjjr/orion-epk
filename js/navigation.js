/**
 * ORION EPK — Navigation Module
 * Scroll suave, navbar sticky con blur, y menú hamburguesa mobile.
 */

(function () {
    'use strict';

    const navbar    = document.getElementById('navbar');
    const navLinks  = document.getElementById('nav-links');
    const links     = navLinks ? navLinks.querySelectorAll('a') : [];

    /* ── Navbar scroll effect ─────────────────────────── */
    const SCROLL_THRESHOLD = 60;

    function handleScroll() {
        if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Estado inicial

    /* ── Menú Hamburguesa Móvil (Accesible & Native Feel) ── */
    const hamburger = document.getElementById('nav-hamburger');

    function toggleMenu(forceClose) {
        if (!navLinks || !hamburger) return;
        const isOpen = (forceClose === true) ? false : !navLinks.classList.contains('active');
        
        if (isOpen) {
            navLinks.classList.add('active');
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
        } else {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            toggleMenu();
        });
    }

    // Cerrar menú al hacer clic en cualquier enlace
    links.forEach(function (link) {
        link.addEventListener('click', function () {
            toggleMenu(true);
        });
    });

    // Cerrar menú con tecla Escape
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
            toggleMenu(true);
        }
    });

    /* ── Active link highlight on scroll ──────────────── */
    const sections = document.querySelectorAll('.section, .hero');

    function highlightActiveLink() {
        var scrollPos = window.scrollY + 100;

        sections.forEach(function (section) {
            var top    = section.offsetTop;
            var height = section.offsetHeight;
            var id     = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                links.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveLink, { passive: true });
})();
