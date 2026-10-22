---
layout: default
title: Valori predefiniti
parent: Aspetto
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Valori predefiniti
{: .no_toc }

Il tema, la lingua, il fuso orario e il formato data per gli utenti che non ne hanno scelto nessuno
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## I valori predefiniti

**Valori predefiniti** imposta l'aspetto dell'app per un utente che non ha fatto una scelta propria nelle sue
[preferenze](../profile/preferences.html); la scelta dell'utente prevale sempre:

| Campo | Scelte | Senza una scelta |
|---|---|---|
| **Tema predefinito** | Segui il browser, Chiaro, Scuro o Colore, con uno di 12 colori per Colore | Segui il browser (Chiaro fino alla 7.2) |
| **Lingua predefinita** | Le lingue dell'app, salvata in [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Inglese |
| **Vista dei moduli predefinita** | Riquadri o Elenco, per la pagina dei moduli | Riquadri |
| **Fuso orario predefinito** | UTC, il browser di ogni utente o qualsiasi fuso per nome | UTC |
| **Formato data predefinito** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY`, mostrati con la data di oggi | `YYYY-MM-DD` |

La lingua è una variabile d'ambiente e si applica senza riavvio. Con
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) impostata a `0` la pagina la mostra in sola lettura.

Dalla 7.3.0 la pagina è divisa nelle due schede delle preferenze del profilo, **Aspetto** (tema, lingua e vista dei moduli) e **Data e
ora** (fuso orario e formato data, con un'anteprima dell'ora attuale), e la sua casella di ricerca elenca le corrispondenze sotto il nome di ogni scheda.

---

## Seguire il browser

Dalla 7.3.0 **Segui il browser** mostra a ogni utente il tema chiaro o scuro richiesto dal suo browser, e cambia insieme a lui.

È il valore predefinito quando non si sceglie nessun tema predefinito, quindi una nuova installazione segue il browser. Passando il puntatore su uno dei colori di
**Colore** si vede un'anteprima dell'app in quel colore; il tema che avevi ritorna quando il puntatore si sposta, e nulla viene salvato fino a **Salva**.
