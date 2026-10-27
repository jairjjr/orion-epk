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
    const chipBtns = document.querySelectorAll('.chip-btn:not(.duration-chip)');
    const submitBtn = document.getElementById('submit-quote-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formErrorMsg = document.getElementById('form-error-msg');
    const quoteSuccess = document.getElementById('quote-success');
    const successClientName = document.getElementById('success-client-name');
    const summaryDetails = document.getElementById('summary-details');
    const whatsappSummaryBtn = document.getElementById('whatsapp-summary-btn');

    // Elementos del Live Show Ticket (Ficha Técnica sin Precios)
    const ticketEvent = document.getElementById('ticket-event');
    const ticketDate = document.getElementById('ticket-date');
    const ticketTime = document.getElementById('ticket-time');
    const ticketGuests = document.getElementById('ticket-guests');
    const ticketAudio = document.getElementById('ticket-audio');
    const ticketStatusBadge = document.getElementById('ticket-status-badge');
    const specialSongInput = document.getElementById('special-song');
    const clientNameInput = document.getElementById('client-name');
    const clientPhoneInput = document.getElementById('client-phone');
    const clientEmailInput = document.getElementById('client-email');

    // Función de micro-interacción táctil en valores del ticket
    function flashValue(el) {
        if (!el) return;
        el.classList.add('is-updated');
        setTimeout(() => el.classList.remove('is-updated'), 350);
    }

    // Función Reactiva: Actualizar Ticket y Stepper en Tiempo Real
    function updateTicketAndStepper() {
        // 1. Tipo de Celebración
        const checkedTipo = document.querySelector('input[name="tipo_evento"]:checked');
        if (ticketEvent) {
            if (checkedTipo) {
                ticketEvent.textContent = checkedTipo.value.split('/')[0].trim();
                flashValue(ticketEvent);
            } else {
                ticketEvent.textContent = 'Por definir';
            }
        }

        // 2. Fecha Tentativa
        if (ticketDate) {
            if (eventDateInput && eventDateInput.value) {
                const parts = eventDateInput.value.split('-');
                if (parts.length === 3) {
                    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    const mes = meses[parseInt(parts[1], 10) - 1] || parts[1];
                    ticketDate.textContent = `${parts[2]} ${mes} ${parts[0]}`;
                } else {
                    ticketDate.textContent = eventDateInput.value;
                }
                flashValue(ticketDate);
            } else {
                ticketDate.textContent = 'Por elegir';
            }
        }

        // 3. Horario & Duración
        if (ticketTime) {
            const timeVal = eventTimeInput ? eventTimeInput.value : '20:00';
            const durVal = durationInput ? durationInput.value.split('(')[0].trim() : '3 Horas';
            ticketTime.textContent = `${timeVal} · ${durVal}`;
            flashValue(ticketTime);
        }

        // 4. Aforo Estimado
        if (ticketGuests && guestsInput) {
            ticketGuests.textContent = guestsInput.value || '100 a 125 personas';
            flashValue(ticketGuests);
        }

        // 5. Audio / PA
        const checkedAudio = document.querySelector('input[name="sistema_audio"]:checked');
        if (ticketAudio) {
            if (checkedAudio) {
                const val = checkedAudio.value;
                if (val.includes('lleve equipo') || val.includes('lleva el PA')) {
                    ticketAudio.textContent = 'PA de Orion';
                } else if (val.includes('recinto ya cuenta') || val.includes('tiene PA')) {
                    ticketAudio.textContent = 'PA del recinto';
                } else {
                    ticketAudio.textContent = 'Por asesorar';
                }
                flashValue(ticketAudio);
            } else {
                ticketAudio.textContent = 'Por definir';
            }
        }

        // 6. Sincronización del Stepper de 4 Pasos
        const step1 = document.getElementById('step-nav-1');
        const step2 = document.getElementById('step-nav-2');
        const step3 = document.getElementById('step-nav-3');
        const step4 = document.getElementById('step-nav-4');

        if (step1) {
            if (eventDateInput && eventDateInput.value && checkedTipo) {
                step1.classList.add('is-completed');
            } else {
                step1.classList.remove('is-completed');
            }
        }

        if (step2) {
            const checkedEspacio = document.querySelector('input[name="tipo_espacio"]:checked');
            if (guestsInput && guestsInput.value && checkedEspacio && checkedAudio) {
                step2.classList.add('is-completed');
            } else {
                step2.classList.remove('is-completed');
            }
        }

        if (step3) {
            if (specialSongInput && specialSongInput.value.trim().length > 0) {
                step3.classList.add('is-completed');
            }
        }

        if (step4) {
            if (clientNameInput && clientNameInput.value.trim() &&
                clientPhoneInput && clientPhoneInput.value.trim() &&
                clientEmailInput && clientEmailInput.value.trim()) {
                step4.classList.add('is-completed');
            } else {
                step4.classList.remove('is-completed');
            }
        }

        // 7. Estado del Badge en Ticket
        if (ticketStatusBadge) {
            const isReady = (step1 && step1.classList.contains('is-completed')) &&
                            (step2 && step2.classList.contains('is-completed')) &&
                            (step4 && step4.classList.contains('is-completed'));
            if (isReady) {
                ticketStatusBadge.textContent = 'Listo para Enviar';
                ticketStatusBadge.style.background = 'rgba(121, 192, 255, 0.35)';
            } else {
                ticketStatusBadge.textContent = 'Personalizando';
                ticketStatusBadge.style.background = 'rgba(121, 192, 255, 0.15)';
            }
        }
    }

    // 2. Restricción de Fecha mínima (Hoy) y Listener
    if (eventDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        eventDateInput.min = `${year}-${month}-${day}`;
        eventDateInput.addEventListener('change', updateTicketAndStepper);
    }

    // 3. Manejo de Presets de Horario
    timePillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timePillBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            if (eventTimeInput) {
                eventTimeInput.value = btn.getAttribute('data-time');
            }
            updateTicketAndStepper();
        });
    });

    if (eventTimeInput) {
        eventTimeInput.addEventListener('input', () => {
            timePillBtns.forEach(b => b.classList.remove('is-active'));
            updateTicketAndStepper();
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
            updateTicketAndStepper();
        });
    });

    // 5. Control de Aforo por Selección de Rangos
    chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
            chipBtns.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');

            const guestStr = chip.getAttribute('data-guests');
            if (guestsInput) {
                guestsInput.value = guestStr;
            }
            if (guestsBadge) {
                guestsBadge.textContent = guestStr;
            }
            updateTicketAndStepper();
        });
    });

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
            updateTicketAndStepper();
        });
    });

    // Listeners de texto para completar Stepper
    if (specialSongInput) specialSongInput.addEventListener('input', updateTicketAndStepper);
    if (clientNameInput) clientNameInput.addEventListener('input', updateTicketAndStepper);
    if (clientPhoneInput) clientPhoneInput.addEventListener('input', updateTicketAndStepper);
    if (clientEmailInput) clientEmailInput.addEventListener('input', updateTicketAndStepper);

    // Ejecución inicial para sincronizar valores por defecto
    updateTicketAndStepper();

    // 7. Envío Asíncrono del Formulario
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        formErrorMsg.style.display = 'none';
        formErrorMsg.textContent = '';

        // Recoger datos
        const eventDate = eventDateInput ? eventDateInput.value : '';
        const eventTime = eventTimeInput ? eventTimeInput.value : '20:00';
        const eventDuration = durationInput ? durationInput.value : '3 Horas (2 Sets)';
        const tipoEventoInput = document.querySelector('input[name="tipo_evento"]:checked');
        const tipoEspacioInput = document.querySelector('input[name="tipo_espacio"]:checked');
        const sistemaAudioInput = document.querySelector('input[name="sistema_audio"]:checked');
        const guests = guestsInput ? guestsInput.value : '100 a 125 personas';
        const specialSong = specialSongInput ? specialSongInput.value.trim() : '';
        const clientName = clientNameInput ? clientNameInput.value.trim() : '';
        const clientPhone = clientPhoneInput ? clientPhoneInput.value.trim() : '';
        const clientEmail = clientEmailInput ? clientEmailInput.value.trim() : '';
        const eventCity = document.getElementById('event-city') ? document.getElementById('event-city').value.trim() : '';
        const clientNotes = document.getElementById('client-notes') ? document.getElementById('client-notes').value.trim() : '';

        // Validaciones requeridas con scroll suave al primer campo faltante
        if (!eventDate) {
            formErrorMsg.textContent = 'Por favor selecciona la fecha tentativa de tu evento.';
            formErrorMsg.style.display = 'block';
            eventDateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            eventDateInput.focus();
            return;
        }

        if (!tipoEventoInput) {
            formErrorMsg.textContent = 'Por favor selecciona el tipo de celebración.';
            formErrorMsg.style.display = 'block';
            document.querySelector('.option-cards-grid').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!tipoEspacioInput) {
            formErrorMsg.textContent = 'Por favor selecciona si tu espacio es abierto o cerrado.';
            formErrorMsg.style.display = 'block';
            document.querySelector('.option-cards-grid--two').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!sistemaAudioInput) {
            formErrorMsg.textContent = 'Por favor indícanos el requerimiento de sonido (PA).';
            formErrorMsg.style.display = 'block';
            document.querySelector('.option-cards-grid--three').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!clientName) {
            formErrorMsg.textContent = 'Por favor ingresa tu nombre o el de tu empresa.';
            formErrorMsg.style.display = 'block';
            clientNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            clientNameInput.focus();
            return;
        }

        if (!clientPhone) {
            formErrorMsg.textContent = 'Por favor ingresa tu WhatsApp o teléfono para contactarte.';
            formErrorMsg.style.display = 'block';
            clientPhoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            clientPhoneInput.focus();
            return;
        }

        if (!clientEmail) {
            formErrorMsg.textContent = 'Por favor ingresa tu correo electrónico para enviarte la propuesta.';
            formErrorMsg.style.display = 'block';
            clientEmailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            clientEmailInput.focus();
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
        const intro = document.querySelector('.quote-intro');
        if (intro) intro.style.display = 'none';
        const stepper = document.querySelector('.form-stepper');
        if (stepper) stepper.style.display = 'none';
        const ticket = document.getElementById('live-ticket');
        if (ticket) ticket.style.display = 'none';
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
