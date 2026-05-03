import { useState, useRef } from "react";
import {
  Search, Sparkles, ExternalLink, BookOpen, Video,
  Wrench, ClipboardList, Star, Brain, AlertTriangle,
  ChevronRight, Loader2, Zap, GraduationCap, X
} from "lucide-react";

type Resource = {
  name: string;
  type: "tool" | "video" | "article" | "practice" | "textbook";
  url: string | null;
  findIt: string;
  description: string;
  adhdFriendly: boolean;
  free: boolean;
};

type Subtopic = { name: string; why: string };

type ResearchResult = {
  topic: string;
  difficulty: string;
  mcatRelevance: string;
  mcatSections: string[];
  overview: string;
  keyFacts: string[];
  resources: Resource[];
  subtopics: Subtopic[];
  mnemonics: string[];
  commonMistakes: string[];
};

const TYPE_CONFIG = {
  tool:      { label: "Tool",      icon: Wrench,        color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  video:     { label: "Video",     icon: Video,         color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  article:   { label: "Article",   icon: BookOpen,      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  practice:  { label: "Practice",  icon: ClipboardList, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  textbook:  { label: "Textbook",  icon: GraduationCap, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced:     "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const RELEVANCE_COLOR: Record<string, string> = {
  High:   "text-primary bg-primary/10 border-primary/20",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Low:    "text-muted-foreground bg-muted border-border",
};

const SUGGESTED = [
  "Krebs cycle", "Action potential", "Hardy-Weinberg equilibrium",
  "Enzyme kinetics", "Renal tubular reabsorption", "DNA replication",
  "Protein structure & folding", "Cardiac output", "Gas exchange",
  "Neurotransmitters", "Meiosis vs mitosis", "Acid-base chemistry",
];

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      )}
    </span>
  );
}

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [rawBuffer, setRawBuffer] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (topic?: string) => {
    const q = (topic ?? query).trim();
    if (!q) return;
    setStreaming(true);
    setResult(null);
    setRawBuffer("");
    setError(null);
    setActiveFilter("all");

    try {
      const r = await fetch("/api/research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: q }),
      });

      if (!r.ok || !r.body) { setError("Failed to connect."); setStreaming(false); return; }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accJson = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.error) { setError(parsed.error); break; }
            if (parsed.chunk) {
              accJson += parsed.chunk;
              setRawBuffer(accJson);
            }
            if (parsed.done && parsed.raw) {
              try {
                const jsonStr = parsed.raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
                const data: ResearchResult = JSON.parse(jsonStr);
                setResult(data);
              } catch {
                setError("Received malformed results. Please try again.");
              }
            }
          } catch { /* ignore parse errors on partial lines */ }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setStreaming(false);
    }
  };

  const resourceTypes = result
    ? [...new Set(result.resources.map(r => r.type))]
    : [];

  const filteredResources = result?.resources.filter(r =>
    activeFilter === "all" || r.type === activeFilter
  ) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold">Topic Explorer</h1>
            <p className="text-muted-foreground mt-0.5">Enter any topic — get a full breakdown, free tools, videos, and resources.</p>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") search(); }}
              placeholder="e.g. Krebs cycle, action potential, enzyme kinetics…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-card text-base focus:ring-2 focus:ring-primary/30 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResult(null); setRawBuffer(""); setError(null); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => search()}
            disabled={streaming || !query.trim()}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {streaming ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Suggested topics */}
      {!result && !streaming && !error && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Try these topics</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); search(s); }}
                className="text-sm px-4 py-2 rounded-xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Streaming progress */}
      {streaming && !result && (
        <div className="bg-card border rounded-2xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="font-medium">Searching across free educational resources…</span>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Scanning Khan Academy, OpenStax, Wikipedia…</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-100" />Finding free tools and simulators…</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-200" />Curating ADHD-friendly explanations…</div>
          </div>
          {rawBuffer.length > 0 && (
            <div className="mt-4 font-mono text-xs text-muted-foreground bg-muted/30 rounded-xl p-3 max-h-32 overflow-hidden">
              {rawBuffer.slice(-300)}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Search failed</div>
            <div className="text-sm mt-1 text-red-400/80">{error}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-400">
          {/* Header */}
          <div className="bg-card border rounded-2xl p-6 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h2 className="text-2xl font-serif font-bold">{result.topic}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {result.mcatSections?.map(s => (
                  <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                ))}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${DIFFICULTY_COLOR[result.difficulty] ?? "text-muted-foreground bg-muted border-border"}`}>
                  {result.difficulty}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${RELEVANCE_COLOR[result.mcatRelevance] ?? ""}`}>
                  MCAT Relevance: {result.mcatRelevance}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-2">
              {result.overview.split("\n").filter(Boolean).map((para, i) => (
                <p key={i}><MarkdownText text={para} /></p>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Key facts */}
            {result.keyFacts?.length > 0 && (
              <div className="bg-card border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Zap className="w-4 h-4 text-amber-400" /> Key Facts
                </div>
                <ul className="space-y-2">
                  {result.keyFacts.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-amber-400 shrink-0 font-bold mt-0.5">{i + 1}.</span>
                      <MarkdownText text={f} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mnemonics */}
            {result.mnemonics?.length > 0 && (
              <div className="bg-card border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Brain className="w-4 h-4 text-violet-400" /> Mnemonics
                </div>
                <ul className="space-y-2">
                  {result.mnemonics.map((m, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed bg-violet-400/5 border border-violet-400/10 rounded-lg px-3 py-2">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common mistakes */}
            {result.commonMistakes?.length > 0 && (
              <div className="bg-card border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Common Mistakes
                </div>
                <ul className="space-y-2">
                  {result.commonMistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-rose-400 shrink-0 mt-0.5">✗</span>
                      <MarkdownText text={m} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 font-semibold">
                <Star className="w-4 h-4 text-primary" />
                Free Resources ({result.resources.length})
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => setActiveFilter("all")} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activeFilter === "all" ? "bg-primary/10 text-primary border-primary/20" : "border-border text-muted-foreground hover:bg-accent"}`}>
                  All
                </button>
                {resourceTypes.map(t => {
                  const cfg = TYPE_CONFIG[t] ?? TYPE_CONFIG.article;
                  const Icon = cfg.icon;
                  return (
                    <button key={t} onClick={() => setActiveFilter(t)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all ${activeFilter === t ? cfg.color : "border-border text-muted-foreground hover:bg-accent"}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {filteredResources.map((resource, i) => {
                const cfg = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.article;
                const Icon = cfg.icon;
                return (
                  <div key={i} className="bg-card border rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{resource.name}</span>
                          {resource.adhdFriendly && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">ADHD-friendly</span>
                          )}
                        </div>
                        <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </div>
                      </div>
                      {resource.url ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 shrink-0 text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground shrink-0 italic">See below</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
                    {!resource.url && resource.findIt && (
                      <div className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded-lg px-3 py-2">
                        <span className="font-medium">How to find it:</span> {resource.findIt}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtopics */}
          {result.subtopics?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <ChevronRight className="w-4 h-4 text-primary" /> Explore Next
              </div>
              <div className="flex flex-wrap gap-2">
                {result.subtopics.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s.name); search(s.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    title={s.why}
                    className="group flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <span>{s.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
