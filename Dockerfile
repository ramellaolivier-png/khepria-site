# Landing "Bientôt en ligne" — page statique servie par nginx.
# Pas de build : le HTML est autonome (CSS/JS/SVG inline, zéro dépendance réseau).
# Écoute sur 3000 pour conserver le mapping de port existant côté Coolify.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 3000

# nginx tourne déjà en foreground via le CMD de l'image de base.
