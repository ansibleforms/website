---
layout: default
title: La pagina dei runner
parent: Runner
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# La pagina dei runner
{: .no_toc }

La lista dei runner, come aggiungerne uno, attivarlo o disattivarlo, e il predefinito di ogni tipo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

La pagina in **Connessioni > Runner** elenca ogni runner con queste colonne:

| Colonna | Significato |
|---|---|
| Abilitato | Se riceve job. Un runner disattivato non riceve nessun job, nemmeno come predefinito del suo tipo. |
| Nome | Come lo indicano i moduli, con `runner: <name>`. |
| Tipo | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck o Jenkins. Il runner predefinito del suo tipo ha una pillola **Predefinito** dopo di esso. |
| Descrizione | A cosa serve. |

**Colonne** ne aggiunge altre due, disattivate per impostazione predefinita: **Modalità**, la modalità di un RTE (In uscita, In entrata o Database (deprecato), vedi
[Modalità](../rte/modes.html)), e **Connessione**, se un nodo dell'app detiene un socket verso un RTE in una modalità socket: **Connesso** o
**Non connesso**.

Dalla 7.3.0 i runner in attesa di approvazione non sono nella lista ma in un avviso sopra di essa, vedi [Approvare un RTE](registration.html#approving-an-rte).
**Aggiungi runner** apre una finestra di dialogo a passaggi: **Runner** (nome e descrizione), **Tipo** e **Credenziali**, con un passaggio **Modalità** dopo
**Tipo** per un RTE (In uscita, il predefinito per uno nuovo, In entrata o Database (deprecato)): quattro passaggi per un RTE, tre per gli
altri. Nel passaggio **Tipo** ogni prodotto ha un suggerimento: quello dell'RTE ne dà il nome completo, *Ambiente di esecuzione*. Una riga apre la pagina
del runner, e il suo menu offre:

| Azione | Cosa fa |
|---|---|
| Modifica | Apre la sua pagina |
| Testa connessione | Verifica che risponda e accetti la sua credenziale, vedi [Testa connessione](runner-page.html#test-connection) |
| Attiva, Disattiva | Lo attiva o lo disattiva, a seconda di com'è |
| Modifica credenziali | Apre la scheda Credenziali della sua pagina |
| Elimina | Lo rimuove |

---

## Predefinito e Abilitato

Il predefinito di ogni tipo è dove girano i moduli di quel tipo quando non indicano nessun runner:

| Predefinito per | Dove girano questi moduli quando non indicano nessun runner |
|---|---|
| Form playbook | I moduli `ansible`, su un RTE |
| Form AWX, AAP e Ascender | I moduli `awx`, `aap` e `ascender`, su un runner AWX |
| Form Semaphore | I moduli `semaphore` |
| Form Rundeck | I moduli `rundeck` |
| Form Jenkins | I moduli `jenkins` |

Il primo runner di un tipo diventa il suo predefinito, quindi un solo runner per tipo non richiede passaggi aggiuntivi. Per rendere predefinito un altro runner,
attiva l'interruttore **Predefinito** nella sua pagina (vedi [La pagina di un runner](runner-page.html)).

Un runner disattivato resta nella lista con le sue impostazioni, ma nessun job va a lui, nemmeno come predefinito del suo tipo. Un job per lui fallisce con
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Attivalo o disattivalo con **Attiva** o **Disattiva** nel menu della sua riga, o con l'interruttore **Abilitato** nella sua pagina. Un nuovo runner è attivo, e i
runner che esistevano prima della 7.3.0 sono attivi dopo l'aggiornamento. Il [config seed](../seed/example.html) può disattivarne uno con
`enabled: false`.
