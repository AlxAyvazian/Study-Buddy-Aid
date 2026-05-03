import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward, Settings, X, Zap, Brain, Coffee, Footprints, Music, Eye, Droplets } from "lucide-react";

type Mode = { label: string; work: number; break: number; desc: string; adhdNote: string };
type Phase = "work" | "break";

const MODES: Mode[] = [
  { label: "Micro", work: 10, break: 2, desc: "10 / 2", adhdNote: "Best when focus feels impossible. Very short sprint, very short reward." },
  { label: "Short", work: 15, break: 3, desc: "15 / 3", adhdNote: "Great warm-up mode. Build momentum before switching to longer sessions." },
  { label: "Classic", work: 25, break: 5, desc: "25 / 5", adhdNote: "The standard Pomodoro. Good for most MCAT study sessions." },
  { label: "Deep", work: 50, break: 10, desc: "50 / 10", adhdNote: "For when you're in the zone. Only use when focus is already flowing." },
];

const BREAK_TIPS = [
  { icon: Footprints, tip: "Walk around for 2 minutes. Movement resets dopamine.", category: "move" },
  { icon: Droplets, tip: "Drink a full glass of water right now. Dehydration tanks focus.", category: "body" },
  { icon: Eye, tip: "Look at something 20+ feet away for 20 seconds. Your eyes need it.", category: "body" },
  { icon: Brain, tip: "Close your eyes and replay the last concept you studied. Don't add new info.", category: "review" },
  { icon: Music, tip: "Put on one song and do nothing else. Just listen.", category: "rest" },
  { icon: Coffee, tip: "Stretch your neck and shoulders slowly. Tension builds without you noticing.", category: "move" },
  { icon: Zap, tip: "Write one sentence: what's the key thing you just learned? No more.", category: "review" },
  { icon: Footprints, tip: "Stand up and do 10 jumping jacks or stretch your arms wide.", category: "move" },
  { icon: Eye, tip: "Step away from all screens entirely. Even your phone.", category: "rest" },
  { icon: Brain, tip: "Say the topic you just studied out loud like you're teaching it to someone.", category: "review" },
];

const WORK_COLOR = "stroke-primary";
const BREAK_COLOR = "stroke-emerald-400";
const RING_BG = "stroke-muted/40";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CircleProgress({ progress, phase, size = 280 }: { progress: number; phase: Phase; size?: number }) {
  const r = (size - 20) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  const colorClass = phase === "work" ? "stroke-primary" : "stroke-emerald-400";

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={RING_BG} strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        className={colorClass}
        strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.4s ease" }}
      />
    </svg>
  );
}

export default function PomodoroPage() {
  const [modeIdx, setModeIdx] = useState(2); // default: Classic
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(MODES[2].work * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);
  const [breakTip, setBreakTip] = useState(BREAK_TIPS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [flashBreak, setFlashBreak] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickedRef = useRef(0); // tracks seconds elapsed this phase for totalWork

  const mode = MODES[modeIdx];
  const totalSeconds = (phase === "work" ? mode.work : mode.break) * 60;
  const progress = secondsLeft / totalSeconds;

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const pickBreakTip = () => setBreakTip(BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)]);

  const advancePhase = useCallback((fromPhase: Phase) => {
    clearTimer();
    setRunning(false);
    pickBreakTip();
    if (fromPhase === "work") {
      setSessionCount(c => c + 1);
      setPhase("break");
      setSecondsLeft(MODES[modeIdx].break * 60);
      setFlashBreak(true);
      setTimeout(() => setFlashBreak(false), 800);
    } else {
      setPhase("work");
      setSecondsLeft(MODES[modeIdx].work * 60);
    }
    tickedRef.current = 0;
  }, [modeIdx]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          if (phase === "work") setTotalWorkSeconds(t => t + tickedRef.current + 1);
          tickedRef.current = 0;
          if (autoAdvance) {
            advancePhase(phase);
            if (autoAdvance) setTimeout(() => setRunning(true), 100);
          } else {
            advancePhase(phase);
          }
          return 0;
        }
        tickedRef.current++;
        if (phase === "work") setTotalWorkSeconds(t => t + 1);
        return s - 1;
      });
    }, 1000);
    return clearTimer;
  }, [running, phase, autoAdvance, advancePhase]);

  const toggleRun = () => setRunning(r => !r);

  const reset = () => {
    clearTimer();
    setRunning(false);
    setPhase("work");
    setSecondsLeft(mode.work * 60);
    tickedRef.current = 0;
  };

  const skip = () => {
    if (phase === "work") setTotalWorkSeconds(t => t + tickedRef.current);
    advancePhase(phase);
  };

  const selectMode = (idx: number) => {
    clearTimer();
    setRunning(false);
    setModeIdx(idx);
    setPhase("work");
    setSecondsLeft(MODES[idx].work * 60);
    tickedRef.current = 0;
  };

  const workMinutes = Math.floor(totalWorkSeconds / 60);
  const BreakIcon = breakTip.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold">Focus Timer</h1>
          <p className="text-muted-foreground mt-1">ADHD-optimized work intervals. Short sprints, intentional breaks.</p>
        </div>
        <button onClick={() => setShowSettings(s => !s)} className="p-2.5 rounded-xl border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          {showSettings ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-card border rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="font-semibold">Settings</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Auto-advance</div>
              <div className="text-xs text-muted-foreground">Automatically start next phase when timer ends</div>
            </div>
            <button
              onClick={() => setAutoAdvance(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${autoAdvance ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoAdvance ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="grid grid-cols-4 gap-2">
        {MODES.map((m, i) => (
          <button
            key={m.label}
            onClick={() => selectMode(i)}
            className={`rounded-2xl border p-4 text-center transition-all space-y-1 ${modeIdx === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-accent/30"}`}
          >
            <div className={`text-sm font-bold ${modeIdx === i ? "text-primary" : ""}`}>{m.label}</div>
            <div className="text-xs text-muted-foreground font-mono">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ADHD note for selected mode */}
      <div className="text-xs text-center text-muted-foreground italic px-4">{mode.adhdNote}</div>

      {/* Timer ring */}
      <div className={`flex flex-col items-center gap-0 transition-all duration-300 ${flashBreak ? "scale-105" : ""}`}>
        <div className="relative">
          <CircleProgress progress={progress} phase={phase} size={280} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div className={`text-xs font-semibold uppercase tracking-widest ${phase === "work" ? "text-primary" : "text-emerald-400"}`}>
              {phase === "work" ? "Focus" : "Break"}
            </div>
            <div className="text-6xl font-mono font-bold tabular-nums tracking-tight">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-xs text-muted-foreground">
              {phase === "work" ? `${mode.work} min session` : `${mode.break} min break`}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="p-4 rounded-2xl border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleRun}
          className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
            phase === "work"
              ? "bg-primary text-primary-foreground"
              : "bg-emerald-500 text-white"
          }`}
        >
          {running
            ? <><Pause className="w-6 h-6" /> Pause</>
            : <><Play className="w-6 h-6" /> {secondsLeft === totalSeconds ? "Start" : "Resume"}</>
          }
        </button>

        <button
          onClick={skip}
          className="p-4 rounded-2xl border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Session stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-2xl p-4 text-center space-y-1">
          <div className="text-2xl font-bold font-serif text-primary">{sessionCount}</div>
          <div className="text-xs text-muted-foreground">Sessions done</div>
        </div>
        <div className="bg-card border rounded-2xl p-4 text-center space-y-1">
          <div className="text-2xl font-bold font-serif">{workMinutes}</div>
          <div className="text-xs text-muted-foreground">Minutes focused</div>
        </div>
        <div className="bg-card border rounded-2xl p-4 text-center space-y-1">
          <div className="text-2xl font-bold font-serif">{sessionCount > 0 ? sessionCount * mode.break : 0}</div>
          <div className="text-xs text-muted-foreground">Break minutes earned</div>
        </div>
      </div>

      {/* Break tip */}
      <div className={`rounded-2xl border p-5 space-y-3 transition-all duration-500 ${phase === "break" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card"}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BreakIcon className={`w-4 h-4 ${phase === "break" ? "text-emerald-400" : "text-muted-foreground"}`} />
          {phase === "break" ? "Your break activity" : "Next break suggestion"}
        </div>
        <p className={`text-sm leading-relaxed ${phase === "break" ? "text-foreground" : "text-muted-foreground"}`}>
          {breakTip.tip}
        </p>
        <button onClick={pickBreakTip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Different suggestion →
        </button>
      </div>

      {/* ADHD tip banner */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-2">
        <div className="text-sm font-semibold text-primary flex items-center gap-2">
          <Brain className="w-4 h-4" /> ADHD focus tips
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">→</span> If you can't start, try the Micro (10/2) mode first — just 10 minutes is enough to build momentum.</li>
          <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">→</span> The break is not optional. Your brain consolidates memory during breaks, not during work.</li>
          <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">→</span> If you're hyperfocusing and don't want to stop at the alarm — that's okay sometimes. But still take the break after the next session.</li>
          <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">→</span> Don't check your phone during breaks. A 5-minute doom scroll resets your focus state to zero.</li>
        </ul>
      </div>
    </div>
  );
}
