---
layout: default
title: Credenziali
parent: Espressioni
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Credenziali
{: .no_toc }

Leggere una credenziale salvata in un'espressione
{: .fs-6 .fw-300 }

---

Leggi una credenziale salvata per nome o tramite espressione regolare, con un'alternativa di riserva:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Prima si prova il nome esatto. Se nessuna credenziale ha quel nome, il nome viene usato come espressione regolare, e poi si prova l'alternativa.

#### Limitato dal ruolo

Quando uno dei ruoli dell'utente elenca `credentials` in `config.yaml`, `fn.fnCredentials` restituisce solo una credenziale consentita
da un ruolo del genere: i pattern del ruolo vengono confrontati con il nome della credenziale trovata (per nome, espressione regolare o alternativa),
e qualsiasi altra viene rifiutata. I ruoli senza l'elenco non la limitano, e un amministratore non è mai limitato.

#### Credenziali da un archivio di segreti

Una credenziale che indica un [archivio di segreti](../secret-stores) ottiene `user` e `password`
da quell'archivio al momento dell'esecuzione. `fn.fnCredentials('myapp')` continua a funzionare senza modifiche.

Un segreto si può leggere anche senza una riga di credenziale, ovunque sia accettato un nome di credenziale
(compresi `fnRestBasic`, `fnRestJwtSecure` e le sostituzioni negli header di `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

Le chiavi del segreto vengono mappate come descritto in [Nomi delle chiavi](../secret-stores#key-names).
Un segreto con un'altra struttura viene rimodellato con un'espressione `jq` come terzo argomento:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
