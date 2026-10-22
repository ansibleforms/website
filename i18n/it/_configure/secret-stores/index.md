---
layout: default
title: Archivi di segreti
nav_order: 13
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: 595f94a84c4e8182b1b79289eb309a814dec1287
---

# Archivi di segreti
{: .no_toc }

Leggi le credenziali da un gestore di segreti invece di salvarle in AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: collega un gestore di segreti, e lascia che le credenziali ne leggano l'utente e la password.

---

## Come funziona

Un **archivio di segreti** è una connessione a un gestore di segreti, aggiunta in
**Connessioni > Archivi di segreti**. Una **credenziale** può allora indicare un archivio e un punto al suo interno
(il *riferimento al segreto*). Quando un modulo, un playbook o un'espressione usa quella credenziale:

- **utente** e **password** vengono letti dall'archivio, ogni volta (entro il tempo di cache dell'archivio);
- **host**, **porta** e **database** restano quelli della riga della credenziale. Quando la riga lascia
  vuoto uno di essi e il segreto lo contiene, si usa il valore del segreto.

I moduli continuano a indicare la credenziale per nome, quindi spostare una password in un archivio non cambia
nulla nei tuoi moduli.

| Tipo di archivio | Stato |
|---|---|
| HashiCorp Vault (KV v1 e v2, autenticazione con token) | disponibile |
| Credenziali dinamiche di HashiCorp Vault (`<mount>/creds/<role>`) | sperimentale |
| CyberArk Central Credential Provider (CCP) | sperimentale |

---

## Aggiungere un archivio

Dalla 7.3.0 solo un admin può aggiungere, modificare o eliminare un archivio, perché il suo token o la sua chiave vengono inviati al suo indirizzo. Ogni archivio ha questi campi:

| Campo | Significato |
|---|---|
| Nome | Come le credenziali indicano l'archivio. |
| Tipo | Il gestore di segreti. |
| Credenziale | Come e dove accede l'archivio: una credenziale di [Connessioni > Credenziali](../credentials.html), nel passaggio **Credenziali**, di tipo **HashiCorp Vault** (il suo token e il suo indirizzo) o **CyberArk**. Contiene l'URL di base, es. `https://vault.example.com:8200`, e le impostazioni TLS: salta la verifica del certificato, o un Bundle CA in PEM per una CA privata. Non può leggere a sua volta da un archivio di segreti. |
| Cache (secondi) | Per quanto tempo un segreto letto viene riutilizzato. `0` lo legge a ogni utilizzo. Predefinito 60. |
| Opzioni aggiuntive (JSON) | Opzioni specifiche del tipo, come oggetto JSON. |

Fino alla 7.2.0 l'indirizzo, il token e le impostazioni TLS erano campi dell'archivio. L'aggiornamento alla 7.3.0 li sposta nella sua
credenziale, chiamata `<store>-token` (o `<store>-appid` per CyberArk), vedi [Indirizzi nelle credenziali](../credentials/types.html#addresses-in-credentials).

**Testa connessione** verifica l'accesso senza leggere un segreto. La pagina **Stato** verifica ogni archivio, e avvisa 7 giorni
prima che scada un token Vault.

Ogni gestore di segreti ha una pagina propria:

| Pagina | Cosa tratta |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 e v2 con autenticazione con token, e credenziali dinamiche per database |
| [CyberArk](cyberark.html) | Il Central Credential Provider (CCP) dell'Application Access Manager di CyberArk |

---

## Usare un archivio

### In una credenziale

In **Connessioni > Credenziali**, nel passaggio **Archivio** della credenziale, scegli **Archivio di segreti**, poi scegli
l'**Archivio di segreti** e compila il **Riferimento**. L'utente e la password vengono allora letti dall'archivio, non digitati.

### In linea, senza una riga di credenziale

Ovunque sia accettato il nome di una credenziale, puoi invece indicare direttamente un archivio (`fnCredentials`, `fnRestBasic`,
le `credentials:` di un modulo, il `dbConfig` di una query).

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

Senza una riga di credenziale, un segreto di database richiede almeno un `db_type` e un host, per esempio:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Senza `db_type`, il segreto è una credenziale semplice (utente, password e qualsiasi altra chiave), e una query su di esso presume `mysql`.

### Nomi delle chiavi

Un segreto viene associato a una credenziale con questi alias. Le altre chiavi vengono passate così come sono.

| Campo della credenziale | Chiavi accettate nel segreto |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | stesso nome (solo segreti in linea) |

Per una riga di credenziale, host, porta e nome del database del segreto si usano solo dove la
riga li lascia vuoti.

Un segreto con una struttura diversa si può rimodellare con un'espressione `jq`, passata come terzo argomento di
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## Nel config seed

Gli archivi si possono dichiarare anche nel config seed, come gli altri oggetti di amministrazione:

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login        # its address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}  # the Vault token
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

L'archivio accede con la sua credenziale: una `vault` contiene l'indirizzo del Vault in `url` e il token come password, una `cyberark`
l'AppID e l'indirizzo del CCP. Senza una credenziale, si usano l'`url` e il `token` propri dell'archivio.
Per i dettagli, vedi [Config seed](../seed).

---

## Aggiornare dalle variabili VAULT_*

Prima della 7 l'unico archivio era un HashiCorp Vault configurato con le variabili d'ambiente
`VAULT_*`, e una credenziale vi puntava con **Vault path**.

- **Le variabili vengono importate una volta** come archivio chiamato `vault`; rimuovile dopo.
- **Le credenziali con un `vault_path`** ora usano quell'archivio; `vault_path` sparirà nella 8.
