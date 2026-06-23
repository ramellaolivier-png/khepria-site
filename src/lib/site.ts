export const SITE = {
  name: "kheprIA",
  domain: "https://khepria.pro",
  email: "olivier@khepria.pro",
  city: "Limoges",
  region: "Nouvelle-Aquitaine",
  baseline: "Des outils IA qui tournent en prod. Pour les PME d'ici.",
} as const;

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;

export type Service = {
  slug: string;
  title: string;
  pitch: string;
  delivers: string;
  delay: string;
};

export const SERVICES: Service[] = [
  { slug: "chatbot", title: "Chatbot IA sur mesure", pitch: "FAQ, support client, qualification de leads, intégré à votre site ou vos outils.", delivers: "Un chatbot branché sur vos contenus, déployé et maintenu.", delay: "2–4 semaines" },
  { slug: "assistant-interne", title: "Assistant IA interne", pitch: "Un assistant branché sur la base de connaissances de votre entreprise.", delivers: "Un assistant RAG privé, vos documents, vos règles.", delay: "3–6 semaines" },
  { slug: "automatisation", title: "Automatisation (n8n)", pitch: "Syncs CRM, rappels, reporting, intégrations tierces : le répétitif en pilote auto.", delivers: "Des workflows n8n self-hosted, documentés.", delay: "1–3 semaines / workflow" },
  { slug: "dev-sur-mesure", title: "Développement IA sur mesure", pitch: "Traitement de documents, analyse de données, génération de contenu.", delivers: "Un outil sur mesure (Next.js + Claude API + Supabase).", delay: "4–12 semaines" },
  { slug: "conseil", title: "Conseil / Stratégie IA", pitch: "Audit de vos process, recommandations d'outils, roadmap IA 6–12 mois.", delivers: "Un rapport + un plan d'action actionnable.", delay: "½ à 1 journée" },
];
