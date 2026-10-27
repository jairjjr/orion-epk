/**
 * ORION EPK — Animations & Micro-Interactions Module
 * Coreografía Motion UI, Tagline Reveal progresivo, Pausa de GPU en Marquee y Acordeón FAQ.
 */

(function () {
    'use strict';

    // 1. Intersection Observer para elementos .reveal
    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.2
    };

    function handleIntersection(entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }

    var revealObserver = new IntersectionObserver(handleIntersection, observerOptions);
    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    // 2. Tagline Reveal (Encendido progresivo palabra por palabra al scroll)
    var taglineEl = document.getElementById('tagline-text');
    var taglineSection = document.getElementById('tagline-reveal');

    if (taglineEl && taglineSection) {
        var rawText = taglineEl.textContent.trim();
        var words = rawText.split(/\s+/);
        taglineEl.innerHTML = words.map(function (w) {
            var isHighlight = /gente|música|secreto/i.test(w);
            return '<span class="tagline-word' + (isHighlight ? ' highlight' : '') + '">' + w + '</span>';
        }).join(' ');

        var wordSpans = taglineEl.querySelectorAll('.tagline-word');
        var totalWords = wordSpans.length;

        function updateTaglineScroll() {
            var rect = taglineSection.getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;

            // Progreso cuando entra por el 85% de la pantalla hasta llegar al 20%
            var start = windowHeight * 0.85;
            var end = windowHeight * 0.25;
            var progress = (start - rect.top) / (start - end);
            progress = Math.max(0, Math.min(1, progress));

            var wordsToReveal = Math.floor(progress * totalWords);
            wordSpans.forEach(function (span, idx) {
                if (idx <= wordsToReveal) {
                    span.classList.add('is-revealed');
                } else {
                    span.classList.remove('is-revealed');
                }
            });
        }

        window.addEventListener('scroll', function () {
            requestAnimationFrame(updateTaglineScroll);
        }, { passive: true });

        // Cálculo inicial
        updateTaglineScroll();
    }

    // 3. Pausar Marquee cuando sale del viewport (Conservación de GPU y Batería)
    var marqueeContainer = document.querySelector('.marquee-container');
    var marqueeTrack = document.querySelector('.marquee-track');

    if (marqueeContainer && marqueeTrack) {
        var marqueeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    marqueeTrack.style.animationPlayState = 'running';
                } else {
                    marqueeTrack.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0.05 });

        marqueeObserver.observe(marqueeContainer);
    }

})();
