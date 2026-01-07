import re
import xml.etree.ElementTree as ET

# Cargar el archivo XML
tree = ET.parse('fuenteovejuna.xml')
root = tree.getroot()

# Namespace TEI
ns = {'tei': 'http://www.tei-c.org/ns/1.0'}

# Función para contar sílabas aproximadamente (simplificada)
def contar_silabas_aprox(texto):
    # Eliminar signos de puntuación y contar vocales como aproximación
    texto = re.sub(r'[^\w\s]', '', texto.lower())
    # Patrones vocálicos básicos
    silabas = len(re.findall(r'[aeiouáéíóúü]+', texto))
    return silabas

# Función para verificar si un verso es corto
def es_verso_corto(verso_texto, umbral=6):
    silabas = contar_silabas_aprox(verso_texto)
    return silabas <= umbral

# Encontrar todos los <sp> en el documento
sps = root.findall('.//tei:sp', ns)

print("=" * 80)
print("CANDIDATOS A VERSOS PARTIDOS")
print("=" * 80)
print()

candidatos = []

for i in range(len(sps) - 1):
    sp_actual = sps[i]
    sp_siguiente = sps[i + 1]
    
    # Obtener speaker names
    speaker_actual = sp_actual.find('tei:speaker', ns)
    speaker_siguiente = sp_siguiente.find('tei:speaker', ns)
    
    if speaker_actual is None or speaker_siguiente is None:
        continue
    
    nombre_actual = speaker_actual.text or ""
    nombre_siguiente = speaker_siguiente.text or ""
    
    # Obtener los versos (l)
    versos_actual = sp_actual.findall('tei:l', ns)
    versos_siguiente = sp_siguiente.findall('tei:l', ns)
    
    # Verificar si ya tienen atributo part
    if versos_actual and versos_siguiente:
        ultimo_verso_actual = versos_actual[-1]
        primer_verso_siguiente = versos_siguiente[0]
        
        # Saltar si ya están marcados
        if ultimo_verso_actual.get('part') or primer_verso_siguiente.get('part'):
            continue
        
        ultimo_texto = (ultimo_verso_actual.text or "").strip()
        primer_texto = (primer_verso_siguiente.text or "").strip()
        
        # CRITERIOS para detectar verso partido:
        # 1. Ambos versos son cortos
        # 2. Solo hay un verso en cada parlamento O el último del actual es corto
        # 3. Los personajes son diferentes (intercambio rápido)
        
        es_ultimo_corto = es_verso_corto(ultimo_texto, umbral=7)
        es_primero_corto = es_verso_corto(primer_texto, umbral=7)
        
        if es_ultimo_corto and es_primero_corto and nombre_actual != nombre_siguiente:
            silabas_ultimo = contar_silabas_aprox(ultimo_texto)
            silabas_primero = contar_silabas_aprox(primer_texto)
            suma_silabas = silabas_ultimo + silabas_primero
            
            # Si la suma está cerca de 8, 10 u 11 sílabas (octosílabo, endecasílabo)
            if 7 <= suma_silabas <= 12:
                candidatos.append({
                    'speaker1': nombre_actual,
                    'verso1': ultimo_texto,
                    'silabas1': silabas_ultimo,
                    'speaker2': nombre_siguiente,
                    'verso2': primer_texto,
                    'silabas2': silabas_primero,
                    'suma': suma_silabas,
                    'num_versos_sp1': len(versos_actual),
                    'num_versos_sp2': len(versos_siguiente)
                })

# Mostrar candidatos
for idx, cand in enumerate(candidatos, 1):
    print(f"CANDIDATO #{idx}")
    print(f"  {cand['speaker1']}: {cand['verso1']}")
    print(f"    └─ ~{cand['silabas1']} sílabas")
    print(f"  {cand['speaker2']}: {cand['verso2']}")
    print(f"    └─ ~{cand['silabas2']} sílabas")
    print(f"  SUMA: ~{cand['suma']} sílabas")
    print(f"  (Versos en parlamentos: {cand['num_versos_sp1']} / {cand['num_versos_sp2']})")
    print()

print("=" * 80)
print(f"TOTAL DE CANDIDATOS: {len(candidatos)}")
print("=" * 80)
print()
print("INSTRUCCIONES:")
print("- Revisa cada candidato manualmente")
print("- Si confirmas que es verso partido:")
print("  · Marca el primer verso como: <l part=\"I\">")
print("  · Marca el segundo verso como: <l part=\"F\">")
print("  · Si hay más versos intermedios, usa: <l part=\"M\">")
