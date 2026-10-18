---
layout: default
title: Disclaimer
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
---

# Disclaimer
{: .no_toc }

Terms every user accepts once before using the app, recorded with who accepted which version and when
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: ask every user to accept terms of use, under **Settings > Access > Disclaimer**, with the `showSettings` role option.

From 7.3.0 the page lists every version of the disclaimer, and each version opens on a page of its own with its acceptances.
Up to 7.2, the page had three tabs instead (**General**, **Versions** and **Acceptances**); the upgrade keeps every version.

---

## In this section

| Page | What it covers |
|---|---|
| [General](disclaimer/general.html) | The list of versions, adding one, and enabling the one users accept |
| [Versions](disclaimer/versions.html) | A version's page, and changing its text as a correction or for everyone again |
| [Acceptances](disclaimer/acceptances.html) | Who accepted which version, and asking chosen users again |


---

## What users see

With a version enabled, every user who signs in gets it in a dialog before anything else, admins included:

1. They read its title and its text.
2. They tick the checkbox, then click **Accept**. **Decline**, in red, signs them out instead.

From 7.3.0 the page behind the dialog is blurred until they answer.

A user accepts each version once: they are not asked again at their next sign-in, only when a new version comes.

Until they accept, the API answers every call of their session with status `403` and the code `disclaimer_required`,
except reading and accepting the disclaimer, reading their profile and the live events the browser follows.
An [API token](profile/api-token.html) is never asked, since a script has no one to click.

