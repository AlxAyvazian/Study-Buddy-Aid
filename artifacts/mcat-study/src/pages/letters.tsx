import { useState, useEffect, useRef } from "react";
import { FileText, Sparkles, Copy, Check, RefreshCw, ChevronDown, Loader2 } from "lucide-react";

type LetterType = { key: string; name: string };

const PLACEHOLDERS: Record<string, string> = {
  personal_statement: `Tell me about yourself so I can write your personal statement. Include:

- A pivotal moment or experience that confirmed medicine was right for you
- Any disability, ADHD, or dyscalculia experience and how you've grown through it
- Clinical/shadowing experiences and what you observed or felt
- Research, volunteer, or work experiences that shaped you
- Your specific interest (specialty, population, setting)
- Any obstacles you've overcome
- Why now, why medicine, why you

The more specific and personal you are, the more human the letter will sound.`,

  lor_request: `Tell me about the professor or supervisor you're asking, so I can write the request email. Include:

- Their name and title
- The class/lab/experience where they know you
- Specific moments they'd remember (a project, a paper, a discussion)
- Why you're asking them specifically
- What schools/programs this letter is for
- Your timeline (when applications are due)`,

  lor_for_professor: `Tell me about yourself so I can draft a LOR template for your professor. Include:

- Your name and the class/lab context
- Your strongest qualities they'd speak to
- Specific projects, assignments, or moments you'd like highlighted
- Any challenges you overcame that they witnessed
- Your goals (medical school, specialty interest)
- Target schools or programs`,

  secondary_essay: `Tell me what I need to write your secondary essay. Include:

- The school name and the exact prompt/question
- Your specific connection to that school (program, faculty, curriculum, location)
- The experience or quality you want to highlight for this prompt
- Word count limit (if known)
- Anything you haven't mentioned elsewhere in your application`,

  disability_disclosure: `Tell me what you need for your disability accommodation request. Include:

- Your disability or diagnosis (as much as you're comfortable sharing)
- The specific accommodations you're requesting (extended time, separate room, etc.)
- Whether you have documentation from a clinician
- The school name or office you're writing to
- Any history of prior accommodations (MCAT, undergrad, etc.)`,
};

export default function LettersPage() {
  const [letterTypes, setLetterTypes] = useState<LetterType[]>([]);
  const [selectedType, setSelectedType] = useState("personal_statement");
  const [context, setContext] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [letter, setLetter] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/letters/types").then(r => r.json()).then(setLetterTypes).catch(() => {});
  }, []);

  const generate = async () => {
    if (!context.trim()) return;
    setStreaming(true);
    setLetter("");
    setError(null);

    try {
      const r = await fetch("/api/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterType: selectedType,
          context,
          wordCount: wordCount || undefined,
          additionalInstructions: additionalInstructions || undefined,
        }),
      });

      if (!r.ok || !r.body) {
        setError("Failed to connect to letter writer."); setStreaming(false); return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
            if (parsed.done) break;
            if (parsed.content) {
              setLetter(prev => prev + parsed.content);
              setTimeout(() => letterRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }), 50);
            }
          } catch { }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setStreaming(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentType = letterTypes.find(t => t.key === selectedType);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold">Letter Writer</h1>
            <p className="text-muted-foreground mt-0.5">AI-powered, deeply humanized letters for every stage of your application.</p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <div className="space-y-4">
          {/* Letter type selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">What are you writing?</label>
            <div className="grid grid-cols-1 gap-2">
              {letterTypes.map(lt => (
                <button
                  key={lt.key}
                  onClick={() => { setSelectedType(lt.key); setLetter(""); setError(null); }}
                  className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${selectedType === lt.key ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent/30"}`}
                >
                  {lt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Context input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Tell me about yourself</label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={12}
              placeholder={PLACEHOLDERS[selectedType] ?? "Describe your background, experiences, and what you need in this letter…"}
              className="w-full rounded-xl border bg-background p-4 text-sm leading-relaxed resize-none"
            />
            <p className="text-xs text-muted-foreground">The more specific you are, the more human and personal the letter will sound.</p>
          </div>

          {/* Advanced options */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target word count (optional)</label>
                <input
                  value={wordCount}
                  onChange={e => setWordCount(e.target.value)}
                  placeholder="e.g. 650 for AMCAS, 300 for secondary"
                  className="w-full rounded-xl border bg-background px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Additional instructions</label>
                <textarea
                  value={additionalInstructions}
                  onChange={e => setAdditionalInstructions(e.target.value)}
                  rows={3}
                  placeholder="e.g. 'Mention my dyscalculia journey', 'Focus on my rural medicine interest', 'Avoid sounding too formal'"
                  className="w-full rounded-xl border bg-background p-3 text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={generate}
            disabled={streaming || !context.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {streaming
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing…</>
              : <><Sparkles className="w-5 h-5" /> Write my {currentType?.name ?? "letter"}</>
            }
          </button>

          {error && (
            <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">{error}</div>
          )}
        </div>

        {/* Right: letter output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">{letter ? currentType?.name : "Your letter will appear here"}</label>
            {letter && (
              <div className="flex gap-2">
                <button
                  onClick={generate}
                  disabled={streaming}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                >
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
            )}
          </div>

          <div className={`min-h-[500px] rounded-2xl border bg-card p-6 relative ${!letter && !streaming ? "flex items-center justify-center" : ""}`}>
            {!letter && !streaming && (
              <div className="text-center text-muted-foreground space-y-3">
                <FileText className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-sm">Fill in the form and click Write to generate your letter.</p>
              </div>
            )}

            {(letter || streaming) && (
              <div ref={letterRef} className="prose prose-sm max-w-none text-foreground leading-relaxed">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.8]">{letter}{streaming && <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-0.5 rounded-sm" />}</pre>
              </div>
            )}
          </div>

          {letter && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{letter.split(/\s+/).filter(Boolean).length} words</span>
              <span>{letter.length} characters</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
