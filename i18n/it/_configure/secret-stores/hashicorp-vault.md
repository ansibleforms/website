---
layout: default
title: HashiCorp Vault
parent: Archivi di segreti
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Leggi le credenziali da HashiCorp Vault, da KV v1 o v2 o da un motore di segreti dinamici
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

## Credenziali dinamiche per database

Un riferimento della forma `<mount>/creds/<role>`, es. `database/creds/readonly`, legge da un
motore di segreti dinamici come il motore database di Vault. Vault crea allora un nuovo account
di database per ogni lettura, valido per la durata del lease.

- Un account viene riutilizzato per l'80% del suo lease, non per il tempo di cache; con cache `0`, ogni query ne legge uno nuovo.
- Vault restituisce solo un utente e una password: metti il resto della connessione nella riga della credenziale.
- Il lease non viene mai revocato in anticipo; l'account scade quando Vault termina il lease.
