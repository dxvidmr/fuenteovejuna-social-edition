// ============================================
// GESTIÓN DE PASAJES
// ============================================

/**
 * Extrae fragmento del XML basándose en xml:id de inicio y fin
 */
function extraerFragmento(xmlDoc, pasaje) {
  const inicioId = pasaje.inicio_xmlid;
  const finId = pasaje.fin_xmlid;
  
  // Buscar elementos de inicio y fin por xml:id
  const elementoInicio = xmlDoc.querySelector(`[xml\\:id="${inicioId}"]`);
  const elementoFin = xmlDoc.querySelector(`[xml\\:id="${finId}"]`);
  
  if (!elementoInicio || !elementoFin) {
    console.error('No se encontraron elementos:', inicioId, finId);
    return null;
  }
  
  // CASO 1: Mismo elemento (un solo <sp>, <stage> o <l>)
  if (inicioId === finId) {
    const contenedor = xmlDoc.createElement('div');
    contenedor.setAttribute('class', 'pasaje-fragmento');
    contenedor.appendChild(elementoInicio.cloneNode(true));
    return contenedor;
  }
  
  // CASO 2: Fin está dentro de Inicio (ej: inicio=sp1, fin=v52 dentro de sp1)
  if (elementoInicio.contains(elementoFin)) {
    const contenedor = xmlDoc.createElement('div');
    contenedor.setAttribute('class', 'pasaje-fragmento');
    contenedor.appendChild(elementoInicio.cloneNode(true));
    return contenedor;
  }
  
  // CASO 3: Elementos en diferente nivel (mixto)
  const ancestroInicio = elementoInicio.closest('sp, stage') || elementoInicio;
  const ancestroFin = elementoFin.closest('sp, stage') || elementoFin;
  
  const contenedorComun = ancestroInicio.parentElement;
  const hijos = Array.from(contenedorComun.children);
  
  const elementos = [];
  let capturando = false;
  
  for (const hijo of hijos) {
    if (hijo === ancestroInicio || hijo.contains(elementoInicio)) {
      capturando = true;
    }
    
    if (capturando) {
      elementos.push(hijo);
    }
    
    if (hijo === ancestroFin || hijo.contains(elementoFin)) {
      break;
    }
  }
  
  const contenedor = xmlDoc.createElement('div');
  contenedor.setAttribute('class', 'pasaje-fragmento');
  elementos.forEach(el => contenedor.appendChild(el.cloneNode(true)));
  
  return contenedor;
}

/**
 * Extrae xml:ids de un fragmento
 */
function extraerXmlIdsDelFragmento(fragmento) {
  const elementosConId = fragmento.querySelectorAll('[xml\\:id]');
  return Array.from(elementosConId).map(el => el.getAttribute('xml:id'));
}

console.log('✓ Pasajes.js cargado');
