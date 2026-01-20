// ============================================
// ESTADÍSTICAS DE EVALUACIONES (MÓDULO REUTILIZABLE)
// ============================================

/**
 * Obtener estadísticas de evaluaciones para una nota
 * @param {string} notaId - ID de la nota (ej: "n-1-1")
 * @param {Object} notaData - (Opcional) Objeto de la nota con evaluaciones precargadas
 * @returns {Object} {total, utiles, mejorables} o null si no hay datos
 */
function obtenerEvaluacionesStats(notaId, notaData = null) {
  let evaluaciones = null;
  
  // Opción 1: Si se pasa el objeto nota directamente con evaluaciones
  if (notaData && notaData.evaluaciones) {
    evaluaciones = notaData.evaluaciones;
    console.log(`[EvalStats] Usando evaluaciones de notaData para ${notaId}:`, evaluaciones);
  }
  // Opción 2: Buscar en el caché global
  else if (window.notasActivasCache) {
    const notaEnCache = window.notasActivasCache.find(n => n.nota_id === notaId);
    if (notaEnCache && notaEnCache.evaluaciones) {
      evaluaciones = notaEnCache.evaluaciones;
      console.log(`[EvalStats] Encontrado en caché para ${notaId}:`, evaluaciones);
    } else {
      console.log(`[EvalStats] No encontrado en caché: ${notaId}`);
    }
  } else {
    console.log(`[EvalStats] Caché no disponible para ${notaId}`);
  }
  
  // Si no hay evaluaciones, usar contador vacío
  if (!evaluaciones) {
    evaluaciones = { total: 0, utiles: 0, mejorables: 0 };
  }
  
  return evaluaciones;
}

/**
 * Crear HTML con contadores integrados en botones + mensaje "Sé el primero"
 * @param {string} notaId - ID de la nota
 * @param {string} version - Versión de la nota
 * @param {Object} evaluaciones - {total, utiles, mejorables}
 * @returns {string} HTML de botones con contadores
 */
function crearBotonesConContadores(notaId, version, evaluaciones) {
  const { total, utiles, mejorables } = evaluaciones;
  
  // Mensaje si no hay evaluaciones
  const mensajePrimero = total === 0 
    ? '<p class="eval-mensaje-primero">¡Sé el primero en evaluar esta nota!</p>' 
    : '';
  
  return `
    <div class="evaluacion-header">
      <span>¿Te resulta útil esta nota?</span>
    </div>
    <div class="evaluacion-botones">
      <button class="btn-evaluar btn-util" data-nota-id="${notaId}" data-version="${version}">
        <span class="btn-contador">${utiles}</span>
        <i class="fa-solid fa-heart" aria-hidden="true"></i>
        Útil
      </button>
      <button class="btn-evaluar btn-mejorable" data-nota-id="${notaId}" data-version="${version}">
        <span class="btn-contador">${mejorables}</span>
        <i class="fa-solid fa-heart-crack" aria-hidden="true"></i>
        Mejorable
      </button>
    </div>
    ${mensajePrimero}
    <div class="evaluacion-comentario" style="display:none;">
      <textarea placeholder="¿Qué cambiarías? (opcional)" rows="2"></textarea>
      <button class="btn-enviar-comentario">Enviar</button>
      <button class="btn-cancelar-comentario">Cancelar</button>
    </div>
  `;
}

console.log('✓ Evaluaciones-stats.js cargado');

/**
 * Actualizar contador de evaluaciones localmente después de evaluar
 * @param {string} notaId - ID de la nota evaluada
 * @param {string} vote - 'up' o 'down' (o 'util'/'mejorable')
 */
function actualizarContadorLocal(notaId, vote) {
  // Inicializar caché si no existe
  if (!window.notasActivasCache) {
    window.notasActivasCache = [];
  }
  
  // Buscar la nota en caché
  let nota = window.notasActivasCache.find(n => n.nota_id === notaId);
  
  // Si no existe, crear entrada mínima
  if (!nota) {
    nota = { nota_id: notaId, evaluaciones: { total: 0, utiles: 0, mejorables: 0 } };
    window.notasActivasCache.push(nota);
    console.log(`[EvalStats] Creada entrada en caché para ${notaId}`);
  }
  
  // Inicializar evaluaciones si no existe
  if (!nota.evaluaciones) {
    nota.evaluaciones = { total: 0, utiles: 0, mejorables: 0 };
  }
  
  // Incrementar contadores
  nota.evaluaciones.total++;
  if (vote === 'up' || vote === 'util') {
    nota.evaluaciones.utiles++;
  } else if (vote === 'down' || vote === 'mejorable') {
    nota.evaluaciones.mejorables++;
  }
  
  console.log(`[EvalStats] Contador actualizado para ${notaId}:`, nota.evaluaciones);
  
  // Actualizar los números en los botones del DOM
  actualizarContadoresEnBotones(nota.evaluaciones);
}

/**
 * Actualizar los números en los botones de evaluación
 * @param {Object} evaluaciones - {total, utiles, mejorables}
 */
function actualizarContadoresEnBotones(evaluaciones) {
  // Actualizar botón "Útil"
  const btnUtil = document.querySelector('.btn-util .btn-contador');
  if (btnUtil) {
    btnUtil.textContent = evaluaciones.utiles;
    console.log(`[EvalStats] Actualizado contador útil: ${evaluaciones.utiles}`);
  }
  
  // Actualizar botón "Mejorable"
  const btnMejorable = document.querySelector('.btn-mejorable .btn-contador');
  if (btnMejorable) {
    btnMejorable.textContent = evaluaciones.mejorables;
    console.log(`[EvalStats] Actualizado contador mejorable: ${evaluaciones.mejorables}`);
  }
  
  // Quitar mensaje "Sé el primero" si existe
  const mensajePrimero = document.querySelector('.eval-mensaje-primero');
  if (mensajePrimero && evaluaciones.total > 0) {
    mensajePrimero.remove();
    console.log('[EvalStats] Mensaje "Sé el primero" eliminado');
  }
}
