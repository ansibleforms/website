---
layout: default
title: HashiCorp Vault
parent: Archivi di segreti
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Leggere e scrivere credenziali in HashiCorp Vault KV, leggere segreti dinamici
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Campi dell'archivio

Oltre ai [campi che ha ogni archivio](./#adding-a-store), un archivio HashiCorp Vault ha questi campi:

| Campo | Significato |
|---|---|
| Credenziale | Una credenziale **HashiCorp Vault** di [Connessioni > Credenziali](../credentials.html): l'indirizzo del Vault, le sue impostazioni TLS, e il token come password, con accesso in lettura ai percorsi usati dalle tue credenziali. **Aggiungi credenziale** ne crea una di quel tipo. AnsibleForms non rinnova il token. |
| Namespace | Il namespace di Vault Enterprise, inviato come `X-Vault-Namespace`. Mostrato quando **Vault Enterprise** è attivato, nel passaggio **Tipo**. |
| Versione KV | `2` (predefinito) o `1`. |
| Mount predefinito | Usato per un riferimento senza slash, es. `myapp` diventa `secret/data/myapp`. |

Il riferimento al segreto è il percorso, es. `secret/myapp/prod`. Per KV v2 il segmento `/data/`
viene inserito quando lo ometti.

---

## Scrivere le credenziali

Da 7.6.0 utente e password di una credenziale possono essere scritti nel Vault al **Salvataggio** (vedi [Scrivere le credenziali](./#writing-credentials)).

Attiva **Consenti la scrittura** nelle **Opzioni** dell'archivio, e indica dove può scrivere:

| Campo | Significato |
|---|---|
| Consenti la scrittura | Permette a una credenziale di scrivere utente e password in questo archivio al **Salvataggio**. Disattivato per impostazione predefinita. |
| Prefisso di scrittura | Il percorso in cui, o sotto cui, vengono scritte le credenziali, ad es. `secret/ansibleforms`. Un mount da solo, ad es. `secret`, consente l'intero mount. Obbligatorio con la scrittura attiva. |

Il segreto viene scritto come `username` e `password`, in KV v2 o v1 come indica la **Versione KV** dell'archivio. Il token richiede le capacità
read, create e update sotto il prefisso; read verifica se c'è già un segreto. Per KV v2 e il prefisso `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

Il percorso di un motore di segreti dinamici, ad es. `database/creds/readonly`, non viene mai scritto: è Vault a creare quelle credenziali.

---

## Credenziali dinamiche per database

Un riferimento della forma `<mount>/creds/<role>`, es. `database/creds/readonly`, legge da un
motore di segreti dinamici come il motore database di Vault. Vault crea allora un nuovo account
di database per ogni lettura, valido per la durata del lease.

- Un account viene riutilizzato per l'80% del suo lease, non per il tempo di cache; con cache `0`, ogni query ne legge uno nuovo.
- Vault restituisce solo un utente e una password: metti il resto della connessione nella riga della credenziale.
- Il lease non viene mai revocato in anticipo; l'account scade quando Vault termina il lease.
