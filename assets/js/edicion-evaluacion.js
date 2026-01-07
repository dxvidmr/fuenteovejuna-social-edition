// ============================================
// SISTEMA DE EVALUACIÓN EN EDICIÓN
// ============================================

class EdicionEvaluacion {
  constructor() {
    this.notasEvaluadas = new Set(); // Para evitar duplicados
  }
  
  /**
   * Inicializar sistema de evaluación
   * Llamar DESPUÉS de que processNotes() haya terminado
   */
  init() {
    console.log('Inicializando sistema de evaluación en edición...');
    
    // Esperar a que las notas estén renderizadas
    const checkNotas = setInterval(() => {
      const noteContentDiv = document.getElementById('noteContent');
      if (noteContentDiv) {
        this.setupEvaluationListeners();
        clearInterval(checkNotas);
      }
    }, 100);
  }
  
  /**
   * Configurar listeners para evaluación cuando se muestra una nota
   */
  setupEvaluationListeners() {
    const noteContentDiv = document.getElementById('noteContent');
    
    // Usar MutationObserver para detectar cuando cambia el contenido de la nota
    const observer = new MutationObserver(() => {
      this.addEvaluationButtons();
    });
    
    observer.observe(noteContentDiv, {
      childList: true,
      subtree: true
    });
    
    console.log('✓ Listeners de evaluación configurados');
  }
  
  /**
   * Añadir botones de evaluación a la nota actual
   */
  addEvaluationButtons() {
    const noteContentDiv = document.getElementById('noteContent');
    if (!noteContentDiv) return;
    
    // Buscar el ID de la nota actual en el contenido
    const noteIdMatch = noteContentDiv.innerHTML.match(/ID:\s*([^\s<]+)/);
    if (!noteIdMatch) return;
    
    const notaId = noteIdMatch[1];
    
    // Evitar añadir botones duplicados
    if (noteContentDiv.querySelector('.nota-evaluacion')) return;
    if (this.notasEvaluadas.has(notaId)) return;
    
    // Obtener versión de la nota desde Supabase
    this.obtenerVersionNota(notaId).then(version => {
      if (!version) return;
      
      // Crear contenedor de evaluación
      const evaluacionDiv = document.createElement('div');
      evaluacionDiv.className = 'nota-evaluacion';
      evaluacionDiv.innerHTML = `
        <div class="evaluacion-header">
          <span>¿Te resulta útil esta nota?</span>
        </div>
        <div class="evaluacion-botones">
          <button class="btn-evaluar btn-util" data-nota-id="${notaId}" data-version="${version}">
            👍 Útil
          </button>
          <button class="btn-evaluar btn-mejorable" data-nota-id="${notaId}" data-version="${version}">
            👎 Mejorable
          </button>
        </div>
        <div class="evaluacion-comentario" style="display:none;">
          <textarea placeholder="¿Por qué crees que es mejorable? (opcional)" rows="2"></textarea>
          <button class="btn-enviar-comentario">Enviar</button>
          <button class="btn-cancelar-comentario">Cancelar</button>
        </div>
      `;
      
      // Insertar antes del footer de la nota
      const noteFooter = noteContentDiv.querySelector('.note-footer');
      if (noteFooter) {
        noteFooter.parentNode.insertBefore(evaluacionDiv, noteFooter);
      } else {
        noteContentDiv.appendChild(evaluacionDiv);
      }
      
      // Añadir event listeners
      this.attachButtonListeners(evaluacionDiv, notaId, version);
      
      this.notasEvaluadas.add(notaId);
    });
  }
  
  /**
   * Obtener versión de nota desde Supabase
   */
  async obtenerVersionNota(notaId) {
    try {
      const { data, error } = await window.supabaseClient
        .from('notas_activas')
        .select('version')
        .eq('nota_id', notaId)
        .single();
      
      if (error) {
        console.warn(`Nota ${notaId} no encontrada en Supabase`);
        return null;
      }
      
      return data.version;
    } catch (err) {
      console.error('Error al obtener versión de nota:', err);
      return null;
    }
  }
  
  /**
   * Adjuntar listeners a botones de evaluación
   */
  attachButtonListeners(container, notaId, version) {
    const btnUtil = container.querySelector('.btn-util');
    const btnMejorable = container.querySelector('.btn-mejorable');
    const comentarioDiv = container.querySelector('.evaluacion-comentario');
    const textarea = comentarioDiv.querySelector('textarea');
    const btnEnviar = comentarioDiv.querySelector('.btn-enviar-comentario');
    const btnCancelar = comentarioDiv.querySelector('.btn-cancelar-comentario');
    
    // Botón "Útil"
    btnUtil.addEventListener('click', async () => {
      const exito = await this.registrarEvaluacion(notaId, version, 'up', null);
      if (exito) {
        this.mostrarFeedback(container, 'up');
      }
    });
    
    // Botón "Mejorable" - mostrar textarea
    btnMejorable.addEventListener('click', () => {
      comentarioDiv.style.display = 'block';
      textarea.focus();
    });
    
    // Botón "Enviar comentario"
    btnEnviar.addEventListener('click', async () => {
      const comentario = textarea.value.trim() || null;
      const exito = await this.registrarEvaluacion(notaId, version, 'down', comentario);
      if (exito) {
        this.mostrarFeedback(container, 'down');
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
  async registrarEvaluacion(notaId, version, vote, comentario) {
    // Verificar modo de usuario
    if (!window.userManager.tieneModoDefinido()) {
      await window.modalModo.mostrar();
    }
    
    const datosUsuario = window.userManager.obtenerDatosUsuario();
    
    const evaluacion = {
      timestamp: new Date().toISOString(),
      source: 'edicion',
      event_type: 'nota_eval',
      session_id: datosUsuario.session_id,
      pasaje_id: null, // En edición completa no hay pasaje específico
      nota_id: notaId,
      nota_version: version,
      vote: vote,
      comment: comentario
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
    return true;
  }
  
  /**
   * Mostrar feedback visual tras evaluación
   */
  mostrarFeedback(container, vote) {
    const botones = container.querySelector('.evaluacion-botones');
    const comentario = container.querySelector('.evaluacion-comentario');
    
    // Ocultar botones y comentario
    botones.style.display = 'none';
    comentario.style.display = 'none';
    
    // Crear mensaje de confirmación
    const feedback = document.createElement('div');
    feedback.className = 'evaluacion-feedback';
    feedback.innerHTML = vote === 'up' 
      ? '✓ Gracias por tu evaluación' 
      : '✓ Gracias por tu comentario';
    
    container.appendChild(feedback);
    
    // Toast adicional
    mostrarToast(vote === 'up' ? 'Nota marcada como útil' : 'Gracias por tu feedback', 2000);
  }
}

// Instanciar y exportar
window.edicionEvaluacion = new EdicionEvaluacion();

console.log('✓ EdicionEvaluacion cargado');
