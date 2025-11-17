# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

Se trovi una vulnerabilità di sicurezza, **NON** aprire un issue pubblico. Invia invece una email a [security@example.com] o contatta il team di sicurezza direttamente.

## Security Measures Implemented

### Authentication & Authorization
- ✅ JWT con validazione completa (iss, aud, exp, nbf)
- ✅ Refresh token rotation e blacklist
- ✅ Password hashing con bcrypt (cost factor 12)
- ✅ Password strength validation (min 8 char, maiuscole, numeri, simboli)
- ✅ httpOnly cookies per refresh token
- ✅ Access token in memory (non localStorage)

### Data Protection
- ✅ HTTPS/TLS enforcement in produzione (HSTS)
- ✅ Input sanitization HTML (bleach)
- ✅ SQL injection prevention (prepared statements via SQLAlchemy)
- ✅ XSS prevention (CSP, output escaping)

### API Security
- ✅ Rate limiting globale (100 req/min per IP)
- ✅ Rate limiting login (5 tentativi/15 min)
- ✅ CSRF protection (double-submit cookie pattern)
- ✅ CORS con whitelist specifica
- ✅ Security headers (CSP, X-Frame-Options, HSTS, etc.)

### Infrastructure Security
- ✅ Docker non-root user
- ✅ Docker capabilities drop (cap_drop: ALL)
- ✅ Resource limits
- ✅ Environment variables per secrets (non hardcoded)
- ✅ Secret scanning (Gitleaks)
- ✅ Dependency scanning (pip-audit, npm audit)

## Security Best Practices

### Per Sviluppatori

1. **Mai committare secrets**: Usa sempre variabili d'ambiente
2. **Aggiorna dipendenze**: Esegui regolarmente `pip-audit` e `npm audit`
3. **Valida input**: Sempre validare e sanitizzare input utente
4. **Usa HTTPS**: Mai in produzione senza TLS
5. **Review del codice**: Richiedi sempre code review per cambiamenti di sicurezza

### Per Deployment

1. **SECRET_KEY**: Deve essere almeno 32 caratteri, unica per ambiente
2. **Database password**: Usa password forti e rotazione periodica
3. **HTTPS**: Configura sempre TLS con certificati validi
4. **Firewall**: Limita accesso alle porte esposte
5. **Monitoring**: Monitora tentativi di accesso falliti e rate limiting

## HTTPS/TLS Configuration

### Produzione

Usa un reverse proxy (Nginx, Traefik) con certificati Let's Encrypt:

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Sviluppo Locale

Per sviluppo locale con HTTPS self-signed:

```bash
# Genera certificato self-signed
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=localhost"

# Avvia backend con SSL
uvicorn main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile key.pem --ssl-certfile cert.pem
```

## Dependency Updates

### Backend (Python)
```bash
cd MyPlanner_BackEnd
pip-audit --desc
pip list --outdated
pip install --upgrade <package>
```

### Frontend (Node.js)
```bash
cd MyPlanner_FrontEnd
npm audit
npm audit fix
npm update <package>
```

## Secret Scanning

Gitleaks viene eseguito automaticamente in CI/CD. Per eseguirlo localmente:

```bash
# Installa Gitleaks
# Windows: scoop install gitleaks
# macOS: brew install gitleaks
# Linux: wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz

# Esegui scan
gitleaks detect --source . --config .gitleaks.toml --verbose
```

## Changelog Sicurezza

- **2025-01-15**: Implementato refresh token rotation e blacklist
- **2025-01-15**: Migrato da localStorage a httpOnly cookies per refresh token
- **2025-01-15**: Aggiunta validazione password strength
- **2025-01-15**: Implementato CSRF protection
- **2025-01-15**: Aggiunta sanitizzazione HTML con bleach
- **2025-01-15**: Rimossa SECRET_KEY fallback hardcoded
- **2025-01-15**: Configurato rate limiting globale
- **2025-01-15**: Restretto CORS a whitelist specifica

