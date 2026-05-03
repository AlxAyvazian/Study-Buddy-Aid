import { Router } from "express";

const router = Router();

const FREE_RESOURCES = [
  {
    category: "MCAT Accommodations",
    items: [
      {
        name: "AAMC Testing Accommodations",
        description: "Official AAMC program — request extended time, extra breaks, screen readers, separate testing rooms, and more for the MCAT.",
        url: "https://students-residents.aamc.org/mcat-exam/mcat-testing-accommodations",
        tags: ["MCAT", "Official", "Extended Time", "Screen Reader"],
      },
      {
        name: "AAMC Fee Assistance Program (FAP)",
        description: "Reduces MCAT registration fees and provides free MCAT prep materials for eligible students. Covers income-based need.",
        url: "https://students-residents.aamc.org/fee-assistance-program",
        tags: ["Free", "MCAT", "Financial Aid"],
      },
    ],
  },
  {
    category: "Study Tools (Free)",
    items: [
      {
        name: "Khan Academy MCAT",
        description: "Completely free, full MCAT prep content. Works well with screen readers and keyboard navigation.",
        url: "https://www.khanacademy.org/test-prep/mcat",
        tags: ["Free", "Accessible", "All Subjects"],
      },
      {
        name: "Natural Reader (Free Tier)",
        description: "Text-to-speech tool for reading study materials aloud. Free tier reads up to 60 min/month.",
        url: "https://www.naturalreaders.com",
        tags: ["Text-to-Speech", "Dyscalculia", "ADHD"],
      },
      {
        name: "Microsoft Immersive Reader",
        description: "Built into Microsoft Edge and Word. Reads aloud, spaces text, changes fonts, highlights lines. Completely free.",
        url: "https://www.onenote.com/learningtools",
        tags: ["Free", "Dyslexia", "ADHD", "Text-to-Speech"],
      },
      {
        name: "Otter.ai (Free Tier)",
        description: "Live transcription for lectures and study groups. Free 600 min/month — great for ADHD and processing differences.",
        url: "https://otter.ai",
        tags: ["Free", "ADHD", "Transcription", "Lecture Notes"],
      },
      {
        name: "Anki (Open Source)",
        description: "Free, open-source spaced repetition flashcard app. Highly accessible; supports audio and image cards.",
        url: "https://apps.ankiweb.net",
        tags: ["Free", "Flashcards", "Open Source"],
      },
      {
        name: "Focus@Will",
        description: "Neuroscience-based focus music, free trial available. Designed for ADHD brains.",
        url: "https://www.focusatwill.com",
        tags: ["ADHD", "Focus", "Free Trial"],
      },
    ],
  },
  {
    category: "Financial & Support Programs",
    items: [
      {
        name: "National Council on Disability (NCD)",
        description: "Federal agency with reports and advocacy resources on healthcare access for people with disabilities.",
        url: "https://ncd.gov",
        tags: ["Advocacy", "Federal", "Policy"],
      },
      {
        name: "HEATH Resource Center",
        description: "National clearinghouse for disability-related information for students transitioning to higher education and grad/med school.",
        url: "https://www.heath.gwu.edu",
        tags: ["Resource Hub", "Higher Education", "Free"],
      },
      {
        name: "Lime Connect",
        description: "Connects students with disabilities to scholarships, fellowships, and career opportunities at top companies.",
        url: "https://www.limeconnect.com",
        tags: ["Scholarships", "Fellowships", "Career"],
      },
      {
        name: "Foundation for Science and Disability",
        description: "Grants for graduate students with disabilities in STEM fields including pre-med and biomedical sciences.",
        url: "http://stemd.org",
        tags: ["Grants", "STEM", "Graduate"],
      },
    ],
  },
  {
    category: "Disability Offices & Advocacy",
    items: [
      {
        name: "AHEAD (Higher Education Disability)",
        description: "Association on Higher Education and Disability. Find your college disability office and know your rights under the ADA.",
        url: "https://www.ahead.org",
        tags: ["ADA", "Rights", "College"],
      },
      {
        name: "AAMC Disability Resources for Pre-Meds",
        description: "AAMC's guidance page for prospective medical students with disabilities — covers MCAT, admissions, and school policies.",
        url: "https://students-residents.aamc.org/applying-medical-school/article/students-disabilities",
        tags: ["AAMC", "Admissions", "Official"],
      },
    ],
  },
];

const MED_SCHOOLS = [
  {
    name: "Johns Hopkins School of Medicine",
    state: "MD",
    disabilityOffice: "Student Disability Services",
    accommodations: ["Extended exam time", "Alternative testing environments", "Screen reader support", "Note-taking assistance"],
    exemptions: "Course substitutions reviewed case-by-case for students with documented learning disabilities.",
    knownFor: "Strong disability advocacy office; ADA coordinator embedded in medical school.",
    contact: "https://studentaffairs.jhu.edu/disabilities/",
    tier: "Top 5",
  },
  {
    name: "University of Michigan Medical School",
    state: "MI",
    disabilityOffice: "Services for Students with Disabilities",
    accommodations: ["Extended time on Step exams", "Reduced distraction testing rooms", "Assistive technology loans", "Physical accessibility"],
    exemptions: "Math/science substitutions considered for students with documented dyscalculia who demonstrate clinical competency otherwise.",
    knownFor: "Proactive outreach during orientation; published disability inclusion reports.",
    contact: "https://umdearborn.edu/students/student-services/student-accessibility-services",
    tier: "Top 20",
  },
  {
    name: "UCSF School of Medicine",
    state: "CA",
    disabilityOffice: "Student Disability Services",
    accommodations: ["USMLE accommodation letters", "Flexible scheduling", "Sign language interpreting", "Adaptive equipment"],
    exemptions: "Technical standards reviewed individually; case-by-case exemptions for non-essential functions.",
    knownFor: "One of the most progressive disability policies; technical standards explicitly allow reasonable modifications.",
    contact: "https://sds.ucsf.edu",
    tier: "Top 10",
  },
  {
    name: "Harvard Medical School",
    state: "MA",
    disabilityOffice: "Accessible Education Office",
    accommodations: ["Exam accommodations", "Housing accommodations", "Mental health supports", "Extended time"],
    exemptions: "Accommodation process is formal and documented; exemptions require AEO review.",
    knownFor: "Well-resourced office; works directly with clerkship sites to extend accommodations to clinical years.",
    contact: "https://aeo.fas.harvard.edu",
    tier: "Top 5",
  },
  {
    name: "Mayo Clinic Alix School of Medicine",
    state: "MN/AZ",
    disabilityOffice: "Disability and Rehabilitation Services",
    accommodations: ["Testing accommodations", "Adaptive technology", "Physical access", "Mental health"],
    exemptions: "Small cohort allows individualized planning; technical standards accommodations reviewed by committee.",
    knownFor: "Patient-centered mission extends to students; strong student wellness culture.",
    contact: "https://www.mayo.edu",
    tier: "Top 20",
  },
  {
    name: "New York University Grossman School of Medicine",
    state: "NY",
    disabilityOffice: "Moses Center for Student Accessibility",
    accommodations: ["Full tuition scholarship (all students)", "Accommodation letters for USMLE", "Reduced distraction rooms", "Assistive tech"],
    exemptions: "Free tuition removes financial barrier; accommodations extended to residency application support.",
    knownFor: "Free tuition for all students reduces financial stress; strong disability services integration.",
    contact: "https://www.nyu.edu/students/communities-and-groups/students-with-disabilities.html",
    tier: "Top 20",
  },
  {
    name: "Perelman School of Medicine (Penn)",
    state: "PA",
    disabilityOffice: "Student Disabilities Services",
    accommodations: ["Exam accommodations", "Note-taking", "Captioning", "Sign language"],
    exemptions: "NBME accommodation application support; case-by-case technical standards review.",
    knownFor: "Has published guidance on disabilities in medicine; active student disability advocacy group.",
    contact: "https://www.vpul.upenn.edu/lrc/sds/",
    tier: "Top 10",
  },
  {
    name: "University of Colorado School of Medicine",
    state: "CO",
    disabilityOffice: "Disability Services and Accommodations",
    accommodations: ["Testing accommodations", "Assistive technology", "Sign language interpreting", "Mental health"],
    exemptions: "Technical standards explicitly note that disabilities do not disqualify applicants; reasonable accommodations provided.",
    knownFor: "Explicitly disability-inclusive technical standards language in their published documentation.",
    contact: "https://www.ucdenver.edu/offices/disability-resources-and-services",
    tier: "Top 30",
  },
];

router.get("/disability/resources", async (req, res): Promise<void> => {
  res.json(FREE_RESOURCES);
});

router.get("/disability/schools", async (req, res): Promise<void> => {
  res.json(MED_SCHOOLS);
});

export default router;
