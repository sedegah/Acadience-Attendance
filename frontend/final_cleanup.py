
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Fix the Nav component bug (navigate -> setPage if it was accidentally introduced)
src = src.replace('onClick={()=>navigate("login")}', 'onClick={()=>setPage("login")}')

# 2. Find the ROOT marker and truncate everything after it to clean up syntax errors
marker = '/* ────────── ROOT ────────── */'
idx = src.find(marker)
if idx != -1:
    src = src[:idx + len(marker)]
else:
    # If recursive marker not found, truncate at the first export default function App
    idx = src.find('export default function App()')
    if idx != -1:
         src = src[:idx]

# 3. Add clean AuthPage and New App router with popstate support
new_code = r"""

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
    <div className="cb-submit-page" style={{minHeight:"100vh", padding:"80px 20px"}}>
      <div className="cb-submit-card" style={{maxWidth:400, margin:"0 auto"}}>
        <div className="cb-submit-logo">
          <div><img src="/logo.png" style={{height:52,width:52,objectFit:"contain"}}/></div>
          <div className="cb-submit-title">Lecturer {mode==="login"?"Sign In":"Sign Up"}</div>
          <div className="cb-submit-sub">{mode==="login"?"Access your attendance dashboard":"Create an account to manage your sessions"}</div>
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
          <button type="submit" className="cb-btn-signup" style={{width:"100%", padding:14, fontSize:15, borderRadius:100, marginTop:10}} disabled={loading}>
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
        isAuth ? <Dashboard toast={toast}/> : <AuthPage initialMode="login" onAuth={() => navigate("dashboard")} toast={toast}/>
      )}
      {page==="student" && <StudentPage setPage={navigate}/>}
      <Toasts ts={toast.ts}/>
    </>
  );
}
"""
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src + new_code)

print("Final cleanup patch applied.")
