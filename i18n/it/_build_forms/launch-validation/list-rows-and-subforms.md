---
layout: default
title: Righe delle liste
parent: Validazione all'avvio
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Righe delle liste
{: .no_toc }

Come vengono validate le righe dei campi list
{: .fs-6 .fw-300 }

---

Un campo `list` contiene righe; ogni riga è un'istanza del suo sottomodulo, compilata tramite l'editor
di riga. Un campo `yaml` con un `subform` è una riga di questo tipo. Il server le tratta nello stesso modo
dell'editor di riga del browser: ogni riga viene risolta tramite il suo sottomodulo, con i valori del modulo
come `__parent__`, le sue regole controllate e i suoi campi calcolati valutati. Le liste annidate funzionano
allo stesso modo: nella lista di una riga, `$(__parent__.__parent__.x)` raggiunge il modulo.

Le righe vengono controllate così:

- **Una riga che l'utente ha aggiunto o modificato** nell'editor viene risolta e validata.
- **Una riga che nessuno ha toccato**, prodotta dal default, dall'espressione o dalla query della lista stessa
  (come le voci esistenti di una lista di ACL), passa **esattamente com'è arrivata**, come nel
  browser: non viene rivalidata e non le viene aggiunto nulla. Una voce esistente che viola una regola
  scritta in seguito non blocca l'avvio.
- **Una riga marcata come eliminata** (il `deleteMarker` della lista) viene mantenuta così com'è e non viene validata.

Per distinguere queste righe senza fidarsi della richiesta, il server esegue di nuovo la sorgente
della lista (il suo default, altrimenti la sua espressione o query) durante la validazione all'avvio. Una riga
che non è passata dall'editor passa invariata **solo se è una delle righe prodotte da quella
sorgente**. Qualsiasi altra riga, come una inventata da un chiamante REST, viene risolta e
validata come una riga modificata. Una riga qualsiasi quindi non può aggirare i controlli, mentre
le righe non toccate del browser continuano a passare invariate.

Un utente del browser se ne accorge in un solo caso: i dati della sorgente sono cambiati tra l'apertura del
modulo e il suo avvio (nel frattempo una voce è stata modificata o rimossa), **e** quella riga
viola una regola del suo sottomodulo. A quel punto la riga non conta più come una delle righe della sorgente, quindi
viene validata, e l'avvio viene rifiutato indicando la riga, per esempio
`acls[2].user_or_group (regex)`.

Le righe che falliscono compaiono in `rowErrors` con il loro `index` (un campo `yaml` non ne ha) e nel log come
`disks[1].size (maxValue)`.

Un avvio può contenere al massimo **500 righe** su tutti i livelli di annidamento, perché ogni riga esegue le query del suo sottomodulo.

---

## Marker delle righe

I marker che una lista imposta sulle sue righe (`insertMarker`, `updateMarker` e `deleteMarker`; senza
`insertMarker`, le nuove righe ricevono `__inserted__` quando la lista imposta `allowDelete: false`, un `deleteMarker` o un `updateMarker`)
arrivano al playbook su ogni riga che ne porta uno. Una riga rimossa viene inviata con il suo marker di
eliminazione, così il playbook può rimuoverla. Prima della 6.4.1 una riga di lista portava un marker solo quando il suo
sottomodulo lo dichiarava come campo (nascosto).
