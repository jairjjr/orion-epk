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
