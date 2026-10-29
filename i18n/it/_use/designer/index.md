---
layout: default
title: Designer
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: bf0bdf119ae004ec2da8640d18a254483027098c
---

# Designer
{: .no_toc }

Modificare moduli, playbook, inventari e workflow nel browser
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per chi scrive i moduli: le sezioni del designer, e cosa mostra ciascuna delle loro schede.

Il designer richiede l'[opzione di ruolo](../config/roles.html#role-options) `showDesigner`. Modifica un elemento alla volta, un
modulo, un playbook o un file di workflow, con le sue sezioni nel menu a sinistra. Ogni tipo di file richiede anche una propria opzione, tutte
attive per impostazione predefinita: `allowPlaybookDesign` per i **Playbook**, `allowWorkflowDesign` per i **Workflow**,
`allowInventoryDesign` per gli **Inventari** e `allowVarsFileDesign` per i **File di variabili**. Senza, la sua sezione è
in sola lettura e il server rifiuta di salvare, creare, rimuovere o inviare con push i suoi file; moduli e workflow possono comunque sceglierli. I
**Moduli**, le **Categorie** e le **Costanti** richiedono allo stesso modo `allowFormDesign`: senza, sono in sola lettura, e il server
rifiuta di salvarli, di farne il pull o il push. Modifica una sola persona alla volta: vedi [Il blocco del designer](lock.html).
Un ruolo può anche nascondere i moduli, i playbook e i workflow degli altri team: vedi [Designer limitati](#limited-designers).

---

## Le sue sezioni

Ogni sezione modifica un tipo di file, conservato in locale o in un [repository](../repositories/):

| Sezione | Cosa modifica |
|---|---|
| **Moduli** | I file dei moduli |
| **Categorie** | Le categorie di `config.yaml` |
| **Costanti** | Le costanti di `config.yaml` |
| **File di variabili** | I file di variabili caricati dai moduli |
| **Playbook** | I playbook eseguiti da moduli e workflow |
| **Inventari** | Gli inventari: `inventory.yaml`, `group_vars` e `host_vars` |
| **Workflow** | I file di [workflow](../workflows/) |

Le sezioni con file li elencano in un esploratore dei file e aprono il primo; una sezione che non ha ancora file lo dice. La
sezione **Moduli** e ogni sezione di file hanno un pulsante **Nuovo file** per primo nella barra degli strumenti: negli Inventari crea un nuovo
inventario, nei Workflow un nuovo workflow vuoto. La lente d'ingrandimento dell'esploratore apre una casella che filtra i suoi file per nome.

La casella di ricerca sulla riga del titolo trova un testo nello YAML aperto: evidenzia ogni punto in cui compare. Funziona nella
scheda **YAML**, una volta che il blocco del designer è tuo.

---

## Le sue schede

Ogni sezione ha le stesse tre schede, tutte sullo stesso YAML: una modifica in una si vede nelle altre, e **Salva** la salva.

- **YAML** è il file così com'è scritto.
- **Visuale** lo modifica con dei campi. Cambiano solo le chiavi toccate da una modifica, così i commenti e il resto restano come sono scritti.
- **Anteprima** mostra cosa fa, e non modifica nulla.

Cosa mostrano le schede Visuale e Anteprima, sezione per sezione:

| Sezione | Visuale | Anteprima |
|---|---|---|
| **Moduli** | Le impostazioni del modulo e i suoi campi, con elenchi dei playbook, inventari e workflow del designer | Il modulo com'è ora, modifiche non salvate comprese; il suo invio non esegue nulla |
| **Categorie** | Le categorie come tabella, modificabile | Il menu della pagina Moduli, costruito a partire da esse |
| **Costanti** | Le costanti come struttura ad albero, modificabile (una chiave si sposta con i tasti freccia) | Ogni costante con il suo riferimento, `$(NAME)`, da copiare, e i moduli che la usano |
| **File di variabili** | Le variabili, modificabili | Ogni variabile con il suo riferimento in un playbook, {% raw %}`{{ name }}`{% endraw %}, da copiare, e i moduli che caricano il file |
| **Playbook** | I play: per ogni play il nome, gli host, **Become**, **Raccogli facts** e i ruoli, e i suoi task, ognuno con il suo modulo e i suoi argomenti | La struttura del playbook: i suoi play, con host, ruoli e task, e i playbook che importa |
| **Inventari** | I gruppi, i loro gruppi figli, i loro host, e le variabili impostate da ciascuno | L'inventario come albero, con i suoi `group_vars` e `host_vars` |
| **Workflow** | Il grafo del workflow, per [modificarlo](../workflows/designer.html) | Una [prova a vuoto](../workflows/designer.html#trying-it-out): fai clic su un nodo per farlo fallire |

Quando lo YAML non si riesce a leggere, le schede Visuale e Anteprima dicono perché, con **Mostra in YAML** per aprire lo YAML alla riga.

---

## Designer limitati

Dalla 7.5.0 tre opzioni di ruolo limitano quali moduli, playbook e workflow mostra il designer, così ogni team progetta i propri.
Tutte e tre sono attive per impostazione predefinita e sempre attive per gli admin:

| Opzione | Disattivata, il designer mostra solo |
|---|---|
| `designAllForms` (**Modificare Tutti i Moduli**) | I moduli i cui `roles` contengono uno dei ruoli dell'utente, e i sottomoduli che nessun modulo nascosto usa |
| `designAllPlaybooks` (**Modificare Tutti i Playbook**) | I playbook che i moduli dell'utente eseguono, e quelli che nessun modulo usa ancora |
| `designAllWorkflows` (**Modificare Tutti i Workflow**) | I file di workflow che i moduli dell'utente eseguono, annidati compresi, e quelli che nessun modulo usa ancora |

Un modulo esegue un playbook tramite il suo `playbook`, i suoi passi ansible e i workflow che esegue. Cosa non può fare un designer limitato:

- **Vedere un file nascosto.** Non viene mai elencato né nominato: aprirne uno risponde come un file mancante, e un nuovo file con il suo nome
  come un file già presente.
- **Puntare a uno di essi.** Un modulo che nomina un modulo nascosto come sottomodulo non ne mostra nulla, e un modulo o un file di workflow
  che nomina un playbook o un workflow nascosto viene rifiutato.
- **Cambiare un sottomodulo condiviso.** Un sottomodulo usato anche da un modulo nascosto è in sola lettura, e un modulo salvato deve mantenere
  uno dei ruoli dell'utente.
- **Toccare i moduli nascosti di un file.** Un file con più moduli mantiene quelli nascosti come sono al salvataggio, e il ripristino di un
  backup dei moduli viene rifiutato.
- **Aggiungere codice eseguito dal server.** Un modulo salvato non può acquisire un'espressione o una query eseguita dal server, e l'anteprima di
  un modulo non ancora salvato non esegue alcuna espressione propria.
- **Leggere nomi di file nell'output di git.** L'output di un pull o di un push omette le righe che nominano file.

`allowFormDesign`, `allowPlaybookDesign` e `allowWorkflowDesign` decidono ancora se i file mostrati si possono modificare.
Inventari, file di variabili, categorie e costanti restano visibili a ogni designer. Un utente con solo una parte delle impostazioni vede solo
i propri moduli e file di workflow nelle schede **Moduli** delle pagine delle impostazioni e nella scheda **Usato da** di una credenziale.
