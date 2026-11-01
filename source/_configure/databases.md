---
layout: default
title: Databases
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
---

# Databases
{: .no_toc }

The databases forms query, each connecting with a database credential
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: name the databases your forms query, pick the credential each connects with, and test them.

---

## In this section

| Page | What it covers |
|---|---|
| [The databases page](databases/list.html) | The list of databases, its columns, and the dialog that adds one |
| [A database's page](databases/database-page.html) | A database's tabs, the forms that query it, Test connection and Delete |
| [Databases in forms](databases/in-forms.html) | How a field's `dbConfig` names a database, and the forms written before 7.5.0 |

---

## How it works

From 7.5.0 a **database** is a connection of its own, added under **Connections > Databases**, between **Secret stores** and **Runners**.
It has three things:

| Field | What it is |
|---|---|
| Name | The name a field's `dbConfig` gives to query it, such as `cmdb` |
| Description | What it is for |
| Credential | The credential of [Connections > Credentials](credentials.html), of type **Database**, it connects with |

The credential keeps everything about the connection, as before: the database type (MySQL, MSSQL, PostgreSQL, Oracle or MongoDB),
the host and port, the database name, TLS, and the user and password, kept encrypted or read from a [secret store](secret-stores/).
A database holds no address and no secret of its own, so a database and a runner pick their credential the same way.

A field queries a database by naming it in `dbConfig`:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

A name that is no database is looked up as a credential of type database, as before 7.5.0, so older forms keep working
unchanged (see [Databases in forms](databases/in-forms.html)).

---

## Upgrading to 7.5.0

The upgrade fills **Connections > Databases** once, so the forms you have keep working without a change.

It makes one database for each credential of type database, with the credential's name and description, connecting with that
credential. A form whose `dbConfig` names the credential now finds the database of the same name, which connects with the same
credential: the result is the same. Credentials keep every field they have.

The upgrade runs once only: a database deleted afterwards is not made again, and a database credential added later gets no database
until you add one.

---

## Credentials in use

A credential that a database connects with is in use, as one a runner signs in with.

It cannot be deleted or renamed while a database names it, and the **Used by** tab of its page lists the databases (see
[Credentials in use](credentials.html#credentials-in-use)). Deleting a database leaves its credential as it is.

---

## Who manages databases

The databases follow the role options of the credentials they name.

The list, a database's page and its API need the `showSettings` or the `showConnectionsSettings` role option, as the credentials do.
Only an admin can make a database connect with a credential that only an admin may name, such as one that reads its password from a
secret store (see [Who may change a credential](credentials.html#who-may-change-a-credential)): the forms that query it would connect
with that credential, and **Test connection** would send its secret to its server. Another user may save a database again with the
credential it already names.

A database declared in the [config seed](seed/) is read only on its page: change it in the seed file instead.

---

## The config seed

A seed declares its databases in a `databases:` section, after the credentials they name.

Each item has a `name`, a `credential` of type database, and optionally a `description`. The credential can come from the
`credentials` section of the same seed or be one made in the app:

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

See the full [example](seed/example.html) and [Managed objects](seed/managed-objects.html) for how the seed owns what it declares.

---

## The REST API

Scripts manage the databases through the [REST API](api/), under `/api/v2/database`, with the same role options as the page.

| Call | What it does |
|---|---|
| `GET /api/v2/database` | Lists the databases, each with its credential's database type, database, host and port, and how many forms query it (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Gets the database of that name |
| `GET /api/v2/database/<id>` | Gets one database |
| `POST /api/v2/database` | Adds a database: its `name`, `credential` and optionally `description` |
| `PUT /api/v2/database/<id>` | Changes a database |
| `DELETE /api/v2/database/<id>` | Deletes a database; its credential stays |
| `POST /api/v2/database/<id>/check` | Tests its connection, with its credential |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

A `credential` that does not exist, or is not of type database, is refused with `400`. Every change is written to the audit log.
