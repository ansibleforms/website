---
layout: default
title: In produzione
nav_order: 13
has_children: true
has_toc: false
permalink: /production/
translated_from: 9f501893a2c4476707ac2f11f25e67998200e9e7
---

# In produzione
{: .no_toc }

Pubblica, fai il backup e monitora un'istanza da cui dipendono delle persone
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Prima di andare in produzione

I valori predefiniti mettono in funzione un'istanza in fretta, ma molti di essi servono solo per una prima occhiata. AnsibleForms
registra un avviso `[SECURITY]` all'avvio quando `ENCRYPTION_SECRET` o `ACCESS_TOKEN_SECRET` non sono impostate, e la
pagina **Stato** riporta i backup, le impostazioni di conservazione e il sanitizer delle espressioni.

---

## Checklist per la produzione

Passa in rassegna questi punti una volta prima che gli utenti dipendano dall'istanza, e di nuovo dopo un aggiornamento importante:

| Punto | Cosa fare | Dettagli |
|------|------------|---------|
| Password dell'admin | Cambia la password dell'account admin locale | [Hardening](../security/hardening.html#the-admin-account) |
| Segreto di cifratura | Imposta [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) prima di salvare qualsiasi credenziale | [Segreti e cifratura](../security/secrets.html#the-two-master-secrets) |
| Segreto dei token | Imposta [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), così le sessioni sopravvivono a un riavvio | [Segreti e cifratura](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Termina il TLS con il tuo certificato, non con quello di esempio | [HTTPS](../security/https.html) |
| Reverse proxy | Pubblica l'istanza dietro un proxy, se vuoi sotto [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Endpoint dello schema | Imposta [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0` una volta che lo schema esiste | [Hardening](../security/hardening.html#the-database) |
| Chiamate in uscita | Limita le espressioni REST con [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Hardening](../security/hardening.html#expressions-and-outbound-calls) |
| Funzionalità facoltative | Lascia MCP e l'assistente chat disattivati se non li usi | [Hardening](../security/hardening.html#optional-features) |
| Backup | Verifica che il backup notturno funzioni, e copialo fuori dall'host | [Backup](backups.html) |
| Conservazione | Decidi per quanto tempo conservare i job e le voci di audit | [Log](logs.html#retention) |

---

## In questa sezione

Ogni argomento ha una pagina propria; la messa in sicurezza dell'istanza è trattata in [Sicurezza](../security/):

| Pagina | Cosa tratta |
|---|---|
| [Reverse proxy](reverse-proxy.html) | Pubblicare AnsibleForms dietro Nginx, Traefik o Apache, alla radice o sotto un sottopercorso |
| [Backup](backups.html) | Backup notturni, cosa contengono, ripristini, e cos'altro conservare |
| [Log](logs.html) | File di log, syslog, la traccia di audit, e la conservazione dei job e delle voci di audit |
| [Scalabilità](scaling.html) | Più nodi dell'app con un worker; l'RTE ha una sezione propria, [Ambienti di esecuzione](../rte/) |
| [Monitoraggio](monitoring.html) | Probe di salute, metriche Prometheus e la pagina Stato |
