import { useGetProgress, useGetStreak } from "@workspace/api-client-react";
import { Flame, Clock, BookOpen, TrendingUp, Calendar } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WeeklyChart({ weeklyMinutes }: { weeklyMinutes: number[] }) {
  const max = Math.max(...weeklyMinutes, 1);
  const today = new Date();

  const days = weeklyMinutes.map((mins, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { mins, label: DAYS[d.getDay()] };
  });

  return (
    <div className="flex items-end gap-3 h-36">
      {days.map((day, i) => {
        const height = day.mins > 0 ? Math.max((day.mins / max) * 100, 8) : 0;
        const isToday = i === 6;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            {day.mins > 0 && (
              <span className="text-xs text-muted-foreground font-mono">{day.mins}m</span>
            )}
            <div className="w-full flex flex-col justify-end" style={{ height: "6rem" }}>
              <div
                className={`w-full rounded-lg transition-all duration-700 ${isToday ? "bg-primary" : "bg-primary/30"}`}
                style={{ height: `${height}%`, minHeight: day.mins > 0 ? "4px" : "0" }}
              />
            </div>
            <span className={`text-xs ${isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StreakCalendar({ studiedDates }: { studiedDates: string[] }) {
  const dateSet = new Set(studiedDates);
  const today = new Date();
  const cells = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const studied = dateSet.has(key);
    const isToday = i === 0;
    cells.push({ key, studied, isToday, day: d.getDate() });
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.key}
          title={cell.key}
          className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
            cell.studied
              ? "bg-primary text-primary-foreground"
              : cell.isToday
              ? "border-2 border-primary text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {cell.day}
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { data: progress } = useGetProgress();
  const { data: streak } = useGetStreak();

  const masteredPct = progress
    ? Math.round((progress.masteredCards / Math.max(progress.totalCards, 1)) * 100)
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-serif font-bold">Your Progress</h1>
        <p className="text-lg text-muted-foreground mt-2">Celebrate every step forward.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-orange-400" />
            Current Streak
          </div>
          <div className="text-4xl font-bold font-serif">{streak?.currentStreak ?? 0}</div>
          <div className="text-xs text-muted-foreground">days in a row</div>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            Longest Streak
          </div>
          <div className="text-4xl font-bold font-serif">{streak?.longestStreak ?? 0}</div>
          <div className="text-xs text-muted-foreground">personal best</div>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-blue-400" />
            Today
          </div>
          <div className="text-4xl font-bold font-serif">{progress?.totalMinutesToday ?? 0}</div>
          <div className="text-xs text-muted-foreground">minutes studied</div>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Mastered
          </div>
          <div className="text-4xl font-bold font-serif">{progress?.masteredCards ?? 0}</div>
          <div className="text-xs text-muted-foreground">of {progress?.totalCards ?? 0} cards</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-7 space-y-5">
        <h2 className="text-xl font-semibold font-serif">Study Minutes — Last 7 Days</h2>
        {progress?.weeklyMinutes ? (
          <WeeklyChart weeklyMinutes={progress.weeklyMinutes} />
        ) : (
          <div className="h-36 flex items-center justify-center text-muted-foreground">
            No study sessions yet.
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border p-7 space-y-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold font-serif">Study Calendar — Last 28 Days</h2>
        </div>
        <StreakCalendar studiedDates={streak?.studiedDates ?? []} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" /> Studied</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-primary inline-block" /> Today</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted inline-block" /> Not studied</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-7 space-y-6">
        <h2 className="text-xl font-semibold font-serif">Section Mastery</h2>
        <div className="space-y-5">
          {(progress?.sectionBreakdown ?? []).map((section) => (
            <div key={section.sectionId} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium text-base">{section.sectionName}</div>
                <div className="text-sm text-muted-foreground">
                  {section.masteredCards}/{section.totalCards} · {section.percentage}%
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${section.percentage}%`, backgroundColor: section.color }}
                />
              </div>
            </div>
          ))}
          {(progress?.sectionBreakdown ?? []).length === 0 && (
            <p className="text-muted-foreground text-center py-6">No data yet. Start studying to track your progress.</p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-7 space-y-4">
        <h2 className="text-xl font-semibold font-serif">Overall Mastery</h2>
        <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
          <div
            className="bg-primary h-5 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
            style={{ width: `${Math.max(masteredPct, masteredPct > 0 ? 5 : 0)}%` }}
          >
            {masteredPct > 0 && <span className="text-xs text-primary-foreground font-medium">{masteredPct}%</span>}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          {progress?.masteredCards ?? 0} mastered · {progress?.learningCards ?? 0} learning · {progress?.newCards ?? 0} new
        </p>
      </div>
    </div>
  );
}
