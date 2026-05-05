/**
 * ORION EPK — Animations Module
 * Intersection Observer para revelar elementos con animación al scroll.
 */

(function () {
    'use strict';

    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    function handleIntersection(entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animar solo una vez
            }
        });
    }

    var observer = new IntersectionObserver(handleIntersection, observerOptions);

    /* Observar todos los elementos con clase .reveal */
    document.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
    });
})();
