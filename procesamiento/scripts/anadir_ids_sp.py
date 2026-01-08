#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Asignar xml:id secuenciales a todos los elementos <sp> de un archivo XML/TEI.

Por defecto sobrescribe ids existentes (para asegurarse de que son secuenciales).
Opciones disponibles:
  - --preserve : no modificar ids existentes (solo añade donde faltan)
  - --inplace  : sobrescribir el archivo de entrada (puedes usar --backup para copiar .bak)
  - --output   : fichero de salida
  - --prefix   : prefijo del id (default: sp)
  - --start    : número inicial (default: 1)

Ejemplo:
  python anadir_ids_sp.py assets/xml/fuenteovejuna.xml --inplace --backup
"""

import argparse
import sys
import shutil
import xml.etree.ElementTree as ET

XML_NS = 'http://www.w3.org/XML/1998/namespace'
XML_ID_ATTR = '{%s}id' % XML_NS


def parse_args():
    p = argparse.ArgumentParser(description='Asignar xml:id secuenciales a elementos <sp>')
    p.add_argument('input', help='Archivo XML/TEI de entrada')
    p.add_argument('-o', '--output', help='Archivo de salida (por defecto: input.ids.xml o sobrescribe con --inplace)')
    p.add_argument('--inplace', action='store_true', help='Sobrescribir archivo de entrada')
    p.add_argument('--backup', action='store_true', help='Hacer copia de seguridad antes de sobrescribir (input.bak)')
    p.add_argument('--prefix', default='sp', help='Prefijo para los ids (default: sp)')
    p.add_argument('--start', type=int, default=1, help='Número inicial (default: 1)')
    p.add_argument('--preserve', action='store_true', help='No modificar xml:id ya existentes (solo añadir donde falta)')
    return p.parse_args()


def local_name(tag):
    return tag.split('}')[-1] if '}' in tag else tag


def pretty_write(tree, out_path):
    """Escribe el árbol XML intentando:
      - usar el namespace por defecto (sin prefijo ns0:)
      - indentar usando `xml.etree.ElementTree.indent` si está disponible
      - evitar las dobles líneas en blanco que introduce minidom.toprettyxml
    """
    root = tree.getroot()

    # Registrar namespace por defecto si el root está en un namespace
    if '}' in root.tag:
        ns = root.tag.split('}')[0].strip('{')
        ET.register_namespace('', ns)

    # Registrar prefijo xml para xml:id
    ET.register_namespace('xml', XML_NS)

    # Intentar indentar con ET.indent (Python 3.9+). No usamos minidom.toprettyxml
    try:
        ET.indent(tree, space='  ')
    except Exception:
        pass

    try:
        tree.write(out_path, encoding='utf-8', xml_declaration=True)

        # Eliminar líneas en blanco consecutivas extra (si las hubiera)
        with open(out_path, 'r', encoding='utf-8') as fh:
            lines = fh.readlines()
        new_lines = []
        prev_blank = False
        for ln in lines:
            if ln.strip() == '':
                if not prev_blank:
                    new_lines.append(ln)
                    prev_blank = True
                else:
                    # saltar línea en blanco extra
                    continue
            else:
                new_lines.append(ln)
                prev_blank = False
        with open(out_path, 'w', encoding='utf-8') as fh:
            fh.writelines(new_lines)
    except Exception:
        # fallback sencillo
        tree.write(out_path, encoding='utf-8', xml_declaration=True)


def main():
    args = parse_args()

    try:
        tree = ET.parse(args.input)
    except Exception as e:
        print(f'Error leyendo {args.input}: {e}', file=sys.stderr)
        sys.exit(1)

    root = tree.getroot()
    sp_elems = [e for e in root.iter() if local_name(e.tag) == 'sp']

    i = args.start
    for e in sp_elems:
        # Si preserve está activo y ya existe xml:id, la dejamos
        if args.preserve and e.get(XML_ID_ATTR) is not None:
            i += 1
            continue
        new_id = f"{args.prefix}-{i}"
        e.set(XML_ID_ATTR, new_id)
        i += 1

    # Determinar ruta de salida
    if args.inplace:
        out_path = args.input
        if args.backup:
            shutil.copy2(args.input, args.input + '.bak')
    else:
        if args.output:
            out_path = args.output
        else:
            if args.input.lower().endswith('.xml'):
                out_path = args.input[:-4] + '.ids.xml'
            else:
                out_path = args.input + '.ids.xml'

    # Registrar prefijo xml para asegurar que sale como xml:id
    ET.register_namespace('xml', XML_NS)

    try:
        pretty_write(tree, out_path)
    except Exception as e:
        print(f'Error escribiendo {out_path}: {e}', file=sys.stderr)
        sys.exit(1)

    print(f'Procesados {len(sp_elems)} elementos <sp>. IDs asignados desde {args.prefix}-{args.start} en {out_path}')


if __name__ == '__main__':
    main()
