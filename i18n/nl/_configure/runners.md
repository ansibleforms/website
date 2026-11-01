---
layout: default
title: Runners
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# Runners
{: .no_toc }

Waar jobs draaien: containers met een runtime-omgeving voor playbooks, en AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins voor templates
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: voeg de runners toe waarop je jobs draaien, kies de standaard van elk type, keur de RTE's goed die vragen om lid te worden, en test ze.

---

## In deze sectie

| Pagina | Wat er aan bod komt |
|---|---|
| [De pagina Runners](runners/list.html) | De lijst met runners, er een toevoegen, er een in- of uitschakelen, en de standaard van elk type |
| [Typen runners](runners/types.html) | De producten die een runner kan zijn, hun adres en aanmelding |
| [Registratie](runners/registration.html) | Hoe een RTE vraagt om lid te worden en wordt goedgekeurd, jointokens voor onbeheerde installaties, en databasemodus |
| [De pagina van een runner](runners/runner-page.html) | De tabbladen van een runner, de modus en verbinding van een RTE, en Verbinding testen |
| [Wie runners beheert](runners/permissions.html) | Wie runners mag toevoegen, wijzigen en testen |


---

## Hoe het werkt

Sinds versie 7 draait de app zelf niets: elke job draait op een **runner**, toegevoegd onder **Verbindingen > Runners**.
Het type van een formulier bepaalt welk type runner het nodig heeft:

| Formuliertype | Draait op een runner van het type | Wat er draait |
|---|---|---|
| `ansible` | RTE | Een playbook, in een container met een runtime-omgeving |
| `awx`, `aap`, `ascender` | AWX (de varianten AWX, AAP en Ascender) | Een job- of workflowtemplate |
| `semaphore` | Semaphore | Een template van Semaphore UI |
| `rundeck` | Rundeck | Een Rundeck-job |
| `jenkins` | Jenkins | Een Jenkins-job |

Een formulier van het type `workflow` of `subform` heeft geen eigen runner: elke node van een [workflow](workflows/) kiest zijn eigen runner. Een node
met een `runner:` draait op die runner (een RTE, of een template of job op AWX, Semaphore, Rundeck of Jenkins), elke andere op
de standaard-RTE, zodat de nodes van één job op verschillende runners kunnen draaien. Het formulier `multistep`, verouderd sinds 7 en
vervangen door workflows, werkt op dezelfde manier: elk van zijn stappen draait op de runner die het eigen type nodig heeft.

Een formulier kiest zijn runner op een van twee manieren:

- **Op naam**: `runner: <name>` op het formulier, op een workflownode, of op een stap van een verouderd multistep-formulier (ook in de
  formulierinstellingen van de designer). De runner moet van het type zijn dat het formulier nodig heeft, anders mislukt de job. Het oudere `awx: <name>`
  werkt nog, logt een waarschuwing over veroudering, en verdwijnt in 8.
- **Als standaard**: een formulier dat geen runner noemt, draait op de standaardrunner van zijn type. Zonder standaardrunner mislukt de job
  met een bericht dat zegt welk type runner je moet toevoegen.

Een runner die onder **Verbindingen > Runners** is uitgeschakeld, krijgt geen job, niet op naam en niet als standaard: de job mislukt en zegt dat je hem moet inschakelen
of een andere runner moet noemen (zie [Standaard en Ingeschakeld](runners/list.html#default-and-enabled)).

