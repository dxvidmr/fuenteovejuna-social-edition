import re
import xml.etree.ElementTree as ET
from xml.dom import minidom

# Cargar el archivo XML
tree = ET.parse('fuenteovejuna.xml')
root = tree.getroot()

# Namespace TEI
ns = {'tei': 'http://www.tei-c.org/ns/1.0'}

# Función para contar sílabas aproximadamente (simplificada)
def contar_silabas_aprox(texto):
    texto = re.sub(r'[^\w\s]', '', texto.lower())
    silabas = len(re.findall(r'[aeiouáéíóúü]+', texto))
    return silabas

# Función para verificar si un verso es corto
def es_verso_corto(verso_texto, umbral=6):
    silabas = contar_silabas_aprox(verso_texto)
    return silabas <= umbral

# Encontrar todos los <sp> en el documento
sps = root.findall('.//tei:sp', ns)

candidatos = []

for i in range(len(sps) - 1):
    sp_actual = sps[i]
    sp_siguiente = sps[i + 1]
    
    speaker_actual = sp_actual.find('tei:speaker', ns)
    speaker_siguiente = sp_siguiente.find('tei:speaker', ns)
    
    if speaker_actual is None or speaker_siguiente is None:
        continue
    
    nombre_actual = speaker_actual.text or ""
    nombre_siguiente = speaker_siguiente.text or ""
    
    versos_actual = sp_actual.findall('tei:l', ns)
    versos_siguiente = sp_siguiente.findall('tei:l', ns)
    
    if versos_actual and versos_siguiente:
        ultimo_verso_actual = versos_actual[-1]
        primer_verso_siguiente = versos_siguiente[0]
        
        # Saltar si ya están marcados
        if ultimo_verso_actual.get('part') or primer_verso_siguiente.get('part'):
            continue
        
        ultimo_texto = (ultimo_verso_actual.text or "").strip()
        primer_texto = (primer_verso_siguiente.text or "").strip()
        
        es_ultimo_corto = es_verso_corto(ultimo_texto, umbral=7)
        es_primero_corto = es_verso_corto(primer_texto, umbral=7)
        
        if es_ultimo_corto and es_primero_corto and nombre_actual != nombre_siguiente:
            silabas_ultimo = contar_silabas_aprox(ultimo_texto)
            silabas_primero = contar_silabas_aprox(primer_texto)
            suma_silabas = silabas_ultimo + silabas_primero
            
            if 7 <= suma_silabas <= 12:
                candidatos.append({
                    'speaker1': nombre_actual,
                    'verso1': ultimo_texto,
                    'silabas1': silabas_ultimo,
                    'speaker2': nombre_siguiente,
                    'verso2': primer_texto,
                    'silabas2': silabas_primero,
                    'suma': suma_silabas,
                    'elemento1': ultimo_verso_actual,
                    'elemento2': primer_verso_siguiente
                })

print("=" * 80)
print("REVISIÓN INTERACTIVA DE VERSOS PARTIDOS")
print("=" * 80)
print(f"\nTotal de candidatos encontrados: {len(candidatos)}")
print("\nInstrucciones:")
print("  S = Sí, marcar como verso partido (I + F)")
print("  N = No, no es un verso partido")
print("  Q = Salir y guardar cambios")
print("=" * 80)
print()

aprobados = 0
rechazados = 0

for idx, cand in enumerate(candidatos, 1):
    print(f"\n{'=' * 80}")
    print(f"CANDIDATO {idx}/{len(candidatos)}")
    print(f"{'=' * 80}")
    print(f"  {cand['speaker1']}: {cand['verso1']}")
    print(f"    └─ ~{cand['silabas1']} sílabas")
    print(f"  {cand['speaker2']}: {cand['verso2']}")
    print(f"    └─ ~{cand['silabas2']} sílabas")
    print(f"  SUMA: ~{cand['suma']} sílabas")
    print()
    
    while True:
        respuesta = input("¿Marcar como verso partido? [S/n/q]: ").strip().lower()
        
        if respuesta in ['s', 'si', 'sí', 'yes', '']:
            # Marcar como verso partido
            cand['elemento1'].set('part', 'I')
            cand['elemento2'].set('part', 'F')
            print("  ✓ Marcado como verso partido (I + F)")
            aprobados += 1
            break
        elif respuesta in ['n', 'no']:
            print("  ✗ No marcado")
            rechazados += 1
            break
        elif respuesta in ['q', 'quit', 'salir']:
            print("\n¡Saliendo y guardando cambios!")
            break
        else:
            print("  Respuesta no válida. Usa S (sí), N (no) o Q (salir)")
    
    if respuesta in ['q', 'quit', 'salir']:
        break

print()
print("=" * 80)
print("RESUMEN")
print("=" * 80)
print(f"Aprobados: {aprobados}")
print(f"Rechazados: {rechazados}")
print(f"Pendientes: {len(candidatos) - aprobados - rechazados}")
print()

# Guardar el archivo XML
print("Guardando cambios en fuenteovejuna.xml...")

# Convertir el árbol a string con pretty print
xml_string = ET.tostring(root, encoding='utf-8', method='xml')
dom = minidom.parseString(xml_string)
pretty_xml = dom.toprettyxml(indent="    ", encoding='utf-8')

# Eliminar líneas vacías extra
lines = [line for line in pretty_xml.decode('utf-8').split('\n') if line.strip()]
pretty_xml = '\n'.join(lines)

with open('fuenteovejuna.xml', 'w', encoding='utf-8') as f:
    f.write(pretty_xml)

print("✓ Archivo guardado correctamente")
print()
print(f"Total de versos partidos marcados: {aprobados}")
