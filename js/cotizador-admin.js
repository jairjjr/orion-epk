/**
 * ========================================================================
 * ORION LIVE BAND — Cotizador Privado & Generador de Propuestas
 * Lógica de Smart Paste, Cálculo en Tiempo Real, Exportación y WhatsApp
 * ========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Elementos del DOM
    const pasteInput      = document.getElementById('paste-input');
    const btnParsePaste   = document.getElementById('btn-parse-paste');
    const btnPrint        = document.getElementById('btn-print');
    const btnCopyWa       = document.getElementById('btn-copy-wa');
    const btnReset        = document.getElementById('btn-reset');
    const toast           = document.getElementById('toast');

    // Inputs de Edición
    const inputPriceTotal    = document.getElementById('input-price-total');
    const inputFolio         = document.getElementById('input-folio');
    const inputValidity      = document.getElementById('input-validity');
    const inputClientName    = document.getElementById('input-client-name');
    const inputCompanyName   = document.getElementById('input-company-name');
    const inputEventType     = document.getElementById('input-event-type');
    const inputEventDate     = document.getElementById('input-event-date');
    const inputEventTime     = document.getElementById('input-event-time');
    const inputEventDuration = document.getElementById('input-event-duration');
    const inputEventLocation = document.getElementById('input-event-location');
    const inputEventGuests   = document.getElementById('input-event-guests');
    const inputClientPhone   = document.getElementById('input-client-phone');
    const inputClientEmail   = document.getElementById('input-client-email');
    const inputEventNotes    = document.getElementById('input-event-notes');

    // Cláusulas Inputs
    const clauseElectric     = document.getElementById('clause-electric');
    const clauseStage        = document.getElementById('clause-stage');
    const clauseLogistics    = document.getElementById('clause-logistics');
    const clauseTerms        = document.getElementById('clause-terms');

    // Documento Preview Elements
    const docFolio           = document.getElementById('doc-folio');
    const docFolioP2         = document.getElementById('doc-folio-p2');
    const docValidity        = document.getElementById('doc-validity');
    const docClientName      = document.getElementById('doc-client-name');
    const docCompanyName     = document.getElementById('doc-company-name');
    const docEventType       = document.getElementById('doc-event-type');
    const docEventDate       = document.getElementById('doc-event-date');
    const docEventTime       = document.getElementById('doc-event-time');
    const docEventLocation   = document.getElementById('doc-event-location');
    const docEventGuests     = document.getElementById('doc-event-guests');
    const docClientPhone     = document.getElementById('doc-client-phone');
    const docServicesList    = document.getElementById('doc-services-list');
    const docPriceTotal      = document.getElementById('doc-price-total');
    const docPay1Amount      = document.getElementById('doc-pay1-amount');
    const docPay2Amount      = document.getElementById('doc-pay2-amount');
    const docPay3Amount      = document.getElementById('doc-pay3-amount');
    const docTableDuration   = document.getElementById('doc-table-duration');
    const docSignClient      = document.getElementById('doc-sign-client');

    const docClauseElectric  = document.getElementById('doc-clause-electric');
    const docClauseStage     = document.getElementById('doc-clause-stage');
    const docClauseLogistics = document.getElementById('doc-clause-logistics');
    const docClauseTerms     = document.getElementById('doc-clause-terms');

    // Displays auxiliares en panel de control (3 Pagos)
    const calcPay1Display = document.getElementById('calc-pay1-display');
    const calcPay2Display = document.getElementById('calc-pay2-display');
    const calcPay3Display = document.getElementById('calc-pay3-display');

    // 2. Formateador de Moneda
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }).format(amount) + ' MXN';
    }

    // 3. Actualización de Cálculos Económicos (Esquema Oficial 40% - 30% - 30%)
    function updateEconomics() {
        const total = parseFloat(inputPriceTotal.value) || 0;

        const pay1 = Math.round(total * 0.40);
        const pay2 = Math.round(total * 0.30);
        const pay3 = total - (pay1 + pay2); // Asegura suma exacta sin desfase de redondeo

        const pay1Formatted = formatCurrency(pay1);
        const pay2Formatted = formatCurrency(pay2);
        const pay3Formatted = formatCurrency(pay3);

        if (calcPay1Display) calcPay1Display.textContent = pay1Formatted;
        if (calcPay2Display) calcPay2Display.textContent = pay2Formatted;
        if (calcPay3Display) calcPay3Display.textContent = pay3Formatted;

        if (docPriceTotal) docPriceTotal.textContent = formatCurrency(total);
        if (docPay1Amount) docPay1Amount.textContent = pay1Formatted;
        if (docPay2Amount) docPay2Amount.textContent = pay2Formatted;
        if (docPay3Amount) docPay3Amount.textContent = pay3Formatted;
    }

    // 4. Actualización en Vivo de la Propuesta
    function updatePreview() {
        updateEconomics();

        const currentFolio = inputFolio.value || 'COT-ORION';
        docFolio.textContent        = currentFolio;
        if (docFolioP2) docFolioP2.textContent = currentFolio;
        docValidity.textContent     = 'Vigencia: ' + (inputValidity.value || '15 días');
        docClientName.textContent   = inputClientName.value || 'Cliente';
        docCompanyName.textContent  = inputCompanyName.value || 'Particular';
        docEventType.textContent    = inputEventType.value || 'Evento Social';
        docEventDate.textContent    = inputEventDate.value || 'Por definir';
        docEventLocation.textContent= inputEventLocation.value || 'Por definir';
        docEventGuests.textContent  = inputEventGuests.value || 'Por definir';
        docClientPhone.textContent  = inputClientPhone.value || 'Por definir';
        docSignClient.textContent   = inputClientName.value || 'Cliente';

        const fullTimeStr = (inputEventTime.value || '') + (inputEventDuration.value ? ' (' + inputEventDuration.value + ')' : '');
        docEventTime.textContent      = fullTimeStr;
        docTableDuration.textContent  = inputEventDuration.value || 'Show en Vivo';

        // Actualizar Servicios Incluidos (Dinámico con Repertorio vinculado a notas)
        const checkboxes = document.querySelectorAll('#checklist-services input[type="checkbox"]');
        docServicesList.innerHTML = '';
        checkboxes.forEach(chk => {
            if (chk.checked) {
                let serviceText = chk.getAttribute('data-service');

                // Si es el ítem especial de repertorio, adaptarlo al valor dinámico de notas
                if (chk.getAttribute('data-service-repertoire') === 'true') {
                    const repNotes = (inputEventNotes.value || '').trim();
                    serviceText = repNotes
                        ? `Repertorio personalizado para el evento: ${repNotes}`
                        : `Repertorio personalizado para el evento (Rock en tu idioma, pop y clásicos en vivo)`;
                }

                const li = document.createElement('li');
                li.className = 'sheet-service-item';
                li.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>${serviceText}</span>
                `;
                docServicesList.appendChild(li);
            }
        });

        // Actualizar Cláusulas
        docClauseElectric.innerHTML  = '<strong>1. Requerimiento Eléctrico (Tomas 110V):</strong> ' + formatClauseText(clauseElectric.value);
        docClauseStage.innerHTML     = '<strong>2. Escenario y Protección:</strong> ' + formatClauseText(clauseStage.value);
        docClauseLogistics.innerHTML = '<strong>3. Montaje y Pruebas:</strong> ' + formatClauseText(clauseLogistics.value);
        docClauseTerms.innerHTML     = '<strong>4. Políticas de Reserva y Pagos:</strong> ' + formatClauseText(clauseTerms.value);

        // Guardar automáticamente en LocalStorage
        saveDraft();
    }

    function formatClauseText(text) {
        return text ? text.replace(/\n/g, '<br>') : '';
    }

    // 5. Smart Paste: Parser Inteligente del Correo del Brief
    function parsePasteText() {
        const raw = pasteInput.value.trim();
        if (!raw) {
            showToast('Por favor pega primero el texto del correo.');
            return;
        }

        // Extractor con expresiones regulares flexibles
        function extractField(pattern) {
            const match = raw.match(pattern);
            return match && match[1] ? match[1].trim() : null;
        }

        const tipoEvento     = extractField(/Tipo de Evento:\s*([^\n\r]+)/i);
        const fechaEvento    = extractField(/Fecha del Evento:\s*([^\n\r]+)/i);
        const horario        = extractField(/Horario Estimado:\s*([^\n\r]+)/i);
        const duracion       = extractField(/Duraci[oó]n Estimada:\s*([^\n\r]+)/i);
        const aforo          = extractField(/Aforo \/ Personas:\s*([^\n\r]+)/i);
        const ciudadRecinto  = extractField(/Ciudad o Recinto:\s*([^\n\r]+)/i);
        const nombre         = extractField(/Nombre:\s*([^\n\r]+)/i);
        let   telefono       = extractField(/WhatsApp \/ Tel[eé]fono:\s*([^\n\r]+)/i);
        let   correo         = extractField(/Correo Electr[oó]nico:\s*([^\n\r]+)/i);
        const notas          = extractField(/Notas Adicionales:\s*([^\n\r]+)/i);

        // Limpiar teléfono si viene en markdown [4761113333](...)
        if (telefono) {
            telefono = telefono.replace(/\[([^\]]+)\].*/, '$1').replace(/[^\d\s\(\)\-+]/g, '').trim();
        }

        // Limpiar correo si viene en markdown [email](mailto:...)
        if (correo) {
            correo = correo.replace(/\[([^\]]+)\].*/, '$1').trim();
        }

        // Aplicar a los campos si se encontraron
        if (nombre) inputClientName.value = nombre;
        if (telefono) inputClientPhone.value = telefono;
        if (correo) inputClientEmail.value = correo;
        if (tipoEvento) inputEventType.value = tipoEvento;
        if (aforo) inputEventGuests.value = aforo;
        if (horario) inputEventTime.value = horario;
        if (duracion) inputEventDuration.value = duracion;
        if (notas) inputEventNotes.value = notas;

        // Separar Ciudad y Empresa si viene formato "Ciudad \ Empresa"
        if (ciudadRecinto) {
            if (ciudadRecinto.includes('\\') || ciudadRecinto.includes('/')) {
                const parts = ciudadRecinto.split(/[\\\/]/);
                inputEventLocation.value = parts[0].trim();
                inputCompanyName.value   = parts[1].replace(/Empresa/i, '').trim();
            } else {
                inputEventLocation.value = ciudadRecinto;
            }
        }

        // Formatear Fecha si viene en YYYY-MM-DD
        if (fechaEvento) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(fechaEvento)) {
                const [y, m, d] = fechaEvento.split('-');
                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const fechaLegible = dateObj.toLocaleDateString('es-MX', opciones);
                // Capitalizar primera letra
                inputEventDate.value = fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1);
            } else {
                inputEventDate.value = fechaEvento;
            }

            // Generar Folio Automático: COT-YYYYMMDD-EMPRESA
            const cleanDate = fechaEvento.replace(/-/g, '');
            const cleanComp = (inputCompanyName.value || 'CLIENTE').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
            inputFolio.value = `COT-${cleanDate}-${cleanComp}`;
        }

        updatePreview();
        showToast('⚡ ¡Propuesta completada con éxito desde el correo!');
    }

    // 6. Generador de Mensaje Ejecutivo para WhatsApp (3 Pagos, sin datos bancarios, alineación exacta)
    function generateWhatsAppMessage() {
        const clientName    = inputClientName.value || 'amigo';
        const companyName   = inputCompanyName.value;
        const total         = parseFloat(inputPriceTotal.value) || 0;

        const pay1 = Math.round(total * 0.40);
        const pay2 = Math.round(total * 0.30);
        const pay3 = total - (pay1 + pay2);

        const totalFormatted = formatCurrency(total);
        const pay1Formatted  = formatCurrency(pay1);
        const pay2Formatted  = formatCurrency(pay2);
        const pay3Formatted  = formatCurrency(pay3);

        const repNotes = (inputEventNotes.value || '').trim();
        const repertoire = repNotes ? repNotes : 'Rock en tu idioma, pop, baladas y clásicos de fiesta';

        const salutation = companyName 
            ? `¡Hola ${clientName}! Un gusto saludarte a ti y al equipo de ${companyName}.`
            : `¡Hola ${clientName}! Un gusto saludarte.`;

        let msg = `${salutation}
Te comparto con mucho gusto la propuesta formal para tu evento con *Orion Live Band*:

📅 *Fecha:* ${inputEventDate.value}
⏰ *Horario:* ${inputEventTime.value} (${inputEventDuration.value})
📍 *Lugar:* ${inputEventLocation.value}
👥 *Aforo estimado:* ${inputEventGuests.value}
🎉 *Celebración:* ${inputEventType.value}

🎸 *La experiencia de Orion Live Band incluye:*
• 4 Músicos profesionales en vivo (Voz líder femenina, Guitarra y voz, Bajo y Batería)
• Repertorio personalizado: ${repertoire}
• Sistema de Sonido PA profesional completo (2 Subs + 2 Medios de 15") para cobertura total
• Microfonía, consola digital e ingeniero de audio en sala
• Iluminación escénica para la banda
• Música ambiental continua durante los descansos
• Montaje y prueba de sonido (Soundcheck) 2 horas antes

💰 *Inversión y Esquema de Pagos:*
• *Costo Total:* ${totalFormatted}
• *1er Pago (40% - Reserva y Agenda):* ${pay1Formatted} (para apartar y asegurar la fecha)
• *2do Pago (30% - Intermedio):* ${pay2Formatted} (a liquidarse 1 semana antes del evento)
• *3er Pago (30% - Saldo Final):* ${pay3Formatted} (el día del evento al término del soundcheck)

⚡ *Requerimiento Técnico Básico (Rider):*
• Dos (2) tomas independientes a 110V a pie de escenario con tierra física real (Toma 1 Audio 15A / Toma 2 Músicos 6A).
• Espacio mínimo nivelado de 5m x 4m (techumbre obligatoria en exteriores).

📄 _(Te adjunto también el documento formal en PDF con el desglose y las firmas)._

Quedamos a tus órdenes para afinar cualquier detalle y asegurar la fecha en nuestra agenda. ¡Será un show inolvidable!`;

        navigator.clipboard.writeText(msg).then(() => {
            showToast('✅ ¡Mensaje para WhatsApp copiado al portapapeles!');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showToast('Error al copiar. Por favor inténtalo de nuevo.');
        });
    }

    // 7. Persistencia Local (LocalStorage)
    function saveDraft() {
        const draft = {
            priceTotal:    inputPriceTotal.value,
            folio:         inputFolio.value,
            validity:      inputValidity.value,
            clientName:    inputClientName.value,
            companyName:   inputCompanyName.value,
            eventType:     inputEventType.value,
            eventDate:     inputEventDate.value,
            eventTime:     inputEventTime.value,
            eventDuration: inputEventDuration.value,
            eventLocation: inputEventLocation.value,
            eventGuests:   inputEventGuests.value,
            clientPhone:   inputClientPhone.value,
            clientEmail:   inputClientEmail.value,
            eventNotes:    inputEventNotes.value,
            clauseElectric:clauseElectric.value,
            clauseStage:   clauseStage.value,
            clauseLogistics:clauseLogistics.value,
            clauseTerms:   clauseTerms.value
        };
        try {
            localStorage.setItem('orion_proposal_draft', JSON.stringify(draft));
        } catch (e) {}
    }

    function loadDraft() {
        try {
            const saved = localStorage.getItem('orion_proposal_draft');
            if (saved) {
                const draft = JSON.parse(saved);
                if (draft.priceTotal)    inputPriceTotal.value = draft.priceTotal;
                if (draft.folio)         inputFolio.value      = draft.folio;
                if (draft.validity)      inputValidity.value   = draft.validity;
                if (draft.clientName)    inputClientName.value = draft.clientName;
                if (draft.companyName)   inputCompanyName.value= draft.companyName;
                if (draft.eventType)     inputEventType.value  = draft.eventType;
                if (draft.eventDate)     inputEventDate.value  = draft.eventDate;
                if (draft.eventTime)     inputEventTime.value  = draft.eventTime;
                if (draft.eventDuration) inputEventDuration.value = draft.eventDuration;
                if (draft.eventLocation) inputEventLocation.value = draft.eventLocation;
                if (draft.eventGuests)   inputEventGuests.value = draft.eventGuests;
                if (draft.clientPhone)   inputClientPhone.value = draft.clientPhone;
                if (draft.clientEmail)   inputClientEmail.value = draft.clientEmail;
                if (draft.eventNotes)    inputEventNotes.value  = draft.eventNotes;
                if (draft.clauseElectric)clauseElectric.value  = draft.clauseElectric;
                if (draft.clauseStage)   clauseStage.value     = draft.clauseStage;
                if (draft.clauseLogistics)clauseLogistics.value = draft.clauseLogistics;
                if (draft.clauseTerms)   clauseTerms.value     = draft.clauseTerms;
            }
        } catch (e) {}
    }

    // 8. Toast Helper
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    // 9. Event Listeners
    const allInputs = document.querySelectorAll('.admin-input, .admin-textarea');
    allInputs.forEach(inp => {
        inp.addEventListener('input', updatePreview);
    });

    const allCheckboxes = document.querySelectorAll('#checklist-services input[type="checkbox"]');
    allCheckboxes.forEach(chk => {
        chk.addEventListener('change', updatePreview);
    });

    btnParsePaste.addEventListener('click', parsePasteText);
    btnPrint.addEventListener('click', () => window.print());
    btnCopyWa.addEventListener('click', generateWhatsAppMessage);

    btnReset.addEventListener('click', () => {
        if (confirm('¿Deseas limpiar el formulario para una nueva cotización?')) {
            localStorage.removeItem('orion_proposal_draft');
            pasteInput.value = '';
            inputClientName.value = '';
            inputCompanyName.value = '';
            inputEventType.value = '';
            inputEventDate.value = '';
            inputEventTime.value = '';
            inputEventDuration.value = '3 Horas (2 Sets)';
            inputEventLocation.value = '';
            inputEventGuests.value = '';
            inputClientPhone.value = '';
            inputClientEmail.value = '';
            inputEventNotes.value = '';
            inputPriceTotal.value = '32000';
            inputFolio.value = 'COT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
            updatePreview();
            showToast('Formulario restablecido.');
        }
    });

    // Inicialización
    loadDraft();
    updatePreview();
});
