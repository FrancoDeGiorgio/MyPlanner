# ============================================================================
# DOCKERFILE FRONTEND - MyPlanner React App (Multistage Build)
# ============================================================================
# Questo Dockerfile utilizza una build multistage per ottimizzare l'immagine finale:
# - Stage 1 (build): Compila l'applicazione React/Vite con Node.js
# - Stage 2 (production): Serve i file statici compilati con Nginx
# Questo approccio riduce drasticamente la dimensione dell'immagine finale
# eliminando Node.js e tutte le dipendenze di sviluppo non necessarie a runtime.

# ============================================================================
# STAGE 1: BUILD - Compilazione dell'applicazione React
# ============================================================================

# Utilizza l'immagine Node.js 20 basata su Alpine Linux (molto leggera)
# Alpine è una distribuzione Linux minimale che riduce la dimensione dell'immagine
FROM node:20-alpine AS build

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# ============================================================================
# VARIABILI D'AMBIENTE PER LA BUILD
# ============================================================================
# CI=1: Indica che siamo in un ambiente CI/CD, questo può influenzare il comportamento
#       di alcuni strumenti npm che potrebbero saltare interattività o output verboso
ENV CI=1

# ============================================================================
# INSTALLAZIONE DIPENDENZE NPM
# ============================================================================
# Copia solo i file package.json e package-lock.json (se presente)
# Questa separazione permette a Docker di utilizzare la cache del layer se
# le dipendenze non cambiano, evitando di reinstallare npm install ad ogni build
# anche quando cambia solo il codice sorgente
COPY package*.json ./

# Installa tutte le dipendenze npm (sia dependencies che devDependencies)
# Le devDependencies sono necessarie per la fase di build (es. Vite, TailwindCSS)
RUN npm install

# ============================================================================
# COPIA CODICE SORGENTE E BUILD
# ============================================================================
# Copia tutto il codice sorgente dell'applicazione nella directory di lavoro
# Questo viene fatto dopo l'installazione delle dipendenze per ottimizzare
# la cache di Docker: se solo il codice cambia, npm install non viene rieseguito
COPY . .

# ============================================================================
# CONFIGURAZIONE VARIABILI D'AMBIENTE PER VITE
# ============================================================================
# ARG: Definisce una variabile che può essere passata al momento della build
#      tramite docker build --build-arg VITE_API_URL=...
#      Utile per configurare l'URL dell'API backend in base all'ambiente
ARG VITE_API_URL=http://localhost:8000

# ENV: Converte l'ARG in una variabile d'ambiente che sarà disponibile durante
#      la fase di build. Vite legge le variabili che iniziano con VITE_ e le
#      incorpora nel bundle JavaScript compilato
ENV VITE_API_URL=$VITE_API_URL

# ============================================================================
# COMPILAZIONE DELL'APPLICAZIONE
# ============================================================================
# Esegue il comando di build definito in package.json (npm run build)
# Questo comando:
#   1. Compila il codice React/JSX in JavaScript vanilla
#   2. Processa i file CSS/TailwindCSS
#   3. Ottimizza e minimizza il codice
#   4. Genera i file statici nella directory /app/dist
#   5. Incorpora le variabili d'ambiente VITE_* nel bundle finale
RUN npm run build

# ============================================================================
# STAGE 2: PRODUCTION - Server web per file statici
# ============================================================================

# Utilizza l'immagine Nginx basata su Alpine Linux (estremamente leggera)
# Nginx è un server web ad alte prestazioni ideale per servire file statici
# Alpine riduce ulteriormente la dimensione rispetto a immagini basate su Debian
FROM nginx:alpine AS production

# ============================================================================
# COPIA FILE COMPILATI DALLO STAGE DI BUILD
# ============================================================================
# --from=build: Copia file dallo stage "build" invece che dal filesystem host
# /app/dist: Directory dove Vite ha generato i file statici compilati
# /usr/share/nginx/html: Directory standard di Nginx dove servire i file statici
# Questa è la directory che Nginx usa come root del sito web
COPY --from=build /app/dist /usr/share/nginx/html

# ============================================================================
# CONFIGURAZIONE NGINX
# ============================================================================
# Copia il file di configurazione personalizzato di Nginx
# Questo file configura:
#   - Routing per SPA (Single Page Application): tutte le route non trovate
#     vengono reindirizzate a index.html per permettere al routing client-side
#     di React Router di funzionare correttamente
#   - Cache per asset statici (JS, CSS, immagini) per migliorare le performance
#   - Configurazione della porta 80 (HTTP standard)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ============================================================================
# ESPOSIZIONE PORTA
# ============================================================================
# Espone la porta 80 su cui Nginx sarà in ascolto
# Questa è solo una documentazione: l'esposizione effettiva e il mapping
# della porta avvengono nel docker-compose.yml
EXPOSE 80

# ============================================================================
# COMANDO DI AVVIO
# ============================================================================
# Avvia Nginx in modalità foreground (non come daemon)
# -g "daemon off;": Esegue Nginx in primo piano invece che come processo in background
#                   Questo è necessario perché Docker richiede che il processo principale
#                   rimanga in esecuzione, altrimenti il container si fermerebbe
CMD ["nginx", "-g", "daemon off;"]


