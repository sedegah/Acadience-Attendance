
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Update CoursesView
src = src.replace('function CoursesView({ toast, courses = [] }) {', 'function CoursesView({ toast, courses = [], onAdd }) {')
src = src.replace('onClick={() => toast.add("Course form coming soon", "warn")}>+ Add Course</button>', 'onClick={onAdd}>+ Add Course</button>')

# 2. Insert NewCourseModal
new_course_modal_code = """
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
"""
if 'function SessionDetail' in src:
    src = src.replace('function SessionDetail', new_course_modal_code + '\nfunction SessionDetail')
else:
    src = src.replace('export default function App()', new_course_modal_code + '\nexport default function App()')

# 3. Update Dashboard
src = src.replace('const [showModal, setShowModal] = useState(false);', 'const [showModal, setShowModal] = useState(false);\n    const [showCourseModal, setShowCourseModal] = useState(false);')
src = src.replace('if (tab === "Courses") return <CoursesView toast={toast} courses={courses} />;', 'if (tab === "Courses") return <CoursesView toast={toast} courses={courses} onAdd={() => setShowCourseModal(true)} />;')

# Add modal to Dashboard return
old_modal_render = '{showModal && <NewSessionModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchAll(); }} toast={toast} courses={courses} />}'
new_modal_render = old_modal_render + '\n            {showCourseModal && <NewCourseModal onClose={() => setShowCourseModal(false)} onSave={() => { setShowCourseModal(false); fetchAll(); }} toast={toast} />}'
src = src.replace(old_modal_render, new_modal_render)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

print("Course creation feature added.")
