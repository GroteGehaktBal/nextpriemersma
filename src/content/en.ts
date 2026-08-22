import type {
  Capability,
  Certification,
  Content,
  Fact,
  Profile,
  Ui,
  Project,
  TimelineEntry,
} from './types';

/**
 * English content.
 *
 * Both locales satisfy the same `Content` interface, so a field present here and
 * missing from the Dutch file is a compile error rather than a blank on the page.
 * That is the point of moving content into TypeScript: the current site's JSON
 * message files can drift silently, and did.
 */

const ui: Ui = {
  notice: { badge: 'Proof of concept', text: 'Design proposal — not the live site' },
  nav: {
    work: 'Work',
    capabilities: 'Capabilities',
    background: 'Background',
    contact: 'Contact',
  },
  actions: { seeWork: 'See the work', getInTouch: 'Get in touch' },
  sections: {
    work: {
      index: '01 / Work',
      title: 'Selected projects',
      lead: 'Infrastructure, automation and the software that ties them together. Each entry names what was built, what it runs on, and what changed as a result.',
    },
    capabilities: {
      index: '02 / Capabilities',
      title: 'What I actually do',
      lead: 'Four areas, each backed by the tools and protocols behind it rather than a self-assessed percentage bar.',
    },
    background: {
      index: '03 / Background',
      title: 'Background',
      lead: 'Studying network and security engineering while running two businesses that put it into practice — after eight months inside a Google data centre.',
    },
    contact: {
      index: '04 / Contact',
      title: 'Got a network or a house that needs thinking about?',
      text: 'Available for internships, freelance work and smart-home projects across Friesland and the north of the Netherlands.',
    },
  },
  background: {
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    certificationsLead: 'Cisco CCNA first, then the rest in full.',
  },
  languageLabel: 'Language',
};

const profile: Profile = {
  name: 'Peter Riemersma',
  role: 'Network & Security Engineering',
  location: 'Burum, Friesland',
  /** One sentence. If it needs two, it is not sharp enough yet. */
  headline: {
    lead: 'I design networks that stay up',
    accent: 'and homes that think for themselves.',
  },
  subline:
    'Network & Security Engineering student at Hanze University, co-owner of pyxels, and freelance at Riemersma ICT. CCNA-certified, and I spent eight months keeping Google’s Eemshaven data centre running.',
  availability: 'Open to internships and freelance work',
  email: 'peter@riemersmaict.nl',
  phone: '+31 6 15 93 90 10',
  github: 'https://github.com/grotegehaktbal',
  linkedin: 'https://www.linkedin.com/in/peter-riemersma/',
};

const facts: Fact[] = [
  { label: 'Certified', value: 'Cisco CCNA' },
  { label: 'Internship', value: 'Google, Eemshaven' },
  { label: 'Throughput', value: '2.5GbE / Wi-Fi 7' },
  { label: 'Languages', value: 'NL / EN' },
];

const projects: Project[] = [
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
    slug: 'weather-forecast-iot-project',
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
    slug: 'riemersmaict',
    kind: 'Freelance',
    title: 'Riemersma ICT',
    summary:
      'Technical support and managed network infrastructure for small businesses and private clients, with cloud identity and device management handled through Microsoft Azure.',
    stack: ['Microsoft Azure', 'Windows Server', 'Wireless networks'],
    year: '2023',
  },
];

const capabilities: Capability[] = [
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

const timeline: TimelineEntry[] = [
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

const education: TimelineEntry[] = [
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

const certifications: Certification[] = [
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

/**
 * English content.
 *
 * Both locales satisfy the same `Content` interface, so a field added here that
 * is missing from the Dutch file is a compile error rather than a blank on the
 * page. That is the whole point of moving content into TypeScript: the current
 * site's JSON message files can drift silently, and did.
 */
export const en: Content = {
  ui,
  profile,
  facts,
  projects,
  capabilities,
  timeline,
  education,
  certifications,
};
