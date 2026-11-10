# khepria.pro — landing « Lancement à venir »

Page de pré-lancement de **kheprIA** (agence IA pour les PME de Nouvelle-Aquitaine, Limoges),
servie sur `khepria.pro`.

## Contenu

- [`index.html`](index.html) — landing **autonome** (CSS, JS, police Manrope et SVG *inline*,
  aucune dépendance réseau ni build) : hero canvas (hexagone or/cyan tracé, soleil levant, flux de
  lumière interactifs au pointeur) centré sur **KheprIA Entreprise** (agents IA pour TPE), section
  « Notre atelier » (**KheprIA OS** + espaces clients protégés), schémas SVG animés et pied d'appel
  « premières entreprises » + `mailto:olivier@khepria.pro`.
  `prefers-reduced-motion` fige toutes les animations.
  Section « Questions » (FAQ en `<details>`) et pied avec lien vers les mentions légales.
- [`mentions-legales.html`](mentions-legales.html) — mentions légales (éditeur : micro-entreprise
  d'Olivier, hébergeur OVH) et information sur les données personnelles, servie sur
  `/mentions-legales`, non indexée. **Tant qu'elle contient « À COMPLÉTER », le bloc de mise à jour
  refuse de déployer.**
- [`404.html`](404.html), [`robots.txt`](robots.txt) — vraie page d'erreur et robots.
- [`og.jpg`](og.jpg) — aperçu de partage 1200×630.

## Déploiement (VPS OVH, conteneur hors Coolify)

Le site est servi en **statique par nginx** (pas de Node, pas de build) :

- [`Dockerfile`](Dockerfile) — image `nginx:1.27-alpine` qui copie les pages, `robots.txt`, `og.jpg` et `nginx.conf`.
- [`nginx.conf`](nginx.conf) — écoute sur le port **3000**, sert `/` et `/mentions-legales`, renvoie un
  **vrai 404** pour tout chemin inconnu, pose les en-têtes de sécurité (HSTS, CSP, `nosniff`,
  `Referrer-Policy`), coupe le journal des visites (engagement des mentions légales), expose
  `/health` et `/api/health`.

Depuis le 07/10/2026, `khepria.pro` et `www` sont servis par le conteneur **`khepria-landing`**,
lancé à la main sur le VPS OVH (hors Coolify, réseau `coolify`, routeurs Traefik priorité 1000),
à partir du clone `/opt/khepria-landing`.

**Mise à jour sans recréer le conteneur** (garde ses labels Traefik, son réseau et sa politique
de redémarrage) — à lancer sur le VPS (utilisateur `khepria`), une fois la branche fusionnée dans
`main`. Le clone appartient à root (créé par `sudo git clone`) : tout passe par `sudo`.
Le bloc tourne dans un sous-shell `set -e` et s'arrête à la première erreur ; si le `pull`, le
build ou le test de la conf échoue, le conteneur en ligne n'a pas été touché.

```bash
(
set -euo pipefail
D=/opt/khepria-landing
B=~/landing-avant-$(date +%Y%m%d-%H%M%S)   # sauvegarde horodatee, jamais ecrasee par une relance
mkdir "$B"
sudo git -C "$D" rev-parse HEAD > "$B/commit"
sudo docker cp khepria-landing:/usr/share/nginx/html/index.html "$B/"
sudo docker cp khepria-landing:/etc/nginx/conf.d/default.conf "$B/"
sudo git -C "$D" pull --ff-only
if grep -q 'COMPL.TER' "$D/mentions-legales.html"; then echo "STOP - mentions legales incompletes"; exit 1; fi
sudo docker build -q -t khepria-landing:latest "$D"   # image a jour pour une future recreation
sudo docker run --rm khepria-landing:latest nginx -t  # teste la nouvelle conf hors du conteneur en ligne
for f in og.jpg robots.txt 404.html mentions-legales.html index.html; do sudo docker cp "$D/$f" khepria-landing:/usr/share/nginx/html/$f; done
sudo docker cp "$D/nginx.conf" khepria-landing:/etc/nginx/conf.d/default.conf
sudo docker exec khepria-landing nginx -t
sudo docker exec khepria-landing nginx -s reload
sudo docker exec khepria-landing rm -f /usr/share/nginx/html/fond.webp   # image de l'ancienne scene, retiree du depot
echo "OK - sauvegarde : $B"
)
# attendu : / 200 text/html, /mentions-legales 200 text/html, /robots.txt 200 text/plain, /og.jpg 200 image/jpeg, /absent 404, /health 200
for u in / /mentions-legales /robots.txt /og.jpg /absent /health; do printf '%-18s ' $u; curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://khepria.pro$u; done
curl -s https://khepria.pro/ | grep -c 'href="/mentions-legales"'   # > 0 : nouvelle page (absent de l'ancienne)
curl -sI https://khepria.pro/ | grep -ci 'content-security-policy'  # 1 : en-tetes de securite en place
```

Les mentions légales affirment que le serveur n'enregistre pas les visites. nginx est réglé pour
(`access_log off`), mais **vérifier aussi Traefik** après le premier déploiement de cette version :
`sudo docker inspect coolify-proxy | grep -i accesslog` ne doit rien afficher. S'il journalise les
accès, le couper ou corriger la phrase de `mentions-legales.html`.

Si le bloc s'arrête **après** la copie de `nginx.conf` (test ou reload en échec), nginx tourne encore
sur l'ancienne conf mais un redémarrage du conteneur échouerait : faire tout de suite le retour arrière.

**Retour arrière** — avec le dossier affiché à la fin (le **premier** si la mise à jour a été relancée) :

```bash
B=~/landing-avant-AAAAMMJJ-HHMMSS
sudo docker cp "$B/default.conf" khepria-landing:/etc/nginx/conf.d/default.conf
sudo docker cp "$B/index.html" khepria-landing:/usr/share/nginx/html/index.html
sudo docker exec khepria-landing nginx -t && sudo docker exec khepria-landing nginx -s reload
# facultatif, utile seulement si le conteneur doit être recréé : clone et image sur l'ancienne version
sudo git -C /opt/khepria-landing reset --hard "$(cat "$B/commit")" && sudo docker build -q -t khepria-landing:latest /opt/khepria-landing
```

Les fichiers ajoutés (`mentions-legales.html`, `404.html`, `robots.txt`) restent dans le conteneur après
un retour arrière : sans effet, l'ancienne conf ne les sert pas. Les fichiers copiés survivent à un `docker restart`, pas à un `docker rm` ; l'image
`khepria-landing:latest` étant reconstruite à chaque mise à jour, un `docker rm` suivi du même
`docker run` (labels visibles avec `sudo docker inspect khepria-landing`) redonne la version en ligne.

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
