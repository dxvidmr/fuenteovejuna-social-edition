import xml.etree.ElementTree as ET
import re

# Cargar el archivo XML
tree = ET.parse('fuenteovejuna.xml')
root = tree.getroot()

# Namespace TEI
ns = {'tei': 'http://www.tei-c.org/ns/1.0'}

# Registrar el namespace para evitar prefijos ns0:
ET.register_namespace('', 'http://www.tei-c.org/ns/1.0')

print("=" * 80)
print("NUMERACIÓN AUTOMÁTICA DE VERSOS")
print("=" * 80)
print()

# Encontrar todos los <div type="act"> en el documento
acts = root.findall('.//div[@type="act"]', ns)

if not acts:
    # Si no hay actos definidos, buscar el div principal
    acts = root.findall('.//div[@type="play"]', ns)

contador_global = 1

for act_idx, act in enumerate(acts, 1):
    # Encontrar todos los versos <l> en este acto
    versos = act.findall('.//l', ns)
    
    print(f"Procesando {'Acto' if len(acts) > 1 else 'Obra'} {act_idx}: {len(versos)} versos encontrados")
    
    for verso in versos:
        # Obtener el atributo part si existe
        part = verso.get('part')
        
        # Solo numerar versos que son iniciales (part="I") o que no tienen part (versos completos)
        if part is None or part == 'I':
            # Asignar el número al verso
            verso.set('n', str(contador_global))
            contador_global += 1
        elif part in ['M', 'F']:
            # Los versos medios y finales no se numeran, pero pueden tener referencia
            # Eliminar el atributo 'n' si existe para versos M/F
            if 'n' in verso.attrib:
                del verso.attrib['n']

print()
print(f"Total de versos numerados: {contador_global - 1}")
print()

# Guardar el archivo XML
print("Guardando cambios en fuenteovejuna.xml...")

# Convertir a string y escribir con formato
def indent(elem, level=0):
    """Función para indentar el XML de forma legible"""
    i = "\n" + level * "    "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "    "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for child in elem:
            indent(child, level + 1)
        if not child.tail or not child.tail.strip():
            child.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i

indent(root)

# Escribir el archivo con declaración XML
tree.write('fuenteovejuna.xml', encoding='utf-8', xml_declaration=True)

print("✓ Archivo guardado correctamente")
print()
print("RESUMEN:")
print(f"  - Versos numerados: {contador_global - 1}")
print(f"  - Los versos con part='I' reciben numeración")
print(f"  - Los versos con part='M' o part='F' no se numeran")
print(f"  - Los versos completos (sin part) se numeran normalmente")
print()
print("Puedes ejecutar este script cada vez que hagas cambios en los versos.")
