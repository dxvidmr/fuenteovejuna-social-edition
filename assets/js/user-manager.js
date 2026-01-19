// ============================================
// GESTIÓN DE MODOS DE PARTICIPACIÓN
// ============================================

class UserManager {
  constructor() {
    this.sessionKey = 'fuenteovejuna_session';
    // Solo sessionStorage (efímero) - NO localStorage
  }
  
  /**
   * Verifica si el usuario ya tiene modo definido EN ESTA SESIÓN
   */
  tieneModoDefinido() {
    return sessionStorage.getItem(this.sessionKey) !== null;
  }
  
  /**
   * Obtiene datos del usuario actual
   * @returns {Object|null} { session_id, es_colaborador, collaborator_id?, nivel_estudios?, disciplina? }
   */
  obtenerDatosUsuario() {
    const datos = sessionStorage.getItem(this.sessionKey);
    return datos ? JSON.parse(datos) : null;
  }
  
  /**
 * Generar hash SHA-256 de un email (normalizado)
 */
  async hashEmail(email) {
    // ✅ CRÍTICO: Normalizar SIEMPRE
    const normalizado = email.trim().toLowerCase();
    
    console.log('🔐 Hasheando email:', normalizado); // ✅ DEBUG
    
    const encoder = new TextEncoder();
    const data = encoder.encode(normalizado);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('🔐 Hash generado:', hashHex); // ✅ DEBUG
    
    return hashHex;
  }
  
  /**
   * MODO ANÓNIMO (con datos demográficos opcionales)
   * @param {Object} datosDemograficos - { nivel_estudios?, disciplina? }
   */
  async establecerLectorAnonimo(datosDemograficos = null) {
    const sessionId = crypto.randomUUID();
    
    // Crear sesión en BD
    const { error } = await window.supabaseClient
      .from('sesiones')
      .insert({
        session_id: sessionId,
        es_colaborador: false,
        nivel_estudios: datosDemograficos?.nivel_estudios || null,
        disciplina: datosDemograficos?.disciplina || null
      });
    
    if (error) {
      console.error('❌ Error creando sesión anónima:', error);
      return false;
    }
    
    // Guardar en sessionStorage
    const datos = {
      session_id: sessionId,
      es_colaborador: false,
      ...(datosDemograficos && datosDemograficos)
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(datos));
    console.log('✓ Sesión anónima creada:', sessionId);
    return true;
  }
  
  /**
   * MODO COLABORADOR (con registro)
   * @param {string} email - Email del colaborador
   * @param {string} display_name - Nombre público opcional
   * @param {Object} datosDemograficos - { nivel_estudios?, disciplina? }
   */
  async establecerColaborador(email, displayName = null, datosDemograficos = null) {
    const sessionId = crypto.randomUUID();
    
    console.log('📧 Registrando colaborador con email:', email);
    
    // Hash del email (normalizado)
    const emailHash = await this.hashEmail(email);
    
    console.log('🔍 Hash generado:', emailHash);
    
    // ✅ PASO 1: Buscar si ya existe este colaborador
    const { data: existente, error: errorBusqueda } = await window.supabaseClient
      .from('colaboradores')
      .select('collaborator_id, display_name, nivel_estudios, disciplina')
      .eq('emailhash', emailHash)
      .maybeSingle(); // ✅ Cambiado de .single() a .maybeSingle()
    
    console.log('👤 Colaborador existente:', existente);
    
    let colaborador = null;
    
    // ✅ PASO 2: Si ya existe, informar al usuario
    if (existente) {
      alert(`Este email ya está registrado como "${existente.display_name || 'colaborador/a'}". Usa "Identificarme" en lugar de "Registrarme".`);
      return false;
    }
    
    // ✅ PASO 3: Si NO existe, crear nuevo colaborador
    console.log('✨ Creando nuevo colaborador...');
    
    const { data: nuevo, error: errorCrear } = await window.supabaseClient
      .from('colaboradores')
      .insert({
        emailhash: emailHash,
        display_name: displayName || null,
        nivel_estudios: datosDemograficos?.nivel_estudios || null,
        disciplina: datosDemograficos?.disciplina || null
      })
      .select('collaborator_id, display_name')
      .single();
    
    if (errorCrear) {
      console.error('❌ Error creando colaborador:', errorCrear);
      
      // Mensaje específico si es constraint violation
      if (errorCrear.code === '23505') { // UNIQUE violation
        alert('Este email ya está registrado. Usa "Identificarme".');
      } else {
        alert('Error al registrar. Intenta de nuevo.');
      }
      return false;
    }
    
    colaborador = nuevo;
    console.log('✓ Colaborador creado:', colaborador);
    
    // ✅ PASO 4: Crear sesión
    const { error: errorSesion } = await window.supabaseClient
      .from('sesiones')
      .insert({
        session_id: sessionId,
        es_colaborador: true,
        collaborator_id: colaborador.collaborator_id,
        nivel_estudios: datosDemograficos?.nivel_estudios || null,
        disciplina: datosDemograficos?.disciplina || null
      });
    
    if (errorSesion) {
      console.error('❌ Error creando sesión:', errorSesion);
      return false;
    }
    
    // ✅ PASO 5: Guardar en sessionStorage
    const datos = {
      session_id: sessionId,
      es_colaborador: true,
      collaborator_id: colaborador.collaborator_id,
      display_name: colaborador.display_name,
      ...(datosDemograficos && datosDemograficos)
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(datos));
    
    console.log('✓ Colaborador establecido:', sessionId);
    return true;
  }
  
  /**
   * Cambia el modo actual (cierra sesión)
   */
  cambiarModo() {
    sessionStorage.removeItem(this.sessionKey);
    console.log('✓ Sesión finalizada');
  }
  
  /**
   * Obtiene datos para incluir en evaluaciones
   */
  obtenerDatosParaEvaluacion() {
    const datos = this.obtenerDatosUsuario();
    return datos ? { session_id: datos.session_id } : null;
  }
  
  /**
   * Obtiene estadísticas del usuario
   */
  async obtenerEstadisticas() {
    const datos = this.obtenerDatosUsuario();
    if (!datos) return null;
    
    const { data, error } = await window.supabaseClient
      .from('evaluaciones')
      .select('*')
      .eq('session_id', datos.session_id);
    
    if (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return null;
    }
    
    return {
      total_evaluaciones: data.length,
      votos_up: data.filter(e => e.vote === 'up').length,
      votos_down: data.filter(e => e.vote === 'down').length,
      comentarios: data.filter(e => e.comment).length
    };
  }

  /**
 * Cerrar sesión actual (limpiar sessionStorage)
 */
  cerrarSesion() {
    sessionStorage.removeItem(this.sessionKey);
    console.log('✓ Sesión cerrada');
    
    // Opcional: Recargar página para limpiar estado
    // window.location.reload();
  }

  /**
   * Cambiar modo (alias de cerrarSesion por compatibilidad)
   */
  cambiarModo() {
    this.cerrarSesion();
  }
}

// Instancia global
window.userManager = new UserManager();
console.log('✓ UserManager inicializado');
