// ============================================
// MODAL DE SELECCIÓN DE MODO
// ============================================

class ModalModo {
  constructor() {
    this.modalHTML = `
      <div id="modal-modo" class="modal" style="display:none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <h2>¿Cómo quieres participar?</h2>
          <p class="modal-descripcion">
            Puedes evaluar las notas de esta edición. Tu participación ayuda a mejorar 
            las explicaciones para futuros lectores.
          </p>
          
          <!-- Opciones de modo -->
          <div class="modo-opciones">
            
            <!-- Opción 1: Anónimo -->
            <div class="modo-opcion" data-modo="anonimo">
              <div class="modo-header">
                <span class="modo-icono">🕶️</span>
                <h3>Rápido y anónimo</h3>
              </div>
              <p>Sin formularios. Click directo en 👍/👎</p>
              <button class="btn-seleccionar" data-modo="anonimo">Participar anónimamente</button>
            </div>
            
            <!-- Opción 2: Lector -->
            <div class="modo-opcion" data-modo="lector">
              <div class="modo-header">
                <span class="modo-icono">📚</span>
                <h3>Como lector/a</h3>
              </div>
              <p>Solo 2 datos: nivel de estudios y disciplina</p>
              <button class="btn-seleccionar" data-modo="lector">Continuar como lector/a</button>
            </div>
            
            <!-- Opción 3: Colaborador -->
            <div class="modo-opcion" data-modo="colaborador">
              <div class="modo-header">
                <span class="modo-icono">✍️</span>
                <h3>Colaborar en la edición</h3>
              </div>
              <p>Email + nombre opcional. Contribuciones reconocidas.</p>
              <button class="btn-seleccionar" data-modo="colaborador">Registrarme como colaborador/a</button>
            </div>
            
          </div>
          
          <!-- Formulario modo lector (oculto inicialmente) -->
          <div id="form-lector" class="modo-form" style="display:none;">
            <h3>Información de lector/a</h3>
            <form id="form-lector-datos">
              <label>
                Nivel de estudios:
                <select name="nivel_estudios" required>
                  <option value="">Selecciona...</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="grado">Grado universitario</option>
                  <option value="posgrado">Máster/Posgrado</option>
                  <option value="doctorado">Doctorado</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              
              <label>
                Disciplina:
                <select name="disciplina" required>
                  <option value="">Selecciona...</option>
                  <option value="filologia">Filología/Lengua/Literatura</option>
                  <option value="historia">Historia</option>
                  <option value="educacion">Educación</option>
                  <option value="arte">Arte/Teatro</option>
                  <option value="otro">Otra</option>
                </select>
              </label>
              
              <button type="submit" class="btn-enviar">Confirmar</button>
              <button type="button" class="btn-volver">← Volver</button>
            </form>
          </div>
          
          <!-- Formulario modo colaborador (oculto inicialmente) -->
          <div id="form-colaborador" class="modo-form" style="display:none;">
            <h3>Registro de colaborador/a</h3>
            <form id="form-colaborador-datos">
              <label>
                Email:
                <input type="email" name="email" required placeholder="tu@email.com">
                <small>Se guardará hasheado (SHA-256) para privacidad</small>
              </label>
              
              <label>
                Nombre a mostrar (opcional):
                <input type="text" name="display_name" placeholder="María G.">
              </label>
              
              <label>
                Nivel de estudios:
                <select name="nivel_estudios" required>
                  <option value="">Selecciona...</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="grado">Grado universitario</option>
                  <option value="posgrado">Máster/Posgrado</option>
                  <option value="doctorado">Doctorado</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              
              <label>
                Disciplina:
                <select name="disciplina" required>
                  <option value="">Selecciona...</option>
                  <option value="filologia">Filología/Lengua/Literatura</option>
                  <option value="historia">Historia</option>
                  <option value="educacion">Educación</option>
                  <option value="arte">Arte/Teatro</option>
                  <option value="otro">Otra</option>
                </select>
              </label>
              
              <button type="submit" class="btn-enviar">Registrarme</button>
              <button type="button" class="btn-volver">← Volver</button>
            </form>
          </div>
          
        </div>
      </div>
    `;
    
    this.init();
  }
  
  init() {
    // Inyectar HTML en el DOM
    const container = document.getElementById('modal-container') || document.body;
    container.insertAdjacentHTML('beforeend', this.modalHTML);
    
    this.modal = document.getElementById('modal-modo');
    this.opciones = document.querySelector('.modo-opciones');
    this.formLector = document.getElementById('form-lector');
    this.formColaborador = document.getElementById('form-colaborador');
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    // Botones de selección de modo
    document.querySelectorAll('.btn-seleccionar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modo = e.target.dataset.modo;
        this.seleccionarModo(modo);
      });
    });
    
    // Form lector
    document.getElementById('form-lector-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormLector(e.target);
    });
    
    // Form colaborador
    document.getElementById('form-colaborador-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormColaborador(e.target);
    });
    
    // Botones volver
    document.querySelectorAll('.btn-volver').forEach(btn => {
      btn.addEventListener('click', () => this.volverOpciones());
    });
    
    // Cerrar con overlay (opcional, comentado por defecto)
    // document.querySelector('.modal-overlay').addEventListener('click', () => {
    //   this.cerrar();
    // });
  }
  
  async seleccionarModo(modo) {
    if (modo === 'anonimo') {
      // Modo anónimo: guardar directamente y crear sesión en Supabase
      await this.crearSesion('anonimo');
      this.cerrar();
      mostrarToast('Modo anónimo activado');
      
    } else if (modo === 'lector') {
      // Mostrar formulario de lector
      this.opciones.style.display = 'none';
      this.formLector.style.display = 'block';
      
    } else if (modo === 'colaborador') {
      // Mostrar formulario de colaborador
      this.opciones.style.display = 'none';
      this.formColaborador.style.display = 'block';
    }
  }
  
  async procesarFormLector(form) {
    const formData = new FormData(form);
    const datosAdicionales = {
      nivel_estudios: formData.get('nivel_estudios'),
      disciplina: formData.get('disciplina')
    };
    
    await this.crearSesion('lector', datosAdicionales);
    this.cerrar();
    mostrarToast('Modo lector activado');
  }
  
  async procesarFormColaborador(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const displayName = formData.get('display_name') || null;
    const nivelEstudios = formData.get('nivel_estudios');
    const disciplina = formData.get('disciplina');
    
    try {
      // 1. Hash del email
      const emailHash = await hashEmail(email);
      
      // 2. Buscar o crear colaborador en Supabase
      let { data: colaborador, error } = await window.supabaseClient
        .from('colaboradores')
        .select('collaborator_id')
        .eq('email_hash', emailHash)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No existe, crear nuevo colaborador
        const { data: nuevoColaborador, error: errorInsert } = await window.supabaseClient
          .from('colaboradores')
          .insert({
            email_hash: emailHash,
            display_name: displayName,
            nivel_estudios: nivelEstudios,
            disciplina: disciplina
          })
          .select()
          .single();
        
        if (errorInsert) throw errorInsert;
        colaborador = nuevoColaborador;
      }
      
      // 3. Crear sesión vinculada al colaborador
      await this.crearSesion('colaborador', {
        collaborator_id: colaborador.collaborator_id
      });
      
      this.cerrar();
      mostrarToast(`Bienvenido/a ${displayName || 'colaborador/a'}!`);
      
    } catch (error) {
      console.error('Error al procesar colaborador:', error);
      alert('Error al registrar. Por favor intenta de nuevo.');
    }
  }
  
  async crearSesion(modo, datosAdicionales = {}) {
    // Guardar en localStorage
    const datosUsuario = window.userManager.guardarModo(modo, datosAdicionales);
    
    // Crear sesión en Supabase
    const sesionData = {
      session_id: datosUsuario.session_id,
      modo: modo
    };
    
    // Añadir campos según modo
    if (modo === 'lector') {
      sesionData.nivel_estudios = datosAdicionales.nivel_estudios;
      sesionData.disciplina = datosAdicionales.disciplina;
    } else if (modo === 'colaborador') {
      sesionData.collaborator_id = datosAdicionales.collaborator_id;
    }
    
    const { error } = await window.supabaseClient
      .from('sesiones')
      .insert(sesionData);
    
    if (error) {
      console.error('Error al crear sesión:', error);
    } else {
      console.log('✓ Sesión creada en Supabase');
    }
  }
  
  volverOpciones() {
    this.formLector.style.display = 'none';
    this.formColaborador.style.display = 'none';
    this.opciones.style.display = 'grid';
  }
  
  mostrar(permitirCambio = false) {
    return new Promise((resolve) => {
      this.modal.style.display = 'flex';
      
      // Si ya tiene modo y no se permite cambio, cerrar inmediatamente
      if (!permitirCambio && window.userManager.tieneModoDefinido()) {
        this.cerrar();
        resolve();
        return;
      }
      
      // Callback cuando se cierra
      this.onClose = resolve;
    });
  }
  
  cerrar() {
    this.modal.style.display = 'none';
    if (this.onClose) this.onClose();
  }
}

// Instancia global
document.addEventListener('DOMContentLoaded', () => {
  window.modalModo = new ModalModo();
  console.log('✓ ModalModo inicializado');
});
