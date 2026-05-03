import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, Circle, UploadCloud, FileText, Trash2,
  Sparkles, FolderOpen, ChevronDown, ChevronUp, Loader2, X,
  School, CheckCheck, AlertCircle
} from "lucide-react";

type CheckItem = {
  id: number;
  category: string;
  label: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  sortOrder: number;
};

type Doc = {
  id: number;
  name: string;
  category: string;
  wordCount: number;
  uploadedAt: string;
  preview: string;
};

const CATEGORIES = ["general", "prerequisites", "experience", "letters", "application", "exam"];

const CATEGORY_COLORS: Record<string, string> = {
  Prerequisites: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Exam: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Experience: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Application: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const SCHOOL_COMPARISONS = [
  { name: "Harvard Medical School", mcat: "521+", gpa: "3.9+", research: "Required", clinical: "Required", special: "Strong research focus", url: "https://hms.harvard.edu" },
  { name: "Johns Hopkins SOM", mcat: "521+", gpa: "3.9+", research: "Strongly preferred", clinical: "Required", special: "Global health opportunities", url: "https://www.hopkinsmedicine.org/som" },
  { name: "NYU Grossman SOM", mcat: "520+", gpa: "3.9+", research: "Preferred", clinical: "Required", special: "Full scholarship for all students", url: "https://med.nyu.edu" },
  { name: "UCSF SOM", mcat: "517+", gpa: "3.8+", research: "Strongly preferred", clinical: "Required", special: "Progressive disability policy", url: "https://meded.ucsf.edu" },
  { name: "Mayo Clinic Alix SOM", mcat: "518+", gpa: "3.8+", research: "Required", clinical: "Required", special: "Small cohort, personalized care", url: "https://www.mayo.edu/mayo-clinic-alix-school-of-medicine" },
  { name: "University of Michigan", mcat: "516+", gpa: "3.7+", research: "Preferred", clinical: "Required", special: "Strong disability office", url: "https://medicine.umich.edu" },
  { name: "Perelman (Penn)", mcat: "521+", gpa: "3.9+", research: "Required", clinical: "Required", special: "Active disability advocacy group", url: "https://www.med.upenn.edu" },
  { name: "University of Colorado", mcat: "511+", gpa: "3.6+", research: "Preferred", clinical: "Required", special: "Inclusive technical standards", url: "https://medschool.cuanschutz.edu" },
];

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export default function PreMedPage() {
  const [tab, setTab] = useState<"checklist" | "docs" | "schools">("checklist");
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analyzingDocId, setAnalyzingDocId] = useState<number | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [pasteName, setPasteName] = useState("");
  const [pasteCategory, setPasteCategory] = useState("general");
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [viewingDoc, setViewingDoc] = useState<(Doc & { content?: string }) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/premed/checklist")
      .then(r => r.json())
      .then(data => { setChecklist(data); setLoadingChecklist(false); })
      .catch(() => setLoadingChecklist(false));
    fetch("/api/premed/docs")
      .then(r => r.json())
      .then(data => { setDocs(data); setLoadingDocs(false); })
      .catch(() => setLoadingDocs(false));
  }, []);

  const toggleItem = async (item: CheckItem) => {
    const next = !item.completed;
    setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, completed: next } : i));
    await fetch(`/api/premed/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next }),
    });
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("category", "general");
    try {
      const r = await fetch("/api/premed/docs/upload", { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setDocs(prev => [...prev, data]);
      setTab("docs");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitPaste = async () => {
    if (!pasteText.trim()) return;
    setUploading(true);
    setUploadError(null);
    try {
      const r = await fetch("/api/premed/docs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText, name: pasteName || "Pasted document", category: pasteCategory }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setDocs(prev => [...prev, data]);
      setPasteText(""); setPasteName(""); setShowPasteForm(false);
      setTab("docs");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id: number) => {
    await fetch(`/api/premed/docs/${id}`, { method: "DELETE" });
    setDocs(prev => prev.filter(d => d.id !== id));
    if (viewingDoc?.id === id) setViewingDoc(null);
  };

  const analyzeDoc = async (id: number) => {
    setAnalyzingDocId(id);
    setSuggestions([]);
    try {
      const r = await fetch(`/api/premed/docs/${id}/analyze`, { method: "POST" });
      const data = await r.json();
      setSuggestions(data.suggestions ?? []);
      if (data.autoMatched?.length) {
        setChecklist(prev => prev.map(i =>
          data.autoMatched.includes(i.id) ? { ...i, completed: true } : i
        ));
      }
      setTab("checklist");
    } catch {}
    finally { setAnalyzingDocId(null); }
  };

  const viewDoc = async (doc: Doc) => {
    const r = await fetch(`/api/premed/docs/${doc.id}`);
    const full = await r.json();
    setViewingDoc(full);
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const totalCount = checklist.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const grouped = groupBy(checklist, "category");

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif font-bold">Pre-Med Vault</h1>
        <p className="text-lg text-muted-foreground">Upload your documents, track requirements, compare schools.</p>
      </header>

      {/* Progress bar */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{completedCount} of {totalCount} requirements done</span>
          <span className="text-primary font-bold text-lg">{pct}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-400"><Sparkles className="w-4 h-4" /> Suggestions from your doc</div>
            <button onClick={() => setSuggestions([])} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {suggestions.map((s, i) => <div key={i} className="text-sm text-amber-200/90">• {s}</div>)}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: "checklist", label: `Checklist (${completedCount}/${totalCount})`, icon: CheckCheck },
          { key: "docs", label: `Documents (${docs.length})`, icon: FileText },
          { key: "schools", label: "School Comparison", icon: School },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Checklist tab */}
      {tab === "checklist" && (
        <div className="space-y-4">
          {loadingChecklist ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => {
              const isCollapsed = collapsedCats[cat];
              const catDone = items.filter(i => i.completed).length;
              const colorClass = CATEGORY_COLORS[cat] ?? "text-muted-foreground bg-muted/40 border-border";
              return (
                <div key={cat} className="bg-card rounded-2xl border overflow-hidden">
                  <button
                    onClick={() => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
                    className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colorClass}`}>{cat}</span>
                      <span className="text-sm text-muted-foreground">{catDone}/{items.length}</span>
                    </div>
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {!isCollapsed && (
                    <div className="divide-y divide-border">
                      {items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item)}
                          className="w-full flex items-start gap-4 p-4 hover:bg-accent/20 transition-colors text-left group"
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.completed
                              ? <CheckCircle2 className="w-5 h-5 text-primary" />
                              : <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary/60 transition-colors" />}
                          </div>
                          <div className="space-y-0.5">
                            <div className={`font-medium text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.label}</div>
                            {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Documents tab */}
      {tab === "docs" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <div className="flex items-center gap-3">
              <UploadCloud className="w-5 h-5 text-primary" />
              <span className="font-semibold">Add a document</span>
            </div>
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
            >
              {uploading
                ? <div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Uploading…</div>
                : <>
                    <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <div className="font-medium text-sm">Drop a file here or click to browse</div>
                    <div className="text-xs text-muted-foreground mt-1">.txt, .md, .csv, or any plain-text file</div>
                  </>}
              <input ref={fileInputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> or paste text <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => setShowPasteForm(v => !v)}
              className="w-full text-sm py-2 rounded-xl border hover:bg-accent transition-colors text-muted-foreground"
            >
              {showPasteForm ? "Hide paste form" : "Paste text instead"}
            </button>

            {showPasteForm && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  value={pasteName}
                  onChange={e => setPasteName(e.target.value)}
                  placeholder="Document name (optional)"
                  className="w-full rounded-xl border bg-background px-4 py-2 text-sm"
                />
                <select
                  value={pasteCategory}
                  onChange={e => setPasteCategory(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-2 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border bg-background p-4 text-sm"
                  placeholder="Paste your pre-med notes, transcripts, activity descriptions…"
                />
                <button
                  onClick={submitPaste}
                  disabled={uploading || !pasteText.trim()}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {uploading ? "Saving…" : "Save document"}
                </button>
              </div>
            )}

            {uploadError && <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm">{uploadError}</div>}
          </div>

          {loadingDocs ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
          ) : docs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto opacity-30" />
              <p>No documents yet. Upload one above.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {docs.map(doc => (
                <div key={doc.id} className="bg-card rounded-2xl border p-5 space-y-3 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm leading-snug">{doc.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{doc.wordCount.toLocaleString()} words · {doc.category} · {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteDoc(doc.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{doc.preview}…</p>
                  <div className="flex gap-2">
                    <button onClick={() => viewDoc(doc)} className="flex-1 text-xs py-2 rounded-lg border hover:bg-accent transition-colors text-muted-foreground">View</button>
                    <button
                      onClick={() => analyzeDoc(doc.id)}
                      disabled={analyzingDocId === doc.id}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium disabled:opacity-50"
                    >
                      {analyzingDocId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* School Comparison tab */}
      {tab === "schools" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Requirements vary by year and applicant pool. Always verify on each school's official website. See the <strong>Disability Support Hub</strong> in the nav for school-specific disability policies.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">School</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">MCAT</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">GPA</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Research</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Clinical</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Notable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SCHOOL_COMPARISONS.map(s => (
                  <tr key={s.name} className="hover:bg-accent/20 transition-colors">
                    <td className="p-4">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{s.name}</a>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{s.mcat}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{s.gpa}</td>
                    <td className="p-4 text-xs text-muted-foreground">{s.research}</td>
                    <td className="p-4 text-xs text-muted-foreground">{s.clinical}</td>
                    <td className="p-4 text-xs text-muted-foreground">{s.special}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doc viewer modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewingDoc(null)}>
          <div className="bg-card rounded-2xl border max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <div className="font-semibold">{viewingDoc.name}</div>
                <div className="text-xs text-muted-foreground">{viewingDoc.wordCount?.toLocaleString()} words</div>
              </div>
              <button onClick={() => setViewingDoc(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-5">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{viewingDoc.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
