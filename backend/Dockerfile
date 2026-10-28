FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
# Les fichiers restent la propriété de root : l'utilisateur node peut les lire
# mais pas les modifier
COPY . .
# Utilisateur non-root fourni par l'image node
USER node
EXPOSE 3000
CMD ["node", "index.js"]