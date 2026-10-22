---
layout: default
title: Eseguire un RTE
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Eseguire un RTE
{: .no_toc }

Le impostazioni di ogni modalità, e come avviare un RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Impostazioni

Ciò di cui ha bisogno un RTE dipende dalla sua modalità (vedi [Modalità](modes.html)). Ogni RTE legge queste:

| Variabile | Significato |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Dalla 7.3.0: `outbound` (contatta l'app), `inbound` (l'app lo contatta) o `database` (deprecata, la predefinita per tutta la 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Il token tra l'app e l'RTE, di almeno 16 caratteri; l'RTE si rifiuta di partire senza |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Quanti playbook esegue insieme, `10` per impostazione predefinita (`0` non imposta alcun limite). Un job per un RTE pieno attende finché un playbook non termina |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | All'arresto, quanto attende i suoi playbook in esecuzione, `25` per impostazione predefinita; quelli ancora in esecuzione terminano allora come abbandonati |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Letta dai nodi dell'app e dal worker, non dall'RTE: quanto attende un job per un RTE pieno o in arresto, `60` per impostazione predefinita |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | La cartella dei playbook e il limite dell'output: le legge l'RTE, quindi impostale nel suo ambiente |
| `LISTEN_HOST` | Dalla 7.3.0: l'indirizzo su cui si mettono in ascolto i suoi listener, ogni interfaccia per impostazione predefinita; `127.0.0.1` quando nulla lo contatta dall'esterno (un RTE in uscita) |

Un RTE in una modalità socket, `outbound` o `inbound`, legge anche queste, e nessuna `DB_*` né `ENCRYPTION_SECRET`:

| Variabile | Significato |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | L'indirizzo dell'app come lo aprono le persone, come `https://forms.example.com`. In uscita: l'indirizzo che contatta. In entrata: l'indirizzo della sua unica chiamata di registrazione |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (predefinito): il certificato dell'app deve essere valido. `0` accetta qualsiasi certificato, solo all'interno di una rete fidata |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Il nome del suo runner, che i moduli indicano con `runner:`. Se non è impostata: il suo id di nodo, `rte-<hostname>-<port>`, che cambia con il container: impostala in produzione |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Facoltativa, solo la prima volta: un join token, creato tramite l'API, che approva subito il suo runner invece di attendere un admin (vedi [Join token](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | In entrata, quando chiede di unirsi: l'indirizzo che l'app contatta, come `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predefinito): l'app invia i playbook e gli inventari con il job. `local`: gira dalle proprie cartelle montate |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Dove l'output, gli eventi e la fine di ogni job attendono che l'app li abbia salvati, `<persistent>/rte-spool` per impostazione predefinita: tienilo su un volume |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Con `transfer`: dove si conservano le cartelle inviate dall'app, `<persistent>/rte-files` per impostazione predefinita |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Con `transfer`: quanto spazio possono occupare quelle cartelle, `1024` per impostazione predefinita; quelle usate meno di recente se ne vanno per prime, e `0` non ne conserva nessuna |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Letta dall'app, non dall'RTE: la cartella più grande che invia con `transfer`, `512` per impostazione predefinita |

Su un RTE in una modalità socket, `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` e `RTE_CACHE_MB` si possono anche impostare nella sua pagina del runner,
nella scheda RTE: un valore lì vince sulla variabile, che allora compila solo un campo lasciato vuoto (vedi
[Le impostazioni di un RTE](../runners/runner-page.html#an-rtes-settings)). Un valore fuori intervallo viene riportato al suo limite, e l'RTE lo segnala
all'avvio.

Un RTE in modalità database (deprecata) legge invece le impostazioni del database, e si registra da solo:

| Variabile | Significato |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Gli stessi valori dell'app: l'RTE legge i suoi job dal database e vi scrive il loro output |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | L'indirizzo su cui l'app chiama l'RTE, come `http://rte:8000`. Il runner prende il nome del suo host (`rte`), così i moduli possono usare `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Deprecata nella 7.3.0, insieme alla modalità database: un RTE in modalità socket si unisce invece con un join token. `1` (predefinito): l'RTE si aggiunge da solo in **Connessioni > Runner** al suo avvio, e il primo diventa il runner predefinito. `0`: aggiungilo tu lì, o nel [config seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Lo stesso valore dell'app, necessario solo per registrarsi da solo (il token del runner viene salvato cifrato); lascialo fuori con `RTE_REGISTER=0` |

In modalità database, senza `RTE_URL` l'RTE registra il suo indirizzo IP e la sua porta con il nome `rte-<hostname>-<port>`, che cambiano quando
il container viene ricreato: imposta `RTE_URL` in produzione. Il worker rimuove un runner che l'RTE ha registrato da solo 10 minuti dopo
l'ultimo heartbeat dell'RTE.

---

## Avviarlo

L'RTE esegue i playbook, quindi ha bisogno della sua cartella ssh, con la chiave privata e il `known_hosts` usati dai playbook, e di una cartella
persistente per il suo spool e i file che l'app invia. Scegli la modalità:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">In uscita</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">In entrata</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Database (deprecato)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Avvia l'RTE su qualsiasi host che raggiunge l'app, con il suo token e il nome che riceve il suo runner:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Contatta l'app e chiede di unirsi: **Connessioni > Runner** mostra il runner `rte-dmz` in attesa di approvazione, e il suo log mostra
l'impronta del suo token. Verifica che la sua revisione mostri la stessa impronta, poi fai clic su **Approva** (vedi
[Approvare un RTE](../runners/registration.html#approving-an-rte)): da quel momento riceve job, accedendo con il proprio `RTE_TOKEN`.
Per un avvio non presidiato, aggiungi `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, che lo approva subito. Nulla deve raggiungere questo
host: non pubblicare nessuna porta. Sulla sua `PORT` sono in ascolto solo `/live`, `/ready` e `/metrics`, per le probe.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Avvia l'RTE dove l'app lo raggiunge. Questo gira accanto all'app ed esegue i playbook dalle sue cartelle (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Poi dai all'app il suo runner: nel [config seed](../seed/), una credenziale RTE e un runner in entrata che accede con essa:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

Oppure aggiungi gli stessi due a mano: la credenziale in **Connessioni > Credenziali**, tipo RTE, e il runner in
**Connessioni > Runner**, tipo RTE, modalità **In entrata**, con quella credenziale. Per lasciare invece che l'RTE chieda di unirsi, avvialo con
`APP_URL` e `RTE_URL`, e approvalo in **Connessioni > Runner** (vedi [In entrata](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Deprecata dalla 7.3.0 e rimossa nella 8.0.0. L'RTE esegue i playbook dal proprio disco, quindi monta su di esso anche il volume persistente dell'app
(playbook, repository, caricamenti) e la sua cartella ssh. Un esempio Docker, con l'app raggiungibile come `ansibleforms` sulla
stessa rete:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Tieni un RTE in entrata fuori dalla rete pubblica: il suo socket risponde a chiunque abbia il token. `docker stop` attende solo 10 secondi prima
di uccidere un container, quindi dai all'RTE un timeout di arresto più lungo (`--stop-timeout`, o `stop_grace_period` in compose) o abbassa
`RTE_DRAIN_SECONDS`. Kubernetes attende 30 secondi per impostazione predefinita.

L'[installer](../installation/installer.html) configura un RTE in uscita o in entrata su un server proprio, con Docker, Podman o
[senza container](../installation/native.html), e stampa l'impronta con cui approvarlo. Per eseguire a mano un RTE in un altro datacenter,
segui [Un altro datacenter](another-datacenter.html).
