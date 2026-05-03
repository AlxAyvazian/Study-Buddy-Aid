import { useState, useEffect } from "react";
import {
  Heart, BookOpen, ExternalLink, ChevronDown, ChevronUp,
  Accessibility, GraduationCap, Gift, Search, Tag, Star,
  Plus, Trash2, Edit3, Check, X, Loader2, Shield
} from "lucide-react";

type Resource = { name: string; description: string; url: string; tags: string[] };
type ResourceCategory = { category: string; items: Resource[] };
type School = { name: string; state: string; disabilityOffice: string; accommodations: string[]; exemptions: string; knownFor: string; contact: string; tier: string };
type Accommodation = { id: number; type: string; label: string; approvedBy: string | null; approvedDate: string | null; expiresDate: string | null; notes: string | null; appliedTo: string[] };

const TIER_COLORS: Record<string, string> = {
  "Top 5": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "Top 10": "text-violet-400 bg-violet-400/10 border-violet-400/30",
  "Top 20": "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "Top 30": "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const CAT_ICONS: Record<string, typeof Heart> = {
  "MCAT Accommodations": BookOpen,
  "Study Tools (Free)": Gift,
  "Financial & Support Programs": Heart,
  "Disability Offices & Advocacy": Accessibility,
};

const ACCOMMODATION_TYPES = [
  { value: "mcat", label: "MCAT" },
  { value: "coursework", label: "Coursework" },
  { value: "clinical", label: "Clinical / Clerkship" },
  { value: "licensing", label: "USMLE / Licensing" },
  { value: "housing", label: "Housing" },
  { value: "other", label: "Other" },
];

const DISABILITY_TOOLS = [
  { label: "Extended MCAT Time", description: "AAMC grants 50% or 100% extended time for ADHD, learning disabilities, and physical conditions. Apply early — processing takes 60+ days.", icon: "⏱️" },
  { label: "Separate Testing Room", description: "Reduces sensory overload and distraction. Available through AAMC for ADHD and anxiety disorders.", icon: "🏠" },
  { label: "Screen Reader / Text-to-Speech", description: "AAMC supports JAWS and other screen readers for visual impairments and reading disabilities.", icon: "🔊" },
  { label: "Extra Break Time", description: "Additional or longer breaks between MCAT sections available for students with chronic conditions or fatigue disorders.", icon: "☕" },
  { label: "Note-Taking Assistance", description: "Most disability offices provide peer note-takers or smartpen access for lectures and study sessions.", icon: "📝" },
  { label: "Dyscalculia Math Support", description: "Formula sheets, visual breakdowns, and calculator accommodations may be available for the MCAT and coursework.", icon: "🧮" },
  { label: "USMLE Testing Accommodations", description: "The NBME also grants accommodations for licensing exams. Accommodation letters from your medical school carry weight.", icon: "📋" },
  { label: "Flexible Scheduling", description: "Some medical schools allow modified clerkship scheduling for chronic illness or fluctuating conditions.", icon: "📅" },
];

const EMPTY_FORM = { type: "mcat", label: "", approvedBy: "", approvedDate: "", expiresDate: "", notes: "", appliedTo: "" };

export default function DisabilityPage() {
  const [resources, setResources] = useState<ResourceCategory[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tools" | "resources" | "schools" | "tracker">("tools");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/disability/resources").then(r => r.json()),
      fetch("/api/disability/schools").then(r => r.json()),
      fetch("/api/accommodations").then(r => r.json()),
    ]).then(([res, sch, acc]) => {
      setResources(res); setSchools(sch); setAccommodations(acc); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveAccommodation = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    const body = {
      ...form,
      approvedBy: form.approvedBy || null,
      approvedDate: form.approvedDate || null,
      expiresDate: form.expiresDate || null,
      notes: form.notes || null,
      appliedTo: form.appliedTo ? form.appliedTo.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editingId) {
        const r = await fetch(`/api/accommodations/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await r.json();
        setAccommodations(prev => prev.map(a => a.id === editingId ? data : a));
        setEditingId(null);
      } else {
        const r = await fetch("/api/accommodations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await r.json();
        setAccommodations(prev => [...prev, data]);
      }
      setForm(EMPTY_FORM); setShowForm(false);
    } catch {} finally { setSaving(false); }
  };

  const deleteAccommodation = async (id: number) => {
    await fetch(`/api/accommodations/${id}`, { method: "DELETE" });
    setAccommodations(prev => prev.filter(a => a.id !== id));
  };

  const startEdit = (acc: Accommodation) => {
    setForm({ type: acc.type, label: acc.label, approvedBy: acc.approvedBy ?? "", approvedDate: acc.approvedDate ?? "", expiresDate: acc.expiresDate ?? "", notes: acc.notes ?? "", appliedTo: acc.appliedTo.join(", ") });
    setEditingId(acc.id); setShowForm(true);
  };

  const filteredResources = resources.map(cat => ({ ...cat, items: cat.items.filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) })).filter(cat => cat.items.length > 0);
  const filteredSchools = schools.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.state.toLowerCase().includes(search.toLowerCase()) || s.accommodations.some(a => a.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Accessibility className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold">Disability Support Hub</h1>
            <p className="text-muted-foreground mt-1">Accommodations, free tools, tracker, and schools that support you.</p>
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-sm text-foreground leading-relaxed">
          <strong>You belong in medicine.</strong> Having ADHD, dyscalculia, a learning disability, chronic illness, or any other condition does not disqualify you from medical school. The ADA and Section 504 protect your right to reasonable accommodations throughout pre-med, the MCAT, medical school, and residency.
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools, resources, schools, accommodations…" className="w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-sm" />
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1 flex-wrap">
        {([
          { key: "tools", label: "Accommodations", icon: Accessibility },
          { key: "resources", label: "Free Resources", icon: Gift },
          { key: "schools", label: "School Guide", icon: GraduationCap },
          { key: "tracker", label: `My Tracker (${accommodations.length})`, icon: Shield },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Accommodations tab */}
      {tab === "tools" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">These accommodations are available through AAMC, your college disability office, and medical schools. Document your disability early to access all of them.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {DISABILITY_TOOLS.filter(t => !search || t.label.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())).map(tool => (
              <div key={tool.label} className="bg-card rounded-2xl border p-5 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3"><span className="text-2xl">{tool.icon}</span><div className="font-semibold text-sm">{tool.label}</div></div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl border p-6 space-y-4 mt-2">
            <div className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> How to Request MCAT Accommodations</div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {["Register at aamc.org and create an account before applying for accommodations.", "Gather documentation: a licensed clinician's evaluation (psychologist, MD, etc.) within the last 5 years for ADHD/LD, or current for physical/medical conditions.", "Complete the AAMC Accommodation Request Form in your account under 'Testing Accommodations'.", "Submit at least 60–90 days before your desired test date — processing takes up to 60 days.", "If denied, you can appeal with additional documentation. A disability advocate or your campus disability office can help.", "Once approved, accommodations are on file and apply to all future MCAT attempts."].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Resources tab */}
      {tab === "resources" && (
        <div className="space-y-4">
          {loading ? <div className="py-16 text-center text-muted-foreground">Loading resources…</div> : (
            filteredResources.map(cat => {
              const Icon = CAT_ICONS[cat.category] ?? Heart;
              const isCollapsed = collapsed[cat.category];
              return (
                <div key={cat.category} className="bg-card rounded-2xl border overflow-hidden">
                  <button onClick={() => setCollapsed(prev => ({ ...prev, [cat.category]: !prev[cat.category] }))} className="w-full flex items-center justify-between p-5 hover:bg-accent/20 transition-colors">
                    <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-primary" /><span className="font-semibold">{cat.category}</span><span className="text-xs text-muted-foreground">{cat.items.length} resources</span></div>
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {!isCollapsed && (
                    <div className="divide-y divide-border">
                      {cat.items.map(item => (
                        <div key={item.name} className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium" onClick={e => e.stopPropagation()}>
                              Visit <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map(tag => <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"><Tag className="w-2.5 h-2.5" />{tag}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Schools tab */}
      {tab === "schools" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Schools known for strong disability support and accessible technical standards.</p>
          {loading ? <div className="py-16 text-center text-muted-foreground">Loading…</div> : (
            filteredSchools.map(school => {
              const isExpanded = expandedSchool === school.name;
              const tierClass = TIER_COLORS[school.tier] ?? "text-muted-foreground bg-muted border-border";
              return (
                <div key={school.name} className="bg-card rounded-2xl border overflow-hidden">
                  <button onClick={() => setExpandedSchool(isExpanded ? null : school.name)} className="w-full flex items-start justify-between gap-4 p-5 hover:bg-accent/20 transition-colors text-left">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base">{school.name}</span>
                        <span className="text-xs text-muted-foreground">· {school.state}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tierClass}`}>{school.tier}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{school.knownFor}</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="h-px bg-border" />
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1"><div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disability Office</div><div className="text-sm">{school.disabilityOffice}</div></div>
                        <div className="space-y-1"><div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exemptions / Modifications</div><div className="text-sm text-muted-foreground">{school.exemptions}</div></div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Available Accommodations</div>
                        <div className="flex flex-wrap gap-2">{school.accommodations.map(a => <span key={a} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{a}</span>)}</div>
                      </div>
                      <a href={school.contact} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Visit Disability Office <ExternalLink className="w-3.5 h-3.5" /></a>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-sm space-y-2">
            <div className="font-semibold text-amber-400">Important note on technical standards</div>
            <p className="text-muted-foreground leading-relaxed">Under the ADA, schools must assess whether <em>reasonable accommodations</em> can allow a student to meet technical standards. You do not need to disclose your disability during the application process. Once accepted, contact the school's disability office to discuss accommodations before orientation.</p>
          </div>
        </div>
      )}

      {/* Accommodation Tracker tab */}
      {tab === "tracker" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Log your approved accommodations, expiration dates, and where you've applied them.</p>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-card rounded-2xl border p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="font-semibold">{editingId ? "Edit" : "Add"} Accommodation</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
                    {ACCOMMODATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Accommodation *</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. 50% extended time, separate testing room" className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Approved by</label>
                  <input value={form.approvedBy} onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} placeholder="AAMC, disability office, etc." className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date approved</label>
                  <input type="date" value={form.approvedDate} onChange={e => setForm(f => ({ ...f, approvedDate: e.target.value }))} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Expiration date</label>
                  <input type="date" value={form.expiresDate} onChange={e => setForm(f => ({ ...f, expiresDate: e.target.value }))} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Applied to (comma-separated)</label>
                  <input value={form.appliedTo} onChange={e => setForm(f => ({ ...f, appliedTo: e.target.value }))} placeholder="MCAT Jan 2025, Harvard SOM" className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any extra details…" className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }} className="flex-1 py-2.5 rounded-xl border text-muted-foreground hover:bg-accent text-sm"><X className="w-4 h-4 inline mr-1" />Cancel</button>
                <button onClick={saveAccommodation} disabled={saving || !form.label.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {accommodations.length === 0 && !showForm ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <Shield className="w-10 h-10 mx-auto opacity-20" />
              <p>No accommodations logged yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accommodations.map(acc => {
                const typeLabel = ACCOMMODATION_TYPES.find(t => t.value === acc.type)?.label ?? acc.type;
                const isExpiring = acc.expiresDate && new Date(acc.expiresDate) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                return (
                  <div key={acc.id} className="bg-card rounded-2xl border p-5 group space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{acc.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{typeLabel}</span>
                          {isExpiring && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">Expiring soon</span>}
                        </div>
                        {acc.approvedBy && <div className="text-xs text-muted-foreground">Approved by: {acc.approvedBy}{acc.approvedDate ? ` on ${acc.approvedDate}` : ""}</div>}
                        {acc.expiresDate && <div className="text-xs text-muted-foreground">Expires: {acc.expiresDate}</div>}
                        {acc.appliedTo.length > 0 && <div className="flex flex-wrap gap-1.5 mt-1">{acc.appliedTo.map(a => <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a}</span>)}</div>}
                        {acc.notes && <p className="text-xs text-muted-foreground mt-1">{acc.notes}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(acc)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => deleteAccommodation(acc.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
