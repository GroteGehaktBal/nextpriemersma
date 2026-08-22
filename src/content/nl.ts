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
 * Dutch content.
 *
 * Written as Dutch rather than translated word for word. The current site shows
 * why that distinction matters: it rendered "IT & Huis Automatisering Expert",
 * which is a literal rendering of an English phrase and not a thing anyone says.
 * The Dutch word for the field is domotica.
 *
 * Job titles and technology names stay in English, because that is what Dutch
 * practitioners actually say — "netwerk- en securityengineer" reads naturally,
 * "netwerkbeveiligingsingenieur" does not.
 */

const ui: Ui = {
  notice: { badge: 'Proof of concept', text: 'Ontwerpvoorstel — niet de live site' },
  nav: {
    work: 'Werk',
    capabilities: 'Vakgebieden',
    background: 'Achtergrond',
    contact: 'Contact',
  },
  actions: { seeWork: 'Bekijk het werk', getInTouch: 'Neem contact op' },
  sections: {
    work: {
      index: '01 / Werk',
      title: 'Geselecteerde projecten',
      lead: 'Infrastructuur, automatisering en de software die ze aan elkaar knoopt. Bij elk project staat wat er gebouwd is, waar het op draait en wat het opleverde.',
    },
    capabilities: {
      index: '02 / Vakgebieden',
      title: 'Wat ik écht doe',
      lead: 'Vier gebieden, onderbouwd met de tools en protocollen erachter in plaats van een zelfbedachte percentagebalk.',
    },
    background: {
      index: '03 / Achtergrond',
      title: 'Achtergrond',
      lead: 'Studeren aan een netwerk- en securityopleiding en het tegelijk in de praktijk brengen in twee ondernemingen — na acht maanden in een datacenter van Google.',
    },
    contact: {
      index: '04 / Contact',
      title: 'Een netwerk of een huis dat aandacht nodig heeft?',
      text: 'Beschikbaar voor stages, freelance opdrachten en domoticaprojecten in Friesland en de rest van Noord-Nederland.',
    },
  },
  background: {
    experience: 'Werkervaring',
    education: 'Opleidingen',
    certifications: 'Certificeringen',
    certificationsLead: 'Cisco CCNA eerst, daarna de rest volledig.',
  },
  languageLabel: 'Taal',
};

const profile: Profile = {
  name: 'Peter Riemersma',
  role: 'Network & Security Engineering',
  location: 'Burum, Friesland',
  headline: {
    lead: 'Ik ontwerp netwerken die blijven draaien',
    accent: 'en huizen die zelf nadenken.',
  },
  subline:
    'Student Network & Security Engineering aan de Hanzehogeschool, mede-eigenaar van pyxels en freelancer bij Riemersma ICT. CCNA-gecertificeerd, en acht maanden lang hield ik het datacenter van Google in de Eemshaven draaiende.',
  availability: 'Open voor stages en freelance opdrachten',
  email: 'peter@riemersmaict.nl',
  phone: '+31 6 15 93 90 10',
  github: 'https://github.com/grotegehaktbal',
  linkedin: 'https://www.linkedin.com/in/peter-riemersma/',
};

const facts: Fact[] = [
  { label: 'Gecertificeerd', value: 'Cisco CCNA' },
  { label: 'Stage', value: 'Google, Eemshaven' },
  { label: 'Snelheid', value: '2.5GbE / Wi-Fi 7' },
  { label: 'Talen', value: 'NL / EN' },
];

const projects: Project[] = [
  {
    slug: 'pyxels',
    kind: 'Onderneming',
    title: 'Domotica bij pyxels',
    summary:
      'Mede-oprichter van een studio die complete smart home-systemen ontwerpt en installeert: verlichting, klimaat en beveiliging, op een netwerk dat ervoor gebouwd is. Elke installatie begint bij de infrastructuur, want automatisering is nooit betrouwbaarder dan de verbinding eronder.',
    stack: ['Home Assistant', 'Wi-Fi 7', '2.5GbE', 'Zigbee', 'KNX'],
    outcome: 'Installaties van bekabeling tot dashboard, in meerdere ruimtes tegelijk',
    year: '2024',
  },
  {
    slug: 'weather-forecast-iot-project',
    kind: 'Toegepast onderzoek',
    title: 'Hyperlokale weersverwachting voor warmtepompen',
    summary:
      'Een voorspellingssysteem dat landelijke KNMI-verwachtingen corrigeert met sensoren ter plaatse, zodat een warmtepomp stuurt op de temperatuur bij het huis in plaats van bij het dichtstbijzijnde weerstation. Het model is getraind op metingen vanaf 1950.',
    stack: ['Python', 'TensorFlow', 'KNMI API', 'Home Assistant'],
    outcome: 'Verwachtingen per uur tot 48 uur vooruit, volledig offline berekend',
    year: '2025',
  },
  {
    slug: 'teradruk-bv',
    kind: 'Infrastructuur',
    title: 'Netwerk over meerdere locaties met redundante kerndiensten',
    summary:
      'Een netwerk met de nadruk op beveiliging dat meerdere vestigingen verbindt, met een redundante serveropstelling voor DHCP, DNS, NTP, NFS en Active Directory, inclusief group policy over het hele domein.',
    stack: ['Active Directory', 'IPsec VPN', 'DDNS', 'Group Policy'],
    outcome: 'Site-to-site tunnels die een wisselend publiek IP-adres overleven',
    year: '2021',
  },
  {
    slug: 'riemersmaict',
    kind: 'Freelance',
    title: 'Riemersma ICT',
    summary:
      'Technische ondersteuning en beheer van netwerkinfrastructuur voor mkb en particulieren, met identiteits- en apparaatbeheer via Microsoft Azure.',
    stack: ['Microsoft Azure', 'Windows Server', 'Draadloze netwerken'],
    year: '2023',
  },
];

const capabilities: Capability[] = [
  {
    title: 'Netwerken',
    description:
      'Ontwerpen en uitrollen van gesegmenteerde, veilige netwerkarchitecturen — en kunnen uitleggen wat elk pakket doet en waarom.',
    keywords: ['Cisco IOS', 'VLAN', 'Routing', 'IPv4/IPv6', 'IPsec', 'DNS/DHCP'],
  },
  {
    title: 'Security',
    description:
      'Infrastructuur bouwen die ervan uitgaat dat er aangevallen wordt: segmentatie, least privilege, en identiteit als grens.',
    keywords: ['Firewalling', 'Active Directory', 'Azure AD', 'Group Policy', 'Hardening'],
  },
  {
    title: 'Domotica',
    description:
      'Complexe automatiseringen en dashboards in Home Assistant die begrijpelijk blijven voor de mensen die ermee wonen.',
    keywords: ['Home Assistant', 'Zigbee', 'MQTT', 'Z-Wave', 'Node-RED'],
  },
  {
    title: 'Development',
    description:
      'Webapplicaties en interne tooling, plus de Python die sensoren, modellen en automatiseringen aan elkaar knoopt.',
    keywords: ['Next.js', 'TypeScript', 'Python', 'React'],
  },
];

const timeline: TimelineEntry[] = [
  {
    period: '2024 — heden',
    role: 'Mede-eigenaar',
    organisation: 'pyxels',
    description:
      'Veilige high-speed netwerken met 2.5GbE en Wi-Fi 7, en complete domotica-installaties voor verlichting, klimaatbeheersing en beveiliging.',
    current: true,
  },
  {
    period: '2023 — heden',
    role: 'ICT-diensten, freelance',
    organisation: 'Riemersma ICT',
    description:
      'Technische ondersteuning en beheer van netwerkinfrastructuur voor klanten in Friesland, met clouddiensten in Microsoft Azure.',
    current: true,
  },
  {
    period: '2021 — 2022',
    role: 'Data Center Technician, stage',
    organisation: 'Google — Eemshaven',
    description:
      'Acht maanden in een van de grootste datacenters van Europa, met het oplossen van netwerkstoringen en serverhardware op productieschaal.',
  },
  {
    period: '2020 — 2023',
    role: 'Student IT',
    organisation: 'Studentaanhuis',
    description:
      'Software- en netwerkproblemen oplossen op locatie, bij particulieren in en rond Groningen.',
    secondary: true,
  },
  {
    period: '2022 — 2023',
    role: 'Telesales Agent',
    organisation: 'Conduent',
    description: 'Sales en klantenservice op afstand.',
    secondary: true,
  },
];

const education: TimelineEntry[] = [
  {
    period: '2022 — heden',
    role: 'HBO-ICT — Network & Security Engineering',
    organisation: 'Hanzehogeschool Groningen',
    description:
      'Specialisatie in veilige infrastructuur, netwerkarchitectuur en toegepast onderzoek.',
    current: true,
  },
  {
    period: '2019 — 2022',
    role: 'Netwerk- en systeembeheer',
    organisation: 'Noorderpoort',
    description:
      'Mbo-opleiding netwerk- en systeembeheer, met onder meer het Teradruk BV-project over meerdere locaties.',
  },
];

const certifications: Certification[] = [
  {
    name: 'CCNA: Enterprise Networking, Security, and Automation',
    issuer: 'Cisco',
    date: 'nov 2023',
    lead: true,
  },
  {
    name: 'CCNA: Switching, Routing, and Wireless Essentials',
    issuer: 'Cisco',
    date: 'okt 2023',
    lead: true,
  },
  { name: 'Introduction to Internet of Things', issuer: 'Cisco', date: 'feb 2026' },
  { name: 'Routing IPv4 and IPv6', issuer: 'Pluralsight', date: 'mrt 2022' },
  { name: 'Azure Active Directory: Basics', issuer: 'LinkedIn', date: 'okt 2023' },
  { name: 'Learning Network Troubleshooting', issuer: 'LinkedIn', date: 'okt 2023' },
  {
    name: 'Cisco CCNA (200-301) Cert Prep: Network Fundamentals and Access',
    issuer: 'LinkedIn',
    date: 'okt 2023',
  },
  { name: 'Leveraging ChatGPT for Smarter Cybersecurity', issuer: 'LinkedIn', date: 'okt 2023' },
  { name: 'Crash Course on Python', issuer: 'Coursera', date: 'mrt 2022' },
  { name: 'Vaardig communiceren in de ICT', issuer: 'Hanze', date: 'jan 2023' },
  {
    name: 'Introduction to Parametric Feature-Based CAD',
    issuer: 'Onshape by PTC',
    date: 'nov 2025',
  },
];

export const nl: Content = {
  ui,
  profile,
  facts,
  projects,
  capabilities,
  timeline,
  education,
  certifications,
};
