# Wir starten mit einem Node-Bild, das Chrome-Abhängigkeiten installieren kann
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# Umgebungsvariablen setzen
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Package Files kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm ci

# Restlichen Code kopieren
COPY . .

# TypeScript bauen
RUN npm run build

# Port freigeben
EXPOSE 3001

# Starten
CMD [ "npm", "start" ]