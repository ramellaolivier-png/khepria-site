# Landing « Lancement à venir » (hexagone animé) — page statique servie par nginx.
# Pas de build : le HTML est autonome (CSS/JS/SVG inline) ; seules l'image de fond et l'aperçu de partage l'accompagnent.
# Écoute sur 3000 : port déclaré au label Traefik du conteneur khepria-landing (loadbalancer.server.port=3000).
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html fond.webp og.jpg /usr/share/nginx/html/

EXPOSE 3000

# nginx tourne déjà en foreground via le CMD de l'image de base.
