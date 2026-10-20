---
layout: default
title: Overview
nav_order: 1
permalink: /security-assessment/
---

# Security assessment
{: .no_toc }

For security reviews: measures, development and advisories
{: .fs-6 .fw-300 }

---

## In short

AnsibleForms runs playbooks and holds their credentials, so it is part of your trust chain:

* It is **self-hosted**: it runs on your infrastructure, keeps its data in your database, and sends nothing to its makers.
* It is **open source** (GPL-3.0): the code, its pipelines and every advisory are public.
* Every stored secret is **encrypted**, every change **audited**, and **roles** checked on every request.
* Vulnerabilities are **reported privately**, fixed in every supported release, and **published**.

---

## In this section

The pages answer the questions of a security review, from the design to the CVE list:

| Page | What it covers |
|---|---|
| [Security measures](measures.html) | Sign-in, permissions, stored secrets, the audit trail, the browser, the server, connections and containers |
| [Secure development](development.html) | How a change is reviewed and tested, code and dependency analysis, how images are built, supported versions |
| [Reporting a vulnerability](reporting.html) | How to report a problem privately, and what happens next |
| [Security advisories](advisories.html) | Every published vulnerability, with its CVE, severity and fixed version |
| [Assessment FAQ](faq.html) | Short answers to the questions security questionnaires ask most |

To secure an instance rather than assess it, see [Security](../security/) in the administrator's guide.
