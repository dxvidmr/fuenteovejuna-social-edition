#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Limpia espacios en blanco innecesarios antes de signos de puntuación en XML TEI.

Elimina espacios, tabulaciones y saltos de línea que aparecen inmediatamente
antes de signos de puntuación como , ? : ; . ! )

Uso:
  python limpiar_espacios_puntuacion.py archivo.xml --inplace --backup
"""

import argparse
import sys
import shutil
import re


def parse_args():
    p = argparse.ArgumentParser(
        description='Limpiar espacios antes de puntuación en XML TEI'
    )
    p.add_argument('input', help='Archivo XML de entrada')
    p.add_argument(
        '-o', '--output',
        help='Archivo de salida (default: input.clean.xml o sobrescribe con --inplace)'
    )
    p.add_argument(
        '--inplace', action='store_true',
        help='Sobrescribir archivo de entrada'
    )
    p.add_argument(
        '--backup', action='store_true',
        help='Hacer copia de seguridad antes de sobrescribir (input.bak)'
    )
    return p.parse_args()


def limpiar_espacios_puntuacion(texto):
    """
    Limpia espacios en blanco antes de signos de puntuación.
    
    Estrategia:
    - Elimina espacios/tabs/newlines antes de: , ? : ; . ! ) ]
    - Elimina espacios después de > si van seguidos de puntuación (ej: <tag>, texto)
    - Preserva un solo espacio después de etiquetas XML cerradas si es necesario
    """
    
    # Patrones de puntuación problemática
    # Busca: espacios en blanco (incluye \n, \t, espacios) + signo de puntuación
    patrones = [
        (r'\s+([,?:;.!)\]])', r'\1'),  # Eliminar espacios antes de puntuación
        (r'>\s+([,?:;.!])', r'>\1'),   # Eliminar espacios después de > si sigue puntuación
        (r'\s+(\s*</)', r'\1'),         # Limpiar espacios extra antes de cierre de etiquetas
    ]
    
    resultado = texto
    for patron, reemplazo in patrones:
        resultado = re.sub(patron, reemplazo, resultado)
    
    return resultado


def limpiar_archivo(input_path, output_path):
    """Lee el archivo, limpia y guarda."""
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            contenido = f.read()
    except Exception as e:
        print(f'Error leyendo {input_path}: {e}', file=sys.stderr)
        sys.exit(1)
    
    # Contar ocurrencias antes
    import re
    antes = len(re.findall(r'\s+[,?:;.!)\]]', contenido))
    
    # Limpiar
    contenido_limpio = limpiar_espacios_puntuacion(contenido)
    
    # Contar después
    despues = len(re.findall(r'\s+[,?:;.!)\]]', contenido_limpio))
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(contenido_limpio)
    except Exception as e:
        print(f'Error escribiendo {output_path}: {e}', file=sys.stderr)
        sys.exit(1)
    
    return antes, despues


def main():
    args = parse_args()
    
    # Determinar ruta de salida
    if args.inplace:
        out_path = args.input
        if args.backup:
            shutil.copy2(args.input, args.input + '.bak')
            print(f'✓ Backup creado: {args.input}.bak')
    else:
        if args.output:
            out_path = args.output
        else:
            if args.input.lower().endswith('.xml'):
                out_path = args.input[:-4] + '.clean.xml'
            else:
                out_path = args.input + '.clean.xml'
    
    # Limpiar
    antes, despues = limpiar_archivo(args.input, out_path)
    
    print(f'✓ Limpieza completada')
    print(f'  Espacios antes de puntuación encontrados: {antes}')
    print(f'  Espacios restantes: {despues}')
    print(f'  Espacios eliminados: {antes - despues}')
    print(f'  Archivo guardado: {out_path}')


if __name__ == '__main__':
    main()
