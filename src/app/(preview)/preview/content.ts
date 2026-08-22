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
 * The copy below is drawn from the existing site and is illustrative. It is
 * deliberately specific: every claim names a technology, a scale or a result,
 * because that is what the layout is designed to show off.
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
}

export const profile = {
  name: 'Peter Riemersma',
  role: 'Network & Security Engineering',
  location: 'Friesland, Netherlands',
  /** One sentence. If it needs two, it is not sharp enough yet. */
  headline: 'I design networks that stay up and homes that think for themselves.',
  subline:
    'Network & Security Engineering student at Hanze University, co-owner of pyxels, and freelance at Riemersma ICT. I build secure, high-throughput infrastructure and the smart-home systems that run on top of it.',
  availability: 'Open to internships and freelance work',
  email: 'peter@riemersmaict.nl',
  github: 'https://github.com/grotegehaktbal',
  linkedin: 'https://www.linkedin.com/in/peter-riemersma/',
} as const;

export const facts: Fact[] = [
  { label: 'Focus', value: 'Network & security' },
  { label: 'Throughput', value: '2.5GbE / Wi-Fi 7' },
  { label: 'Running since', value: '2023' },
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
    stack: ['Microsoft Azure', 'Windows Server', 'Networking'],
    year: '2023',
  },
];

export const capabilities: Capability[] = [
  {
    title: 'Network engineering',
    description:
      'Designing and deploying segmented, secure network architectures — and being able to explain what every packet is doing and why.',
    keywords: ['Cisco IOS', 'VLAN', 'Routing', 'IPsec', 'DNS/DHCP'],
  },
  {
    title: 'Security',
    description:
      'Building infrastructure that assumes it will be attacked: segmentation, least privilege, and identity as the perimeter.',
    keywords: ['Firewalling', 'Active Directory', 'Group Policy', 'Hardening'],
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
    role: 'Freelance engineer',
    organisation: 'Riemersma ICT',
    description:
      'Technical support and network infrastructure management for clients, with cloud services delivered on Microsoft Azure.',
    current: true,
  },
  {
    period: 'Present',
    role: 'BSc ICT — Network & Security Engineering',
    organisation: 'Hanze University of Applied Sciences, Groningen',
    description:
      'Specialising in secure infrastructure, network architecture and applied research projects.',
    current: true,
  },
  {
    period: 'Completed',
    role: 'Network Management',
    organisation: 'Noorderpoort',
    description:
      'Vocational training in network management, including the multi-site Teradruk BV infrastructure project.',
  },
];
