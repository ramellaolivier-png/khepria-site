# khepria.pro — landing « Lancement à venir »

Page de pré-lancement de **kheprIA** (agence IA pour les PME de Nouvelle-Aquitaine, Limoges),
servie sur `khepria.pro`.

## Contenu

- [`index.html`](index.html) — landing **autonome** (CSS, JS, police Manrope et SVG *inline*,
  aucune dépendance réseau ni build) : le logo hexagonal or/cyan s'allume et irrigue l'écran
  de flux de lumière (canvas 2D, interactif au pointeur). Message discret « Lancement à venir »
  et CTA `mailto:olivier@khepria.pro`. Source : variante B de `projects/landing-hexagone`.
- [`fond.webp`](fond.webp) — image de la scène (941×1672). [`og.jpg`](og.jpg) — aperçu de partage 1200×630.
- Paramètres de vérification : `?intro` rejoue l'intro complète, `?debug` affiche les tracés ;
  `window.__rendre(t)` dessine la scène au temps `t` (captures).

## Déploiement (VPS OVH, conteneur hors Coolify)

Le site est servi en **statique par nginx** (pas de Node, pas de build) :

- [`Dockerfile`](Dockerfile) — image `nginx:1.27-alpine` qui copie `index.html`, `fond.webp`, `og.jpg` et `nginx.conf`.
- [`nginx.conf`](nginx.conf) — écoute sur le port **3000**, sert `index.html` pour tout chemin
  (sauf les images : 404 si absentes, cache 7 j), expose `/health` et `/api/health`.

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
sudo docker build -q -t khepria-landing:latest "$D"   # image a jour pour une future recreation
sudo docker run --rm khepria-landing:latest nginx -t  # teste la nouvelle conf hors du conteneur en ligne
for f in fond.webp og.jpg index.html; do sudo docker cp "$D/$f" khepria-landing:/usr/share/nginx/html/$f; done
sudo docker cp "$D/nginx.conf" khepria-landing:/etc/nginx/conf.d/default.conf
sudo docker exec khepria-landing nginx -t
sudo docker exec khepria-landing nginx -s reload
echo "OK - sauvegarde : $B"
)
# attendu : / 200 text/html, /fond.webp 200 image/webp, /og.jpg 200 image/jpeg, /absent.jpg 404, /health 200
for u in / /fond.webp /og.jpg /absent.jpg /health; do printf '%-12s ' $u; curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://khepria.pro$u; done
curl -s https://khepria.pro/ | grep -c 'khepria.pro/og.jpg'   # > 0 : nouvelle page (absent de l'ancienne)
```

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

`fond.webp` et `og.jpg` restent dans le conteneur après un retour arrière : sans effet, l'ancienne page
ne les appelle pas. Les fichiers copiés survivent à un `docker restart`, pas à un `docker rm` ; l'image
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
