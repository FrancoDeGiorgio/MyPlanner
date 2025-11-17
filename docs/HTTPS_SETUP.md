# HTTPS/TLS Setup Guide

Questa guida spiega come configurare HTTPS/TLS per MyPlanner in produzione e sviluppo.

## Produzione

### Opzione 1: Reverse Proxy con Nginx + Let's Encrypt

#### 1. Installa Certbot
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

#### 2. Ottieni Certificato Let's Encrypt
```bash
sudo certbot --nginx -d api.example.com
```

#### 3. Configurazione Nginx
```nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot si rinnova automaticamente via systemd timer
```

### Opzione 2: Docker con Traefik

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    labels:
      - "traefik.enable=true"

  backend:
    # ... configurazione backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.example.com`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
```

## Sviluppo Locale

### Self-Signed Certificate

#### 1. Genera Certificato
```bash
# Crea directory per certificati
mkdir -p certs
cd certs

# Genera chiave privata
openssl genrsa -out key.pem 4096

# Genera certificato self-signed
openssl req -new -x509 -key key.pem -out cert.pem -days 365 \
  -subj "/C=IT/ST=State/L=City/O=MyPlanner/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"
```

#### 2. Avvia Backend con SSL
```bash
cd MyPlanner_BackEnd
uvicorn main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile ../certs/key.pem \
  --ssl-certfile ../certs/cert.pem
```

#### 3. Accetta Certificato nel Browser
- Chrome/Edge: Vai a `https://localhost:8000`, clicca "Advanced" → "Proceed to localhost"
- Firefox: Vai a `https://localhost:8000`, clicca "Advanced" → "Accept the Risk"

### mkcert (Raccomandato per sviluppo)

```bash
# Installa mkcert
# Windows: scoop install mkcert
# macOS: brew install mkcert
# Linux: vedi https://github.com/FiloSottile/mkcert

# Installa CA locale
mkcert -install

# Genera certificato per localhost
mkcert localhost 127.0.0.1 ::1

# Usa i file generati (localhost.pem e localhost-key.pem)
uvicorn main:app --ssl-keyfile localhost-key.pem --ssl-certfile localhost.pem
```

## Verifica Configurazione

### Test SSL Labs
Visita https://www.ssllabs.com/ssltest/ e inserisci il tuo dominio.

### Test Locale
```bash
# Verifica certificato
openssl s_client -connect localhost:8000 -showcerts

# Verifica configurazione TLS
nmap --script ssl-enum-ciphers -p 443 api.example.com
```

## Troubleshooting

### Errore "Certificate verify failed"
- Verifica che il certificato sia valido e non scaduto
- In sviluppo, accetta il certificato self-signed nel browser
- Verifica che il certificato corrisponda al dominio

### Errore "Mixed Content"
- Assicurati che tutte le risorse (CSS, JS, immagini) siano servite via HTTPS
- Controlla la console del browser per risorse HTTP

### HSTS Preload
Per aggiungere il dominio alla HSTS preload list:
1. Configura HSTS con `includeSubDomains` e `preload`
2. Visita https://hstspreload.org/
3. Invia il dominio per preload

## Note Importanti

- **Mai usare certificati self-signed in produzione**
- **Rinnova certificati Let's Encrypt prima della scadenza (90 giorni)**
- **Usa TLS 1.2+ in produzione (TLS 1.3 raccomandato)**
- **Configura HSTS per massima sicurezza**
- **Monitora scadenze certificati**

