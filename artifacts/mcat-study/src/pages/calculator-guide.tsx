import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lightbulb, BookOpen, Target, Clock, TrendingUp, Zap, Star } from "lucide-react";

type Section = {
  id: string;
  name: string;
  abbr: string;
  mathLoad: "Heavy" | "Moderate" | "Light" | "None";
  color: string;
  accent: string;
  timeMinutes: number;
  questions: number;
  overview: string;
  mathTopics: { topic: string; withCalc: string; stillNeed: string }[];
  strategyShifts: string[];
  watchOut: string[];
  focusInstead: string[];
};

type Tip = { icon: typeof Lightbulb; title: string; body: string };

const SECTIONS: Section[] = [
  {
    id: "cp",
    name: "Chemical & Physical Foundations",
    abbr: "C/P",
    mathLoad: "Heavy",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    accent: "rose",
    timeMinutes: 95,
    questions: 59,
    overview: "This is the most math-intensive MCAT section. Without a calculator, test-takers must do complex arithmetic in their heads — logarithms, unit conversions, exponential math. With a calculator, you offload almost all computation and can spend your mental energy on the underlying physics and chemistry concepts. This is where your accommodation has the biggest impact.",
    mathTopics: [
      { topic: "pH & pKa calculations (log math)", withCalc: "Calculate exact pH values instantly. No more memorizing log approximations.", stillNeed: "Understand what pH means biologically and when Henderson-Hasselbalch applies." },
      { topic: "Pressure, force, work (physics formulas)", withCalc: "Plug numbers directly into F=ma, W=Fd, P=F/A without mental arithmetic.", stillNeed: "Know which formula to use. The calculator can't choose your equation for you." },
      { topic: "Snell's law, lens equations, optics", withCalc: "Solve 1/f = 1/do + 1/di without fraction gymnastics.", stillNeed: "Understand what focal length means, real vs. virtual images, converging vs. diverging." },
      { topic: "Electrochemistry (E°cell, Nernst)", withCalc: "Calculate cell potentials exactly instead of estimating.", stillNeed: "Know the Nernst equation, what spontaneous means (ΔG = -nFE), oxidation/reduction rules." },
      { topic: "Radioactive decay (half-life)", withCalc: "Calculate exact remaining amounts at any time point.", stillNeed: "Recognize first-order kinetics, understand the pattern without needing to compute it." },
      { topic: "Gibbs free energy (ΔG = ΔH - TΔS)", withCalc: "Plug in values with precision, especially at varying temperatures.", stillNeed: "Interpret what spontaneous/non-spontaneous means. Understand when temperature matters." },
      { topic: "Ideal gas law (PV=nRT)", withCalc: "Straightforward number substitution.", stillNeed: "Know when gases deviate from ideal behavior and why." },
      { topic: "Stoichiometry & mol calculations", withCalc: "Unit conversions, molar mass calculations, percent yield — all exact.", stillNeed: "Recognize limiting reagents conceptually. Set up the calculation correctly." },
    ],
    strategyShifts: [
      "Stop spending study time drilling log approximations (log 2 ≈ 0.3, etc.) — use that time on concepts instead.",
      "Practice setting up equations first, then inputting numbers. Most MCAT errors are setup errors, not arithmetic errors.",
      "Don't second-guess answers that feel too precise — your calculator gives you exact values, which is fine.",
      "For passage-based math, underline all given values before touching the calculator. Extract first, calculate second.",
      "Time is no longer your enemy for math questions. You may gain 2–4 minutes per section versus non-accommodated peers.",
    ],
    watchOut: [
      "The calculator doesn't tell you which formula to use — concept knowledge is still 100% required.",
      "Don't over-rely on the calculator for order-of-magnitude estimates. Sanity-check that your answer makes physical sense.",
      "Unit errors are still your problem. A calculator multiplying meters × kilograms gives a wrong answer confidently.",
      "Some C/P questions are purely conceptual and have no numbers at all — make sure you're not skipping those.",
    ],
    focusInstead: [
      "Master the conceptual 'why' behind each formula — MCAT asks you to apply, not just calculate.",
      "Practice identifying which variables in a passage correspond to which formula terms.",
      "Understand the physics intuition: pressure increases with depth because of weight, not formula memorization.",
      "Study periodic trends, acid-base theory, and thermodynamic principles conceptually.",
    ],
  },
  {
    id: "bb",
    name: "Biological & Biochemical Foundations",
    abbr: "B/B",
    mathLoad: "Moderate",
    color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    accent: "violet",
    timeMinutes: 95,
    questions: 59,
    overview: "B/B has less calculation-heavy math than C/P, but still has meaningful quantitative components. Enzyme kinetics, genetics ratios, Mendelian probability, and some thermodynamics appear here. The calculator helps most with Michaelis-Menten math and probability calculations that would otherwise require tedious mental arithmetic.",
    mathTopics: [
      { topic: "Enzyme kinetics (Km, Vmax, Michaelis-Menten)", withCalc: "Calculate exact Km from Lineweaver-Burk intercepts, solve for substrate concentration at half-Vmax.", stillNeed: "Interpret what Km means about affinity, recognize competitive vs. non-competitive inhibition from graphs." },
      { topic: "Genetics & Mendelian probability", withCalc: "Calculate exact probabilities for dihybrid crosses and chi-square tests.", stillNeed: "Understand dominance, incomplete dominance, epistasis, and how to set up a Punnett square." },
      { topic: "Hardy-Weinberg (p² + 2pq + q²)", withCalc: "Solve for exact allele frequencies quickly.", stillNeed: "Know the 5 assumptions of HWE and what violating each assumption implies." },
      { topic: "Thermodynamics (ΔG, Keq, Q)", withCalc: "Calculate ΔG = ΔG° + RT ln Q with precision.", stillNeed: "Understand Le Chatelier's principle and how Q vs. K predicts reaction direction." },
      { topic: "Buffer & pH in biological contexts", withCalc: "Solve Henderson-Hasselbalch for exact pH.", stillNeed: "Understand why blood must maintain pH 7.4 and how bicarbonate buffering works physiologically." },
    ],
    strategyShifts: [
      "Use the calculator for any multi-step probability calculation — Mendelian genetics can chain several fractions.",
      "On enzyme kinetics graph questions, use the calculator to verify your interpretation of Km from the Michaelis-Menten curve.",
      "Hardy-Weinberg: calculate both p and q values explicitly rather than estimating — small errors compound.",
      "Shift your B/B study time from arithmetic practice to understanding metabolic pathways (glycolysis, TCA, etc.).",
    ],
    watchOut: [
      "Most B/B passages are conceptual and diagram-heavy — don't let the calculator become a crutch for passages that need interpretation, not calculation.",
      "Lineweaver-Burk plots require you to correctly identify axes and intercepts — the calculator does the algebra, not the graph reading.",
      "Genetic probability questions may have multiple possible setups — make sure you've identified the right cross before calculating.",
    ],
    focusInstead: [
      "Master metabolic pathway flow (glycolysis → TCA → ETC) conceptually — this is frequently tested and needs no calculator.",
      "Study cellular signaling, gene expression regulation, and cell cycle checkpoints — all conceptual.",
      "Understand protein structure and function without relying on any calculations.",
      "Learn to read experimental figures quickly — most B/B passages test data interpretation, not math.",
    ],
  },
  {
    id: "cars",
    name: "Critical Analysis & Reasoning Skills",
    abbr: "CARS",
    mathLoad: "None",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    accent: "amber",
    timeMinutes: 90,
    questions: 53,
    overview: "CARS has zero math. No numbers, no formulas, no calculations whatsoever. Your calculator accommodation has no direct impact on this section. CARS is a pure reading comprehension and critical reasoning section — it tests your ability to understand arguments, identify main ideas, evaluate evidence, and make inferences from dense humanities and social science passages.",
    mathTopics: [],
    strategyShifts: [
      "Your calculator accommodation gives you no advantage here — treat CARS as a separate challenge entirely.",
      "Use any time savings from C/P or B/B to practice CARS more, since it requires a different skillset entirely.",
      "The extended time accommodation (if you have it) matters more for CARS than the calculator.",
    ],
    watchOut: [
      "Don't let confidence from math sections carry over — CARS requires a completely different mental approach.",
      "CARS passages can feel unfamiliar (philosophy, art history, sociology) — that discomfort is intentional.",
      "Many ADHD test-takers find CARS the most difficult section because it requires sustained attention without the structure of formulas.",
    ],
    focusInstead: [
      "Practice active reading: summarize each paragraph in one sentence as you read.",
      "Learn to identify the author's argument/thesis and their attitude toward it.",
      "Practice with dense passages from The Economist, academic journals, or AAMC CARS Qpacks.",
      "Focus on question stems — 'the author would most likely agree' vs. 'the passage implies' require different approaches.",
    ],
  },
  {
    id: "ps",
    name: "Psychological, Social & Biological Foundations",
    abbr: "P/S",
    mathLoad: "Light",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    accent: "emerald",
    timeMinutes: 95,
    questions: 59,
    overview: "P/S is primarily a memorization and conceptual section. The math that appears is minimal — mostly simple statistics interpretation (mean, standard deviation, correlation coefficients) and basic research design math. Your calculator accommodation provides modest help here, mostly for statistics-related questions in research passages.",
    mathTopics: [
      { topic: "Basic statistics (mean, SD, z-scores)", withCalc: "Calculate exact means and z-scores from data tables.", stillNeed: "Interpret what standard deviation and effect size mean conceptually." },
      { topic: "Research design (effect size, confidence intervals)", withCalc: "Compute effect size values if given raw data.", stillNeed: "Know the difference between statistical significance and clinical significance." },
      { topic: "Correlation coefficients (r values)", withCalc: "Verify r² calculations for variance explained.", stillNeed: "Understand what r = -0.8 means practically and when correlation ≠ causation." },
    ],
    strategyShifts: [
      "P/S math is minimal — spend the vast majority of your P/S prep on vocabulary and concept memorization.",
      "The calculator is most useful for the 3–5 research statistics questions that appear per exam.",
      "Use extra time from C/P math fluency to drill the hundreds of P/S terms (Piaget, Freud, Erikson, Vygotsky, etc.).",
    ],
    watchOut: [
      "P/S is a vocabulary-heavy section — not knowing what 'operant conditioning' or 'social facilitation' means will cost you more points than arithmetic.",
      "Research method questions are common — understanding independent vs. dependent variables, control groups, and confounds is conceptual, not mathematical.",
    ],
    focusInstead: [
      "Memorize the major developmental, personality, and social psychology theories and their key figures.",
      "Study health disparities, social determinants of health, and socioeconomic factors in medicine — heavily tested.",
      "Understand sensation/perception, memory models, and language acquisition.",
      "Learn neuroscience basics: neurotransmitters, brain regions, sleep stages, and the stress response.",
    ],
  },
];

const OVERALL_TIPS: Tip[] = [
  {
    icon: Target,
    title: "Your calculator is a scalpel, not a crutch",
    body: "The MCAT is designed to test whether you understand science — not whether you can do arithmetic. With a calculator, you have an advantage on computation, but every question still requires you to choose the right formula, interpret the result, and apply it to a biological or physical scenario. Conceptual understanding is still the majority of the exam.",
  },
  {
    icon: Clock,
    title: "Time allocation shifts dramatically",
    body: "Without a calculator, a C/P log problem might take 90 seconds of mental math. With one, it takes 15 seconds. Across a 59-question section, this can free up 5–10 minutes — time you can reinvest in re-reading confusing passages or double-checking your work. Use this strategically.",
  },
  {
    icon: TrendingUp,
    title: "Focus your prep on what the calculator CAN'T do",
    body: "Stop drilling log approximations and mental arithmetic tricks. Redirect all that study time to conceptual mastery: mechanisms of action, pathway flow, research design, and passage interpretation. The calculator already handles the computation — your bottleneck is now 100% conceptual.",
  },
  {
    icon: Zap,
    title: "Set up before you calculate",
    body: "The most common mistake with a calculator on the MCAT is calculating the wrong thing accurately. Extract all values from the passage first, identify the formula, set up the expression, THEN calculate. A calculator gives you a confident wrong answer if you input wrong numbers.",
  },
  {
    icon: Star,
    title: "Practice WITH the calculator in all prep",
    body: "Do all your MCAT practice using the same calculator you'll use on test day. Build fluency with its specific interface. Don't practice mental math tricks you'll never use — practice the workflow of reading a passage, extracting values, and entering them correctly under time pressure.",
  },
  {
    icon: BookOpen,
    title: "What you still need to memorize (no shortcut)",
    body: "Amino acid structures, pKa values of common acids, oxidation states, reduction potentials, Michaelis-Menten shapes, Hardy-Weinberg setup, genetic cross patterns, major metabolic pathways, organ functions, neurotransmitter effects, psychological theory key figures, and statistical concept interpretations. The calculator helps with numbers — not with recognizing which concept applies.",
  },
];

const MATH_LOAD_CONFIG = {
  Heavy: { color: "text-rose-400 bg-rose-400/10 border-rose-400/20", bar: "bg-rose-400", width: "w-full" },
  Moderate: { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", bar: "bg-amber-400", width: "w-2/3" },
  Light: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", bar: "bg-blue-400", width: "w-1/4" },
  None: { color: "text-muted-foreground bg-muted/30 border-border", bar: "bg-muted", width: "w-0" },
};

export default function CalculatorGuidePage() {
  const [openSection, setOpenSection] = useState<string | null>("cp");
  const [openTip, setOpenTip] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold">MCAT with a Calculator</h1>
            <p className="text-muted-foreground mt-0.5">A complete strategy guide for navigating every section with your calculator accommodation.</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
          <div className="font-semibold text-primary flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Your accommodation is legitimate and powerful</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A calculator accommodation on the MCAT — typically granted for dyscalculia, ADHD affecting numerical processing, or other math-related disabilities — removes the arithmetic barrier that would otherwise mask your understanding of science concepts. The MCAT is designed to test scientific reasoning, not mental arithmetic. Your accommodation levels the playing field so your actual knowledge can show through.
          </p>
        </div>
      </header>

      {/* Section overview bar chart */}
      <div className="bg-card border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-lg font-serif">Math Load by Section</h2>
        <div className="space-y-4">
          {SECTIONS.map(s => {
            const cfg = MATH_LOAD_CONFIG[s.mathLoad];
            return (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.abbr}</span>
                    <span className="text-muted-foreground hidden sm:inline">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.timeMinutes} min · {s.questions} Qs</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>{s.mathLoad}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar} ${cfg.width}`} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">C/P benefits most from calculator access. CARS has no math at all.</p>
      </div>

      {/* Section breakdowns */}
      <div className="space-y-4">
        <h2 className="font-semibold text-xl font-serif">Section-by-Section Breakdown</h2>
        {SECTIONS.map(s => {
          const isOpen = openSection === s.id;
          return (
            <div key={s.id} className="bg-card border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(isOpen ? null : s.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-accent/20 transition-colors text-left gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`text-sm font-bold px-3 py-1 rounded-xl border ${MATH_LOAD_CONFIG[s.mathLoad].color}`}>{s.abbr}</div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.timeMinutes} min · {s.questions} questions · Math load: <span className="font-medium">{s.mathLoad}</span></div>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="h-px bg-border" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.overview}</p>

                  {/* Math topics table */}
                  {s.mathTopics.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Math Topics & Calculator Impact</h3>
                      <div className="space-y-3">
                        {s.mathTopics.map(t => (
                          <div key={t.topic} className="bg-background rounded-xl border p-4 space-y-3">
                            <div className="font-medium text-sm">{t.topic}</div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Calculator handles</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{t.withCalc}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> You still need to know</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{t.stillNeed}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.mathTopics.length === 0 && (
                    <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground">
                      No math content in this section. Your calculator accommodation does not directly impact CARS.
                    </div>
                  )}

                  <div className="grid sm:grid-cols-3 gap-4">
                    {/* Strategy shifts */}
                    {s.strategyShifts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-primary flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Strategy shifts</div>
                        <ul className="space-y-2">
                          {s.strategyShifts.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                              <span className="text-primary shrink-0 mt-0.5">→</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Watch out */}
                    {s.watchOut.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Watch out for</div>
                        <ul className="space-y-2">
                          {s.watchOut.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                              <span className="text-rose-400 shrink-0 mt-0.5">!</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Focus instead */}
                    {s.focusInstead.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-violet-400 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> Focus your study on</div>
                        <ul className="space-y-2">
                          {s.focusInstead.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                              <span className="text-violet-400 shrink-0 mt-0.5">◆</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall strategy tips */}
      <div className="space-y-4">
        <h2 className="font-semibold text-xl font-serif">Overall Strategy</h2>
        <div className="space-y-3">
          {OVERALL_TIPS.map((tip, i) => {
            const Icon = tip.icon;
            const isOpen = openTip === i;
            return (
              <button
                key={i}
                onClick={() => setOpenTip(isOpen ? null : i)}
                className="w-full bg-card border rounded-2xl overflow-hidden text-left hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm flex-1">{tip.title}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>
                {isOpen && (
                  <div className="px-5 pb-4 animate-in fade-in duration-150">
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score impact summary */}
      <div className="bg-card border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg font-serif flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Expected Score Impact by Section</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-bold text-rose-400 w-8 shrink-0">C/P</span>
              <div>
                <div className="font-medium">Highest impact</div>
                <p className="text-xs text-muted-foreground mt-0.5">Every quantitative question becomes accessible. Students with dyscalculia often see 2–4 point score improvements on C/P with calculator access.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-violet-400 w-8 shrink-0">B/B</span>
              <div>
                <div className="font-medium">Moderate impact</div>
                <p className="text-xs text-muted-foreground mt-0.5">Enzyme kinetics, HWE, and genetics calculations become more accurate. Impact is smaller than C/P since B/B is more conceptual overall.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-bold text-emerald-400 w-8 shrink-0">P/S</span>
              <div>
                <div className="font-medium">Small impact</div>
                <p className="text-xs text-muted-foreground mt-0.5">Helps with the few statistics questions per exam, but P/S is overwhelmingly vocabulary and concept-based.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-amber-400 w-8 shrink-0">CARS</span>
              <div>
                <div className="font-medium">No direct impact</div>
                <p className="text-xs text-muted-foreground mt-0.5">Zero math. However, if extended time is also part of your accommodation package, that helps significantly on CARS.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom callout */}
      <div className="bg-card border rounded-2xl p-6 space-y-3">
        <div className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="w-4 h-4" /> The bottom line</div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A calculator accommodation doesn't make the MCAT easier — it makes it <em>fair</em>. The exam was always designed to test scientific reasoning, not mental arithmetic. With your accommodation, you can demonstrate what you actually know. Redirect every minute you'd have spent on arithmetic drills to conceptual mastery, passage analysis, and practice with your specific calculator. That's where the real score gains are.
        </p>
      </div>
    </div>
  );
}
