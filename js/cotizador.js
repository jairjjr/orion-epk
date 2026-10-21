/**
 * ORION EPK — Lógica del Briefing y Cotizador de Eventos
 * Experiencia interactiva de selección táctil, cálculo de aforo por brincos de 25,
 * envío asíncrono a jairjjr@gmail.com y generación de respaldo directo para WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elementos del DOM
    const quoteForm = document.getElementById('quote-form');
    const eventDateInput = document.getElementById('event-date');
    const guestsInput = document.getElementById('guests-count-input');
    const guestsBadge = document.getElementById('guests-badge-display');
    const btnGuestsMinus = document.getElementById('btn-guests-minus');
    const btnGuestsPlus = document.getElementById('btn-guests-plus');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const submitBtn = document.getElementById('submit-quote-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formErrorMsg = document.getElementById('form-error-msg');
    const quoteSuccess = document.getElementById('quote-success');
    const successClientName = document.getElementById('success-client-name');
    const summaryDetails = document.getElementById('summary-details');
    const whatsappSummaryBtn = document.getElementById('whatsapp-summary-btn');

    // 2. Restricción de Fecha mínima (Hoy)
    if (eventDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        eventDateInput.min = `${year}-${month}-${day}`;
    }

    // 3. Control de Aforo con Brincos de 25
    let currentGuestNumber = 100;

    function updateGuestsDisplay(valueText, numericValue = null) {
        guestsInput.value = valueText;
        guestsBadge.textContent = valueText;
        if (numericValue !== null) {
            currentGuestNumber = numericValue;
        }
    }

    // Botón Restar 25
    btnGuestsMinus.addEventListener('click', () => {
        if (currentGuestNumber > 25) {
            currentGuestNumber -= 25;
        } else {
            currentGuestNumber = 25;
        }
        const text = `${currentGuestNumber} personas`;
        updateGuestsDisplay(text, currentGuestNumber);
        syncChipsWithNumber(currentGuestNumber);
    });

    // Botón Sumar 25
    btnGuestsPlus.addEventListener('click', () => {
        currentGuestNumber += 25;
        const text = `${currentGuestNumber} personas`;
        updateGuestsDisplay(text, currentGuestNumber);
        syncChipsWithNumber(currentGuestNumber);
    });

    // Selección por Chips Rápidos
    chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
            chipBtns.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');

            const guestStr = chip.getAttribute('data-guests');
            // Intentar parsear número base para el stepper
            const match = guestStr.match(/\d+/);
            if (match) {
                currentGuestNumber = parseInt(match[0], 10);
            }
            updateGuestsDisplay(guestStr, currentGuestNumber);
        });
    });

    function syncChipsWithNumber(num) {
        chipBtns.forEach(c => c.classList.remove('is-active'));
        // Buscar si hay un chip exacto o coincidente
        chipBtns.forEach(chip => {
            const label = chip.getAttribute('data-guests');
            if (num <= 25 && label.includes('Hasta 25')) {
                chip.classList.add('is-active');
            } else if (label.includes(`${num} a`) || label.includes(`– ${num}`) || label.includes(` ${num} `)) {
                chip.classList.add('is-active');
            }
        });
    }

    // 4. Feedback visual y accesibilidad en Option Cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        if (!input) return;

        input.addEventListener('change', () => {
            const groupName = input.name;
            document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
                const parent = radio.closest('.option-card');
                if (parent) parent.classList.remove('is-checked');
            });
            if (input.checked) {
                card.classList.add('is-checked');
            }
        });
    });

    // 5. Envío Asíncrono del Formulario
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar errores previos
        formErrorMsg.style.display = 'none';
        formErrorMsg.textContent = '';

        // Recoger datos
        const eventDate = eventDateInput.value;
        const tipoEventoInput = document.querySelector('input[name="tipo_evento"]:checked');
        const tipoEspacioInput = document.querySelector('input[name="tipo_espacio"]:checked');
        const sistemaAudioInput = document.querySelector('input[name="sistema_audio"]:checked');
        const guests = guestsInput.value;
        const specialSong = document.getElementById('special-song').value.trim();
        const clientName = document.getElementById('client-name').value.trim();
        const clientPhone = document.getElementById('client-phone').value.trim();
        const clientEmail = document.getElementById('client-email').value.trim();
        const eventCity = document.getElementById('event-city').value.trim();
        const clientNotes = document.getElementById('client-notes').value.trim();

        // Validaciones requeridas
        if (!eventDate || !tipoEventoInput || !tipoEspacioInput || !sistemaAudioInput || !clientName || !clientPhone || !clientEmail) {
            formErrorMsg.textContent = 'Por favor completa todos los campos requeridos marcados con asterisco (*) antes de enviar.';
            formErrorMsg.style.display = 'block';
            formErrorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const tipoEvento = tipoEventoInput.value;
        const tipoEspacio = tipoEspacioInput.value;
        const sistemaAudio = sistemaAudioInput.value;

        // Estado de carga UI
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // Estructura del Payload para FormSubmit
        const payload = {
            _subject: `[Nueva Cotización Orión] ${tipoEvento} (${eventDate}) - ${clientName}`,
            _template: 'table',
            _captcha: 'false',
            "Nombre del Solicitante": clientName,
            "Teléfono / WhatsApp": clientPhone,
            "Correo Electrónico": clientEmail,
            "Fecha del Evento": eventDate,
            "Tipo de Celebración": tipoEvento,
            "Número Estimado de Personas": guests,
            "Tipo de Espacio": tipoEspacio,
            "Sistema de Sonido / Audio (PA)": sistemaAudio,
            "Canción Especial": specialSong || 'No especificada',
            "Ciudad o Recinto": eventCity || 'No especificada',
            "Notas o Comentarios": clientNotes || 'Ninguna',
            "Enviado desde": "Briefing Web Oficial Orion Live Band"
        };

        try {
            const response = await fetch('https://formsubmit.co/ajax/jairjjr@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Éxito en el envío
                mostrarPantallaExito({
                    clientName,
                    eventDate,
                    tipoEvento,
                    guests,
                    tipoEspacio,
                    sistemaAudio,
                    specialSong,
                    clientPhone,
                    clientEmail,
                    eventCity,
                    clientNotes
                });
            } else {
                throw new Error('Respuesta no satisfactoria del servidor');
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            // Si el servicio externo tiene problema de conexión, damos alternativa directa por WhatsApp
            formErrorMsg.innerHTML = `
                Hubo un inconveniente al conectar con el servidor de correo. 
                <br>No te preocupes, puedes enviarle este mismo resumen a Jair directamente por WhatsApp:
                <br><br>
                <a href="${generarWhatsAppUrl({ clientName, eventDate, tipoEvento, guests, tipoEspacio, sistemaAudio, specialSong, clientPhone })}" 
                   target="_blank" class="btn btn--primary" style="margin-top: 0.5rem; display: inline-flex;">
                   Enviar Brief por WhatsApp Ahora
                </a>
            `;
            formErrorMsg.style.display = 'block';
            submitBtn.disabled = false;
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
        }
    });

    // 6. Generador de URL de WhatsApp estructurada
    function generarWhatsAppUrl(data) {
        const text = `¡Hola Jair! Acabo de completar el brief para cotizar con Orion Live Band:
• Celebración: ${data.tipoEvento}
• Fecha: ${data.eventDate}
• Invitados: ${data.guests}
• Recinto: ${data.tipoEspacio}
• Audio: ${data.sistemaAudio}
${data.specialSong ? `• Canción especial: ${data.specialSong}\n` : ''}• Contacto: ${data.clientName} (${data.clientPhone})

Quedo a la espera de la cotización y disponibilidad. ¡Muchas gracias!`;

        return `https://wa.me/524771797700?text=${encodeURIComponent(text)}`;
    }

    // 7. Mostrar Pantalla de Éxito
    function mostrarPantallaExito(data) {
        quoteForm.style.display = 'none';
        document.querySelector('.quote-intro').style.display = 'none';
        quoteSuccess.style.display = 'block';

        if (successClientName) {
            successClientName.textContent = data.clientName;
        }

        // Construir resumen visual
        summaryDetails.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Fecha:</span>
                <span class="summary-value">${data.eventDate}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Evento:</span>
                <span class="summary-value">${data.tipoEvento}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Aforo:</span>
                <span class="summary-value">${data.guests}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Recinto:</span>
                <span class="summary-value">${data.tipoEspacio}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Audio / PA:</span>
                <span class="summary-value">${data.sistemaAudio}</span>
            </div>
            ${data.specialSong ? `
            <div class="summary-item">
                <span class="summary-label">Canción Especial:</span>
                <span class="summary-value">${data.specialSong}</span>
            </div>` : ''}
            <div class="summary-item">
                <span class="summary-label">Contacto:</span>
                <span class="summary-value">${data.clientName} · ${data.clientPhone}</span>
            </div>
        `;

        // Configurar botón de WhatsApp de respaldo
        if (whatsappSummaryBtn) {
            whatsappSummaryBtn.href = generarWhatsAppUrl(data);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
