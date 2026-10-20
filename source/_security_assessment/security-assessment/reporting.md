---
layout: default
title: Reporting a vulnerability
nav_order: 4
---

# Reporting a vulnerability
{: .no_toc }

How to report a security problem privately, and what happens next
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Report it privately

AnsibleForms holds credentials and vault tokens, so never report a security problem in a public issue:

1. Open **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: a private advisory only the maintainers see.
2. If that page is not available to you, open a normal issue that says only that you have a security report and asks
   for a private channel: no details, no reproducer, no version numbers. A maintainer opens a private advisory and
   invites you to it.

The full policy is the repository's [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md).

---

## What to include

The more of this a report gives, the faster it is fixed:

* What an attacker gains: another user's data, a playbook they may not run, the host, or admin rights.
* The version, and how it is deployed: Docker, Kubernetes, or installed natively.
* A reproducer, or the request that triggers it.
* Whether it needs a signed-in user, and with which [role options](../config/roles.html).

---

## What happens next

A report goes through the same private advisory from the first message to the publication:

| Step | What you get |
|---|---|
| Acknowledgement | Confirmation that the report arrived, and whether it reproduces |
| Accepted | A fix in the next release of every [supported version](development.html#supported-versions), and a published advisory that credits you, unless you would rather not be named |
| Declined | The reasoning, usually that the behaviour needs a permission the reporter already had |

Once the fix is released, the advisory is published and appears in [Security advisories](advisories.html).

---

## Scope

The policy draws the line where the role model draws it:

| In scope | Out of scope |
|---|---|
| Anything a signed-in user can reach beyond what their role grants | Findings that need the admin account to be compromised already: an admin running any playbook is the product |
| Anything reachable without signing in | Scanner reports with no demonstrated impact |
| Stored credentials becoming readable, or written to a log | |
| Injection into the shell, the database or the browser | |
