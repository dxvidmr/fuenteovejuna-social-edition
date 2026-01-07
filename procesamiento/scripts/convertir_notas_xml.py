#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para convertir notas.txt a formato XML TEI
"""

import re
from pathlib import Path


def convertir_notas_a_xml(archivo_entrada, archivo_salida=None):
    """
    Convierte el archivo de notas en formato XML TEI.
    
    Parámetros:
        archivo_entrada: ruta al archivo notas.txt
        archivo_salida: ruta del archivo XML de salida (opcional)
    """
    
    # Leer el archivo de notas
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Lista para almacenar las notas procesadas
    notas = []
    
    # Dividir el contenido en líneas
    lineas = contenido.split('\n')
    
    nota_actual = None
    numero_actual = None
    texto_actual = []
    
    for linea in lineas:
        # Verificar si la línea comienza con un número (inicio de nueva nota)
        match = re.match(r'^(\d+)\s+(.*)$', linea)
        
        if match:
            # Si había una nota anterior, guardarla
            if nota_actual is not None:
                notas.append({
                    'numero': numero_actual,
                    'texto': ' '.join(texto_actual).strip()
                })
            
            # Iniciar nueva nota
            numero_actual = match.group(1)
            nota_actual = linea
            texto_actual = [match.group(2)]
        else:
            # Continuar con el texto de la nota actual
            if nota_actual is not None and linea.strip():
                texto_actual.append(linea.strip())
    
    # Añadir la última nota
    if nota_actual is not None:
        notas.append({
            'numero': numero_actual,
            'texto': ' '.join(texto_actual).strip()
        })
    
    # Generar XML
    xml_lines = []
    xml_lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    xml_lines.append('<notes>')
    xml_lines.append('')
    
    for nota in notas:
        xml_lines.append(f'<note')
        xml_lines.append(f'  xml:id=""')
        xml_lines.append(f'  target="#"')
        xml_lines.append(f'  type=""')
        xml_lines.append(f'  version="v1.0">')
        xml_lines.append(f'  {nota["numero"]} {nota["texto"]}')
        xml_lines.append(f'</note>')
        xml_lines.append('')
    
    xml_lines.append('</notes>')
    
    # Guardar el resultado
    if archivo_salida is None:
        archivo_salida = Path(archivo_entrada).parent / 'notas.xml'
    
    with open(archivo_salida, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_lines))
    
    print(f"✓ Archivo XML generado: {archivo_salida}")
    print(f"✓ Total de notas procesadas: {len(notas)}")
    
    return archivo_salida


def main():
    """Función principal"""
    # Ruta por defecto al archivo de notas
    script_dir = Path(__file__).parent
    archivo_notas = script_dir.parent / 'notas.txt'
    archivo_salida = script_dir.parent / 'notas.xml'
    
    print("Convirtiendo notas a formato XML...")
    print(f"Archivo de entrada: {archivo_notas}")
    
    if not archivo_notas.exists():
        print(f"Error: No se encuentra el archivo {archivo_notas}")
        return
    
    convertir_notas_a_xml(archivo_notas, archivo_salida)


if __name__ == '__main__':
    main()
