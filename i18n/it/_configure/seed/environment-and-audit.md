---
layout: default
title: Modifica e audit
parent: Config seed
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Modifica e audit
{: .no_toc }

Bloccare le pagine delle impostazioni, e cosa registra il log di audit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Disattivare la modifica dell'ambiente

`ALLOW_ENV_EDIT=0` rende le pagine delle impostazioni in sola lettura. Ogni variabile viene comunque mostrata con
il valore in vigore e il motivo per cui non si può modificare, e l'endpoint di salvataggio risponde con
403.

Usala ogni volta che l'ambiente è dichiarato altrove. Altrimenti la pagina delle impostazioni scrive
`persistent/.env`, che su un volume effimero va perso senza avviso al riavvio successivo, e su
uno durevole si allontana dal manifest che dovrebbe fare fede.

{: .note }
> I backup includono `persistent/.env` come `managed.env`, così una ricostruzione recupera le impostazioni del database e
> dei percorsi. **`ENCRYPTION_SECRET` e `ACCESS_TOKEN_SECRET` vengono rimossi**:
> il dump accanto contiene ogni credenziale salvata come testo cifrato AES, e scrivere la chiave che
> lo decifra nella stessa cartella renderebbe sufficiente una copia del backup per leggerle tutte. Imposta
> invece quei due sull'host di destinazione; un commento nel file lo indica.
>
> Ciò che resta può comunque contenere credenziali (`DB_PASSWORD`, `METRICS_TOKEN`, un vecchio `VAULT_TOKEN`), quindi il file viene
> scritto con permessi `0600`. Ripristinarlo è un passaggio separato e volontario invece che parte di un ripristino normale,
> perché l'host del database e i percorsi che contiene descrivono la macchina da cui proviene il backup. La
> finestra di ripristino elenca il file e offre un proprio pulsante *Ripristina ambiente*
> (`POST /api/v2/backup/:folder/restore-env`), che conserva il file precedente come `.env.bak`.

---

## Cosa viene registrato

Ogni applicazione che cambia qualcosa scrive una voce `seed.apply` nel log di audit, indicando
gli oggetti creati, aggiornati, rilasciati ed eliminati. I valori non vengono mai registrati, perché la maggior parte
di essi sono segreti. Un'applicazione senza effetti non scrive nulla, il che mantiene significativa la traccia. Un
controllo periodico che trova il file invariato è un'applicazione senza effetti, così la traccia non guadagna una riga ogni minuto.

Un'applicazione richiesta tramite l'endpoint viene registrata di proposito due volte, e le due righe
registrano cose diverse: `config-seed.apply.create` è **chi** l'ha chiesta, `seed.apply` è
**cosa** ha cambiato.

La pagina Stato riporta il seed due volte: un **controllo** che il file sia ancora leggibile e si analizzi,
e che l'ultimo ricaricamento sia riuscito, e una riga di **informazioni** che dice quanti record
possiede attualmente. Il controllo è l'unico posto che segnala quando il file su disco e la configurazione
in vigore sono divergenti, perché un ricaricamento non riuscito lascia l'istanza in esecuzione.
