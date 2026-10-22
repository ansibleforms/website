---
layout: default
title: Modalità
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Come un RTE comunica con l'app
{: .no_toc }

In uscita, in entrata o database: chi apre la connessione, e cosa vi passa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: dalla 7.3.0 un RTE comunica con l'app tramite un unico WebSocket e non contiene credenziali del database. Scegli la modalità
adatta alla rete tra di loro: chi può aprire una connessione verso chi, e attraverso quali proxy e firewall passa.

---

## Le tre modalità

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) sull'RTE dice come raggiunge l'app; il suo runner ha la stessa **Modalità**:

| Modalità | Chi apre la connessione | Cosa contiene l'RTE | Per |
|---|---|---|---|
| `outbound` | L'RTE contatta l'app in [`APP_URL`](../customization/server.html#env_APP_URL) e tiene aperto un WebSocket | Il suo `RTE_TOKEN`, nessuna credenziale del database | Una DMZ, un NAT, o una zona che non ammette connessioni in entrata: nulla raggiunge l'RTE dall'esterno |
| `inbound` | L'app contatta l'RTE all'indirizzo del suo runner e tiene aperto un WebSocket | Il suo `RTE_TOKEN`, nessuna credenziale del database | Una rete in cui il lato centrale apre ogni connessione, un progetto compose, un pod |
| `database` (deprecata) | L'app chiama l'API dell'RTE via HTTP, e l'RTE legge e scrive da solo nel database dell'app | Le credenziali del database (`DB_*`) ed `ENCRYPTION_SECRET` | Il comportamento dalla 7.0 alla 7.2, rimosso nella 8.0.0 |

Un RTE senza `RTE_MODE` gira in modalità database per tutta la 7.x, e registra un avviso `[DEPRECATED] This RTE runs in database mode` al
suo avvio. Un runner aggiunto prima della 7.3.0 ha la modalità **Database (deprecato)**; impostala sulla modalità in cui gira il suo RTE quando lo migri.

---

## In uscita

L'RTE apre la connessione, quindi funziona da una rete che non accetta alcuna connessione in entrata:

* **Il socket** : l'RTE contatta `APP_URL` con aggiunto `/api/v2/rte/socket`, su `wss://` (`ws://` per un indirizzo `http://`), con il suo
  `RTE_TOKEN` e il nome del suo runner, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Ricontatta quando il socket cade
* **La prima volta** : chiede di unirsi, e il suo runner attende l'approvazione di un admin in **Connessioni > Runner**, connesso
  ma senza job (vedi [Chiedere di unirsi](../runners/registration.html#asking-to-join)). Un join token,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), lo approva subito. Da quel momento accede con il proprio token
* **La rete** : solo dalla zona dell'RTE verso l'app, sulla porta dell'app, attraverso un proxy quando `HTTPS_PROXY` lo indica. Un reverse
  proxy davanti all'app deve far passare il WebSocket su quel percorso (vedi [WebSocket dei runner](../production/reverse-proxy.html#runner-websockets))
* **Il certificato** : il certificato dell'app viene verificato. Indica una CA privata con `NODE_EXTRA_CA_CERTS`, o, solo all'interno di una rete
  fidata, disattiva la verifica con [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **Il runner** : non ha bisogno di un indirizzo, quindi la sua credenziale RTE contiene solo il token
* **Pronto** : `/ready` risponde `503` finché il socket verso l'app non è aperto

Con più nodi dell'app dietro un load balancer, il nodo che l'RTE raggiunge detiene il suo socket. Qualsiasi nodo può avviare un job: il nodo che detiene
il socket lo invia all'RTE, entro due secondi quando il job è stato avviato su un altro nodo.

---

## In entrata

L'RTE è in ascolto sulla sua `PORT`, e l'app lo contatta all'indirizzo del suo runner, con aggiunto `/rte/v1/socket` e il token dell'RTE. Con
più nodi dell'app, uno alla volta detiene il socket di ogni runner in entrata; quando quel nodo si ferma, un altro subentra e lo ricontatta.

L'app ha bisogno del runner dell'RTE prima di poterlo contattare: tipo RTE, modalità **In entrata**, e una credenziale RTE con l'indirizzo dell'RTE e il suo
`RTE_TOKEN`. Ci arriva in uno di due modi:

| Come | Cosa impostare |
|---|---|
| L'RTE chiede di unirsi | `APP_URL` e [`RTE_URL`](../customization/server.html#env_RTE_URL) (l'indirizzo che l'app contatta). L'RTE fa una sola chiamata, `POST /api/v2/rte/register`, e il suo runner attende l'approvazione di un admin: l'app lo contatta una volta approvato (vedi [Chiedere di unirsi](../runners/registration.html#asking-to-join)). Con `RTE_JOIN_TOKEN` viene approvato subito. Un RTE in entrata con `APP_URL` ma senza `RTE_URL` si rifiuta di partire |
| Aggiungi tu il runner | Nessun `APP_URL`: aggiungi il runner in **Connessioni > Runner**, o nel [config seed](../seed/), come in [Eseguire un RTE](run.html#start-it) |

Il progetto Docker Compose, il chart Helm e il controller dell'installer eseguono il proprio RTE in questo modo, in entrata, dichiarato dal seed.

**Su HTTPS.** Con [`HTTPS=1`](../customization/server.html#env_HTTPS) l'RTE serve il suo socket su TLS, con la chiave e il certificato
di [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) e [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(`key.pem` e `cert.pem` nella sua cartella `certificates` per impostazione predefinita). Un RTE con un `RTE_URL` `https://` invia quel certificato quando
chiede di unirsi, e l'app lo fissa: contatta l'RTE solo quando presenta lo stesso certificato, quindi uno autofirmato funziona senza una CA.
L'RTE registra l'impronta del certificato al suo avvio (le prime 8 cifre esadecimali dello SHA-256 dei suoi byte DER, come `abcd-ef12`),
e la finestra di approvazione mostra quella ricevuta dall'app: verifica che coincidano prima di approvarlo.
L'[installer](../installation/installer.html#a-runner) configura i suoi Runner in entrata in questo modo, con un certificato del loro indirizzo.

---

## Database (deprecata)

L'RTE dalla 7.0 alla 7.2: l'app chiama la sua API via HTTP, e l'RTE prende in carico il job nel database, vi scrive l'output e mantiene aggiornata la
propria riga di runner, con [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Modalità database](./#database-mode-deprecated)
spiega in cosa differiscono i suoi passaggi. Funziona ancora nella 7.x, con un avviso a ogni avvio, e verrà rimossa nella 8.0.0.

Per passare un RTE del genere a una modalità socket, mantieni il suo runner e il suo token:

1. Un runner del [config seed](../seed/): imposta prima `rte_mode: outbound` o `rte_mode: inbound` per esso nel seed (in entrata: con
   l'indirizzo che l'app contatta nell'`url` della sua credenziale). L'RTE non può spostare da solo un runner del seed
2. Sull'RTE, imposta `RTE_MODE=outbound` con `APP_URL`, o `RTE_MODE=inbound` (con `APP_URL` e `RTE_URL` per fare la sua unica
   chiamata di registrazione), e imposta [`RTE_NAME`](../customization/server.html#env_RTE_NAME) con il nome che ha il suo runner in
   **Connessioni > Runner**. Mantieni il suo `RTE_TOKEN`
3. Rimuovi `DB_*` ed `ENCRYPTION_SECRET` dal suo ambiente, e `RTE_REGISTER`, che legge solo la modalità database, poi riavvialo

Quando l'RTE aggiornato accede con il nome del runner e il token proprio del runner, l'app sposta subito quel runner nella modalità dell'RTE,
senza approvazione, e registra *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. Il runner non è più una riga registrata dal suo RTE, quindi il worker non lo rimuove mai quando il vecchio container smette di rispondere. Un
runner del config seed ancora in modalità database viene invece rifiutato, con *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. Non usare un join token per questo: un join
token viene rifiutato per un runner già approvato. Un RTE in entrata senza `APP_URL` non fa alcuna chiamata: imposta invece la **Modalità** del suo runner su
**In entrata** in **Connessioni > Runner**, e l'app lo contatta. L'[installer](../installation/installer.html#a-72-runner)
aggiorna un Runner della 7.2 in questo modo.

---

## Cosa passa sul socket

In entrambe le modalità socket, l'app invia all'RTE ogni job con tutto ciò che l'RTE leggeva prima nel database, e salva ciò che torna indietro,
l'output, gli eventi, il log del job e la fine, esattamente una volta. L'app invia anche le notifiche di fine.

**Lo spool.** Ogni gruppo di output, gruppo di eventi, log, inizio e fine viene numerato e scritto nel file di spool del job
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) prima di essere inviato, e conservato finché l'app non dice di averlo salvato.
Dopo una riconnessione, allo stesso nodo dell'app o a un altro, l'RTE reinvia ciò che non è stato confermato, e l'app salta ciò che ha già
salvato: nulla va perso, e nulla viene salvato due volte. Tieni lo spool su un volume, così un RTE che si riavvia invia ancora ciò che non aveva
consegnato. Un playbook che era in esecuzione quando l'RTE si è riavviato non può continuare: il suo job termina come abbandonato.

**Capacità.** L'RTE esegue fino a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbook insieme, o il valore impostato
nella sua [pagina del runner](../runners/runner-page.html#an-rtes-settings), e dice all'app ogni 20 secondi quanti ne girano. Un job per un RTE
pieno attende, come descritto in [Più RTE](several.html#several-jobs-on-one-rte).

**I file del job.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES), o l'impostazione **File dei job** della sua pagina del runner, dice
da dove l'RTE prende i playbook e gli inventari:

| `RTE_FILES` | Da dove arrivano i file |
|---|---|
| `transfer` (predefinito) | L'app invia la cartella dei playbook e gli inventari con il job, ognuno impacchettato e identificato da un hash del suo contenuto. L'RTE li conserva impacchettati sotto [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), gli ultimi usati fino a [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (1024 MB per impostazione predefinita), e chiede solo un hash che non ha: una cartella invariata non viene mai inviata due volte. L'RTE non ha bisogno di un disco condiviso né dell'accesso ai repository |
| `local` | L'RTE gira dalle proprie cartelle, come un RTE in modalità database: monta su di esso i playbook ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) e i repository ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) |

Con `transfer`, ogni job estrae i suoi file in una cartella privata propria, rimossa quando il job termina: nessun job vede ciò che un altro ha
scritto, e nessun file di inventario o di extravars resta estratto sul disco dell'RTE. Gli RTE possono condividere un `RTE_CACHE_PATH`; ognuno tiene i suoi job in
una cartella propria, e la cartella di un RTE che si è fermato (ucciso durante un job, o ricreato con un altro hostname) viene rimossa dagli altri
dopo 10 minuti. Una cartella più grande di [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 per impostazione predefinita, letta
dall'app, applicata senza riavvio) non viene inviata: il job fallisce e dice di montare invece la cartella sull'RTE. La cartella ssh non viene mai inviata: l'RTE tiene la propria
chiave privata e il `known_hosts` in `/home/node/.ssh`.

**Host e task.** Dalla 7.3.0, un RTE in qualsiasi modalità registra gli eventi strutturati di un playbook accanto al suo output testuale: ogni play, task e
risultato per host, e il riepilogo, scritti dal suo plugin di callback `af_events`. La pagina del job li mostra in **Host e task** (vedi
[Seguire un job](../jobs/following.html#hosts-and-tasks)).

---

## Rete

Cosa aprire tra l'app, l'RTE e gli host gestiti, per modalità:

| Modalità | Da | A | Porta |
|---|---|---|---|
| In uscita | L'RTE | L'app, in `APP_URL` | La porta dell'app (`443` dietro la maggior parte dei proxy) |
| In entrata | I nodi dell'app | L'RTE, all'indirizzo del suo runner | La `PORT` dell'RTE (`8000`) |
| Database (deprecata) | L'RTE, e i nodi dell'app e il worker | Il database, e l'RTE | `3306`, e la `PORT` dell'RTE |
| Ogni modalità | L'RTE | Gli host gestiti | ssh (`22`), WinRM, le loro API |

In una modalità socket l'RTE non si connette mai al database. La sua API risponde solo al socket e alle probe: `/live`, `/ready`, `/metrics`.
