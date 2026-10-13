/**
 * ORION EPK — Repertoire Module (Carrusel, Collage y Buscador Interactivo)
 * Conexión resiliente a dataset local/remoto con diseño UI/UX de alta fidelidad.
 */

(function () {
    'use strict';

    // Base de datos de respaldo instantáneo (Zero Fricción / Cero Bloqueo de Red)
    var DEFAULT_REPERTOIRE = [
        { "artista": "Caifanes", "cancion": "Afuera", "genero": "Rock en Español" },
        { "artista": "Caifanes", "cancion": "Viento", "genero": "Rock en Español" },
        { "artista": "Caifanes", "cancion": "La Célula Que Explota", "genero": "Rock en Español" },
        { "artista": "Soda Stereo", "cancion": "De Música Ligera", "genero": "Rock en Español" },
        { "artista": "Soda Stereo", "cancion": "Persiana Americana", "genero": "Rock en Español" },
        { "artista": "Soda Stereo", "cancion": "Cuando Pase El Temblor", "genero": "Rock en Español" },
        { "artista": "Enanitos Verdes", "cancion": "Lamento Boliviano", "genero": "Rock en Español" },
        { "artista": "Enanitos Verdes", "cancion": "La Muralla Verde", "genero": "Rock en Español" },
        { "artista": "Zoé", "cancion": "Soñé", "genero": "Rock en Español" },
        { "artista": "Zoé", "cancion": "Labios Rotos", "genero": "Rock en Español" },
        { "artista": "La Ley", "cancion": "El Duelo", "genero": "Rock en Español" },
        { "artista": "La Ley", "cancion": "Aquí", "genero": "Rock en Español" },
        { "artista": "Amantes de Lola", "cancion": "Bebe Malo", "genero": "Rock en Español" },
        { "artista": "Hombres G", "cancion": "Devuélveme a mi Chica", "genero": "Rock en Español" },
        { "artista": "Los Fabulosos Cadillacs", "cancion": "Matador", "genero": "Rock en Español" },
        { "artista": "Café Tacvba", "cancion": "Eres", "genero": "Rock en Español" },
        { "artista": "Toto", "cancion": "Hold the Line", "genero": "Rock Clásico & 80s" },
        { "artista": "Toto", "cancion": "Africa", "genero": "Rock Clásico & 80s" },
        { "artista": "Van Halen", "cancion": "Jump", "genero": "Rock Clásico & 80s" },
        { "artista": "Van Halen", "cancion": "Panama", "genero": "Rock Clásico & 80s" },
        { "artista": "The Doors", "cancion": "Roadhouse Blues", "genero": "Rock Clásico & 80s" },
        { "artista": "The Doors", "cancion": "Light My Fire", "genero": "Rock Clásico & 80s" },
        { "artista": "Led Zeppelin", "cancion": "Rock and Roll", "genero": "Rock Clásico & 80s" },
        { "artista": "INXS", "cancion": "New Sensation", "genero": "Rock Clásico & 80s" },
        { "artista": "INXS", "cancion": "Need You Tonight", "genero": "Rock Clásico & 80s" },
        { "artista": "Bon Jovi", "cancion": "Livin' on a Prayer", "genero": "Rock Clásico & 80s" },
        { "artista": "Queen", "cancion": "Radio Ga Ga", "genero": "Rock Clásico & 80s" },
        { "artista": "The Police", "cancion": "Roxanne", "genero": "Rock Clásico & 80s" },
        { "artista": "Kings of Leon", "cancion": "Sex on Fire", "genero": "Alternative & 90s/00s" },
        { "artista": "Kings of Leon", "cancion": "Use Somebody", "genero": "Alternative & 90s/00s" },
        { "artista": "Incubus", "cancion": "Drive", "genero": "Alternative & 90s/00s" },
        { "artista": "The Cranberries", "cancion": "Zombie", "genero": "Alternative & 90s/00s" },
        { "artista": "The Cranberries", "cancion": "Linger", "genero": "Alternative & 90s/00s" },
        { "artista": "Radiohead", "cancion": "Creep", "genero": "Alternative & 90s/00s" },
        { "artista": "Hoobastank", "cancion": "The Reason", "genero": "Alternative & 90s/00s" },
        { "artista": "Placebo", "cancion": "Every You Every Me", "genero": "Alternative & 90s/00s" },
        { "artista": "The Killers", "cancion": "Mr. Brightside", "genero": "Alternative & 90s/00s" },
        { "artista": "Foo Fighters", "cancion": "Learn to Fly", "genero": "Alternative & 90s/00s" },
        { "artista": "Maroon 5", "cancion": "This Love", "genero": "Funk & Groove" },
        { "artista": "Maroon 5", "cancion": "Sunday Morning", "genero": "Funk & Groove" },
        { "artista": "Bruno Mars", "cancion": "Treasure", "genero": "Funk & Groove" },
        { "artista": "Bruno Mars", "cancion": "Locked Out of Heaven", "genero": "Funk & Groove" },
        { "artista": "Jamiroquai", "cancion": "Cosmic Girl", "genero": "Funk & Groove" },
        { "artista": "Jamiroquai", "cancion": "Little L", "genero": "Funk & Groove" },
        { "artista": "La Garfield", "cancion": "Entre Palmeras", "genero": "Funk & Groove" },
        { "artista": "Daft Punk", "cancion": "Get Lucky", "genero": "Funk & Groove" },
        { "artista": "Robbie Williams", "cancion": "Feel", "genero": "Pop & R&B" },
        { "artista": "Robbie Williams", "cancion": "Rock DJ", "genero": "Pop & R&B" },
        { "artista": "Amy Winehouse", "cancion": "Valerie", "genero": "Pop & R&B" },
        { "artista": "Amy Winehouse", "cancion": "Rehab", "genero": "Pop & R&B" },
        { "artista": "Shakira", "cancion": "Inevitable", "genero": "Pop & R&B" },
        { "artista": "Tina Turner", "cancion": "The Best", "genero": "Pop & R&B" },
        { "artista": "Michael Jackson", "cancion": "Billie Jean", "genero": "Pop & R&B" }
    ];

    var state = {
        canciones: DEFAULT_REPERTOIRE,
        generoActivo: 'Todos',
        busqueda: ''
    };

    var grid = document.getElementById('repertoire-grid');
    var searchInput = document.getElementById('repertoire-search');
    var filterContainer = document.getElementById('repertoire-filters');
    var counterEl = document.getElementById('repertoire-count');

    // Intentar cargar JSON local si está disponible vía HTTP fetch
    function cargarDatos() {
        fetch('content/repertorio.json')
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (Array.isArray(data) && data.length > 0) {
                    state.canciones = data;
                    render();
                }
            })
            .catch(function () {
                // Fallback automático transparente
                render();
            });
    }

    function normalizar(texto) {
        return (texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function filtrarCanciones() {
        var query = normalizar(state.busqueda);
        return state.canciones.filter(function (item) {
            var matchGenero = (state.generoActivo === 'Todos') || (item.genero === state.generoActivo);
            if (!matchGenero) return false;

            if (!query) return true;
            var art = normalizar(item.artista);
            var song = normalizar(item.cancion);
            var gen = normalizar(item.genero);
            return art.indexOf(query) !== -1 || song.indexOf(query) !== -1 || gen.indexOf(query) !== -1;
        });
    }

    function render() {
        if (!grid) return;

        var filtradas = filtrarCanciones();

        if (counterEl) {
            counterEl.textContent = filtradas.length + ' canciones encontradas';
        }

        if (filtradas.length === 0) {
            grid.innerHTML = '<div class="repertoire-empty">' +
                '<span class="repertoire-empty__icon">🎵</span>' +
                '<h4 class="repertoire-empty__title">Repertorio en constante expansión</h4>' +
                '<p class="repertoire-empty__text">¿Buscas una canción especial para tu venue o evento? Orion adapta el setlist a la medida de tu público.</p>' +
                '</div>';
            return;
        }

        var html = '';
        filtradas.forEach(function (item) {
            html += '<div class="repertoire-card">' +
                '<div class="repertoire-card__header">' +
                    '<span class="repertoire-card__genre">' + escapeHtml(item.genero || 'En Vivo') + '</span>' +
                    '<span class="repertoire-card__live-dot" title="En setlist activo"></span>' +
                '</div>' +
                '<h4 class="repertoire-card__song">' + escapeHtml(item.cancion) + '</h4>' +
                '<p class="repertoire-card__artist">' + escapeHtml(item.artista) + '</p>' +
            '</div>';
        });

        grid.innerHTML = html;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Inicializar Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            state.busqueda = e.target.value;
            render();
        });
    }

    if (filterContainer) {
        filterContainer.addEventListener('click', function (e) {
            var btn = e.target.closest('.repertoire-filter-btn');
            if (!btn) return;

            filterContainer.querySelectorAll('.repertoire-filter-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            state.generoActivo = btn.getAttribute('data-genre') || 'Todos';
            render();
        });
    }

    // Arrancar
    cargarDatos();
})();
