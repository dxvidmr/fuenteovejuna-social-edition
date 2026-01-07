#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extraer las posiciones de las notas de los archivos HTML
y crear un mapeo de dónde debe ir cada nota en el XML
"""

import re
from pathlib import Path
from bs4 import BeautifulSoup
import json


def limpiar_texto(texto):
    """Limpia el texto de espacios y entidades HTML"""
    # Convertir entidades HTML comunes
    conversiones = {
        '&ntilde;': 'ñ',
        '&aacute;': 'á',
        '&eacute;': 'é',
        '&iacute;': 'í',
        '&oacute;': 'ó',
        '&uacute;': 'ú',
        '&Ntilde;': 'Ñ',
        '&Aacute;': 'Á',
        '&Eacute;': 'É',
        '&Iacute;': 'Í',
        '&Oacute;': 'Ó',
        '&Uacute;': 'Ú',
        '&iquest;': '¿',
        '&iexcl;': '¡',
        '&ordm;': 'º',
        '&ordf;': 'ª',
    }
    
    for entidad, caracter in conversiones.items():
        texto = texto.replace(entidad, caracter)
    
    # Normalizar espacios
    texto = ' '.join(texto.split())
    return texto


def extraer_notas_de_html(archivo_html):
    """
    Extrae las posiciones de las notas de un archivo HTML
    Retorna una lista de diccionarios con: número de nota, contexto previo, palabra anotada
    """
    with open(archivo_html, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    soup = BeautifulSoup(contenido, 'html.parser')
    notas_encontradas = []
    
    # Buscar todos los <sup> que contienen números de nota
    for sup in soup.find_all('sup'):
        link = sup.find('a')
        if link and link.string and link.string.strip().isdigit():
            numero_nota = int(link.string.strip())
            
            # Obtener el contexto alrededor del superíndice
            # Buscar el td o elemento padre que contiene el texto
            parent = sup.parent
            while parent and parent.name not in ['td', 'p', 'strong']:
                parent = parent.parent
            
            if parent:
                # Obtener todo el texto del elemento padre
                texto_completo = parent.get_text()
                texto_completo = limpiar_texto(texto_completo)
                
                # Encontrar la posición aproximada del superíndice en el texto limpio
                # El superíndice suele ir después de una palabra
                texto_antes_sup = ''
                for child in parent.children:
                    if child == sup:
                        break
                    if hasattr(child, 'find') and hasattr(child.find, '__call__'):
                        try:
                            if child.find(sup):
                                break
                        except:
                            pass
                    if hasattr(child, 'get_text'):
                        texto_antes_sup += child.get_text()
                    elif isinstance(child, str):
                        texto_antes_sup += child
                
                texto_antes_sup = limpiar_texto(texto_antes_sup)
                
                # Extraer las últimas palabras antes del superíndice (contexto)
                palabras = texto_antes_sup.strip().split()
                if palabras:
                    # Tomar las últimas 5 palabras como contexto
                    contexto = ' '.join(palabras[-5:]) if len(palabras) >= 5 else ' '.join(palabras)
                    palabra_anotada = palabras[-1]
                    
                    notas_encontradas.append({
                        'numero': numero_nota,
                        'palabra': palabra_anotada,
                        'contexto': contexto,
                        'texto_completo': texto_completo[:200]  # Primeros 200 caracteres para referencia
                    })
    
    return notas_encontradas


def main():
    """Función principal"""
    script_dir = Path(__file__).parent
    html_dir = script_dir.parent / 'html'
    
    print("Extrayendo posiciones de notas de los archivos HTML...")
    
    todas_las_notas = []
    
    # Procesar todos los archivos HTML
    archivos_html = sorted(html_dir.glob('*.html'))
    
    for archivo in archivos_html:
        print(f"\nProcesando: {archivo.name}")
        notas = extraer_notas_de_html(archivo)
        todas_las_notas.extend(notas)
        print(f"  Encontradas {len(notas)} notas")
    
    # Ordenar por número de nota
    todas_las_notas.sort(key=lambda x: x['numero'])
    
    print(f"\n✓ Total de notas encontradas: {len(todas_las_notas)}")
    
    # Guardar en JSON para análisis
    output_file = script_dir.parent / 'posiciones_notas.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(todas_las_notas, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Posiciones guardadas en: {output_file}")
    
    # Mostrar algunas muestras
    print("\n=== Muestras de notas encontradas ===")
    for nota in todas_las_notas[:10]:
        print(f"\nNota {nota['numero']}:")
        print(f"  Palabra: {nota['palabra']}")
        print(f"  Contexto: ...{nota['contexto']}")
    
    # Verificar si hay notas consecutivas
    numeros = [n['numero'] for n in todas_las_notas]
    print(f"\n=== Rango de notas ===")
    print(f"Primera nota: {min(numeros)}")
    print(f"Última nota: {max(numeros)}")
    print(f"Total únicas: {len(set(numeros))}")
    
    # Detectar notas faltantes
    faltantes = []
    for i in range(min(numeros), max(numeros) + 1):
        if i not in numeros:
            faltantes.append(i)
    
    if faltantes:
        print(f"\nNotas no encontradas en HTML: {faltantes[:20]}")
        if len(faltantes) > 20:
            print(f"  ... y {len(faltantes) - 20} más")


if __name__ == '__main__':
    main()
