---
layout: default
title: Segreti e cifratura
parent: Sicurezza
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Segreti e cifratura
{: .no_toc }

I due segreti principali, cosa proteggono, e quanto durano le sessioni e i token
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## I due segreti principali

Due segreti proteggono tutto il resto. Impostali entrambi prima che l'istanza contenga dati reali, conservali fuori dall'istanza,
e non cambiarli mai alla leggera:

| Segreto | Cosa protegge | Se non è impostato | Se viene perso o cambiato |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Ogni password e token salvati nel database: credenziali, la password di bind LDAP, i token dei runner, i client secret SSO, gli indirizzi dei webhook di Slack e Teams, la chiave API della chat | Si usa una chiave predefinita, pubblica nel codice sorgente | Perso: ogni segreto salvato va reinserito. Cambiato: dalla 7.3.0 ogni segreto salvato viene ricifrato, vedi [sotto](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | La firma degli access token e dei refresh token, compresi i [token API](../profile/api-token.html) di lunga durata | A ogni avvio viene generato un segreto casuale, quindi ogni riavvio disconnette tutti | Ogni sessione e ogni token API diventano non validi |

Entrambi vengono segnalati con un avviso `[SECURITY]` all'avvio finché mancano. Le pagine delle impostazioni si rifiutano di modificarli,
l'API non li restituisce mai, e i backup li escludono di proposito, quindi un `ENCRYPTION_SECRET` perso non si può recuperare
da nessuna parte: conservane una copia nel tuo gestore di segreti. Il segreto di cifratura si usa come chiave di 32 caratteri; un valore più corto o
più lungo viene completato o troncato.

Cambiare `ACCESS_TOKEN_SECRET` termina subito ogni sessione e ogni token API. Per terminare i token di un solo utente o di una sola
sessione, usa le revoche descritte in [Token](#tokens).

---

## Cambiare il segreto di cifratura

Dalla 7.3.0, impostare o cambiare `ENCRYPTION_SECRET` non fa più perdere i segreti salvati. Al successivo avvio il worker ricifra
ognuno di essi con la nuova chiave, in un'unica transazione del database, prima che qualsiasi altra cosa scriva un segreto:

| Situazione | Cosa impostare |
|---|---|
| L'istanza girava senza `ENCRYPTION_SECRET`, sulla chiave predefinita pubblica | Solo `ENCRYPTION_SECRET`: i segreti vengono ricifrati a partire dalla chiave predefinita |
| L'istanza girava con una chiave tua | `ENCRYPTION_SECRET` con la nuova chiave e [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) con quella vecchia, per quell'unico avvio |

Quando i segreti salvati erano cifrati con una chiave che non è nessuna delle due, non si cambia nulla e l'app si rifiuta di partire finché
`ENCRYPTION_SECRET_PREVIOUS` non indica quella chiave. Rimuovi `ENCRYPTION_SECRET_PREVIOUS` una volta che l'avvio li ha ricifrati, e imposta il
nuovo `ENCRYPTION_SECRET` su ogni nodo dell'app, sul worker e su ogni RTE in modalità database che si registra da solo. Quella
registrazione automatica (`RTE_REGISTER`) è deprecata nella 7.3.0: un RTE che si unisce con un join token (`RTE_JOIN_TOKEN`) in modalità
socket non ha bisogno di `ENCRYPTION_SECRET`, vedi [Modalità RTE](../rte/modes.html).

---

## Token

Un accesso restituisce un access token di breve durata e un refresh token più lungo, che il browser usa per ottenere una nuova coppia:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` per impostazione predefinita. Più breve
  limita l'uso di un token intercettato.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` per
  impostazione predefinita. È il tempo per cui un browser inattivo resta connesso.
* L'opzione di ruolo `allowApiTokens` permette a un utente di richiedere un token API valido per un certo numero di giorni, ed
  `extendedTokenExpiration` ne aggiunge uno che non scade mai. Concedile solo ai ruoli che hanno bisogno di accesso API dagli script.
  Nella [pagina del profilo](../profile/api-token.html) un token si crea da una sessione del browser che ha effettuato l'accesso al massimo 10 minuti
  prima, e mai da un altro token API. Un token che non scade mai dura 50 anni, e gli eventi qui sotto lo terminano comunque.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : `90` per impostazione predefinita. La durata massima di un
  token API: una richiesta più lunga viene ridotta a questo valore.

Un token è un JWT firmato, ma il server tiene anche una lista di token revocati, condivisa da tutti i nodi dell'app, così un token
può terminare prima di scadere:

| Evento | Cosa termina |
|-------|-----------|
| Disconnettersi | Ogni token di quell'accesso: l'access token, il suo refresh token, e un token API quando la disconnessione lo usa |
| Un cambio di password, da parte dell'utente o di un admin | Ogni token dell'utente emesso prima del cambio, token API compresi, su ogni dispositivo |
| L'interruttore **Consenti accesso** di un utente disattivato (utente locale, LDAP o SSO), o un utente locale eliminato | Ogni token dell'utente |
| **Termina sessioni** nella pagina di un utente LDAP o SSO | Ogni token dell'utente; può accedere di nuovo a meno che non sia bloccato |
| **Revoca** su un token API, nella pagina del profilo o nella scheda **Token API** dell'utente | Quel solo token API, subito |

Uno script termina il proprio token API disconnettendosi con esso: `POST /api/v2/auth/logout` con il token nell'intestazione
`Authorization`.
