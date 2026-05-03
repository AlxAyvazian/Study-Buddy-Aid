import { useGetProgress, useGetStreak, useListSections } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BookOpen, Clock, Flame, TrendingUp, ChevronRight, PlayCircle, HelpCircle, Upload } from "lucide-react";

export default function Dashboard() {
  const { data: progress } = useGetProgress();
  const { data: streak } = useGetStreak();
  const { data: sections } = useListSections();

  const sectionColors: Record<string, string> = {
    "#6366f1": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "#f59e0b": "bg-amber-100 text-amber-700 border-amber-200",
    "#10b981": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "#ec4899": "bg-pink-100 text-pink-700 border-pink-200",
  };

  const masteredPct = progress ? Math.round((progress.masteredCards / Math.max(progress.totalCards, 1)) * 100) : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Welcome back.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          You're doing great. Take a deep breath. We'll take this one step at a time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/study">
          <div className="group flex items-center justify-between bg-primary text-primary-foreground p-7 rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="space-y-1">
              <div className="font-serif text-2xl font-bold">Start Studying</div>
              <div className="text-primary-foreground/80 text-lg">
                {progress?.newCards ?? 0} new · {progress?.learningCards ?? 0} learning
              </div>
            </div>
            <PlayCircle className="w-12 h-12 opacity-90 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </Link>

        <Link href="/help">
          <div className="group flex items-center justify-between bg-card border p-7 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="space-y-1">
              <div className="font-serif text-2xl font-bold">Dyscalculia Help</div>
              <div className="text-muted-foreground text-lg">Step-by-step math support</div>
            </div>
            <HelpCircle className="w-12 h-12 text-primary/80 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Flame className="w-4 h-4 text-orange-400" /> Day Streak</div>
          <div className="text-4xl font-bold font-serif">{streak?.currentStreak ?? 0}</div>
          <div className="text-xs text-muted-foreground">Best: {streak?.longestStreak ?? 0} days</div>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Clock className="w-4 h-4 text-blue-400" /> Today</div>
          <div className="text-4xl font-bold font-serif">{progress?.totalMinutesToday ?? 0}</div>
          <div className="text-xs text-muted-foreground">minutes studied</div>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><BookOpen className="w-4 h-4 text-emerald-400" /> Mastered</div>
          <div className="text-4xl font-bold font-serif">{progress?.masteredCards ?? 0}</div>
          <div className="text-xs text-muted-foreground">of {progress?.totalCards ?? 0} cards</div>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><TrendingUp className="w-4 h-4 text-violet-400" /> Overall</div>
          <div className="text-4xl font-bold font-serif">{masteredPct}%</div>
          <div className="text-xs text-muted-foreground">completion</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-7 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold font-serif">Overall Mastery</h2>
          <span className="text-muted-foreground">{masteredPct}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4">
          <div className="bg-primary h-4 rounded-full transition-all duration-700" style={{ width: `${masteredPct}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-bold">Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(sections ?? []).map((section) => {
            const colorClass = sectionColors[section.color] ?? "bg-gray-100 text-gray-700 border-gray-200";
            const pct = section.totalCards > 0 ? Math.round((section.masteredCards / section.totalCards) * 100) : 0;
            return (
              <Link href={`/study?section=${section.id}`} key={section.id}>
                <div className="bg-card rounded-2xl border p-6 space-y-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${colorClass}`}>{section.shortName}</span>
                      <h3 className="text-lg font-semibold mt-2 leading-tight">{section.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{section.masteredCards}/{section.totalCards} mastered</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5"><div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: section.color }} /></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
