---
layout: default
title: Statussen en typen
parent: Jobs
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | Het playbook is afgerond maar [vraagt aandacht](#a-job-that-needs-attention): iemand moet het opvolgen. Of een multistep is afgerond, maar een stap met `continue` is mislukt | Op de jobpagina lezen waarom, het opvolgen, herstarten, verwijderen |
| `aborted` | De job is vanuit AnsibleForms afgebroken, of de AWX- / AAP-job is geannuleerd | De uitvoer bekijken, herstarten, verwijderen |
| `rejected` | Een goedkeurder heeft de job afgewezen; hij heeft nooit gedraaid | De uitvoer bekijken, herstarten, verwijderen |
| `abandoned` | AnsibleForms is gestopt met het volgen van de job (zie [Verlaten jobs](cleanup.html#abandoned-jobs)) | De beheerde hosts controleren, herstarten, verwijderen |

`running` is blauw, `success` groen met de tekst **Geslaagd**, en `failed` rood. `approve` is oranje met de tekst **Wacht op goedkeuring**,
zodat een job die op een persoon wacht zich onderscheidt van de gestopte jobs; `warning` heeft de tekst **Vraagt aandacht**, en het is net als `aborted` en `rejected` amber. `abandoned` is
grijs: niemand heeft hem gestopt, wat hem uitvoerde is weg.

---

## Een job die aandacht vraagt

Vanaf 7.8.0 kan een playbook dat zoals bedoeld is afgerond, maar werk overlaat voor een operator (een goedkeuring elders, een
handmatige stap, een gedeeltelijke toepassing), zijn job laten eindigen als **Vraagt aandacht** (`warning`) met een bericht, in plaats
van een `failed` die op kapotte automatisering lijkt of een `success` die verbergt wat er nog te doen is. Het playbook geeft dat op een
van twee manieren aan:

* een **statusbestand** naast het playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (of `.yaml`), op een RTE. De RTE
  leest het zodra het playbook eindigt en verwijdert het daarna
* **`set_stats`** met de sleutel `af_job_status`, op een RTE en op AWX, AAP of Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms geeft `__jobid__` mee in de extravars, zodat het playbook het pad van het bestand kan opbouwen. Het bestand wint als
een playbook beide doet.

* Alleen een playbook dat **geslaagd** is kan eindigen als Vraagt aandacht: een mislukte job blijft `failed` en een afgebroken
  job `aborted`, wat het bestand ook zegt
* Een ongeldig bestand (geen bericht, een andere status, kapotte YAML) wordt genegeerd: de job blijft geslaagd, en de uitvoer
  zegt waarom in een `[WARNING]`-regel
* Het bericht verschijnt op de jobpagina in een amberkleurig vak, met het detail eronder ingeklapt als YAML, als tooltip van de
  status in de lijst, en in de laatste uitvoerregel van de job. **Vraagt aandacht** onder **Verleden** in het jobsmenu toont deze jobs
* [Meldingen](../forms/notifications.html) met `onStatus: [warning]` worden voor deze jobs verstuurd; de mail en de kanalen bevatten
  het bericht, een webhook als [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* In een multistep slaagt een stap die aandacht vraagt en draait de volgende stap; de multistep vraagt dan ook aandacht. In een
  [workflow](../workflows/) telt de job als geslaagd voor het volgende knooppunt

Jobs van Semaphore, Rundeck en Jenkins kunnen niet eindigen als Vraagt aandacht.

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
