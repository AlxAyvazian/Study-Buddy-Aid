import { useMemo, useState } from "react";
import { Download, Lightbulb, UploadCloud, Calculator } from "lucide-react";

const dyscalculiaTips = [
  "Use one step at a time.",
  "Write numbers with lots of spacing.",
  "Round first, then refine.",
  "Say the math out loud.",
  "Use color to track parts of a problem.",
];

export default function HelpPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const explanation = useMemo(() => {
    if (!result) return null;
    return result.split("\n");
  }, [result]);

  const explain = async () => {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to explain");
    setSummary(data.summary);
    setResult(`${data.explanation}\n\nTips:\n- ${data.tips.join("\n- ")}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-3">
        <h1 className="text-4xl font-serif font-bold">Dyscalculia Help</h1>
        <p className="text-lg text-muted-foreground">A calmer way to work with numbers and formulas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold"><Lightbulb className="w-5 h-5 text-amber-500" /> Quick supports</div>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            {dyscalculiaTips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold"><UploadCloud className="w-5 h-5 text-primary" /> Upload and explain</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="w-full rounded-xl border bg-background p-4 text-sm" placeholder="Paste notes, formulas, or a short passage here..." />
          <button onClick={explain} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Explain it simply</button>
          {summary && <div className="text-sm text-muted-foreground">{summary}</div>}
        </div>
      </div>

      {explanation && (
        <div className="bg-card rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-2 font-semibold"><Calculator className="w-5 h-5 text-emerald-500" /> Simple explanation</div>
          <div className="space-y-2 text-foreground">
            {explanation.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
