import { useState } from "react";
import { Sparkles, Film, Image as ImageIcon } from "lucide-react";

export default function MediaGeneratorPage() {
  const [type, setType] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-3">
        <h1 className="text-4xl font-serif font-bold">AI Media Generator</h1>
        <p className="text-lg text-muted-foreground">Make image ideas and video storyboards from your prompt.</p>
      </header>

      <div className="bg-card rounded-2xl border p-6 space-y-5">
        <div className="flex gap-3">
          <button onClick={() => setType("image")} className={`px-4 py-2 rounded-xl border ${type === "image" ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>
            <span className="inline-flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image</span>
          </button>
          <button onClick={() => setType("video")} className={`px-4 py-2 rounded-xl border ${type === "video" ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>
            <span className="inline-flex items-center gap-2"><Film className="w-4 h-4" /> Video</span>
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="w-full rounded-xl border bg-background p-4 text-base"
          placeholder={type === "image" ? "Describe the image you want..." : "Describe the video you want..."}
        />

        <button onClick={generate} disabled={loading || !prompt.trim()} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <Sparkles className="w-4 h-4" /> {loading ? "Generating..." : "Generate"}
        </button>

        {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</div>}
      </div>

      {result && (
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <h2 className="text-2xl font-serif font-bold">{result.title}</h2>
          <p className="text-muted-foreground">{result.description}</p>
          {result.type === "image" ? (
            <div className="rounded-xl border bg-muted p-6 text-sm whitespace-pre-wrap">{result.prompt}</div>
          ) : (
            <div className="space-y-3">
              {result.scenes?.map((scene: any) => (
                <div key={scene.scene} className="rounded-xl border p-4">
                  <div className="font-semibold">Scene {scene.scene}</div>
                  <div className="text-muted-foreground">{scene.shot}</div>
                  <div className="text-xs text-muted-foreground mt-1">{scene.duration}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
