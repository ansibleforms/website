---
layout: default
title: Databases in forms
parent: Databases
nav_order: 3
---

# Databases in forms
{: .no_toc }

How a field's dbConfig names a database, and older forms keep working
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Naming a database

A field with a `query` runs it on the database its `dbConfig` names.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

From 7.5.0 the name is looked up in this order:

| Order | The name is | The query connects with |
|---|---|---|
| 1 | A database of **Connections > Databases** | The credential that database names |
| 2 | Else a credential of type **Database** of **Connections > Credentials** | That credential, as before 7.5.0 |

The database type (MySQL, MSSQL, PostgreSQL, Oracle or MongoDB) comes from the credential, so the form never gives it. A credential
without one is read as MySQL.

---

## Forms written before 7.5.0

Every form that named a credential in `dbConfig` keeps working, without a change.

The [upgrade to 7.5.0](../databases.html#upgrading-to-750) makes a database for each database credential, with the same name and
connecting with that credential, so the name a form gives now finds the database first, which leads to the same login. A credential
of type database with no database of its name is still found by step 2.

A database and a credential can share a name, as the upgrade does it. The database wins: point it at another credential and every
form that gives that name follows, which is how a form moves to another server without being edited.

---

## The forms of dbConfig

The three forms `dbConfig` has always taken still work, each name looked up as above.

| `dbConfig` | Example | What it does |
|---|---|---|
| A name | `dbConfig: cmdb` | Queries that database |
| A list of names | `dbConfig: [cmdb-eu, cmdb-us]` | Runs the query on each and joins the results; doubles are not removed |
| An object (legacy) | `dbConfig: { name: cmdb, type: mysql }` | Queries the database or credential `name`; deprecated, use the name alone |

A [secret store](../secret-stores/#inline-without-a-credential-row) reference, such as `dbConfig: secret:vault:secret/cmdb/db`, is no
database and no credential name, and is still read from the store as before.

---

## Which forms query a database

The app reads the forms to tell which of them query each database.

The **Used by** column of [the databases page](list.html) counts them, and the **Used by** tab of
[a database's page](database-page.html#used-by) lists them with their fields. A field that names the database's credential instead
counts too. Rename a database only after changing the forms that give its old name.
