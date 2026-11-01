---
layout: default
title: Database
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Database
{: .no_toc }

I database che i moduli interrogano, ognuno con la sua credenziale
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: dai un nome ai database che i tuoi moduli interrogano, scegli la credenziale con cui si connette ognuno, e testali.

---

## In questa sezione

| Pagina | Cosa tratta |
|---|---|
| [La pagina dei database](databases/list.html) | La lista dei database, le sue colonne, e la finestra di dialogo che ne aggiunge uno |
| [La pagina di un database](databases/database-page.html) | Le schede di un database, i moduli che lo interrogano, Testa connessione ed Elimina |
| [I database nei moduli](databases/in-forms.html) | Come il `dbConfig` di un campo indica un database, e i moduli scritti prima della 7.5.0 |

---

## Come funziona

Dalla 7.5.0 un **database** è una connessione a sé, aggiunta in **Connessioni > Database**, tra **Archivi di segreti** e **Runner**.
Ha tre elementi:

| Campo | Cos'è |
|---|---|
| Nome | Il nome che il `dbConfig` di un campo indica per interrogarlo, come `cmdb` |
| Descrizione | A cosa serve |
| Credenziale | La credenziale di [Connessioni > Credenziali](credentials.html), di tipo **Database**, con cui si connette |

La credenziale conserva tutto ciò che riguarda la connessione, come prima: il tipo di database (MySQL, MSSQL, PostgreSQL, Oracle o MongoDB),
l'host e la porta, il nome del database, il TLS, e l'utente e la password, conservati cifrati o letti da un [archivio di segreti](secret-stores/).
Un database non ha né indirizzo né segreto propri, così un database e un runner scelgono la loro credenziale allo stesso modo.

Un campo interroga un database indicandolo nel `dbConfig`:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Un nome che non è un database viene cercato come credenziale di tipo database, come prima della 7.5.0, così i moduli più vecchi continuano
a funzionare senza modifiche (vedi [I database nei moduli](databases/in-forms.html)).

---

## Aggiornare alla 7.5.0

L'aggiornamento riempie **Connessioni > Database** una sola volta, così i moduli che hai continuano a funzionare senza modifiche.

Crea un database per ogni credenziale di tipo database, con il nome e la descrizione della credenziale, connesso con quella
credenziale. Un modulo il cui `dbConfig` indica la credenziale trova ora il database con lo stesso nome, che si connette con la stessa
credenziale: il risultato è lo stesso. Le credenziali mantengono tutti i loro campi.

L'aggiornamento viene eseguito una sola volta: un database eliminato in seguito non viene ricreato, e una credenziale database aggiunta
più tardi non riceve nessun database finché non ne aggiungi uno.

---

## Credenziali in uso

Una credenziale con cui si connette un database è in uso, come quella con cui accede un runner.

Non si può eliminare né rinominare finché un database la indica, e la scheda **Usato da** della sua pagina elenca i database (vedi
[Credenziali in uso](credentials.html#credentials-in-use)). Eliminare un database lascia la sua credenziale com'è.

---

## Chi gestisce i database

I database seguono le opzioni di ruolo delle credenziali che indicano.

La lista, la pagina di un database e la sua API richiedono l'opzione di ruolo `showSettings` o `showConnectionsSettings`, come le credenziali.
Solo un admin può far connettere un database con una credenziale che solo un admin può indicare, come una che legge la sua password da un
archivio di segreti (vedi [Chi può modificare una credenziale](credentials.html#who-may-change-a-credential)): i moduli che lo interrogano
si connetterebbero con quella credenziale, e **Testa connessione** invierebbe il suo segreto al suo server. Un altro utente può salvare di
nuovo un database con la credenziale che indica già.

Un database dichiarato nel [config seed](seed/) è in sola lettura nella sua pagina: modificalo invece nel file del seed.

---

## Il config seed

Un seed dichiara i suoi database in una sezione `databases:`, dopo le credenziali che indicano.

Ogni elemento ha un `name`, una `credential` di tipo database e, facoltativamente, una `description`. La credenziale può venire dalla
sezione `credentials` dello stesso seed o essere una creata nell'app:

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

Vedi l'[esempio](seed/example.html) completo e [Oggetti gestiti](seed/managed-objects.html) per come il seed possiede ciò che dichiara.

---

## L'API REST

Gli script gestiscono i database tramite l'[API REST](api/), sotto `/api/v2/database`, con le stesse opzioni di ruolo della pagina.

| Chiamata | Cosa fa |
|---|---|
| `GET /api/v2/database` | Elenca i database, ognuno con il tipo di database, il database, l'host e la porta della sua credenziale, e quanti moduli lo interrogano (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Restituisce il database con quel nome |
| `GET /api/v2/database/<id>` | Restituisce un database |
| `POST /api/v2/database` | Aggiunge un database: il suo `name`, la `credential` e, facoltativamente, la `description` |
| `PUT /api/v2/database/<id>` | Modifica un database |
| `DELETE /api/v2/database/<id>` | Elimina un database; la sua credenziale resta |
| `POST /api/v2/database/<id>/check` | Testa la sua connessione, con la sua credenziale |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Una `credential` che non esiste, o che non è di tipo database, viene rifiutata con `400`. Ogni modifica viene scritta nel registro di audit.
