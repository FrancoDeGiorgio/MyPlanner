# ✅ Rebuild Docker Completato - Nuova Versione SQLAlchemy + Alembic

## 🎉 Stato Attuale

**Data:** 6 Novembre 2025
**Versione:** Backend con SQLAlchemy ORM + Alembic

### Container Attivi:

```
✅ myplanner_backend   - FastAPI + SQLAlchemy   (porta 8000)
✅ myplanner_db        - PostgreSQL 15          (porta 5432)
✅ myplanner_frontend  - React + Nginx          (porta 3000)
```

### Database:

```
✅ Tabella: users
✅ Tabella: tasks
✅ Tabella: alembic_version (tracking migrazioni)
```

### Alembic:

```
✅ Versione corrente: 001 (head)
✅ Sincronizzato con il database esistente
```

---

## 🌐 Accesso all'Applicazione

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentazione API (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📋 Comandi Utili

### Gestione Container

```powershell
# Vedere lo stato dei container
docker-compose ps

# Vedere i logs
docker-compose logs backend
docker-compose logs -f backend  # In tempo reale

# Fermare tutto
docker-compose down

# Riavviare
docker-compose up -d

# Rebuild (solo se cambi requirements.txt)
docker-compose build backend
docker-compose up -d
```

### Gestione Alembic

```powershell
# Vedere la versione corrente
docker-compose exec backend alembic current

# Vedere lo storico migrazioni
docker-compose exec backend alembic history

# Creare una nuova migrazione (dopo aver modificato i modelli)
docker-compose exec backend alembic revision --autogenerate -m "descrizione"

# Applicare migrazioni
docker-compose exec backend alembic upgrade head

# Rollback di una migrazione
docker-compose exec backend alembic downgrade -1
```

### Gestione Database

```powershell
# Accedere al database
docker-compose exec db psql -U myplanner -d myplanner

# Dentro psql:
\dt                           # Lista tabelle
\d tasks                      # Struttura tabella tasks
SELECT * FROM users;          # Query
\q                            # Esci

# Query rapide da PowerShell
docker-compose exec db psql -U myplanner -d myplanner -c "SELECT COUNT(*) FROM users;"
docker-compose exec db psql -U myplanner -d myplanner -c "SELECT COUNT(*) FROM tasks;"
```

---

## 🧪 Test: Aggiungere una Colonna (Esempio)

Ecco come testare il sistema di migrazioni aggiungendo una colonna `priority` alla tabella `tasks`:

### 1. Modifica il modello ORM

Apri `MyPlanner_BackEnd/app/models/task.py` e aggiungi dopo la colonna `completed`:

```python
priority = Column(
    Integer,
    server_default='0',
    nullable=False,
    comment="Priorità task (0=bassa, 1=media, 2=alta)"
)
```

**✅ Salva** → Il backend si ricarica automaticamente!

### 2. Genera la migrazione

```powershell
docker-compose exec backend alembic revision --autogenerate -m "add_priority_to_tasks"
```

Output:
```
INFO  [alembic.autogenerate.compare] Detected added column 'tasks.priority'
Generating C:\...\app\migrations\versions\002_add_priority_to_tasks.py ... done
```

### 3. Verifica il file generato

Il file appare in `MyPlanner_BackEnd/app/migrations/versions/002_add_priority_to_tasks.py`

### 4. Applica la migrazione

```powershell
docker-compose exec backend alembic upgrade head
```

Output:
```
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, add_priority_to_tasks
```

### 5. Verifica nel database

```powershell
docker-compose exec db psql -U myplanner -d myplanner -c "\d tasks"
```

Vedrai la nuova colonna `priority`! ✅

### 6. Test Rollback (opzionale)

```powershell
# Torna indietro
docker-compose exec backend alembic downgrade -1

# Verifica che la colonna sia sparita
docker-compose exec db psql -U myplanner -d myplanner -c "\d tasks"

# Riapplica
docker-compose exec backend alembic upgrade head
```

---

## 🔄 Workflow di Sviluppo

### Sviluppo Backend (Python)

1. **Modifica file Python** sul tuo PC
2. **Salva** → Backend si ricarica automaticamente ✅
3. **ZERO rebuild necessari** ✅

### Sviluppo Frontend (React)

**Opzione A - Locale (CONSIGLIATO):**

```powershell
# Terminale 1: Backend in Docker
docker-compose up -d backend db

# Terminale 2: Frontend locale con hot-reload
cd MyPlanner_FrontEnd
npm run dev
# Frontend su http://localhost:5173 con hot-reload istantaneo!
```

**Opzione B - Docker (per test prod):**

```powershell
# Modifichi file React
# → Devi fare rebuild:
docker-compose build frontend
docker-compose up -d frontend
```

### Aggiungere una Nuova Tabella

1. **Crea il modello** in `app/models/nuova_tabella.py`
2. **Registra** in `app/models/__init__.py`
3. **Genera migrazione:** `docker-compose exec backend alembic revision --autogenerate -m "add_nuova_tabella"`
4. **Applica:** `docker-compose exec backend alembic upgrade head`
5. **Crea repository, service, route** come sempre

**✅ ZERO rebuild necessari!**

---

## 🛠️ Troubleshooting

### Backend non parte

```powershell
# Vedi i logs
docker-compose logs backend

# Rebuild se necessario
docker-compose build --no-cache backend
docker-compose up -d
```

### Errori Alembic

```powershell
# "Can't locate revision"
docker-compose exec backend alembic stamp head

# "Target database is not up to date"
docker-compose exec backend alembic upgrade head

# Vedere cosa è cambiato
docker-compose exec backend alembic history
```

### Database problems

```powershell
# Reset completo (CANCELLA TUTTO!)
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic stamp head
```

### Import errors nel backend

```powershell
# Verifica che le dipendenze siano installate
docker-compose exec backend pip list | grep sqlalchemy
docker-compose exec backend pip list | grep alembic

# Se mancano, rebuild:
docker-compose build --no-cache backend
docker-compose up -d
```

---

## 📊 Differenze Rispetto alla Vecchia Versione

| Aspetto | Vecchia Versione | Nuova Versione |
|---------|------------------|----------------|
| Database Access | psycopg2 raw SQL | SQLAlchemy ORM |
| Modelli | dataclass | SQLAlchemy models |
| Migrazioni | init.sql manuale | Alembic automatico |
| RLS | Decorator manuale | Event listener automatico |
| Repository | Restituiscono dict | Restituiscono ORM objects |
| Type Safety | Limitato | Completo con ORM |
| Query | SQL string manuale | Query builder ORM |

---

## ✨ Vantaggi della Nuova Architettura

1. ✅ **Migrazioni Automatiche:** Alembic rileva i cambiamenti automaticamente
2. ✅ **Type Safety:** SQLAlchemy fornisce type hints migliori
3. ✅ **Meno SQL Manuale:** Query ORM più leggibili
4. ✅ **Versionamento DB:** Storico completo delle modifiche
5. ✅ **Rollback Facile:** Puoi tornare indietro facilmente
6. ✅ **Testing:** Mock e fixture più semplici
7. ✅ **Relazioni:** Navigare tra User e Task è immediato

---

## 📝 Prossimi Passi

1. ✅ **Sistema funzionante** - Tutto operativo!
2. 🔄 **Testa le API** - Registrazione, login, CRUD tasks
3. 🔄 **Prova una migrazione** - Aggiungi colonna `priority` per test
4. 🔄 **Sviluppa nuove feature** - Il sistema è pronto!

---

## 🆘 Serve Aiuto?

- **Documentazione:** Vedi `MIGRATION_TO_SQLALCHEMY.md`
- **Logs Backend:** `docker-compose logs -f backend`
- **Logs Database:** `docker-compose logs -f db`
- **Stato Container:** `docker-compose ps`
- **API Docs:** http://localhost:8000/docs

---

**🎉 Complimenti! Il sistema è pronto per lo sviluppo con SQLAlchemy + Alembic!**

