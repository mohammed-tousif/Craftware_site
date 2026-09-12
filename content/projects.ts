export type Metric = { value: string; label: string };

export type CaseSection = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};

export type Project = {
  slug: string;
  name: string;
  industry: string;
  services: string[];
  result: string | null;
  year: string;
  timeline: string;
  /** Swap this for a real screenshot in /public/work when available. */
  image: string | null;
  summary: string;
  metrics: Metric[];
  sections: CaseSection[];
};

export const projects: Project[] = [
  {
    slug: "quba-international",
    name: "Quba International Tours & Travels",
    industry: "Travel & Tourism",
    services: ["Website", "Digital Marketing", "Meta Ads"],
    result: "+180% package enquiries in 90 days",
    year: "2025",
    timeline: "8 weeks",
    image: null,
    summary:
      "A modern digital presence that turns curated travel packages into booked enquiries.",
    metrics: [
      { value: "+180%", label: "Package enquiries" },
      { value: "3.2x", label: "Return on ad spend" },
      { value: "68%", label: "Organic traffic growth" },
      { value: "4.6M", label: "Total ad reach" },
    ],
    sections: [
      {
        id: "01",
        title: "Challenge",
        body: "Quba International had built a strong offline reputation for curated travel packages, but its digital presence did not reflect it. There was no proper website, enquiries came only through phone calls, and the brand had no consistent visual identity across platforms. They needed a modern digital presence capable of presenting travel packages professionally and turning interest into booked enquiries.",
      },
      {
        id: "02",
        title: "Strategy",
        body: "We built a digital roadmap centred on one metric: qualified package enquiries. That meant a fast, conversion-focused website, a coherent brand system, and a paid social engine to drive demand.",
        bullets: [
          "Package-first site architecture with enquiry capture on every page.",
          "Brand system: logo refinement, colour, typography, photo treatment.",
          "Always-on Meta Ads with seasonal package creative and retargeting.",
        ],
      },
      {
        id: "03",
        title: "Execution",
        body: "Design, development, branding and campaigns ran in parallel. The site shipped in six weeks; the ad engine went live alongside it with a library of package-level creative.",
      },
      {
        id: "04",
        title: "Result",
        body: "Within 90 days of launch, the brand had a measurable pipeline for the first time — a repeatable enquiry engine rather than a phone that sometimes rang.",
      },
    ],
  },
  {
    slug: "orbit-care",
    name: "Orbit Care",
    industry: "Healthcare Platform",
    services: ["Website / App", "Branding"],
    result: null,
    year: "2025",
    timeline: "10 weeks",
    image: null,
    summary:
      "A calm, trustworthy product identity for a healthcare platform that patients actually want to use.",
    metrics: [
      { value: "2.4x", label: "Sign-up completion" },
      { value: "−38%", label: "Support tickets" },
      { value: "AA", label: "Accessibility baseline" },
      { value: "1.1s", label: "Median load time" },
    ],
    sections: [
      {
        id: "01",
        title: "Challenge",
        body: "Orbit Care had a capable product buried under an interface that felt clinical and hard to trust. Onboarding drop-off was high and the brand looked like a dozen other health startups.",
      },
      {
        id: "02",
        title: "Strategy",
        body: "Rebuild the identity around calm and clarity, then rework the core flows so the first five minutes feel effortless.",
        bullets: [
          "Warm, low-contrast palette with a single confident accent.",
          "Progressive onboarding — one decision per screen.",
          "A component library the in-house team can extend safely.",
        ],
      },
      {
        id: "03",
        title: "Execution",
        body: "We shipped a new design system, a marketing site and the redesigned onboarding as one coordinated release.",
      },
      {
        id: "04",
        title: "Result",
        body: "Completion rates more than doubled and the brand finally reads as a product people can rely on with something that matters.",
      },
    ],
  },
  {
    slug: "no-name-cafe",
    name: "No Name Café",
    industry: "Food & Beverage",
    services: ["Branding", "Social Media", "Creative Design"],
    result: null,
    year: "2024",
    timeline: "6 weeks",
    image: null,
    summary:
      "An identity and content engine for a café that wanted to be talked about, not just visited.",
    metrics: [
      { value: "5.1x", label: "Instagram reach" },
      { value: "+72%", label: "Weekend covers" },
      { value: "9k", label: "New followers / 90d" },
      { value: "24", label: "Content templates" },
    ],
    sections: [
      {
        id: "01",
        title: "Challenge",
        body: "Great coffee, no story. The café had loyal regulars but no reason for anyone else to discover it, and its social feed was inconsistent.",
      },
      {
        id: "02",
        title: "Strategy",
        body: "Give the place a point of view and a repeatable visual language, then feed the channels weekly.",
        bullets: [
          "A wordless logo mark and a bold monochrome system.",
          "A shootable content kit — menu, moments, people.",
          "A weekly posting rhythm the owners can run themselves.",
        ],
      },
      {
        id: "03",
        title: "Execution",
        body: "Brand, photography direction and a 90-day content calendar delivered together, with templates handed over at the end.",
      },
      {
        id: "04",
        title: "Result",
        body: "Reach multiplied and weekend covers rose — the café became a destination rather than a habit.",
      },
    ],
  },
  {
    slug: "al-madina-restaurant",
    name: "Al Madina Restaurant",
    industry: "Food & Beverage",
    services: ["Website", "Social Media", "Meta Ads"],
    result: null,
    year: "2024",
    timeline: "7 weeks",
    image: null,
    summary:
      "A website and paid-social engine that fills tables on the nights that used to be quiet.",
    metrics: [
      { value: "+140%", label: "Online reservations" },
      { value: "2.8x", label: "Return on ad spend" },
      { value: "−22%", label: "Cost per booking" },
      { value: "3.9M", label: "Local ad reach" },
    ],
    sections: [
      {
        id: "01",
        title: "Challenge",
        body: "Al Madina relied entirely on walk-ins and word of mouth. Midweek was slow and there was no way to book a table without calling.",
      },
      {
        id: "02",
        title: "Strategy",
        body: "Build a fast site with reservations front and centre, then drive local demand with tightly targeted campaigns.",
        bullets: [
          "One-tap reservations and a menu that loads instantly on mobile.",
          "Geo-fenced Meta Ads around the neighbourhood and offices.",
          "Offer-led creative for the slow nights of the week.",
        ],
      },
      {
        id: "03",
        title: "Execution",
        body: "Website, content and campaigns launched together, with weekly optimisation on spend and creative.",
      },
      {
        id: "04",
        title: "Result",
        body: "Reservations more than doubled and the quiet nights stopped being quiet.",
      },
    ],
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
