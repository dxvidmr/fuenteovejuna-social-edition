// ============================================
// GESTIÓN DE MODOS DE PARTICIPACIÓN
// ============================================

class UserManager {
  constructor() {
    this.storageKey = 'fuenteovejuna_user';
  }
  
  /**
   * Verifica si el usuario ya tiene modo definido
   */
  tieneModoDefinido() {
    const datos = localStorage.getItem(this.storageKey);
    return datos !== null;
  }
  
  /**
   * Obtiene datos del usuario actual
   * @returns {Object} { session_id, modo, collaborator_id }
   */
  obtenerDatosUsuario() {
    const datos = localStorage.getItem(this.storageKey);
    if (!datos) return null;
    
    return JSON.parse(datos);
  }
  
  /**
   * Guarda modo de participación seleccionado
   * @param {string} modo - 'anonimo', 'lector', 'colaborador'
   * @param {Object} datosAdicionales - Datos extra según modo
   */
  guardarModo(modo, datosAdicionales = {}) {
    const sessionId = crypto.randomUUID();
    
    const datos = {
      session_id: sessionId,
      modo: modo,
      timestamp: new Date().toISOString(),
      ...datosAdicionales
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(datos));
    console.log('✓ Modo guardado:', modo);
    
    return datos;
  }
  
  /**
   * Cambia el modo actual (crea nueva sesión)
   */
  cambiarModo() {
    localStorage.removeItem(this.storageKey);
    console.log('✓ Modo reseteado');
  }
  
  /**
   * Obtiene estadísticas del usuario (TO-DO: implementar)
   */
  async obtenerEstadisticas() {
    const datos = this.obtenerDatosUsuario();
    if (!datos) return null;
    
    // Consultar evaluaciones del usuario
    const { data, error } = await window.supabaseClient
      .from('evaluaciones')
      .select('*')
      .eq('session_id', datos.session_id);
    
    if (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
    
    return {
      total_evaluaciones: data.length,
      votos_up: data.filter(e => e.vote === 'up').length,
      votos_down: data.filter(e => e.vote === 'down').length,
      señalamientos: data.filter(e => e.event_type === 'falta_nota').length
    };
  }
}

// Instancia global
window.userManager = new UserManager();
console.log('✓ UserManager inicializado');
