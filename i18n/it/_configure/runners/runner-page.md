---
layout: default
title: "La pagina di un runner"
parent: Runner
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# La pagina di un runner
{: .no_toc }

Le schede di un runner, la modalità, la connessione e le impostazioni di un RTE, e Testa connessione
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Schede

La pagina di un runner mostra i passaggi della sua finestra di dialogo come schede, più ciò che gira su di esso:

| Scheda | Cosa contiene |
|---|---|
| Dettagli | Il nome e la descrizione, l'interruttore **Predefinito** e l'interruttore **Abilitato**, uguali per ogni tipo di runner |
| Tipo | Il prodotto, come nella finestra di dialogo. Per un RTE anche la sua **Modalità**: **Database (deprecato)**, **In entrata** o **In uscita**, l'`RTE_MODE` con cui gira il suo RTE (vedi [Modalità](../rte/modes.html)) |
| RTE | Solo per un RTE: la sua **Modalità** a parole e, in una modalità socket, la sua **Connessione** e le sue impostazioni (vedi [Le impostazioni di un RTE](#an-rtes-settings)) |
| Credenziali | La **Credenziale** con cui accede, una credenziale di Connessioni > Credenziali del tipo del runner, che contiene il suo token o accesso e l'indirizzo del suo server. Quella di un RTE contiene il suo `RTE_TOKEN`, e l'indirizzo dell'RTE a meno che non sia in uscita. **Progetto** per Semaphore, Rundeck e Jenkins |
| Moduli | I moduli che girano su di esso, e come: **Lo nomina** o **Come runner predefinito**. Una riga apre il modulo |
| Job | Gli ultimi 100 job che sono girati su di esso, con il loro stato, inizio, fine e durata. Una riga apre il job |

Ogni scheda ha il suo indirizzo, come `/settings/runners/<id>/rte`, così un collegamento o un segnalibro la apre. Un runner senza quella scheda si apre su
Dettagli.

I due interruttori della scheda Dettagli vengono salvati subito. **Predefinito** rende il runner il predefinito del suo tipo; si disattiva rendendo
predefinito un altro runner. **Abilitato** attiva o disattiva il runner: se è disattivato, nessun job va a lui, nemmeno come predefinito del suo tipo (vedi
[Predefinito e Abilitato](list.html#default-and-enabled)).

Un RTE che ha chiesto di unirsi si apre con un riquadro giallo, **Questo RTE ha chiesto di unirsi**, con la sua impronta e ciò che ha detto di sé, e
**Approva** e **Rifiuta** (vedi [Approvare un RTE](registration.html#approving-an-rte)). Un runner del [config seed](../seed/) lo indica
in cima alla sua pagina, ed è in sola lettura.

---

## Le impostazioni di un RTE

La scheda RTE gestisce un RTE dall'app, senza modificarne l'ambiente sulla macchina su cui gira.

**Connessione.** Un RTE in una modalità socket mostra un badge: **Connesso** o **Non connesso**. Al passaggio del puntatore, **Connesso** mostra il nodo dell'app
che detiene il suo socket, la versione dell'RTE, e quanti dei suoi job sono in esecuzione. **Non connesso** significa che nessun nodo dell'app detiene un socket verso di esso:
verifica che l'RTE sia in esecuzione, il suo indirizzo o `APP_URL`, e il suo token.

**Impostazioni.** Un RTE in modalità in uscita o in entrata ha quattro impostazioni, ognuna vuota per impostazione predefinita:

| Impostazione | Equivale a | Cosa fa |
|---|---|---|
| Job simultanei max | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Quanti playbook esegue insieme, `10` per impostazione predefinita; `0` non imposta alcun limite |
| Cache dei file | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Quanto dei file dei job inviati dall'app conserva, in MB, `1024` per impostazione predefinita; `0` non ne conserva nessuno |
| Attesa allo stop | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Quanto attende un RTE in arresto i suoi playbook in esecuzione, `25` secondi per impostazione predefinita |
| File dei job | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Trasferimento**: l'app invia i file di un job con il job. **Locale**: gira dalle proprie cartelle montate |

**Quale valore vince.** Un valore nella pagina vince sulla stessa variabile impostata sull'RTE. Un campo lasciato vuoto usa la variabile propria dell'RTE,
altrimenti il valore predefinito. Sotto ogni campo la pagina dice quale: **Sostituisce RTE_MAX_JOBS impostata sull'RTE (3)**, o **Vuoto: l'RTE usa la propria
RTE_MAX_JOBS, 3**; il segnaposto mostra il valore che rappresenta un campo vuoto.

**Come arrivano all'RTE.** Le impostazioni vengono salvate con il runner nel database dell'app. L'app le invia tramite il socket dell'RTE
quando si connette e ogni volta che vengono salvate, e l'RTE le applica subito: una cache più piccola viene ridotta, un nuovo limite conta dal
job successivo. L'RTE le tiene solo in memoria e non scrive nessun file: dopo un riavvio le riceve di nuovo quando si connette, prima del suo primo job.

Un RTE in modalità database (deprecata) non ha un socket: legge queste impostazioni dalle proprie variabili, e la scheda lo dice.

---

## Testa connessione

I pulsanti in alto a destra agiscono sul runner così come è salvato.

Accanto a **Salva** ci sono **Testa connessione** ed **Elimina**, e nella scheda Credenziali **Aggiungi credenziale**, che crea una credenziale del
tipo del runner e la sceglie. Un token o una password, una volta salvati, non vengono più mostrati: cambiali sulla credenziale.

**Testa connessione** verifica che il runner risponda e accetti il suo token o accesso, e lo dice in un messaggio: **Runner connection is
OK**, o perché non è riuscito. Non esegue nessun job. Per un RTE verifica anche il contratto che parla l'RTE (vedi
[Il contratto](../rte/images.html#the-contract)):

| RTE | Cosa legge il test | Quando fallisce |
|---|---|---|
| In uscita o In entrata | Chi detiene il suo socket, come lo registra ogni nodo dell'app, e ciò che l'RTE ha detto quando si è connesso. Non chiama nulla | Nessun nodo dell'app detiene un socket verso di esso: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, o per uno in entrata, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Oppure l'RTE parla un contratto diverso da 3 |
| Database (deprecato) | Il `/rte/v1/health` dell'RTE, chiamato con il suo token | L'RTE non risponde al suo indirizzo, rifiuta il token, o parla un contratto diverso da 2 |

Il badge **Connessione** della scheda RTE mostra lo stesso stato del socket senza un test.
