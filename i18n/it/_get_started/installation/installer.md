---
layout: default
title: Installer
parent: Installazione
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# L'installer
{: .no_toc }

Installa, aggiorna e gestisci AnsibleForms su un server Linux, con un solo comando
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: il modo più rapido per avere un'istanza funzionante, o un Runner per un AnsibleForms installato altrove. Dalla 7.3.0.

---

## Cosa installa

L'installer fa alcune domande in una procedura guidata a schermo intero, mostra ogni risposta da rivedere, e solo allora modifica il server.
Installa uno di due ruoli, su uno di quattro motori:

| Ruolo | Cos'è |
|---|---|
| Controller | L'applicazione completa: l'interfaccia web, il suo database e il suo Runner. Sceglilo per una prima installazione |
| Runner | Un RTE che esegue i playbook di un AnsibleForms installato altrove, per esempio in un'altra rete, in una DMZ o in un altro datacenter. Parla con AnsibleForms tramite un unico WebSocket e non contiene credenziali del database |

I motori su cui li installa:

| Motore | Come gira |
|---|---|
| Docker | Il [progetto Docker Compose](docker-compose.html), su Docker Engine con il suo plugin compose. I container si riavviano insieme a Docker |
| Podman | Lo stesso progetto su Podman, rootless o come root, con podman-compose. Una unit systemd avvia i container al boot |
| Kubernetes | Il [chart Helm](kubernetes.html), sul cluster raggiunto da `kubectl`. Un controller viene servito dietro un ingress; un Runner usa la modalità runner del chart |
| Direttamente su questo server | Nessun container: Node.js, MariaDB e Ansible sul server, e AnsibleForms come servizi systemd. Vedi [Installazione nativa](native.html) |

Dopo l'installazione, lo stesso programma aggiorna l'installazione, ne fa il backup, ne mostra lo stato e la rimuove. Prende anche in carico un
AnsibleForms che non ha installato lui, come uno preparato a mano dal progetto Docker Compose (vedi [Un'installazione esistente](#an-existing-installation)).

---

## Eseguilo

Lo script di installazione scarica l'installer per questo server e lo avvia:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Le varianti abituali: come root, per installare Docker o Podman, per installare direttamente sul server o sotto `/opt`; con un comando o
dei flag (vedi [Flag](#flags)); e l'installer di una versione precisa invece dell'ultima:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

Lo script:

1. Controlla che il server esegua Linux su amd64 o arm64, e trova `curl` o `wget` e `sha256sum`
2. Scarica `ansibleforms-installer_linux_<arch>` dall'ultima release di
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), o dalla release indicata da `AF_INSTALLER_VERSION`
3. Lo verifica con il `checksums.txt` della release, e non usa nessun download il cui checksum sia diverso
4. Lo conserva come `ansibleforms-installer`, in `/usr/local/bin` per root e altrimenti in `~/.local/bin`, per gli aggiornamenti e i backup successivi.
   Tramite sudo, eseguilo con il percorso completo: il `secure_path` di sudo, come sui sistemi Red Hat, spesso non include `/usr/local/bin`
5. Lo avvia con i flag indicati, leggendo la tastiera dal terminale anche se lo script è arrivato tramite una pipe

Senza un terminale, come in un job di CI, l'installer gira senza interazione (vedi [Senza interazione](#unattended)).

---

## La procedura guidata

La procedura guidata fa una domanda alla volta, con i passi elencati a sinistra. **Esc** torna al passo precedente, mantenendo la sua risposta:

| Passo | Cosa chiede |
|---|---|
| Lingua | La lingua dell'installer, per impostazione predefinita quella del locale di questo server: catalano, tedesco, inglese, spagnolo, francese, italiano, giapponese, olandese, polacco, portoghese o cinese. Viene chiesta per prima, prima che l'installer dica qualcosa su un'installazione che ha trovato |
| Novità | Cosa c'è di nuovo nella versione che installa, con prima le modifiche incompatibili, le rimozioni e le deprecazioni |
| Ruolo | Controller o Runner |
| Motore | Docker, Podman, Kubernetes, o direttamente su questo server |
| Cartella | La cartella di installazione, e il nome dell'istanza |
| Join, App, Modalità | Solo un Runner: vedi [Un Runner](#a-runner). Non la modalità su Kubernetes |
| Rete | La porta dell'interfaccia web, o del Runner. Non su Kubernetes |
| HTTPS | Come i browser si collegano a un controller |
| Admin | La password del primo admin, digitata due volte |
| Cluster, Ingress, Storage | Solo Kubernetes: il namespace e la release, l'ingress (un controller), la classe di storage |
| Riepilogo | Ogni risposta: **Installa**, o **Modifica risposte** |

**Motore.** L'elenco mostra ciò che questo server ha. Un motore che manca viene proposto come *Docker (non installato: lo installa l'installer)*
o lo stesso per Podman: una volta confermato, l'installer installa Docker con lo script di Docker stesso (`get.docker.com`, plugin compose
incluso) o Podman con podman-compose dai pacchetti della distribuzione. Questo richiede root. Kubernetes viene proposto quando `kubectl` e
`helm` sono installati e raggiungono un cluster. *Direttamente su questo server* richiede root e un Linux supportato, e dice il perché quando è disattivato.

**Cartella.** I valori predefiniti:

| | Controller | Runner |
|---|---|---|
| Cartella, come root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Cartella, come altro utente | `~/ansibleforms` | `~/ansibleforms-runner` |
| Nome dell'istanza, Docker o Podman | `af` | `runner` |
| Nome dell'istanza, nativa | `ansibleforms` | `ansibleforms-runner` |

Con Docker o Podman, la cartella contiene il file compose e il suo `.env` con i segreti, e tutti i dati: database, moduli, playbook
e log. Deve essere vuota. Il nome dell'istanza, lettere minuscole, cifre e `-`, fa da prefisso ai container (`af_app`, `af_db`, `af_rte`), così più
istanze possono condividere un server. Il nome dell'istanza di un Runner è anche il nome del suo runner in **Connessioni > Runner** (`RTE_NAME`).

**Rete.** L'interfaccia web di un controller ascolta su `443`, o sulla prima porta libera successiva. **HTTPS** propone poi:

| Scelta | Cosa fa |
|---|---|
| HTTPS con un certificato autofirmato creato per questo server | Un certificato per i nomi di questo server, valido dieci anni. I browser ti chiedono di accettarlo una volta |
| HTTPS con il mio certificato e la mia chiave | Il tuo certificato e la tua chiave, in formato PEM, dalla tua CA o da Let's Encrypt |
| HTTP, con HTTPS gestito da un reverse proxy davanti | HTTP semplice sulla porta, per nginx, Traefik o un load balancer che gestisce l'HTTPS |

**Admin.** La password dell'utente `admin`, digitata due volte perché un errore di battitura non ti chiuda fuori. Se la lasci vuota, l'installer ne genera
una robusta.

**La fine.** L'installer genera la password del database e i segreti, avvia AnsibleForms e aspetta che risponda. Poi
mostra l'indirizzo da aprire, l'utente e la password, e la cartella. I Runner installati per esso chiedono di unirsi, e un admin li approva
in **Connessioni > Runner** (vedi [Un Runner](#a-runner)).

---

## Un Runner

Un Runner è un RTE per un AnsibleForms che gira altrove, alla versione 7.3.0 o successiva. Non contiene credenziali del database: accede
con un token tutto suo, che AnsibleForms conserva in una credenziale RTE (vedi [Modalità](../rte/modes.html)). Dopo la cartella, la procedura guidata
chiede altre tre cose:

| Passo | Cosa chiede |
|---|---|
| App | L'indirizzo dell'AnsibleForms per cui lavora questo Runner, quello che le persone aprono in un browser |
| Modalità | **In uscita: il Runner si collega ad AnsibleForms** (il predefinito), o **In entrata: AnsibleForms si collega al Runner** |
| Rete | La porta del Runner, `8000` per impostazione predefinita. In uscita, su di essa ascoltano solo i controlli di salute, raggiungibili solo da questo server. In entrata, anche l'indirizzo di questo server così come lo raggiunge AnsibleForms |

`--role runner` salta la domanda sul ruolo, quindi questo comando, eseguito sul server del Runner, parte con le domande di un Runner:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

L'installer si collega poi ad AnsibleForms. Un certificato autofirmato, o di una CA privata, chiede **Considerare attendibile questo certificato?**:
sì imposta [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) sul Runner. Legge la versione su cui gira AnsibleForms,
rifiuta una versione precedente alla 7.3.0, e installa il Runner con quella stessa versione, qualunque versione installerebbe l'installer.

Scegli in uscita per una DMZ, un NAT, o una zona che non consente connessioni in ingresso: solo traffico da questo server verso AnsibleForms, sulla sua
porta. Scegli in entrata per le reti in cui è il lato centrale ad aprire ogni connessione.

Il riepilogo mostra **Registrazione: chiede approvazione**, o **da solo, con un token di adesione** quando `--join` ne ha fornito uno. Alla fine l'installer
mostra il nome del Runner, la sua modalità, l'app e, in entrata, il suo indirizzo, poi dice di aver chiesto di unirsi ad AnsibleForms: approvalo in
**Connessioni > Runner**, dopo aver controllato che l'impronta mostrata lì sia quella che stampa:

```
Fingerprint: abcd-ef12
```

L'impronta sono le prime 8 cifre esadecimali dello SHA-256 del token del Runner, `RTE_TOKEN`, che è conservato nel file `.env`
della cartella (`rte.env` per un'[installazione nativa](native.html)). Vedi [Approvare un RTE](../runners/registration.html#approving-an-rte). Con `--join`, il Runner viene approvato subito:
si è registrato da solo, e risulta connesso in **Connessioni > Runner**.

Un Runner in entrata serve il suo socket in HTTPS. L'installer crea un certificato autofirmato per l'indirizzo su cui AnsibleForms
lo raggiunge, valido dieci anni, nella `data/certificates` della cartella, e imposta `RTE_URL` su `https://<address>:<port>`.
Il Runner invia il certificato quando chiede di unirsi, e AnsibleForms lo fissa (pinning): contatta quel Runner solo quando presenta
quello stesso certificato, quindi non serve nessuna CA. L'installer stampa l'impronta del certificato sotto quella del token:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

Sono le prime 8 cifre esadecimali dello SHA-256 dei byte DER del certificato, come `xxxx-xxxx`. Prima di approvare il Runner,
controlla che la finestra di approvazione mostri la stessa impronta del certificato. Anche un Runner registrato con `--join` la stampa.

Su Kubernetes, un Runner è la modalità runner del chart Helm, e sempre in uscita: la procedura guidata non chiede né la modalità né la rete, perché niente
lo raggiunge dall'esterno (vedi [Kubernetes](#kubernetes)).

---

## Kubernetes

Per un controller su Kubernetes, l'installer installa il [chart Helm](kubernetes.html) sul cluster raggiunto da `kubectl`:

| Domanda | Predefinito |
|---|---|
| Namespace | `ansibleforms` |
| Nome della release Helm | `ansibleforms` |
| Hostname servito dall'ingress | Nessuno: obbligatorio, per esempio `ansibleforms.example.com` |
| Classe di ingress | Una di quelle del cluster, `nginx` per impostazione predefinita |
| Servirlo in HTTPS (con il certificato dell'ingress)? | Sì |
| Classe di storage per i volumi | Quella predefinita del cluster |

La password dell'admin si trova nel Secret `<release>-secrets` di quel namespace, sotto la chiave `ADMIN_PASSWORD`. L'installer conserva i
valori del chart in un file accanto al suo file di stato, `<release>-values.yaml`, e lo riapplica negli aggiornamenti; `--values` aggiunge un tuo file. Il chart di una release viene pubblicato poco dopo di essa.

Per un Runner, l'installer installa lo stesso chart nella sua [modalità runner](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): un RTE
da solo, senza app, senza database e senza ingress, che contatta AnsibleForms (in uscita). Dopo l'indirizzo dell'app, la procedura guidata chiede:

| Domanda | Predefinito |
|---|---|
| Namespace | `ansibleforms` |
| Nome della release Helm | `ansibleforms-runner`, che è anche il nome del suo runner in **Connessioni > Runner** |
| Classe di storage per i volumi | Quella predefinita del cluster |

L'installer crea il token del Runner e imposta l'indirizzo dell'app, il nome del runner e, quando consideri attendibile il certificato dell'app,
`runner.appTlsVerify: false`. Con `--join`, il token di adesione approva subito il Runner; senza, il Runner chiede di unirsi, e
l'installer stampa la sua impronta da controllare prima di approvarlo in **Connessioni > Runner**.

---

## Comandi

L'installer accetta un comando, prima o dopo i suoi flag. Senza comando, installa:

| Comando | Cosa fa |
|---|---|
| `install` | Installa AnsibleForms, come controller o come Runner (il predefinito). Su un server che ha già un'installazione, la sua o una che trova, propone di aggiornarla |
| `upgrade` | Aggiorna a una versione più recente, mostrando prima le sue note di rilascio (vedi [Aggiornamento](#upgrade)) |
| `status` | Mostra l'installazione (il suo ruolo, motore e versione) e i suoi container, pod o servizi, e se risponde. Poi elenca ogni altro AnsibleForms che trova sul server |
| `backup` | Fa subito il backup del database, in `installer-backups` nella cartella di installazione (su Kubernetes, `backups` accanto al file di stato dell'installer). Un Runner non contiene dati di cui fare il backup |
| `release-notes` | Mostra le note di rilascio di una versione, `--version` o quella di questo installer, con prima le modifiche incompatibili |
| `uninstall` | Rimuove l'installazione, e con `--purge` i suoi dati |
| `version` | Stampa la versione dell'installer |

L'installer ricorda l'installazione in `/etc/ansibleforms/installer.json` per root, o in `~/.config/ansibleforms/installer.json`
per un altro utente, così i comandi dopo `install` non hanno bisogno di flag e trovano l'installazione da soli. Quella cartella non contiene binari,
ed esiste solo dopo che l'installer ha installato un AnsibleForms o ne ha preso in carico uno:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` chiede **Eliminare anche i suoi dati (database, moduli, playbook, log)?**. Per eliminarli, digita il nome dell'istanza (la release Helm
su Kubernetes); altrimenti rimuove i container, i pod o i servizi e conserva i dati.

---

## Flag

Ogni flag risponde a una domanda, che la procedura guidata poi salta. `ansibleforms-installer --help` li elenca:

| Flag | A cosa risponde |
|---|---|
| `--lang <code>` | La lingua: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` o `zh` |
| `--version <version>` | La versione di AnsibleForms da installare o a cui aggiornare; per impostazione predefinita quella di questo installer |
| `--role <role>` | `controller` o `runner` |
| `--mode <mode>` | `compose`, `kubernetes` o `native` |
| `--runtime <runtime>` | `docker` o `podman` (compose) |
| `--install-runtime` | Installa Docker o Podman se mancano, senza chiedere |
| `--dir <folder>` | La cartella di installazione (compose) |
| `--name <name>` | Il nome dell'istanza, prefisso dei suoi container (compose, `af` per impostazione predefinita) |
| `--port <port>` | La porta sull'host: l'interfaccia web per un controller, l'RTE per un Runner |
| `--tls <choice>` | `self`, `own` o `off` (un controller compose) |
| `--cert <file>`, `--key <file>` | I file del certificato e della chiave, con `--tls own` |
| `--admin-password <password>` | La password del primo admin; generata per impostazione predefinita |
| `--join <token>` | Un token di adesione (`afj_...`), creato tramite l'API, che approva subito il Runner (un Runner, senza interazione; vedi [Token di adesione](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | L'indirizzo dell'app, per esempio `https://forms.example.com` (un Runner) |
| `--runner-mode <mode>` | `outbound` (l'RTE contatta l'app) o `inbound` (l'app contatta l'RTE) (un Runner) |
| `--host <address>` | L'indirizzo di questo server, che l'app contatta (un Runner in entrata) |
| `--namespace <namespace>` | Il namespace Kubernetes, `ansibleforms` per impostazione predefinita |
| `--release <release>` | La release Helm, `ansibleforms` per impostazione predefinita |
| `--hostname <name>` | L'hostname dell'ingress (kubernetes) |
| `--ingress-class <class>` | La classe di ingress (kubernetes) |
| `--storage-class <class>` | La classe di storage (kubernetes) |
| `--values <file>` | Un file di valori Helm aggiuntivo (kubernetes) |
| `--purge` | Con `uninstall`: elimina anche i dati |
| `--source <folder>` | Una copia locale del repository [ansibleforms/docker](https://github.com/ansibleforms/docker) da cui installare (air-gapped) |
| `--bundle <file>` | Un bundle di release, `ansibleforms-<version>-linux-<arch>.tar.gz`, da cui installare in modo nativo (vedi [Installazione nativa](native.html#air-gapped)) |
| `--yes` | Risponde a ogni domanda con il suo valore predefinito (senza interazione) |
| `--verbose` | Mostra ogni comando che esegue |

---

## Senza interazione

Con `--yes`, o senza un terminale, l'installer non chiede nulla: i flag rispondono alle loro domande e i valori predefiniti al resto. Salta
la lingua, le note di rilascio, la password dell'admin (generata, a meno che `--admin-password` non ne fornisca una) e il riepilogo, e stampa
invece il link alle note di rilascio. Installa un Docker o un Podman mancante solo con `--install-runtime` o `--yes`, e un Runner
ha bisogno di `--app-url`. Senza `--join`, il Runner chiede di unirsi e aspetta l'approvazione di un admin; con esso, viene approvato subito.

Un controller su Docker, che installa Docker se manca:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Un Runner in entrata su Podman, che l'app contatta su `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Un'installazione esistente

L'installer ricorda cosa ha installato in `installer.json`. Senza quel file, `install`, `upgrade` e `status` cercano prima un
AnsibleForms già presente sul server, chiunque l'abbia installato:

| Trovato | Come viene trovato | Preso in carico quando |
|---|---|---|
| Docker o Podman | Container dell'immagine dell'app o dell'RTE, raggruppati per progetto compose | La cartella contiene il file compose e il `.env` del repository [ansibleforms/docker](https://github.com/ansibleforms/docker): i servizi `mysqldb`, `app` e `rte`, nei container `<name>_db`, `<name>_app` e `<name>_rte` |
| Un Runner 7.2 | Un RTE da solo nel suo progetto compose, con i `DB_*` dell'app e senza `RTE_MODE` (modalità database) | Il suo file compose è leggibile. Il suo aggiornamento lo porta a una modalità socket (vedi [Un Runner 7.2](#a-72-runner)) |
| Kubernetes | Release Helm del chart `ansibleforms`, e Deployment e StatefulSet delle sue immagini | È una release del chart: i suoi valori attuali diventano il suo file di valori |
| Nativa | Servizi systemd che eseguono AnsibleForms con Node.js | Seguono la struttura dell'installer: `releases/`, `current`, `app.env` e `rte.env` (vedi [Installazione nativa](native.html#the-folder)) |
| Nessun motore | L'app o un RTE che risponde su una porta abituale: 443, 3000, 3001, 8000, 8001, 8010 o 8443 | Mai: gira dai sorgenti o a mano. L'installer si limita a segnalarlo |

Contano solo le immagini dell'app e dell'RTE: un container MySQL con un nome che richiama AnsibleForms non è un'installazione. L'installer elenca ciò che
ha trovato, una riga ciascuno, con il motivo e cosa fare a mano per uno che non può prendere in carico: il suo file compose non è quello del repository,
il suo database è fuori dal suo progetto compose, gira su Kubernetes senza il chart Helm, è gestito da Argo CD (aggiornalo lì,
cambiando la versione del chart dell'Application), o la sua versione non si può leggere.

Per un'installazione che può prendere in carico, `install` propone tre scelte:

| Scelta | Cosa fa |
|---|---|
| Prendi in carico e aggiorna | Mostra cosa ricorderà, poi scrive `installer.json` una volta che confermi, e prosegue con l'[aggiornamento](#upgrade) |
| Installa comunque un nuovo AnsibleForms accanto | Una seconda installazione, con la sua cartella, le sue porte e il suo database, dopo una conferma apposita |
| Interrompi | Non viene modificato nulla |

Per un'installazione che esegue già la versione che l'installer installerebbe, la prima scelta è invece **Prendi in carico**: l'installer
ricorda dove si trova e come gira, per i suoi backup, lo stato e i prossimi aggiornamenti, e per ora non viene modificato nulla.

`upgrade` propone lo stesso senza la seconda scelta, e si ferma quando non c'è nulla da prendere in carico. Senza interazione, `install` si ferma con un messaggio,
e `upgrade --yes` prende in carico un'installazione solo quando ne trova esattamente una che può prendere in carico. I valori attuali di una release Kubernetes vengono
salvati accanto a `installer.json`, e gli aggiornamenti li riapplicano con il chart della nuova versione.

---

## Aggiornamento

`ansibleforms-installer upgrade` porta l'installazione a una versione più recente della stessa major. Elenca le versioni più recenti,
a partire dall'ultima (senza interazione, prende l'ultima), e mostra le note di rilascio di ogni versione che supera, con prima le modifiche incompatibili
e le rimozioni. Quando contengono modifiche incompatibili, ti chiede di confermare di averle lette; senza interazione, prosegue solo con `--yes`.

L'installer fa il backup del database prima di modificare qualsiasi cosa. Quando la nuova versione non risponde, propone di tornare indietro: la versione
precedente ritorna, e il suo database viene ripristinato da quel backup. Non fa downgrade, e non attraversa una major: segui
la [guida all'aggiornamento](../upgrade-7.html) per questo, per esempio dalla 6.x alla 7.x, con cosa fare sulla 6.5 prima di aggiornare.

Su Docker o Podman, l'aggiornamento di un controller porta anche i suoi file in linea con la nuova versione del repository docker:

| File | Cosa fa l'aggiornamento |
|---|---|
| `docker-compose.yml` | Sostituito da quello della nuova versione, dopo averne salvato una copia in `installer-backups` |
| `.env` | Ogni riga esistente viene mantenuta, e vengono aggiunte le chiavi di cui la nuova versione ha bisogno, con i segreti creati come li crea un'installazione nuova. Prima ne viene salvata una copia |
| `data/seed.yaml` | Sostituito quando è un seed fornito dal repository docker, non modificato. Uno modificato a mano viene mantenuto, e quello nuovo viene salvato accanto |
| `data/` | I nuovi file portati dalla versione, come un nuovo playbook, vengono aggiunti. Ogni file esistente viene mantenuto |

Un'impostazione del database mancante (`MYSQLDB_USER` o una password) non si può inventare per un database che esiste, quindi l'aggiornamento allora si ferma prima
di qualsiasi modifica. Un rollback rimette il file compose, il `.env` e il seed com'erano.

Un Runner esegue la stessa versione del suo AnsibleForms: aggiorna prima AnsibleForms, poi i suoi Runner. L'aggiornamento di un Runner riscrive il suo
file compose per la nuova immagine RTE e mantiene il suo `.env` e i suoi dati così come sono.

---

## Un Runner 7.2

Un Runner della 7.2 gira in modalità database, deprecata dalla 7.3.0: il suo RTE contiene le impostazioni del database di AnsibleForms. L'installer lo
trova (vedi [Un'installazione esistente](#an-existing-installation)), e il suo aggiornamento lo porta a una modalità socket con lo stesso runner:

1. Legge il nome del runner (`RTE_NAME`) e il token (`RTE_TOKEN`) dal vecchio container RTE. Quando l'RTE non si è registrato da solo
   (`RTE_REGISTER=0`), digiti il nome che il suo runner ha in **Connessioni > Runner**
2. Chiede l'indirizzo dell'app e la modalità, **in uscita** per impostazione predefinita o in entrata, e in entrata la porta e l'indirizzo di questo server
3. Mostra il piano, poi fa il backup del vecchio file compose e del `.env` in `installer-backups`
4. Scrive la struttura Runner dell'installer senza le impostazioni `DB_*`. Mantiene `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` e `METRICS_TOKEN`, che un RTE in modalità socket legge ancora
5. Avvia il nuovo RTE accanto al vecchio. Il nuovo RTE accede con il token del runner stesso, e AnsibleForms sposta da sé il runner alla
   nuova modalità, **senza approvazione**: i suoi job e i moduli che lo nominano restano invariati
6. Una volta che il nuovo RTE è connesso, il vecchio container viene fermato e rimosso

Un Runner in entrata serve HTTPS con un certificato fissato, come uno nuovo (vedi [Un Runner](#a-runner)), e l'installer stampa l'impronta del suo
certificato. Quando il vecchio RTE occupa la porta che serve al nuovo, viene fermato prima, quindi il Runner resta offline finché il
nuovo non si connette. Il nuovo RTE di un Runner in uscita prende una porta libera su `127.0.0.1` e gira accanto al vecchio senza interruzioni.

Quando l'installer non riesce a leggere un token dal vecchio RTE, scegli tu come accede il nuovo RTE:

| Scelta | Cosa segue |
|---|---|
| Scrivere il token del runner | La password della credenziale RTE del runner in **Connessioni > Credenziali**. Il runner mantiene il suo nome e i suoi job |
| Unirsi come nuovo runner con un token di adesione | Un [token di adesione](../runners/registration.html#join-tokens) aggiunge un nuovo runner con un altro nome. Ritira a mano il vecchio runner |

Quando il nuovo RTE non si connette, l'installer propone di rimettere i vecchi file e riavviare il vecchio container; se AnsibleForms
aveva già spostato il runner, riporta la sua modalità a database in **Connessioni > Runner**. Una volta che il nuovo RTE è connesso, non si
torna indietro: i vecchi file restano in `installer-backups`.

Quando AnsibleForms non conosce nessun runner con quel nome, il nuovo RTE chiede invece di unirsi e aspetta un'approvazione. Rifiuta quella richiesta in
**Connessioni > Runner**, poi esegui di nuovo l'aggiornamento con il nome che il runner ha lì.

---

## Versioni

La versione dell'installer segue quella dell'app: ogni release di AnsibleForms arriva con un installer della stessa versione, pubblicato insieme ad essa, e
quell'installer installa quella versione per impostazione predefinita. `--version` ne installa un'altra. Ogni release nella
[pagina Releases dell'installer](https://github.com/ansibleforms/installer/releases) ha i binari per Linux su amd64 e arm64, con i loro
checksum.
