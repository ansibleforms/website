---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflows
{: .no_toc }

Koppel playbooks, goedkeuringen en andere workflows aan elkaar, zoals AWX dat doet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor formulierauteurs: wat een workflow is, hoe de knooppunten draaien en waar je verder kunt lezen.

Een workflow is een graaf van knooppunten. Elk knooppunt voert iets uit: een van de playbooks uit de ontwerper, een andere workflow, een goedkeuring
of een pull van een repository. Koppelingen tussen de knooppunten bepalen wat daarna draait, bij succes, bij fout of altijd. Een formulier van
[type `workflow`](../forms/workflow.html) start de workflow, en de jobspagina tekent hem live terwijl hij draait.

Workflows volgen de syntax en de regels van AWX, dus een workflow die je uit AWX exporteert, leest in AnsibleForms precies hetzelfde. Ze draaien op
de RTE, zonder AWX: een playbookknooppunt is een eigen job, met de inventaris, inloggegevens, limit en tags van dat knooppunt.

---

## Hoe een workflow draait

De knooppunten draaien volgens de regels van AWX, en takken die niet van elkaar afhangen draaien naast elkaar.

- **Een knooppunt zonder ouder start meteen**, zodra de workflow start.
- **Een koppeling gaat af wanneer haar knooppunt klaar is**: een *bij succes*-koppeling na een succes, een *bij fout*-koppeling na een fout,
  een *altijd*-koppeling na allebei. Een geannuleerd knooppunt laat geen enkele koppeling afgaan.
- **Een knooppunt start zodra één koppeling ernaartoe afgaat.** Staat **Alle ouders moeten samenkomen** aan, dan wacht het tot elke koppeling
  ernaartoe is afgegaan.
- **Een knooppunt dat niet meer kan starten, krijgt de markering *draait niet***, net als de knooppunten die alleen door dat knooppunt gestart konden worden.
- **De workflow mislukt wanneer een knooppunt mislukte en niets dat opvangt**: dat knooppunt heeft geen *bij fout*- en geen *altijd*-koppeling.
  Een fout die door een koppeling wordt opgevangen, laat de workflow niet mislukken.

Een knooppunt met een voorwaarde (`if_extra_var`) waaraan niet wordt voldaan, wordt overgeslagen. Wat erna komt draait als na een succes. Een
goedkeuringsknooppunt neemt geen voorwaarde: het wacht altijd op een antwoord.

---

## Gegevens doorgeven tussen knooppunten

Wat het playbook van een knooppunt met `set_stats` verzamelt, komt bij de knooppunten erna aan als extra vars, zoals AWX de artifacts van een
job doorgeeft. Een knooppunt krijgt de gegevens van elke ouder waarvan de koppeling ernaartoe afging, samengevoegd in de volgorde waarin de ouders
staan, en geeft door wat het kreeg plus de gegevens van zijn eigen job, waarbij die van hemzelf winnen als beide dezelfde sleutel zetten.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Een knooppunt erna leest dan {% raw %}`{{ version }}` en `{{ build_id }}`{% endraw %} zoals elke andere extra var.

De extra vars van een knooppunt komen van vier plekken. Een daarvan, `extra_data`, zijn de eigen variabelen van het knooppunt: de naam die AWX ervoor gebruikt,
ingesteld op het knooppunt in het [workflowbestand](file.html#run-settings). Zetten twee bronnen dezelfde sleutel, dan geldt de voorrangsvolgorde
van AWX, laagste eerst:

| Bron | Wint van |
|---|---|
| de eigen variabelen van het knooppunt (`extra_data`) | niets |
| de gegevens die met `set_stats` zijn doorgegeven | de `extra_data` van het knooppunt |
| de `extra_vars` van de workflow | de doorgegeven gegevens |
| de waarden van het formulier | alles |

- Alleen de gegevens voor het hele playbook worden doorgegeven: `set_stats` met `per_host: false`, de standaard.
- Een goedkeuringsknooppunt, een overgeslagen knooppunt en een projectknooppunt geven door wat bij hen binnenkwam.
- De uitvoer van een knooppunt eindigt met de sleutels die het doorgaf, alleen op naam, omdat de waarden geheim kunnen zijn.
- De job van het knooppunt bewaart zijn gegevens als artifacts (**Toon artifacts** op zijn pagina), en de workflowjob bewaart de gegevens van al zijn
  knooppunten, zodat een geneste workflow ze ook doorgeeft aan de knooppunten erna.
- Een knooppunt dat op een AWX-runner draait, geeft de artifacts van zijn AWX-job op dezelfde manier door.
---

## In deze sectie

De volgende pagina's beschrijven workflows in detail:

| Pagina | Wat er aan bod komt |
|---|---|
| [Het workflowbestand](file.html) | De syntax van het bestand, de soorten knooppunten en de uitvoeringsinstellingen van elk knooppunt |
| [Bewerken in de ontwerper](designer.html) | De sectie Workflows van de ontwerper: de graaf, de dialogen voor knooppunten en koppelingen en de proefrun |
| [Een workflow uitvoeren](running.html) | Het formulier dat hem start, de jobpagina, de uitvoer van knooppunten, goedkeuringen en afbreken |
