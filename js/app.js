/**
 * ORION EPK — App Orchestrator
 * Punto de entrada principal. Coordina módulos y comportamientos globales.
 */

(function () {
    'use strict';

    /* ── Ocultar scroll indicator al scrollear ────────── */
    var scrollIndicator = document.getElementById('scroll-indicator');

    if (scrollIndicator) {
        var hideOnScroll = function () {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '';
                scrollIndicator.style.pointerEvents = '';
            }
        };

        window.addEventListener('scroll', hideOnScroll, { passive: true });
    }

    /* ── Lightbox (para galería de fotos) ─────────────── */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxClose = document.getElementById('lightbox-close');

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(function() { lightboxImg.src = ''; }, 300);
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Cerrar con tecla Escape
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    /* ── Año dinámico en footer ───────────────────────── */
    var footerText = document.querySelector('.footer p');
    if (footerText) {
        var currentYear = new Date().getFullYear();
        footerText.textContent = '© ' + currentYear + ' Orion Live Band. Todos los derechos reservados.';
    }

    /* ── Log de inicialización ────────────────────────── */
    console.log('%c★ ORION EPK — Loaded', 'color: #9D4EDD; font-weight: bold; font-size: 14px;');
})();
