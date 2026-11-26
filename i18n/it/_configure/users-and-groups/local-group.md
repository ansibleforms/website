---
layout: default
title: Un gruppo locale
parent: Utenti e gruppi
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Un gruppo locale
{: .no_toc }

La pagina di un gruppo locale e le sue schede
{: .fs-6 .fw-300 }

Dalla 7.8.0, **Aggiungi gruppo** apre la procedura guidata **Nuovo gruppo** in tre passaggi: **Dettagli** (il nome e la descrizione), **Utenti** (gli
utenti locali da mettere nel gruppo) e **Ruoli** (i ruoli da dargli, così che i suoi utenti li abbiano). Solo il nome è obbligatorio. **Salva**,
all'ultimo passaggio, crea il gruppo, poi aggiunge gli utenti e dà i ruoli: quello che non riesce viene indicato in un messaggio, e il gruppo resta.

La pagina di un gruppo, `/settings/groups/<id>`, ha queste schede:

| Scheda | Cosa mostra |
|---|---|
| **Dettagli** | Il nome e la descrizione |
| **Utenti** | Gli utenti del gruppo; **Aggiungi utente** ne aggiunge uno, il menu di una riga o le caselle di spunta ne rimuovono uno |
| **Ruoli** | I ruoli che indicano il gruppo |
| **Moduli** | I moduli che quei ruoli aprono |

Un gruppo con utenti non si può eliminare: rimuovi prima i suoi utenti. Il gruppo `admins` non si può mai eliminare né rinominare.
