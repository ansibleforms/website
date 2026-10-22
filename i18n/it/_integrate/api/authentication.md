---
layout: default
title: Autenticazione
parent: API REST
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Autenticazione
{: .no_toc }

Accedi, rinnova il token, o usa un token di lunga durata
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ogni chiamata ha bisogno di un access token nell'header `Authorization`. Un token si ottiene accedendo, e si mantiene valido con
il refresh token.

---

## Accedi

Accedi con l'autenticazione basic, con il nome e la password dell'utente:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

La risposta contiene due token, l'access token e il refresh token:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Chiama l'API

Invia l'access token come bearer token con ogni chiamata:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Rinnova il token

L'access token scade (`ACCESS_TOKEN_EXPIRATION`, 30 minuti per impostazione predefinita). Ottienine uno nuovo con il refresh token,
senza la password:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

La risposta contiene una nuova coppia, nella stessa forma del login. Un refresh token funziona una volta sola: conserva quello nuovo per il rinnovo successivo.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Token di lunga durata

Uno script che gira senza interazione può usare un token che dura di più. Dalla 7.3.0 richiede l'opzione di ruolo `allowApiTokens`:

* Creane uno in [Profilo > Token API](../profile/api-token.html).
* Oppure accedi con il parametro di query `expiryDays`, per un token valido quel numero di giorni:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` viene letto solo dall'URL, mai dal body. Per un utente i cui ruoli non hanno `allowApiTokens`, viene ignorato,
e il login restituisce un token con la durata abituale. `expiryDays=never` richiede anche `extendedTokenExpiration`. Aggiungi il parametro di query `name`
(`?expiryDays=90&name=nightly-backup`) per dare un nome al token nell'elenco dei token dell'utente.

Un token di lunga durata dura al massimo [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) giorni, 90 per
impostazione predefinita: un `expiryDays` più lungo viene ridotto a questo valore, a meno che non sia `never`. Rinnovarlo restituisce un token normale, quindi accedi di nuovo quando scade.

### Token dell'utente che ha effettuato l'accesso

La vista **Token API** del profilo usa questi endpoint, che funzionano per qualsiasi account, SSO compreso, perché non richiedono password:

| Chiamata | Cosa fa |
|---|---|
| `GET /api/v2/profile/tokens` | Elenca i tuoi token API, con il loro `sid`, `name`, creazione, scadenza e ultimo uso |
| `POST /api/v2/profile/tokens` | Crea un token dalla tua sessione; il body contiene `expiryDays` (un numero, o `never`) e un `name` facoltativo |
| `DELETE /api/v2/profile/tokens/{sid}` | Revoca uno dei tuoi token |

`POST` risponde `403` quando viene chiamato con un token API (un token non può crearne un altro), senza `allowApiTokens`, o quando la
sessione ha effettuato l'accesso più di 10 minuti fa (codice `sign_in_again`): prima accedi di nuovo. Una durata superiore al massimo risponde `400`.

---

## Quando un token termina prima

Un token, di lunga durata o no, smette di funzionare prima della scadenza quando succede una di queste cose:

* **Un logout della sua sessione**: `POST /api/v2/auth/logout` con il token termina i token di quel login, e solo quelli. Un
  logout nel browser non termina il token di uno script.
* **Un cambio password**: l'utente cambia la sua password, o un admin la imposta. Ogni token emesso prima viene rifiutato.
* **L'utente viene rimosso o bloccato**: eliminare un utente locale, o bloccare un utente, termina tutti i suoi token. Un admin può anche
  terminare le sessioni di un utente LDAP o SSO.

Un token rifiutato risponde `401`. Accedi di nuovo, con la nuova password se è cambiata.

---

## Script che accedono a ogni esecuzione

Gli endpoint di login e dei token sono protetti contro i flood e i tentativi di indovinare le password, quindi uno script che accede ogni volta che gira
dovrebbe conoscere questi limiti:

| Limite | Predefinito | Cosa succede |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 richieste al minuto da un indirizzo | Login, logout, rinnovo, gli endpoint SSO, `PUT /api/v2/profile` (cambio password) e `POST` o `DELETE /api/v2/profile/tokens` rispondono `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 login falliti di fila | L'account viene bloccato per [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), ogni login risponde `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 login falliti da un indirizzo | Ogni login da quell'indirizzo risponde `429` finché la finestra non termina |

Un `429` porta un header `Retry-After` con i secondi da attendere: fermati e aspetta, non riprovare subito. Un account bloccato
rifiuta anche la password giusta finché il blocco non termina, quindi uno script con una password sbagliata blocca il suo utente per tutti.
Una password attuale sbagliata durante un cambio password (`PUT /api/v2/profile`) conta anch'essa come login fallito, e un account bloccato
non può cambiare la sua password. Un login riuscito azzera il conteggio dell'account, e lo stesso fa un admin che imposta la password.

Per stare lontano da questi limiti, accedi una volta e riusa il token, o usa un token di lunga durata, invece di accedere per
ogni chiamata. Dietro un reverse proxy, imposta [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) così il server vede
l'indirizzo del client, altrimenti tutti i client contano come uno solo.
