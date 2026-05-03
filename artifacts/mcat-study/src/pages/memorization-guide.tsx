import { useState } from "react";
import { Brain, Zap, Calculator, Lightbulb, ChevronDown, ChevronUp, CheckCircle, Filter } from "lucide-react";

type Priority = "must" | "understand" | "calc" | "skip";

type MemItem = {
  item: string;
  detail?: string;
  priority: Priority;
  mnemonic?: string;
};

type MemCategory = {
  name: string;
  items: MemItem[];
};

type SectionData = {
  id: string;
  abbr: string;
  name: string;
  color: string;
  categories: MemCategory[];
};

const PRIORITY_CONFIG: Record<Priority, { label: string; short: string; icon: typeof Zap; color: string; bg: string; border: string }> = {
  must:       { label: "Must Know Cold",        short: "Must",      icon: Zap,         color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/30" },
  understand: { label: "Understand Conceptually",short: "Concept",  icon: Lightbulb,   color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30" },
  calc:       { label: "Calculator Handles It", short: "Calc",      icon: Calculator,  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  skip:       { label: "Don't Waste Time On",   short: "Skip",      icon: CheckCircle, color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border" },
};

const SECTIONS: SectionData[] = [
  {
    id: "cp",
    abbr: "C/P",
    name: "Chemical & Physical Foundations",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    categories: [
      {
        name: "Amino Acids",
        items: [
          { item: "The 20 amino acids — names, 3-letter codes, 1-letter codes", detail: "You need all three. The 1-letter codes appear in passages frequently.", priority: "must", mnemonic: "Groups: Charged (Asp, Glu, Arg, Lys, His), Polar (Ser, Thr, Asn, Gln, Tyr, Cys), Nonpolar (Gly, Ala, Val, Leu, Ile, Pro, Met, Phe, Trp)" },
          { item: "Which AAs are positively charged at physiological pH", detail: "Arg, Lys, His (remember: His is +/neutral around pH 6, fully + below)", priority: "must", mnemonic: "ARG KIDS HAVE fun (Arg, Lys, His)" },
          { item: "Which AAs are negatively charged at physiological pH", detail: "Asp and Glu — the acidic amino acids", priority: "must" },
          { item: "Nonpolar / hydrophobic AAs", detail: "Gly, Ala, Val, Leu, Ile, Pro, Met, Phe, Trp — these fold to protein interior", priority: "must", mnemonic: "GAVLIMPFT — Gly Ala Val Leu Ile Met Pro Phe Trp" },
          { item: "Which AAs are aromatic", detail: "Phe, Tyr, Trp (and His, depending on context)", priority: "must" },
          { item: "Cysteine's special property", detail: "Forms disulfide bonds — crucial for protein tertiary structure", priority: "must" },
          { item: "Proline's special property", detail: "Introduces kinks/breaks in alpha helices due to its ring structure", priority: "must" },
          { item: "Exact pKa values of all side chains", detail: "MCAT gives pKa in passages when it needs exact values", priority: "skip" },
          { item: "Drawing full structural formulas from scratch", priority: "skip", detail: "MCAT does not ask you to draw structures" },
        ],
      },
      {
        name: "Acid-Base Chemistry",
        items: [
          { item: "pH = -log[H⁺]  and  pOH = -log[OH⁻]", priority: "must" },
          { item: "pH + pOH = 14 at 25°C", priority: "must" },
          { item: "Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA])", priority: "must" },
          { item: "Strong acids (HCl, HBr, HI, H₂SO₄, HNO₃, HClO₄)", detail: "These fully dissociate — critical for titration and buffer questions", priority: "must" },
          { item: "Strong bases (NaOH, KOH, Ca(OH)₂)", priority: "must" },
          { item: "At half-equivalence point: pH = pKa", priority: "must" },
          { item: "Buffering capacity is maximal when pH ≈ pKa", priority: "must" },
          { item: "pKa of carbonic acid/bicarbonate (≈6.1 and ≈10.3)", detail: "Physiologically critical for blood buffering", priority: "must" },
          { item: "Exact log calculations", detail: "Your calculator handles this — just know the equation and what the result means", priority: "calc" },
          { item: "Ka × Kb = Kw = 1×10⁻¹⁴", priority: "understand" },
        ],
      },
      {
        name: "Thermodynamics & Kinetics",
        items: [
          { item: "ΔG = ΔH − TΔS", priority: "must" },
          { item: "ΔG < 0 = spontaneous (exergonic)", priority: "must" },
          { item: "ΔG = ΔG° + RT ln Q", priority: "must" },
          { item: "ΔG° = −RT ln Keq", priority: "must" },
          { item: "ΔG° = −nFE°cell", priority: "must" },
          { item: "Activation energy and how catalysts lower it (not ΔG)", priority: "must" },
          { item: "Endothermic = absorbs heat (ΔH > 0); exothermic = releases (ΔH < 0)", priority: "must" },
          { item: "Rate laws (rate = k[A]^m[B]^n)", detail: "Know first-order vs. second-order vs. zero-order behavior and their graphs", priority: "must" },
          { item: "Half-life equation for first-order: t½ = 0.693/k", priority: "must" },
          { item: "Arrhenius equation: k = Ae^(-Ea/RT)", detail: "Understand what it means — higher temp = higher rate constant", priority: "understand" },
          { item: "Calculating exact ΔG values from numbers", priority: "calc" },
        ],
      },
      {
        name: "Electrochemistry",
        items: [
          { item: "Oxidation = loss of electrons (OIL), Reduction = gain (RIG)", priority: "must", mnemonic: "OIL RIG — Oxidation Is Loss, Reduction Is Gain" },
          { item: "Anode = oxidation, Cathode = reduction", priority: "must", mnemonic: "Red Cat, An Ox — Reduction at Cathode, Oxidation at Anode" },
          { item: "E°cell = E°cathode − E°anode", priority: "must" },
          { item: "Positive E°cell = spontaneous reaction", priority: "must" },
          { item: "Nernst equation: E = E° − (RT/nF)lnQ", priority: "understand" },
          { item: "Faraday's constant (96,485 C/mol)", detail: "Know what it is conceptually — the value is provided when needed", priority: "understand" },
          { item: "Memorizing a long list of standard reduction potentials", detail: "MCAT provides these in passages when needed", priority: "skip" },
          { item: "Exact Nernst calculations", priority: "calc" },
        ],
      },
      {
        name: "Optics & Waves",
        items: [
          { item: "Snell's Law: n₁sinθ₁ = n₂sinθ₂", priority: "must" },
          { item: "Thin lens equation: 1/f = 1/do + 1/di", priority: "must" },
          { item: "Magnification: m = −di/do = hi/ho", priority: "must" },
          { item: "Converging (convex) lens → real image if object beyond focal point", priority: "must" },
          { item: "Diverging (concave) lens → always virtual, upright image", priority: "must" },
          { item: "Electromagnetic spectrum order (low to high freq): Radio, Micro, IR, Visible, UV, X-ray, Gamma", priority: "must", mnemonic: "R M I V U X G — 'Real Men In Vegas Use Xtra Gambling'" },
          { item: "Visible light: ROY G BIV (Red = longest wavelength, Violet = shortest)", priority: "must" },
          { item: "c = λf (speed of light = wavelength × frequency)", priority: "must" },
          { item: "E = hf (Planck's equation — energy of photon)", priority: "must" },
          { item: "Exact lens calculations", priority: "calc" },
        ],
      },
      {
        name: "Physics: Mechanics & Fluids",
        items: [
          { item: "F = ma  |  W = mg  |  p = mv  |  KE = ½mv²", priority: "must" },
          { item: "W = Fd cosθ  |  PE = mgh", priority: "must" },
          { item: "Power = W/t = Fv", priority: "must" },
          { item: "Pressure = F/A  |  P = ρgh (fluid pressure)", priority: "must" },
          { item: "Bernoulli: P + ½ρv² + ρgh = constant", priority: "must" },
          { item: "Continuity: A₁v₁ = A₂v₂", priority: "must" },
          { item: "Archimedes: buoyant force = weight of displaced fluid", priority: "must" },
          { item: "Ohm's Law: V = IR  |  P = IV = I²R = V²/R", priority: "must" },
          { item: "Resistors in series: R_total = R₁ + R₂  |  Parallel: 1/R = 1/R₁ + 1/R₂", priority: "must" },
          { item: "All numerical calculations from above", priority: "calc" },
        ],
      },
      {
        name: "Organic Chemistry",
        items: [
          { item: "Common functional groups: alcohol, aldehyde, ketone, carboxylic acid, amine, ester, amide, ether, alkene, alkyne", priority: "must" },
          { item: "Nucleophile = electron-rich, attacks electrophiles. Electrophile = electron-poor.", priority: "must" },
          { item: "SN1 vs. SN2: SN2 = backside attack, inverts, 2° or 1°, strong nucleophile. SN1 = carbocation intermediate, 3°, racemic product.", priority: "must" },
          { item: "E1 vs. E2 (elimination reactions — same substrate factors as SN)", priority: "must" },
          { item: "Aldehydes vs. Ketones — aldehyde is more reactive (less steric hindrance)", priority: "must" },
          { item: "Resonance stabilization of carboxylate, phenol, enolate", priority: "must" },
          { item: "Chirality: R/S configuration, enantiomers, diastereomers, meso compounds", priority: "must" },
          { item: "Full mechanism arrow-pushing for all reactions", detail: "MCAT rarely asks for complete mechanisms — it asks you to identify products or compare reactivity", priority: "skip" },
          { item: "Memorizing every named reaction (Grignard, Diels-Alder, etc.) in full detail", detail: "Know the product type and general conditions — don't memorize every step", priority: "skip" },
        ],
      },
    ],
  },
  {
    id: "bb",
    abbr: "B/B",
    name: "Biological & Biochemical Foundations",
    color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    categories: [
      {
        name: "Metabolic Pathways",
        items: [
          { item: "Glycolysis: glucose → 2 pyruvate (net: 2 ATP, 2 NADH)", detail: "Know where it happens (cytoplasm), key enzymes (hexokinase, PFK-1, pyruvate kinase), and regulation (PFK-1 is the key control point)", priority: "must" },
          { item: "TCA cycle: acetyl-CoA → 3 NADH, 1 FADH₂, 1 GTP, 2 CO₂ per turn", detail: "Know where (mitochondrial matrix), key regulated enzymes (isocitrate dehydrogenase), and that 2 turns occur per glucose", priority: "must" },
          { item: "ETC: NADH → 2.5 ATP, FADH₂ → 1.5 ATP (approximately)", detail: "Complexes I-IV transfer electrons, Complex V makes ATP. O₂ is final electron acceptor.", priority: "must" },
          { item: "Net ATP from 1 glucose: ~30–32 ATP", priority: "must" },
          { item: "Fatty acid oxidation: occurs in mitochondria, produces acetyl-CoA + NADH + FADH₂", detail: "Even-chain fatty acids → only acetyl-CoA. Odd-chain → propionyl-CoA at the end.", priority: "must" },
          { item: "Gluconeogenesis: mostly in liver, uses pyruvate/lactate/glycerol/amino acids", detail: "Reciprocally regulated with glycolysis — when one is on, the other is off", priority: "must" },
          { item: "Glycogen synthesis (glycogenesis) vs. breakdown (glycogenolysis)", detail: "Liver: maintains blood glucose. Muscle: uses for itself only.", priority: "must" },
          { item: "Ketogenesis: occurs in liver during starvation — produces ketone bodies (acetoacetate, β-hydroxybutyrate)", priority: "must" },
          { item: "Memorizing every enzyme in every pathway", detail: "Know the 2–3 regulatory enzymes per pathway — not every single enzyme", priority: "skip" },
        ],
      },
      {
        name: "Enzyme Kinetics",
        items: [
          { item: "Michaelis-Menten equation: v = Vmax[S] / (Km + [S])", priority: "must" },
          { item: "Km = [S] at ½ Vmax (lower Km = higher affinity)", priority: "must" },
          { item: "Competitive inhibition: Km↑, Vmax unchanged", priority: "must" },
          { item: "Non-competitive inhibition: Vmax↓, Km unchanged", priority: "must" },
          { item: "Uncompetitive inhibition: both Km↓ and Vmax↓", priority: "must" },
          { item: "Lineweaver-Burk plot: x-intercept = -1/Km, y-intercept = 1/Vmax", priority: "must" },
          { item: "Allosteric enzymes: sigmoidal curve (not hyperbolic), cooperative binding", priority: "must" },
          { item: "Calculating exact Km from data tables", priority: "calc" },
        ],
      },
      {
        name: "DNA, RNA & Protein Synthesis",
        items: [
          { item: "DNA: double-stranded, antiparallel, A=T (2 H-bonds), G≡C (3 H-bonds)", priority: "must" },
          { item: "DNA replication is semiconservative, bidirectional, starts at origin", priority: "must" },
          { item: "Leading strand (continuous) vs. lagging strand (Okazaki fragments)", priority: "must" },
          { item: "Helicase (unwinds), Primase (RNA primer), DNA Pol III (synthesis), DNA Pol I (removes primers), Ligase (seals)", priority: "must", mnemonic: "HPPPL — Helicase, Primase, Pol III, Pol I, Ligase" },
          { item: "Transcription: DNA → pre-mRNA → mRNA (processed: 5' cap, poly-A tail, splicing)", priority: "must" },
          { item: "Translation: mRNA → protein at ribosome. tRNA carries amino acids.", priority: "must" },
          { item: "Start codon: AUG (Met). Stop codons: UAA, UAG, UGA", priority: "must", mnemonic: "Stop codons: UAA (United Airlines Arrives), UAG (United Airlines Goes), UGA (United Goes Away)" },
          { item: "Prokaryotes vs. Eukaryotes: prokaryotes no nucleus, 70S ribosomes, operons. Eukaryotes: 80S, no operons.", priority: "must" },
          { item: "Memorizing the full genetic code table", detail: "Passages provide codon tables when needed", priority: "skip" },
        ],
      },
      {
        name: "Cell Biology",
        items: [
          { item: "Mitosis stages: PMAT (Prophase, Metaphase, Anaphase, Telophase)", priority: "must", mnemonic: "PMAT — 'People Meet And Talk'" },
          { item: "Meiosis produces 4 haploid cells with genetic variation (crossing over in Prophase I)", priority: "must" },
          { item: "Cell cycle checkpoints: G1 (Restriction), G2, Spindle Assembly checkpoint", priority: "must" },
          { item: "Cyclin-CDK complexes drive the cell cycle", priority: "must" },
          { item: "Organelle functions: ER (rough = protein synthesis, smooth = lipid/detox), Golgi (sorting/shipping), Lysosome (degradation), Mitochondria (ATP), Peroxisome (fatty acid oxidation, H₂O₂)", priority: "must" },
          { item: "Signal transduction: RTK → Ras → MAPK; GPCR → adenylyl cyclase → cAMP → PKA; IP3/DAG pathway", priority: "must" },
          { item: "Apoptosis: intrinsic (mitochondria/cytochrome c) vs. extrinsic (death receptor) pathways. Caspases execute it.", priority: "must" },
        ],
      },
      {
        name: "Genetics",
        items: [
          { item: "Autosomal dominant: every generation affected, 50% chance if one parent affected", priority: "must" },
          { item: "Autosomal recessive: skip generations, carriers, 25% affected if both parents carriers", priority: "must" },
          { item: "X-linked recessive: males affected more, carrier females, no father-to-son transmission", priority: "must" },
          { item: "Hardy-Weinberg: p + q = 1 and p² + 2pq + q² = 1. 5 assumptions.", priority: "must" },
          { item: "Incomplete dominance vs. codominance", detail: "Incomplete = blend. Codominance = both expressed fully (ABO blood type)", priority: "must" },
          { item: "Epistasis: one gene masks expression of another", priority: "must" },
          { item: "HWE allele frequency calculations", priority: "calc" },
        ],
      },
      {
        name: "Physiology",
        items: [
          { item: "Cardiac output = heart rate × stroke volume", priority: "must" },
          { item: "Starling's Law: increased venous return → increased stroke volume", priority: "must" },
          { item: "Oxygen-hemoglobin dissociation curve shifts: Right shift (Bohr effect — ↑CO₂, ↑temp, ↑2,3-BPG, ↓pH) = ↓O₂ affinity", priority: "must", mnemonic: "CADET, right face! (CO₂, Acid, 2,3-DPG, Exercise, Temp → Right shift)" },
          { item: "Kidney: PCT reabsorbs ~65% of filtered Na+/water; Loop of Henle concentrates urine; DCT = regulated by aldosterone; Collecting duct = regulated by ADH", priority: "must" },
          { item: "GFR, filtration fraction, and renal clearance concepts", priority: "understand" },
          { item: "Respiratory: TV, IRV, ERV, RV, FRC, VC, TLC definitions", detail: "Know which can and can't be measured by spirometry (RV and FRC cannot)", priority: "must" },
          { item: "Ventilation-perfusion matching (V/Q ratio): apex V/Q > 1, base V/Q < 1", priority: "must" },
          { item: "Neurotransmitters in ANS: sympathetic = NE (except sweat glands = ACh), parasympathetic = ACh", priority: "must" },
        ],
      },
    ],
  },
  {
    id: "ps",
    abbr: "P/S",
    name: "Psychological, Social & Biological Foundations",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    categories: [
      {
        name: "Developmental Psychology",
        items: [
          { item: "Piaget's stages: Sensorimotor (0–2), Preoperational (2–7), Concrete Operational (7–11), Formal Operational (11+)", detail: "Key concept per stage: object permanence, egocentrism/symbolic thought, conservation, abstract reasoning", priority: "must", mnemonic: "Some People Can Fly — Sensorimotor, Preoperational, Concrete, Formal" },
          { item: "Erikson's 8 stages with core conflict at each", detail: "Trust vs. Mistrust (infant), Autonomy vs. Shame (toddler), Initiative vs. Guilt, Industry vs. Inferiority, Identity vs. Confusion (adolescence), Intimacy vs. Isolation, Generativity vs. Stagnation, Integrity vs. Despair", priority: "must" },
          { item: "Vygotsky: Zone of Proximal Development (ZPD) and scaffolding", priority: "must" },
          { item: "Kohlberg's stages of moral development: Pre-conventional, Conventional, Post-conventional", priority: "must" },
          { item: "Attachment styles: secure, anxious-ambivalent, avoidant, disorganized", priority: "must" },
          { item: "Memorizing every detail of every Piaget experiment", detail: "Know the key concept per stage — not every classic study name", priority: "skip" },
        ],
      },
      {
        name: "Learning & Memory",
        items: [
          { item: "Classical conditioning: NS + UCS → UCR, then NS → CS → CR", detail: "Pavlov's dogs. Key concepts: extinction, spontaneous recovery, generalization, discrimination", priority: "must" },
          { item: "Operant conditioning: Positive reinforcement (+stim), Negative reinforcement (–stim), Positive punishment (+stim), Negative punishment (–stim)", priority: "must", mnemonic: "+reinforcement adds what the person wants. -punishment removes what they want. Both increase behavior." },
          { item: "Fixed ratio vs. variable ratio vs. fixed interval vs. variable interval schedules", detail: "Variable ratio = most resistant to extinction (think slot machines)", priority: "must" },
          { item: "Observational learning (Bandura's Bobo doll) — learn by watching", priority: "must" },
          { item: "Memory stages: Sensory → STM (7±2 items, ~30 sec) → LTM", priority: "must" },
          { item: "Types of LTM: Explicit (episodic = personal events, semantic = facts) vs. Implicit (procedural, priming, conditioning)", priority: "must" },
          { item: "Working memory model (Baddeley): phonological loop, visuospatial sketchpad, central executive", priority: "understand" },
        ],
      },
      {
        name: "Neuroscience",
        items: [
          { item: "Neurotransmitters: Dopamine (reward, motor), Serotonin (mood, sleep, appetite), Norepinephrine (alertness, fight-or-flight), GABA (inhibitory), Glutamate (excitatory), Acetylcholine (muscle, memory), Endorphins (pain relief)", priority: "must" },
          { item: "Brain regions: Frontal lobe (executive function, personality, motor), Parietal (somatosensory, spatial), Temporal (auditory, language, memory), Occipital (vision)", priority: "must" },
          { item: "Limbic system: Amygdala (emotion/fear), Hippocampus (memory consolidation), Hypothalamus (homeostasis, hormones)", priority: "must" },
          { item: "Action potential: resting = −70 mV, depolarization (Na+ in), repolarization (K+ out), hyperpolarization (K+ overshoots)", priority: "must" },
          { item: "Absolute refractory period vs. relative refractory period", priority: "must" },
          { item: "Sleep stages: N1, N2, N3 (slow-wave/SWS), REM (dreaming, paradoxical sleep)", priority: "must" },
          { item: "Broca's area (speech production) vs. Wernicke's area (language comprehension)", priority: "must" },
        ],
      },
      {
        name: "Social Psychology",
        items: [
          { item: "Attribution theory: dispositional (internal) vs. situational (external) attributions", priority: "must" },
          { item: "Fundamental attribution error: overestimate dispositional, underestimate situational for others' behavior", priority: "must" },
          { item: "Actor-observer bias: we attribute own behavior situationally, others' dispositionally", priority: "must" },
          { item: "Self-serving bias: successes = dispositional, failures = situational", priority: "must" },
          { item: "Cognitive dissonance: discomfort from conflicting beliefs → attitude change", priority: "must" },
          { item: "Social facilitation: perform better on easy tasks with audience, worse on hard tasks", priority: "must" },
          { item: "Social loafing: less effort in groups than alone", priority: "must" },
          { item: "Groupthink: group maintains cohesion over critical analysis", priority: "must" },
          { item: "Deindividuation: loss of self-awareness in groups → uninhibited behavior", priority: "must" },
          { item: "Bystander effect: less likely to help when others present (diffusion of responsibility)", priority: "must" },
          { item: "Milgram (obedience), Asch (conformity), Zimbardo (situational forces)", priority: "must" },
          { item: "Prejudice vs. stereotyping vs. discrimination", detail: "Prejudice = attitude. Stereotype = belief. Discrimination = behavior.", priority: "must" },
          { item: "In-group bias, out-group homogeneity, ethnocentrism", priority: "must" },
        ],
      },
      {
        name: "Personality & Motivation",
        items: [
          { item: "Freud's structure: Id (pleasure principle), Ego (reality principle), Superego (morality)", priority: "must" },
          { item: "Freud's defense mechanisms: repression, denial, projection, displacement, rationalization, sublimation, reaction formation, regression", priority: "must", mnemonic: "R D P D R S R R" },
          { item: "Maslow's hierarchy: Physiological → Safety → Love/Belonging → Esteem → Self-actualization", priority: "must" },
          { item: "Intrinsic vs. extrinsic motivation. Overjustification effect (extrinsic reward can reduce intrinsic motivation)", priority: "must" },
          { item: "Big Five personality traits: OCEAN — Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism", priority: "must" },
          { item: "Memorizing all Freudian stages and their fixations in detail", detail: "Know the stages exist and what adult fixation looks like — don't memorize every detail", priority: "skip" },
        ],
      },
      {
        name: "Research Methods & Statistics",
        items: [
          { item: "Independent variable (what's manipulated) vs. dependent variable (what's measured)", priority: "must" },
          { item: "Confound = third variable that could explain the result. Operationalization = how you define/measure a variable.", priority: "must" },
          { item: "Random assignment (reduces confounds) vs. random sampling (improves generalizability)", priority: "must" },
          { item: "Types of validity: internal (does the study measure what it claims?), external (does it generalize?), construct, face", priority: "must" },
          { item: "Correlation coefficient r: range −1 to +1. r² = variance explained.", priority: "must" },
          { item: "p-value < 0.05 = statistically significant. Does NOT mean clinically important.", priority: "must" },
          { item: "Effect size (Cohen's d): magnitude of the difference, independent of sample size", priority: "must" },
          { item: "Type I error (false positive, α) vs. Type II error (false negative, β)", priority: "must" },
          { item: "Power = 1 − β. Increases with larger sample size, larger effect size, higher α.", priority: "must" },
          { item: "Calculating exact statistics from raw data", priority: "calc" },
        ],
      },
      {
        name: "Health & Society",
        items: [
          { item: "Social determinants of health: income, education, housing, neighborhood, access to care", priority: "must" },
          { item: "Health disparities by race, income, geography — MCAT tests this heavily", priority: "must" },
          { item: "Sick role (Parsons): patient is exempt from normal duties, expected to want to get well and seek care", priority: "must" },
          { item: "Social capital: networks and relationships that provide support and resources", priority: "must" },
          { item: "Socioeconomic status (SES): composite of income, education, occupation", priority: "must" },
          { item: "Cultural competency and implicit bias", priority: "must" },
        ],
      },
    ],
  },
];

const LEGEND = [
  { priority: "must" as Priority, desc: "You need this on test day — no looking it up, no derivation." },
  { priority: "understand" as Priority, desc: "Know what it means and when it applies — exact value often provided." },
  { priority: "calc" as Priority, desc: "Your calculator handles this — skip arithmetic drills for this." },
  { priority: "skip" as Priority, desc: "Not worth your study time — MCAT doesn't require it." },
];

export default function MemorizationGuidePage() {
  const [activeSection, setActiveSection] = useState("cp");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Priority | "all">("all");

  const section = SECTIONS.find(s => s.id === activeSection)!;

  const toggleCat = (name: string) =>
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }));

  const allOpen = section.categories.every(c => openCategories[c.name]);
  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    section.categories.forEach(c => { next[c.name] = !allOpen; });
    setOpenCategories(next);
  };

  const counts: Record<Priority, number> = { must: 0, understand: 0, calc: 0, skip: 0 };
  section.categories.forEach(cat =>
    cat.items.forEach(item => { counts[item.priority]++; })
  );

  const totalMust = counts.must;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold">What to Actually Memorize</h1>
            <p className="text-muted-foreground mt-0.5">Every prep book makes it seem like you need everything. You don't. Here's exactly what matters.</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
          <div className="font-semibold text-primary">The honest truth about MCAT memorization</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Prep books list thousands of facts. But the MCAT only truly tests a few hundred core items — the rest are derivable, calculator-handled, or rarely appear. This guide tells you exactly which category everything falls into. Focus your energy on <strong className="text-foreground">Must Know Cold</strong> items. That's it.
          </p>
        </div>
      </header>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {LEGEND.map(({ priority, desc }) => {
          const cfg = PRIORITY_CONFIG[priority];
          const Icon = cfg.icon;
          return (
            <div key={priority} className={`rounded-xl border p-3 space-y-1.5 ${cfg.bg} ${cfg.border}`}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                <Icon className="w-3.5 h-3.5" /> {cfg.label}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setOpenCategories({}); setFilter("all"); }}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${activeSection === s.id ? s.color : "border-border text-muted-foreground hover:bg-accent"}`}
          >
            {s.abbr}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-semibold text-lg">{section.name}</div>
          <div className="text-sm text-muted-foreground mt-0.5">
            <span className="text-rose-400 font-semibold">{totalMust} must-know items</span>
            {counts.calc > 0 && <span className="ml-2 text-emerald-400">{counts.calc} calculator-handled</span>}
            {counts.skip > 0 && <span className="ml-2 text-muted-foreground">{counts.skip} to skip</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {(["all", "must", "understand", "calc", "skip"] as const).map(f => {
              const cfg = f !== "all" ? PRIORITY_CONFIG[f] : null;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filter === f ? (cfg ? `${cfg.bg} ${cfg.border} ${cfg.color} font-semibold` : "bg-primary/10 border-primary/20 text-primary font-semibold") : "border-border text-muted-foreground hover:bg-accent"}`}
                >
                  {f === "all" ? "All" : PRIORITY_CONFIG[f].short}
                </button>
              );
            })}
          </div>
          <button onClick={toggleAll} className="text-xs px-3 py-1.5 rounded-lg border text-muted-foreground hover:bg-accent transition-colors">
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {section.categories.map(cat => {
          const filteredItems = cat.items.filter(i => filter === "all" || i.priority === filter);
          if (filteredItems.length === 0) return null;
          const isOpen = !!openCategories[cat.name];
          const mustCount = cat.items.filter(i => i.priority === "must").length;

          return (
            <div key={cat.name} className="bg-card border rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleCat(cat.name)}
                className="w-full flex items-center justify-between p-5 hover:bg-accent/20 transition-colors text-left gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.items.length} items</span>
                  <span className="text-xs text-rose-400 font-medium">{mustCount} must-know</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {isOpen && (
                <div className="divide-y divide-border/50 animate-in fade-in duration-150">
                  {filteredItems.map((item, i) => {
                    const cfg = PRIORITY_CONFIG[item.priority];
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="px-5 py-4 flex items-start gap-4">
                        <div className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.color} mt-0.5 whitespace-nowrap`}>
                          <Icon className="w-3 h-3" />
                          {cfg.short}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="text-sm font-medium leading-relaxed">{item.item}</div>
                          {item.detail && <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>}
                          {item.mnemonic && (
                            <div className="text-xs bg-violet-400/5 border border-violet-400/15 text-violet-300 rounded-lg px-3 py-2 leading-relaxed">
                              <span className="font-semibold">Mnemonic: </span>{item.mnemonic}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom callout */}
      <div className="bg-card border rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed">
        <span className="text-foreground font-semibold">One more thing: </span>
        CARS requires zero memorization. If you're spending prep time memorizing anything for CARS, stop and practice reading instead. For C/P, remember your calculator handles all arithmetic — so every "must know" item there is conceptual, not numerical.
      </div>
    </div>
  );
}
