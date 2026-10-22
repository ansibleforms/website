---
layout: default
title: Etichette
parent: Aspetto
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Etichette
{: .no_toc }

Etichette accanto al logo che dicono di quale istanza si tratta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

Dalla 7.3.0 **Impostazioni > Aspetto > Etichette** contiene più etichette accanto al logo dell'intestazione, come PRODUCTION ed EU:

| Colonna | Significato |
|---|---|
| **Abilitato** | Se l'etichetta compare accanto al logo e nella pagina di accesso |
| **Etichetta** | Il suo testo, mostrato come la pillola colorata che compare nell'intestazione |

Le righe seguono l'ordine dell'intestazione. Un clic su una riga, o **Modifica** nel menu della riga, apre la pagina dell'etichetta; il menu della riga ha anche
**Abilita** o **Disabilita**, a seconda del caso, **Sposta su** e **Sposta giù** per cambiare l'ordine, ed **Elimina**.

L'intestazione e la pagina di accesso mostrano le etichette abilitate nel loro ordine. Oltre la terza, un **+N** grigio raccoglie le altre nel suo tooltip,
e un telefono mostra la prima etichetta e il **+N**. Un'etichetta salvata compare subito in tutti i browser aperti.

---

## Aggiungere un'etichetta

**Aggiungi etichetta** apre una finestra di dialogo con i due campi dell'etichetta, entrambi obbligatori:

| Campo | Significato |
|---|---|
| **Etichetta** | Il testo dell'etichetta, come PRODUCTION |
| **Colore** | Blu, verde, ambra, arancione, rosso o grigio, come campioni rotondi; rosso all'inizio |

Un'anteprima mostra l'intestazione con tutte le etichette abilitate e quella nuova mentre la scrivi. Una nuova etichetta è abilitata e viene dopo
le altre. La sua pagina ha una sola scheda, **Dettagli**, con gli stessi campi, l'interruttore **Abilitato**, che viene salvato subito, e l'anteprima.

---

## L'etichetta di ambiente della 7.2

Fino alla 7.2, **Impostazioni > Aspetto > Ambiente** impostava un'unica etichetta accanto al logo.

Con una sola etichetta, PRODUCTION EU e PRODUCTION US diventano entrambe PRODUCTION quando più istanze sono aperte una accanto all'altra. Dalla 7.3.0
l'aggiornamento rende quell'etichetta la prima della lista, con il suo testo, il suo colore e il fatto che comparisse o no, e il vecchio indirizzo
**Ambiente** apre la lista.

---

## Le etichette nel config seed

Dalla 7.3.0 il [config seed](../seed/) dichiara le etichette nella sua sezione `labels`, ognuna con il suo testo e, se vuoi, il suo colore:

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` è uno tra `blue`, `green`, `amber`, `orange`, `red` o `grey`, e `position` le ordina, dalla più bassa. Un'etichetta dichiarata
nel seed è in sola lettura nella sua pagina, come ogni [oggetto gestito](../seed/managed-objects.html).
