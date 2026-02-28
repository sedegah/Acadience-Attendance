
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Fix the string icons (icon:"<GraduationCap .../>" -> icon:<GraduationCap .../>)
src = re.sub(r'icon:\"(<[A-Za-z0-9]+ [^>]+/>)\"', r'icon:\1', src)

# Also fix the duplicated desc if it still exists
src = src.replace('desc:"Everything lecturers need.",desc:', 'desc:')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

print("Fix applied.")
