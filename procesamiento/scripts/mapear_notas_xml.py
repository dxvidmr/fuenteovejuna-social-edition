#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para mapear las notas del HTML al XML de Fuenteovejuna
Busca las palabras anotadas en el XML y sugiere dónde insertar cada nota
"""

import re
import json
from pathlib import Path
from lxml import etree


def normalizar_texto(texto):
    """Normaliza el texto para comparación"""
    # Convertir a minúsculas
    texto = texto.lower()
    # Eliminar signos de puntuación y espacios extras
    texto = re.sub(r'[¿?¡!,;:.—\-\(\)\[\]«»""]', '', texto)
    texto = ' '.join(texto.split())
    return texto


def encontrar_palabra_en_xml(xml_file, palabra, contexto, numero_nota, num_linea_aprox=None):
    """
    Busca una palabra en el XML y retorna las posibles ubicaciones
    """
    tree = etree.parse(xml_file)
    root = tree.getroot()
    
    # Definir namespaces
    ns = {'tei': 'http://www.tei-c.org/ns/1.0'}
    
    palabra_norm = normalizar_texto(palabra)
    contexto_norm = normalizar_texto(contexto)
    
    candidatos = []
    
    # Buscar en todos los elementos <l> (versos)
    for l in root.xpath('.//tei:l', namespaces=ns):
        num_verso = l.get('n', '')
        texto_verso = ''.join(l.itertext())
        texto_verso_norm = normalizar_texto(texto_verso)
        
        # Verificar si la palabra está en este verso
        if palabra_norm in texto_verso_norm:
            # Calcular score de coincidencia con el contexto
            # Buscar palabras del contexto en el verso
            palabras_contexto = contexto_norm.split()
            palabras_encontradas = sum(1 for p in palabras_contexto if p in texto_verso_norm)
            score = palabras_encontradas / len(palabras_contexto) if palabras_contexto else 0
            
            # Buscar en versos adyacentes para mejor contexto
            parent = l.getparent()
            if parent is not None:
                index = list(parent).index(l)
                versos_cerca = []
                for i in range(max(0, index-2), min(len(parent), index+3)):
                    if i < len(parent) and parent[i].tag.endswith('l'):
                        versos_cerca.append(''.join(parent[i].itertext()))
                contexto_ampliado = ' '.join(versos_cerca)
                contexto_ampliado_norm = normalizar_texto(contexto_ampliado)
                
                # Recalcular score con contexto ampliado
                palabras_encontradas_amp = sum(1 for p in palabras_contexto if p in contexto_ampliado_norm)
                score_ampliado = palabras_encontradas_amp / len(palabras_contexto) if palabras_contexto else 0
                
                if score_ampliado > score:
                    score = score_ampliado
            
            candidatos.append({
                'verso': num_verso,
                'texto': texto_verso.strip(),
                'score': score,
                'xpath': tree.getpath(l)
            })
    
    # Ordenar por score
    candidatos.sort(key=lambda x: x['score'], reverse=True)
    
    return candidatos


def main():
    """Función principal"""
    script_dir = Path(__file__).parent
    posiciones_file = script_dir.parent / 'posiciones_notas.json'
    xml_file = script_dir.parent / 'fuenteovejuna.xml'
    
    print("Mapeando notas del HTML al XML...\n")
    
    # Cargar posiciones de notas
    with open(posiciones_file, 'r', encoding='utf-8') as f:
        notas = json.load(f)
    
    print(f"Notas a procesar: {len(notas)}")
    
    # Procesar cada nota
    mapeo = []
    no_encontradas = []
    multiples = []
    
    for i, nota in enumerate(notas, 1):
        numero = nota['numero']
        palabra = nota['palabra']
        contexto = nota['contexto']
        
        if i % 50 == 0:
            print(f"Procesando nota {i}/{len(notas)}...")
        
        candidatos = encontrar_palabra_en_xml(xml_file, palabra, contexto, numero)
        
        if not candidatos:
            no_encontradas.append(nota)
        elif len(candidatos) == 1 or (len(candidatos) > 1 and candidatos[0]['score'] > candidatos[1]['score']):
            # Hay un candidato claro
            mapeo.append({
                'numero_nota': numero,
                'palabra': palabra,
                'verso': candidatos[0]['verso'],
                'texto_verso': candidatos[0]['texto'],
                'score': candidatos[0]['score'],
                'xpath': candidatos[0]['xpath']
            })
        else:
            # Múltiples candidatos con scores similares
            multiples.append({
                'numero_nota': numero,
                'palabra': palabra,
                'contexto': contexto,
                'candidatos': candidatos[:5]  # Top 5
            })
    
    # Guardar resultados
    output_file = script_dir.parent / 'mapeo_notas.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'mapeo': mapeo,
            'no_encontradas': no_encontradas,
            'multiples': multiples
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Mapeo guardado en: {output_file}")
    print(f"\n=== Estadísticas ===")
    print(f"Notas mapeadas correctamente: {len(mapeo)}")
    print(f"Notas no encontradas: {len(no_encontradas)}")
    print(f"Notas con múltiples candidatos: {len(multiples)}")
    
    if no_encontradas:
        print(f"\n=== Primeras 10 notas no encontradas ===")
        for nota in no_encontradas[:10]:
            print(f"  Nota {nota['numero']}: '{nota['palabra']}' - Contexto: {nota['contexto']}")
    
    if multiples:
        print(f"\n=== Primeras 5 notas con múltiples candidatos ===")
        for nota in multiples[:5]:
            print(f"\n  Nota {nota['numero_nota']}: '{nota['palabra']}'")
            for i, cand in enumerate(nota['candidatos'][:3], 1):
                print(f"    {i}. Verso {cand['verso']}: {cand['texto'][:60]}... (score: {cand['score']:.2f})")


if __name__ == '__main__':
    main()
