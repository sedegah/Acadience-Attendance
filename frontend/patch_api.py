
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# ── 1. Add axios import + API_BASE after the react import ─────────────────────
src = src.replace(
    'import { useState, useEffect, useRef, useCallback } from "react";',
    '''import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API_BASE = "https://acadience-attendance-api.sedegah.workers.dev";
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });''',
    1
)

# ── 2. Remove the four mock data blocks (lines 394-421 in original) ────────────
old_data_block = '''/* ────────── DATA ────────── */
const COURSES = [
  { id:1, code:"CS401", name:"Advanced Algorithms", dept:"Computer Science", enrolled:48 },
  { id:2, code:"CS302", name:"Database Systems", dept:"Computer Science", enrolled:61 },
  { id:3, code:"EE210", name:"Circuit Analysis", dept:"Electrical Engineering", enrolled:34 },
  { id:4, code:"MATH310", name:"Linear Algebra", dept:"Mathematics", enrolled:72 },
];
const SESSIONS = [
  { id:1, courseName:"CS401", date:"2025-02-27", time:"09:00", duration:90,  status:"active", attended:38, total:48, flagged:2 },
  { id:2, courseName:"CS302", date:"2025-02-27", time:"11:00", duration:60,  status:"closed", attended:59, total:61, flagged:0 },
  { id:3, courseName:"EE210", date:"2025-02-26", time:"14:00", duration:90,  status:"closed", attended:31, total:34, flagged:1 },
  { id:4, courseName:"MATH310",date:"2025-02-26",time:"08:30", duration:120, status:"closed", attended:68, total:72, flagged:3 },
  { id:5, courseName:"CS401", date:"2025-02-25", time:"09:00", duration:90,  status:"closed", attended:44, total:48, flagged:0 },
];
const STUDENTS = [
  { id:"10001", name:"Ama Owusu",    course:"CS401", time:"09:03", geo:"In range",    flag:false },
  { id:"10024", name:"Kwame Boateng",course:"CS401", time:"09:07", geo:"In range",    flag:false },
  { id:"10058", name:"Efua Mensah",  course:"CS401", time:"09:11", geo:"Out of range",flag:true  },
  { id:"10033", name:"Yaw Asante",   course:"CS401", time:"09:14", geo:"In range",    flag:false },
  { id:"10071", name:"Akosua Adjei\", course:"CS401", time:"09:18", geo:"In range",    flag:false },
  { id:"10015", name:"Kofi Appiah",  course:"CS401", time:"09:22", geo:"Dup device",  flag:true  },
  { id:"10089", name:"Abena Darko",  course:"CS401", time:"09:25", geo:"In range",    flag:false },
];
const FLAGGED_DATA = [
  { id:1, student:"Efua Mensah",  sid:"10058", reason:"Outside geofence radius (450 m)", session:"CS401 — 27 Feb 09:00", device:"Chrome/Mobile #a3f9", status:"pending" },
  { id:2, student:"Kofi Appiah",  sid:"10015", reason:"Duplicate device fingerprint",    session:"CS401 — 27 Feb 09:00", device:"Same as #10058",       status:"pending" },
  { id:3, student:"Esi Amoah",    sid:"10066", reason:"Submitted outside time window",   session:"EE210 — 26 Feb 14:00", device:"Safari/Mobile #b7d2",  status:"approved"},
];'''

src = src.replace(old_data_block, '/* ────────── DATA (live from API) ────────── */')

# Fallback: remove each block individually with regex
for pattern in [
    r'const COURSES = \[[\s\S]*?\];\s*\n',
    r'const SESSIONS = \[[\s\S]*?\];\s*\n',
    r'const STUDENTS = \[[\s\S]*?\];\s*\n',
    r'const FLAGGED_DATA = \[[\s\S]*?\];\s*\n',
]:
    src = re.sub(pattern, '', src)

# ── 3. SessionsAssetTable: use props instead of SESSIONS ─────────────────────
src = src.replace(
    'function SessionsAssetTable() {\n  const [activeTab, setActiveTab] = useState("All");\n  const tabs=["All","Active","Closed"];\n  const rows=SESSIONS.filter',
    'function SessionsAssetTable({sessions=[]}) {\n  const [activeTab, setActiveTab] = useState("All");\n  const tabs=["All","Active","Closed"];\n  const rows=sessions.filter'
)

# ── 4. SessionsTable: accept courses+sessions as props ────────────────────────
src = src.replace(
    'function SessionsTable({onView, onNew, toast}) {\n  const [filter,setFilter]=useState("all");\n  const [search,setSearch]=useState("");\n  const rows=SESSIONS.filter',
    'function SessionsTable({onView, onNew, toast, sessions=[], courses=[]}) {\n  const [filter,setFilter]=useState("all");\n  const [search,setSearch]=useState("");\n  const rows=sessions.filter'
)

# ── 5. AttendanceTable: fetch students from API given session ─────────────────
old_att = '''function AttendanceTable({session}) {
  const [search,setSearch]=useState("");
  const rows=STUDENTS.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.id.includes(search));'''
new_att = '''function AttendanceTable({session}) {
  const [search,setSearch]=useState("");
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    if(!session?.id)return;
    setLoading(true);
    axios.get(`${API_BASE}/api/lecturer/sessions/${session.id}/attendance`,{headers:getAuthHeaders()})
      .then(r=>setStudents(Array.isArray(r.data)?r.data:[]))
      .catch(()=>setStudents([]))
      .finally(()=>setLoading(false));
  },[session?.id]);
  const rows=students.filter(s=>(s.student_name||s.name||"").toLowerCase().includes(search.toLowerCase())||(s.student_id||s.id||"").toString().includes(search));'''
src = src.replace(old_att, new_att)

# Update the table body to use API field names
src = src.replace(
    'table.cb-tbl td;padding:12px',
    'table.cb-tbl td;padding:12px'
)

# Update AttendanceTable tbody - map student fields from API response
old_tbody = '''          {rows.map(s=>(
            <tr key={s.id}>
              <td style={{fontVariantNumeric:"tabular-nums",color:"var(--text)",fontWeight:500}}>{s.id}</td>
              <td style={{fontWeight:600,color:"var(--text)"}}>{s.name}</td>
              <td>{s.course}</td>
              <td style={{fontVariantNumeric:"tabular-nums"}}>{s.time}</td>
              <td style={{fontSize:13,color:s.geo==="In range"?"var(--green)":"#D97706",display:"flex",alignItems:"center",gap:4}}>{s.geo==="In range"?<><Check size={13}/>In range</>:<><AlertTriangle size={13}/>{s.geo}</>}</td>
              <td className="c"><span className={`cb-bdg ${s.flag?"yellow":"green"}`}>{s.flag?<><AlertTriangle size={12}/> Flagged</>:<><Check size={12}/> Verified</>}</span></td>
            </tr>
          ))}'''
new_tbody = '''          {loading&&<tr><td colSpan={6} style={{textAlign:"center",padding:32,color:"var(--gray-400)"}}>Loading…</td></tr>}
          {!loading&&rows.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:32,color:"var(--gray-400)"}}>No records yet</td></tr>}
          {rows.map(s=>{
            const sid=s.student_id||s.id;
            const name=s.student_name||s.name||"—";
            const course=s.course_code||s.course||session?.courseName||"—";
            const time=s.submitted_at?new Date(s.submitted_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):s.time||"—";
            const geoOk=s.geo_valid!==false&&(s.geo||"").toLowerCase()!=="out of range";
            const flagged=s.flagged||s.flag||false;
            return (
              <tr key={sid}>
                <td style={{fontVariantNumeric:"tabular-nums",color:"var(--text)",fontWeight:500}}>{sid}</td>
                <td style={{fontWeight:600,color:"var(--text)"}}>{name}</td>
                <td>{course}</td>
                <td style={{fontVariantNumeric:"tabular-nums"}}>{time}</td>
                <td style={{fontSize:13,color:geoOk?"var(--green)":"#D97706",display:"flex",alignItems:"center",gap:4}}>{geoOk?<><Check size={13}/>In range</>:<><AlertTriangle size={13}/>{s.geo||"Out of range"}</>}</td>
                <td className="c"><span className={`cb-bdg ${flagged?"yellow":"green"}`}>{flagged?<><AlertTriangle size={12}/> Flagged</>:<><Check size={12}/> Verified</>}</span></td>
              </tr>
            );
          })}'''
src = src.replace(old_tbody, new_tbody)

# ── 6. FlaggedView: fetch from API ────────────────────────────────────────────
old_fv = '''function FlaggedView({toast}) {
  const [items,setItems]=useState(FLAGGED_DATA);
  const handle=(id,action)=>{
    setItems(it=>it.map(i=>i.id===id?{...i,status:action}:i));
    toast.add(action==="approved"?"Submission approved":"Submission rejected",action==="approved"?"success":"error");
  };'''
new_fv = '''function FlaggedView({toast}) {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    axios.get(`${API_BASE}/api/lecturer/flags`,{headers:getAuthHeaders()})
      .then(r=>setItems(Array.isArray(r.data)?r.data:[]))
      .catch(()=>setItems([]))
      .finally(()=>setLoading(false));
  },[]);
  const handle=async(id,action)=>{
    try{
      await axios.post(`${API_BASE}/api/lecturer/flags/${id}/${action}`,{},{headers:getAuthHeaders()});
      setItems(it=>it.map(i=>i.id===id?{...i,status:action==="approve"?"approved":"rejected"}:i));
      toast.add(action==="approve"?"Submission approved":"Submission rejected",action==="approve"?"success":"error");
    }catch(e){toast.add("Action failed","error");}
  };'''
src = src.replace(old_fv, new_fv)

# Update flagged field mapping (API returns different field names)
src = src.replace(
    '<div className="cb-flag-name">{f.student} <span style={{fontSize:12,fontWeight:400,color:"var(--gray-500)"}}>#{f.sid}</span></div>\n            <div className="cb-flag-reason">{f.reason}</div>\n            <div className="cb-flag-meta">{f.session} · Device: {f.device}</div>',
    '<div className="cb-flag-name">{f.student_name||f.student||"Unknown"} <span style={{fontSize:12,fontWeight:400,color:"var(--gray-500)"}}>#{f.student_id||f.sid}</span></div>\n            <div className="cb-flag-reason">{f.rejection_reason||f.reason}</div>\n            <div className="cb-flag-meta">{f.course_code||f.session} · {f.submitted_at?new Date(f.submitted_at).toLocaleDateString():""}</div>'
)

# ── 7. CoursesView: accept courses prop ──────────────────────────────────────
src = src.replace(
    'function CoursesView({toast}) {\n  return (\n    <div>\n      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>\n        <div><h2 style={{fontSize:26,fontWeight:800,letterSpacing:"-.8px"}}>Courses</h2><p style={{fontSize:14,color:"var(--gray-500)",marginTop:4}}>{COURSES.length} courses</p></div>',
    'function CoursesView({toast,courses=[]}) {\n  return (\n    <div>\n      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>\n        <div><h2 style={{fontSize:26,fontWeight:800,letterSpacing:"-.8px"}}>Courses</h2><p style={{fontSize:14,color:"var(--gray-500)",marginTop:4}}>{courses.length} courses</p></div>'
)
src = src.replace(
    '        {COURSES.map(c=>(\n          <div key={c.id} className="cb-stat-card" style={{cursor:"pointer"}}>\n            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>\n              <div>\n                <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.5px"}}>{c.code}</div>\n                <div style={{fontSize:13,color:"var(--gray-500)",marginTop:2}}>{c.dept}</div>\n              </div>\n              <span className="cb-bdg blue">{c.enrolled} students</span>',
    '        {courses.map(c=>(\n          <div key={c.id} className="cb-stat-card" style={{cursor:"pointer"}}>\n            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>\n              <div>\n                <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.5px"}}>{c.code||c.course_code}</div>\n                <div style={{fontSize:13,color:"var(--gray-500)",marginTop:2}}>{c.department||c.dept||""}</div>\n              </div>\n              <span className="cb-bdg blue">{c.enrolled_count||c.enrolled||0} students</span>'
)
src = src.replace(
    '              <div style={{fontSize:15,fontWeight:500,marginBottom:16}}>{c.name}</div>',
    '              <div style={{fontSize:15,fontWeight:500,marginBottom:16}}>{c.name||c.course_name}</div>'
)

# ── 8. NewSessionModal: use live courses + submit to API ──────────────────────
src = src.replace(
    'function NewSessionModal({onClose, onSave, toast}) {\n  const [form,setForm]=useState({course:"",date:new Date().toISOString().split("T")[0],time:"09:00",duration:"90",radius:"100"});\n  const set=(k,v)=>setForm(f=>({...f,[k]:v}));\n  const submit=()=>{\n    if(!form.course){toast.add("Please select a course","warn");return;}\n    toast.add("Session created successfully","success");\n    onSave(form);\n  };',
    'function NewSessionModal({onClose, onSave, toast, courses=[]}) {\n  const [form,setForm]=useState({course:"",date:new Date().toISOString().split("T")[0],time:"09:00",duration:"90",radius:"100"});\n  const [submitting,setSubmitting]=useState(false);\n  const set=(k,v)=>setForm(f=>({...f,[k]:v}));\n  const submit=async()=>{\n    if(!form.course){toast.add("Please select a course","warn");return;}\n    const c=courses.find(x=>(x.code||x.course_code)===form.course);\n    if(!c){toast.add("Course not found","error");return;}\n    setSubmitting(true);\n    try{\n      await axios.post(`${API_BASE}/api/lecturer/sessions`,{courseId:c.id,latitude:0,longitude:0,radius:parseInt(form.radius)||100},{headers:getAuthHeaders()});\n      toast.add("Session started","success");\n      onSave();\n    }catch(e){toast.add(e?.response?.data?.error||"Failed to create session","error");}\n    finally{setSubmitting(false);}\n  };'
)
# Update courses selector in modal to use live data
src = src.replace(
    '              <option value="">Select a course…</option>\n              {COURSES.map(c=><option key={c.id} value={c.code}>{c.code} — {c.name}</option>)}',
    '              <option value="">Select a course…</option>\n              {courses.map(c=><option key={c.id} value={c.code||c.course_code}>{c.code||c.course_code} — {c.name||c.course_name}</option>)}'
)
# Disable button while submitting
src = src.replace(
    '<button className="cb-btn-signup" style={{padding:"11px 24px",fontSize:14}} onClick={submit}>Create Session</button>',
    '<button className="cb-btn-signup" style={{padding:"11px 24px",fontSize:14,opacity:submitting?.8:1}} onClick={submit} disabled={submitting}>{submitting?"Creating…":"Create Session"}</button>'
)

# ── 9. DashSidebar: accept sessions+students as props ────────────────────────
src = src.replace(
    'function DashSidebar({toast}) {\n  const s=SESSIONS[0];',
    'function DashSidebar({toast,sessions=[],students=[]}) {\n  const s=sessions.find(x=>x.status==="active")||sessions[0]||{courseName:"—",attended:0,total:0,duration:0,flagged:0,id:null};'
)
# Recent check-ins: use students prop
src = src.replace(
    '          {STUDENTS.filter(s=>!s.flag).slice(0,4).map(s=>(',
    '          {students.filter(s=>!s.flag&&!s.flagged).slice(0,4).map(s=>('
)
src = src.replace(
    '              <div className="cb-mover-icon">{s.name[0]}</div>\n              <div className="cb-mover-ticker">{s.id}</div>\n              <div className="cb-mover-chg up" style={{display:"flex",alignItems:"center",gap:3}}><Check size={11}/> {s.time}</div>\n              <div className="cb-mover-price">{s.name.split(" ")[0]}</div>',
    '              <div className="cb-mover-icon">{(s.student_name||s.name||"?")[0]}</div>\n              <div className="cb-mover-ticker">{s.student_id||s.id}</div>\n              <div className="cb-mover-chg up" style={{display:"flex",alignItems:"center",gap:3}}><Check size={11}/> {s.submitted_at?new Date(s.submitted_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):s.time||""}</div>\n              <div className="cb-mover-price">{(s.student_name||s.name||"").split(" ")[0]}</div>'
)
# Sidebar session info - use live session data
src = src.replace(
    '        {[["Course",s.courseName],["Duration",`${s.duration} min`],["Geofence","100 m radius"],["Flagged",`${s.flagged} submissions`]].map(([k,v])=>(',
    '        {[["Course",s.course_code||s.courseName||"—"],["Duration",`${s.duration||0} min`],["Present",`${s.attended_count||s.attended||0}/${s.total||0}`],["Flagged",`${s.flagged||0} submissions`]].map(([k,v])=>('
)
src = src.replace(
    '        <div className="cb-prog-bar" style={{marginBottom:8}}><div className="cb-prog-fill" style={{width:`${pct(s.attended,s.total)}%`}}/></div>\n        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--gray-500)",marginBottom:14}}><span>{s.attended} present</span><span>{pct(s.attended,s.total)}%</span></div>',
    '        <div className="cb-prog-bar" style={{marginBottom:8}}><div className="cb-prog-fill" style={{width:`${pct(s.attended_count||s.attended||0,s.total||1)}%`}}/></div>\n        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--gray-500)",marginBottom:14}}><span>{s.attended_count||s.attended||0} present</span><span>{pct(s.attended_count||s.attended||0,s.total||1)}%</span></div>'
)
# Update "quick start" new session button to call setShowModal via callback
src = src.replace(
    'function DashSidebar({toast,sessions=[],students=[]}) {',
    'function DashSidebar({toast,sessions=[],students=[],onNewSession}) {'
)
src = src.replace(
    '<button className="cb-side-blue-btn" onClick={()=>toast.add("Opening session wizard","success")}>+ New Session</button>',
    '<button className="cb-side-blue-btn" onClick={onNewSession}>+ New Session</button>'
)

# ── 10. StatsRow: accept data prop ───────────────────────────────────────────
src = src.replace(
    'function StatsRow() {\n  return (\n    <div className="cb-stats">\n      {[\n        {lbl:"Active Sessions",val:"1",sub:"1 live now",dir:"up",   color:"#0052FF",bar:33},\n        {lbl:"Total Enrolled", val:"215",sub:"4 courses",  dir:"neu",  color:"#6366F1",bar:100},\n        {lbl:"Avg Attendance", val:"91%",sub:"+2.4% this week",dir:"up",color:"var(--green)",bar:91},\n        {lbl:"Flagged Today",  val:"2",  sub:"Needs review",dir:"dn",color:"#D97706",bar:15},\n      ].map(s=>(',
    'function StatsRow({sessions=[],courses=[],flags=[]}) {\n  const activeSessions=sessions.filter(s=>s.status==="active").length;\n  const allSessions=sessions.filter(s=>s.total>0);\n  const avgRate=allSessions.length?Math.round(allSessions.reduce((a,s)=>a+pct(s.attended_count||s.attended||0,s.total||1),0)/allSessions.length):0;\n  const stats=[\n    {lbl:"Active Sessions",val:String(activeSessions),sub:`${activeSessions} live now`,dir:"up",color:"#0052FF",bar:Math.min(100,activeSessions*33)},\n    {lbl:"Total Courses",val:String(courses.length),sub:`${courses.length} courses`,dir:"neu",color:"#6366F1",bar:100},\n    {lbl:"Avg Attendance",val:`${avgRate}%`,sub:"this term",dir:"up",color:"var(--green)",bar:avgRate},\n    {lbl:"Flagged",val:String(flags.filter(f=>f.status==="pending").length),sub:"Need review",dir:"dn",color:"#D97706",bar:15},\n  ];\n  return (\n    <div className="cb-stats">\n      {stats.map(s=>('
)

# ── 11. Dashboard: add auth + data fetching ───────────────────────────────────
old_dashboard_start = '''function Dashboard({toast}) {
  const [tab,setTab]=useState("Dashboard");
  const [sel,setSel]=useState(null);
  const [showModal,setShowModal]=useState(false);
  const showSidebar=tab==="Dashboard"&&!sel;
  const renderMain=()=>{
    if(sel) return <SessionDetail session={sel} onBack={()=>setSel(null)} toast={toast}/>;
    if(tab==="Dashboard") return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div><h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px"}}>Dashboard</h2><p style={{fontSize:14,color:"var(--gray-500)",marginTop:4}}>Friday, 27 February 2025 · 09:24 AM</p></div>
          <div style={{display:"flex",gap:10}}>
            <button className="cb-btn-signin" style={{display:"flex",alignItems:"center",gap:6}} onClick={()=>toast.add("Downloading…","success")}><Download size={14}/> Report</button>
            <button className="cb-btn-signup" style={{padding:"10px 22px"}} onClick={()=>setShowModal(true)}>+ New Session</button>
          </div>
        </div>
        <StatsRow/>
        <SessionsTable onView={setSel} onNew={()=>setShowModal(true)} toast={toast}/>
      </div>
    );
    if(tab==="Sessions") return <div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}><h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px"}}>Sessions</h2><button className="cb-btn-signup" style={{padding:"10px 22px"}} onClick={()=>setShowModal(true)}>+ New Session</button></div><SessionsTable onView={setSel} onNew={()=>setShowModal(true)} toast={toast}/></div>;
    if(tab==="Courses") return <CoursesView toast={toast}/>;
    if(tab==="Flagged") return <FlaggedView toast={toast}/>;
    if(tab==="Students") return <div><h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px",marginBottom:24}}>Students</h2><AttendanceTable session={SESSIONS[0]}/></div>;
  };'''

new_dashboard_start = '''function Dashboard({toast}) {
  const [tab,setTab]=useState("Dashboard");
  const [sel,setSel]=useState(null);
  const [showModal,setShowModal]=useState(false);
  const [user,setUser]=useState(()=>localStorage.getItem("token")?{token:localStorage.getItem("token")}:null);
  const [courses,setCourses]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [flags,setFlags]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(false);

  const fetchAll=useCallback(async()=>{
    if(!user)return;
    setLoading(true);
    try{
      const h={headers:getAuthHeaders()};
      const [c,s,f]=await Promise.all([
        axios.get(`${API_BASE}/api/lecturer/courses`,h).catch(()=>({data:[]})),
        axios.get(`${API_BASE}/api/lecturer/sessions`,h).catch(()=>({data:[]})),
        axios.get(`${API_BASE}/api/lecturer/flags`,h).catch(()=>({data:[]})),
      ]);
      setCourses(Array.isArray(c.data)?c.data:[]);
      setSessions(Array.isArray(s.data)?s.data:[]);
      setFlags(Array.isArray(f.data)?f.data:[]);
      // Fetch students from the active session if any
      const active=(Array.isArray(s.data)?s.data:[]).find(x=>x.status==="active");
      if(active){
        axios.get(`${API_BASE}/api/lecturer/sessions/${active.id}/attendance`,{headers:getAuthHeaders()})
          .then(r=>setStudents(Array.isArray(r.data)?r.data:[]))
          .catch(()=>{});
      }
    }catch(e){toast.add("Failed to load data","error");}
    finally{setLoading(false);}
  },[user]);

  useEffect(()=>{fetchAll();},[fetchAll]);

  const handleLogin=async(e)=>{
    e.preventDefault();
    try{
      const r=await axios.post(`${API_BASE}/api/lecturer/login`,{email:e.target.email.value,password:e.target.password.value});
      localStorage.setItem("token",r.data.token);
      setUser({token:r.data.token});
    }catch(e){toast.add(e?.response?.data?.error||"Invalid credentials","error");}
  };

  if(!user){return(
    <div className="cb-submit-page">
      <div className="cb-submit-card">
        <div className="cb-submit-logo">
          <div><img src="/logo.png" style={{height:52,width:52,objectFit:"contain"}}/></div>
          <div className="cb-submit-title">Lecturer Sign In</div>
          <div className="cb-submit-sub">Sign in to access your dashboard</div>
        </div>
        <form onSubmit={handleLogin}>
          <div className="cb-form-row"><label className="cb-form-lbl">Email</label><input className="cb-form-input" name="email" type="email" required placeholder="you@university.edu"/></div>
          <div className="cb-form-row"><label className="cb-form-lbl">Password</label><input className="cb-form-input" name="password" type="password" required placeholder="••••••••"/></div>
          <button className="cb-btn-signup" style={{width:"100%",padding:14,fontSize:15,borderRadius:100}} type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );}

  const now=new Date();
  const dateStr=now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const timeStr=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  const showSidebar=tab==="Dashboard"&&!sel;
  const renderMain=()=>{
    if(sel) return <SessionDetail session={sel} onBack={()=>setSel(null)} toast={toast}/>;
    if(tab==="Dashboard") return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div><h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px"}}>Dashboard</h2><p style={{fontSize:14,color:"var(--gray-500)",marginTop:4}}>{dateStr} · {timeStr}</p></div>
          <div style={{display:"flex",gap:10}}>
            <button className="cb-btn-signin" style={{display:"flex",alignItems:"center",gap:6}} onClick={()=>toast.add("No data to export yet","warn")}><Download size={14}/> Report</button>
            <button className="cb-btn-signup" style={{padding:"10px 22px"}} onClick={()=>setShowModal(true)}>+ New Session</button>
          </div>
        </div>
        <StatsRow sessions={sessions} courses={courses} flags={flags}/>
        <SessionsTable onView={setSel} onNew={()=>setShowModal(true)} toast={toast} sessions={sessions} courses={courses}/>
      </div>
    );
    if(tab==="Sessions") return <div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}><h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px"}}>Sessions</h2><button className="cb-btn-signup" style={{padding:"10px 22px"}} onClick={()=>setShowModal(true)}>+ New Session</button></div><SessionsTable onView={setSel} onNew={()=>setShowModal(true)} toast={toast} sessions={sessions} courses={courses}/></div>;
    if(tab==="Courses") return <CoursesView toast={toast} courses={courses}/>;
    if(tab==="Flagged") return <FlaggedView toast={toast}/>;
    if(tab==="Students") return <div><h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px",marginBottom:24}}>Students</h2><AttendanceTable session={sessions.find(s=>s.status==="active")||sessions[0]||null}/></div>;
  };'''

src = src.replace(old_dashboard_start, new_dashboard_start)

# ── 12. Pass data to sidebar through Dashboard ────────────────────────────────
src = src.replace(
    '{showSidebar&&<DashSidebar toast={toast}/>}',
    '{showSidebar&&<DashSidebar toast={toast} sessions={sessions} students={students} onNewSession={()=>setShowModal(true)}/>}'
)

# ── 13. Pass courses to NewSessionModal ───────────────────────────────────────
src = src.replace(
    '{showModal&&<NewSessionModal onClose={()=>setShowModal(false)} onSave={()=>setShowModal(false)} toast={toast}/>}',
    '{showModal&&<NewSessionModal onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);fetchAll();}} toast={toast} courses={courses}/>}'
)

# ── 14. Add logout button in DashNav ─────────────────────────────────────────
src = src.replace(
    'function DashNav({tab, setTab, setPage}) {',
    'function DashNav({tab, setTab, setPage, onLogout}) {'
)
src = src.replace(
    '<button className="cb-icon-btn"><Bell size={18}/></button>\n          <button className="cb-icon-btn"><Settings size={18}/></button>\n          <div style={{width:36,height:36,borderRadius:"50%",background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white",cursor:"pointer"}}>KS</div>',
    '<button className="cb-icon-btn"><Bell size={18}/></button>\n          <button className="cb-icon-btn"><Settings size={18}/></button>\n          {onLogout&&<button className="cb-icon-btn" onClick={onLogout} title="Sign out"><LogOut size={18}/></button>}'
)

# Fix DashNav usage in Dashboard - pass onLogout
src = src.replace(
    '<DashNav tab={sel?"Dashboard":tab} setTab={t=>{setTab(t);setSel(null);}} setPage={()=>{}}/>',
    '<DashNav tab={sel?"Dashboard":tab} setTab={t=>{setTab(t);setSel(null);}} setPage={()=>{}} onLogout={()=>{localStorage.removeItem("token");setUser(null);}}/>'
)

# ── 15. SessionsAssetTable: use live sessions from HomePage (just use empty fallback) ─
# HomePage still passes static sessions for the hero. Keep it as-is but add a prop
src = src.replace(
    '<SessionsAssetTable/>',
    '<SessionsAssetTable sessions={[]}/>'
)

# ── 16. Student page: submit to real API ──────────────────────────────────────
old_submit = '''  const submit=()=>{
    if(!form.sid||!form.name||!form.course)return;
    setLoading(true);
    setTimeout(()=>{setLoading(false);setStep("success");},1400);
  };'''
new_submit = '''  const submit=async()=>{
    if(!form.sid||!form.name||!form.course)return;
    setLoading(true);
    try{
      // Get current GPS position
      const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:10000})).catch(()=>null);
      const payload={
        studentId:form.sid,
        studentName:form.name,
        courseCode:form.course,
        latitude:pos?.coords?.latitude||0,
        longitude:pos?.coords?.longitude||0,
        accuracy:pos?.coords?.accuracy||999,
        token:new URLSearchParams(window.location.search).get("token")||"",
      };
      await axios.post(`${API_BASE}/api/student/submit`,payload);
      setStep("success");
    }catch(e){
      const msg=e?.response?.data?.error||"Submission failed. Check your QR code is still valid.";
      // Show error but don't crash
      setForm(f=>({...f,error:msg}));
    }
    finally{setLoading(false);}
  };'''
src = src.replace(old_submit, new_submit)

# Show error in student form
src = src.replace(
    '<button className="cb-btn-signup" style={{width:"100%",padding:14,fontSize:15,borderRadius:100,opacity:loading?.75:1}} onClick={submit} disabled={loading}>{loading?"Submitting…":"Submit Attendance"}</button>',
    '{form.error&&<div style={{background:"#FEF2F2",color:"var(--red)",border:"1.5px solid rgba(207,48,74,.2)",borderRadius:10,padding:"10px 14px",fontSize:13,marginBottom:12}}>{form.error}</div>}<button className="cb-btn-signup" style={{width:"100%",padding:14,fontSize:15,borderRadius:100,opacity:loading?.75:1}} onClick={submit} disabled={loading}>{loading?"Submitting…":"Submit Attendance"}</button>'
)

# ── 17. Fix student form state initial value (add error field) ─────────────────
src = src.replace(
    'const [form,setForm]=useState({sid:"",name:"",course:""});',
    'const [form,setForm]=useState({sid:"",name:"",course:"",error:""});'
)
src = src.replace(
    'onClick={()=>{setStep("form");setForm({sid:"",name:"",course:""});}}>Submit Another</button>',
    'onClick={()=>{setStep("form");setForm({sid:"",name:"",course:"",error:""});}}>Submit Another</button>'
)

# Update student page courses selector with API-fetched courses or just show the code input field
src = src.replace(
    '              {COURSES.map(c=><option key={c.id} value={c.code}>{c.code} — {c.name}</option>)}',
    '              {/* courses loaded from URL params or public endpoint */}'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

print(f"Done! Lines: {src.count(chr(10))}")
# Check for remaining COURSES/SESSIONS/STUDENTS/FLAGGED_DATA references
for sym in ['FLAGGED_DATA','SESSIONS[0]','STUDENTS.filter','COURSES.map','COURSES.length']:
    count = src.count(sym)
    if count > 0:
        print(f"WARNING: {sym} still appears {count} times")
print("Mock data references check complete.")
