---
layout: default
title: Acceptances
parent: Disclaimer
nav_order: 3
---

# Acceptances
{: .no_toc }

Who accepted which version, and asking chosen users again
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Who accepted

Each acceptance is recorded for the user and the version, and the **Acceptances** tab of a version's page lists them, latest first:

| Column | Meaning |
|---|---|
| **User** | The username |
| **Sign-in** | How they signed in: Local, LDAP, Entra ID or OpenID Connect |
| **Version** | The version they accepted |
| **Accepted** | When |
| **IP address** | Where from |
| **Browser** | Their browser |

---

## Asking users again

From 7.3.0 chosen users can be asked to accept a version again, without asking everyone.

**Ask again** in a row menu, or on the rows ticked in the list, clears those acceptances after a confirmation: those users accept the
disclaimer again at their next sign-in. The list can also be exported, as every table.

The [audit log](../production/logs.html#audit-trail) also records each acceptance, each decline and each change of the disclaimer.
