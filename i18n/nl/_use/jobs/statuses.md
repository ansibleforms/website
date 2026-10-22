---
layout: default
title: Statussen en typen
parent: Jobs
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Statussen en typen
{: .no_toc }

Elke status die een job kan hebben, en de soorten jobs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jobstatussen

AnsibleForms zet de volgende statussen op een job. De lijst toont elke status als een gekleurd label:

| Status | Betekenis | Wat je kunt doen |
|---|---|---|
| `running` | De job draait, of een goedgekeurde job is hervat | De uitvoer volgen, hem afbreken |
| `approve` | De job wacht bij een [goedkeuringspunt](../forms/approval.html) voordat hij draait (of voordat een stap van een multistep draait) | Hem goedkeuren of afwijzen, als een van je rollen goedkeurder is |
| `success` | Het playbook, de sjabloon of elke stap is zonder fouten afgerond | De uitvoer bekijken, herstarten, verwijderen |
| `failed` | De job is met een fout geëindigd, of het starten zelf is mislukt | De uitvoer bekijken om te zien waarom, herstarten, verwijderen |
| `warning` | Een multistep is afgerond, maar een stap met `continue` is mislukt | De uitvoer bekijken, herstarten, verwijderen |
| `aborted` | De job is vanuit AnsibleForms afgebroken, of de AWX- / AAP-job is geannuleerd | De uitvoer bekijken, herstarten, verwijderen |
| `rejected` | Een goedkeurder heeft de job afgewezen; hij heeft nooit gedraaid | De uitvoer bekijken, herstarten, verwijderen |
| `abandoned` | AnsibleForms is gestopt met het volgen van de job (zie [Verlaten jobs](cleanup.html#abandoned-jobs)) | De beheerde hosts controleren, herstarten, verwijderen |

`running` is blauw, `success` groen met de tekst **Geslaagd**, en `failed` rood. `approve` is oranje met de tekst **Wacht op goedkeuring**,
zodat een job die op een persoon wacht zich onderscheidt van de gestopte jobs; `warning`, `aborted` en `rejected` zijn amber. `abandoned` is
grijs: niemand heeft hem gestopt, wat hem uitvoerde is weg.

---

## Jobtypen

Het jobtype volgt het `type` van het formulier dat de job startte, zoals de lijst en de pagina van de job het tonen:

| Getoond type | Wat er draait |
|---|---|
| `ansible` | Een Ansible-playbook, uitgevoerd op een RTE |
| `awx`, `aap`, `ascender` | Een jobsjabloon of workflowsjabloon op AWX, AAP of Ascender |
| `semaphore` | Een sjabloon op Semaphore UI |
| `rundeck`, `jenkins` | Een job op Rundeck of Jenkins |
| `workflow` | Een [workflow](../workflows/), waarvan de playbookknooppunten als eigen jobs eronder draaien |
| `multistep` | Verouderd, gebruik `workflow`: een reeks stappen, elk vastgelegd als eigen job onder de hoofdjob |

Een sjabloonjob wordt opgeslagen als `awx`-job (ook in de REST API) en getoond met het soort runner waarop hij draaide, hoe het
formulier hem ook noemde: een formulier van type `awx` dat op een AAP-runner draait, toont `aap`.

Zie [Ansible-formulieren](../forms/ansible.html), [AWX-formulieren](../forms/awx.html), [Workflowformulieren](../forms/workflow.html) en
[Multistep-formulieren](../forms/multistep.html) voor de kant van het formulier.
