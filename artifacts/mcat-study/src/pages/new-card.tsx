import { useState } from "react";
import { useLocation } from "wouter";
import { useListSections, useCreateCard } from "@workspace/api-client-react";
import { ChevronLeft } from "lucide-react";

type VisualAidType = "steps" | "diagram" | "analogy" | "formula";

export default function NewCard() {
  const [, navigate] = useLocation();
  const { data: sections } = useListSections();
  const createCard = useCreateCard();

  const [sectionId, setSectionId] = useState<number | "">("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [hasVisualAid, setHasVisualAid] = useState(false);
  const [visualAidType, setVisualAidType] = useState<VisualAidType>("steps");
  const [visualAidContent, setVisualAidContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!sectionId) { setError("Please select a section."); return; }
    if (!front.trim()) { setError("Please enter a question or concept."); return; }
    if (!back.trim()) { setError("Please enter an explanation or answer."); return; }
    if (hasVisualAid && !visualAidContent.trim()) { setError("Please add content for the visual aid, or turn it off."); return; }

    await createCard.mutateAsync({
      sectionId: Number(sectionId),
      front: front.trim(),
      back: back.trim(),
      difficulty,
      hasVisualAid,
      visualAidType: hasVisualAid ? visualAidType : null,
      visualAidContent: hasVisualAid ? visualAidContent.trim() : null,
    });
    navigate("/cards");
  };

  const difficultyOptions = [
    { value: "easy", label: "Easy", desc: "Quick to recall" },
    { value: "medium", label: "Medium", desc: "Needs some thought" },
    { value: "hard", label: "Hard", desc: "Challenging concept" },
  ] as const;

  const visualAidOptions: { value: VisualAidType; label: string; desc: string }[] = [
    { value: "steps", label: "Step-by-Step", desc: "Numbered steps" },
    { value: "formula", label: "Formula", desc: "Math with explanation" },
    { value: "analogy", label: "Analogy", desc: "Compare to familiar idea" },
    { value: "diagram", label: "Diagram", desc: "Text-based visual" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <button
          onClick={() => navigate("/cards")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Cards
        </button>
        <h1 className="text-4xl font-serif font-bold">Add a New Concept</h1>
        <p className="text-lg text-muted-foreground mt-2">Break it down so it's easy to digest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-base">
            {error}
          </div>
        )}

        <div className="bg-card rounded-2xl border p-6 space-y-3">
          <label className="text-lg font-semibold block">Section</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-4 py-3.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Choose a section...</option>
            {(sections ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.shortName} — {s.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-3">
          <div>
            <label className="text-lg font-semibold block">Question / Concept</label>
            <p className="text-sm text-muted-foreground mt-1">What do you want to remember?</p>
          </div>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="e.g. What is the formula for pH?"
          />
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-3">
          <div>
            <label className="text-lg font-semibold block">Answer / Explanation</label>
            <p className="text-sm text-muted-foreground mt-1">The explanation you'll see on the back of the card.</p>
          </div>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="e.g. pH = -log[H+]"
          />
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-3">
          <label className="text-lg font-semibold block">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(opt.value)}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                  difficulty === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <label className="text-lg font-semibold block">Visual Aid</label>
              <p className="text-sm text-muted-foreground mt-1">Add a step-by-step breakdown, analogy, or formula for harder concepts.</p>
            </div>
            <button
              type="button"
              onClick={() => setHasVisualAid((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${hasVisualAid ? "bg-primary" : "bg-muted"}`}
              role="switch"
              aria-checked={hasVisualAid}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow ${hasVisualAid ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {hasVisualAid && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-3">
                {visualAidOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisualAidType(opt.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      visualAidType === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Aid Content</label>
                <textarea
                  value={visualAidContent}
                  onChange={(e) => setVisualAidContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3.5 rounded-xl border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder={
                    visualAidType === "steps"
                      ? "1. First step\n2. Second step\n3. Third step"
                      : visualAidType === "formula"
                      ? "Formula = value\n\nStep 1: ...\nStep 2: ..."
                      : visualAidType === "analogy"
                      ? "Think of it like...\n\nFor example..."
                      : "[ Box 1 ] → [ Box 2 ]\n\nKey: ..."
                  }
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={createCard.isPending}
          className="w-full bg-primary text-primary-foreground py-5 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createCard.isPending ? "Saving..." : "Save Card"}
        </button>
      </form>
    </div>
  );
}
