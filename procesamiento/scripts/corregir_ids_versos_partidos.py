#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corregir IDs de versos partidos con parte F que tienen -a
Cambia el sufijo de -a a -b en todos los versos con part="F"
"""

import xml.etree.ElementTree as ET
import re

# Ruta al archivo XML
xml_file = r'c:\Users\david\OneDrive - UAB\Documents\Todos a una\digital-edition\fuenteovejuna.xml'
backup_file = r'c:\Users\david\OneDrive - UAB\Documents\Todos a una\digital-edition\fuenteovejuna_backup_correccion.xml'

# Registrar namespace TEI
ET.register_namespace('', 'http://www.tei-c.org/ns/1.0')
ET.register_namespace('xml', 'http://www.w3.org/XML/1998/namespace')

# Parsear el archivo
tree = ET.parse(xml_file)
root = tree.getroot()

# Namespace
ns = {'tei': 'http://www.tei-c.org/ns/1.0', 'xml': 'http://www.w3.org/XML/1998/namespace'}

# Contador de correcciones
correcciones = 0

# Buscar todos los versos con part="F" que tengan xml:id terminando en -a
for l in root.findall('.//tei:l', ns):
    part_attr = l.get('part')
    xml_id = l.get('{http://www.w3.org/XML/1998/namespace}id')
    
    # Si es parte F y tiene xml:id terminando en -a
    if part_attr == 'F' and xml_id and xml_id.endswith('-a'):
        old_id = xml_id
        # Cambiar el sufijo de -a a -b
        new_id = re.sub(r'-a$', '-b', old_id)
        
        l.set('{http://www.w3.org/XML/1998/namespace}id', new_id)
        correcciones += 1
        print(f"Cambiado xml:id de '{old_id}' a '{new_id}' en part=\"F\"")

# Hacer backup del archivo original
import shutil
shutil.copy2(xml_file, backup_file)
print(f"\nBackup creado en: {backup_file}")

# Guardar el archivo modificado
tree.write(xml_file, encoding='utf-8', xml_declaration=True)

print(f"\n=== RESUMEN ===")
print(f"Correcciones realizadas: {correcciones}")
print(f"Archivo actualizado: {xml_file}")
print(f"\nAhora revisa manualmente los versos con parte M usando búsqueda en VS Code:")
print(r'Regex: <l\s+(?:n="\d+"\s+)?part="M"')
