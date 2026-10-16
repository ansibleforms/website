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

The page has three tabs: **General** sets the disclaimer, **Versions** and **Acceptances** show its history.

---

## In this section

| Page | What it covers |
|---|---|
| [General](disclaimer/general.html) | The switch, and the title, text and checkbox users accept |
| [Versions](disclaimer/versions.html) | A new version when the text changes, and who is asked again |
| [Acceptances](disclaimer/acceptances.html) | Who accepted which version, and asking users again |


---

## What users see

With the disclaimer switched on, every user who signs in gets it in a dialog before anything else, admins included:

1. They read its title and its text.
2. They tick the checkbox, then click **Accept**. **Decline and sign out** signs them out instead.

A user accepts each version once: they are not asked again at their next sign-in, only when a new version comes.

Until they accept, the API answers every call of their session with status `403` and the code `disclaimer_required`,
except reading and accepting the disclaimer, reading their profile and the live events the browser follows.
An [API token](profile/api-token.html) is never asked, since a script has no one to click.

