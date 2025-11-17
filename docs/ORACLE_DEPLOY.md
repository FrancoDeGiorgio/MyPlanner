# Deploy su Oracle Cloud Free Tier

Questa guida spiega come deployare MyPlanner su Oracle Cloud utilizzando:
- **VM Always Free** (eu-turin-1 / Milan datacenter)
- **Oracle Container Registry (OCIR)** per le immagini Docker
- **GitHub Actions** per CI/CD automatico

## Indice

1. [Prerequisiti Oracle Cloud](#prerequisiti-oracle-cloud)
2. [Setup OCIR (Oracle Container Registry)](#setup-ocir)
3. [Creazione e configurazione VM](#creazione-e-configurazione-vm)
4. [Setup Docker sulla VM](#setup-docker-sulla-vm)
5. [Configurazione GitHub Secrets](#configurazione-github-secrets)
6. [Deploy iniziale manuale](#deploy-iniziale-manuale)
7. [Deploy automatico con GitHub Actions](#deploy-automatico-con-github-actions)
8. [Sviluppo locale con hot-reload](#sviluppo-locale-con-hot-reload)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisiti Oracle Cloud

Prima di iniziare, assicurati di avere:

1. **Account Oracle Cloud Free Tier** attivo
2. **Tenancy** configurata in **eu-turin-1** (Milan/Turin)
3. **VCN (Virtual Cloud Network)** con subnet pubblica
4. **Accesso alla console Oracle Cloud**

Se non hai ancora creato la VCN, Oracle la crea automaticamente alla prima creazione di una VM.

---

## Setup OCIR

### 1. Creare Auth Token per OCIR

L'Auth Token è necessario per autenticarsi su OCIR (come una password Docker).

1. **Login** su [Oracle Cloud Console](https://cloud.oracle.com)
2. Clicca sull'**icona profilo** in alto a destra → **User Settings**
3. Nel menu a sinistra: **Auth Tokens** → **Generate Token**
4. Nome token: `github-actions-myplanner`
5. **Clicca Generate** → copia il token (appare una sola volta!)
6. **Salva il token** in un posto sicuro (servirà per GitHub Secrets)

### 2. Ottenere il Namespace OCIR

Il namespace è l'identificatore unico della tua tenancy su OCIR.

1. Menu principale → **Developer Services** → **Container Registry**
2. In alto vedrai: **Namespace: `xxxxx`**
3. **Copia questo valore** (es. `axghpqabcdef`)
4. Il formato completo sarà: `eu-milan-1.ocir.io/NAMESPACE/myplanner/backend`

**Nota**: Oracle usa `eu-milan-1` come region key per la regione eu-turin-1.

### 3. Ottenere il tuo Username OCIR

Il formato username per OCIR è: `NAMESPACE/USERNAME`

- **NAMESPACE**: quello ottenuto al punto 2
- **USERNAME**: il tuo username Oracle Cloud o email

Esempio completo: `axghpqabcdef/oracleidentitycloudservice/mario.rossi@example.com`

---

## Creazione e configurazione VM

### 1. Creare la VM Compute

1. Menu principale → **Compute** → **Instances** → **Create Instance**
2. Configurazione:
   - **Nome**: `myplanner-vm`
   - **Image**: Ubuntu 22.04 (Canonical)
   - **Shape**: VM.Standard.E2.1.Micro (Always Free eligible - 1 OCPU, 1GB RAM)
   - **VCN**: seleziona o crea VCN pubblica
   - **Subnet**: seleziona subnet pubblica
   - **Assign public IP**: **Yes**
3. **SSH Keys**:
   - Seleziona "Generate a key pair for me"
   - **Scarica la chiave privata** (.pem) → servirà per GitHub Actions
   - **Salva il file** come `myplanner-vm-private-key.pem`
4. **Boot volume**: 50 GB (default, Always Free)
5. Clicca **Create**

Attendi 1-2 minuti per la creazione. Annota l'**IP pubblico** della VM (es. `158.101.xxx.xxx`).

### 2. Configurare Security List / NSG

Per permettere traffico web alla VM, devi aprire le porte necessarie.

#### Opzione A: Security List (più semplice)

1. Vai alla tua **VCN** → **Security Lists** → **Default Security List**
2. Clicca **Add Ingress Rules**
3. Aggiungi queste regole:

| Source CIDR | Protocol | Destination Port | Descrizione |
|-------------|----------|------------------|-------------|
| `0.0.0.0/0` | TCP | 80 | Frontend HTTP |
| `0.0.0.0/0` | TCP | 8000 | Backend API |
| `TUO_IP/32` | TCP | 22 | SSH (sostituisci con il tuo IP) |

**Nota sicurezza**: Per SSH (porta 22), usa il tuo IP specifico invece di `0.0.0.0/0`.

4. Clicca **Add Ingress Rules**

#### Opzione B: Network Security Group (più flessibile)

Segui la [documentazione Oracle](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/networksecuritygroups.htm) per NSG.

---

## Setup Docker sulla VM

### 1. Connettiti alla VM via SSH

```bash
# Da Windows PowerShell o terminale
ssh -i myplanner-vm-private-key.pem ubuntu@VM_PUBLIC_IP

# Se errore "permissions too open":
# Windows: icacls myplanner-vm-private-key.pem /inheritance:r /grant:r "%USERNAME%:R"
# Linux/Mac: chmod 400 myplanner-vm-private-key.pem
```

### 2. Installa Docker e Docker Compose

```bash
# Aggiorna sistema
sudo apt update
sudo apt upgrade -y

# Installa dipendenze
sudo apt install -y ca-certificates curl gnupg lsb-release

# Aggiungi repository Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installa Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verifica installazione
docker --version
docker compose version
```

### 3. Configura permessi Docker

```bash
# Aggiungi utente ubuntu al gruppo docker (per usare docker senza sudo)
sudo usermod -aG docker ubuntu

# Applica il gruppo senza logout
newgrp docker

# Verifica che funzioni
docker ps
```

### 4. Configura firewall OS (UFW)

```bash
# Apri le porte necessarie
sudo ufw allow 80/tcp    # Frontend
sudo ufw allow 8000/tcp  # Backend API
sudo ufw allow 22/tcp    # SSH

# Abilita firewall
sudo ufw enable

# Verifica regole
sudo ufw status
```

### 5. Crea directory progetto

```bash
# Crea directory per il progetto
sudo mkdir -p /opt/myplanner
sudo chown ubuntu:ubuntu /opt/myplanner
cd /opt/myplanner
```

---

## Configurazione GitHub Secrets

Nel tuo repository GitHub, vai a: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Aggiungi i seguenti secrets:

| Secret Name | Valore | Descrizione |
|-------------|--------|-------------|
| `OCIR_NAMESPACE` | `axghpqabcdef` | Namespace OCIR della tua tenancy |
| `OCIR_USERNAME` | `namespace/oracleidentitycloudservice/user@email.com` | Username completo OCIR |
| `OCIR_AUTH_TOKEN` | `xxxxxxxxxx` | Auth Token generato in precedenza |
| `VM_PUBLIC_IP` | `158.101.xxx.xxx` | IP pubblico della tua VM |
| `VM_USER` | `ubuntu` | Username SSH (sempre ubuntu per Ubuntu) |
| `VM_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Contenuto completo del file .pem |

**Nota per VM_SSH_KEY**: Copia tutto il contenuto del file `.pem` inclusi `-----BEGIN RSA PRIVATE KEY-----` e `-----END RSA PRIVATE KEY-----`.

---

## Deploy iniziale manuale

Prima di attivare GitHub Actions, facciamo un deploy manuale per verificare che tutto funzioni.

### 1. Clona il repository sulla VM

```bash
# Connettiti alla VM
ssh -i myplanner-vm-private-key.pem ubuntu@VM_PUBLIC_IP

# Vai alla directory progetto
cd /opt/myplanner

# Clona il repository (sostituisci con il tuo URL)
git clone https://github.com/TUO-USERNAME/MyPlanner.git .
```

### 2. Crea file docker-compose.env

```bash
# Crea il file di configurazione
nano docker-compose.env
```

Inserisci queste variabili (sostituisci i valori):

```bash
# Database
POSTGRES_DB=myplanner
POSTGRES_USER=myplanner
POSTGRES_PASSWORD=GENERA_PASSWORD_SICURA_QUI

# Backend
SECRET_KEY=GENERA_CON_python3_-c_"import_secrets;_print(secrets.token_urlsafe(32))"
DATABASE_URL=postgresql://myplanner:TUA_PASSWORD@db:5432/myplanner
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production

# Porte
DB_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=80

# Oracle OCIR
OCIR_NAMESPACE=tuo-namespace-ocir

# CORS (importante: usa l'IP pubblico della VM)
CORS_ALLOWED_ORIGINS=http://158.101.xxx.xxx

# Uvicorn workers
UVICORN_WORKERS=4

# Frontend (per build)
VITE_API_URL=http://158.101.xxx.xxx:8000
```

**Genera SECRET_KEY sicura**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Salva il file: **Ctrl+O**, **Enter**, **Ctrl+X**

### 3. Login su OCIR

```bash
# Login su Oracle Container Registry
docker login eu-milan-1.ocir.io -u 'NAMESPACE/USERNAME' -p 'AUTH_TOKEN'

# Esempio:
# docker login eu-milan-1.ocir.io -u 'axghpqabcdef/oracleidentitycloudservice/mario@example.com' -p 'aBc123XyZ...'
```

### 4. Deploy con Docker Compose

```bash
# Build e avvia i container (primo deploy)
# Nota: il primo deploy non usa immagini OCIR, quindi usa docker-compose.yml normale
docker compose --env-file docker-compose.env up -d --build

# Verifica che tutto sia attivo
docker compose ps

# Verifica i log
docker compose logs -f backend
docker compose logs -f frontend
```

### 5. Verifica l'app

Apri il browser:
- **Frontend**: `http://158.101.xxx.xxx` (sostituisci con il tuo IP)
- **Backend API Docs**: `http://158.101.xxx.xxx:8000/docs`

Se tutto funziona, procedi al setup GitHub Actions.

---

## Deploy automatico con GitHub Actions

Una volta configurati i GitHub Secrets, ogni push su `main` attiverà automaticamente:

1. **Build** delle immagini Docker per backend e frontend
2. **Push** su OCIR (Oracle Container Registry)
3. **Deploy** automatico sulla VM tramite SSH

### Workflow già configurato

Il workflow è già presente in `.github/workflows/deploy-oracle.yml` e fa:

```yaml
name: Deploy to Oracle Cloud

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Permette trigger manuale

jobs:
  build-and-push:
    # Build immagini e push su OCIR
  deploy:
    # Deploy su VM via SSH
```

### Trigger manuale

Puoi anche triggerare il deploy manualmente:
1. Vai su GitHub → **Actions** → **Deploy to Oracle Cloud**
2. Clicca **Run workflow** → **Run workflow**

### Monitorare il deploy

1. GitHub → **Actions** → seleziona l'ultimo workflow
2. Osserva i log dei job `build-and-push` e `deploy`
3. Dopo ~3-5 minuti, l'app è aggiornata su Oracle Cloud

---

## Sviluppo locale con hot-reload

Per lavorare in locale con hot-reload automatico (modifiche visibili subito):

### 1. Crea docker-compose.env locale

```bash
# Copia l'esempio
cp docker-compose.env.example docker-compose.env

# Modifica i valori
nano docker-compose.env
```

Valori minimi per sviluppo locale:

```bash
POSTGRES_DB=myplanner
POSTGRES_USER=myplanner
POSTGRES_PASSWORD=local_dev_password
SECRET_KEY=local_dev_secret_key_almeno_32_caratteri_qui
DATABASE_URL=postgresql://myplanner:local_dev_password@db:5432/myplanner
BACKEND_PORT=8000
FRONTEND_DEV_PORT=5173
VITE_API_URL=http://localhost:8000
ENVIRONMENT=development
```

### 2. Avvia in modalità dev

```bash
# Usa docker-compose.dev.yml per hot-reload
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.dev.yml up --build

# Oppure in background
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### 3. Accedi all'app in dev

- **Frontend con Vite hot-reload**: `http://localhost:5173`
- **Backend con Uvicorn reload**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

### 4. Modifica il codice

- **Backend**: Modifica file in `MyPlanner_BackEnd/` → Uvicorn ricarica automaticamente
- **Frontend**: Modifica file in `MyPlanner_FrontEnd/src/` → Vite aggiorna il browser (HMR)

### 5. Stop

```bash
# Ferma i container
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.dev.yml down

# Ferma e rimuovi volumi (database reset)
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.dev.yml down -v
```

---

## Troubleshooting

### Errore: "Cannot connect to database"

**Causa**: Database non raggiungibile.

**Soluzione**:
```bash
# Verifica che il container db sia in esecuzione
docker compose ps

# Verifica i log del database
docker compose logs db

# Verifica DATABASE_URL in docker-compose.env
cat docker-compose.env | grep DATABASE_URL
```

### Errore: "SECRET_KEY must be at least 32 characters"

**Causa**: SECRET_KEY troppo corta.

**Soluzione**:
```bash
# Genera una chiave sicura
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Aggiorna docker-compose.env
nano docker-compose.env
# SECRET_KEY=output_del_comando_sopra
```

### Errore CORS: "Access-Control-Allow-Origin"

**Causa**: CORS_ALLOWED_ORIGINS non configurato correttamente.

**Soluzione**:
```bash
# In produzione, verifica CORS_ALLOWED_ORIGINS in docker-compose.env
CORS_ALLOWED_ORIGINS=http://158.101.xxx.xxx

# Riavvia il backend
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### GitHub Actions fallisce: "Authentication failed"

**Causa**: OCIR_AUTH_TOKEN, OCIR_NAMESPACE o OCIR_USERNAME errati.

**Soluzione**:
1. Verifica i GitHub Secrets
2. Rigenera un nuovo Auth Token su Oracle Cloud
3. Aggiorna il secret `OCIR_AUTH_TOKEN`

### SSH deploy fallisce: "Permission denied"

**Causa**: VM_SSH_KEY non corretto o permessi sbagliati.

**Soluzione**:
1. Verifica che VM_SSH_KEY contenga tutto il file .pem (inclusi header/footer)
2. Verifica che VM_PUBLIC_IP sia corretto
3. Verifica che VM_USER sia `ubuntu`

### Container non si avviano: "port already in use"

**Causa**: Porte 80, 8000 o 5432 già occupate.

**Soluzione**:
```bash
# Verifica processi in ascolto
sudo lsof -i :80
sudo lsof -i :8000
sudo lsof -i :5432

# Ferma processi in conflitto o cambia porte in docker-compose.env
```

### Frontend non carica: ERR_CONNECTION_REFUSED

**Causa**: Security List Oracle non configurata o UFW blocca le porte.

**Soluzione**:
```bash
# Verifica UFW sulla VM
sudo ufw status

# Verifica Security List su Oracle Cloud Console
# VCN → Security Lists → Verifica Ingress Rules per porta 80

# Verifica che il container sia in esecuzione
docker compose ps
```

---

## Comandi utili

### Gestione container su VM

```bash
# Stato container
docker compose ps

# Log in tempo reale
docker compose logs -f

# Log specifico servizio
docker compose logs -f backend
docker compose logs -f frontend

# Riavvia servizio specifico
docker compose restart backend

# Ricostruisci immagini
docker compose up -d --build

# Ferma tutto
docker compose down

# Ferma e rimuovi volumi (database reset)
docker compose down -v
```

### Aggiornamento manuale immagini OCIR

```bash
# Su VM, pull delle nuove immagini
cd /opt/myplanner
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.prod.yml pull

# Riavvia con nuove immagini
docker compose --env-file docker-compose.env -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Pulizia spazio disco

```bash
# Rimuovi immagini non usate
docker image prune -a

# Rimuovi tutto (container, volumi, network, immagini)
docker system prune -a --volumes
```

---

## Prossimi passi (opzionale)

### 1. Configurare HTTPS con Let's Encrypt

Usa **Caddy** o **Nginx** come reverse proxy per HTTPS automatico:
- Guida già presente in `docs/HTTPS_SETUP.md`

### 2. Configurare dominio personalizzato

Invece di `http://158.101.xxx.xxx`, usa `https://myplanner.tuodominio.it`:
1. Acquista un dominio
2. Configura DNS A record → IP pubblico VM
3. Segui setup HTTPS

### 3. Configurare backup automatico database

```bash
# Script backup PostgreSQL
docker compose exec db pg_dump -U myplanner myplanner > backup_$(date +%Y%m%d).sql
```

### 4. Monitoraggio e alerting

Considera:
- **Prometheus + Grafana** per monitoring
- **Uptime Kuma** per health checks
- **Oracle Cloud Monitoring** per metriche VM

---

## Risorse utili

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Oracle Container Registry Documentation](https://docs.oracle.com/en-us/iaas/Content/Registry/home.htm)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Supporto

Per problemi o domande:
1. Verifica la sezione [Troubleshooting](#troubleshooting)
2. Controlla i log: `docker compose logs -f`
3. Verifica GitHub Actions logs per errori di deploy
4. Apri una issue su GitHub

---

**Ultimo aggiornamento**: Novembre 2025

