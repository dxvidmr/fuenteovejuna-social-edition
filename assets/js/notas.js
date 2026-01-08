// ============================================
// GESTIÓN DE NOTAS
// ============================================

/**
 * Cargar todas las notas activas (con caché)
 */
async function cargarNotasActivas() {
  // Verificar caché
  if (window.notasActivasCache) {
    console.log('✓ Notas activas desde caché');
    return window.notasActivasCache;
  }
  
  // Cargar desde Supabase
  const { data, error } = await window.supabaseClient
    .from('notas_activas')
    .select('*');
  
  if (error) {
    console.error('Error al cargar notas:', error);
    return [];
  }
  
  // Guardar en caché
  window.notasActivasCache = data;
  console.log(`✓ ${data.length} notas activas cargadas`);
  
  return data;
}

/**
 * Filtrar notas que aplican a un conjunto de xml:ids
 */
function filtrarNotasPorXmlIds(todasNotas, xmlIds) {
  return todasNotas.filter(nota => {
    // Parsear targets de la nota (pueden ser múltiples)
    const targetsNota = nota.target
      .split(' ')
      .map(t => t.replace('#', ''));
    
    // Verificar si algún target está en los xml:ids
    return targetsNota.some(t => xmlIds.includes(t));
  });
}

/**
 * Cargar notas de un pasaje específico
 */
async function cargarNotasPasaje(xmlDoc, pasaje, fragmento) {
  // 1. Obtener todas las notas activas
  const todasNotas = await cargarNotasActivas();
  
  // 2. Extraer xml:ids del fragmento
  const xmlIdsDelPasaje = extraerXmlIdsDelFragmento(fragmento);
  
  // 3. Filtrar notas que aplican
  const notasDelPasaje = filtrarNotasPorXmlIds(todasNotas, xmlIdsDelPasaje);
  
  console.log(`✓ ${notasDelPasaje.length} notas para este pasaje`);
  return notasDelPasaje;
}

/**
 * Registrar evaluación de nota
 */
async function registrarEvaluacion(datos) {
  // Verificar que usuario tiene modo definido
  if (!window.userManager.tieneModoDefinido()) {
    await window.modalModo.mostrar();
  }
  
  const datosUsuario = window.userManager.obtenerDatosUsuario();
  
  // Asegurar que la sesión esté creada en BD (primera evaluación)
  if (!datosUsuario.sesion_creada_en_bd) {
    console.log('⏳ Primera evaluación: creando sesión en BD...');
    const exito = await window.modalModo.crearSesionEnBD(datosUsuario);
    if (exito) {
      window.userManager.marcarSesionCreada();
    } else {
      alert('Error al crear sesión. Por favor intenta de nuevo.');
      return false;
    }
  }
  
  const evaluacion = {
    timestamp: new Date().toISOString(),
    session_id: datosUsuario.session_id,
    ...datos
  };
  
  const { error } = await window.supabaseClient
    .from('evaluaciones')
    .insert(evaluacion);
  
  if (error) {
    console.error('Error al registrar evaluación:', error);
    return false;
  }
  
  console.log('✓ Evaluación registrada');
  return true;
}

console.log('✓ Notas.js cargado');
