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
   * Hash SHA-256 del email para privacidad
   */
  async hashEmail(email) {
    const msgBuffer = new TextEncoder().encode(email.toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
  async establecerColaborador(email, display_name, datosDemograficos = null) {
    const email_hash = await this.hashEmail(email);
    
    // 1. Buscar o crear colaborador
    let { data: colaborador } = await window.supabaseClient
      .from('colaboradores')
      .select('collaborator_id, display_name')
      .eq('email_hash', email_hash)
      .single();
    
    if (!colaborador) {
      // Crear nuevo colaborador
      const { data: nuevo, error: errorCrear } = await window.supabaseClient
        .from('colaboradores')
        .insert({
          email_hash: email_hash,
          display_name: display_name || null,
          nivel_estudios: datosDemograficos?.nivel_estudios || null,
          disciplina: datosDemograficos?.disciplina || null
        })
        .select('collaborator_id, display_name')
        .single();
      
      if (errorCrear) {
        console.error('❌ Error creando colaborador:', errorCrear);
        return false;
      }
      colaborador = nuevo;
      console.log('✓ Nuevo colaborador creado');
    } else {
      console.log('✓ Colaborador existente encontrado');
    }
    
    // 2. Crear sesión vinculada al colaborador
    const sessionId = crypto.randomUUID();
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
      console.error('❌ Error creando sesión de colaborador:', errorSesion);
      return false;
    }
    
    // 3. Guardar en sessionStorage
    const datos = {
      session_id: sessionId,
      es_colaborador: true,
      collaborator_id: colaborador.collaborator_id,
      display_name: colaborador.display_name,
      ...(datosDemograficos && datosDemograficos)
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(datos));
    console.log('✓ Sesión de colaborador creada:', sessionId);
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
}

// Instancia global
window.userManager = new UserManager();
console.log('✓ UserManager inicializado');
