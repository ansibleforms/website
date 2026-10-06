---
layout: default
title: Getting help
nav_order: 2.5
---

# Getting help
{: .no_toc }

Where to ask a question, report a bug or a security problem, and suggest an improvement
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Before you ask

Most answers are already written down; a quick look often saves a round trip:

1. Search this site with the search box at the top of every page.
2. Look up the exact error message in [Troubleshooting](troubleshooting.html), and skim the [FAQ](faq.html).
3. Check the server log (**Settings**, then **Server log**) and the **Status** page, which report most configuration problems.
4. Check the [Changelog](changelog.html): the problem may already be fixed in a newer release.

---

## Where to go

Each kind of request has its own place, all on GitHub:

| You want to | Go to |
|---|---|
| Ask a question or share an idea | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Report a bug | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Suggest a feature | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Report a security problem | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), privately |
| Fix or improve this documentation | **Edit this page on GitHub** at the bottom of any page, or an [issue on the website](https://github.com/ansibleforms/website/issues) |

---

## Reporting a bug

A report that can be reproduced gets fixed fastest. The bug report template asks for the following:

* **Version** : shown under **About** in the help (**?**) menu of the top bar
* **Deployment** : Docker, Docker Compose, Kubernetes or from source
* **Steps to reproduce** : what you did, what you expected, and what happened instead
* **Evidence** : the relevant lines of the server log, and a screenshot when the problem is visible

For a problem with a form, include a minimal form definition that shows it. Remove passwords, tokens, host names and any
other private data from logs and forms before you post them: issues and discussions are public.

---

## Reporting a security problem

**Never open a public issue for it:** use [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), which only the maintainers see.

The [security policy](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) lists the supported versions and
what happens after you report.
