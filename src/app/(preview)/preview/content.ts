/**
 * Proof-of-concept content.
 *
 * This file also demonstrates the content model proposed in the overhaul plan:
 * typed TypeScript modules instead of a `.js` file containing JSX and translation
 * lookups. The benefits are visible immediately — list data is a real array rather
 * than a string split on a delimiter, every field is checked at compile time, and
 * a missing field in one locale is a build error rather than a blank on the page.
 *
 * In the full rewrite this becomes `src/content/en.ts` and `src/content/nl.ts`,
 * both satisfying a shared `Content` interface exported from `src/content/types.ts`.
 *
 * Roles, dates, education and certifications are taken from Peter's LinkedIn
 * profile. The prose around them is written for this layout, which is built to
 * reward specifics: every claim names a technology, a scale or a result.
 */

export interface Fact {
  /** Short mono label rendered above the value. */
  label: string;
  /** The headline value. Kept terse — two or three words at most. */
  value: string;
}

export interface Project {
  slug: string;
  /** Mono eyebrow describing the kind of work. */
  kind: string;
  title: string;
  summary: string;
  /** Concrete technologies, rendered as mono tags. */
  stack: string[];
  /** A measurable result. Omitted when there is not an honest one to give. */
  outcome?: string;
  year: string;
}

export interface Capability {
  title: string;
  description: string;
  /** Specific tools and protocols — the evidence behind the title. */
  keywords: string[];
}

export interface TimelineEntry {
  period: string;
  role: string;
  organisation: string;
  description: string;
  /** Marks the entry as ongoing, which renders a live status dot. */
  current?: boolean;
  /**
   * Secondary entries are real and worth listing, but they are not what the
   * reader is here for. They render in a quieter, more compact treatment so the
   * engineering roles above them keep the weight.
   */
  secondary?: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  /**
   * Lead certifications get their own card. The rest are listed compactly —
   * eleven equally weighted entries would bury the two that carry real weight.
   */
  lead?: boolean;
}

export const profile = {
  name: 'Peter Riemersma',
  role: 'Network & Security Engineering',
  location: 'Burum, Friesland',
  /** One sentence. If it needs two, it is not sharp enough yet. */
  headline: 'I design networks that stay up and homes that think for themselves.',
  subline:
    'Network & Security Engineering student at Hanze University, co-owner of pyxels, and freelance at Riemersma ICT. CCNA-certified, and I spent eight months keeping Google’s Eemshaven data centre running.',
  availability: 'Open to internships and freelance work',
  email: 'peter@riemersmaict.nl',
  phone: '+31 6 15 93 90 10',
  github: 'https://github.com/grotegehaktbal',
  linkedin: 'https://www.linkedin.com/in/peter-riemersma/',
} as const;

export const facts: Fact[] = [
  { label: 'Certified', value: 'Cisco CCNA' },
  { label: 'Internship', value: 'Google, Eemshaven' },
  { label: 'Throughput', value: '2.5GbE / Wi-Fi 7' },
  { label: 'Languages', value: 'NL / EN' },
];

export const projects: Project[] = [
  {
    slug: 'pyxels',
    kind: 'Company',
    title: 'Smart home automation at pyxels',
    summary:
      'Co-founded a studio that designs and installs complete smart-home systems: lighting, climate and security, running on a network built to carry them. Every install starts with the infrastructure, because automation is only as reliable as the link underneath it.',
    stack: ['Home Assistant', 'Wi-Fi 7', '2.5GbE', 'Zigbee', 'KNX'],
    outcome: 'Multi-room installations delivered end to end, from cabling to dashboard',
    year: '2024',
  },
  {
    slug: 'weather-forecast-iot',
    kind: 'Applied research',
    title: 'Hyper-local weather forecasting for heat pumps',
    summary:
      'A forecasting system that corrects national KNMI predictions against locally placed sensors, so a heat pump can be scheduled against the temperature at the house rather than at the nearest weather station. The model was trained on records going back to 1950.',
    stack: ['Python', 'TensorFlow', 'KNMI API', 'Home Assistant'],
    outcome: 'Hourly forecasts up to 48 hours ahead, computed entirely offline',
    year: '2025',
  },
  {
    slug: 'teradruk-bv',
    kind: 'Infrastructure',
    title: 'Multi-site network with redundant core services',
    summary:
      'A security-focused network connecting several company locations, with a redundant server setup carrying DHCP, DNS, NTP, NFS and Active Directory, plus group policy across the estate.',
    stack: ['Active Directory', 'IPsec VPN', 'DDNS', 'Group Policy'],
    outcome: 'Site-to-site tunnels that survive a public IP change',
    year: '2021',
  },
  {
    slug: 'riemersma-ict',
    kind: 'Freelance',
    title: 'Riemersma ICT',
    summary:
      'Technical support and managed network infrastructure for small businesses and private clients, with cloud identity and device management handled through Microsoft Azure.',
    stack: ['Microsoft Azure', 'Windows Server', 'Wireless networks'],
    year: '2023',
  },
];

export const capabilities: Capability[] = [
  {
    title: 'Network engineering',
    description:
      'Designing and deploying segmented, secure network architectures — and being able to explain what every packet is doing and why.',
    keywords: ['Cisco IOS', 'VLAN', 'Routing', 'IPv4/IPv6', 'IPsec', 'DNS/DHCP'],
  },
  {
    title: 'Security',
    description:
      'Building infrastructure that assumes it will be attacked: segmentation, least privilege, and identity as the perimeter.',
    keywords: ['Firewalling', 'Active Directory', 'Azure AD', 'Group Policy', 'Hardening'],
  },
  {
    title: 'Home automation',
    description:
      'Complex automations and dashboards in Home Assistant that stay understandable to the people who live with them.',
    keywords: ['Home Assistant', 'Zigbee', 'MQTT', 'Z-Wave', 'Node-RED'],
  },
  {
    title: 'Development',
    description:
      'Web applications and internal tooling, plus the Python that glues sensors, models and automations together.',
    keywords: ['Next.js', 'TypeScript', 'Python', 'React'],
  },
];

export const timeline: TimelineEntry[] = [
  {
    period: '2024 — now',
    role: 'Co-owner',
    organisation: 'pyxels',
    description:
      'Secure high-speed networks with 2.5GbE and Wi-Fi 7, and complete smart-home installations covering lighting, climate control and security.',
    current: true,
  },
  {
    period: '2023 — now',
    role: 'ICT services, freelance',
    organisation: 'Riemersma ICT',
    description:
      'Technical support and network infrastructure management for clients across Friesland, with cloud services delivered on Microsoft Azure.',
    current: true,
  },
  {
    period: '2021 — 2022',
    role: 'Data Center Technician, internship',
    organisation: 'Google — Eemshaven',
    description:
      'Eight months inside one of Europe’s largest data centres, troubleshooting network faults and server hardware at production scale.',
  },
  {
    period: '2020 — 2023',
    role: 'Student IT',
    organisation: 'Studentaanhuis',
    description:
      'On-site software and network troubleshooting for private clients in and around Groningen.',
    secondary: true,
  },
  {
    period: '2022 — 2023',
    role: 'Telesales Agent',
    organisation: 'Conduent',
    description: 'Remote sales and customer service.',
    secondary: true,
  },
];

export const education: TimelineEntry[] = [
  {
    period: '2022 — now',
    role: 'BSc ICT — Network & Security Engineering',
    organisation: 'Hanze University of Applied Sciences, Groningen',
    description:
      'Specialising in secure infrastructure, network architecture and applied research projects.',
    current: true,
  },
  {
    period: '2019 — 2022',
    role: 'Network and System Administration',
    organisation: 'Noorderpoort',
    description:
      'Vocational training in network and system administration, including the multi-site Teradruk BV infrastructure project.',
  },
];

export const certifications: Certification[] = [
  {
    name: 'CCNA: Enterprise Networking, Security, and Automation',
    issuer: 'Cisco',
    date: 'Nov 2023',
    lead: true,
  },
  {
    name: 'CCNA: Switching, Routing, and Wireless Essentials',
    issuer: 'Cisco',
    date: 'Oct 2023',
    lead: true,
  },
  { name: 'Introduction to Internet of Things', issuer: 'Cisco', date: 'Feb 2026' },
  { name: 'Routing IPv4 and IPv6', issuer: 'Pluralsight', date: 'Mar 2022' },
  { name: 'Azure Active Directory: Basics', issuer: 'LinkedIn', date: 'Oct 2023' },
  { name: 'Learning Network Troubleshooting', issuer: 'LinkedIn', date: 'Oct 2023' },
  {
    name: 'Cisco CCNA (200-301) Cert Prep: Network Fundamentals and Access',
    issuer: 'LinkedIn',
    date: 'Oct 2023',
  },
  { name: 'Leveraging ChatGPT for Smarter Cybersecurity', issuer: 'LinkedIn', date: 'Oct 2023' },
  { name: 'Crash Course on Python', issuer: 'Coursera', date: 'Mar 2022' },
  { name: 'Effective communication in ICT', issuer: 'Hanze', date: 'Jan 2023' },
  { name: 'Introduction to Parametric Feature-Based CAD', issuer: 'Onshape by PTC', date: 'Nov 2025' },
];
