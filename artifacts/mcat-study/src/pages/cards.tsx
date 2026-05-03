import { useState } from "react";
import { Link } from "wouter";
import { useListCards, useListSections, useDeleteCard } from "@workspace/api-client-react";
import { Plus, BookOpen, Trash2 } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";
type Status = "new" | "learning" | "mastered";

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};
const statusColors: Record<Status, string> = {
  new: "bg-gray-100 text-gray-600",
  learning: "bg-blue-100 text-blue-700",
  mastered: "bg-green-100 text-green-700",
};

export default function CardsBrowser() {
  const [sectionFilter, setSectionFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<Status | undefined>();
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | undefined>();

  const { data: sections } = useListSections();
  const { data: cards } = useListCards({
    ...(sectionFilter !== undefined && { sectionId: sectionFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(difficultyFilter && { difficulty: difficultyFilter }),
  });
  const deleteCard = useDeleteCard();

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Remove this card?")) {
      await deleteCard.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold">Card Library</h1>
          <p className="text-lg text-muted-foreground mt-1">All your knowledge in one place.</p>
        </div>
        <Link href="/cards/new">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-base shrink-0">
            <Plus className="w-5 h-5" />
            Add Card
          </button>
        </Link>
      </header>

      <div className="flex flex-wrap gap-3">
        <select
          value={sectionFilter ?? ""}
          onChange={(e) => setSectionFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-4 py-2.5 rounded-xl border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Sections</option>
          {(sections ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.shortName}</option>
          ))}
        </select>

        <select
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter((e.target.value as Status) || undefined)}
          className="px-4 py-2.5 rounded-xl border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="mastered">Mastered</option>
        </select>

        <select
          value={difficultyFilter ?? ""}
          onChange={(e) => setDifficultyFilter((e.target.value as Difficulty) || undefined)}
          className="px-4 py-2.5 rounded-xl border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <div className="ml-auto text-sm text-muted-foreground self-center">
          {(cards ?? []).length} card{(cards ?? []).length !== 1 ? "s" : ""}
        </div>
      </div>

      {(cards ?? []).length === 0 ? (
        <div className="bg-card rounded-2xl border py-24 text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="text-xl text-muted-foreground">No cards found.</p>
          <Link href="/cards/new">
            <button className="mt-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90">
              Add your first card
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(cards ?? []).map((card) => (
            <div
              key={card.id}
              className="bg-card rounded-2xl border p-6 hover:shadow-md transition-all duration-200 flex items-start gap-4 group"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {card.sectionName}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${difficultyColors[card.difficulty as Difficulty]}`}>
                    {card.difficulty}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColors[card.status as Status]}`}>
                    {card.status}
                  </span>
                  {card.hasVisualAid && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                      Visual Aid
                    </span>
                  )}
                </div>
                <p className="text-lg font-medium leading-snug">{card.front}</p>
                <p className="text-base text-muted-foreground leading-snug line-clamp-2">{card.back}</p>
                {card.reviewCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed {card.reviewCount} time{card.reviewCount !== 1 ? "s" : ""} · {Math.round((card.correctCount / card.reviewCount) * 100)}% correct
                  </p>
                )}
              </div>
              <button
                onClick={(e) => handleDelete(card.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
