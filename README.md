# khepria.pro — landing « Bientôt en ligne »

Page de pré-lancement de **kheprIA** (agence IA pour les PME de Nouvelle-Aquitaine, Limoges),
servie sur `khepria.pro`.

## Contenu

- [`index.html`](index.html) — landing **autonome** : CSS, JS et SVG sont *inline*, aucune
  dépendance réseau ni build. Exportée depuis Claude Design. CTA : `mailto:contact@khepria.pro`.

## Déploiement (Coolify / VPS Hostinger)

Le site est servi en **statique par nginx** (pas de Node, pas de build) :

- [`Dockerfile`](Dockerfile) — image `nginx:alpine` qui copie `index.html` et `nginx.conf`.
- [`nginx.conf`](nginx.conf) — écoute sur le port **3000** (conserve le mapping Coolify
  existant), sert `index.html` pour tout chemin, expose `/health` et `/api/health`.

Coolify (build pack **Dockerfile**) construit l'image et la sert derrière Traefik.
Tester l'image en local :

```bash
docker build -t khepria-landing .
docker run --rm -p 3000:3000 khepria-landing
# http://localhost:3000
```

## Historique

Ce dépôt portait auparavant la vitrine Next.js multi-pages (hero 3D, services, contact).
Ce code reste disponible dans l'historique git (commit parent de la bascule) et dans le
workspace de dev local `Siteweb`.
