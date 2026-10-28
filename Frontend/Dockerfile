# Image nginx officielle qui tourne en non-root (utilisateur nginx, UID 101)
FROM nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html liste.html form.html style.css script.js liste.js form.js /usr/share/nginx/html/

# Un utilisateur non-root ne peut pas écouter sur un port < 1024
EXPOSE 8080