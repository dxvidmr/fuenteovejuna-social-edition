import unicodedata
import xml.etree.ElementTree as ET

TEI_NS = "http://www.tei-c.org/ns/1.0"
ns = {"tei": TEI_NS}

def normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text or "")
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return text.upper().strip()


tree = ET.parse("fuenteovejuna.xml")
root = tree.getroot()
assignments = {}
aliases = {
    "ALCALDE": "#esteban",
    "ALC ESTEBAN": "#esteban",
    "ALCADE": "#esteban",
    "COMENDADOR": "#comendador",
    "MAESTRE": "#maestre",
    "REY": "#fernando",
    "ISABEL": "#isabel",
    "MUSICOS": "#musicos",
    "MUSICA": "#musicos",
    "REGIDOR": "#regidor",
    "REGIDOR I": "#regidor",
    "REGIDOR II": "#regidor",
    "REGIDOR 2": "#cuadrado",
    "SOLDADO": "#cimbranos",
    "JUAN": "#juan_rojo",
}

# Collect candidate identifiers from listPerson
for pers in root.findall(".//tei:particDesc//tei:listPerson//tei:person", ns):
    pid = pers.get("xml:id")
    name_el = pers.find("tei:persName", ns)
    if not pid or name_el is None or not (name := name_el.text):
        continue
    assignments.setdefault(normalize(name), set()).add(f"#{pid}")

# Also include castList roles with corresp attributes
for role in root.findall(".//tei:castList//tei:role", ns):
    cor = role.get("corresp")
    text = role.text or ""
    if cor:
        assignments.setdefault(normalize(text), set()).add(cor)

resolved = 0
ambiguous = []
missing = []

for sp in root.findall(".//tei:sp", ns):
    if sp.get("who"):
        continue
    speaker = sp.find("tei:speaker", ns)
    if speaker is None or not speaker.text:
        continue
    norm = normalize(speaker.text)
    matches = assignments.get(norm, set())
    if not matches and norm in aliases:
        matches = {aliases[norm]}
    if len(matches) == 1:
        sp.set("who", next(iter(matches)))
        resolved += 1
    elif len(matches) > 1:
        ambiguous.append((speaker.text, sorted(matches)))
    else:
        missing.append(speaker.text)

print("Asignados:", resolved)
if ambiguous:
    print("Ambiguos:")
    for name, ids in ambiguous:
        print(f"  {name} -> {ids}")
if missing:
    print("Sin correspondencia: \n" + "\n".join(sorted(set(missing))))

ET.register_namespace("", TEI_NS)
tree.write("fuenteovejuna.xml", encoding="utf-8", xml_declaration=True)
print("Archivo guardado con nuevos who")
