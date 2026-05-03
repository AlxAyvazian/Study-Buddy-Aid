import { useState, useEffect } from "react";
import {
  Briefcase, Plus, Trash2, Edit3, Check, X, Clock,
  FlaskConical, Heart, Trophy, Users, BookOpen, Loader2
} from "lucide-react";

type Entry = {
  id: number;
  type: string;
  title: string;
  organization: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  hours: number | null;
  contact: string | null;
};

const TYPES = [
  { value: "work", label: "Work Experience", icon: Briefcase, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "volunteer", label: "Volunteering", icon: Heart, color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  { value: "research", label: "Research", icon: FlaskConical, color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  { value: "shadowing", label: "Shadowing", icon: Users, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { value: "leadership", label: "Leadership", icon: Trophy, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "coursework", label: "Coursework", icon: BookOpen, color: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  { value: "award", label: "Award / Honor", icon: Trophy, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { value: "other", label: "Other", icon: Clock, color: "text-muted-foreground bg-muted/40 border-border" },
];

const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.value, t]));

const EMPTY_FORM = {
  type: "work", title: "", organization: "", location: "",
  startDate: "", endDate: "", current: false,
  description: "", hours: "", contact: "",
};

function EntryForm({ initial, onSave, onCancel, saving }: {
  initial: typeof EMPTY_FORM;
  onSave: (data: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-card rounded-2xl border p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("type", t.value)}
                className={`text-xs py-2 px-2 rounded-lg border transition-all text-center ${form.type === t.value ? t.color + " font-semibold" : "border-border text-muted-foreground hover:bg-accent"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title / Role *</label>
          <input value={form.title} onChange={e => set("title", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="e.g. Research Assistant" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Organization *</label>
          <input value={form.organization} onChange={e => set("organization", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="e.g. Johns Hopkins Lab" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
          <input value={form.location} onChange={e => set("location", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="City, State" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hours</label>
          <input type="number" value={form.hours} onChange={e => set("hours", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="Total hours" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date *</label>
          <input type="month" value={form.startDate} onChange={e => set("startDate", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label>
          <input type="month" value={form.endDate} onChange={e => set("endDate", e.target.value)} disabled={form.current} className="w-full rounded-xl border bg-background px-3 py-2 text-sm disabled:opacity-40" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="current" checked={form.current} onChange={e => set("current", e.target.checked)} className="rounded" />
          <label htmlFor="current" className="text-sm text-muted-foreground">Currently ongoing</label>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="What did you do? What did you learn? What impact did you have?" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact person (for LOR)</label>
          <input value={form.contact} onChange={e => set("contact", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="Name, email, or phone" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border text-muted-foreground hover:bg-accent transition-colors text-sm">Cancel</button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim() || !form.organization.trim() || !form.startDate}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

export default function CareerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/career").then(r => r.json()).then(d => { setEntries(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const saveNew = async (form: typeof EMPTY_FORM) => {
    setSaving(true);
    try {
      const r = await fetch("/api/career", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hours: form.hours ? Number(form.hours) : null, current: Boolean(form.current) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEntries(prev => [...prev, data]);
      setShowForm(false);
    } catch { } finally { setSaving(false); }
  };

  const saveEdit = async (id: number, form: typeof EMPTY_FORM) => {
    setSaving(true);
    try {
      const r = await fetch(`/api/career/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hours: form.hours ? Number(form.hours) : null, current: Boolean(form.current) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEntries(prev => prev.map(e => e.id === id ? data : e));
      setEditingId(null);
    } catch { } finally { setSaving(false); }
  };

  const deleteEntry = async (id: number) => {
    await fetch(`/api/career/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const totalHours = entries.reduce((sum, e) => sum + (e.hours ?? 0), 0);
  const byType = TYPES.map(t => ({ ...t, count: entries.filter(e => e.type === t.value).length }));

  const grouped = TYPES.map(t => ({
    ...t,
    items: entries.filter(e => e.type === t.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold">Career History</h1>
          <p className="text-muted-foreground mt-1">Track all your experiences, hours, and contacts for your application.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-2xl p-4 space-y-1">
          <div className="text-xs text-muted-foreground">Total Entries</div>
          <div className="text-3xl font-bold font-serif text-primary">{entries.length}</div>
        </div>
        <div className="bg-card border rounded-2xl p-4 space-y-1">
          <div className="text-xs text-muted-foreground">Total Hours</div>
          <div className="text-3xl font-bold font-serif">{totalHours.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-2xl p-4 space-y-1">
          <div className="text-xs text-muted-foreground">Clinical Hours</div>
          <div className="text-3xl font-bold font-serif">
            {entries.filter(e => ["volunteer", "shadowing"].includes(e.type)).reduce((s, e) => s + (e.hours ?? 0), 0)}
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-4 space-y-1">
          <div className="text-xs text-muted-foreground">Research Hours</div>
          <div className="text-3xl font-bold font-serif">
            {entries.filter(e => e.type === "research").reduce((s, e) => s + (e.hours ?? 0), 0)}
          </div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="flex flex-wrap gap-2">
        {byType.filter(t => t.count > 0).map(t => {
          const Icon = t.icon;
          return (
            <span key={t.value} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${t.color}`}>
              <Icon className="w-3 h-3" /> {t.label} ({t.count})
            </span>
          );
        })}
      </div>

      {/* Add form */}
      {showForm && !editingId && (
        <EntryForm
          initial={EMPTY_FORM}
          onSave={saveNew}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && !showForm && (
        <div className="text-center py-20 text-muted-foreground space-y-3">
          <Briefcase className="w-12 h-12 mx-auto opacity-20" />
          <p>No entries yet. Add your first experience above.</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      )}

      {/* Grouped entries */}
      {grouped.map(group => {
        const Icon = group.icon;
        return (
          <div key={group.value} className="space-y-3">
            <div className={`flex items-center gap-2 text-sm font-semibold px-1`}>
              <Icon className="w-4 h-4" />
              <span>{group.label}</span>
              <span className="text-muted-foreground font-normal">({group.items.length})</span>
            </div>
            {group.items.map(entry => (
              editingId === entry.id ? (
                <EntryForm
                  key={entry.id}
                  initial={{
                    type: entry.type, title: entry.title, organization: entry.organization,
                    location: entry.location ?? "", startDate: entry.startDate,
                    endDate: entry.endDate ?? "", current: entry.current,
                    description: entry.description ?? "", hours: entry.hours?.toString() ?? "",
                    contact: entry.contact ?? "",
                  }}
                  onSave={(form) => saveEdit(entry.id, form)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div key={entry.id} className="bg-card border rounded-2xl p-5 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{entry.title}</span>
                        {entry.current && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Current</span>}
                        {entry.hours && <span className="text-xs text-muted-foreground">{entry.hours.toLocaleString()} hrs</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.organization}{entry.location ? ` · ${entry.location}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.startDate} → {entry.current ? "Present" : (entry.endDate ?? "?")}
                      </div>
                      {entry.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{entry.description}</p>}
                      {entry.contact && <p className="text-xs text-muted-foreground mt-1">Contact: {entry.contact}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(entry.id); setShowForm(false); }} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        );
      })}
    </div>
  );
}
