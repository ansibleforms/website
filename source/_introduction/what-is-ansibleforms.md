---
layout: default
title: What is AnsibleForms
nav_order: 1
---

# What is AnsibleForms
{: .no_toc }

Self-service forms in front of Ansible and AWX, and when you need them
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## What it does

AnsibleForms puts a web form in front of a playbook or an AWX, AAP or Ascender template, so people can run automation without the command line.

A form collects the input, checks it, shapes it into extravars and launches the job. The data in a form can come from databases,
REST APIs, files and other fields, and every launch is recorded in the job history with its output.

---

## Typical uses

Teams use AnsibleForms to hand routine automation to the people who request it:

* **Self-service requests** : a virtual machine, a storage volume, a share or a user account, filled in by the requester
* **Guarded operations** : actions with approval points, so a second person signs off before the job runs
* **Data-driven choices** : dropdowns filled from a CMDB, a database or a REST API, cascaded from one field to the next
* **Recurring jobs** : forms run later or on a cron schedule, with the same validated input every time
* **Automation for tools and agents** : the REST API, the MCP server and the chat assistant launch the same forms

---

## AnsibleForms or AWX surveys?

AWX, AAP and Ascender have surveys of their own. Which one fits depends on what the people who launch the jobs need.

A **survey** is enough when:

* the questions are fixed: text, numbers, passwords and choices from a static list
* the users already work in AWX, AAP or Ascender, and its permissions suit them
* you do not want to run and maintain another application and database

**AnsibleForms** helps when:

* the choices come from somewhere else: a database, a REST API, a file, or another field (cascaded dropdowns)
* the input needs validation, structure (lists, nested objects) or computed values before it reaches the playbook
* the jobs need approval points, scheduling, or several playbooks and templates run as steps from one form
* the users should not see AWX at all, or you also run playbooks without AWX

AnsibleForms launches AWX, AAP and Ascender templates, so the two work together: the forms collect and shape the input, and
AWX keeps running the jobs.

---

## Where to go next

The rest of this section explains the moving parts before you install:

| Page | What it covers |
|---|---|
| [How it works](how-it-works.html) | The architecture, the steps of a launch, and where data is kept |
| [Interface tour](gui/) | Screenshots of every screen, from signing in to the administration pages |
| [Concepts](concepts.html) | The terms used across this documentation |
| [Prerequisites](prerequisites.html) | What you need before you install |
