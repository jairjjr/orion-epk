/**
 * ORION EPK — Lógica del Briefing y Cotizador de Eventos
 * Experiencia interactiva de selección táctil, control de horario, duración,
 * cálculo de aforo por brincos de 25, envío asíncrono y respaldo directo para WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Configuración del Endpoint de Envío
    // Google Apps Script Web App desplegado en la cuenta de Jair
    const GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxKK_gSQSSfDNgdn8eFSTCRI626J6CLJcTmGAgaExZABP5Nr61xIYFGtBdMNr_fn2Us/exec'; 

    // 1. Elementos del DOM
    const quoteForm = document.getElementById('quote-form');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');
    const timePillBtns = document.querySelectorAll('.time-pill-btn');
    const durationInput = document.getElementById('duration-input');
    const durationChips = document.querySelectorAll('.duration-chip');
    const guestsInput = document.getElementById('guests-count-input');
    const guestsBadge = document.getElementById('guests-badge-display');
    const btnGuestsMinus = document.getElementById('btn-guests-minus');
    const btnGuestsPlus = document.getElementById('btn-guests-plus');
    const chipBtns = document.querySelectorAll('.chip-btn:not(.duration-chip)');
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

    // 3. Manejo de Presets de Horario
    timePillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timePillBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            if (eventTimeInput) {
                eventTimeInput.value = btn.getAttribute('data-time');
            }
        });
    });

    if (eventTimeInput) {
        eventTimeInput.addEventListener('input', () => {
            timePillBtns.forEach(b => b.classList.remove('is-active'));
        });
    }

    // 4. Manejo de Chips de Duración
    durationChips.forEach(chip => {
        chip.addEventListener('click', () => {
            durationChips.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');
            if (durationInput) {
                durationInput.value = chip.getAttribute('data-duration');
            }
        });
    });

    // 5. Control de Aforo con Brincos de 25
    let currentGuestNumber = 100;

    function updateGuestsDisplay(valueText, numericValue = null) {
        guestsInput.value = valueText;
        guestsBadge.textContent = valueText;
        if (numericValue !== null) {
            currentGuestNumber = numericValue;
        }
    }

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

    btnGuestsPlus.addEventListener('click', () => {
        currentGuestNumber += 25;
        const text = `${currentGuestNumber} personas`;
        updateGuestsDisplay(text, currentGuestNumber);
        syncChipsWithNumber(currentGuestNumber);
    });

    chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
            chipBtns.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');

            const guestStr = chip.getAttribute('data-guests');
            const match = guestStr ? guestStr.match(/\d+/) : null;
            if (match) {
                currentGuestNumber = parseInt(match[0], 10);
            }
            updateGuestsDisplay(guestStr, currentGuestNumber);
        });
    });

    function syncChipsWithNumber(num) {
        chipBtns.forEach(c => c.classList.remove('is-active'));
        chipBtns.forEach(chip => {
            const label = chip.getAttribute('data-guests');
            if (!label) return;
            if (num <= 25 && label.includes('Hasta 25')) {
                chip.classList.add('is-active');
            } else if (label.includes(`${num} a`) || label.includes(`– ${num}`) || label.includes(` ${num} `)) {
                chip.classList.add('is-active');
            }
        });
    }

    // 6. Feedback visual y accesibilidad en Option Cards
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

    // 7. Envío Asíncrono del Formulario
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        formErrorMsg.style.display = 'none';
        formErrorMsg.textContent = '';

        // Recoger datos
        const eventDate = eventDateInput.value;
        const eventTime = eventTimeInput ? eventTimeInput.value : '20:00';
        const eventDuration = durationInput ? durationInput.value : '3 Horas (2 Sets)';
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

        // Formatear horario visualmente (ej. 20:00 -> 8:00 PM)
        let formattedTime = eventTime;
        if (eventTime && eventTime.includes(':')) {
            const [h, m] = eventTime.split(':');
            const hour = parseInt(h, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            formattedTime = `${hour12}:${m} ${ampm}`;
        }

        // Estado de carga UI
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // Estructura del Payload
        const payload = {
            _subject: `[Nueva Cotización Orión] ${tipoEvento} (${eventDate}) - ${clientName}`,
            _template: 'table',
            _captcha: 'false',
            "Nombre del Solicitante": clientName,
            "Teléfono / WhatsApp": clientPhone,
            "Correo Electrónico": clientEmail,
            "Fecha del Evento": eventDate,
            "Horario Estimado": formattedTime,
            "Duración del Show": eventDuration,
            "Tipo de Celebración": tipoEvento,
            "Número Estimado de Personas": guests,
            "Tipo de Espacio": tipoEspacio,
            "Sistema de Sonido / Audio (PA)": sistemaAudio,
            "Canción Especial": specialSong || 'No especificada',
            "Ciudad o Recinto": eventCity || 'No especificada',
            "Notas o Comentarios": clientNotes || 'Ninguna',
            "Enviado desde": "Briefing Web Oficial Orion Live Band"
        };

        const eventDataSummary = {
            clientName,
            eventDate,
            eventTime: formattedTime,
            eventDuration,
            tipoEvento,
            guests,
            tipoEspacio,
            sistemaAudio,
            specialSong,
            clientPhone,
            clientEmail,
            eventCity,
            clientNotes
        };

        try {
            if (GOOGLE_SCRIPT_WEBAPP_URL && GOOGLE_SCRIPT_WEBAPP_URL.trim() !== '') {
                // Envío directo a Google Apps Script Web App (Gmail nativo sin intermediarios)
                await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                mostrarPantallaExito(eventDataSummary);
            } else {
                // Fallback a FormSubmit mientras se configura el webhook de Google
                const response = await fetch('https://formsubmit.co/ajax/jairjjr@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    mostrarPantallaExito(eventDataSummary);
                } else {
                    throw new Error('Respuesta no satisfactoria del servidor');
                }
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            formErrorMsg.innerHTML = `
                Hubo un inconveniente al conectar con el servidor de correo. 
                <br>No te preocupes, puedes enviarle este mismo resumen a Jair directamente por WhatsApp:
                <br><br>
                <a href="${generarWhatsAppUrl(eventDataSummary)}" 
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

    // 8. Generador de URL de WhatsApp estructurada
    function generarWhatsAppUrl(data) {
        const text = `¡Hola Jair! Acabo de completar el brief para cotizar con Orion Live Band:
• Celebración: ${data.tipoEvento}
• Fecha: ${data.eventDate}
• Horario: ${data.eventTime}
• Duración: ${data.eventDuration}
• Invitados: ${data.guests}
• Recinto: ${data.tipoEspacio}
• Audio: ${data.sistemaAudio}
${data.specialSong ? `• Canción especial: ${data.specialSong}\n` : ''}• Contacto: ${data.clientName} (${data.clientPhone})

Quedo a la espera de la cotización y disponibilidad. ¡Muchas gracias!`;

        return `https://wa.me/524771797700?text=${encodeURIComponent(text)}`;
    }

    // 9. Mostrar Pantalla de Éxito
    function mostrarPantallaExito(data) {
        quoteForm.style.display = 'none';
        document.querySelector('.quote-intro').style.display = 'none';
        quoteSuccess.style.display = 'block';

        if (successClientName) {
            successClientName.textContent = data.clientName;
        }

        summaryDetails.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Fecha:</span>
                <span class="summary-value">${data.eventDate}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Horario:</span>
                <span class="summary-value">${data.eventTime} (${data.eventDuration})</span>
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

        if (whatsappSummaryBtn) {
            whatsappSummaryBtn.href = generarWhatsAppUrl(data);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
