
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. CSS Refinements (Unbolding)
src = src.replace('.cb-hero-title{font-size:clamp(44px,5.5vw,72px);font-weight:500;', '.cb-hero-title{font-size:clamp(44px,5.5vw,72px);font-weight:400;')
src = src.replace('.cb-h2{font-size:clamp(28px,3.2vw,48px);font-weight:800;', '.cb-h2{font-size:clamp(28px,3.2vw,48px);font-weight:600;')
src = src.replace('.cb-cta-h2{font-size:clamp(36px,4.5vw,68px);font-weight:800;', '.cb-cta-h2{font-size:clamp(36px,4.5vw,68px);font-weight:600;')
src = src.replace('.cb-logo-text{font-size:18px;font-weight:800;', '.cb-logo-text{font-size:18px;font-weight:600;')
src = src.replace('.cb-modal-hdr-title{font-size:18px;font-weight:800;', '.cb-modal-hdr-title{font-size:18px;font-weight:600;')
src = src.replace('.cb-side-blue h3{font-size:18px;font-weight:800;', '.cb-side-blue h3{font-size:18px;font-weight:600;')
src = src.replace('.cb-submit-title{font-size:22px;font-weight:800;', '.cb-submit-title{font-size:22px;font-weight:600;')

# 2. Fix MegaMenu Icon string if present
src = src.replace('icon:"<GraduationCap size={80} strokeWidth={1}/>"', 'icon:<GraduationCap size={80} strokeWidth={1}/>')

# 3. Add AuthPage Component (Login + Signup)
auth_page_code = """
/* ────────── AUTH PAGE (Login/Signup) ────────── */
function AuthPage({initialMode="login", onAuth, toast}) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({email:"", password:"", name:"", confirm:""});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if(mode === "signup") {
        if(form.password !== form.confirm) throw new Error("Passwords do not match");
        await axios.post(`${API_BASE}/api/lecturer/register`, {
          email: form.email,
          full_name: form.name,
          password: form.password
        });
        toast.add("Registration successful! Please sign in.");
        setMode("login");
      } else {
        const res = await axios.post(`${API_BASE}/api/lecturer/login`, {
          email: form.email,
          password: form.password
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("lecturer", JSON.stringify(res.data.lecturer));
        onAuth();
      }
    } catch(err) {
      toast.add(err.response?.data?.error || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-submit-page">
      <div className="cb-submit-card" style={{maxWidth:400}}>
        <div className="cb-submit-logo">
          <div><img src="/logo.png" style={{height:52,width:52,objectFit:"contain"}}/></div>
          <div className="cb-submit-title">Lecturer {mode==="login"?"Sign In":"Sign Up"}</div>
          <div className="cb-submit-sub">{mode==="login"?"Access your attendance dashboard":"Create an account to manage your courses"}</div>
        </div>
        <form onSubmit={handleSubmit}>
          {mode==="signup" && (
            <div className="cb-form-row">
              <label className="cb-form-lbl">Full Name</label>
              <input className="cb-form-input" placeholder="Dr. Jane Doe" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
            </div>
          )}
          <div className="cb-form-row">
            <label className="cb-form-lbl">Email Address</label>
            <input className="cb-form-input" type="email" placeholder="lecturer@university.edu" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
          </div>
          <div className="cb-form-row">
            <label className="cb-form-lbl">Password</label>
            <input className="cb-form-input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
          </div>
          {mode==="signup" && (
            <div className="cb-form-row">
              <label className="cb-form-lbl">Confirm Password</label>
              <input className="cb-form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} required/>
            </div>
          )}
          <button type="submit" className="cb-btn-signup" style={{width:"100%", padding:14, fontSize:15, borderRadius:10, marginTop:10}} disabled={loading}>
            {loading ? "Processing..." : (mode==="login" ? "Sign In" : "Create Account")}
          </button>
        </form>
        <div style={{textAlign:"center", marginTop:24, fontSize:14, color:"var(--gray-500)"}}>
          {mode==="login" ? "Don't have an account?" : "Already have an account?"} {" "}
          <button onClick={()=>setMode(mode==="login"?"signup":"login")} style={{background:"none", border:"none", color:"var(--blue)", fontWeight:600, cursor:"pointer"}}>
            {mode==="login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
"""

# Insert AuthPage before App root
src = src.replace('export default function App() {', auth_page_code + '\nexport default function App() {')

# 4. Implement Routing Logic in App component
routing_logic = """
export default function App() {
  const [page, setPage] = useState(() => {
    const p = window.location.pathname.replace("/", "");
    if(["login", "signup", "dashboard", "student"].includes(p)) return p;
    return "home";
  });
  const toast = useToast();

  const navigate = (p) => {
    window.history.pushState({}, "", "/" + (p === "home" ? "" : p));
    setPage(p);
    window.scrollTo(0,0);
  };

  useEffect(() => {
    const handlePop = () => {
      const p = window.location.pathname.replace("/", "");
      setPage(["login", "signup", "dashboard", "student"].includes(p) ? p : "home");
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const isAuth = !!localStorage.getItem("token");

  return (
    <>
      <style>{CSS}</style>
      {page==="home" && (
        <>
          <Nav setPage={navigate} toast={toast}/>
          <HomePage setPage={navigate} toast={toast}/>
        </>
      )}
      {(page==="login" || page==="signup") && (
        <AuthPage 
          initialMode={page} 
          onAuth={() => navigate("dashboard")} 
          toast={toast}
        />
      )}
      {page==="dashboard" && (
        isAuth ? <Dashboard toast={toast}/> : <AuthPage onAuth={() => navigate("dashboard")} toast={toast}/>
      )}
      {page==="student" && <StudentPage setPage={navigate}/>}
      <Toasts ts={toast.ts}/>
    </>
  );
}
"""

# Replace the entire App component
src = re.sub(r'export default function App\(\) \{.*?\}', routing_logic, src, flags=re.DOTALL)

# Update Nav component to use navigate (which is passed as setPage)
src = src.replace('onClick={()=>setPage("dashboard")}>Sign in', 'onClick={()=>navigate("login")}>Sign in')
# Note: Nav uses setPage as navigate, so click handlers calling setPage are already fine.

# Fixing Nav's Sign in button specifically
src = src.replace('onClick={()=>setPage("dashboard")}', 'onClick={()=>setPage("login")}')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

print("Auth and routing patch applied.")
