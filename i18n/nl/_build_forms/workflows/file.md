---
layout: default
title: Het workflowbestand
parent: Workflows
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# Het workflowbestand
{: .no_toc }

De syntax van een workflow, de soorten knooppunten en de uitvoeringsinstellingen van elk knooppunt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Waar workflowbestanden staan

Workflowbestanden zijn YAML-bestanden in de lokale map voor workflows en in elke repository die voor workflows wordt gebruikt.

- **De lokale map** is [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), standaard `workflows` onder de
  persistente map.
- **Een repository** met **Gebruiken voor workflows?** aan wordt in zijn geheel gelezen, dus de workflowbestanden kunnen in elke map staan. De
  ontwerper slaat ze terug op in de repository, en **Push** stuurt ze naar de remote.

Elk YAML-bestand met `workflow_job_templates` wordt gelezen, tot zes mappen diep, en één bestand kan meerdere
workflows bevatten. Een formulier verwijst naar een workflow via zijn `name`, dus houd de namen uniek: delen twee workflows een naam, dan mislukt een job die
hem uitvoert, met de melding dat je er een moet hernoemen.

---

## De syntax

Een workflowbestand is geschreven in de syntax van een AWX-export, met de knooppunten onder `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

De vorm van de collectie `awx.awx` wordt ook gelezen: `workflow_nodes` direct onder de workflow, en namen geschreven als
gewone strings (`inventory: staging`) in plaats van maps (`inventory: {name: staging}`).

### De workflow

Een workflow heeft naast zijn knooppunten een paar eigen sleutels:

| Sleutel | Wat het is |
|---|---|
| `name` | De naam van de workflow, waarnaar `workflow:` in een formulier verwijst |
| `description` | Waarvoor hij dient, getoond in de ontwerper |
| `extra_vars` | Variabelen die elk knooppunt krijgt; de waarden van het formulier winnen ervan |
| `related.workflow_nodes` | De knooppunten |

### Een knooppunt

Elk knooppunt heeft een identifier, iets dat het uitvoert en zijn koppelingen:

| Sleutel | Wat het is |
|---|---|
| `identifier` | De id van het knooppunt: letters, cijfers, punten, streepjes, dubbele punten en underscores, uniek binnen de workflow |
| `unified_job_template.type` | Wat het knooppunt uitvoert: zie [soorten knooppunten](#node-types) |
| `unified_job_template.name` | Het playbook, de workflow, de goedkeuring of de repository die het uitvoert |
| `related.success_nodes` | De knooppunten die draaien wanneer dit knooppunt slaagt |
| `related.failure_nodes` | De knooppunten die draaien wanneer dit knooppunt mislukt |
| `related.always_nodes` | De knooppunten die draaien wanneer dit knooppunt klaar is, hoe dan ook |
| `all_parents_must_converge` | `true`: het knooppunt wacht tot elke koppeling ernaartoe afgaat, niet slechts één |

Koppelingen moeten vooruit wijzen: een workflow waarvan de koppelingen een lus vormen, draait niet.

---

## Soorten knooppunten

Een knooppunt voert een van vier dingen uit, genoemd zoals AWX ze noemt:

| Type | Wat het knooppunt uitvoert |
|---|---|
| `job_template` | Een van de playbooks uit de ontwerper, als eigen job op de RTE; of, met `runner:`, de template of job van die runner |
| `workflow_job_template` | Een andere workflow, als onderliggende workflowjob; workflows nesten tot vijf niveaus diep |
| `workflow_approval_template` | Een goedkeuring: de workflowjob wacht tot iemand die goedkeurt of afwijst |
| `project` | Een pull van de repository die het noemt (de project update van AWX) |

De `unified_job_template.timeout` van een goedkeuringsknooppunt is in seconden. Verstrijkt die zonder antwoord, dan mislukt het knooppunt; `0` of geen
timeout wacht op een antwoord, hoe lang dat ook duurt. Een afgewezen goedkeuring laat het knooppunt mislukken, en de workflow gaat verder langs zijn
koppelingen.

---

## Uitvoeringsinstellingen

Een `job_template`-knooppunt neemt de instellingen van een AWX-knooppunt, op het knooppunt zelf:

| Sleutel | Wat het doet |
|---|---|
| `inventory` | De inventaris waartegen het playbook draait, op naam, zoals `inventory:` in een formulier |
| `related.credentials` | De inloggegevens: elk komt onder zijn eigen naam bij het playbook aan, en de eerste *SSH*-referentie is ook de login waarmee ansible verbindt. Een vault-referentie opent alleen de vaults |
| `limit` | Draait alleen op deze hosts (`--limit`) |
| `job_tags` | Voert alleen de taken met deze tags uit (`--tags`) |
| `skip_tags` | Slaat de taken met deze tags over (`--skip-tags`) |
| `verbosity` | `0` tot `5`: het aantal `-v` |
| `diff_mode` | `true`: toont de wijzigingen (`--diff`) |
| `job_type` | `check`: een proefrun (`--check`); `run` of niets: een echte run |
| `extra_data` | Variabelen die dit knooppunt krijgt, onder de `extra_vars` van de workflow en de waarden van het formulier |

De job van het knooppunt krijgt de waarden van het formulier als extra vars. De waarden van het formulier winnen van de `extra_vars` van de workflow, die op hun beurt winnen
van de `extra_data` van het knooppunt, zoals de antwoorden op een survey dat in AWX doen.

---

## Eigen sleutels van AnsibleForms

Drie sleutels van een knooppunt zijn eigen aan AnsibleForms, en AWX negeert ze, zodat een workflow kan doen wat een multistep-formulier doet:

| Sleutel | Wat het doet |
|---|---|
| `runner` | Op een `job_template`-knooppunt: voert de template of job van die runner uit in plaats van een playbook uit de ontwerper: AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins. Een RTE-runner voert daar het playbook van het knooppunt uit. Eén workflow kan ze combineren. |
| `if_extra_var` | Het knooppunt draait alleen wanneer deze extra var `true` is, zoals `ifExtraVar` van een multistep-stap. Wordt er niet aan voldaan, dan wordt het knooppunt overgeslagen en draait wat erna komt als na een succes. Niet op een goedkeuringsknooppunt, dat altijd draait. |
| `extra_vars_key` | Het knooppunt krijgt alleen deze sleutel van de extra vars, met de gebruiker erin gekopieerd, zoals `key` van een multistep-stap |

Op een template-runner is `unified_job_template.name` de template of job die wordt uitgevoerd, en de `limit`, `job_tags`, check-modus
en diff-modus van het knooppunt worden doorgegeven zoals een formulier van het type van die runner ze zou doorgeven. Een `verbosity` boven `0` zet
`verbose` van het formulier aan, en `skip_tags` wordt niet doorgegeven. Alleen een AWX-runner (AWX, AAP of Ascender) krijgt de inventaris van het knooppunt, en de
inloggegevens als zijn AWX-credentials; Semaphore, Rundeck en Jenkins krijgen de inloggegevens als de `credentials` van een formulier.
