import { useState, useEffect, useCallback } from "react";
import { useSearch } from "wouter";
import {
  useListCards,
  useListSections,
  useCreateSession,
  useUpdateSession,
  useReviewCard,
} from "@workspace/api-client-react";
import { BookOpen, Check, X, RotateCcw, Timer, Coffee, ChevronLeft, ChevronRight } from "lucide-react";

type Phase = "setup" | "studying" | "done";

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

function VisualAid({ type, content }: { type: string | null; content: string | null }) {
  if (!content) return null;
  const lines = content.split("\n");

  if (type === "formula") {
    return (
      <div className="mt-6 bg-muted rounded-xl p-5 border-l-4 border-primary">
        <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Formula Breakdown</div>
        <pre className="font-mono text-base leading-relaxed whitespace-pre-wrap text-foreground">{content}</pre>
      </div>
    );
  }
  if (type === "steps") {
    return (
      <div className="mt-6 bg-muted rounded-xl p-5 border-l-4 border-emerald-400">
        <div className="text-xs font-medium text-emerald-600 mb-3 uppercase tracking-wide">Step-by-Step</div>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="text-base leading-relaxed text-foreground">{line}</div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "analogy") {
    return (
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="text-xs font-medium text-amber-600 mb-3 uppercase tracking-wide">Think of it this way</div>
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <div key={i} className="text-base leading-relaxed text-foreground">{line}</div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
      <div className="text-xs font-medium text-indigo-600 mb-3 uppercase tracking-wide">Visual Diagram</div>
      <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">{content}</pre>
    </div>
  );
}

function TimerDisplay({ seconds, isBreak }: { seconds: number; isBreak: boolean }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return (
    <div className={`flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-full ${isBreak ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
      {isBreak ? <Coffee className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
      {mins}:{secs}
    </div>
  );
}

export default function StudyMode() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedSection = params.get("section") ? Number(params.get("section")) : undefined;

  const { data: sections } = useListSections();
  const [selectedSection, setSelectedSection] = useState<number | undefined>(preselectedSection);
  const [phase, setPhase] = useState<Phase>("setup");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [cardsCorrect, setCardsCorrect] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(POMODORO_WORK);
  const [isBreak, setIsBreak] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  const { data: cardsData } = useListCards(
    selectedSection !== undefined ? { sectionId: selectedSection } : undefined,
    { query: { enabled: phase !== "setup" } }
  );
  const cards = cardsData ?? [];

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const reviewCard = useReviewCard();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          if (!isBreak) {
            setIsBreak(true);
            setTimerRunning(false);
            return POMODORO_BREAK;
          } else {
            setIsBreak(false);
            setTimerRunning(false);
            return POMODORO_WORK;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isBreak]);

  const startStudy = async () => {
    const session = await createSession.mutateAsync({ sectionId: selectedSection ?? null });
    setSessionId(session.id);
    setCardIndex(0);
    setFlipped(false);
    setCardsReviewed(0);
    setCardsCorrect(0);
    setTimerSeconds(POMODORO_WORK);
    setIsBreak(false);
    setTimerRunning(true);
    setPhase("studying");
  };

  const handleReview = useCallback(async (known: boolean) => {
    const card = cards[cardIndex];
    if (!card) return;
    await reviewCard.mutateAsync({ id: card.id, known });
    const newReviewed = cardsReviewed + 1;
    const newCorrect = cardsCorrect + (known ? 1 : 0);
    setCardsReviewed(newReviewed);
    setCardsCorrect(newCorrect);

    const next = cardIndex + 1;
    if (next >= cards.length) {
      if (sessionId) {
        await updateSession.mutateAsync({
          id: sessionId,
          endedAt: new Date().toISOString(),
          cardsReviewed: newReviewed,
          cardsCorrect: newCorrect,
        });
      }
      setTimerRunning(false);
      setPhase("done");
    } else {
      setCardIndex(next);
      setFlipped(false);
    }
  }, [cards, cardIndex, sessionId, cardsReviewed, cardsCorrect, reviewCard, updateSession]);

  const endEarly = async () => {
    if (sessionId) {
      await updateSession.mutateAsync({
        id: sessionId,
        endedAt: new Date().toISOString(),
        cardsReviewed,
        cardsCorrect,
      });
    }
    setTimerRunning(false);
    setPhase("done");
  };

  const reset = () => {
    setPhase("setup");
    setCardIndex(0);
    setFlipped(false);
    setTimerRunning(false);
    setTimerSeconds(POMODORO_WORK);
    setIsBreak(false);
  };

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
        <header className="space-y-3">
          <h1 className="text-4xl font-serif font-bold">Study Mode</h1>
          <p className="text-lg text-muted-foreground">Choose a section and go at your own pace.</p>
        </header>

        <div className="bg-card rounded-2xl border p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-lg font-medium">Which section?</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setSelectedSection(undefined)}
                className={`text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-base ${selectedSection === undefined ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/40"}`}
              >
                All Sections
              </button>
              {(sections ?? []).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSection(s.id)}
                  className={`text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-base ${selectedSection === s.id ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/40"}`}
                >
                  <span className="font-medium">{s.shortName}</span>
                  <span className="text-muted-foreground ml-2">— {s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Timer className="w-4 h-4 text-primary" />
              Pomodoro Timer included
            </div>
            <p className="text-sm text-muted-foreground">
              25 minutes of focused study, then a 5-minute break. The timer runs automatically. Study at whatever pace feels right.
            </p>
          </div>

          <button
            onClick={startStudy}
            disabled={createSession.isPending}
            className="w-full bg-primary text-primary-foreground py-5 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createSession.isPending ? "Starting..." : "Begin Session"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const accuracy = cardsReviewed > 0 ? Math.round((cardsCorrect / cardsReviewed) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 text-center">
        <div className="bg-card rounded-2xl border p-12 space-y-6">
          <div className="text-6xl font-serif font-bold text-primary">{accuracy}%</div>
          <h2 className="text-3xl font-serif font-bold">Session Complete</h2>
          <p className="text-xl text-muted-foreground">
            You reviewed {cardsReviewed} card{cardsReviewed !== 1 ? "s" : ""} and got {cardsCorrect} right. Every card you review builds a stronger neural pathway.
          </p>
          <button
            onClick={reset}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Study Again
          </button>
        </div>
      </div>
    );
  }

  const card = cards[cardIndex];
  if (!card) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-xl">No cards found for this section.</p>
        <button onClick={reset} className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90">
          Go Back
        </button>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    easy: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };
  const statusColors: Record<string, string> = {
    new: "bg-gray-100 text-gray-600",
    learning: "bg-blue-100 text-blue-700",
    mastered: "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Card {cardIndex + 1} of {cards.length}
        </div>
        <TimerDisplay seconds={timerSeconds} isBreak={isBreak} />
        <button onClick={endEarly} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          End session
        </button>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.round((cardIndex / cards.length) * 100)}%` }}
        />
      </div>

      {isBreak && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
          <div className="font-semibold text-emerald-700">Break time — good work.</div>
          <div className="text-sm text-emerald-600">Step away, breathe, hydrate. Come back when you're ready.</div>
          <button
            onClick={() => { setIsBreak(false); setTimerSeconds(POMODORO_WORK); setTimerRunning(true); }}
            className="mt-2 text-sm underline text-emerald-700"
          >
            Skip break
          </button>
        </div>
      )}

      <div
        className="bg-card rounded-2xl border shadow-md p-8 min-h-[300px] flex flex-col cursor-pointer select-none transition-all duration-200 hover:shadow-lg"
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{card.sectionName}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${difficultyColors[card.difficulty]}`}>{card.difficulty}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColors[card.status]}`}>{card.status}</span>
          <span className="ml-auto text-xs text-muted-foreground">{flipped ? "Tap to see question" : "Tap to reveal answer"}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4">
          {!flipped ? (
            <div className="text-2xl md:text-3xl font-serif leading-relaxed text-foreground">
              {card.front}
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">Answer</div>
              <div className="text-xl md:text-2xl leading-relaxed text-foreground">{card.back}</div>
              {card.hasVisualAid && (
                <VisualAid type={card.visualAidType} content={card.visualAidContent} />
              )}
            </div>
          )}
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleReview(false)}
            disabled={reviewCard.isPending}
            className="flex items-center justify-center gap-3 py-5 rounded-xl bg-red-50 text-red-700 border-2 border-red-200 text-lg font-semibold hover:bg-red-100 transition-all duration-150 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
            Still Learning
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={reviewCard.isPending}
            className="flex items-center justify-center gap-3 py-5 rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-200 text-lg font-semibold hover:bg-emerald-100 transition-all duration-150 disabled:opacity-50"
          >
            <Check className="w-6 h-6" />
            Got It
          </button>
        </div>
      ) : (
        <div className="flex justify-between gap-4">
          <button
            onClick={() => { if (cardIndex > 0) { setCardIndex(cardIndex - 1); setFlipped(false); } }}
            disabled={cardIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          <button
            onClick={() => setFlipped(true)}
            className="flex-1 py-4 rounded-xl bg-primary/10 text-primary font-semibold text-lg hover:bg-primary/20 transition-colors"
          >
            Reveal Answer
          </button>
          <button
            onClick={() => { setCardIndex((i) => Math.min(i + 1, cards.length - 1)); setFlipped(false); }}
            disabled={cardIndex >= cards.length - 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
          >
            Skip <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {flipped ? "Flip back to question" : "Flip to see answer"}
        </button>
      </div>
    </div>
  );
}
