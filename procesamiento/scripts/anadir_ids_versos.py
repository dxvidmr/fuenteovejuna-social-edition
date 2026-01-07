#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para añadir xml:id a todos los versos del XML
Convención: xml:id="l-numerodeverso" o "l-numerodeverso-a/b/c/d" para versos partidos
"""

import xml.etree.ElementTree as ET
import re
from collections import defaultdict

# Ruta al archivo XML
xml_file = r'c:\Users\david\OneDrive - UAB\Documents\Todos a una\digital-edition\fuenteovejuna.xml'
backup_file = r'c:\Users\david\OneDrive - UAB\Documents\Todos a una\digital-edition\fuenteovejuna_backup_ids.xml'

# Registrar namespace TEI
ET.register_namespace('', 'http://www.tei-c.org/ns/1.0')
ET.register_namespace('xml', 'http://www.w3.org/XML/1998/namespace')

# Parsear el archivo
tree = ET.parse(xml_file)
root = tree.getroot()

# Namespace
ns = {'tei': 'http://www.tei-c.org/ns/1.0', 'xml': 'http://www.w3.org/XML/1998/namespace'}

# Contador de versos procesados
versos_actualizados = 0
versos_ya_con_id = 0

# Diccionario para trackear cuántas partes hemos procesado de cada número
contador_partes = defaultdict(int)

# Variable para guardar el último número de verso visto (para versos partidos sin n)
ultimo_numero_verso = None

# Segunda pasada: añadir IDs
for l in root.findall('.//tei:l', ns):
    n_attr = l.get('n')
    part_attr = l.get('part')
    
    # Verificar si ya tiene xml:id
    existing_id = l.get('{http://www.w3.org/XML/1998/namespace}id')
    
    # Si tiene n, actualizamos el último número visto
    if n_attr:
        ultimo_numero_verso = n_attr
    
    # Determinar qué número usar: si tiene n, ese; si no y tiene part, usar el último visto
    numero_a_usar = n_attr if n_attr else (ultimo_numero_verso if part_attr else None)
    
    if numero_a_usar:
        if existing_id:
            versos_ya_con_id += 1
            # IMPORTANTE: si ya tiene ID y es un verso partido, debemos incrementar el contador
            if part_attr:
                contador_partes[numero_a_usar] += 1
            print(f"Verso n={numero_a_usar} ya tiene xml:id={existing_id}")
        else:
            # Determinar el ID a asignar
            if part_attr:
                # Verso partido - asignar sufijo según el orden de aparición
                # Contar cuántas partes de este número hemos procesado
                indice_parte = contador_partes[numero_a_usar]
                contador_partes[numero_a_usar] += 1
                
                # Convertir índice a sufijo: 0->a, 1->b, 2->c, 3->d, etc.
                sufijo = chr(ord('a') + indice_parte)
                
                new_id = f"l-{numero_a_usar}-{sufijo}"
            else:
                # Verso completo
                new_id = f"l-{numero_a_usar}"
            
            l.set('{http://www.w3.org/XML/1998/namespace}id', new_id)
            versos_actualizados += 1
            print(f"Añadido xml:id={new_id} a verso" + (f" n={n_attr}" if n_attr else f" (usando n={numero_a_usar})") + (f" part={part_attr}" if part_attr else ""))

# Hacer backup del archivo original
import shutil
shutil.copy2(xml_file, backup_file)
print(f"\nBackup creado en: {backup_file}")

# Guardar el archivo modificado
tree.write(xml_file, encoding='utf-8', xml_declaration=True)

print(f"\n=== RESUMEN ===")
print(f"Versos con IDs añadidos: {versos_actualizados}")
print(f"Versos que ya tenían ID: {versos_ya_con_id}")
print(f"Total de versos procesados: {versos_actualizados + versos_ya_con_id}")
print(f"\nArchivo actualizado: {xml_file}")
