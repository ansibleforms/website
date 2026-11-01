---
layout: default
title: RTE
nav_order: 11
has_children: true
has_toc: false
permalink: /rte/
translated_from: 75a4facc8ad51d9d74b8fccfd2bbfd7ba48b17f9
---

# Ambienti di esecuzione (RTE)
{: .no_toc }

Cos'è un RTE, come esegue un playbook, e cosa può toccare
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: capisci l'RTE prima di eseguirne uno, dimensionarlo o spostarlo in un'altra rete.

| Pagina | Cosa tratta |
|---|---|
| [Immagini](images.html) | Le tre immagini RTE, e come costruire la tua con le collection usate dai tuoi playbook |
| [Modalità](modes.html) | In uscita, in entrata o database: chi apre la connessione, lo spool, i file del job |
| [Eseguire un RTE](run.html) | Le impostazioni di ogni modalità, e un esempio `docker run` di ciascuna |
| [Più RTE](several.html) | Capacità, repliche dietro un solo indirizzo, e cosa succede quando un RTE si ferma o muore |
| [Un altro datacenter](another-datacenter.html) | Un runbook: aggiungere un RTE in un secondo datacenter, da un host vuoto al suo primo job |

---

## Cos'è un RTE

AnsibleForms 7 non esegue nessun playbook nel container dell'app. Il job di un modulo `ansible` viene affidato a un [runner](../runners.html) di tipo
`rte`, un ambiente di esecuzione: il server di AnsibleForms avviato con `AF_ROLE=rte`, accanto a python e ansible, senza interfaccia
web. Parla con l'app tramite un unico WebSocket e non contiene credenziali del database
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` o `inbound`, vedi [Modalità](modes.html)): l'app gli invia il job,
l'RTE esegue `ansible-playbook`, e l'app salva l'output e lo stato finale che le rimanda, dove il browser li legge.

L'app risolve le credenziali del job e le consegna all'RTE sigillate solo per quell'RTE e quel job. L'RTE non legge mai la
tabella delle credenziali né un archivio di segreti, e un playbook non eredita le variabili d'ambiente di AnsibleForms
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` e le altre): passa un valore del genere come extravar o come credenziale. L'RTE dalla 7.0 alla 7.2,
che leggeva e scriveva da solo nel database, gira ancora nella 7.x come modalità database deprecata (vedi [Modalità database](#database-mode-deprecated)).

---

## Come gira l'RTE

L'RTE è un container che esegui tu, accanto all'app o in un'altra rete: AnsibleForms non ne crea mai uno. Qui si vede
dove gira, cosa condivide con l'app, e cosa succede al suo interno dal momento in cui si avvia un modulo fino a quando il processo del playbook
non c'è più:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Come l'RTE esegue un playbook</title>
<desc id="afr-desc">Su un host di container o in un cluster Kubernetes, entrambi gestiti dall'operatore, il container dell'app e uno o più container RTE mantengono ciascuno un WebSocket tra loro, aperto dall'app (in entrata) o dall'RTE (in uscita). Solo l'app parla con il database. 1: il browser avvia un modulo sull'app. 2: l'app salva il job nel database, sceglie il runner e sigilla per esso i segreti del job. 3: l'app invia il job tramite il socket. 4: l'RTE lo prende in carico e ottiene i file del job, dalla sua cache o dall'app. 5: l'RTE avvia ansible-playbook come processo figlio, uno per job, fino a RTE_MAX_JOBS. 6: il playbook raggiunge gli host gestiti. 7: l'RTE scrive l'output, gli eventi e la fine nel suo spool e li invia tramite il socket; l'app li salva nel database e ne conferma la ricezione. 8: il browser segue il job tramite l'app. Il volume dell'app è montato nell'RTE solo con RTE_FILES=local.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Host di container o cluster Kubernetes</text>
<text class="afr-s" x="181" y="61">gestito da te; un RTE in uscita può stare in un'altra rete</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Browser</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">moduli, pagina job</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">Container app</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runner</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">sigillano i segreti</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">Hub RTE</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">salva e conferma</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">Container RTE</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="477" y="160" text-anchor="middle">File del job</text>
<text class="afr-s" x="477" y="174" text-anchor="middle">in cache per hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">fino a RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">fino alla conferma</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">un</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Host gestiti</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volume dell'app</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbook, inventari</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">solo RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">solo dell'app</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="548" cy="142" r="9"/><text class="afr-nt" x="548" y="146" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

Il diagramma mostra un socket per RTE, qualunque sia il lato che lo ha aperto: l'app contatta un RTE in entrata, un RTE in uscita contatta l'app (vedi
[Modalità](modes.html)). Una volta aperto, gli stessi messaggi viaggiano in entrambe le direzioni, e solo l'app legge e scrive nel database.

**Chi lo avvia.** Un RTE è un container di lunga durata, avviato da ciò che esegue i tuoi altri container. Attende i job e continua a
girare tra un job e l'altro:

| Come esegui AnsibleForms | Chi avvia l'RTE |
|---|---|
| `docker run` o `podman run` | Tu, con un comando come quello di [Eseguire un RTE](run.html), su qualsiasi host che raggiunge l'app, o che l'app raggiunge |
| [Docker Compose](../installation/docker-compose.html) | Il servizio `rte` di `docker-compose.yml`, accanto ad `app` e `mysqldb`. Il suo config seed lo dichiara come runner predefinito `rte`, in entrata, su `http://rte:8000` |
| [Chart Helm](../installation/kubernetes.html) | Kubernetes, come secondo container chiamato `rte` nel pod dell'app (`containers.rte`). L'app lo contatta su `127.0.0.1`, in entrata, e il seed del chart lo dichiara come runner predefinito |
| [L'installer](../installation/installer.html) | Docker Compose o il chart Helm come sopra, o un servizio systemd [senza container](../installation/native.html); un Runner proprio, che chiede di unirsi e attende l'approvazione di un admin |

Il motore dei container è tuo: Docker o Podman sull'host, o il runtime dei container del tuo cluster Kubernetes, installato e mantenuto
aggiornato da te. AnsibleForms non parla mai con esso. Né l'app né l'RTE chiamano Docker o Podman, ne montano il socket o avviano un
container: l'app parla solo con l'RTE tramite il suo socket.

**Cosa c'è dentro.** Un solo container, con ciò che serve per eseguire un playbook e nient'altro:

* **Il server** : lo stesso server Node.js dell'app, avviato con `AF_ROLE=rte` (impostato nell'immagine) sotto `tini`
* **Cosa è escluso** : l'interfaccia web, l'accesso, il pianificatore, il worker e ogni modulo del database, che questo ruolo non carica
* **Su cosa è in ascolto** : la sua `PORT` (`8000`): `/live` e `/ready` per le probe e `/metrics` per Prometheus, e in entrata il socket
  che l'app contatta, `/rte/v1/socket`. Un RTE in uscita non accetta connessioni dall'app
* **Python e ansible** : portati dal livello dell'immagine che scegli (vedi [Le immagini RTE](images.html))
* **L'utente** : il server e ogni playbook girano come `node` (uid 1000), mai come root

**Cosa condivide con l'app.** Il suo token, e con `RTE_FILES=local` i file dell'app. Con `RTE_FILES=transfer`, il predefinito, i
playbook e gli inventari arrivano con ogni job, e l'RTE non ha bisogno di un disco condiviso:

| Condiviso con l'app | Cosa ne fa l'RTE |
|---|---|
| `RTE_TOKEN` | Lo presenta quando contatta l'app (in uscita), o lo verifica quando l'app lo contatta (in entrata). L'app conserva lo stesso valore nella credenziale RTE del runner, e i segreti del job vengono sigillati con esso |
| Il volume persistente, `/app/dist/persistent`, solo con `RTE_FILES=local` | La cartella dei playbook ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), o il repository dei playbook che il worker ha clonato sotto [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), gli inventari ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) e i repository degli inventari) e i caricamenti. L'RTE scrive i file delle extravars del job nella cartella del playbook, quindi montala in lettura e scrittura |
| La cartella ssh, `/home/node/.ssh` | La chiave privata e il `known_hosts` usati dalle connessioni ssh del playbook: monta quella dell'app, gestita nelle sue pagine delle impostazioni, o dai all'RTE una propria |

L'RTE non clona nulla: un repository gli arriva nei file di un job, o sul volume che condivide con l'app. Collection, ruoli e
`ansible.cfg` arrivano dall'immagine, dalle cartelle `/etc/ansible/collections`, `/etc/ansible/roles` e `/etc/ansible/ansible.cfg` quando
le monti lì (il progetto Docker Compose lo fa), o da un `ansible.cfg` accanto ai playbook.

**La vita di un job.** I numeri qui sotto sono quelli del diagramma, per un modulo di playbook avviato dal browser o dall'API:

1. **Avvio** : l'app verifica il modulo e i suoi valori, costruisce le extravars e salva il job con stato `running`. Un modulo con
   un'[approvazione](../forms/approval.html) si ferma qui finché un approvatore non lo accetta, e prima di allora non raggiunge nessun RTE
2. **Scelta del runner** : l'app prende l'RTE che il modulo indica con `runner: <name>`, altrimenti il runner predefinito di tipo RTE, e ne salva
   il nome sul job. Risolve le credenziali del job dal database o da un [archivio di segreti](../secret-stores/), il suo accesso ansible e la sua
   password vault, e le sigilla con AES-256-GCM con una chiave derivata dal token di quel runner e dall'id del job
3. **Consegna** : il nodo dell'app che detiene il socket dell'RTE gli invia il job: le extravars, le opzioni del modulo, i segreti sigillati e
   gli hash dei file del job. Qualsiasi nodo dell'app può avviare il job; quello che detiene il socket lo invia entro due secondi. Un RTE pieno,
   o non connesso, fa attendere il job, fino a [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Presa in carico** : l'RTE risponde `claimed`, o `refused` quando è pieno, si sta fermando, non riesce ad aprire i segreti, o il job arriva con un altro
   [contratto](images.html#the-contract) rispetto al suo. Con `RTE_FILES=transfer` prende i playbook e gli inventari dalla sua
   cache in base al loro hash, chiede all'app un hash che non ha, e li estrae in una cartella propria del job
5. **Partenza** : nella cartella del playbook (più il `playbookSubPath` del modulo, che deve esistere) scrive due file: `extravars_<id>.json`
   con i valori del modulo e le credenziali, e uno nascosto con l'accesso ansible. Poi avvia `ansible-playbook` come proprio processo
   figlio, senza shell, in un gruppo di processi proprio, con `-e @` quei file, un `-i` per inventario, e i tag, il limit, il check,
   il diff e la verbosità del modulo. La password vault entra da stdin, mai in un file o sulla riga di comando, e il processo gira come
   `node` con un ambiente filtrato (vedi sotto)
6. **Esecuzione** : il playbook si connette agli host gestiti dal container RTE, via ssh con la chiave e il `known_hosts` di
   `/home/node/.ssh`, con `sshpass` per un accesso con password, o tramite le API che chiamano i suoi moduli. È l'RTE, non l'app, che deve raggiungerli
7. **Output e fine** : l'RTE raggruppa stdout e stderr ogni mezzo secondo o 64 KB, con le credenziali mascherate, e numera ogni
   gruppo. Scrive ogni elemento nello spool del job sul suo disco prima di inviarlo: l'output, gli eventi, il log del job di
   `.joblogs/job_log_<id>.log` (ogni 2 secondi), l'inizio e la fine con lo stato finale (`success`, `failed` o `aborted`). L'app
   salva ogni elemento una sola volta e ne conferma la ricezione, e l'RTE elimina lo spool una volta salvata la fine. Oltre
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) byte su un flusso (50 MB per impostazione predefinita) non invia altro, e
   il playbook continua. L'app invia poi le [notifiche](../forms/notifications.html) del modulo
8. **Seguire** : il browser non parla mai con l'RTE: la pagina del modulo rilegge il job tramite l'app ogni 2 secondi, e la pagina Job
   lo segue in tempo reale man mano che l'app salva ogni elemento

**Un socket caduto.** Il playbook continua. L'RTE ricontatta l'app (in uscita), o un nodo dell'app lo ricontatta (in entrata), e reinvia ciò
di cui l'app non aveva confermato la ricezione: l'app salta ciò che ha già salvato, quindi nessuna riga va persa o viene salvata due volte. Questo vale finché il socket
torna entro due minuti: l'app scrive l'heartbeat dell'RTE solo finché il suo socket è aperto, e una volta che quell'heartbeat ha due minuti
il worker termina i job in esecuzione dell'RTE come abbandonati, anche se i loro playbook stanno ancora girando. Tieni lo spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) su un volume, così un RTE riavviato invia ancora ciò che aveva conservato. Un
playbook che era in esecuzione quando il suo RTE si è riavviato non può continuare: l'app termina il suo job come abbandonato quando l'RTE torna senza di esso.

**Interruzione.** Un'interruzione imposta il flag di interruzione del job, e il nodo dell'app che detiene il socket dell'RTE invia `cancel` entro due secondi. L'RTE
invia `SIGTERM` al gruppo di processi del playbook, così `ansible-playbook` e ogni fork che ha avviato si fermano insieme, e il job termina
`aborted`. Un cancel che arriva prima del suo job viene conservato per un minuto, e il job parte allora già interrotto.

**Pulizia.** Appena il processo termina, qualunque sia l'esito, l'RTE rimuove entrambi i file delle extravars (un modulo con `keepExtravars`
conserva quello visibile, mai quello nascosto), il file degli artifact in `/tmp`, il file di log del job e la cartella dei file propria del job. La
fine viene salvata una sola volta: un secondo scrittore, come l'app che fa fallire un job che l'RTE ha già terminato, non cambia nulla.

**Un processo per job, non un container per job.** AWX e AAP avviano un nuovo pod o container da un'immagine di execution environment per
ogni job. AnsibleForms non avvia nulla: il container RTE è già in esecuzione, e ogni job è un processo figlio al suo interno. Un job parte
senza scaricare un'immagine né pianificare un pod, e AnsibleForms non ha bisogno di diritti sul tuo motore dei container o sul tuo cluster. In cambio, i
playbook che girano su un RTE ne condividono CPU, memoria, `/tmp`, cartella home e python: dai al container risorse sufficienti per
`RTE_MAX_JOBS` playbook con i loro fork. Per cambiare ciò che un playbook può usare, cambia l'immagine, non il job.

---

## Il confine di sicurezza

L'RTE esegue codice scritto dagli autori dei moduli, quindi è costruito per contenere il meno possibile:

* **Solo il suo token** : l'RTE non contiene credenziali del database né `ENCRYPTION_SECRET`. Non accetta chiamate se non il socket dell'app, con
  il suo token, e non ha utenti, accesso né pagine web. Tramite il socket può solo eseguire i job che l'app gli invia, riferire su di essi e
  chiederne i file: non può creare un job, leggere un altro job o distribuire credenziali
* **Segreti sigillati** : per eseguire un job, l'RTE non legge mai la tabella delle credenziali né un archivio di segreti. Riceve i segreti dei job che
  esegue, sigillati solo per il suo token e quell'id di job, così un pacchetto destinato a un altro RTE o a un altro job non si apre, e un byte modificato
  viene rifiutato
* **Una connessione verificata** : in uscita, l'RTE verifica il certificato dell'app. In entrata su HTTPS, l'app fissa il certificato proprio dell'RTE
  quando si unisce, e lo contatta solo quando presenta quello (vedi [Modalità](modes.html#inbound)). Un RTE in entrata su HTTP semplice va
  su una rete privata, come quella del progetto Docker Compose
* **Nessun ambiente ereditato** : `ansible-playbook` riceve l'ambiente dell'RTE senza nessuna delle variabili che AnsibleForms legge per sé
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, le `MYSQL_*` e le altre), quindi
  `lookup('env', ...)` non può raggiungerle. Ciò che imposti per i playbook (`PATH`, proxy, `ANSIBLE_*`) passa così com'è
* **Nessun template dagli utenti** : {% raw %}un valore di un modulo che contiene `{{`, `{%` o `{#` arriva al playbook come stringa unsafe{% endraw %}
  che ansible non elabora mai come template, a meno che il modulo non imposti `allowJinjaInExtravars`, e nessuna shell esegue mai la riga di comando
* **Non root** : l'RTE e i suoi playbook girano come `node` (uid 1000), quindi un playbook può fare ciò che può quell'utente nel container, come
  leggere i suoi file e la chiave ssh, e niente di più

Tratta il suo container, la sua immagine e il suo ambiente con la stessa cura di quelli dell'app.

---

## Modalità database (deprecata)

L'RTE dalla 7.0 alla 7.2, senza `RTE_MODE`, gira per tutta la 7.x e verrà rimosso nella 8.0.0. Differisce dai passaggi qui sopra in quattro modi:

* **Contiene il database** : le sue impostazioni `DB_*`, e `ENCRYPTION_SECRET` quando si registra da solo
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **La consegna è una chiamata HTTP** : l'app chiama `POST <address>/rte/v1/jobs` con il token e i segreti sigillati, e l'RTE prende in carico
  il job scrivendo il suo nome su di esso nel database (passaggi 3 e 4)
* **Scrive l'output da solo** : nel database, a gruppi, senza spool (passaggio 7). Un'interruzione lo raggiunge tramite il flag di interruzione del job,
  che legge ogni 2 secondi, e una chiamata `/cancel`
* **Legge i file dal volume dell'app** : ha bisogno dello stesso disco dell'app, come con `RTE_FILES=local`

La sua pagina del runner non ha nessuna delle [impostazioni RTE](../runners/runner-page.html#an-rtes-settings): legge le sue variabili. Per passarlo a una
modalità socket, vedi [Modalità](modes.html#database-deprecated).
