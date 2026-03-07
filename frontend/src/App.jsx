import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, Navigate, Link, NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const API_BASE = "https://acadience-attendance-api.sedegahkimathi.workers.dev";
import {
    Wifi, MapPin, Lock, AlertTriangle, BarChart2, Cloud,
    FolderOpen, Calendar, Users, Download, Shield, Bell,
    Smartphone, Camera, CheckCircle, Zap, Search,
    Settings, GraduationCap, Home, ClipboardList, Database,
    Ruler, RotateCcw, Check, X, ChevronLeft, ChevronRight,
    ChevronDown, User, RefreshCw, QrCode, LogOut,
    LayoutDashboard, BookOpen, AlertCircle, TrendingUp,
    TrendingDown, Activity, ArrowRight, Plus, Filter,
    CheckCircle2, XCircle, Scan, Trash2, Download as DownloadIcon
} from "lucide-react";

const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const fmt = n => n < 10 ? "0" + n : "" + n;
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --blue: #0052FF;
  --blue-h: #0040E5;
  --bg: #FFFFFF;
  --t1: #0A0B0D;
  --t2: #5B616E;
  --t3: #89909E;
  --border: #ECEFF1;
  --gray-50: #F9FAFB;
  --gray-100: #F4F7F9;
  --green: #09853A;
  --red: #CF304A;
  --shadow: 0 4px 12px rgba(0,0,0,0.05);
  --radius: 8px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { 
  font-family: 'Inter', -apple-system, sans-serif; 
  background-color: var(--bg); 
  color: var(--t1);
  -webkit-font-smoothing: antialiased;
}

button { font-family: inherit; cursor: pointer; border: none; background: none; }
input, select { font-family: inherit; }

/* CDS Navigation */
.cb-nav {
  height: 64px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}
.cb-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.cb-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  font-weight: 700;
  color: var(--blue);
  font-size: 20px;
}
.cb-nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
}
.cb-nav-btn {
  font-size: 14px;
  font-weight: 500;
  color: var(--t2);
  text-decoration: none;
  transition: color 0.2s;
}
.cb-nav-btn:hover { color: var(--blue); }
.cb-nav-btn.active { color: var(--blue); border-bottom: 2px solid var(--blue); padding-bottom: 21px; }

/* CDS Buttons */
.cb-btn {
  padding: 10px 18px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.cb-btn-pri { background: var(--blue); color: #fff; }
.cb-btn-pri:hover { background: var(--blue-h); }
.cb-btn-sec { background: var(--gray-100); color: var(--t1); }
.cb-btn-sec:hover { background: #E8EDF0; }

/* Dashboard Layout */
.app-container { min-height: 100vh; display: flex; flex-direction: column; }
.main-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;
}

/* Card System */
.stat-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
}
.stat-lbl { font-size: 12px; color: var(--t2); text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
.stat-val { font-size: 32px; font-weight: 700; color: var(--t1); }

/* Table System */
.cb-tbl-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
.cb-tbl { width: 100%; border-collapse: collapse; background: #fff; }
.cb-tbl th { text-align: left; padding: 12px 16px; font-size: 12px; color: var(--t3); border-bottom: 1px solid var(--border); }
.cb-tbl td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
.cb-tbl tr:hover { background: var(--gray-50); }

/* Icons & Helpers */
.cb-icon-btn { color: var(--t2); padding: 8px; border-radius: 50%; transition: background 0.2s; }
.cb-icon-btn:hover { background: var(--gray-100); }

@media (max-width: 1024px) {
  .main-wrapper { grid-template-columns: 1fr; }
  .left-col, .right-col { display: none; }
}

/* Modal */
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; width: 480px; padding: 32px; box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
`;

/* ────────── DATA (live from API) ────────── */
const NAV_MENUS = {
    Features: {
        promo: { title: "How Acadience works", desc: "QR codes, geofencing and device locks in one workflow.", link: "Watch demo", bg: "#0052FF", icon: <Wifi size={18} /> },
        cols: [
            {
                items: [
                    { icon: <Wifi size={18} />, title: "Dynamic QR", desc: "HMAC-signed tokens rotate every 30 s" },
                    { icon: <MapPin size={18} />, title: "Geofencing", desc: "Haversine GPS validation per session" },
                    { icon: <Lock size={18} />, title: "Device fingerprint", desc: "One device = one submission per session" },
                ]
            },
            {
                items: [
                    { icon: <AlertTriangle size={18} />, title: "Flagged review", desc: "Approve or reject suspicious submissions" },
                    { icon: <BarChart2 size={18} />, title: "Analytics", desc: "Real-time rates and CSV export" },
                    { icon: <Cloud size={18} />, title: "Serverless", desc: "Cloudflare Workers + D1, zero cold starts" },
                ]
            },
        ],
    },
    Lecturers: {
        promo: { title: "Everything lecturers need.", desc: "Dashboard, QR panel, flagged review, CSV.", link: "Open dashboard", bg: "#0052FF", icon: <GraduationCap size={80} strokeWidth={1} /> },
        cols: [
            {
                items: [
                    { icon: <FolderOpen size={18} />, title: "Courses", desc: "Manage courses and enrollments" },
                    { icon: <Calendar size={18} />, title: "Sessions", desc: "Create sessions and display QR" },
                    { icon: <Users size={18} />, title: "Students", desc: "View per-student attendance records" },
                ]
            },
            {
                items: [
                    { icon: <Download size={18} />, title: "CSV Export", desc: "One-click download for registers" },
                    { icon: <Shield size={18} />, title: "Access control", desc: "Cloudflare Access for auth" },
                    { icon: <Bell size={18} />, title: "Alerts", desc: "Flag notifications by email" },
                ]
            },
        ],
    },
    Students: {
        promo: { title: "No app needed.", desc: "Students just scan the QR with any phone browser.", link: "Try check-in", bg: "#0039B3", icon: <Smartphone size={18} /> },
        cols: [
            {
                items: [
                    { icon: <Camera size={18} />, title: "Scan QR", desc: "Open camera, scan, submit" },
                    { icon: <MapPin size={18} />, title: "GPS check", desc: "Location validated automatically" },
                    { icon: <CheckCircle size={18} />, title: "Confirmation", desc: "Instant receipt on submission" },
                ]
            },
            {
                items: [
                    { icon: <Lock size={18} />, title: "No account", desc: "Students need no login at all" },
                    { icon: <Zap size={18} />, title: "Instant", desc: "Submissions processed in < 200 ms" },
                    { icon: <Wifi size={18} />, title: "Works offline?", desc: "Requires GPS + internet to submit" },
                ]
            },
        ],
    },
};
const FOOTER_COLS = {
    Platform: ["Dashboard", "Sessions", "Courses", "Enrollments", "CSV Export", "API Docs"],
    Lecturers: ["Getting started", "QR display", "Geofence setup", "Flagged review", "Analytics", "Access control"],
    Students: ["How to check in", "QR troubleshooting", "Privacy policy", "Contact support"],
    Company: ["About", "Blog", "Careers", "Security", "Status", "Changelog"],
};
/* ────────── TOAST ────────── */
function useToast() {
    const [ts, setTs] = useState([]);
    const add = useCallback((msg, type = "success") => {
        const id = Date.now();
        setTs(t => [...t, { id, msg, type }]);
        setTimeout(() => setTs(t => t.filter(x => x.id !== id)), 3400);
    }, []);
    return { ts, add };
}
function Toasts({ ts }) {
    const ic = { success: <CheckCircle2 size={14} />, error: <XCircle size={14} />, warn: <AlertTriangle size={14} /> };
    return (
        <div className="toast-wrap">
            {ts.map(t => (
                <div key={t.id} className={`toast ${t.type} `}>
                    <span style={{ color: t.type === "success" ? "var(--green)" : t.type === "error" ? "var(--red)" : "var(--amber)" }}>{ic[t.type]}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

/* ────────── QR PATTERN ────────── */
function QRPattern({ seed }) {
    let s = (seed || 1) * 9301 + 49297;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const fnd = new Set();
    [[0, 0], [0, 1], [1, 0], [0, 2], [1, 2], [2, 0], [2, 1], [2, 2], [9, 0], [10, 0], [11, 0], [9, 1], [11, 1], [9, 2], [10, 2], [11, 2], [0, 9], [1, 9], [2, 9], [0, 10], [2, 10], [0, 11], [1, 11], [2, 11]].forEach(([r, c]) => fnd.add(`${r},${c} `));
    const cells = [];
    for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
        const filled = fnd.has(`${r},${c} `)
            ? (r % 12 <= 2 || (r % 12 >= 9 && r % 12 <= 11)) && (c % 12 <= 2 || (c % 12 >= 9 && c % 12 <= 11))
            : rng() > 0.45;
        cells.push({ r, c, filled });
    }
    return (
        <div className="qr-grid-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px', width: '120px', height: '120px' }}>
            {cells.map(({ r, c, filled }) => (
                <div key={`${r} -${c} `} className="qr-cell" style={{ background: filled ? "var(--t1)" : "transparent", borderRadius: '1.5px' }} />
            ))}
        </div>
    );
}

/* ────────── MEGA MENU ────────── */
function MegaMenu({ data, onClose }) {
    return (
        <div className="cb-mega" onMouseLeave={onClose}>
            <div className="cb-mega-col">
                {data.cols[0]?.items.map(item => (
                    <div key={item.title} className="cb-mega-item">
                        <div className="cb-mega-icon">{item.icon}</div>
                        <div><div className="cb-mega-title">{item.title}</div><div className="cb-mega-desc">{item.desc}</div></div>
                    </div>
                ))}
            </div>
            <div className="cb-mega-col">
                {data.cols[1]?.items.map(item => (
                    <div key={item.title} className="cb-mega-item">
                        <div className="cb-mega-icon">{item.icon}</div>
                        <div><div className="cb-mega-title">{item.title}</div><div className="cb-mega-desc">{item.desc}</div></div>
                    </div>
                ))}
            </div>
            <div className="cb-mega-promo-col">
                <div className="cb-mega-promo-inner">
                    <div className="cb-mega-promo-card" style={{ background: data.promo.bg }}>{data.promo.icon}</div>
                    <div>
                        <div className="cb-mega-promo-title">{data.promo.title}</div>
                        <div className="cb-mega-promo-desc">{data.promo.desc}</div>
                        <span className="cb-mega-promo-link">{data.promo.link}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ────────── NAV (home) ────────── */
function Nav({ toast }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(null); setMobileOpen(false); } };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    return (
        <nav className="cb-nav" ref={ref}>
            <div className="cb-nav-inner">
                <Link to="/" className="cb-logo">
                    <img src="/logo.png" style={{ height: 38, width: 38, objectFit: "contain" }} />
                    <span style={{ fontWeight: 800, color: "var(--blue)" }}>Acadience</span>
                </Link>
                <ul className="cb-nav-links cb-desktop-only" style={{ listStyle: "none", display: "flex", gap: 32 }}>
                    {Object.keys(NAV_MENUS).map(name => (
                        <li key={name} className="cb-nav-item">
                            <button className={`cb-nav-btn${open === name ? " active" : ""}`}
                                onMouseEnter={() => setOpen(name)} onClick={() => setOpen(p => p === name ? null : name)}>
                                {name} <ChevronDown size={14} style={{ opacity: .6, marginLeft: 4 }} />
                            </button>
                            {open === name && <MegaMenu data={NAV_MENUS[name]} onClose={() => setOpen(null)} />}
                        </li>
                    ))}
                    <li><button className="cb-nav-btn" onClick={() => toast.add("Pricing coming soon", "warn")}>Pricing</button></li>
                </ul>
                <div className="cb-nav-actions" style={{ display: "flex", gap: 12 }}>
                    <button className="cb-btn cb-btn-sec cb-desktop-only" onClick={() => navigate("/login")}>Sign in</button>
                    <button className="cb-btn cb-btn-pri cb-desktop-only" onClick={() => navigate("/student")}>Student check-in</button>
                    <button className="cb-hamburger" onClick={() => setMobileOpen(p => !p)} aria-label="Menu">
                        {mobileOpen ? <X size={22} /> : <><span /><span /><span /></>}
                    </button>
                </div>
            </div>
            {mobileOpen && (
                <div className="cb-mobile-menu">
                    {Object.keys(NAV_MENUS).map(name => (
                        <button key={name} className="cb-mobile-link" onClick={() => { setMobileOpen(false); navigate("/docs"); }}>{name}</button>
                    ))}
                    <button className="cb-mobile-link" onClick={() => { setMobileOpen(false); toast.add("Pricing coming soon", "warn"); }}>Pricing</button>
                    <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />
                    <button className="cb-mobile-link" onClick={() => { setMobileOpen(false); navigate("/login"); }}>Sign in</button>
                    <button className="cb-mobile-link cb-mobile-cta" onClick={() => { setMobileOpen(false); navigate("/student"); }}>Student check-in</button>
                </div>
            )}
        </nav>
    );
}

/* ────────── DASHBOARD NAV ────────── */
function DashNav({ onLogout }) {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setMobileOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const navItems = [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Sessions", to: "/dashboard/sessions" },
        { label: "Courses", to: "/dashboard/courses" },
        { label: "Flagged", to: "/dashboard/flags" },
    ];

    return (
        <nav className="cb-nav" ref={ref}>
            <div className="cb-nav-inner">
                <Link to="/" className="cb-logo">
                    <img src="/logo.png" style={{ height: 32, width: 32, objectFit: "contain" }} />
                    <span style={{ fontWeight: 800, color: "var(--blue)" }}>Acadience</span>
                </Link>
                <ul className="cb-nav-links cb-desktop-only" style={{ listStyle: "none", display: "flex", gap: 32 }}>
                    {navItems.map(it => (
                        <li key={it.label}>
                            <NavLink
                                to={it.to}
                                end={it.to === "/dashboard"}
                                className={({ isActive }) => `cb-nav-btn${isActive ? " active" : ""}`}
                            >
                                {it.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <div className="cb-nav-actions" style={{ display: "flex", gap: 12 }}>
                    <button className="cb-icon-btn"><Bell size={18} /></button>
                    <button className="cb-icon-btn"><Settings size={18} /></button>
                    <button className="cb-icon-btn" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} title="Sign out"><LogOut size={18} /></button>
                    <button className="cb-hamburger" onClick={() => setMobileOpen(p => !p)} aria-label="Menu">
                        {mobileOpen ? <X size={22} /> : <><span /><span /><span /></>}
                    </button>
                </div>
            </div>
            {mobileOpen && (
                <div className="cb-mobile-menu">
                    {navItems.map(it => (
                        <NavLink
                            key={it.label}
                            to={it.to}
                            end={it.to === "/dashboard"}
                            className={({ isActive }) => `cb-mobile-link${isActive ? " cb-mobile-cta" : ""}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {it.label}
                        </NavLink>
                    ))}
                    <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />
                    <button className="cb-mobile-link" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Sign out</button>
                </div>
            )}
        </nav>
    );
}

/* ────────── QR PANEL (dark) ────────── */
function QRPanel({ session, onRefresh }) {
    const [secs, setSecs] = useState(30);
    const [seed, setSeed] = useState(() => Math.floor(Math.random() * 9999) + 1);
    useEffect(() => {
        const t = setInterval(() => setSecs(s => {
            if (s <= 1) { setSeed(Math.floor(Math.random() * 9999) + 1); return 30; }
            return s - 1;
        }), 1000);
        return () => clearInterval(t);
    }, []);
    const refresh = () => { setSeed(Math.floor(Math.random() * 9999) + 1); setSecs(30); onRefresh?.(); };
    const tc = secs <= 5 ? "red" : secs <= 10 ? "orange" : "var(--blue)";
    const qrVal = session?.qr_token ? `${window.location.origin}/#/student?token=${session.qr_token}` : `${window.location.origin}/#/student?token=DEMO_${seed}`;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", letterSpacing: ".1em", textTransform: "uppercase" }}>Live Session QR</div>
            <div style={{ padding: 16, background: "white", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                <QRCodeSVG value={qrVal} size={150} level="M" />
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)" }}>ROTATES IN</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: tc, marginTop: 4 }}>00:{secs.toString().padStart(2, '0')}</div>
            </div>
        </div>
    );
}

/* ────────── PHONE MOCKUP (hero) ────────── */
function PhoneMockup({ tab, setTab }) {
    const rows = [
        { icon: <Calendar size={18} />, ibg: "#EBF0FF", name: "Sessions", val: "1 active", up: false },
        { icon: <Users size={18} />, ibg: "#F0FDF4", name: "Students", val: "↗ 215", up: true },
        { icon: <CheckCircle size={18} />, ibg: "#F0FDF4", name: "Attendance", val: "↗ 91%", up: true },
        { icon: <AlertTriangle size={18} />, ibg: "#FFFBEB", name: "Flagged", val: "2 pending", up: false },
        { icon: <BarChart2 size={13} />, ibg: "#F5F3FF", name: "Reports", val: "CSV ready", up: false },
    ];
    return (
        <div className="cb-phone-mockup">
            <div className="cb-phone-topbar">
                <div className="cb-phone-search"><Search size={10} /> Search</div>
                <div style={{ display: "flex", gap: 3 }}>
                    {[<Bell size={9} />, <ChevronRight size={9} />, <User size={9} />].map((ic, idx) => <span key={idx} style={{ width: 20, height: 20, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</span>)}
                </div>
            </div>
            <div className="cb-phone-body">
                <div className="cb-phone-bal">91.4%</div>
                <div className="cb-phone-chg" style={{ display: "flex", alignItems: "center", gap: 2 }}><TrendingUp size={11} /> Avg attendance rate</div>
                <div className="cb-phone-chart">
                    <svg viewBox="0 0 220 80" fill="none" preserveAspectRatio="none">
                        <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0052FF" stopOpacity=".18" /><stop offset="100%" stopColor="#0052FF" stopOpacity="0" /></linearGradient></defs>
                        <path d="M0,68 C15,65 25,70 45,62 C65,54 75,58 95,48 C115,38 125,42 145,30 C165,18 180,22 200,12 L220,6 L220,80 L0,80Z" fill="url(#pg)" />
                        <path d="M0,68 C15,65 25,70 45,62 C65,54 75,58 95,48 C115,38 125,42 145,30 C165,18 180,22 200,12 L220,6" stroke="#0052FF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        <circle cx="220" cy="6" r="3.5" fill="#0052FF" />
                    </svg>
                </div>
                <div className="cb-phone-tabs">
                    {["1H", "1D", "1W", "Term"].map(t => (
                        <button key={t} className={`cb - phone - tab${tab === t ? " active" : ""} `} onClick={() => setTab(t)}>{t}</button>
                    ))}
                </div>
                {rows.map(r => (
                    <div key={r.name} className="cb-phone-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div className="cb-phone-row-icon" style={{ background: r.ibg }}>{r.icon}</div>
                            <span className="cb-phone-row-name">{r.name}</span>
                        </div>
                        <span className={`cb - phone - row - val${r.up ? " up" : ""} `}>{r.up && <TrendingUp size={9} />} {r.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ────────── [] ASSET TABLE (dark, Coinbase Explore style) ────────── */
function SessionsAssetTable({ sessions = [] }) {
    const [activeTab, setActiveTab] = useState("All");
    const tabs = ["All", "Active", "Closed"];
    const rows = sessions.filter(s => activeTab === "All" || s.status === (activeTab === "Active" ? "active" : "closed"));
    const icons = { CS401: <Ruler size={16} />, CS302: <Database size={16} />, EE210: <Zap size={16} />, MATH310: <BarChart2 size={16} /> };
    const ibg = { CS401: "#EBF0FF", CS302: "#F0FDF4", EE210: "#FEF3C7", MATH310: "#F5F3FF" };
    return (
        <div className="cb-asset-table">
            <div className="cb-asset-tabs">
                {tabs.map(t => (
                    <button key={t} className={`cb - asset - tab${activeTab === t ? " active" : ""} `} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
            </div>
            {rows.map(s => (
                <div key={s.id} className="cb-asset-row">
                    <div className="cb-asset-left">
                        <div className="cb-asset-icon" style={{ background: ibg[s.courseName] || "#333", fontSize: 18 }}>{icons[s.courseName] || "<ClipboardList size={14}/>"}</div>
                        <div>
                            <div className="cb-asset-name">{s.courseName}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{s.date} · {s.time}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div className="cb-asset-price">{pct(s.attended, s.total)}%</div>
                        <div className={`cb - asset - chg ${s.attended / s.total >= .8 ? "up" : "dn"} `}>
                            {s.attended / s.total >= .8 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.attended}/{s.total} present
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ────────── FEATURE PHONE (Coinbase One style) ────────── */
function FeaturePhone() {
    return (
        <div className="cb-feat-wrap">
            <div className="cb-feat-phone">
                <div className="cb-feat-phone-status"><span>9:41</span><span>▪▪ WiFi 100%</span></div>
                {/* Success screen */}
                <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <Check size={24} color="white" strokeWidth={3} />
                        <div style={{ position: "absolute", bottom: -3, right: -3, width: 18, height: 18, background: "#FFD700", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={9} color="white" /></div>
                    </div>
                </div>
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>Attendance recorded!</div>
                <div style={{ textAlign: "center", fontSize: 11, color: "#888", marginBottom: 8 }}>CS401 · 27 Feb · 09:07</div>
                {/* receipt */}
                <div style={{ background: "#F5F5F5", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {[["Student", "10024"], ["Name", "Kwame Boateng"], ["GPS", "<Check size={13}/> In range"], ["Device", "<Check size={13}/> Verified"]].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                            <span style={{ color: "#888" }}>{k}</span>
                            <span style={{ fontWeight: 600, color: v.startsWith("<Check size={13}/>") ? "var(--green)" : undefined }}>{v}</span>
                        </div>
                    ))}
                </div>
                {/* geo preview */}
                <div style={{ background: "#F0F4FF", borderRadius: 10, height: 60, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
                    {[70, 46, 24].map((d, i) => <div key={d} style={{ position: "absolute", width: d, height: d, borderRadius: "50%", border: "1.5px solid rgba(0,82,255,.25)", animation: `geoP 3s ease -in -out ${i * .5}s infinite` }} />)}
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", position: "relative", zIndex: 2, boxShadow: "0 0 8px rgba(0,82,255,.5)" }} />
                    <div style={{ position: "absolute", bottom: 5, left: 8, fontSize: 9, color: "#888" }}>100 m radius · GPS <Check size={13} /></div>
                </div>
                {/* bottom nav */}
                <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: "auto" }}>
                    {[<Home size={14} />, <Search size={14} />, <ClipboardList size={14} />, <Bell size={14} />, <User size={14} />].map((ic, i) => <span key={i} style={{ color: i === 2 ? "var(--blue)" : "#bbb" }}>{ic}</span>)}
                </div>
            </div>
        </div>
    );
}

/* ────────── ARTICLES ────────── */
const ARTICLES = [
    { bg: "radial-gradient(circle at 50% 60%,#0052FF 0%,#001266 55%,#000 100%)", icon: <Wifi size={18} />, title: "How rotating QR codes stop proxy attendance", excerpt: "HMAC-signed tokens that expire every 30 seconds make it impossible to share screenshots from a previous class..." },
    { bg: "linear-gradient(135deg,#0052FF,#2775FF)", icon: <MapPin size={18} />, title: "Geofencing 101: keeping attendance honest", excerpt: "Haversine distance calculations verify that each student's GPS coordinates fall within the lecture radius at check-in time..." },
    { bg: "#8FAAA4", icon: <BarChart2 size={18} />, title: "Using attendance data to predict student outcomes", excerpt: "Research shows attendance is the single strongest early-warning indicator for at-risk students — even before midterm grades..." },
];

/* ────────── HOME PAGE ────────── */
function HomePage({ toast }) {
    const navigate = useNavigate();
    const [heroTab, setHeroTab] = useState("1D");
    const [email, setEmail] = useState("");
    const circles = [
        { w: 115, bg: "#0052FF", l: 100, t: 130, c: <img src="/logo.png" style={{ width: 50, height: 50, objectFit: "contain" }} /> },
        { w: 88, bg: "#1B2744", l: 178, t: 30, c: <QrCode size={32} color="white" /> },
        { w: 88, bg: "#22C55E", l: 258, t: 110, c: <Check size={26} color="white" /> },
        { w: 115, bg: "#F59E0B", l: 170, t: 165, c: <MapPin size={32} color="white" /> },
        { w: 88, bg: "#6366F1", l: 82, t: 252, c: <Users size={26} color="white" /> },
        { w: 88, bg: "#1A3980", l: 248, t: 235, c: <BarChart2 size={18} color="white" /> },
        { w: 78, bg: "#8EA9D7", l: 172, t: 285, c: <Lock size={22} color="white" /> },
    ];
    return (
        <div style={{ background: "white", color: "var(--text)" }}>

            {/* ── HERO ── */}
            <section>
                <div className="cb-hero">
                    <div>
                        <h1 className="cb-hero-title">The future of<br />attendance<br />is here.</h1>
                        <p className="cb-hero-sub">QR-based, geofenced, and serverless. Acadience makes attendance fraud-proof for lecturers and effortless for students.</p>
                        <div className="cb-hero-form">
                            <input type="email" placeholder="institution@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
                            <button className="cb-hero-form-btn" onClick={() => navigate("/login")}>Get started</button>
                        </div>

                    </div>
                    <div>
                        <div className="cb-phone-bg">
                            <PhoneMockup tab={heroTab} setTab={setHeroTab} />
                            <p style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Live attendance dashboard. Updates in real time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── EXPLORE / [] (gray section, dark table) ── */}
            <section className="cb-sec-gray">
                <div className="cb-two-col">
                    <div>
                        <h2 className="cb-h2">Track every lecture,<br />course, and student.</h2>
                        <p className="cb-p">Real-time attendance rates, per-student records, flagged submission review, and one-click CSV exports — all in one dashboard.</p>
                        <button className="cb-btn-dark" onClick={() => navigate("/login")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Open dashboard <ArrowRight size={16} /></button>
                    </div>
                    <SessionsAssetTable sessions={[]} />
                </div>
            </section>

            {/* ── QR SECTION (white, phone right) ── */}
            <section>
                <div className="cb-two-col">
                    <div style={{ background: "#F2F2F2", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: 30, aspectRatio: "1" }}>
                        <QRPanel session={{ id: 1, courseName: "CS401", attended: 38, total: 48, flagged: 0, status: "active", duration: 90 }} onRefresh={() => toast.add("QR refreshed", "success")} />
                    </div>
                    <div>
                        <div className="cb-badge-pill"><div className="cb-badge-dot">QR</div> DYNAMIC QR CODES</div>
                        <h2 className="cb-h2">One scan.<br />Instant, verified attendance.</h2>
                        <p className="cb-p">Each session generates a time-bound QR code signed with HMAC. Codes rotate every 30 seconds — screenshots from yesterday simply won't work. Lecturers can force-refresh any time.</p>
                        <button className="cb-btn-dark" onClick={() => navigate("/student")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Try student check-in <ArrowRight size={16} /></button>
                    </div>
                </div>
            </section>

            {/* ── GEOFENCE SECTION (gray, visual left) ── */}
            <section className="cb-sec-gray">
                <div className="cb-two-col">
                    <div>
                        <div className="cb-badge-pill"><div className="cb-badge-dot"><MapPin size={18} color="var(--blue)" /></div> GEOFENCING</div>
                        <h2 className="cb-h2">They have to be there<br />to mark themselves present.</h2>
                        <p className="cb-p">Haversine-formula GPS validation checks that each student is within your configurable radius. Submissions from outside are automatically flagged for lecturer review.</p>
                        <button className="cb-btn-dark" onClick={() => navigate("/login")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Review flagged <ArrowRight size={16} /></button>
                    </div>
                    <div style={{ background: "white", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
                        <div style={{ position: "relative", width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {[240, 160, 90].map((d, i) => (
                                <div key={d} style={{ position: "absolute", width: d, height: d, borderRadius: "50%", background: `rgba(0, 82, 255, ${.04 + i * .02})`, border: "1.5px solid rgba(0,82,255,.18)" }} />
                            ))}
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,82,255,.12)", border: "2px solid var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, zIndex: 2 }}><MapPin size={18} color="var(--blue)" /></div>
                            {[["-16px", "50%", true], ["20%", "calc(100% - 20px)", true], ["calc(100% - 16px)", "28%", true], ["10%", "12%", false]].map(([t, l, ok], i) => (
                                <div key={i} style={{ position: "absolute", top: t, left: l, width: 30, height: 30, borderRadius: "50%", background: ok ? "rgba(5,177,105,.12)" : "rgba(207,48,74,.1)", border: `2px solid ${ok ? "var(--green)" : "var(--red)"} `, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                                    {ok ? <Check size={12} /> : <X size={12} />}
                                </div>
                            ))}
                            <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, color: "var(--gray-500)" }}>Radius: 100 m</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STUDENT CHECK-IN SECTION (Coinbase One style) ── */}
            <section>
                <div className="cb-two-col">
                    <div>
                        <div className="cb-badge-pill"><div className="cb-badge-dot"><Smartphone size={32} /></div> STUDENT CHECK-IN</div>
                        <h2 className="cb-h2">No app.<br />No account.<br />Just scan.</h2>
                        <p className="cb-p">Students open any browser, scan the QR code displayed in class, fill in their student ID and name — done in under 10 seconds. No app download, no login, no friction.</p>
                        <button className="cb-btn-dark" onClick={() => navigate("/student")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Try it now <ArrowRight size={16} /></button>
                    </div>
                    <FeaturePhone />
                </div>
            </section>

            {/* ── LEARN / BLOG (gray) ── */}
            <section className="cb-sec-gray">
                <div style={{ maxWidth: 1440, margin: "0 auto" }}>
                    <div className="cb-two-col" style={{ padding: 0, maxWidth: "100%", alignItems: "end", marginBottom: 48 }}>
                        <h2 style={{ fontSize: "clamp(32px,4vw,54px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1 }}>
                            Better attendance.<br />Better outcomes.
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "flex-end" }}>
                            <p style={{ fontSize: 15, color: "var(--gray-500)", lineHeight: 1.6, maxWidth: 400 }}>Attendance is the strongest early-warning indicator for at-risk students. Acadience gives you the data to act before it's too late.</p>
                            <div><button className="cb-btn-dark">Read more</button></div>
                        </div>
                    </div>
                    <div className="cb-articles">
                        {ARTICLES.map((a, i) => (
                            <div key={i} className="cb-article" onClick={() => setPage("docs")}>
                                <div className="cb-article-img" style={{ background: a.bg }}>{a.icon}</div>
                                <div className="cb-article-body"><h3>{a.title}</h3><p>{a.excerpt}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section>
                <div className="cb-cta-section">
                    <div>
                        <h2 className="cb-cta-h2">Take control<br />of attendance.</h2>
                        <p className="cb-cta-p">Start your first session today and see attendance fraud eliminated.</p>
                        <div className="cb-cta-form">
                            <input type="email" placeholder="institution@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
                            <button className="cb-cta-btn" onClick={() => setPage("login")}>Get started</button>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="cb-circles">
                            {circles.map((c, i) => (
                                <div key={i} className="cb-cc" style={{ width: c.w, height: c.w, background: c.bg, left: c.l, top: c.t }}>{c.c}</div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "center", fontSize: 13, color: "var(--gray-400)", padding: "20px 16px 40px", borderTop: "1px solid var(--gray-100)", maxWidth: 1440, margin: "0 auto" }}>
                    Built on Cloudflare Workers + D1. Authentication via Cloudflare Access. Student data never leaves your account.
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="cb-footer">
                <div className="cb-footer-grid">
                    <div>
                        <img src="/logo.png" style={{ height: 42, width: 42, objectFit: "contain" }} />
                    </div>
                    {Object.entries(FOOTER_COLS).map(([col, links]) => (
                        <div key={col} className="cb-footer-col">
                            <h4>{col}</h4>
                            <ul>{links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
                        </div>
                    ))}
                </div>
                <div className="cb-footer-bottom">
                    <div className="cb-footer-bottom-left">© 2025 Acadience. Serverless attendance on Cloudflare.</div>
                    <div className="cb-footer-bottom-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a></div>
                </div>
            </footer>
        </div>
    );
}

/* ────────── DASHBOARD INTERNALS ────────── */
function StatsRow({ sessions = [], courses = [], flags = [] }) {
    const activeSessions = sessions.filter(s => s.status === "active").length;
    const allSessions = sessions.filter(s => s.total > 0);
    const avgRate = allSessions.length ? Math.round(allSessions.reduce((a, s) => a + pct(s.attended_count || s.attended || 0, s.total || 1), 0) / allSessions.length) : 0;
    const stats = [
        { lbl: "Active Sessions", val: String(activeSessions), sub: `${activeSessions} live now`, dir: "up", color: "#0052FF", bar: Math.min(100, activeSessions * 33) },
        { lbl: "Total Courses", val: String(courses.length), sub: `${courses.length} courses`, dir: "neu", color: "#6366F1", bar: 100 },
        { lbl: "Avg Attendance", val: `${avgRate}% `, sub: "this term", dir: "up", color: "var(--green)", bar: avgRate },
        { lbl: "Flagged", val: String(flags.filter(f => f.status === "pending").length), sub: "Need review", dir: "dn", color: "#D97706", bar: 15 },
    ];
    return (
        <div className="cb-stats">
            {stats.map(s => (
                <div key={s.lbl} className="cb-stat-card">
                    <div className="cb-stat-lbl">{s.lbl}</div>
                    <div className="cb-stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className={`cb - stat - sub ${s.dir} `}>{s.sub}</div>
                    <div className="cb-stat-bar"><div className="cb-stat-bar-fill" style={{ width: `${s.bar}% `, background: s.color }} /></div>
                </div>
            ))}
        </div>
    );
}

function SessionsTable({ onView, onNew, toast, sessions = [], courses = [] }) {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const rows = sessions.filter(s => {
        if (filter === "active" && s.status !== "active") return false;
        if (filter === "closed" && s.status !== "closed") return false;
        return s.courseName.toLowerCase().includes(search.toLowerCase());
    });
    return (
        <div className="cb-tbl-wrap">
            <div className="cb-tbl-top">
                <div className="cb-tbl-title">Sessions</div>
                <div className="cb-tbl-filters">
                    {["all", "active", "closed"].map(f => (
                        <button key={f} className={`cb - filter - pill${filter === f ? " active" : ""} `} onClick={() => setFilter(f)}>
                            {f === "all" ? "All" : f === "active" ? "Live" : "Closed"}
                        </button>
                    ))}
                    <div className="cb-search-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <input placeholder="Search sessions…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <table className="cb-tbl">
                <thead><tr>
                    <th>Course</th><th>Date</th><th>Time</th>
                    <th className="c">Status</th><th className="r">Attendance</th>
                    <th className="r">Rate</th><th className="c">Flagged</th><th className="r">Actions</th>
                </tr></thead>
                <tbody>
                    {rows.length === 0
                        ? <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>No sessions found</td></tr>
                        : rows.map(s => (
                            <tr key={s.session_id} onClick={() => onView(s)}>
                                <td><span style={{ fontWeight: 700, color: "var(--text)" }}>{s.courseName || s.course_code || "Unknown Course"}</span></td>
                                <td>{s.date || (s.start_time ? s.start_time.split('T')[0] : "—")}</td>
                                <td style={{ fontVariantNumeric: "tabular-nums" }}>{s.time || (s.start_time ? s.start_time.split('T')[1]?.substring(0, 5) : "—")}</td>
                                <td className="c">
                                    <span className={`cb - bdg ${s.status === "active" ? "green" : "gray"} `}>
                                        {s.status === "active" && <span className="cb-bdg-dot" />}
                                        {s.status === "active" ? "LIVE" : "CLOSED"}
                                    </span>
                                </td>
                                <td className="r" style={{ fontVariantNumeric: "tabular-nums" }}>{s.attended || 0} / {s.total || 0}</td>
                                <td className="r"><span style={{ fontWeight: 600, color: pct(s.attended, s.total) >= 80 ? "var(--green)" : pct(s.attended, s.total) >= 60 ? "#D97706" : "var(--red)" }}>{pct(s.attended, s.total)}%</span></td>
                                <td className="c">{s.flagged > 0 ? <span className="cb-bdg yellow"><AlertTriangle size={18} /> {s.flagged}</span> : <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                                <td className="r" onClick={e => e.stopPropagation()}>
                                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                        <button className="cb-btn-signin" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => onView(s)}>View</button>
                                        {s.status === "active" && <button className="cb-trade-btn" style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }} onClick={() => toast.add("QR refreshed", "success")}><RotateCcw size={12} /> QR</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

function FlaggedView({ toast }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        axios.get(`${API_BASE} /api/lecturer / flags`, { headers: getAuthHeaders() })
            .then(r => setItems(Array.isArray(r.data) ? r.data : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);
    const handle = async (id, action) => {
        try {
            await axios.post(`${API_BASE} /api/lecturer / flags / ${id}/${action}`, {}, { headers: getAuthHeaders() });
            setItems(it => it.map(i => (i.attendance_id === id) ? { ...i, status: action === "approve" ? "approved" : "rejected" } : i));
            toast.add(action === "approve" ? "Submission approved" : "Submission rejected", action === "approve" ? "success" : "error");
        } catch (e) { toast.add("Action failed", "error"); }
    };
    const pending = items.filter(i => i.status === "pending");
    const resolved = items.filter(i => i.status !== "pending");
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.8px" }}>Flagged Submissions</h2>
                    <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 4 }}>{pending.length} awaiting review</p>
                </div>
            </div>
            {pending.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}><Check size={13} /> All submissions reviewed</div>}
            {pending.map(f => (
                <div key={f.attendance_id} className="cb-flag-card">
                    <div className="cb-flag-icon"><AlertTriangle size={18} /></div>
                    <div style={{ flex: 1 }}>
                        <div className="cb-flag-name">{f.student_name || f.student || "Unknown"} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--gray-500)" }}>#{f.student_index || f.student_id}</span></div>
                        <div className="cb-flag-reason">{f.flags || f.reason}</div>
                        <div className="cb-flag-meta">{f.course_code || f.session} · {f.timestamp ? new Date(f.timestamp).toLocaleDateString() : ""}</div>
                        <div className="cb-flag-actions">
                            <button className="cb-flag-approve" onClick={() => handle(f.attendance_id, "approved")} style={{ display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Approve</button>
                            <button className="cb-flag-reject" onClick={() => handle(f.attendance_id, "rejected")} style={{ display: "flex", alignItems: "center", gap: 4 }}><X size={12} /> Reject</button>
                        </div>
                    </div>
                </div>
            ))}
            {resolved.length > 0 && (
                <div style={{ marginTop: 28 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Resolved</div>
                    {resolved.map(f => (
                        <div key={f.attendance_id} className="cb-flag-card" style={{ opacity: .55 }}>
                            <div className="cb-flag-icon" style={{ opacity: .6 }}><AlertCircle size={18} /></div>
                            <div><div className="cb-flag-name">{f.student_name || f.student}</div><div className="cb-flag-reason">{f.flags || f.reason}</div><span className={`cb-bdg ${f.status === "approved" ? "green" : "red"}`} style={{ marginTop: 6, display: "inline-flex" }}>{f.status}</span></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CoursesView({ toast, courses = [], onAdd }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div><h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.8px" }}>Courses</h2><p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 4 }}>{courses.length} courses</p></div>
                <button className="cb-btn-signup" style={{ padding: "10px 22px" }} onClick={onAdd}>+ Add Course</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
                {courses.map(c => (
                    <div key={c.course_id} className="cb-stat-card" style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>{c.code || c.course_code}</div>
                                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{c.department || c.dept || ""}</div>
                            </div>
                            <span className="cb-bdg blue">{c.enrolled_count || c.enrolled || 0} students</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{c.name || c.title}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="cb-filter-pill" style={{ flex: 1, padding: "8px", fontSize: 13 }} onClick={() => toast.add("Viewing " + (c.code || c.course_code), "success")}>View</button>
                            <button className="cb-filter-pill" style={{ flex: 1, padding: "8px", fontSize: 13 }} onClick={() => toast.add("Enrollments for " + (c.code || c.course_code), "success")}>Enrollments</button>
                            <button className="cb-filter-pill" style={{ padding: "8px", fontSize: 13, background: "#FEF2F2", color: "var(--red)", border: "1.5px solid rgba(207,48,74,.2)" }} onClick={async () => {
                                if (window.confirm(`Delete course ${c.code || c.course_code}?`)) {
                                    try {
                                        await axios.delete(`${API_BASE}/api/lecturer/courses/${c.course_id}`, { headers: getAuthHeaders() });
                                        toast.add("Course deleted", "success");
                                    } catch (e) {
                                        toast.add(e?.response?.data?.error || "Failed to delete course", "error");
                                    }
                                }
                            }}><LogOut size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NewSessionModal({ onClose, onSave, toast, courses = [] }) {
    const [form, setForm] = useState({ course: "", date: new Date().toISOString().split("T")[0], time: "09:00", duration: "90", radius: "100" });
    const [submitting, setSubmitting] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const submit = async () => {
        if (!form.course) { toast.add("Please select a course", "warn"); return; }
        const c = courses.find(x => (x.code || x.course_code) === form.course);
        if (!c) { toast.add("Course not found", "error"); return; }
        setSubmitting(true);
        try {
            let lat = 0, lon = 0;
            try {
                const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
            } catch (err) {
                toast.add("Could not get GPS location. Geofencing will be disabled.", "warn");
            }
            await axios.post(`${API_BASE}/api/lecturer/sessions`, {
                course_id: c.course_id,
                location_lat: lat,
                location_lon: lon,
                geofence_radius: parseInt(form.radius) || 100,
                session_minutes: parseInt(form.duration) || 90,
                qr_minutes: 20
            }, { headers: getAuthHeaders() });
            toast.add("Session started", "success");
            onSave();
        } catch (e) { toast.add(e?.response?.data?.error || "Failed to create session", "error"); }
        finally { setSubmitting(false); }
    };
    return (
        <div className="cb-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="cb-modal">
                <div className="cb-modal-hdr">
                    <div className="cb-modal-hdr-title">Create New Session</div>
                    <button className="cb-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="cb-modal-body">
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Course</label>
                        <select className="cb-form-select" value={form.course} onChange={e => set("course", e.target.value)}>
                            <option value="">Select a course…</option>
                            {courses.map(c => <option key={c.course_id} value={c.code || c.course_code}>{c.code || c.course_code} — {c.name || c.title}</option>)}
                        </select>
                    </div>
                    <div className="cb-form-grid">
                        <div className="cb-form-row"><label className="cb-form-lbl">Date</label><input className="cb-form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Start Time</label><input className="cb-form-input" type="time" value={form.time} onChange={e => set("time", e.target.value)} /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Duration (min)</label><input className="cb-form-input" type="number" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="90" /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Geofence Radius (m)</label><input className="cb-form-input" type="number" value={form.radius} onChange={e => set("radius", e.target.value)} placeholder="100" /></div>
                    </div>
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Location Preview</label>
                        <div className="cb-geo-preview">
                            <div className="cb-geo-ring" style={{ width: 120, height: 120 }} />
                            <div className="cb-geo-ring" style={{ width: 80, height: 80, animationDelay: ".5s" }} />
                            <div className="cb-geo-ring" style={{ width: 40, height: 40, animationDelay: "1s" }} />
                            <div className="cb-geo-dot" />
                            <div className="cb-geo-lbl">Radius: {form.radius} m · GPS locks on session start</div>
                        </div>
                    </div>
                    <div className="cb-form-actions">
                        <button className="cb-btn-signin" onClick={onClose}>Cancel</button>
                        <button className="cb-btn-signup" style={{ padding: "11px 24px", fontSize: 14, opacity: submitting ? .8 : 1 }} onClick={submit} disabled={submitting}>{submitting ? "Creating…" : "Create Session"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ────────── NEW COURSE MODAL ────────── */
function NewCourseModal({ onClose, onSave, toast }) {
    const [form, setForm] = useState({ course_code: "", title: "" });
    const [submitting, setSubmitting] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        if (!form.course_code || !form.title) { toast.add("All fields required", "warn"); return; }
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE}/api/lecturer/courses`, form, { headers: getAuthHeaders() });
            toast.add("Course created", "success");
            onSave();
        } catch (e) { toast.add(e?.response?.data?.error || "Failed to create course", "error"); }
        finally { setSubmitting(false); }
    };
    return (
        <div className="cb-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="cb-modal" style={{ maxWidth: 400 }}>
                <div className="cb-modal-hdr">
                    <div className="cb-modal-hdr-title">Add New Course</div>
                    <button className="cb-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={submit} className="cb-modal-body">
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Course Code</label>
                        <input className="cb-form-input" placeholder="CS401" value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Course Title</label>
                        <input className="cb-form-input" placeholder="Database Systems" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="cb-form-actions">
                        <button type="button" className="cb-btn-signin" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cb-btn-signup" disabled={submitting} style={{ opacity: submitting ? .7 : 1 }}>{submitting ? "Adding..." : "Add Course"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FullscreenQR({ val, title, onClose }) {
    return (
        <div className="cb-full-qr-overlay" onClick={onClose}>
            <button className="cb-full-qr-close" onClick={onClose}><X size={32} /></button>
            <div className="cb-full-qr-content" onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: 24, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Dynamic Check-in QR</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.8px", color: "var(--text)" }}>{title}</div>
                </div>
                <div style={{ background: "white", padding: 20, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <QRCodeSVG value={val} size={window.innerWidth < 600 ? 300 : 500} />
                </div>
                <div style={{ marginTop: 32, fontSize: 16, color: "var(--gray-500)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <RotateCcw size={18} className="spin-slow" /> Rotates every 30s
                </div>
            </div>
        </div>
    );
}


function SessionDetail({ toast, onShowQR }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("attendance");
    const [flags, setFlags] = useState([]);

    const fetchDetail = useCallback(async () => {
        try {
            const h = { headers: getAuthHeaders() };
            const [sessionRes, attendanceRes, flagsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/lecturer/sessions/${id}`, h),
                axios.get(`${API_BASE}/api/lecturer/sessions/${id}/attendance`, h),
                axios.get(`${API_BASE}/api/lecturer/sessions/${id}/flags`, h),
            ]);
            setSession(sessionRes.data?.session || sessionRes.data);
            setAttendance(attendanceRes.data?.attendance || (Array.isArray(attendanceRes.data) ? attendanceRes.data : []));
            setFlags(flagsRes.data?.flags || (Array.isArray(flagsRes.data) ? flagsRes.data : []));
        } catch (e) { toast.add("Failed to load session", "error"); navigate("/dashboard/sessions"); }
        finally { setLoading(false); }
    }, [id, navigate, toast]);

    useEffect(() => {
        fetchDetail();
        const timer = setInterval(fetchDetail, 10000);
        return () => clearInterval(timer);
    }, [fetchDetail]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this session? All attendance records will be lost.")) return;
        try {
            await axios.delete(`${API_BASE}/api/lecturer/sessions/${id}`, { headers: getAuthHeaders() });
            toast.add("Session deleted", "success");
            navigate("/dashboard/sessions");
        } catch (e) { toast.add("Failed to delete", "error"); }
    };

    if (loading && !session) return <div style={{ padding: 40, textAlign: "center" }}>Loading session…</div>;
    if (!session) return <div style={{ padding: 40, textAlign: "center" }}>Session not found</div>;

    const qrVal = session.status === "active" && session.qr_token ? `${window.location.origin}/#/student?token=${session.qr_token}` : null;

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <button className="cb-btn-signin" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={15} /> Back</button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.8px" }}>{session.course_code} — Session #{session.session_number || session.session_id}</h2>
                    <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 2 }}>{new Date(session.start_time).toLocaleDateString("en-GB")} · {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {Math.round((new Date(session.end_time) - new Date(session.start_time)) / 60000)} min</p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className={`cb-bdg ${session.status === "active" ? "green" : "gray"}`}>{session.status === "active" ? <><span className="cb-bdg-dot" />LIVE</> : "CLOSED"}</span>
                    <button className="cb-btn-signin" style={{ color: "var(--red)" }} onClick={handleDelete}><Trash2 size={16} /></button>
                    <button className="cb-btn-dark" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Download size={14} /> CSV</button>
                </div>
            </div>

            {qrVal && (
                <div
                    style={{ marginBottom: 32, padding: 24, background: "var(--gray-50)", borderRadius: 16, textAlign: "center", border: "1.5px solid var(--gray-100)", cursor: "zoom-in" }}
                    onClick={() => onShowQR({ val: qrVal, title: session.course_code })}
                >
                    <div style={{ display: "inline-block", background: "white", padding: 16, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 12 }}>
                        <QRCodeSVG value={qrVal} size={200} />
                    </div>
                    <div style={{ fontSize: 14, color: "var(--gray-600)", fontWeight: 500 }}>Tap to expand. Students scan to check-in.</div>
                </div>
            )}

            <div className="cb-tabs">
                {["attendance", "flagged", "analytics"].map(t => (
                    <button key={t} className={`cb-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {t === "flagged" && flags.filter(f => f.status === "pending").length > 0 && <span style={{ marginLeft: 6, background: "#D97706", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 6px" }}>{flags.filter(f => f.status === "pending").length}</span>}
                    </button>
                ))}
            </div>
            {tab === "attendance" && <AttendanceTable rows={attendance} session={session} />}
            {tab === "flagged" && <FlaggedView toast={toast} items={flags} onUpdate={fetchDetail} />}
            {tab === "analytics" && (
                <div className="cb-stats">
                    {[{ lbl: "Total Enrolled", val: session.total_students || attendance.length, color: "var(--blue)" }, { lbl: "Present", val: attendance.filter(a => a.status !== "absent").length, color: "var(--green)" }, { lbl: "Absent", val: attendance.filter(a => a.status === "absent").length, color: "var(--red)" }, { lbl: "Flagged", val: flags.length, color: "#D97706" }].map(s => (
                        <div key={s.lbl} className="cb-stat-card"><div className="cb-stat-lbl">{s.lbl}</div><div className="cb-stat-val" style={{ color: s.color, fontSize: 40 }}>{s.val}</div></div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AttendanceTable({ rows, session }) {
    const [search, setSearch] = useState("");
    const filtered = rows.filter(s => (s.full_name || "").toLowerCase().includes(search.toLowerCase()) || (s.student_index || "").toString().includes(search));
    return (
        <div className="cb-tbl-wrap">
            <div className="cb-tbl-top">
                <div className="cb-tbl-title">Attendance — {session?.course_code}</div>
                <div className="cb-tbl-filters">
                    <div className="cb-search-box">
                        <Search size={14} />
                        <input placeholder="Student ID or name…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <table className="cb-tbl">
                <thead><tr><th>Student ID</th><th>Name</th><th>Check-in</th><th>Status</th></tr></thead>
                <tbody>
                    {filtered.length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>No attendance records found.</td></tr>
                    )}
                    {filtered.map(s => (
                        <tr key={s.attendance_id} style={{ opacity: s.status === 'absent' ? 0.6 : 1 }}>
                            <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{s.student_index}</td>
                            <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                            <td style={{ fontVariantNumeric: "tabular-nums" }}>{s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td>
                                <span className={`cb-bdg ${s.status === 'valid' ? 'green' : s.status === 'flagged' ? 'yellow' : 'gray'}`}>
                                    {s.status.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ────────── SESSIONS VIEW ────────── */
function SessionsView({ toast, sessions, onOpen }) {
    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Attendance Sessions</h2>
            </div>
            <div className="cb-tbl-wrap">
                <table className="cb-tbl">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Session</th>
                            <th>Attendance</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(s => (
                            <tr key={s.session_id || s.id} style={{ cursor: "pointer" }} onClick={() => onOpen(s.session_id || s.id)}>
                                <td style={{ fontWeight: 600 }}>{s.course_code}</td>
                                <td>Session #{s.session_number || s.session_id}</td>
                                <td>{s.student_count || 0} students</td>
                                <td>{new Date(s.start_time).toLocaleDateString()}</td>
                                <td>
                                    <span className={`cb-bdg ${s.status === "active" ? "green" : "gray"}`}>
                                        {s.status === "active" ? "LIVE" : "CLOSED"}
                                    </span>
                                </td>
                                <td>
                                    <button className="cb-btn cb-btn-sec" style={{ padding: "6px 12px", fontSize: 12 }}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Dashboard({ toast }) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(() => localStorage.getItem("token") ? { token: localStorage.getItem("token") } : null);
    const [courses, setCourses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [flags, setFlags] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fullQR, setFullQR] = useState(null);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const h = { headers: getAuthHeaders() };
            const [c, s, f] = await Promise.all([
                axios.get(`${API_BASE}/api/lecturer/courses`, h).catch(() => ({ data: { courses: [] } })),
                axios.get(`${API_BASE}/api/lecturer/sessions`, h).catch(() => ({ data: { sessions: [] } })),
                axios.get(`${API_BASE}/api/lecturer/flags`, h).catch(() => ({ data: { flags: [] } })),
            ]);
            setCourses(c.data?.courses || (Array.isArray(c.data) ? c.data : []));
            setSessions(s.data?.sessions || (Array.isArray(s.data) ? s.data : []));
            setFlags(f.data?.flags || (Array.isArray(f.data) ? f.data : []));
            const active = (s.data?.sessions || []).find(x => x.status === "active");
            if (active) {
                axios.get(`${API_BASE}/api/lecturer/sessions/${active.session_id || active.id}/attendance`, h)
                    .then(r => setStudents(r.data?.attendance || []))
                    .catch(() => { });
            }
        } catch (e) { toast.add("Failed to load data", "error"); }
        finally { setLoading(false); }
    }, [user, toast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    if (!user) return <Navigate to="/login" />;

    const activeSession = sessions.find(s => s.status === 'active');

    return (
        <div className="app-container">
            <DashNav onLogout={() => { localStorage.removeItem("token"); setUser(null); navigate("/login"); }} />

            <div className="loc-bar">
                <div className="loc-tabs">
                    <button className="loc-tab active" onClick={() => navigate("/dashboard")}>Overview</button>
                    <button className="loc-tab dim">Reports</button>
                    <button className="loc-tab dim">Settings</button>
                </div>
                <div className="loc-actions">
                    <button className="loc-btn" onClick={() => setShowModal(true)}>+ New Session</button>
                </div>
            </div>

            <div className="main-wrapper">
                {/* LEFT COL */}
                <div className="left-col">
                    <div className="stat-card blue">
                        <div className="stat-lbl w">Total Students</div>
                        <div className="stat-val w">{students.length}</div>
                        <div className="stat-unit w">Attending currently</div>
                        <div className="bar-track w"><div className="bar-fill w" style={{ width: '65%' }} /></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-lbl">Active Courses</div>
                        <div className="stat-val">{courses.length}</div>
                        <div className="stat-unit">Total assigned</div>
                    </div>
                    <div className="stat-card">
                        <div className="insight-text">"High attendance observed in CS101 this week."</div>
                        <div className="insight-foot">
                            <span>AI Insight</span>
                            <TrendingUp size={14} color="var(--green)" />
                        </div>
                    </div>
                    <button className="new-sess-btn" onClick={() => setShowModal(true)}>+ New Session</button>
                </div>

                {/* CENTER COL */}
                <div className="center-col">
                    <div className="scene-wrap">
                        {/* Classroom visualization would go here */}
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                            <Users size={80} strokeWidth={1} color="var(--blue)" />
                            <p style={{ marginTop: 12, fontSize: 14 }}>Real-time Visualization</p>
                        </div>
                    </div>
                    {activeSession && (
                        <div className="live-badge">
                            <div className="live-dot" /> LIVE: {activeSession.course_name}
                        </div>
                    )}
                </div>

                {/* RIGHT COL */}
                <div className="right-col">
                    <div className="metric-card">
                        <div className="metric-top">
                            <div className="metric-name">Flags <span className="t-dn">+{flags.length}</span></div>
                        </div>
                        <div className="metric-val">{flags.length}</div>
                        <div className="metric-unit">Critical alerts</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-top">
                            <div className="metric-name">Sessions</div>
                        </div>
                        <div className="metric-val md">{sessions.length}</div>
                        <div className="metric-unit">Total this month</div>
                    </div>
                    <div className="metric-card" style={{ background: 'var(--blue-light)' }}>
                        <div className="metric-name" style={{ color: 'var(--blue)' }}>Quick Actions</div>
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button className="loc-btn" style={{ width: '100%' }} onClick={() => navigate("/dashboard/courses")}>View Courses</button>
                            <button className="loc-btn" style={{ width: '100%' }} onClick={() => navigate("/dashboard/flags")}>In Review</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-panel">
                <div className="bottom-title">Attendance History</div>
                <div className="dot-chart">
                    {Array.from({ length: 168 }).map((_, i) => (
                        <div key={i} className="dot" style={{ background: i % 10 === 0 ? 'var(--blue)' : 'var(--border2)', opacity: 0.3 + (Math.random() * 0.7) }} />
                    ))}
                </div>
            </div>

            {showModal && <NewSessionModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchAll(); }} toast={toast} courses={courses} />}
            <Routes>
                <Route path="/" element={<div style={{ padding: 24 }}><h2 style={{ fontSize: 24, fontWeight: 700 }}>Overview</h2><p style={{ color: "var(--t3)", marginTop: 8 }}>Welcome to your attendance dashboard.</p></div>} />
                <Route path="sessions" element={<SessionsView sessions={sessions} onOpen={(id) => navigate(`sessions/${id}`)} toast={toast} />} />
                <Route path="sessions/:id" element={<div className="sess-overlay"><SessionDetail toast={toast} onShowQR={setFullQR} /></div>} />
                <Route path="courses" element={<div className="sess-overlay"><CoursesView toast={toast} courses={courses} onAdd={() => navigate("/dashboard")} /></div>} />
                <Route path="flags" element={<div className="sess-overlay"><FlaggedView toast={toast} items={flags} onUpdate={fetchAll} /></div>} />
            </Routes>
            {fullQR && <FullscreenQR val={fullQR.val} title={fullQR.title} onClose={() => setFullQR(null)} />}
        </div>
    );
}

/* ────────── STUDENT SUBMIT ────────── */
function StudentPage() {
    const { search } = useLocation(); // for token
    const token = new URLSearchParams(search).get("token");
    const [step, setStep] = useState("loading");
    const [sessionData, setSessionData] = useState(null);
    const [form, setForm] = useState({ sid: "", name: "", error: "" });
    const [loading, setLoading] = useState(false);
    const [geo, setGeo] = useState({ lat: null, lon: null, acc: null, status: "acquiring" });
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setForm(f => ({ ...f, error: "No session token provided in URL." }));
            setStep("error");
            return;
        }

        // Fetch session info
        axios.get(`${API_BASE}/api/student/session-info?token=${token}`)
            .then(res => {
                setSessionData(res.data);
                setStep("form");
                // Start GPS acquisition
                navigator.geolocation.getCurrentPosition(
                    (pos) => setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy, status: "locked" }),
                    (err) => setGeo({ lat: null, lon: null, acc: null, status: "failed" }),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                );
            })
            .catch(err => {
                setForm(f => ({ ...f, error: err?.response?.data?.error || "Invalid or expired session link." }));
                setStep("error");
            });
    }, [token]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const submit = async () => {
        if (!form.sid || !form.name || !sessionData) return;
        setLoading(true);
        try {
            const payload = {
                student_id: form.sid,
                student_name: form.name,
                course_code: sessionData.course_code,
                latitude: geo.lat || 0,
                longitude: geo.lon || 0,
                accuracy: geo.acc || 999,
                qr_token: token,
                device: {
                    platform: navigator.platform,
                    screen: `${window.screen.width}x${window.screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                }
            };
            await axios.post(`${API_BASE}/api/student/submit`, payload);
            setStep("success");
        } catch (e) {
            setForm(f => ({ ...f, error: e?.response?.data?.error || "Submission failed. Check your QR code is still valid." }));
        }
        finally { setLoading(false); }
    };

    return (
        <div className="cb-submit-page">
            <div className="cb-submit-card">
                <div className="cb-submit-logo">
                    <div><img src="/logo.png" style={{ height: 52, width: 52, objectFit: "contain" }} /></div>
                    <div className="cb-submit-title">Acadience Check-in</div>
                    {sessionData && <div className="cb-submit-sub">{sessionData.course_code} — {sessionData.course_title}</div>}
                </div>

                {step === "loading" && (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <div className="cb-geo-ring" style={{ width: 40, height: 40, margin: "0 auto", position: "relative", animation: "geoP 1.5s infinite" }} />
                        <div style={{ marginTop: 20, color: "var(--gray-500)", fontSize: 14 }}>Loading session details...</div>
                    </div>
                )}

                {step === "error" && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ background: "#FEF2F2", color: "var(--red)", border: "1.5px solid rgba(207,48,74,.2)", borderRadius: 10, padding: "16px", fontSize: 14, marginBottom: 20 }}>
                            {form.error}
                        </div>
                        <button onClick={() => navigate("/")} className="cb-btn-signin" style={{ width: "100%", padding: 12 }}>Back to Home</button>
                    </div>
                )}

                {step === "form" && (
                    <div>
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Student ID</label>
                            <input className="cb-form-input" placeholder="e.g. 10001234" value={form.sid} onChange={e => set("sid", e.target.value)} />
                        </div>
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Full Name</label>
                            <input className="cb-form-input" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
                        </div>
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Status</label>
                            <div style={{ background: "#F9FAFB", padding: "12px", borderRadius: 10, border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: 10 }}>
                                {geo.status === "acquiring" ? (
                                    <><div style={{ width: 14, height: 14, border: "2px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 14, color: "var(--gray-500)" }}>Acquiring GPS location...</span></>
                                ) : geo.status === "locked" ? (
                                    <><Check size={16} color="var(--green)" /><span style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}>GPS Locked (Acc: {Math.round(geo.acc)}m)</span></>
                                ) : (
                                    <><AlertCircle size={16} color="var(--red)" /><span style={{ fontSize: 13, color: "var(--red)", fontWeight: 500 }}>GPS Failed. Please allow Location access.</span></>
                                )}
                            </div>
                        </div>

                        {form.error && <div style={{ background: "#FEF2F2", color: "var(--red)", border: "1.5px solid rgba(207,48,74,.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{form.error}</div>}
                        <button className="cb-btn-signup" style={{ width: "100%", padding: 14, fontSize: 15, borderRadius: 100, opacity: loading ? .75 : 1 }} onClick={submit} disabled={loading || geo.status === "acquiring"}>
                            {loading ? "Submitting…" : "Record Attendance"}
                        </button>
                    </div>
                )}

                {step === "success" && (
                    <div className="cb-submit-success">
                        <div className="cb-submit-success-icon"><Check size={28} strokeWidth={3} /></div>
                        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>Attendance Recorded!</div>
                        <p style={{ fontSize: 14, color: "var(--gray-500)", textAlign: "center", lineHeight: 1.6 }}>Your attendance for <strong>{sessionData?.course_code}</strong> is verified.</p>
                        <div className="cb-receipt">
                            {[["Student ID", form.sid], ["Name", form.name], ["Time", new Date().toLocaleTimeString()], ["Status", "Verified <Check size={13}/>"]].map(([k, v]) => (
                                <div key={k} className="cb-receipt-row"><span className="cb-receipt-k">{k}</span><span className="cb-receipt-v" style={k === "Status" ? { color: "var(--green)" } : {}}>{v}</span></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ────────── AUTH PAGE (Login/Signup) ────────── */
function AuthPage({ initialMode = "login", onAuth, toast }) {
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", name: "", confirm: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "signup") {
                if (form.password !== form.confirm) throw new Error("Passwords do not match");
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
        } catch (err) {
            toast.add(err.response?.data?.error || err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cb-submit-page" style={{ minHeight: "100vh", padding: "80px 20px" }}>
            <div className="cb-submit-card" style={{ maxWidth: 400, margin: "0 auto" }}>
                <div className="cb-submit-logo">
                    <div><img src="/logo.png" style={{ height: 52, width: 52, objectFit: "contain" }} /></div>
                    <div className="cb-submit-title">Lecturer {mode === "login" ? "Sign In" : "Sign Up"}</div>
                    <div className="cb-submit-sub">{mode === "login" ? "Access your attendance dashboard" : "Create an account to manage your sessions"}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Full Name</label>
                            <input className="cb-form-input" placeholder="Dr. Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                    )}
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Email Address</label>
                        <input className="cb-form-input" type="email" placeholder="lecturer@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Password</label>
                        <input className="cb-form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    {mode === "signup" && (
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Confirm Password</label>
                            <input className="cb-form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                        </div>
                    )}
                    <button type="submit" className="cb-btn-signup" style={{ width: "100%", padding: 14, fontSize: 15, borderRadius: 100, marginTop: 10 }} disabled={loading}>
                        {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
                    </button>
                </form>
                <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--gray-500)" }}>
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"} {" "}
                    <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ────────── DOCS PAGE ────────── */
function DocsPage() {
    const [activeSection, setActiveSection] = useState("quickstart");

    const sections = [
        { id: "quickstart", title: "Quickstart" },
        { id: "geofencing", title: "Geofencing" },
        { id: "qr", title: "Dynamic QR Codes" },
        { id: "devices", title: "Device Fingerprinting" },
        { id: "privacy", title: "Student Privacy" }
    ];

    const content = {
        quickstart: (
            <div>
                <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>Quickstart Guide</h1>
                <p style={{ fontSize: 16, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 32 }}>Get up and running with Acadience Attendance in three easy steps.</p>

                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Add your courses</h3>
                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>Once you sign in, go to the <strong>Courses</strong> tab and click "+ Add Course". You only need to provide the course code (e.g., CS401) and the title.</p>

                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Start a live session</h3>
                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>From the Dashboard or Sessions tab, click "+ New Session". Select a course, set the duration, and define your geofence radius. Acadience will automatically capture your current GPS location to center the geofence.</p>

                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Display the QR code</h3>
                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>Project the generated QR code on the big screen. Students scan it with their default camera app — no app downloads required. The QR code rotates every 30 seconds to prevent proxy attendance via shared screenshots.</p>
            </div>
        ),
        geofencing: (
            <div>
                <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>Geofencing</h1>
                <p style={{ fontSize: 16, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 32 }}>How Acadience uses GPS to ensure physical presence.</p>

                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>We use the Haversine formula to calculate the exact great-circle distance between the student's device and the location where the session was created.</p>

                <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 12, border: "1px solid var(--gray-200)", marginBottom: 24 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Configuration</h4>
                    <p style={{ fontSize: 14, color: "var(--gray-500)" }}>When creating a session, you set a radius (default is 100 meters). We recommend 100-150m for large lecture halls to account for GPS drift and indoor signal degradation.</p>
                </div>

                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>If a student submits attendance from outside the radius, their submission goes through but is marked as <strong>Flagged</strong>. You can review flagged submissions in the Dashboard to manually approve or reject them.</p>
            </div>
        ),
        qr: (
            <div>
                <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>Dynamic QR Codes</h1>
                <p style={{ fontSize: 16, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 32 }}>Preventing proxy check-ins.</p>

                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>Static QR codes are easy to compromise — a student can simply take a photo and send it to their friends in the dorm. Acadience solves this with rotating cryptographic tokens.</p>

                <ul style={{ paddingLeft: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12, color: "var(--gray-600)" }}>
                    <li>The QR code changes every 30 seconds.</li>
                    <li>Each code encodes a unique, HMAC-signed JSON Web Token (JWT).</li>
                    <li>The token includes a timestamp and a strict expiration window.</li>
                    <li>If a student scans a photo sent by a friend 2 minutes ago, the server rejects the token as expired.</li>
                </ul>
            </div>
        ),
        devices: (
            <div>
                <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>Device Fingerprinting</h1>
                <p style={{ fontSize: 16, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 32 }}>One device = One submission.</p>

                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>To prevent a single student from bringing five phones to class and submitting for their friends, Acadience employs lightweight device fingerprinting.</p>
                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>We hash a combination of the device's screen resolution, color depth, timezone, and User-Agent string. While not completely identifying, it is sufficient to alert the system when the exact same obscure device profile submits multiple times in the same session.</p>
            </div>
        ),
        privacy: (
            <div>
                <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>Student Privacy</h1>
                <p style={{ fontSize: 16, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 32 }}>Built with FERPA/GDPR compliance in mind.</p>

                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>No accounts required</h3>
                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>Students do not create accounts, set passwords, or provide persistent email addresses. They simply enter their Student ID and Name per session.</p>

                <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Location Data</h3>
                <p style={{ marginBottom: 16, lineHeight: 1.6, color: "var(--gray-600)" }}>We only request GPS permission at the exact moment of check-in. The browser handles the prompt, and we immediately discard the data after calculating the distance to the lecture hall. We do not track student movement over time.</p>
            </div>
        )
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <nav className="cb-nav" style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <div className="cb-nav-inner" style={{ justifyContent: "space-between" }}>
                    <Link to="/" className="cb-logo">
                        <img src="/logo.png" style={{ height: 32, width: 32, objectFit: "contain" }} />
                        <span className="cb-logo-text">Acadience</span>
                    </Link>
                    <Link to="/" className="cb-nav-btn">Back to Home</Link>
                </div>
            </nav>

            <div style={{ display: "flex", flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 20px", gap: 60, flexDirection: window.innerWidth <= 768 ? "column" : "row" }}>
                <div style={{ width: window.innerWidth <= 768 ? "100%" : 240, flexShrink: 0 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20 }}>Documentation</h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        {sections.map(s => (
                            <li key={s.id}>
                                <button
                                    onClick={() => setActiveSection(s.id)}
                                    style={{
                                        width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none",
                                        background: activeSection === s.id ? "var(--gray-50)" : "transparent",
                                        color: activeSection === s.id ? "var(--blue)" : "var(--gray-600)",
                                        fontSize: 15, fontWeight: activeSection === s.id ? 600 : 500, cursor: "pointer", transition: "all .1s"
                                    }}
                                >
                                    {s.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ flex: 1, maxWidth: 680 }}>
                    {content[activeSection]}
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const toast = useToast();
    return (
        <>
            <style>{CSS}</style>
            <Routes>
                <Route path="/" element={<><Nav /><HomePage toast={toast} /></>} />
                <Route path="/login" element={<AuthPage initialMode="login" toast={toast} onAuth={() => window.location.hash = "/dashboard"} />} />
                <Route path="/signup" element={<AuthPage initialMode="signup" toast={toast} onAuth={() => window.location.hash = "/dashboard"} />} />
                <Route path="/dashboard/*" element={<Dashboard toast={toast} />} />
                <Route path="/sessions/*" element={<Navigate to="/dashboard/sessions" replace />} />
                <Route path="/courses/*" element={<Navigate to="/dashboard/courses" replace />} />
                <Route path="/flags/*" element={<Navigate to="/dashboard/flags" replace />} />
                <Route path="/student" element={<StudentPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toasts ts={toast.ts} />
        </>
    );
}
