import { useState } from "react";
import { UploadCloud, Sparkles, BadgeCheck, Ban } from "lucide-react";

export default function AnalyzerPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-3">
        <h1 className="text-4xl font-serif font-bold">MCAT Upload Analyzer</h1>
        <p className="text-lg text-muted-foreground">Paste a ton of prep-book text and I’ll tell you what to memorize and what to skip.</p>
      </header>

      <div className="bg-card rounded-2xl border p-6 space-y-4">
        <div className="flex items-center gap-2 font-semibold"><UploadCloud className="w-5 h-5 text-primary" /> Upload or paste content</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full rounded-xl border bg-background p-4 text-sm"
          placeholder="Paste chapters, notes, tables, or outlines here..."
        />
        <button
          onClick={analyze}
          disabled={loading || !text.trim()}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" /> {loading ? "Analyzing..." : "Tell me what matters"}
        </button>
        {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</div>}
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border p-6 space-y-3">
            <div className="flex items-center gap-2 font-semibold"><BadgeCheck className="w-5 h-5 text-emerald-500" /> Memorize</div>
            <div className="text-sm text-muted-foreground">{result.summary}</div>
            <ul className="space-y-2 text-foreground list-disc pl-5">
              {result.memorize?.map((item: string) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-card rounded-2xl border p-6 space-y-3">
            <div className="flex items-center gap-2 font-semibold"><Ban className="w-5 h-5 text-orange-500" /> Probably skip</div>
            <ul className="space-y-2 text-foreground list-disc pl-5">
              {result.skip?.map((item: string) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-card rounded-2xl border p-6 md:col-span-2 space-y-3">
            <div className="font-semibold">High-yield notes</div>
            <div className="grid gap-2">
              {result.highYieldNotes?.map((item: string) => <div key={item} className="rounded-xl border p-3 bg-muted/40 text-sm">{item}</div>)}
            </div>
            <div className="pt-2 text-sm text-muted-foreground space-y-1">
              {result.advice?.map((item: string) => <div key={item}>• {item}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
