---
layout: default
title: I database nei moduli
parent: Database
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# I database nei moduli
{: .no_toc }

Come il dbConfig di un campo indica un database
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Indicare un database

Un campo con una `query` la esegue sul database indicato dal suo `dbConfig`.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Dalla 7.5.0 il nome viene cercato in quest'ordine:

| Ordine | Il nome è | La query si connette con |
|---|---|---|
| 1 | Un database di **Connessioni > Database** | La credenziale indicata da quel database |
| 2 | Altrimenti una credenziale di tipo **Database** di **Connessioni > Credenziali** | Quella credenziale, come prima della 7.5.0 |

Il tipo di database (MySQL, MSSQL, PostgreSQL, Oracle o MongoDB) viene dalla credenziale, quindi il modulo non lo indica mai. Una credenziale
senza tipo viene letta come MySQL.

---

## I moduli scritti prima della 7.5.0

Ogni modulo che indicava una credenziale nel `dbConfig` continua a funzionare, senza modifiche.

L'[aggiornamento alla 7.5.0](../databases.html#upgrading-to-750) crea un database per ogni credenziale database, con lo stesso nome e
connesso con quella credenziale, così il nome che indica un modulo trova ora prima il database, che porta allo stesso accesso. Una credenziale
di tipo database senza un database con il suo nome viene ancora trovata dal passo 2.

Un database e una credenziale possono condividere un nome, come fa l'aggiornamento. Vince il database: puntalo verso un'altra credenziale e ogni
modulo che indica quel nome lo segue, ed è così che un modulo passa a un altro server senza essere modificato.

---

## Le forme di dbConfig

Le tre forme che `dbConfig` ha sempre accettato funzionano ancora, ogni nome cercato come sopra.

| `dbConfig` | Esempio | Cosa fa |
|---|---|---|
| Un nome | `dbConfig: cmdb` | Interroga quel database |
| Una lista di nomi | `dbConfig: [cmdb-eu, cmdb-us]` | Esegue la query su ognuno e unisce i risultati; i doppioni non vengono rimossi |
| Un oggetto (legacy) | `dbConfig: { name: cmdb, type: mysql }` | Interroga il database o la credenziale `name`; deprecato, usa solo il nome |

Un riferimento a un [archivio di segreti](../secret-stores/#inline-without-a-credential-row), come `dbConfig: secret:vault:secret/cmdb/db`, non è
né un nome di database né un nome di credenziale, e viene ancora letto dall'archivio come prima.

---

## Quali moduli interrogano un database

L'app legge i moduli per sapere quali di essi interrogano ogni database.

La colonna **Usato da** della [pagina dei database](list.html) li conta, e la scheda **Usato da** della
[pagina di un database](database-page.html#used-by) li elenca con i loro campi. Conta anche un campo che indica invece la credenziale del
database. Rinomina un database solo dopo aver modificato i moduli che indicano il suo vecchio nome.
