---
layout: default
title: The databases page
parent: Databases
nav_order: 1
---

# The databases page
{: .no_toc }

The list of databases, its columns, and the dialog that adds one
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The list

The page under **Connections > Databases** lists every database with these columns:

| Column | Meaning |
|---|---|
| Name | How forms refer to it, with `dbConfig: <name>` |
| Description | What it is for |
| Database type | Its credential's: MySQL, MSSQL, PostgreSQL, Oracle or MongoDB |
| Database | The database its credential opens |

**Columns** adds two more, off by default: **Host**, where its credential connects, with its port when it has one, and **Used by**,
how many forms query it, by its name or by its credential's (see [Used by](database-page.html#used-by)).

The database type, the database and the host are read from the credential: change them on the credential, under
**Connections > Credentials**. No column shows a user or a password.

---

## Adding a database

**Add database** opens a dialog in two steps, as a runner's does.

| Step | Fields |
|---|---|
| Database | **Name** and **Description**. The name is required, and unique |
| Credentials | **Credential**, required: a credential of type **Database**. Only those are offered |

On the **Credentials** step, **Add credential** opens the dialog of a new credential of type **Database** (see
[The credentials page](../credentials/list.html)) and chooses it once saved, so a database and its login can be added in one go.

---

## The row menu

A row opens the database's own page, and its menu offers:

| Action | What it does |
|---|---|
| Edit | Opens its page |
| Test connection | Connects with its credential and runs the least query of its database type, and says whether it worked |
| Delete | Deletes the database, after a confirmation. Its credential stays |

Deleting a database that forms still name makes their queries fail, unless a credential of the same name is left for them to fall back to
(see [Databases in forms](in-forms.html)). Check its **Used by** tab first.
