---
layout: default
title: Registrazione
parent: Runner
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Registrazione
{: .no_toc }

Come un RTE chiede di unirsi e viene approvato, i join token per le installazioni non presidiate, e la modalità database
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Chiedere di unirsi

Dalla 7.3.0, un RTE in una modalità socket (`outbound` o `inbound`) che l'app non conosce ancora chiede di unirsi, e un admin lo approva.
Si presenta con il proprio `RTE_TOKEN` e il suo `RTE_NAME`: un RTE in uscita quando contatta l'app la prima volta, uno in entrata nella sua unica
chiamata di registrazione. Senza un join token, l'app allora:

1. Salva l'`RTE_TOKEN` dell'RTE in una nuova credenziale di tipo RTE chiamata `<name>-rte` (con un numero aggiunto quando quel nome è già in uso), e
   per un RTE in entrata il suo indirizzo, `RTE_URL`
2. Aggiunge un runner chiamato come `RTE_NAME`, tipo RTE, nella modalità dell'RTE, che accede con quella credenziale, contrassegnato come **In attesa di approvazione**
   e disattivato. La sua descrizione indica l'host da cui ha fatto la richiesta

Un RTE in uscita resta connesso mentre attende, ma non riceve job. L'app non contatta uno in entrata finché non è approvato. Entrambi registrano
che attendono l'approvazione di un admin in **Connessioni > Runner**, con l'impronta del loro token.

Un RTE in entrata con un `RTE_URL` `https://` invia anche il suo certificato quando chiede di unirsi, e l'app lo fissa: da quel momento
l'app contatta quell'RTE solo quando presenta lo stesso certificato, quindi uno autofirmato funziona senza una CA (vedi [In entrata](../rte/modes.html#inbound)).

Al massimo 20 RTE possono attendere l'approvazione contemporaneamente: gli altri vengono rifiutati finché alcuni non vengono approvati o rifiutati. Una richiesta che nessuno gestisce entro
24 ore viene rimossa dal worker, con la sua credenziale.

Un RTE che porta il nome di un runner che l'app conosce già, ma con un altro token, viene rifiutato e non chiede di unirsi. Dagli il token di quel runner,
o elimina il runner così che chieda di unirsi. Un [join token](#join-tokens) aiuta solo finché quel runner attende ancora l'approvazione.

---

## Approvare un RTE

I runner in attesa di approvazione lasciano la lista di **Connessioni > Runner** per un avviso arancione sopra di essa, come
**2 Runner attendono l'approvazione**, con una riga per runner: il suo nome, host, indirizzo IP, modalità, indirizzo e impronta.
La campanella dell'intestazione li conta, per gli utenti che possono vedere i runner (vedi [la campanella](../jobs/#the-jobs-page)).

Un clic sull'avviso apre la finestra **Esamina approvazione** per ogni runner a turno; un clic su un nome apre solo quello.
La sua pagina mostra gli stessi dati in un riquadro giallo, **Questo RTE ha chiesto di unirsi**. Verifica che sia uno che hai avviato tu prima di approvarlo:

| Campo | Cosa mostra |
|---|---|
| Impronta | Le prime 8 cifre esadecimali dello SHA-256 del suo `RTE_TOKEN`, come `abcd-ef12`. L'RTE la registra al suo avvio, e l'[installer](../installation/installer.html#a-runner) la stampa alla fine. Deve essere la stessa |
| Impronta del certificato | Nella finestra di dialogo, per un RTE in entrata su HTTPS: le prime 8 cifre esadecimali dello SHA-256 del certificato che l'app fissa (i suoi byte DER), come `abcd-ef12`. L'RTE la registra al suo avvio e l'[installer](../installation/installer.html#a-runner) la stampa alla fine. Deve essere la stessa |
| Host | L'host su cui gira |
| Indirizzo IP | L'indirizzo da cui ha chiamato l'app |
| Modalità | In uscita o In entrata |
| URI | L'indirizzo di un RTE in entrata, dove l'app lo contatta |
| Versione | La sua versione |
| Richiesto il | Quando ha chiesto di unirsi |

**Approva** e **Rifiuta**, nella finestra di dialogo o nel riquadro della sua pagina, decidono:

| Azione | Cosa succede |
|---|---|
| Approva | Il runner viene abilitato e riceve job da quel momento. Diventa il predefinito del suo tipo quando non ce n'è uno |
| Rifiuta | Il runner viene rimosso con la sua credenziale, e il suo socket viene chiuso. L'RTE può chiedere di nuovo di unirsi; allora attende di nuovo l'approvazione |

Solo un admin approva o rifiuta un RTE.

---

## Join token

Un join token approva subito un RTE, per le installazioni non presidiate: un RTE avviato con
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), o un Runner installato con il `--join` dell'installer, lo presenta una volta
e il suo runner viene aggiunto abilitato, senza attendere. I join token non hanno una pagina nell'interfaccia: un admin li crea tramite
l'[API REST](../api/), sotto `/api/v2/runner`:

| Chiamata | Cosa fa |
|---|---|
| `POST /api/v2/runner/jointoken` | Crea un join token. Il corpo contiene il suo `name`, e facoltativamente `expiresInHours` (nessuno: non scade mai) e `maxUses` (nessuno: qualsiasi numero di RTE) |
| `GET /api/v2/runner/jointoken` | Elenca i join token, dal più recente, con i loro utilizzi e se sono ancora utilizzabili; mai i token stessi |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Lo revoca: non aggiunge più nessun runner, e resta nella lista |
| `DELETE /api/v2/runner/jointoken/<id>` | Lo elimina |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

La risposta contiene il token, che inizia con `afj_`, solo questa volta: viene salvato solo il suo SHA-256. Un RTE che lo presenta riceve la stessa
credenziale e lo stesso runner di uno che [chiede di unirsi](#asking-to-join), abilitato, e la sua descrizione indica il join token. Da quel momento
l'RTE accede con il proprio token, quindi il join token può scadere o essere revocato senza effetti su di esso. Revocare o eliminare un join token
lascia i runner che ha aggiunto.

Un join token non dà mai un nuovo token a un runner approvato. Quando esiste già un runner RTE con quel nome:

| Il runner | Cosa succede |
|---|---|
| Attende l'approvazione | Riceve il nuovo token nella sua credenziale, e attende ancora l'approvazione di un admin |
| È approvato | Rifiutato con `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. Il join token non viene consumato |
| Viene dal [config seed](../seed/) | Rifiutato: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Un RTE reinstallato con un nuovo token accede quindi con il token della credenziale del suo runner, oppure un admin cambia quel token
in **Connessioni > Credenziali**, o elimina il runner così che l'RTE si unisca come nuovo.

---

## Registrazione in modalità database

Un RTE in modalità database, deprecata dalla 7.3.0, si registra da solo per impostazione predefinita, al suo `RTE_URL` o altrimenti al proprio indirizzo e porta. Il
worker rimuove un runner del genere quando il suo RTE non scrive un heartbeat da 10 minuti. Un runner aggiunto a mano, dal config seed o da un
RTE in una modalità socket non viene mai rimosso in quel modo.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), che attiva o disattiva questa registrazione, è deprecata nella 7.3.0 insieme alla
modalità database: un RTE in una modalità socket chiede di unirsi, o si unisce con un join token. Per gestire tu questi runner nel frattempo, avvia
l'RTE con `RTE_REGISTER=0` e aggiungilo qui con tipo RTE, modalità **Database (deprecato)**, e una credenziale RTE con il suo indirizzo e lo
stesso token. Per passarlo a una modalità socket, vedi [Modalità](../rte/modes.html#database-deprecated).
