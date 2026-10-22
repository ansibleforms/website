---
layout: default
title: Collegamenti
parent: Aspetto
nav_order: 5
translated_from: b17adbc1210baac2cf6786f7b0cef5e18fea8ae1
---

# Collegamenti
{: .no_toc }

I collegamenti dell'intestazione, integrati e tuoi
{: .fs-6 .fw-300 }

**Collegamenti** imposta i collegamenti dell'intestazione, per ogni utente che ha effettuato l'accesso, in due schede.

**Integrati** ha l'interruttore **Designer**, salvato in [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) e applicato
senza riavvio. Se è disattivato, il designer sparisce per tutti: il suo collegamento, la sua pagina e la sua API.

**Personalizzati** contiene i tuoi collegamenti, come una wiki, un runbook o un portale di supporto. **Aggiungi collegamento** aggiunge una riga con questi campi:

| Campo | Significato |
|---|---|
| **Icona** | L'icona prima dell'etichetta, scelta da un elenco |
| **Etichetta** | Il testo del collegamento |
| **Indirizzo** | Un sito (`https://…`) o una pagina dell'app (`/forms/all`) |
| **Nuova scheda** | Apre il collegamento in una nuova scheda del browser |

I pulsanti di una riga la spostano: **→** mette il collegamento dentro quello sopra, che allora si apre come menu nell'intestazione,
**←** lo riporta fuori nell'intestazione, e le frecce su e giù lo spostano (un menu insieme ai collegamenti che contiene).
Un menu non ha bisogno di un indirizzo proprio.

L'intestazione contiene al massimo 5 dei tuoi collegamenti dopo quelli integrati, e al massimo 10 dentro ogni menu.
