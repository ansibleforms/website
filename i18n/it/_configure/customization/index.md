---
layout: default
title: Variabili d'ambiente
nav_order: 8
has_children: true
has_toc: false
permalink: /customization/
translated_from: fd6e83f3550f59aa576c8addaf28bfa6115b96a0
---

# Variabili d'ambiente
{: .no_toc }

Configura AnsibleForms con le variabili d'ambiente
{: .fs-6 .fw-300 }

---

Per gli amministratori che installano AnsibleForms: le variabili d'ambiente che il server legge, raggruppate per argomento.

AnsibleForms si regola con le variabili d'ambiente, che giri con Docker Compose, su Kubernetes o dai sorgenti.

---

## Da dove arrivano i valori

Il server legge ogni variabile dalla prima di queste fonti che la imposta, quindi un valore più in alto nella lista vince sempre:

1. **L'ambiente del processo**: `environment:` ed `env_file:` in docker-compose (il `.env` del progetto viene passato così),
   `env` ed `envFrom` su Kubernetes, o la shell che avvia `node`.
2. **`persistent/.env`**, il file che scrivono le pagine delle impostazioni (`data/.env` nel progetto docker-compose, un altro percorso con
   `MANAGED_ENV_PATH`). Viene letto a ogni avvio, anche in produzione, e non sovrascrive mai una variabile già impostata.
3. **`server/.env.<NODE_ENV>`**, per esempio `.env.development`. Viene letto solo quando `NODE_ENV` non è `production` (o con
   `FORCE_DOTENV=1`), in pratica quando si esegue [dai sorgenti](../installation/from-source.html) in modalità sviluppo.
4. **Il valore predefinito integrato**, mostrato nelle tabelle di ogni gruppo.

Le pagine delle impostazioni, in **Impostazioni > Generale**, mostrano il valore in vigore e salvano le modifiche in `persistent/.env`. Molte variabili
si applicano appena salvate; le altre vengono salvate ma richiedono un riavvio, e la pagina le elenca dopo il salvataggio. Una variabile impostata
nell'ambiente del processo non si può modificare lì: la pagina la mostra come *Impostata nell'ambiente, non modificabile qui.*
Alcune variabili, come `ENCRYPTION_SECRET` e `ACCESS_TOKEN_SECRET`, non si possono mai modificare dalla pagina.

Le variabili che legge un RTE, come `AF_ROLE`, `RTE_MODE`, `APP_URL` o `RTE_MAX_JOBS`, non compaiono affatto nelle pagine delle impostazioni:
l'app non le usa, quindi impostale nell'ambiente in cui gira l'RTE. Le variabili `RTE_*` che legge l'app stessa,
`RTE_QUEUE_MINUTES` e `RTE_FILES_MAX_MB`, sono l'eccezione e restano nelle pagine. Quattro variabili dell'RTE, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` e `RTE_DRAIN_SECONDS`, si possono invece impostare per singolo RTE nella sua pagina del runner, dove un valore vince sulla
variabile (vedi [Le impostazioni di un RTE](../runners/runner-page.html#an-rtes-settings)).

Con [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` le pagine mostrano solo i valori e il salvataggio viene rifiutato. Usala
quando l'ambiente è dichiarato in un manifest, come descritto in [Modifica e audit](../seed/environment-and-audit.html).

Il [config seed](../seed/) non imposta nessuna variabile d'ambiente. Dichiara oggetti che vengono salvati nel database, e i
riferimenti `${ENV_VAR}` al suo interno vengono risolti dall'ambiente del server in esecuzione.

Alcune variabili si leggono solo dall'ambiente e non sono nelle tabelle: `MANAGED_ENV_PATH` e `FORCE_DOTENV`, descritte
sopra, e le variabili di proxy di sistema `HTTPS_PROXY` e `NO_PROXY` (lette anche in minuscolo). Un RTE in uscita contatta l'app tramite
`HTTPS_PROXY`, e un RTE in entrata invia tramite esso la sua chiamata di registrazione, a meno che l'host dell'app non sia in `NO_PROXY` (nomi host,
suffissi `.domain`, o `*` per ogni host).

Le variabili contrassegnate con <span class="af-badge af-badge-secret">Segreto</span> contengono una password, un token o una chiave: tienile fuori dal controllo
di versione, per esempio in un Secret di Kubernetes o in un file `.env` di cui non si fa commit.

---

## In questa sezione

Le variabili sono raggruppate per argomento, con una pagina per gruppo:

| Pagina | Cosa tratta |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Altre variabili

Le seguenti variabili non sono ancora assegnate a un gruppo:

{{ other }}
{% endif %}
