---
layout: default
title: Ontwerper en push
parent: Git-repositories
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Ontwerper en push
{: .no_toc }

Formulieren bewerken in de ontwerper en ze naar de repository pushen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Bewerken en pushen vanuit de ontwerper

Met een repository die voor formulieren wordt gebruikt, bewerkt de ontwerper de bestanden in haar working tree en pusht hij ze terug naar de remote.

| Knop | Wat ze doet |
|---|---|
| **Opslaan (lokaal)** | Schrijft de formulieren en `config.yaml` naar de working trees, zonder te committen |
| **Opslaan (repository)** | Commit en pusht de opgeslagen wijzigingen; beschikbaar zodra er wijzigingen zijn die nog niet zijn gepusht |
| **Laden (repository)** | Pullt de formulierenrepositories en laadt de ontwerper opnieuw, na een bevestiging als er niet-opgeslagen wijzigingen zijn |

Formulieren blijven in hun repository; nieuwe wachten, al bruikbaar, in [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) tot je pusht.
Een formulier dat in een submap is opgeslagen, houdt zijn relatieve pad: `team/deploy.yaml` wordt gepusht naar `team/deploy.yaml` onder de formulierenmap
van de repository. Een nieuw formulier waarvan het pad daar al bestaat, wordt niet overschreven; het blijft in staging, dus geef het een andere naam.
Met meerdere formulierenrepositories vragen **Opslaan (repository)** en **Laden (repository)** welke, met als standaard die met `config.yaml`.

Een push zet alle wijzigingen klaar, commit ze als `AnsibleForms` met het bericht `Forms sync by <user>`, en doet daarna een fetch, een rebase op
de remote en een push, met tot vijf nieuwe pogingen. Een rebaseconflict wordt afgebroken en de bestanden met een conflict worden opgesomd;
los ze op in de remote, of gebruik **Resetten** op de pagina Repositories. **Push** op de pagina Repositories doet hetzelfde.

Wordt één enkele formulierenrepository leeg gekloond, dan kopieert AnsibleForms de lokale `config.yaml` en formulieren naar haar working
tree, zodat een push (**Opslaan (repository)**, of **Push** op de pagina Repositories) ze publiceert. Meer over de ontwerper staat in [Ontwerper en git](../gui/designer-and-git.html).
