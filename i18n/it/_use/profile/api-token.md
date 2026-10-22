---
layout: default
title: Token API
parent: Il tuo profilo
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# Token API
{: .no_toc }

Creare un token per script e agenti IA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Chi può crearne uno

Un token di lunga durata permette agli script di chiamare l'API senza la tua password. Dalla 7.3.0 richiede l'opzione di ruolo `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Fino alla 7.2.0 l'opzione era solo `extendedTokenExpiration`. A un ruolo precedente alla 7.3.0 che imposta solo quell'opzione viene dato
`allowApiTokens`, così mantiene i suoi token; con entrambe, si può creare anche un token che non scade mai. Vedi [Opzioni di ruolo](../config/roles.html#role-options).

---

## Creare un token

**Nuovo token**, sulla riga del titolo di **Profilo > Token API**, apre un wizard in tre passi:

1. **Dettagli**: un nome, per riconoscere il token nell'elenco, e per quanto tempo resta valido. Le scelte sono 30, 90, 180
   o 365 giorni fino a [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 per impostazione predefinita), quel
   massimo stesso, e **Non scade mai** con `extendedTokenExpiration`. Scegli il periodo più breve di cui il tuo script ha bisogno.
2. **Conferma**: un account locale o LDAP inserisce la propria password, che non viene salvata nel token. Un account Microsoft Entra ID o
   OIDC qui non ha una password: il suo token viene creato dalla sua sessione, che deve aver effettuato l'accesso al massimo 10 minuti
   prima, quindi il provider potrebbe chiederti prima di accedere di nuovo.
3. **Copia**: il token, mostrato **una sola volta**. Copialo con **Copia** e custodiscilo con la stessa cura di una password.

Invia il token nell'header `Authorization` di ogni chiamata API:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Un token API non può crearne un altro. Il token di un account SSO porta con sé i ruoli del suo ultimo accesso: una modifica dei gruppi presso il
provider di identità lo raggiunge solo quando accedi di nuovo e crei un nuovo token.

---

## I tuoi token

I token che hai creato sono elencati con il loro nome e con quando ognuno è stato creato, quando scade e quando è stato usato l'ultima volta; **Revoca** nel menu di una riga ne termina uno.
Un amministratore li vede e li revoca anche nella tua pagina in **Impostazioni > Utenti**. Un token termina alla scadenza, o prima:

- **con una revoca**, dall'elenco;
- **con un logout fatto con il token** (`POST /api/v2/auth/logout` con il token nell'header `Authorization`), che lo termina insieme
  alla sessione in cui è stato creato;
- **con un cambio di password**, che termina ogni token e sessione del tuo account creati prima di esso, e con il blocco del tuo account.

Anche un token che non scade mai termina in questi casi. Uno script può anche richiedere da sé un token tramite l'API di login e
il suo parametro `expiryDays` (`POST /api/v2/auth/login?expiryDays=90`, oppure `expiryDays=never`); un `expiryDays` più lungo viene ridotto
a `API_TOKEN_MAX_DAYS`.
