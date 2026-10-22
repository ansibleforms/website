---
layout: default
title: Eventi in tempo reale
parent: API REST
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Eventi in tempo reale
{: .no_toc }

Sapere quando cambiano job e impostazioni, invece di interrogare a intervalli
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Il server comunica ai suoi client cosa cambia, nel momento in cui cambia. Anche uno script può mettersi in ascolto, invece di leggere un job ogni pochi secondi.

---

## Lo stream

`GET /api/v2/events` è uno stream di [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
che resta aperto. Qualsiasi utente che ha effettuato l'accesso può aprirlo, con il solito bearer token:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Quando qualcosa cambia, invia un evento `changed` con il nome di ciò che è cambiato:

```text
event: changed
data: {"name":"jobs"}
```

---

## Nomi degli eventi

Un evento porta solo un nome, mai dati, quindi non rivela nulla che l'utente non possa vedere. Vengono inviati questi nomi:

| Nome | Cosa è cambiato |
|---|---|
| `jobs` | Un job: avviato, il suo stato o il suo output, eliminato |
| `appearance` | Le impostazioni mostrate dall'intestazione: il tema, il nome, un annuncio, una variabile d'ambiente |
| `designer` | Un blocco del designer, preso o rilasciato |
| `runners` | Un runner (dalla 7.3.0): un RTE si è connesso o disconnesso, ha chiesto di unirsi, è stato approvato o rifiutato, o ha cambiato modalità o impostazioni |

Quando ricevi un nome, rileggi ciò che mostri tramite la normale API (per esempio `GET /api/v2/job/42`), con i tuoi
permessi. Un nome molto frequente viene inviato al massimo una volta al secondo.

---

## Tenerlo aperto

Lo stream è fatto per sopravvivere a proxy e load balancer, e un client si riconnette da solo:

* Alla connessione, il server invia un evento `hello`, e chiede al client di attendere 3 secondi prima di riconnettersi.
* Ogni 15 secondi invia una riga di commento (`: ping`), così una connessione inattiva non viene chiusa. Ignora le righe che iniziano con `:`.
* Gli eventi di ogni nodo dell'app raggiungono ogni stream, qualunque sia il nodo a cui è connesso il client.
* Dopo una riconnessione, rileggi ciò che mostri: un evento inviato mentre lo stream era interrotto non viene inviato di nuovo.

---

## Salute e metriche

Le sonde di liveness e readiness (`/api/v2/live`, `/api/v2/ready`) e le metriche Prometheus (`/api/v2/metrics`) sono
pensate per gli strumenti di monitoraggio più che per script che agiscono come un utente. Vedi [Monitoraggio](../production/monitoring.html).
