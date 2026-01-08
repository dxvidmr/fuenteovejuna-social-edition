// ============================================
// EDITOR SOCIAL (JUEGO DE EVALUACIÓN)
// ============================================

class EditorSocial {
  constructor() {
    this.pasajeActualIndex = 0;
    this.pasajes = [];
    this.xmlDoc = null;
    this.notasEvaluadasEnPasaje = new Set();
  }

  /**
   * Carga dinámica de CETEI.js si no está disponible.
   * (Evita depender del orden de scripts en el HTML.)
   */
  async asegurarCETEI() {
    if (typeof window.CETEI !== 'undefined') return true;

    // Si ya se está cargando en paralelo
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
      throw new Error('CETEI.js no está cargado y no se pudo cargar dinámicamente.');
    }

    // Cargar primer pasaje
    await this.cargarPasaje(0);

    // Event listeners para controles
    this.setupEventListeners();

    console.log('✓ Editor Social inicializado');
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
      alert('Error al cargar pasajes. Verifica tu conexión.');
      return;
    }

    this.pasajes = data ?? [];
    document.getElementById('pasajes-totales').textContent = this.pasajes.length;
    console.log(`✓ ${this.pasajes.length} pasajes cargados`);
  }

  /**
   * Cargar un pasaje específico
   */
  async cargarPasaje(index) {
    if (index < 0 || index >= this.pasajes.length) {
      console.log('Fin de pasajes alcanzado');
      this.mostrarFinalizacion();
      return;
    }

    this.pasajeActualIndex = index;
    this.notasEvaluadasEnPasaje.clear();

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

    // Cargar y renderizar notas
    await this.cargarNotasPasaje(fragmento, pasaje);
  }

  /**
   * Renderizar pasaje con CETEI
   */
  async renderizarPasaje(fragmento, pasaje) {
    const pasajeContainer = document.getElementById('pasaje-content');
    pasajeContainer.innerHTML = '';

    // Añadir título del pasaje
    const titulo = document.createElement('h2');
    titulo.textContent = pasaje.titulo;
    titulo.style.cssText =
      'margin-bottom: 10px; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;';
    pasajeContainer.appendChild(titulo);

    // Añadir descripción si existe
    if (pasaje.descripcion) {
      const descripcion = document.createElement('p');
      descripcion.textContent = pasaje.descripcion;
      descripcion.style.cssText =
        'margin-bottom: 20px; color: #666; font-style: italic; line-height: 1.6;';
      pasajeContainer.appendChild(descripcion);
    }

    // Asegurar CETEI (por si alguien llama a cargarPasaje directamente)
    const okCetei = await this.asegurarCETEI();
    if (!okCetei || typeof window.CETEI === 'undefined') {
      throw new Error('CETEI.js no está cargado. Añade <script src="../assets/js/CETEI.js"></script> antes de editor-social.js');
    }

    // Crear documento temporal para CETEI (necesita un Document completo, no solo un Node)
    const xmlStr = new XMLSerializer().serializeToString(fragmento);
    const parser = new DOMParser();
    const tempDoc = parser.parseFromString(xmlStr, 'text/xml');

    // Renderizar XML con CETEI (constructor global CETEI)
    const cetei = new window.CETEI();
    const htmlContent = cetei.domToHTML5(tempDoc);

    // Crear contenedor para el contenido TEI
    const teiContainer = document.createElement('div');
    teiContainer.style.cssText = `
      font-family: 'Google Sans Code', 'Oxygen Mono', 'Source Code Pro', monospace;
      font-weight: 300;
      line-height: 1.8;
      font-size: 16px;
    `;
    teiContainer.appendChild(htmlContent);

    pasajeContainer.appendChild(teiContainer);

    // Aplicar alineación de versos partidos usando función compartida
    setTimeout(() => alignSplitVerses(pasajeContainer), 100);

    console.log('✓ Pasaje renderizado:', pasaje.titulo);
  }

  /**
   * Cargar notas del pasaje actual
   */
  async cargarNotasPasaje(fragmento, pasaje) {
    // Obtener xml:ids del fragmento
    const xmlIds = extraerXmlIdsDelFragmento(fragmento);

    // Cargar todas las notas activas
    const todasNotas = await cargarNotasActivas();

    // Filtrar notas que aplican a este pasaje
    const notasPasaje = filtrarNotasPorXmlIds(todasNotas, xmlIds);

    console.log(`✓ ${notasPasaje.length} notas para el pasaje ${pasaje.titulo}`);

    // Renderizar notas
    this.renderizarNotas(notasPasaje, pasaje.id);
  }

  /**
   * Renderizar lista de notas con botones de evaluación
   */
  renderizarNotas(notas, pasajeId) {
    const notasList = document.getElementById('notas-list');
    notasList.innerHTML = '';

    if (!notas || notas.length === 0) {
      notasList.innerHTML = '<p style="text-align: center; color: #666;">No hay notas en este pasaje</p>';
      return;
    }

    notas.forEach((nota) => {
      const notaDiv = document.createElement('div');
      notaDiv.className = 'nota';
      notaDiv.dataset.notaId = nota.nota_id;

      notaDiv.innerHTML = `
        <div class="nota-tipo">${this.getTipoNotaLabel(nota.type)}</div>
        <div class="nota-texto">${nota.texto_nota}</div>
        <div class="nota-acciones">
          <button class="btn-util" data-nota-id="${nota.nota_id}" data-version="${nota.version}">
            Útil
          </button>
          <button class="btn-mejorable" data-nota-id="${nota.nota_id}" data-version="${nota.version}">
            Mejorable
          </button>
        </div>
        <div class="nota-comentario" style="display:none; margin-top: 12px;">
          <textarea placeholder="¿Por qué crees que es mejorable? (opcional)" rows="2"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 13px;"></textarea>
          <div style="margin-top: 8px;">
            <button class="btn-enviar-comentario" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px;">Enviar</button>
            <button class="btn-cancelar-comentario" style="padding: 6px 12px; background: #eee; color: #333; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
          </div>
        </div>
      `;

      notasList.appendChild(notaDiv);

      // Adjuntar event listeners
      this.attachNotaListeners(notaDiv, nota, pasajeId);
    });
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
    };
    return labels[tipo] || tipo;
  }

  /**
   * Adjuntar listeners a una nota
   */
  attachNotaListeners(notaDiv, nota, pasajeId) {
    const btnUtil = notaDiv.querySelector('.btn-util');
    const btnMejorable = notaDiv.querySelector('.btn-mejorable');
    const comentarioDiv = notaDiv.querySelector('.nota-comentario');
    const textarea = comentarioDiv.querySelector('textarea');
    const btnEnviar = comentarioDiv.querySelector('.btn-enviar-comentario');
    const btnCancelar = comentarioDiv.querySelector('.btn-cancelar-comentario');

    // Botón "Útil"
    btnUtil.addEventListener('click', async () => {
      const exito = await this.registrarEvaluacion(
        nota.nota_id,
        nota.version,
        'up',
        null,
        pasajeId
      );

      if (exito) {
        this.marcarNotaVotada(notaDiv, btnUtil, 'up');
      }
    });

    // Botón "Mejorable" - mostrar campo de comentario
    btnMejorable.addEventListener('click', () => {
      comentarioDiv.style.display = 'block';
      textarea.focus();
    });

    // Botón "Enviar comentario"
    btnEnviar.addEventListener('click', async () => {
      const comentario = textarea.value.trim() || null;
      const exito = await this.registrarEvaluacion(
        nota.nota_id,
        nota.version,
        'down',
        comentario,
        pasajeId
      );

      if (exito) {
        this.marcarNotaVotada(notaDiv, btnMejorable, 'down');
      }
    });

    // Botón "Cancelar"
    btnCancelar.addEventListener('click', () => {
      comentarioDiv.style.display = 'none';
      textarea.value = '';
    });
  }

  /**
   * Registrar evaluación en Supabase
   */
  async registrarEvaluacion(notaId, version, vote, comentario, pasajeId) {
    // Verificar modo de usuario (por si acaso)
    if (!window.userManager.tieneModoDefinido()) {
      await window.modalModo.mostrar();
    }

    const datosUsuario = window.userManager.obtenerDatosUsuario();

    const evaluacion = {
      timestamp: new Date().toISOString(),
      source: 'editor-social',
      event_type: 'nota_eval',
      session_id: datosUsuario.session_id,
      pasaje_id: pasajeId,
      nota_id: notaId,
      nota_version: version,
      vote: vote,
      comment: comentario,
    };

    const { error } = await window.supabaseClient
      .from('evaluaciones')
      .insert(evaluacion);

    if (error) {
      console.error('Error al registrar evaluación:', error);
      mostrarToast('Error al enviar evaluación', 3000);
      return false;
    }

    console.log('✓ Evaluación registrada:', vote, notaId);
    this.notasEvaluadasEnPasaje.add(notaId);
    return true;
  }

  /**
   * Marcar nota como votada visualmente
   */
  marcarNotaVotada(notaDiv, boton, voto) {
    const botonesDiv = notaDiv.querySelector('.nota-acciones');
    const comentarioDiv = notaDiv.querySelector('.nota-comentario');

    // Deshabilitar botones
    const botones = botonesDiv.querySelectorAll('button');
    botones.forEach((btn) => (btn.disabled = true));

    // Añadir clase 'votado' al botón presionado
    boton.classList.add('votado');
    boton.textContent = '✓ Votado';

    // Ocultar campo de comentario si está visible
    comentarioDiv.style.display = 'none';

    // Toast
    mostrarToast(voto === 'up' ? 'Nota marcada como útil' : 'Gracias por tu feedback', 2000);
  }

  /**
   * Configurar event listeners de controles
   */
  setupEventListeners() {
    // Botón "Siguiente"
    document.getElementById('btn-siguiente').addEventListener('click', () => {
      this.siguientePasaje();
    });

    // Botón "Saltar"
    document.getElementById('btn-saltar').addEventListener('click', () => {
      if (confirm('¿Seguro que quieres saltar este pasaje sin evaluar?')) {
        this.siguientePasaje();
      }
    });
  }

  /**
   * Ir al siguiente pasaje
   */
  siguientePasaje() {
    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargar siguiente pasaje
    this.cargarPasaje(this.pasajeActualIndex + 1);
  }

  /**
   * Mostrar pantalla de finalización
   */
  mostrarFinalizacion() {
    const container = document.querySelector('.editor-social-container');
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h1 style="font-size: 3rem; color: #4caf50; margin-bottom: 20px;">¡Felicidades!</h1>
        <p style="font-size: 1.5rem; color: #666; margin-bottom: 30px;">
          Has completado todos los pasajes disponibles
        </p>
        <p style="font-size: 1.2rem; color: #999; margin-bottom: 40px;">
          Gracias por tu contribución al proyecto
        </p>
        <a href="../index.html" class="btn" style="font-size: 1.2rem; padding: 15px 40px;">
          Volver al inicio
        </a>
      </div>
    `;

    mostrarToast('Has completado todos los pasajes', 4000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  window.editorSocial = new EditorSocial();
  await window.editorSocial.init();
});

console.log('✓ Editor Social cargado');
