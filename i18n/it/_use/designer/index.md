---
layout: default
title: Designer
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
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
