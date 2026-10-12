// All copy on the site, taken from the resume. The page and the dot field both read from this one file,
// so switching the design later does not mean touching the words.

export const person = {
  name: "Biswajit Saha",
  role: "Business Analyst (Product & Analytics)",
  company: "BimaKavach",
  intro: "MCA in Data Science, pivoting into Product Management, Product Analytics and Business Intelligence.",
  email: "biswajit2001june@gmail.com",
  linkedin: "https://www.linkedin.com/in/biswajit-saha-72681b1a0/",
  resume: "/Biswajit-Saha-Resume.pdf",
};

// The opening screen. The line and the four results are the words the live site already opens with.
export const hero = {
  eyebrow: ["Data", "Product", "Business"],
  lead: "Building data-driven systems that turn complex business problems into actionable decisions.",
  proof: [
    ["~2 days → ~5 min", "cohort analysis"],
    ["90,000+", "policies migrated"],
    ["3,000+", "daily leads, AI voice bot pilot"],
    ["+30% revenue", "from RM allocation logic"],
  ],
};

// One screen each. `shape` names the dot formation in lib/shapes.js.
export const cases = [
  {
    id: "cohort",
    short: "Cohort automation",
    col: "Cohort",
    tag: "Business analytics · Automation",
    title: "Client cohort analysis, rebuilt as an automated framework",
    hero: ["~2 days", "~5 min"],
    label: "turnaround time",
    problem: "Cohort analysis of clients took around two days each time it was run.",
    baseline: "Around two days per run, every time.",
    did: "Engineered an automated client cohort analysis framework, then used it to formulate customer segmentation strategies.",
    outcome: "Turnaround dropped to about 5 minutes, and segments could be used to evaluate cross-sell and upsell performance.",
    shape: "race",
  },
  {
    id: "migration",
    short: "Data migration",
    col: "Migration",
    tag: "Data & process transformation",
    title: "Moving 90,000+ policies off legacy systems",
    hero: [null, "90,000+"],
    label: "policies migrated, ~40 data points each",
    problem: "Policy data lived in legacy systems and was not structured for root cause analysis.",
    baseline: "Data-quality issues and past recording issues meant hours of cleaning, then the data was fed into Metabase or Power BI by hand.",
    did: "Led the end-to-end migration across ~40 data points, restructuring architectures for 12K direct and 40K partner clients.",
    outcome: "Data landed in a structure that enables RCA-ready reporting.",
    next: "More real-time tracking for KMPs.",
    shape: "records",
  },
  {
    id: "dash",
    short: "KPI dashboards",
    col: "Dashboards",
    tag: "Dashboarding",
    title: "One place for operational and financial KPIs",
    hero: ["Separate Excel trackers", "One dashboard"],
    label: "Power BI + Metabase",
    problem: "Teams needed a consistent view of operational and financial performance.",
    baseline: "KPIs lived in several separate Excel trackers, which was inconvenient for key managerial personnel (KMPs).",
    did: "Developed centralized Power BI and Metabase dashboards and standardized the KPI logic behind them.",
    outcome: "End-to-end business visibility and faster management decision-making.",
    shape: "merge",
  },
  {
    id: "bot",
    short: "AI voice bot pilot",
    col: "Voice bot",
    tag: "Product thinking · Operations",
    title: "A 0-to-1 AI voice bot pilot for inbound leads",
    hero: [null, "3,000+"],
    label: "daily inbound leads qualified",
    problem: "A high volume of inbound leads needed qualifying and routing.",
    baseline: "The ABM team manually called each person to qualify them as a lead, which cost more.",
    did: "Drove the Greylabs AI voice bot pilot and optimized auto-dialer workflows by defining queue management, prioritization and CRM handoffs.",
    outcome: "A pilot qualifying 3,000+ daily inbound leads.",
    shape: "voice",
  },
  {
    id: "fundraise",
    short: "Series-A fundraise",
    col: "Series-A",
    tag: "Fundraising · Investor analytics",
    status: "In progress",
    title: "The metrics behind a Rs. 100 Cr Series-A fundraise",
    hero: [null, "Rs. 100 Cr"],
    label: "Series-A fundraise in progress, supported with analysis",
    problem: "The Series-A fundraise needed clear company-level financial and operational metrics behind the story told to investors.",
    baseline: "Not shareable.",
    did: "Spearheaded company-level financial and operational metric analysis supporting the fundraise.",
    outcome: "Contributing critical insights for investor pitch decks and due diligence while the round is in progress.",
    shape: "raise",
  },
  {
    id: "allocation",
    short: "RM allocation",
    col: "RM alloc.",
    tag: "Revenue operations · Lead allocation",
    title: "Allocating leads to relationship managers across India",
    hero: [null, "+30%"],
    label: "revenue vs before the new RM allocation logic",
    problem: "Leads, including offline RM-assisted journeys, needed to reach the right relationship manager.",
    baseline: "Leads were assigned round-robin, so leads from potential clients often went to freshers.",
    did: "Owned RM allocation logic across India, assigning leads by entity type, revenue and GWP, and defined LSQ activity tracking for offline RM-assisted journeys.",
    outcome: "More selling, and 30% more revenue than before.",
    measure: [
      ["North-star", "GWP from leads that reach an RM, per allocated lead"],
      ["Counter-metric", "RM response time and coverage, so a high-value rule doesn't starve smaller leads"],
      ["Funnel", "Lead → assigned → contacted → qualified → converted"],
    ],
    shape: "route",
  },
];

// The notes under each case, in reading order.
export const noteRows = [
  ["problem", "Problem"],
  ["baseline", "Baseline"],
  ["did", "What I did"],
  ["outcome", "Outcome"],
  ["next", "What I’d improve"],
];

// Skill groups: [name, tools, the cases it showed up in]. The third part is a reading of the case text and
// drives the skills matrix, so change it here if a block should be lit or dark.
export const skills = [
  ["Data", "SQL (CTEs, window functions) · Data wrangling · Cohort analysis · Customer segmentation", ["cohort", "migration", "fundraise"]],
  ["BI & visualization", "Power BI · Metabase · Advanced Excel · MIS reporting", ["migration", "dash"]],
  ["Product & business", "Funnel tracking · KPI design · Gap analysis · Prioritization", ["dash", "bot", "fundraise", "allocation"]],
  ["Automation", "n8n · Python · Web scraping", ["cohort", "bot"]],
  ["Databases", "MySQL · PostgreSQL · MongoDB · Data migration", ["migration"]],
];
export const alsoTools = "Also Git and VS Code.";

export const experience = {
  title: "Business Analyst (Product & Analytics)",
  where: "BimaKavach, Bengaluru",
  dates: "Nov 2025 to present",
};

export const project = {
  name: "SmartShelf, a semantic book recommender",
  stack: "Python · HuggingFace · LangChain · Gradio",
  text: "AI recommendation engine mapping user emotional cues to book embeddings across 10k+ titles. Top-5 precision up 12+ pts in offline evals; median latency under 300ms.",
};

export const leadership = [
  {
    name: "Mentoring & Technophilia",
    text: "Mentored students for 5+ years at Northeast India’s largest interschool IT fest and conceptualized Technophilia, an inter-university IT fest.",
  },
  {
    name: "Head, Cybersecurity Society, Presidency College",
    text: "Coordinated DSA-IT Club activities and organized technical workshops covering industry-standard cybersecurity tools.",
  },
  {
    name: "TryHackMe, top 2% globally",
    text: "Completed advanced hands-on security labs across web security, networking, and privilege escalation.",
    href: "https://tryhackme.com/p/biswa.bug",
  },
];

// The scroll order. The dot field follows the active chapter.
// Text and dots take turns: every second chapter is flipped, so its text sits on the right and the dots fly across to the left.
export const chapters = [
  { id: "intro", label: "Intro", shape: "raw" },
  ...cases.map((c) => ({ id: c.id, label: c.short, shape: c.shape })),
  { id: "skills", label: "Skills", shape: "matrix" },
  { id: "smartshelf", label: "SmartShelf", shape: "embed" },
  { id: "mentoring", label: "Mentoring", shape: "rings" },
  { id: "contact", label: "Contact", shape: "still" },
].map((c, i) => ({ ...c, flip: i % 2 === 1 }));

// The three "Elsewhere" screens, for the nav to treat as one group.
export const elsewhereIds = ["skills", "smartshelf", "mentoring"];
