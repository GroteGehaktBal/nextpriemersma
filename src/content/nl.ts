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
  nav: {
    label: 'Hoofdnavigatie',
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
      text: 'Beschikbaar voor freelance opdrachten en domoticaprojecten in Friesland en de rest van Noord-Nederland.',
    },
  },
  background: {
    experience: 'Werkervaring',
    education: 'Opleidingen',
    certifications: 'Certificeringen',
    certificationsLead: 'Cisco CCNA eerst, daarna de rest volledig.',
  },
  contactPage: {
    title: 'Neem contact op',
    lead: 'Een netwerk, een huis, of iets dat het niet meer doet zoals het hoort — vertel wat er speelt, dan laat ik van me horen.',
    nameLabel: 'Je naam',
    emailLabel: 'Je e-mailadres',
    messageLabel: 'Je bericht',
    submit: 'Verstuur bericht',
    honeypotLabel: 'Laat dit veld leeg',
    error:
      'Het versturen is niet gelukt. Controleer je e-mailadres en je bericht en probeer het opnieuw — of mail me direct op het adres hieronder.',
    directLabel: 'Of mail me direct',
    thanksTitle: 'Bericht verstuurd',
    thanksBody: 'Dank je — het is aangekomen, en ik reageer zo snel als ik kan.',
    thanksBack: 'Terug naar de homepagina',
  },
  skipToContent: 'Naar de inhoud',
  notFound: 'Deze pagina bestaat niet — terug naar de homepagina',
  caseStudy: {
    back: 'Alle projecten',
    withLabel: 'Samen met',
    more: 'Bekijk alle projecten',
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
  metaDescription:
    'Netwerk- en securityengineer in Friesland. Cisco CCNA, acht maanden bij Google in de Eemshaven, mede-eigenaar van pyxels, freelance bij Riemersma ICT.',
  availability: 'Open voor freelance- en domoticaopdrachten',
  email: 'peter@riemersmaict.nl',
  github: 'https://github.com/grotegehaktbal',
  linkedin: 'https://www.linkedin.com/in/peter-riemersma/',
  address: { locality: 'Burum', region: 'Friesland', country: 'NL' },
};

const facts: Fact[] = [
  { label: 'Gecertificeerd', value: 'Cisco CCNA' },
  { label: 'Stage', value: 'Google, Eemshaven' },
  { label: 'Snelheid', value: '10GbE / Wi-Fi 7' },
  { label: 'Talen', value: 'NL / EN' },
];

const projects: Project[] = [
  {
    slug: 'pyxels',
    kind: 'Onderneming',
    title: 'Domotica bij pyxels',
    summary:
      'Mede-oprichter van een studio die complete smart home-systemen ontwerpt en installeert: verlichting, klimaat en beveiliging, op een netwerk dat ervoor gebouwd is. Elke installatie begint bij de infrastructuur, want automatisering is nooit betrouwbaarder dan de verbinding eronder.',
    stack: ['Home Assistant', 'Wi-Fi 7', '10GbE', 'Zigbee', 'ESPHome'],
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
      'Computerhulp voor particulieren en oplossingen op maat voor bedrijven: thuis uitzoeken waarom iets niet meer werkt en het verhelpen, en voor bedrijven iets bouwen dat past bij hoe zij werken in plaats van een standaardpakket.',
    stack: ['Particulieren', 'Bedrijven', 'Computerhulp', 'Maatwerk'],
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
    keywords: ['Firewalling', 'VPN', 'Netwerksegmentatie', 'Toegangsbeheer', 'Hardening'],
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
    period: 'sep 2026 — feb 2027',
    role: 'Network & Security Engineering, stage',
    organisation: 'OnlyWow — Kollum',
    description:
      'Zes maanden aan de netwerken en infrastructuur achter een Friese e-commercegroep die door heel Europa levert.',
    current: true,
  },
  {
    period: '2024 — heden',
    role: 'Mede-eigenaar',
    organisation: 'pyxels',
    description:
      'Veilige high-speed netwerken met 10GbE en Wi-Fi 7, en complete domotica-installaties voor verlichting, klimaatbeheersing en beveiliging.',
    current: true,
  },
  {
    period: '2023 — heden',
    role: 'ICT-diensten, freelance',
    organisation: 'Riemersma ICT',
    description:
      'Particulieren helpen met computerproblemen thuis, en bedrijven met oplossingen die zijn afgestemd op hun manier van werken.',
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
