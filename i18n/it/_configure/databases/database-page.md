---
layout: default
title: "La pagina di un database"
parent: Database
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# La pagina di un database
{: .no_toc }

Le schede, i moduli che lo interrogano, il test e l'eliminazione
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Schede

La pagina di un database mostra i passaggi della sua finestra di dialogo come schede, più i moduli che lo interrogano:

| Scheda | Cosa contiene |
|---|---|
| Dettagli | Il **Nome**, quello che indica il `dbConfig` di un campo, e la **Descrizione** |
| Credenziali | La **Credenziale** con cui si connette, una credenziale di Connessioni > Credenziali di tipo **Database**, che contiene il tipo di database, l'host, la porta, il database, il TLS e l'accesso |
| Usato da | I moduli che lo interrogano, con il conteggio sulla scheda, vedi [Usato da](#used-by) |

Ogni scheda ha il suo indirizzo, come `/settings/databases/<id>/used-by`, così un collegamento o un segnalibro la apre. La ricerca della riga del
titolo filtra tutte le schede insieme.

Nella scheda **Credenziali**, **Aggiungi credenziale** crea una nuova credenziale di tipo **Database** e la sceglie. Una password, una volta salvata,
non viene più mostrata: cambiala sulla credenziale.

---

## Usato da

La scheda **Usato da** elenca i moduli i cui campi interrogano il database, come l'app li legge dai moduli.

| Colonna | Cosa mostra |
|---|---|
| Modulo | Il modulo, una riga lo apre |
| Descrizione | La descrizione del modulo |
| Campo | I campi di quel modulo il cui `dbConfig` indica il database |

Un campo conta quando il suo `dbConfig` indica il database, o indica la sua credenziale, come fa un modulo scritto prima della 7.5.0. Entrambi
si connettono con la stessa credenziale, quindi entrambi sono elencati. Quando non ce n'è nessuno, la scheda dice **Nessun formulario interroga questo database.**

---

## Testa connessione ed Elimina

I pulsanti in alto a destra agiscono sul database così come è salvato.

**Testa connessione** si connette con la sua credenziale ed esegue la query minima del suo tipo di database, poi lo dice in un messaggio,
**Connessione &lt;name&gt; OK**, o perché non è riuscito. È lo stesso test del **Testa connessione** della credenziale stessa.

**Elimina** chiede prima, poi elimina il database e torna alla lista. La sua credenziale resta in **Connessioni > Credenziali**.
Accanto a questi, **Salva** salva le schede Dettagli e Credenziali.
