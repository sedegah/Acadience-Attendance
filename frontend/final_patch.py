
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Fix the SESSIONS[0] reference in HomePage's QRPanel (just remove or use a mock fallback for landing page only)
# Currently HomePage renders a QRPanel for SESSIONS[0]. 
# Since SESSIONS is gone, let's provide a static mockup session for the landing page ONLY.
src = src.replace(
    'const s=SESSIONS[0];', 
    'const s={id:1, courseName:"CS401", attended:38, total:48, flagged:0, status:"active", duration:90};'
)
src = src.replace(
    '<QRPanel session={SESSIONS[0]} onRefresh={()=>toast.add("QR refreshed","success")}/>',
    '<QRPanel session={{id:1, courseName:"CS401", attended:38, total:48, flagged:0, status:"active", duration:90}} onRefresh={()=>toast.add("QR refreshed","success")}/>'
)

# 2. Fix DashSidebar's call to QRPanel if it uses SESSIONS[0]
src = src.replace(
    '<QRPanel session={SESSIONS[0]}',
    '<QRPanel session={s}'   # DashSidebar already defines s = sessions.find(...) || sessions[0] || fallback
)

# 3. Final safety check: replace any remaining SESSIONS/COURSES/STUDENTS/FLAGGED_DATA with empty arrays in the global scope if they somehow survived
src = re.sub(r'(?<!\.)COURSES(?!\.)', '[]', src)
src = re.sub(r'(?<!\.)SESSIONS(?!\.)', '[]', src)
src = re.sub(r'(?<!\.)STUDENTS(?!\.)', '[]', src)
src = re.sub(r'(?<!\.)FLAGGED_DATA(?!\.)', '[]', src)

# 4. Remove any "export" keywords if I accidentally added them and they are causing issues (unlikely)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

print("Final patch applied.")
