---
layout: default
title: Un utente locale
parent: Utenti e gruppi
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Un utente locale
{: .no_toc }

Aggiungere un utente locale, e le schede della sua pagina
{: .fs-6 .fw-300 }

**Aggiungi utente** apre una procedura guidata in tre passaggi: **Utente** (nome utente, descrizione, email), **Password** e **Gruppo**.

La pagina di un utente, `/settings/users/<id>`, ha queste schede:

| Scheda | Cosa mostra |
|---|---|
| **Dettagli** | L'interruttore **Consenti accesso**, il nome utente, la descrizione, l'email e, dalla 7.3.0, l'**Ultimo accesso** |
| **Gruppi** | I gruppi a cui appartiene l'utente |
| **Ruoli** | I ruoli che ha l'utente, e cosa concede ciascuno: **Direttamente**, **Tramite** un gruppo, o **Tutti** |
| **Moduli** | I moduli che quei ruoli aprono |
| **Job** | I job avviati dall'utente, dal più recente |
| **Job salvati** | I valori dei moduli che l'utente ha salvato per eseguirli di nuovo |
| **Pianificazioni** | I job che l'utente ha pianificato con Esegui più tardi |
| **Attività** | Cosa ha registrato il log di audit sulle azioni dell'utente |
| **Token API** | I token API dell'utente, con quando ognuno è stato creato, quando scade e quando è stato usato l'ultima volta; **Revoca** ne termina uno subito |

Dalla 7.3.0 gli accessi di un utente locale vengono registrati, come già quelli di un utente LDAP o SSO: **Ultimo accesso** mostra il più recente, e
la lista degli utenti ha una colonna **Ultimo accesso** ordinabile per ogni origine, così un account che nessuno usa salta all'occhio. Un accesso rifiutato non viene
registrato, e un utente locale che non ha effettuato l'accesso dall'aggiornamento mostra `–`.

**Cambia password** ed **Elimina** sono in alto a destra. L'utente `admin` non si può mai eliminare né rinominare.
