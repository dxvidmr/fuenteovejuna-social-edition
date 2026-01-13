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
                <span class="modo-icono"><i class="fa-solid fa-user-secret" aria-hidden="true"></i></span>
                <h3>Anónimo</h3>
              </div>
              <p>Sin formularios ni preguntas.</i></p>
              <button class="btn-seleccionar" data-modo="anonimo">Participar anónimamente</button>
            </div>
            
            <!-- Opción 2: Lector -->
            <div class="modo-opcion" data-modo="lector">
              <div class="modo-header">
                <span class="modo-icono"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span>
                <h3>Lector ocasional</h3>
              </div>
              <p>Solo te pediremos un par de datos demográficos</p>
              <button class="btn-seleccionar" data-modo="lector">Continuar como lector/a</button>
            </div>
            
            <!-- Opción 3: Colaborador -->
            <div class="modo-opcion" data-modo="colaborador">
              <div class="modo-header">
                <span class="modo-icono"><i class="fa-solid fa-pen" aria-hidden="true"></i></span>
                <h3>Colaborador reconocido</h3>
              </div>
              <p>Registro con email. Contribuciones reconocidas.</p>
              <button class="btn-seleccionar" data-modo="colaborador">Continuar como colaborador/a</button>
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
              <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
            </form>
          </div>
          
          <!-- Selección: Registro o Login colaborador -->
          <div id="colaborador-opciones" class="modo-form" style="display:none;">
            <h3>Colaborador/a</h3>
            <div class="colaborador-opciones-grid">
              <div class="opcion-colaborador" data-tipo="registro">
                <span class="opcion-icono"><i class="fa-solid fa-star" aria-hidden="true"></i></span>
                <h4>Registrarme</h4>
                <p>Nuevo colaborador. Completa tus datos.</p>
                <button class="btn-opcion-colaborador" data-tipo="registro">Registrarme</button>
              </div>
              <div class="opcion-colaborador" data-tipo="login">
                <span class="opcion-icono"><i class="fa-solid fa-key" aria-hidden="true"></i></span>
                <h4>Iniciar sesión</h4>
                <p>Ya estoy registrado.</p>
                <button class="btn-opcion-colaborador" data-tipo="login">Iniciar sesión</button>
              </div>
            </div>
            <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
          </div>

          <!-- Formulario registro colaborador -->
          <div id="form-colaborador-registro" class="modo-form" style="display:none;">
            <h3>Registro de colaborador/a</h3>
            <form id="form-colaborador-registro-datos">
              <label>
                Email:
                <input type="email" name="email" required placeholder="tu@email.com">
                <small>Se guardará hasheado (SHA-256) para privacidad. No se almacenará el email real.</small>
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
              <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
            </form>
          </div>

          <!-- Formulario login colaborador -->
          <div id="form-colaborador-login" class="modo-form" style="display:none;">
            <h3>Iniciar sesión como colaborador/a</h3>
            <form id="form-colaborador-login-datos">
              <label>
                Email:
                <input type="email" name="email" required placeholder="tu@email.com">
                <small>Introduce el email con el que te registraste.</small>
              </label>
              
              <button type="submit" class="btn-enviar">Iniciar sesión</button>
              <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
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
    this.colaboradorOpciones = document.getElementById('colaborador-opciones');
    this.formColaboradorRegistro = document.getElementById('form-colaborador-registro');
    this.formColaboradorLogin = document.getElementById('form-colaborador-login');
    
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
    
    // Opciones colaborador (registro/login)
    document.querySelectorAll('.btn-opcion-colaborador').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tipo = e.target.dataset.tipo;
        this.mostrarFormColaborador(tipo);
      });
    });

    // Form colaborador registro
    document.getElementById('form-colaborador-registro-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormColaboradorRegistro(e.target);
    });

    // Form colaborador login
    document.getElementById('form-colaborador-login-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormColaboradorLogin(e.target);
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
      // Modo anónimo: guardar intención, sesión se creará en primera evaluación
      window.userManager.marcarModoSeleccionado('anonimo');
      this.cerrar();
      mostrarToast('Modo anónimo activado');
      
    } else if (modo === 'lector') {
      // Verificar si ya tiene datos demográficos
      await this.verificarLectorExistente();
      
    } else if (modo === 'colaborador') {
      // Mostrar opciones de colaborador (registro/login)
      this.opciones.style.display = 'none';
      this.colaboradorOpciones.style.display = 'block';
    }
  }
  
  async procesarFormLector(form) {
    const formData = new FormData(form);
    const nivelEstudios = formData.get('nivel_estudios');
    const disciplina = formData.get('disciplina');
    
    try {
      // 1. Obtener o crear lector_id persistente
      const lectorId = window.userManager.obtenerOCrearLectorId();
      
      // 2. Crear o actualizar lector en BD
      const { error: errorLector } = await window.supabaseClient
        .from('lectores')
        .upsert({
          lector_id: lectorId,
          nivel_estudios: nivelEstudios,
          disciplina: disciplina,
          perfil_completado: true,
          updated_at: new Date().toISOString()
        });
      
      if (errorLector) throw errorLector;
      
      // 3. Marcar modo seleccionado (sesión se creará en primera evaluación)
      window.userManager.marcarModoSeleccionado('lector', { lector_id: lectorId });
      this.cerrar();
      mostrarToast('Modo lector activado');
      
    } catch (error) {
      console.error('Error al procesar lector:', error);
      alert('Error al guardar. Por favor intenta de nuevo.');
    }
  }
  
  async verificarLectorExistente() {
    const lectorIdLocal = localStorage.getItem('fuenteovejuna_lector_id');
    
    if (lectorIdLocal) {
      // Verificar si este lector_id tiene perfil completado en BD
      const { data: lector } = await window.supabaseClient
        .from('lectores')
        .select('nivel_estudios, disciplina, perfil_completado')
        .eq('lector_id', lectorIdLocal)
        .single();
      
      if (lector && lector.perfil_completado) {
        // Ya tiene datos, mostrar opciones
        this.opciones.style.display = 'none';
        this.mostrarOpcionesLectorExistente(lector);
        return;
      }
    }
    
    // No tiene datos, mostrar formulario normal
    this.opciones.style.display = 'none';
    this.formLector.style.display = 'block';
  }

  mostrarOpcionesLectorExistente(lector) {
    // Crear panel de opciones para lector existente
    let lectorOpcionesDiv = document.getElementById('lector-opciones-existente');
    
    if (!lectorOpcionesDiv) {
      lectorOpcionesDiv = document.createElement('div');
      lectorOpcionesDiv.id = 'lector-opciones-existente';
      lectorOpcionesDiv.className = 'modo-form';
      lectorOpcionesDiv.innerHTML = `
        <h3>Lector/a</h3>
        <div class="lector-info-previa">
          <p>Ya tenemos tus datos:</p>
          <p><strong>Nivel:</strong> <span id="lector-nivel-prev"></span></p>
          <p><strong>Disciplina:</strong> <span id="lector-disc-prev"></span></p>
        </div>
        <div class="colaborador-opciones-grid">
          <div class="opcion-colaborador">
            <h4>Soy el mismo lector</h4>
            <button class="btn-opcion-colaborador" id="btn-lector-continuar">Continuar</button>
          </div>
          <div class="opcion-colaborador">
            <h4>Soy nuevo/a</h4>
            <button class="btn-opcion-colaborador" id="btn-lector-nuevo">Registrar otros datos</button>
          </div>
        </div>
        <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
      `;
      this.modal.querySelector('.modal-content').appendChild(lectorOpcionesDiv);
      
      // Event listeners
      lectorOpcionesDiv.querySelector('#btn-lector-continuar').addEventListener('click', () => {
        this.continuarComoLectorExistente();
      });
      
      lectorOpcionesDiv.querySelector('#btn-lector-nuevo').addEventListener('click', () => {
        this.registrarNuevoLector();
      });
      
      lectorOpcionesDiv.querySelector('.btn-volver').addEventListener('click', () => {
        lectorOpcionesDiv.style.display = 'none';
        this.opciones.style.display = 'grid';
      });
    }
    
    // Actualizar datos mostrados
    lectorOpcionesDiv.querySelector('#lector-nivel-prev').textContent = lector.nivel_estudios || 'No especificado';
    lectorOpcionesDiv.querySelector('#lector-disc-prev').textContent = lector.disciplina || 'No especificada';
    lectorOpcionesDiv.style.display = 'block';
  }

  continuarComoLectorExistente() {
    // Usar el lector_id existente, crear nueva sesión
    const lectorId = localStorage.getItem('fuenteovejuna_lector_id');
    window.userManager.marcarModoSeleccionado('lector', { lector_id: lectorId });
    this.cerrar();
    mostrarToast('Bienvenido/a de nuevo');
  }

  registrarNuevoLector() {
    // Crear nuevo lector_id y mostrar formulario
    const nuevoLectorId = crypto.randomUUID();
    localStorage.setItem('fuenteovejuna_lector_id', nuevoLectorId);
    console.log('✓ Nuevo lector_id creado:', nuevoLectorId);
    
    // Ocultar opciones y mostrar formulario
    const lectorOpcionesDiv = document.getElementById('lector-opciones-existente');
    if (lectorOpcionesDiv) lectorOpcionesDiv.style.display = 'none';
    this.formLector.style.display = 'block';
  }

  mostrarFormColaborador(tipo) {
    this.colaboradorOpciones.style.display = 'none';
    if (tipo === 'registro') {
      this.formColaboradorRegistro.style.display = 'block';
    } else if (tipo === 'login') {
      this.formColaboradorLogin.style.display = 'block';
    }
  }

  async procesarFormColaboradorRegistro(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const displayName = formData.get('display_name') || null;
    const nivelEstudios = formData.get('nivel_estudios');
    const disciplina = formData.get('disciplina');
    
    try {
      // 1. Hash del email
      const emailHash = await hashEmail(email);
      
      // 2. Verificar si ya existe colaborador con ese email
      let { data: colaboradorExistente, error: errorBuscar } = await window.supabaseClient
        .from('colaboradores')
        .select('collaborator_id, lector_id')
        .eq('email_hash', emailHash)
        .single();
      
      if (colaboradorExistente) {
        alert('Este email ya está registrado. Usa "Iniciar sesión" en su lugar.');
        return;
      }
      
      // 3. Usar el lector_id que ya tiene (mantener historial de evaluaciones)
      const lectorId = window.userManager.obtenerOCrearLectorId();
      
      // 4. Actualizar/crear lector en BD con nuevos datos demográficos
      const { error: errorLector } = await window.supabaseClient
        .from('lectores')
        .upsert({
          lector_id: lectorId,
          nivel_estudios: nivelEstudios,
          disciplina: disciplina,
          perfil_completado: true,
          updated_at: new Date().toISOString()
        });
      
      if (errorLector) throw errorLector;
      
      // 5. Crear colaborador vinculado al lector existente (1:1)
      const { data: nuevoColaborador, error: errorColaborador } = await window.supabaseClient
        .from('colaboradores')
        .insert({
          email_hash: emailHash,
          display_name: displayName,
          lector_id: lectorId  // Usa el lector_id que ya tenía
        })
        .select()
        .single();
      
      if (errorColaborador) throw errorColaborador;
      
      // 6. Marcar modo seleccionado (sesión se creará en primera evaluación)
      window.userManager.marcarModoSeleccionado('colaborador', {
        lector_id: lectorId,
        collaborator_id: nuevoColaborador.collaborator_id
      });
      
      this.cerrar();
      mostrarToast(`Bienvenido/a ${displayName || 'colaborador/a'}!`);
      
    } catch (error) {
      console.error('Error al procesar colaborador:', error);
      alert('Error al registrar. Por favor intenta de nuevo.');
    }
  }

  async procesarFormColaboradorLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    
    try {
      // 1. Hash del email
      const emailHash = await hashEmail(email);
      
      // 2. Buscar colaborador existente
      const { data: colaborador, error } = await window.supabaseClient
        .from('colaboradores')
        .select('collaborator_id, lector_id, display_name')
        .eq('email_hash', emailHash)
        .single();
      
      if (error || !colaborador) {
        alert('No se encontró ningún colaborador con ese email. Por favor, regístrate primero.');
        return;
      }
      
      // 3. SIEMPRE usar el lector_id del colaborador registrado
      // Las evaluaciones futuras se vincularán a este lector_id
      // (Las evaluaciones anónimas previas de este dispositivo quedan separadas)
      localStorage.setItem('fuenteovejuna_lector_id', colaborador.lector_id);
      
      // 4. Marcar modo seleccionado (sesión se creará en primera evaluación)
      window.userManager.marcarModoSeleccionado('colaborador', {
        lector_id: colaborador.lector_id,
        collaborator_id: colaborador.collaborator_id
      });
      
      this.cerrar();
      mostrarToast(`Bienvenido/a de nuevo ${colaborador.display_name || 'colaborador/a'}!`);
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión. Por favor intenta de nuevo.');
    }
  }
  
  async crearSesionEnBD(datosUsuario) {
    const modo = datosUsuario.modo;
    
    // Si modo es anónimo, crear/actualizar lector sin perfil completado
    if (modo === 'anonimo') {
      const { error: errorLector } = await window.supabaseClient
        .from('lectores')
        .upsert({
          lector_id: datosUsuario.lector_id,
          perfil_completado: false,
          updated_at: new Date().toISOString()
        });
      
      if (errorLector) {
        console.error('Error al crear lector anónimo:', errorLector);
      }
    }
    
    // Crear sesión en Supabase (solo session_id, modo, lector_id)
    const sesionData = {
      session_id: datosUsuario.session_id,
      modo: modo,
      lector_id: datosUsuario.lector_id
    };
    
    const { error } = await window.supabaseClient
      .from('sesiones')
      .insert(sesionData);
    
    if (error) {
      console.error('Error al crear sesión:', error);
      return false;
    } else {
      console.log('✓ Sesión creada en Supabase:', sesionData);
      return true;
    }
  }
  
  volverOpciones() {
    this.formLector.style.display = 'none';
    this.colaboradorOpciones.style.display = 'none';
    this.formColaboradorRegistro.style.display = 'none';
    this.formColaboradorLogin.style.display = 'none';
    const lectorOpcionesDiv = document.getElementById('lector-opciones-existente');
    if (lectorOpcionesDiv) lectorOpcionesDiv.style.display = 'none';
    this.opciones.style.display = 'grid';
  }
  
  mostrar(permitirCambio = false) {
    return new Promise((resolve) => {
      // Siempre volver a las opciones principales
      this.volverOpciones();
      this.modal.style.display = 'flex';
      
      // Callback cuando se cierra
      this.onClose = resolve;
    });
  }
  
  cerrar() {
    this.modal.style.display = 'none';
    if (this.onClose) this.onClose();
  }

  async mostrarInfoUsuario() {
    const datosUsuario = window.userManager.obtenerDatosUsuario();
    
    if (!datosUsuario) {
      // No hay sesión activa, mostrar modal para elegir modo
      await this.mostrar();
      return;
    }

    // Obtener todas las sesiones del mismo lector_id
    const { data: sesiones, error: errorSesiones } = await window.supabaseClient
      .from('sesiones')
      .select('session_id')
      .eq('lector_id', datosUsuario.lector_id);

    if (errorSesiones) {
      console.error('Error al obtener sesiones:', errorSesiones);
      alert('Error al cargar información. Intenta de nuevo.');
      return;
    }

    let numContribuciones = 0;

    // Si hay sesiones, contar evaluaciones
    if (sesiones && sesiones.length > 0) {
      const sessionIds = sesiones.map(s => s.session_id);
      const { data: evaluaciones, error: errorEval } = await window.supabaseClient
        .from('evaluaciones')
        .select('*')
        .in('session_id', sessionIds);

      if (!errorEval && evaluaciones) {
        numContribuciones = evaluaciones.length;
      }
    }
    // Si no hay sesiones aún, significa que eligió modo pero no ha evaluado

    let modoTexto = '';
    let infoExtra = '';

    // Obtener datos demográficos de la tabla lectores
    const { data: lector } = await window.supabaseClient
      .from('lectores')
      .select('nivel_estudios, disciplina, perfil_completado')
      .eq('lector_id', datosUsuario.lector_id)
      .single();

    if (datosUsuario.modo === 'anonimo') {
      modoTexto = '<i class="fa-solid fa-user-secret" aria-hidden="true"></i> Anónimo';
      infoExtra = '<p>Participas de forma anónima sin datos personales.</p>';
    } else if (datosUsuario.modo === 'lector') {
      modoTexto = '<i class="fa-solid fa-book-open" aria-hidden="true"></i> Lector/a';
      if (lector && lector.perfil_completado) {
        infoExtra = `
          <p><strong>Nivel:</strong> ${lector.nivel_estudios || 'No especificado'}</p>
          <p><strong>Disciplina:</strong> ${lector.disciplina || 'No especificada'}</p>
        `;
      } else {
        infoExtra = '<p>Perfil sin completar</p>';
      }
    } else if (datosUsuario.modo === 'colaborador') {
      modoTexto = '<i class="fa-solid fa-pen" aria-hidden="true"></i> Colaborador/a';
      // Obtener info del colaborador
      const { data: colaborador } = await window.supabaseClient
        .from('colaboradores')
        .select('display_name')
        .eq('lector_id', datosUsuario.lector_id)
        .single();

      if (colaborador) {
        infoExtra = `
          <p><strong>Nombre:</strong> ${colaborador.display_name || 'No especificado'}</p>
        `;
        if (lector && lector.perfil_completado) {
          infoExtra += `
            <p><strong>Nivel:</strong> ${lector.nivel_estudios || 'No especificado'}</p>
            <p><strong>Disciplina:</strong> ${lector.disciplina || 'No especificada'}</p>
          `;
        }
      }
    }

    const infoHTML = `
      <div class="info-usuario-panel">
        <h3>Tu participación</h3>
        <div class="info-modo">
          <p><strong>Modo actual:</strong> ${modoTexto}</p>
          ${infoExtra}
        </div>
        <div class="info-stats">
          <p><strong>Contribuciones totales:</strong> ${numContribuciones}</p>
        </div>
        <div class="info-acciones">
          <button class="btn-cambiar-modo">Cambiar modo de participación</button>
          <button class="btn-cerrar-info">Cerrar</button>
        </div>
      </div>
    `;

    // Crear modal temporal para mostrar info
    const infoModal = document.createElement('div');
    infoModal.className = 'modal';
    infoModal.style.display = 'flex';
    infoModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        ${infoHTML}
      </div>
    `;

    document.body.appendChild(infoModal);

    // Event listeners
    infoModal.querySelector('.btn-cerrar-info').addEventListener('click', () => {
      infoModal.remove();
    });

    infoModal.querySelector('.btn-cambiar-modo').addEventListener('click', () => {
      infoModal.remove();
      this.mostrar(true); // Permitir cambio de modo
    });

    infoModal.querySelector('.modal-overlay').addEventListener('click', () => {
      infoModal.remove();
    });
  }
}

// Instancia global
document.addEventListener('DOMContentLoaded', () => {
  window.modalModo = new ModalModo();
  console.log('✓ ModalModo inicializado');

  // Vincular botón en navegación
  const btnModoUsuario = document.getElementById('btn-modo-usuario');
  if (btnModoUsuario) {
    btnModoUsuario.addEventListener('click', () => {
      window.modalModo.mostrarInfoUsuario();
    });
  }
});
