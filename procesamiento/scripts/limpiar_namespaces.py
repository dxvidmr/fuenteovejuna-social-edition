import re

# Leer el archivo
with open('fuenteovejuna.xml', 'r', encoding='utf-8') as f:
    contenido = f.read()

# Eliminar todos los ns0: de las etiquetas
contenido = re.sub(r'<ns0:', '<', contenido)
contenido = re.sub(r'</ns0:', '</', contenido)

# También eliminar xmlns:ns0 si aparece
contenido = re.sub(r'\s*xmlns:ns0="[^"]*"', '', contenido)

# Guardar el archivo limpio
with open('fuenteovejuna.xml', 'w', encoding='utf-8') as f:
    f.write(contenido)

print("✓ Archivo limpiado correctamente")
print("✓ Todos los prefijos ns0: han sido eliminados")
