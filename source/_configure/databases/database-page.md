---
layout: default
title: "A database's page"
parent: Databases
nav_order: 2
---

# A database's page
{: .no_toc }

A database's tabs, the forms that query it, Test connection and Delete
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tabs

A database's page shows the steps of its dialog as tabs, plus the forms that query it:

| Tab | What it holds |
|---|---|
| Details | The **Name**, the one a field's `dbConfig` gives, and the **Description** |
| Credentials | The **Credential** it connects with, a credential of Connections > Credentials of type **Database**, which holds its database type, host, port, database, TLS and login |
| Used by | The forms that query it, with the count on the tab, see [Used by](#used-by) |

Each tab has its own address, such as `/settings/databases/<id>/used-by`, so a link or a bookmark opens it. The search of the title
line narrows every tab at once.

On the **Credentials** tab, **Add credential** makes a new credential of type **Database** and chooses it. A password is never shown
again once saved: change it on the credential.

---

## Used by

The **Used by** tab lists the forms whose fields query the database, as the app reads them from the forms.

| Column | What it shows |
|---|---|
| Form | The form, a row opens it |
| Description | The form's description |
| Field | The fields of that form whose `dbConfig` names the database |

A field counts when its `dbConfig` names the database, or names its credential, as a form written before 7.5.0 does. Both
connect with the same credential, so both are listed. When there is none, the tab says **No form queries this database.**

---

## Test connection and Delete

The buttons top right act on the database as it is saved.

**Test connection** connects with its credential and runs the least query of its database type, then says so in a message,
**&lt;name&gt; connection ok**, or why it failed. It is the same test as the **Test connection** of the credential itself.

**Delete** asks first, then deletes the database and goes back to the list. Its credential stays under **Connections > Credentials**.
Next to them, **Save** saves the Details and Credentials tabs.
