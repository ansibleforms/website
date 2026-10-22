---
layout: default
title: Lista
parent: Annunci
nav_order: 2
translated_from: 3bbe4ccb28f9305a450ac85b7d99531ce28a84cd
---

# Lista
{: .no_toc }

Gli annunci non ancora terminati, le loro colonne e la pagina di un annuncio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

**Impostazioni > Aspetto > Annunci** elenca ogni annuncio non ancora terminato, con queste colonne:

| Colonna | Significato |
|---|---|
| **Abilitato** | Se compare sotto l'intestazione dal suo inizio alla sua fine (dalla 7.3.0) |
| **Messaggio** | Il testo sotto l'intestazione |
| **Tipo** | Info, Avviso o Pericolo |
| **Data di inizio** | Quando inizia a comparire; `–` quando compare subito |
| **Data di fine** | Quando termina; `–` quando compare finché non viene eliminato |
| **Creato da** | Chi l'ha aggiunto |

Un clic su una riga, o **Modifica** nel menu della riga, apre la pagina dell'annuncio. Il menu ha anche **Abilita** o **Disabilita**, ed **Elimina**.

Una volta passata la sua data di fine, un annuncio viene eliminato: la lista conserva solo quelli in arrivo e quelli che stanno comparendo.

---

## La pagina di un annuncio

Dalla 7.3.0 ogni annuncio si apre in una pagina propria, in `/settings/announcements/<id>`, con una sola scheda, **Dettagli**.

Contiene il messaggio, il tipo, le date di inizio e di fine e l'interruttore **Abilitato**, che viene salvato subito; gli altri campi si salvano
con **Salva**, ed **Elimina** rimuove l'annuncio. Il titolo della pagina lo identifica con i primi caratteri del suo messaggio.
