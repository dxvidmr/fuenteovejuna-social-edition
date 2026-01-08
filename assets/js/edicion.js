document.addEventListener("DOMContentLoaded", function() {
    // Referencias globales
    const textColumn = document.querySelector('.text-column');
    const fontSizeDisplay = document.getElementById('font-size-display');
    let currentFontSize = 100;
    
    // Sistema de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Desactivar todas las pestañas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar la pestaña seleccionada
            this.classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
        });
    });
    
    // Control de visibilidad de notas
    const toggleNotesCheckbox = document.getElementById('toggle-notes');
    if (toggleNotesCheckbox && textColumn) {
        toggleNotesCheckbox.addEventListener('change', function() {
            if (this.checked) {
                textColumn.classList.remove('notes-hidden');
            } else {
                textColumn.classList.add('notes-hidden');
            }
        });
    }
    
    // Control de tamaño de fuente
    document.getElementById('increase-font')?.addEventListener('click', function() {
        if (currentFontSize < 150) {
            currentFontSize += 10;
            updateFontSize();
        }
    });
    
    document.getElementById('decrease-font')?.addEventListener('click', function() {
        if (currentFontSize > 70) {
            currentFontSize -= 10;
            updateFontSize();
        }
    });
    
    function updateFontSize() {
        if (textColumn && fontSizeDisplay) {
            textColumn.style.fontSize = currentFontSize + '%';
            fontSizeDisplay.textContent = currentFontSize + '%';
        }
    }
    
    // Botón para mostrar/ocultar estrofas
    const toggleStanzasCheckbox = document.getElementById('toggle-stanzas');
    if (toggleStanzasCheckbox) {
        toggleStanzasCheckbox.addEventListener('change', function() {
            var milestones = document.querySelectorAll('tei-milestone[unit="stanza"]');
            milestones.forEach(function(milestone) {
                if (this.checked) {
                    milestone.classList.add('show-line');
                } else {
                    milestone.classList.remove('show-line');
                }
            }.bind(this));
        });
    }
    
    // Botón para mostrar/ocultar estrofas (legacy - mantener por compatibilidad)
    const toggleButton = document.getElementById("toggleLines");
    if (toggleButton) {
        toggleButton.addEventListener("click", function() {
            var milestones = document.querySelectorAll('tei-milestone[unit="stanza"]');
            milestones.forEach(function(milestone) {
                milestone.classList.toggle('show-line');
            });

            // Cambia el texto del botón
            if (this.textContent === "Mostrar estrofas") {
                this.textContent = "Ocultar estrofas";
            } else {
                this.textContent = "Mostrar estrofas";
            }
        });
    }
    
    const teiContainer = document.getElementById("TEI");
    const noteContentDiv = document.getElementById("noteContent");
    
    let teiLoaded = false;
    let notasLoaded = false;

    // Función para verificar si todo está listo y procesar
    function checkAndProcess() {
        console.log('checkAndProcess:', { teiLoaded, notasLoaded, notasXML: !!window.notasXML });
        if (teiLoaded && notasLoaded && window.notasXML) {
            console.log('Todo cargado, procesando notas...');
            processNotes();
            // ← NOTA: Ya NO ponemos nada aquí, todo va dentro de processNotes()
        }
    }

    // Observa cuando se añadan nodos al contenedor #TEI
    const observer = new MutationObserver(() => {
        // Verificar si el contenido TEI ya está cargado (buscar elementos tei-)
        if (teiContainer.querySelector('tei-l, tei-seg')) {
            if (!teiLoaded) {
                teiLoaded = true;
                console.log('TEI cargado');
                observer.disconnect();
                checkAndProcess();
            }
        }
    });

    // Inicia la observación en el contenedor TEI
    observer.observe(teiContainer, { childList: true, subtree: true });
    
    // Esperar a que las notas se carguen
    const checkNotas = setInterval(() => {
        if (window.notasXML && !notasLoaded) {
            notasLoaded = true;
            console.log('Notas cargadas');
            clearInterval(checkNotas);
            checkAndProcess();
        }
    }, 100);

    function processNotes() {
        if (!window.notasXML) return;

        // Obtener todas las notas del XML externo
        const notes = Array.from(window.notasXML.querySelectorAll('note'));

        // Ordenar las notas: primero las más específicas (seg), luego las generales (l)
        // Esto asegura que los wrappers internos se creen antes que los externos
        notes.sort((a, b) => {
            const targetA = a.getAttribute('target') || '';
            const targetB = b.getAttribute('target') || '';
            
            // Priorizar notas que apuntan a seg sobre las que apuntan a l
            const aIsSeg = targetA.includes('seg-');
            const bIsSeg = targetB.includes('seg-');
            
            if (aIsSeg && !bIsSeg) return -1;
            if (!aIsSeg && bIsSeg) return 1;
            
            // Si ambas son del mismo tipo, por número de targets (menos targets = más específico)
            const aCount = targetA.split(/\s+/).length;
            const bCount = targetB.split(/\s+/).length;
            return aCount - bCount;
        });

        notes.forEach(note => {
            const targetAttr = note.getAttribute('target');
            const noteId = note.getAttribute('xml:id');
            
            if (!targetAttr || !noteId) return;

            const targets = targetAttr.split(/\s+/).map(t => t.replace('#', ''));
            const targetElements = [];

            // Buscar todos los elementos target en el DOM
            targets.forEach(targetId => {
                let element = teiContainer.querySelector(`[xml\\:id="${targetId}"]`);
                
                if (!element) {
                    const allElements = teiContainer.querySelectorAll('*');
                    for (let el of allElements) {
                        if (el.getAttribute('xml:id') === targetId) {
                            element = el;
                            break;
                        }
                    }
                }
                
                if (element) {
                    targetElements.push(element);
                    console.log(`Encontrado target: ${targetId}`, element);
                } else {
                    console.warn(`No se encontró elemento con xml:id="${targetId}"`);
                }
            });

            if (targetElements.length === 0) return;

            console.log(`Procesando ${targetElements.length} elementos para nota ${noteId}`);

            // Añadir clase y eventos a cada elemento target
            targetElements.forEach(element => {
                // Buscar si ya existe un wrapper directo hijo del elemento
                let wrapperElement = null;
                
                // Verificar si el primer hijo es un wrapper
                if (element.firstElementChild && element.firstElementChild.classList.contains('note-wrapper')) {
                    wrapperElement = element.firstElementChild;
                } else {
                    // Si no hay wrapper, crear uno nuevo
                    wrapperElement = document.createElement('span');
                    wrapperElement.className = 'note-wrapper note-target';
                    
                    // Mover TODO el contenido del elemento al wrapper
                    // Importante: usar childNodes para incluir nodos de texto
                    const childNodes = Array.from(element.childNodes);
                    childNodes.forEach(child => {
                        wrapperElement.appendChild(child);
                    });
                    
                    // Añadir el wrapper al elemento
                    element.appendChild(wrapperElement);
                }
                
                // Asegurar que el wrapper tenga las clases necesarias
                if (!wrapperElement.classList.contains('note-target')) {
                    wrapperElement.classList.add('note-target');
                }
                
                console.log(`Wrapper configurado para:`, element, `Clases:`, wrapperElement.className);
                
                // Añadir el ID de nota a la lista de grupos
                const currentGroups = wrapperElement.getAttribute('data-note-groups') || '';
                const groups = currentGroups ? currentGroups.split(' ').filter(g => g) : [];
                if (!groups.includes(noteId)) {
                    groups.push(noteId);
                    wrapperElement.setAttribute('data-note-groups', groups.join(' '));
                    console.log(`Elemento ${element.getAttribute('xml:id')} asignado a grupo(s): ${groups.join(' ')}`);
                    
                    // Propagar el grupo a todos los wrappers descendientes
                    const childWrappers = wrapperElement.querySelectorAll('.note-wrapper');
                    childWrappers.forEach(childWrapper => {
                        const childGroups = childWrapper.getAttribute('data-note-groups') || '';
                        const childGroupsArray = childGroups ? childGroups.split(' ').filter(g => g) : [];
                        if (!childGroupsArray.includes(noteId)) {
                            childGroupsArray.push(noteId);
                            childWrapper.setAttribute('data-note-groups', childGroupsArray.join(' '));
                            console.log(`  - Propagado grupo ${noteId} a wrapper hijo`);
                        }
                    });
                }

                // Añadir eventos solo una vez por wrapper
                if (!wrapperElement.hasAttribute('data-note-events')) {
                    wrapperElement.setAttribute('data-note-events', 'true');
                    
                    // Evento mouseenter
                    wrapperElement.addEventListener('mouseenter', function(e) {
                        // Detener propagación para evitar activar múltiples notas anidadas
                        e.stopPropagation();
                        
                        const elementGroups = this.getAttribute('data-note-groups');
                        if (!elementGroups) return;
                        
                        const groupsArray = elementGroups.split(' ').filter(g => g);
                        
                        // Activar TODOS los grupos a los que pertenece este elemento
                        const allElements = teiContainer.querySelectorAll('[data-note-groups]');
                        allElements.forEach(el => {
                            const elGroupsStr = el.getAttribute('data-note-groups');
                            if (elGroupsStr) {
                                const elGroups = elGroupsStr.split(' ').filter(g => g);
                                // Si el elemento comparte algún grupo con el elemento actual, activarlo
                                const hasCommonGroup = groupsArray.some(group => elGroups.includes(group));
                                if (hasCommonGroup) {
                                    el.classList.add('note-active');
                                }
                            }
                        });
                    });

                    // Evento mouseleave
                    wrapperElement.addEventListener('mouseleave', function(e) {
                        e.stopPropagation();
                        
                        // Verificar si el destino del ratón es un wrapper relacionado
                        const relatedTarget = e.relatedTarget;
                        
                        // Si el destino es un wrapper con grupos compartidos, no desactivar
                        if (relatedTarget) {
                            // Buscar el wrapper más cercano del destino
                            const targetWrapper = relatedTarget.closest('.note-wrapper');
                            if (targetWrapper) {
                                const currentGroups = this.getAttribute('data-note-groups');
                                const targetGroups = targetWrapper.getAttribute('data-note-groups');
                                
                                if (currentGroups && targetGroups) {
                                    const currentGroupsArray = currentGroups.split(' ').filter(g => g);
                                    const targetGroupsArray = targetGroups.split(' ').filter(g => g);
                                    
                                    // Si comparten algún grupo, no desactivar
                                    const hasCommonGroup = currentGroupsArray.some(g => targetGroupsArray.includes(g));
                                    if (hasCommonGroup) {
                                        return; // No desactivar, el mouseenter del destino se encargará
                                    }
                                }
                            }
                        }
                        
                        // Si no hay destino relacionado, desactivar todo
                        const allActive = teiContainer.querySelectorAll('.note-active');
                        allActive.forEach(el => el.classList.remove('note-active'));
                    });
                    
                    // Evento click
                    wrapperElement.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const elementGroups = this.getAttribute('data-note-groups');
                        if (!elementGroups) return;
                        
                        const groupsArray = elementGroups.split(' ').filter(g => g);
                        const activeGroup = groupsArray[0];
                        
                        console.log('Click en elemento, mostrando nota:', activeGroup);
                        
                        // Buscar la nota en el XML
                        let noteToShow = null;
                        const allNotes = window.notasXML.getElementsByTagName('note');
                        for (let note of allNotes) {
                            if (note.getAttribute('xml:id') === activeGroup) {
                                noteToShow = note;
                                break;
                            }
                        }
                        
                        if (noteToShow) {
                            const noteNumber = noteToShow.getAttribute('n') || '';
                            const noteXmlId = noteToShow.getAttribute('xml:id') || '';
                            noteContentDiv.innerHTML = `
                                <div class="note-display">
                                    <h5>Nota ${noteNumber}</h5>
                                    <p>${noteToShow.textContent.trim()}</p>
                                    <div class="note-footer">
                                        <small class="note-id">ID: ${noteXmlId}</small>
                                    </div>
                                </div>
                            `;
                        } else {
                            noteContentDiv.innerHTML = '<p>Nota no encontrada.</p>';
                            console.error('No se encontró nota con xml:id:', activeGroup);
                        }
                    });
                }
            });
        });

        // ← AQUÍ VA TODO AL FINAL DE processNotes():
        console.log('Notas procesadas correctamente');
        
        // Inicializar sistema de evaluación
        if (window.edicionEvaluacion) {
            window.edicionEvaluacion.init();
        }
    } // ← Fin de processNotes()
    
    
    // Llamar a la función de alineación después de que el TEI esté cargado
    const verseObserver = new MutationObserver(() => {
        if (teiContainer.querySelector('tei-l[part]')) {
            alignSplitVerses(teiContainer);
            verseObserver.disconnect();
        }
    });
    
    verseObserver.observe(teiContainer, { childList: true, subtree: true });
    
    // Funcionalidad para redimensionar el panel de notas
    const resizeHandle = document.getElementById('resize-handle');
    const notesColumn = document.querySelector('.notes-column');
    
    if (resizeHandle && notesColumn) {
        let isResizing = false;
        
        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            
            const windowWidth = window.innerWidth;
            const mouseX = e.clientX;
            const newWidth = ((windowWidth - mouseX) / windowWidth) * 100;
            
            // Limitar entre 20% y 50%
            if (newWidth >= 20 && newWidth <= 50) {
                notesColumn.style.width = newWidth + '%';
            }
        });
        
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
});
