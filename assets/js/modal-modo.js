// ============================================
// MODAL DE SELECCIÓN DE MODO (Con Login/Registro)
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
          
          <!-- Opciones de modo (2 opciones) -->
          <div class="modo-opciones">
            
            <!-- Opción 1: Anónimo -->
            <div class="modo-opcion" data-modo="anonimo">
              <div class="modo-header">
                <span class="modo-icono"><i class="fa-solid fa-user-secret" aria-hidden="true"></i></span>
                <h3>Editor anónimo</h3>
              </div>
              <p>Sin registro. Privacidad total.</p>
              <button class="btn-seleccionar" data-modo="anonimo">Participar anónimamente</button>
            </div>
            
            <!-- Opción 2: Colaborador -->
            <div class="modo-opcion" data-modo="colaborador">
              <div class="modo-header">
                <span class="modo-icono"><i class="fa-solid fa-pen" aria-hidden="true"></i></span>
                <h3>Colaborador</h3>
              </div>
              <p>Identificado por email. Contribuciones reconocidas.</p>
              <button class="btn-seleccionar" data-modo="colaborador">Continuar como colaborador/a</button>
            </div>
            
          </div>
          
          <!-- Formulario anónimo con datos opcionales -->
          <div id="form-anonimo" class="modo-form" style="display:none;">
            <h3>Participación anónima</h3>
            <p>Opcionalmente, puedes compartir datos demográficos para análisis (100% anónimo):</p>
            <form id="form-anonimo-datos">
              <label>
                Nivel de estudios (opcional):
                <select name="nivel_estudios">
                  <option value="">Prefiero no decirlo</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="grado">Grado universitario</option>
                  <option value="posgrado">Máster/Posgrado</option>
                  <option value="doctorado">Doctorado</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              
              <label>
                Disciplina (opcional):
                <select name="disciplina">
                  <option value="">Prefiero no decirlo</option>
                  <option value="filologia">Filología/Lengua/Literatura</option>
                  <option value="historia">Historia</option>
                  <option value="educacion">Educación</option>
                  <option value="arte">Arte/Teatro</option>
                  <option value="humanidades">Humanidades (general)</option>
                  <option value="ciencias_sociales">Ciencias Sociales</option>
                  <option value="otro">Otra</option>
                </select>
              </label>
              
              <button type="submit" class="btn-enviar">Comenzar</button>
              <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
            </form>
          </div>
          
          <!-- Opciones colaborador: Iniciar sesión o Registrarse -->
          <div id="colaborador-opciones" class="modo-form" style="display:none;">
            <h3>Identificarse como colaborador/a</h3>
            <p class="info-colaborador">No necesitas contraseña. Solo tu email para reconocerte.</p>
            <div class="colaborador-opciones-grid">
              <div class="opcion-colaborador" data-tipo="login">
                <span class="opcion-icono"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i></span>
                <h4>Ya participé antes</h4>
                <p>Identificarme con mi email.</p>
                <button class="btn-opcion-colaborador" data-tipo="login">Identificarme</button>
              </div>
              <div class="opcion-colaborador" data-tipo="registro">
                <span class="opcion-icono"><i class="fa-solid fa-user-plus" aria-hidden="true"></i></span>
                <h4>Primera vez</h4>
                <p>Registrar mi email y datos.</p>
                <button class="btn-opcion-colaborador" data-tipo="registro">Registrarme</button>
              </div>
            </div>
            <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
          </div>

          <!-- Formulario LOGIN colaborador -->
          <div id="form-colaborador-login" class="modo-form" style="display:none;">
            <h3>Identificarse</h3>
            <p class="info-identificacion">
              Introduce el mismo email que usaste anteriormente. 
              No guardamos tu email real, solo un código único generado a partir de él.
            </p>
            <form id="form-colaborador-login-datos">
              <label>
                Email:
                <input type="email" name="email" required placeholder="tu@email.com">
              </label>
              
              <button type="submit" class="btn-enviar">Identificarme</button>
              <button type="button" class="btn-volver"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Volver</button>
            </form>
          </div>

          <!-- Formulario REGISTRO colaborador -->
          <div id="form-colaborador-registro" class="modo-form" style="display:none;">
            <h3>Registrarse</h3>
            <p class="info-registro">
              Tu email se convertirá en un código único (hash SHA-256) y no se almacenará como texto legible.
            </p>
            <form id="form-colaborador-registro-datos">
              <label>
                Email:
                <input type="email" name="email" required placeholder="tu@email.com">
                <small>Solo para generar tu identificador único. No se guarda el email real.</small>
              </label>
              
              <label>
                Nombre a mostrar (opcional):
                <input type="text" name="display_name" placeholder="María G." maxlength="50">
                <small>Aparecerá en tus contribuciones públicas</small>
              </label>
              
              <label>
                Nivel de estudios (opcional):
                <select name="nivel_estudios">
                  <option value="">Prefiero no decirlo</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="grado">Grado universitario</option>
                  <option value="posgrado">Máster/Posgrado</option>
                  <option value="doctorado">Doctorado</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              
              <label>
                Disciplina (opcional):
                <select name="disciplina">
                  <option value="">Prefiero no decirlo</option>
                  <option value="filologia">Filología/Lengua/Literatura</option>
                  <option value="historia">Historia</option>
                  <option value="educacion">Educación</option>
                  <option value="arte">Arte/Teatro</option>
                  <option value="humanidades">Humanidades (general)</option>
                  <option value="ciencias_sociales">Ciencias Sociales</option>
                  <option value="otro">Otra</option>
                </select>
              </label>
              
              <button type="submit" class="btn-enviar">Registrarme</button>
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
    this.formAnonimo = document.getElementById('form-anonimo');
    this.colaboradorOpciones = document.getElementById('colaborador-opciones');
    this.formColaboradorLogin = document.getElementById('form-colaborador-login');
    this.formColaboradorRegistro = document.getElementById('form-colaborador-registro');
    
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
    
    // Form anónimo
    document.getElementById('form-anonimo-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormAnonimo(e.target);
    });
    
    // Opciones colaborador (login/registro)
    document.querySelectorAll('.btn-opcion-colaborador').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tipo = e.target.dataset.tipo;
        this.mostrarFormColaborador(tipo);
      });
    });
    
    // Form colaborador LOGIN
    document.getElementById('form-colaborador-login-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormColaboradorLogin(e.target);
    });
    
    // Form colaborador REGISTRO
    document.getElementById('form-colaborador-registro-datos').addEventListener('submit', (e) => {
      e.preventDefault();
      this.procesarFormColaboradorRegistro(e.target);
    });
    
    // Botones volver
    document.querySelectorAll('.btn-volver').forEach(btn => {
      btn.addEventListener('click', () => this.volverOpciones());
    });
  }
  
  seleccionarModo(modo) {
    if (modo === 'anonimo') {
      // Mostrar formulario con datos opcionales
      this.opciones.style.display = 'none';
      this.formAnonimo.style.display = 'block';
      
    } else if (modo === 'colaborador') {
      // Mostrar opciones de login/registro
      this.opciones.style.display = 'none';
      this.colaboradorOpciones.style.display = 'block';
    }
  }
  
  mostrarFormColaborador(tipo) {
    this.colaboradorOpciones.style.display = 'none';
    
    if (tipo === 'login') {
      this.formColaboradorLogin.style.display = 'block';
    } else if (tipo === 'registro') {
      this.formColaboradorRegistro.style.display = 'block';
    }
  }
  
  async procesarFormAnonimo(form) {
    const formData = new FormData(form);
    const nivel_estudios = formData.get('nivel_estudios') || null;
    const disciplina = formData.get('disciplina') || null;
    
    // Datos demográficos opcionales
    const datosDemograficos = {};
    if (nivel_estudios) datosDemograficos.nivel_estudios = nivel_estudios;
    if (disciplina) datosDemograficos.disciplina = disciplina;
    
    try {
      const exito = await window.userManager.establecerLectorAnonimo(
        Object.keys(datosDemograficos).length > 0 ? datosDemograficos : null
      );
      
      if (exito) {
        this.cerrar();
        mostrarToast('Modo anónimo activado');
      } else {
        alert('Error al establecer modo anónimo. Intenta de nuevo.');
      }
      
    } catch (error) {
      console.error('Error al procesar anónimo:', error);
      alert('Error al guardar. Por favor intenta de nuevo.');
    }
  }
  
  async procesarFormColaboradorLogin(form) {
    const formData = new FormData(form);
    let emailRaw = formData.get('email');
    let email;
    if (window.userManager?.debug) {
      // ═══════════════════════════════════════════════════════
      // DEBUG LOGIN - INICIO
      // ═══════════════════════════════════════════════════════
      console.group('LOGIN - DEBUG DETALLADO');
      console.log('Email RAW del FormData:', JSON.stringify(emailRaw));
      console.log('Longitud RAW:', emailRaw?.length);
      email = emailRaw.trim();
      console.log('Email después de trim():', JSON.stringify(email));
      console.log('Longitud después de trim:', email.length);
      console.log('Caracteres del email:');
      [...email].forEach((char, i) => {
        console.log(`  [${i}]: "${char}" -> charCode: ${char.charCodeAt(0)}`);
      });
      console.groupEnd();
      // ═══════════════════════════════════════════════════════
      // DEBUG LOGIN - FIN
      // ═══════════════════════════════════════════════════════
    } else {
      email = emailRaw.trim();
    }
    
    if (!email) {
      alert('El email es obligatorio');
      return;
    }
    
    // Mostrar loading
    const btnSubmit = form.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Buscando...';
    
    try {
      if (window.userManager?.debug) console.log('Llamando a hashEmail() desde LOGIN...');
      // Hash del email (normalizado)
      const email_hash = await window.userManager.hashEmail(email);
      
      // Buscar colaborador existente
      const { data: colaborador, error } = await window.supabaseClient
        .from('colaboradores')
        .select('collaborator_id, display_name, nivel_estudios, disciplina')
        .eq('email_hash', email_hash)
        .single();
      
      if (error || !colaborador) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;
        
        // Preguntar si quiere registrarse
        if (confirm('No encontramos tu email en el sistema. ¿Quieres registrarte ahora?')) {
          this.volverOpciones();
          setTimeout(() => {
            this.seleccionarModo('colaborador');
            setTimeout(() => {
              this.mostrarFormColaborador('registro');
            }, 100);
          }, 100);
        }
        return;
      }
      
      // Colaborador encontrado, crear sesión
      const sessionId = crypto.randomUUID();
      const { error: errorSesion } = await window.supabaseClient
        .from('sesiones')
        .insert({
          session_id: sessionId,
          es_colaborador: true,
          collaborator_id: colaborador.collaborator_id,
          nivel_estudios: colaborador.nivel_estudios,
          disciplina: colaborador.disciplina
        });
      
      if (errorSesion) {
        console.error('Error creando sesión:', errorSesion);
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;
        alert('Error al identificarte. Intenta de nuevo.');
        return;
      }
      
      // Guardar en sessionStorage
      const datos = {
        session_id: sessionId,
        es_colaborador: true,
        collaborator_id: colaborador.collaborator_id,
        display_name: colaborador.display_name,
        nivel_estudios: colaborador.nivel_estudios,
        disciplina: colaborador.disciplina
      };
      
      sessionStorage.setItem('fuenteovejuna_session', JSON.stringify(datos));
      
      // Cerrar modal y mostrar bienvenida
      this.cerrar();
      mostrarToast(`¡Hola de nuevo, ${colaborador.display_name || 'colaborador/a'}!`, 3000);
      
    } catch (error) {
      console.error('Error al identificarse:', error);
      btnSubmit.disabled = false;
      btnSubmit.textContent = textoOriginal;
      alert('Error al identificarte. Por favor intenta de nuevo.');
    }
  }

  
  async procesarFormColaboradorRegistro(form) {
    const formData = new FormData(form);
    let emailRaw = formData.get('email');
    let email;
    if (window.userManager?.debug) {
      // ═══════════════════════════════════════════════════════
      // DEBUG REGISTRO - INICIO
      // ═══════════════════════════════════════════════════════
      console.group('REGISTRO - DEBUG DETALLADO');
      console.log('Email RAW del FormData:', JSON.stringify(emailRaw));
      console.log('Longitud RAW:', emailRaw?.length);
      email = emailRaw.trim();
      console.log('Email después de trim():', JSON.stringify(email));
      console.log('Longitud después de trim:', email.length);
      console.log('Caracteres del email:');
      [...email].forEach((char, i) => {
        console.log(`  [${i}]: "${char}" -> charCode: ${char.charCodeAt(0)}`);
      });
      console.groupEnd();
      // ═══════════════════════════════════════════════════════
      // DEBUG REGISTRO - FIN
      // ═══════════════════════════════════════════════════════
    } else {
      email = emailRaw.trim();
    }
    
    const displayname = formData.get('display_name')?.trim() || null;
    const nivel_estudios = formData.get('nivel_estudios') || null;
    const disciplina = formData.get('disciplina') || null;
    
    if (!email) {
      alert('El email es obligatorio');
      return;
    }
    
    // Datos demográficos opcionales
    const datosDemograficos = {};
    if (nivel_estudios) datosDemograficos.nivel_estudios = nivel_estudios;
    if (disciplina) datosDemograficos.disciplina = disciplina;
    
    try {
      if (window.userManager?.debug) console.log('Llamando a hashEmail() desde REGISTRO...');
      const exito = await window.userManager.establecerColaborador(
        email,
        displayname,
        Object.keys(datosDemograficos).length > 0 ? datosDemograficos : null
      );
      
      if (exito) {
        this.cerrar();
        mostrarToast(`Bienvenido/a ${displayname || 'colaborador/a'}!`);
      } else {
        alert('Error al registrar colaborador. Verifica tus datos.');
      }
      
    } catch (error) {
      console.error('Error al procesar colaborador:', error);
      alert('Error al registrar. Por favor intenta de nuevo.');
    }
  }
  
  volverOpciones() {
    // Ocultar todos los formularios
    this.formAnonimo.style.display = 'none';
    this.colaboradorOpciones.style.display = 'none';
    this.formColaboradorLogin.style.display = 'none';
    this.formColaboradorRegistro.style.display = 'none';
    
    // Mostrar opciones principales
    this.opciones.style.display = 'grid';
    
    // Limpiar formularios
    document.getElementById('form-anonimo-datos').reset();
    document.getElementById('form-colaborador-login-datos').reset();
    document.getElementById('form-colaborador-registro-datos').reset();
  }
  
  mostrar() {
    return new Promise((resolve) => {
      this.volverOpciones();
      this.modal.style.display = 'flex';
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
      // No hay sesión activa
      await this.mostrar();
      return;
    }
    
    // Obtener estadísticas
    const stats = await window.userManager.obtenerEstadisticas();
    
    let modoTexto = '';
    let infoExtra = '';
    
    if (datosUsuario.es_colaborador) {
      modoTexto = '<i class="fa-solid fa-pen" aria-hidden="true"></i> Colaborador/a';
      infoExtra = `
        <p><strong>Nombre:</strong> ${datosUsuario.display_name || 'No especificado'}</p>
      `;
      
      if (datosUsuario.nivel_estudios) {
        infoExtra += `<p><strong>Nivel:</strong> ${datosUsuario.nivel_estudios}</p>`;
      }
      if (datosUsuario.disciplina) {
        infoExtra += `<p><strong>Disciplina:</strong> ${datosUsuario.disciplina}</p>`;
      }
      
    } else {
      modoTexto = '<i class="fa-solid fa-user-secret" aria-hidden="true"></i> Anónimo';
      infoExtra = '<p>Participas de forma anónima sin registro.</p>';
      
      if (datosUsuario.nivel_estudios || datosUsuario.disciplina) {
        infoExtra += '<p><strong>Datos demográficos compartidos:</strong></p>';
        if (datosUsuario.nivel_estudios) {
          infoExtra += `<p>Nivel: ${datosUsuario.nivel_estudios}</p>`;
        }
        if (datosUsuario.disciplina) {
          infoExtra += `<p>Disciplina: ${datosUsuario.disciplina}</p>`;
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
          <p><strong>Contribuciones totales:</strong> ${stats?.total_evaluaciones || 0}</p>
          ${stats ? `
            <p>Votos positivos: ${stats.votos_up}</p>
            <p>Votos negativos: ${stats.votos_down}</p>
            <p>Comentarios: ${stats.comentarios}</p>
          ` : ''}
        </div>
        <div class="info-acciones">
          <button class="btn-cerrar-sesion">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Cerrar sesión
          </button>
          <button class="btn-cerrar-info">Cerrar</button>
        </div>
      </div>
    `;
    
    // Crear modal temporal
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
    
    // Botón cerrar sesión
    infoModal.querySelector('.btn-cerrar-sesion').addEventListener('click', () => {
      if (confirm('¿Seguro que quieres cerrar sesión? Podrás elegir otro modo después.')) {
        window.userManager.cerrarSesion();
        infoModal.remove();
        mostrarToast('Sesión cerrada', 2000);
        
        // Mostrar modal de selección
        setTimeout(() => {
          this.mostrar();
        }, 500);
      }
    });
    
    infoModal.querySelector('.modal-overlay').addEventListener('click', () => {
      infoModal.remove();
    });
  }
}

// Instancia global
document.addEventListener('DOMContentLoaded', () => {
  window.modalModo = new ModalModo();
  console.log('ModalModo inicializado');
  
  // Vincular botón en navegación
  const btnModoUsuario = document.getElementById('btn-modo-usuario');
  if (btnModoUsuario) {
    btnModoUsuario.addEventListener('click', () => {
      window.modalModo.mostrarInfoUsuario();
    });
  }
});
