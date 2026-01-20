// ============================================
// EDITOR SOCIAL (JUEGO DE EVALUACION)
// Sistema de notas con navegacion lateral
// ============================================

class EditorSocial {
  constructor() {
    this.pasajeActualIndex = 0;
    this.pasajes = [];
    this.xmlDoc = null;
    
    // Estado de notas del pasaje actual
    this.notasPasaje = [];
    this.notaActualIndex = -1;
    this.notasEvaluadas = new Set();
    
    // Referencias DOM
    this.pasajeContent = null;
    this.notaContent = null;
  }

  /**
   * Carga dinamica de CETEI.js si no esta disponible.
   */
  async asegurarCETEI() {
    if (typeof window.CETEI !== 'undefined') return true;

    if (window.__ceteiLoadingPromise) {
      await window.__ceteiLoadingPromise;
      return typeof window.CETEI !== 'undefined';
    }

    window.__ceteiLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '../assets/js/CETEI.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('No se pudo cargar CETEI.js'));
      document.head.appendChild(script);
    });

    try {
      await window.__ceteiLoadingPromise;
      return typeof window.CETEI !== 'undefined';
    } finally {
      window.__ceteiLoadingPromise = null;
    }
  }

  /**
   * Inicializar editor social
   */
  async init() {
    console.log('Inicializando Editor Social...');

    // Referencias DOM
    this.pasajeContent = document.getElementById('pasaje-content');
    this.notaContent = document.getElementById('nota-content');

    // Verificar si usuario tiene modo definido
    if (!window.userManager.tieneModoDefinido()) {
      await window.modalModo.mostrar();
    }

    // Cargar pasajes desde Supabase
    await this.cargarPasajes();

    // Cargar XML de Fuenteovejuna (se cachea)
    this.xmlDoc = await cargarXMLCacheado('../assets/xml/fuenteovejuna.xml');

    // Asegurar CETEI antes de renderizar
    const okCetei = await this.asegurarCETEI();
    if (!okCetei) {
      throw new Error('CETEI.js no esta cargado y no se pudo cargar dinamicamente.');
    }

    // Cargar primer pasaje
    await this.cargarPasaje(0);

    // Event listeners para controles
    this.setupEventListeners();

    console.log('Editor Social inicializado');
  }

  /**
   * Cargar lista de pasajes desde Supabase
   */
  async cargarPasajes() {
    const { data, error } = await window.supabaseClient
      .from('pasajes')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error al cargar pasajes:', error);
      alert('Error al cargar pasajes. Verifica tu conexion.');
      return;
    }

    this.pasajes = data ?? [];
    document.getElementById('pasajes-totales').textContent = this.pasajes.length;
    console.log(`${this.pasajes.length} pasajes cargados`);
  }

  /**
   * Cargar un pasaje especifico
   */
  async cargarPasaje(index) {
    if (index < 0 || index >= this.pasajes.length) {
      console.log('Fin de pasajes alcanzado');
      this.mostrarFinalizacion();
      return;
    }

    this.pasajeActualIndex = index;
    
    // Reset estado de notas
    this.notasPasaje = [];
    this.notaActualIndex = -1;
    this.notasEvaluadas.clear();

    const pasaje = this.pasajes[index];

    // Actualizar UI
    document.getElementById('pasaje-actual').textContent = index + 1;

    // Extraer fragmento del XML
    const fragmento = extraerFragmento(this.xmlDoc, pasaje);

    if (!fragmento) {
      console.error('No se pudo extraer el fragmento');
      return;
    }

    // Renderizar con CETEI
    await this.renderizarPasaje(fragmento, pasaje);

    // Cargar notas y aplicar highlights
    await this.cargarYAplicarNotas(fragmento, pasaje);
  }

  /**
   * Renderizar pasaje con CETEI
   */
  async renderizarPasaje(fragmento, pasaje) {
    this.pasajeContent.innerHTML = '';

    // Anadir titulo del pasaje
    const titulo = document.createElement('h2');
    titulo.textContent = pasaje.titulo;
    titulo.style.cssText = 'margin-bottom: 10px; color: var(--text); border-bottom: 2px solid var(--primary); padding-bottom: 10px;';
    this.pasajeContent.appendChild(titulo);

    // Anadir descripcion si existe
    if (pasaje.descripcion) {
      const descripcion = document.createElement('p');
      descripcion.textContent = pasaje.descripcion;
      descripcion.style.cssText = 'margin-bottom: 20px; color: var(--muted); font-style: italic; line-height: 1.6;';
      this.pasajeContent.appendChild(descripcion);
    }

    // Asegurar CETEI
    const okCetei = await this.asegurarCETEI();
    if (!okCetei || typeof window.CETEI === 'undefined') {
      throw new Error('CETEI.js no esta cargado.');
    }

    // Crear documento temporal para CETEI
    const xmlStr = new XMLSerializer().serializeToString(fragmento);
    const parser = new DOMParser();
    const tempDoc = parser.parseFromString(xmlStr, 'text/xml');

    // Renderizar XML con CETEI
    const cetei = new window.CETEI();
    const htmlContent = cetei.domToHTML5(tempDoc);

    // Crear contenedor para el contenido TEI
    const teiContainer = document.createElement('div');
    teiContainer.id = 'tei-pasaje';
    teiContainer.style.cssText = "font-family: 'Google Sans Code', 'Oxygen Mono', 'Source Code Pro', monospace; font-weight: 300; line-height: 1.8; font-size: 16px;";
    teiContainer.appendChild(htmlContent);

    this.pasajeContent.appendChild(teiContainer);

    // Aplicar alineacion de versos partidos
    setTimeout(() => alignSplitVerses(this.pasajeContent), 100);

    console.log('Pasaje renderizado:', pasaje.titulo);
  }

  /**
   * Cargar notas del pasaje y aplicar highlights al texto
   */
  async cargarYAplicarNotas(fragmento, pasaje) {
    // Obtener xml:ids del fragmento
    const xmlIds = extraerXmlIdsDelFragmento(fragmento);

    // Cargar todas las notas activas
    const todasNotas = await cargarNotasActivas();

    // Filtrar notas que aplican a este pasaje
    this.notasPasaje = filtrarNotasPorXmlIds(todasNotas, xmlIds);

    console.log(`${this.notasPasaje.length} notas para el pasaje ${pasaje.titulo}`);

    // Actualizar contadores
    this.actualizarContadores();

    // Aplicar highlights al texto
    this.aplicarHighlights();

    // Mostrar placeholder o primera nota
    if (this.notasPasaje.length === 0) {
      this.notaContent.innerHTML = '<p class="placeholder-text">No hay notas en este pasaje</p>';
    } else {
      this.notaContent.innerHTML = '<p class="placeholder-text">Haz clic en un texto subrayado o usa las flechas para ver las notas</p>';
    }
  }

  /**
   * Aplicar highlights al texto basandose en las notas de Supabase
   */
  aplicarHighlights() {
    const teiContainer = document.getElementById('tei-pasaje');
    if (!teiContainer) return;

    // Ordenar notas: primero las mas especificas (seg), luego las generales (l)
    const notasOrdenadas = [...this.notasPasaje].sort((a, b) => {
      const targetA = a.target || '';
      const targetB = b.target || '';
      
      const aIsSeg = targetA.includes('seg-');
      const bIsSeg = targetB.includes('seg-');
      
      if (aIsSeg && !bIsSeg) return -1;
      if (!aIsSeg && bIsSeg) return 1;
      
      const aCount = targetA.split(/\s+/).length;
      const bCount = targetB.split(/\s+/).length;
      return aCount - bCount;
    });

    notasOrdenadas.forEach((nota, index) => {
      const targetAttr = nota.target;
      const notaId = nota.nota_id;
      
      if (!targetAttr || !notaId) return;

      const targets = targetAttr.split(/\s+/).map(t => t.replace('#', ''));
      const targetElements = [];

      // Buscar todos los elementos target en el DOM
      targets.forEach(targetId => {
        let element = teiContainer.querySelector(`[xml\\:id="${targetId}"]`);
        
        if (!element) {
          const allElements = teiContainer.querySelectorAll('*');
          for (let el of allElements) {
            if (el.getAttribute('xml:id') === targetId) {
              element = el;
              break;
            }
          }
        }
        
        if (element) {
          targetElements.push(element);
        }
      });

      if (targetElements.length === 0) return;

      // Aplicar wrapper a cada elemento target
      targetElements.forEach(element => {
        let wrapperElement = null;
        
        // Verificar si ya existe un wrapper
        if (element.firstElementChild && element.firstElementChild.classList.contains('note-wrapper')) {
          wrapperElement = element.firstElementChild;
        } else {
          // Crear wrapper nuevo
          wrapperElement = document.createElement('span');
          wrapperElement.className = 'note-wrapper note-target';
          
          // Mover contenido al wrapper
          const childNodes = Array.from(element.childNodes);
          childNodes.forEach(child => {
            wrapperElement.appendChild(child);
          });
          
          element.appendChild(wrapperElement);
        }
        
        // Asegurar clases
        if (!wrapperElement.classList.contains('note-target')) {
          wrapperElement.classList.add('note-target');
        }
        
        // Anadir ID de nota y su indice
        const currentGroups = wrapperElement.getAttribute('data-note-groups') || '';
        const groups = currentGroups ? currentGroups.split(' ').filter(g => g) : [];
        if (!groups.includes(notaId)) {
          groups.push(notaId);
          wrapperElement.setAttribute('data-note-groups', groups.join(' '));
        }

        // Anadir eventos solo una vez por wrapper
        if (!wrapperElement.hasAttribute('data-note-events')) {
          wrapperElement.setAttribute('data-note-events', 'true');
          
          // Evento click - mostrar nota correspondiente
          wrapperElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const noteGroups = wrapperElement.getAttribute('data-note-groups');
            if (!noteGroups) return;
            
            const firstNoteId = noteGroups.split(' ')[0];
            const noteIndex = this.notasPasaje.findIndex(n => n.nota_id === firstNoteId);
            
            if (noteIndex >= 0) {
              this.navegarANota(noteIndex);
            }
          });

          // Evento mouseenter - highlight
          wrapperElement.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            const noteGroups = wrapperElement.getAttribute('data-note-groups');
            if (noteGroups) {
              this.highlightNotaEnTexto(noteGroups.split(' ')[0], true);
            }
          });

          // Evento mouseleave - quitar highlight
          wrapperElement.addEventListener('mouseleave', (e) => {
            e.stopPropagation();
            const noteGroups = wrapperElement.getAttribute('data-note-groups');
            if (noteGroups) {
              const noteId = noteGroups.split(' ')[0];
              const notaActual = this.notasPasaje[this.notaActualIndex];
              if (!notaActual || notaActual.nota_id !== noteId) {
                this.highlightNotaEnTexto(noteId, false);
              }
            }
          });
        }
      });
    });

    console.log('Highlights aplicados');
  }

  /**
   * Highlight/unhighlight una nota en el texto
   */
  highlightNotaEnTexto(notaId, activo) {
    const teiContainer = document.getElementById('tei-pasaje');
    if (!teiContainer) return;

    const wrappers = teiContainer.querySelectorAll(`[data-note-groups*="${notaId}"]`);
    wrappers.forEach(wrapper => {
      if (activo) {
        wrapper.classList.add('note-active');
      } else {
        wrapper.classList.remove('note-active');
      }
    });
  }

  /**
   * Marcar nota actual en el texto
   */
  marcarNotaActualEnTexto(notaId) {
    const teiContainer = document.getElementById('tei-pasaje');
    if (!teiContainer) return;

    // Quitar marca anterior
    teiContainer.querySelectorAll('.note-current').forEach(el => {
      el.classList.remove('note-current');
    });

    // Quitar todos los active
    teiContainer.querySelectorAll('.note-active').forEach(el => {
      el.classList.remove('note-active');
    });

    // Marcar la actual
    if (notaId) {
      const wrappers = teiContainer.querySelectorAll(`[data-note-groups*="${notaId}"]`);
      wrappers.forEach(wrapper => {
        wrapper.classList.add('note-current', 'note-active');
      });

      // Scroll al primer elemento
      if (wrappers.length > 0) {
        wrappers[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  /**
   * Navegar a una nota especifica por indice
   */
  navegarANota(index) {
    if (index < 0 || index >= this.notasPasaje.length) return;

    this.notaActualIndex = index;
    const nota = this.notasPasaje[index];

    // Actualizar indicador de posicion
    document.getElementById('nota-actual-index').textContent = index + 1;

    // Marcar en el texto
    this.marcarNotaActualEnTexto(nota.nota_id);

    // Actualizar botones de navegacion
    this.actualizarBotonesNavegacion();

    // Renderizar la nota
    this.renderizarNotaActual(nota);
  }

  /**
   * Renderizar la nota actual en el panel lateral
   */
  renderizarNotaActual(nota) {
    const pasajeId = this.pasajes[this.pasajeActualIndex]?.id;
    const yaEvaluada = this.notasEvaluadas.has(nota.nota_id);

    // Construir badges de tipo
    let badgesHTML = '';
    if (nota.type) {
      badgesHTML += `<span class="nota-badge nota-badge-type">${this.getTipoNotaLabel(nota.type)}</span>`;
    }
    if (nota.subtype) {
      badgesHTML += `<span class="nota-badge nota-badge-subtype">${nota.subtype}</span>`;
    }

    // Obtener estadísticas de evaluaciones
    const evaluaciones = typeof obtenerEvaluacionesStats === 'function' 
      ? obtenerEvaluacionesStats(nota.nota_id, nota) 
      : { total: 0, utiles: 0, mejorables: 0 };
    
    // Mensaje si no hay evaluaciones
    const mensajePrimero = evaluaciones.total === 0 
      ? '<p class="eval-mensaje-primero">¡Sé el primero en evaluar esta nota!</p>' 
      : '';

    // Contenido HTML de la nota
    let html = `
      <div class="nota-tipo">${badgesHTML}</div>
      <div class="nota-texto">${nota.texto_nota}</div>
    `;

    // Mostrar botones de evaluacion o estado evaluado
    if (yaEvaluada) {
      html += `
        <div class="nota-evaluada">
          <i class="fa-solid fa-check-circle" aria-hidden="true"></i>
          Nota evaluada
        </div>
      `;
    } else {
      html += `
        <div class="nota-acciones">
          <button class="btn-util" data-nota-id="${nota.nota_id}" data-version="${nota.version}">
            <span class="btn-contador">${evaluaciones.utiles}</span>
            <i class="fa-solid fa-heart" aria-hidden="true"></i>
            Util
          </button>
          <button class="btn-mejorable" data-nota-id="${nota.nota_id}" data-version="${nota.version}">
            <span class="btn-contador">${evaluaciones.mejorables}</span>
            <i class="fa-solid fa-heart-crack" aria-hidden="true"></i>
            Mejorable
          </button>
        </div>
        ${mensajePrimero}
        <div class="nota-comentario" style="display: none;">
          <textarea placeholder="¿Qué cambiarías? Puedes explicar lo que no te gusta o redactar una nueva nota (opcional)" rows="3"></textarea>
          <div class="nota-comentario-btns">
            <button class="btn-enviar-comentario">Enviar</button>
            <button class="btn-cancelar-comentario">Cancelar</button>
          </div>
        </div>
      `;
    }

    this.notaContent.innerHTML = html;

    // Adjuntar event listeners si no esta evaluada
    if (!yaEvaluada) {
      this.attachNotaListeners(nota, pasajeId);
    }
  }

  /**
   * Adjuntar listeners a los botones de evaluacion
   */
  attachNotaListeners(nota, pasajeId) {
    const btnUtil = this.notaContent.querySelector('.btn-util');
    const btnMejorable = this.notaContent.querySelector('.btn-mejorable');
    const comentarioDiv = this.notaContent.querySelector('.nota-comentario');
    const textarea = comentarioDiv?.querySelector('textarea');
    const btnEnviar = comentarioDiv?.querySelector('.btn-enviar-comentario');
    const btnCancelar = comentarioDiv?.querySelector('.btn-cancelar-comentario');

    // Boton "Util"
    btnUtil?.addEventListener('click', async () => {
      const exito = await this.registrarEvaluacion(
        nota.nota_id,
        nota.version,
        'up',
        null,
        pasajeId
      );

      if (exito) {
        // Actualizar contador local inmediatamente
        if (typeof actualizarContadorLocal === 'function') {
          actualizarContadorLocal(nota.nota_id, 'up');
        }
        this.marcarNotaComoEvaluada(nota.nota_id);
        this.avanzarSiguienteNotaPendiente();
      }
    });

    // Boton "Mejorable" - mostrar campo de comentario
    btnMejorable?.addEventListener('click', () => {
      if (comentarioDiv) {
        comentarioDiv.style.display = 'block';
        textarea?.focus();
      }
    });

    // Boton "Enviar comentario"
    btnEnviar?.addEventListener('click', async () => {
      const comentario = textarea?.value.trim() || null;
      const exito = await this.registrarEvaluacion(
        nota.nota_id,
        nota.version,
        'down',
        comentario,
        pasajeId
      );

      if (exito) {
        // Actualizar contador local inmediatamente
        if (typeof actualizarContadorLocal === 'function') {
          actualizarContadorLocal(nota.nota_id, 'down');
        }
        this.marcarNotaComoEvaluada(nota.nota_id);
        this.avanzarSiguienteNotaPendiente();
      }
    });

    // Boton "Cancelar"
    btnCancelar?.addEventListener('click', () => {
      if (comentarioDiv) {
        comentarioDiv.style.display = 'none';
        if (textarea) textarea.value = '';
      }
    });
  }

  /**
   * Marcar nota como evaluada
   */
  marcarNotaComoEvaluada(notaId) {
    this.notasEvaluadas.add(notaId);
    this.actualizarContadores();
    
    // Re-renderizar la nota actual para mostrar estado evaluado
    const nota = this.notasPasaje.find(n => n.nota_id === notaId);
    if (nota) {
      this.renderizarNotaActual(nota);
    }

    mostrarToast('Evaluacion guardada', 2000);
  }

  /**
   * Avanzar a la siguiente nota pendiente de evaluar
   */
  avanzarSiguienteNotaPendiente() {
    // Buscar siguiente nota no evaluada
    for (let i = this.notaActualIndex + 1; i < this.notasPasaje.length; i++) {
      if (!this.notasEvaluadas.has(this.notasPasaje[i].nota_id)) {
        setTimeout(() => this.navegarANota(i), 500);
        return;
      }
    }

    // Si no hay mas, buscar desde el principio
    for (let i = 0; i < this.notaActualIndex; i++) {
      if (!this.notasEvaluadas.has(this.notasPasaje[i].nota_id)) {
        setTimeout(() => this.navegarANota(i), 500);
        return;
      }
    }

    // Todas evaluadas
    if (this.notasEvaluadas.size === this.notasPasaje.length) {
      setTimeout(() => {
        mostrarToast('Pasaje completado!', 3000);
      }, 600);
    }
  }

  /**
   * Actualizar contadores de notas
   */
  actualizarContadores() {
    const total = this.notasPasaje.length;
    const evaluadas = this.notasEvaluadas.size;

    document.getElementById('notas-totales').textContent = total;
    document.getElementById('notas-evaluadas').textContent = evaluadas;
    document.getElementById('notas-pasaje-total').textContent = total;
    
    if (this.notaActualIndex >= 0) {
      document.getElementById('nota-actual-index').textContent = this.notaActualIndex + 1;
    } else {
      document.getElementById('nota-actual-index').textContent = '0';
    }
  }

  /**
   * Actualizar estado de botones de navegacion
   */
  actualizarBotonesNavegacion() {
    const btnAnterior = document.getElementById('btn-nota-anterior');
    const btnSiguiente = document.getElementById('btn-nota-siguiente');

    if (btnAnterior) {
      btnAnterior.disabled = this.notaActualIndex <= 0;
    }
    if (btnSiguiente) {
      btnSiguiente.disabled = this.notaActualIndex >= this.notasPasaje.length - 1;
    }
  }

  /**
   * Registrar evaluacion en Supabase
   */
  async registrarEvaluacion(notaId, version, vote, comentario, pasajeId) {
      // Verificar modo de usuario
      if (!window.userManager.tieneModoDefinido()) {
        await window.modalModo.mostrar();
      }

      const datosUsuario = window.userManager.obtenerDatosUsuario();
      
      if (!datosUsuario) {
        console.error('No se pudo obtener datos de usuario');
        mostrarToast('Error: modo no definido', 3000);
        return false;
      }

      // La sesión ya está creada en BD (se creó al elegir modo)
      const evaluacion = {
        timestamp: new Date().toISOString(),
        source: 'laboratorio',
        event_type: 'nota_eval',
        session_id: datosUsuario.session_id,
        pasaje_id: pasajeId,
        nota_id: notaId,
        nota_version: version,
        vote: vote,
        comment: comentario
      };

      const { error } = await window.supabaseClient
        .from('evaluaciones')
        .insert(evaluacion);

      if (error) {
        console.error('Error al registrar evaluacion:', error);
        mostrarToast('Error al enviar evaluacion', 3000);
        return false;
      }

      // NO invalidamos caché aquí - actualizamos localmente en actualizarContadorLocal()

      console.log('Evaluacion registrada:', vote, notaId);
      return true;
    }

  /**
   * Obtener etiqueta legible del tipo de nota
   */
  getTipoNotaLabel(tipo) {
    const labels = {
      lexica: 'Léxica',
      parafrasis: 'Paráfrasis',
      historica: 'Histórica',
      cultural: 'Cultural',
      metrica: 'Métrica',
      literaria: 'Literaria',
      geografica: 'Geográfica',
      mitologica: 'Mitológica',
      escenica: 'Escénica',
      ecdotica: 'Ecdótica',
      realia: 'Realia',
    };
    return labels[tipo] || tipo;
  }

  /**
   * Configurar event listeners de controles
   */
  setupEventListeners() {
    // Navegacion de notas
    document.getElementById('btn-nota-anterior')?.addEventListener('click', () => {
      if (this.notaActualIndex > 0) {
        this.navegarANota(this.notaActualIndex - 1);
      }
    });

    document.getElementById('btn-nota-siguiente')?.addEventListener('click', () => {
      if (this.notaActualIndex < this.notasPasaje.length - 1) {
        this.navegarANota(this.notaActualIndex + 1);
      } else if (this.notaActualIndex === -1 && this.notasPasaje.length > 0) {
        // Si no hay nota seleccionada, ir a la primera
        this.navegarANota(0);
      }
    });

    // Navegacion de pasajes
    document.getElementById('btn-siguiente')?.addEventListener('click', () => {
      this.siguientePasaje();
    });

    document.getElementById('btn-saltar')?.addEventListener('click', () => {
      if (confirm('Seguro que quieres saltar este pasaje sin evaluar todas las notas?')) {
        this.siguientePasaje();
      }
    });

    // Actualizar botones iniciales
    this.actualizarBotonesNavegacion();
  }

  /**
   * Ir al siguiente pasaje
   */
  siguientePasaje() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cargarPasaje(this.pasajeActualIndex + 1);
  }

  /**
   * Mostrar pantalla de finalizacion
   */
  mostrarFinalizacion() {
    const layout = document.querySelector('.laboratorio-layout');
    layout.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 3rem; color: var(--success); margin-bottom: 20px;">Felicidades!</h1>
        <p style="font-size: 1.5rem; color: var(--muted); margin-bottom: 30px;">
          Has completado todos los pasajes disponibles
        </p>
        <p style="font-size: 1.2rem; color: var(--muted-2); margin-bottom: 40px;">
          Gracias por tu contribucion al proyecto
        </p>
        <a href="../index.html" class="btn" style="font-size: 1.2rem; padding: 15px 40px;">
          Volver al inicio
        </a>
      </div>
    `;

    mostrarToast('Has completado todos los pasajes', 4000);
  }
}

// Inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', async () => {
  window.editorSocial = new EditorSocial();
  await window.editorSocial.init();
});

console.log('Editor Social cargado');
