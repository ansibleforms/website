---
layout: default
title: Monitoraggio
parent: In produzione
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Monitoraggio
{: .no_toc }

Probe di salute per un load balancer o Kubernetes, metriche Prometheus, e la pagina Stato
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Probe di salute

Due endpoint dicono a un load balancer, a un healthcheck di container o a Kubernetes se un processo può ricevere traffico.
Nessuno dei due richiede un accesso, e nessuno dei due restituisce nulla sulla configurazione:

| Endpoint | Risponde | Usalo per |
|----------|---------|------------|
| `/api/v2/live` | `200` con `{"status":"live"}` finché il processo gira | Una liveness probe: riavvia il processo quando smette di rispondere |
| `/api/v2/ready` | `200` con `{"status":"ready"}`, o `503` con `{"status":"not ready","reason":"..."}` | Una readiness probe: invia traffico solo ai processi pronti |

Un processo è pronto quando valgono tutte queste condizioni:

* non si sta arrestando (`stopping`)
* il database risponde (`database unreachable`)
* lo schema esiste (`schema not provisioned`) ed è completo, con ogni tabella, colonna e indice di questa versione
  (`schema not upgraded`); quest'ultimo controllo resta in cache per 30 secondi, così una probe ogni pochi secondi resta economica

Sotto un [`BASE_URL`](../customization/server.html#env_BASE_URL) i percorsi iniziano con esso, per esempio
`/ansibleforms/api/v2/ready`. Un ambiente di esecuzione (RTE) risponde alle stesse probe su `/live` e `/ready`, senza il
controllo di completezza dello schema; non è pronto mentre smaltisce i suoi job all'arresto, così non gli viene inviato nessun nuovo job. Un RTE in uscita
inoltre non è pronto (`not connected to the app`) finché il suo socket verso l'app non è aperto.
Un processo avviato con `AF_ROLE=worker` non ha interfaccia web: risponde solo a `/api/v2/version` e `/health` per l'healthcheck
del suo container. Vedi [Scalabilità](scaling.html) per i ruoli.

---

## Metriche Prometheus

Imposta [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) con una stringa casuale lunga per esporre le metriche Prometheus.
Un processo che serve l'applicazione web risponde su `/api/v2/metrics`, un RTE su `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Senza `METRICS_TOKEN` gli endpoint rispondono `404`, come se non esistessero, e una richiesta senza l'intestazione
`Authorization: Bearer <token>` corretta riceve `401`. Ogni processo riporta i propri valori, quindi raccoglili da ciascuno:

| Metrica | Cosa misura |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | Il processo: CPU, memoria, ritardo dell'event loop, garbage collection |
| `af_http_requests_total{route,method,status}` | Le richieste servite |
| `af_http_request_duration_seconds{route}` | Quanto tempo hanno richiesto |
| `af_jobs{status}` | I job in esecuzione (`running`) o in attesa di approvazione (`approve`) in questo momento |
| `af_jobs_ended_24h{status}` | I job terminati nelle ultime 24 ore, per stato |
| `af_nodes{role,alive}` | I processi registrati nel database, per ruolo, vivi o no |
| `af_login_failures_total`, `af_login_lockouts_total` | Accessi non riusciti e blocchi di account |
| `af_rte_running_jobs`, `af_rte_max_jobs` | Su un RTE: i playbook che esegue ora, e quanti ne può eseguire insieme |
| `af_rte_socket_connected` | Su un RTE in modalità socket: `1` finché il suo socket verso l'app è aperto, `0` quando non lo è |

I valori dei job e dei nodi si leggono dal database a ogni raccolta. Quando il database non risponde vengono lasciati
fuori, e la raccolta riesce comunque con le altre metriche.

---

## La pagina Stato

La pagina **Stato**, in **Impostazioni > Sistema**, mostra agli utenti con l'opzione di ruolo `showSettings` come sta l'istanza.
Si limita a leggere, quindi aggiornarla non invia mai mail né lancia job. Ha due schede, e il numero di problemi compare sull'etichetta della scheda **Controlli**.

### Controlli

Ogni controllo è verde (sano), ambra (richiede attenzione) o rosso (un problema), con i suoi dettagli quando si espande la riga:

| Controllo | Cosa guarda |
|-------|------------------|
| Connessione al database | Il database risponde |
| Utente del database | Ambra quando l'utente ha diritti su ogni database, come `root`, invece che solo su `AnsibleForms.*` |
| Schema del database | Ogni tabella, colonna e indice di questa versione esiste, e quale patch non è riuscita quando non è così |
| Pianificatore | Un worker esegue le attività di sistema, e nessuna di esse ha smesso di essere pianificata |
| Nodi | I processi nel database, ambra quando eseguono versioni diverse |
| Job | I job in esecuzione e quelli in attesa di approvazione, ambra quando un job gira da più di 24 ore |
| Strumenti di backup | Il comando di dump di [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) esiste, e la sua versione |
| Ultimo backup | Ambra quando non ce n'è nessuno o il più recente ha più di due giorni, rosso quando non ha un dump utilizzabile |
| Blocco del designer | Chi detiene il blocco del designer, ambra quando è detenuto da più di 8 ore |
| Repository | Rosso quando un repository non è riuscito o non ha un working tree su disco |
| Seed di configurazione | Il file del [config seed](../seed/) è leggibile e si analizza, e il suo ultimo ricaricamento ha funzionato |
| Archivi di segreti | Ogni archivio di segreti risponde, ambra quando il token di un HashiCorp Vault scade presto |
| Runner | Ogni runner risponde, ambra quando non ce n'è nessuno o non c'è un RTE predefinito |
| Espressioni server | Ambra quando [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) è `legacy` |
| Segreti | Ambra quando `ENCRYPTION_SECRET` è il valore predefinito pubblico o `ACCESS_TOKEN_SECRET` non è impostato |
| LDAP | Il server LDAP è raggiungibile e il suo certificato TLS è valido, senza accedervi |
| Archiviazione job | La dimensione delle tabelle dei job, ambra oltre 1 GB quando non è impostata nessuna conservazione dei job |
| Cartelle scrivibili | Ogni cartella configurata è scrivibile |
| Spazio su disco | Il disco che contiene i backup, ambra dall'85% di uso e rosso dal 95% |

### Informazioni

Dati sull'istanza senza un verdetto, le prime cose che chiede una conversazione di supporto: la versione di
AnsibleForms, l'URL di base, la versione e l'host del database, l'origine della configurazione, il config seed, le impostazioni
di conservazione, i metodi di autenticazione, il server del [canale mail](../notification-channels.html) attivo, il livello
e il percorso del log, l'uptime, il fuso orario, la versione di Node.js e la piattaforma.

La pagina legge `/api/v2/health`, che richiede un utente che ha effettuato l'accesso con `showSettings`. Per un sistema di monitoraggio, usa invece le
probe e le metriche descritte sopra.
