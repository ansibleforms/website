---
layout: default
title: Disclaimer
nav_order: 3.4
---

# Disclaimer
{: .no_toc }

Terms every user accepts once before using the app, recorded with who accepted which version and when
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: ask every user to accept terms of use, under **Settings > Access > Disclaimer**, with the `showSettings` role option.

The page has three tabs: **General** sets the disclaimer, **Versions** and **Acceptances** show its history.

---

## What users see

With the disclaimer switched on, every user who signs in gets it in a dialog before anything else, admins included:

1. They read its title and its text.
2. They tick the checkbox, then click **Accept**. **Decline and sign out** signs them out instead.

A user accepts each version once: they are not asked again at their next sign-in, only when a new version comes.

Until they accept, the API answers every call of their session with status `403` and the code `disclaimer_required`,
except reading and accepting the disclaimer, reading their profile and the live events the browser follows.
An [API token](profile/api-token.html) is never asked, since a script has no one to click.

---

## General

**General** switches the disclaimer on and holds its text:

| Field | Meaning |
|---|---|
| **Require a disclaimer** | Switched on, every user accepts it once after signing in |
| **Title** | The title of the dialog, such as Terms of use |
| **Text** | What users agree to, at most 20000 characters. Plain text: line breaks are kept. |
| **Checkbox label** | What users tick before they can accept, at first "I have read and agree to these terms." |

A disclaimer needs all three before it can be switched on. **Preview** shows the dialog as users will see it.

The help under the switch names the current version. Switching the disclaimer off keeps its versions and acceptances:
switched on again, the users who accepted the current version are not asked again.

---

## Versions

The first save of a text makes version 1. Later, saving a changed title, text or checkbox label asks **Ask everyone again?**:

| Answer | What happens |
|---|---|
| **Ask everyone again** | The text becomes a new version, and every user accepts it again at their next request |
| **Keep as a correction** | The current version is rewritten, such as for a typo; no one is asked again |

The **Versions** tab lists every version, the latest first, with its **Version**, **Title**, **Text**, **Checkbox**,
who published it (**Published by**), when (**Published**) and how many users accepted it (**Acceptances**).

---

## Acceptances

Each acceptance is recorded for the user and the version they accepted, and the **Acceptances** tab lists them, the latest first:

| Column | Meaning |
|---|---|
| **User** | The username |
| **Sign-in** | How they signed in: Local, LDAP, Entra ID or OpenID Connect |
| **Version** | The version they accepted |
| **Accepted** | When |
| **IP address** | Where from |
| **Browser** | Their browser |

The [audit log](production/logs.html#audit-trail) also records each acceptance, each decline and each change of the disclaimer.
