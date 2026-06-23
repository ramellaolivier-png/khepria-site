# Site vitrine kheprIA

Site vitrine de **kheprIA**, agence IA pour les PME de Nouvelle-Aquitaine (Limoges).
Site marketing : présentation des services, des produits, de l'équipe, et un formulaire de contact.

> ## 🎨 But de ce dépôt — étude de refonte graphique
>
> Ce dépôt est partagé pour **étudier le site et proposer une nouvelle direction graphique**.
> Le code est fonctionnel mais le design est **en cours de recherche** — n'hésite pas à
> repenser librement l'identité visuelle (palette, typographie, mise en page, mouvement),
> tout en conservant la structure des pages et le contenu.
>
> **Direction visuelle actuelle (perfectible)** : blanc, minimaliste, « futuriste » façon Apple,
> avec un objet 3D épuré en hero et des animations fluides au scroll. C'est précisément
> cette couche graphique qu'on cherche à élever.

## Stack

- **Next.js 16** (App Router) · **TypeScript** strict
- **Tailwind v4** (tokens de design en variables CSS, dans `src/app/globals.css`)
- **three.js / @react-three/fiber** — objet 3D du hero (lazy, avec fallback statique)
- **GSAP + Lenis + Motion** — smooth-scroll et reveals au scroll
- Tests : **Vitest** (unit) + **Playwright** (e2e)

## Structure

```
src/
  app/                 # Pages (App Router) : accueil, services, à-propos, contact, légales
    globals.css        # Tokens de design (couleurs, polices) — point d'entrée d'une refonte
    layout.tsx         # Layout racine, polices, header/footer, smooth-scroll
  components/
    sections/          # Sections de la home (hero, stats, services, dogfooding, équipe, cta)
    motion/            # Primitives d'animation (reveal, smooth-scroll, …)
    webgl/             # Scène 3D du hero (R3F) + fallback
    site-header / site-footer
  lib/                 # Constantes du site, schéma du formulaire, utilitaires
public/                # Assets statiques (placeholders à remplacer)
```

Bons points d'entrée pour une refonte : `src/app/globals.css` (palette + polices),
`src/components/sections/*` (composition de chaque section), `src/app/layout.tsx`.

## Démarrer

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Autres scripts : `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test`, `pnpm e2e`.

## Notes

- Les **assets** (photos d'équipe, captures produits, texture 3D) sont des **placeholders**.
- Le **formulaire de contact** poste vers une route serveur `/api/contact` qui relaie vers un
  backend configurable (`PLATFORM_LEADS_URL`, voir `.env.example`) — aucune clé n'est incluse.
- Contenu en **français**, cible PME locales.
