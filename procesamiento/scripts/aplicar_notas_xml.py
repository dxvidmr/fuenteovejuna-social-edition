#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para aplicar las notas al XML de Fuenteovejuna
Inserta los números de nota en el texto para posterior conversión a <seg>
"""

import json
import re
from pathlib import Path
from lxml import etree
import shutil


def normalizar_texto_simple(texto):
    """Normaliza texto para búsqueda simple"""
    return texto.lower().strip()


def insertar_nota_en_verso(l_elem, palabra, numero_nota):
    """
    Inserta el número de nota después de una palabra específica en un verso.
    Retorna True si se insertó correctamente.
    """
    # Obtener todo el texto del verso
    texto_completo = ''.join(l_elem.itertext())
    palabra_lower = palabra.lower()
    
    # Buscar la palabra en el texto (case insensitive)
    texto_lower = texto_completo.lower()
    
    # Intentar encontrar la palabra completa
    patron = r'\b' + re.escape(palabra_lower) + r'\b'
    match = re.search(patron, texto_lower)
    
    if not match:
        # Intentar búsqueda más flexible si no hay match exacto
        if palabra_lower in texto_lower:
            pos_inicio = texto_lower.index(palabra_lower)
            pos_fin = pos_inicio + len(palabra_lower)
        else:
            return False
    else:
        pos_inicio = match.start()
        pos_fin = match.end()
    
    # Reconstruir el verso insertando la nota
    # Necesitamos mantener la estructura XML si hay elementos internos
    
    if len(l_elem) == 0 and l_elem.text:
        # Caso simple: solo texto sin elementos hijos
        texto = l_elem.text
        l_elem.text = texto[:pos_fin] + '{' + str(numero_nota) + '}' + texto[pos_fin:]
        return True
    
    # Caso complejo: hay elementos hijos (como <seg>)
    # Necesitamos encontrar en qué parte está el texto
    posicion_actual = 0
    
    # Revisar texto inicial
    if l_elem.text:
        len_texto = len(l_elem.text)
        if pos_fin <= len_texto:
            l_elem.text = l_elem.text[:pos_fin] + '{' + str(numero_nota) + '}' + l_elem.text[pos_fin:]
            return True
        posicion_actual += len_texto
    
    # Revisar elementos hijos
    for child in l_elem:
        if child.text:
            len_texto = len(child.text)
            if posicion_actual <= pos_fin <= posicion_actual + len_texto:
                pos_relativa = pos_fin - posicion_actual
                child.text = child.text[:pos_relativa] + '{' + str(numero_nota) + '}' + child.text[pos_relativa:]
                return True
            posicion_actual += len_texto
        
        if child.tail:
            len_tail = len(child.tail)
            if posicion_actual <= pos_fin <= posicion_actual + len_tail:
                pos_relativa = pos_fin - posicion_actual
                child.tail = child.tail[:pos_relativa] + '{' + str(numero_nota) + '}' + child.tail[pos_relativa:]
                return True
            posicion_actual += len_tail
    
    return False


def aplicar_notas_automaticas(xml_file, mapeo_data):
    """
    Aplica las notas con mapeo claro al XML
    """
    # Hacer backup del XML original
    backup_file = xml_file.parent / (xml_file.stem + '_backup.xml')
    shutil.copy2(xml_file, backup_file)
    print(f"✓ Backup creado: {backup_file}")
    
    # Parsear XML
    tree = etree.parse(xml_file)
    root = tree.getroot()
    ns = {'tei': 'http://www.tei-c.org/ns/1.0'}
    
    aplicadas = []
    fallidas = []
    
    print("\nAplicando notas al XML...")
    
    for i, item in enumerate(mapeo_data['mapeo'], 1):
        numero_nota = item['numero_nota']
        palabra = item['palabra']
        verso_num = item['verso']
        
        if i % 100 == 0:
            print(f"  Procesando {i}/{len(mapeo_data['mapeo'])}...")
        
        # Buscar el verso por número
        versos = root.xpath(f'.//tei:l[@n="{verso_num}"]', namespaces=ns)
        
        if not versos:
            fallidas.append({
                'numero_nota': numero_nota,
                'motivo': f'Verso {verso_num} no encontrado',
                'palabra': palabra
            })
            continue
        
        l_elem = versos[0]
        
        # Intentar insertar la nota
        if insertar_nota_en_verso(l_elem, palabra, numero_nota):
            aplicadas.append(numero_nota)
        else:
            fallidas.append({
                'numero_nota': numero_nota,
                'motivo': f'No se pudo insertar en verso {verso_num}',
                'palabra': palabra,
                'texto_verso': ''.join(l_elem.itertext())
            })
    
    # Guardar XML modificado
    tree.write(str(xml_file), encoding='utf-8', xml_declaration=True, pretty_print=True)
    
    return aplicadas, fallidas


def generar_informe_revision(mapeo_data, fallidas_automaticas, output_file):
    """
    Genera un informe CSV de las notas que requieren revisión manual
    """
    lineas = []
    lineas.append('Número Nota,Tipo Problema,Palabra,Contexto,Candidatos/Motivo')
    
    # Notas no encontradas
    for nota in mapeo_data['no_encontradas']:
        lineas.append(f'{nota["numero"]},No encontrada,{nota["palabra"]},"{nota["contexto"]}",Palabra no existe en XML')
    
    # Notas con múltiples candidatos
    for nota in mapeo_data['multiples']:
        candidatos_str = ' | '.join([f'v{c["verso"]}: {c["texto"][:40]}...' for c in nota['candidatos'][:3]])
        lineas.append(f'{nota["numero_nota"]},Múltiples candidatos,{nota["palabra"]},"{nota["contexto"]}","{candidatos_str}"')
    
    # Notas que fallaron en la aplicación automática
    for nota in fallidas_automaticas:
        motivo = nota['motivo']
        texto_verso = nota.get('texto_verso', 'N/A')[:50]
        lineas.append(f'{nota["numero_nota"]},Falló inserción,{nota["palabra"]},{motivo},"{texto_verso}"')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lineas))


def main():
    """Función principal"""
    script_dir = Path(__file__).parent
    xml_file = script_dir.parent / 'fuenteovejuna.xml'
    mapeo_file = script_dir.parent / 'mapeo_notas.json'
    informe_file = script_dir.parent / 'notas_revision_manual.csv'
    
    print("=== Aplicación automática de notas ===\n")
    
    # Cargar mapeo
    with open(mapeo_file, 'r', encoding='utf-8') as f:
        mapeo_data = json.load(f)
    
    print(f"Notas con mapeo claro: {len(mapeo_data['mapeo'])}")
    print(f"Notas no encontradas: {len(mapeo_data['no_encontradas'])}")
    print(f"Notas ambiguas: {len(mapeo_data['multiples'])}")
    
    # Aplicar notas automáticas
    aplicadas, fallidas_auto = aplicar_notas_automaticas(xml_file, mapeo_data)
    
    print(f"\n✓ Notas aplicadas exitosamente: {len(aplicadas)}")
    print(f"✗ Notas que fallaron en aplicación: {len(fallidas_auto)}")
    
    # Generar informe de revisión
    generar_informe_revision(mapeo_data, fallidas_auto, informe_file)
    print(f"\n✓ Informe de revisión guardado en: {informe_file}")
    
    total_revisar = len(mapeo_data['no_encontradas']) + len(mapeo_data['multiples']) + len(fallidas_auto)
    print(f"\n=== RESUMEN ===")
    print(f"✓ Notas insertadas automáticamente: {len(aplicadas)}")
    print(f"⚠ Notas que requieren revisión manual: {total_revisar}")
    print(f"  - No encontradas en XML: {len(mapeo_data['no_encontradas'])}")
    print(f"  - Múltiples candidatos: {len(mapeo_data['multiples'])}")
    print(f"  - Fallaron al insertar: {len(fallidas_auto)}")
    
    print(f"\nFormato de notas insertadas: palabra{{número}}")
    print(f"Ejemplo: Maestre{{1}}")
    print(f"\nPróximo paso: Revisar {informe_file} y aplicar manualmente las notas restantes")


if __name__ == '__main__':
    main()
