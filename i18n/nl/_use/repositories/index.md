---
layout: default
title: Git-repositories
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Git-repositories
{: .no_toc }

Bewaar formulieren, variabelenbestanden, configuratie en playbooks in git
{: .fs-6 .fw-300 }

---

Voor beheerders die formulieren, configuratie en playbooks in git bewaren: wat een repository kan bevatten en welke bron wint.

---

## Waarvoor een repository dient

Een repository is een git-remote die AnsibleForms kloont en bijwerkt, en elke repository heeft schakelaars die zeggen wat ze bevat:

| Schakelaar | Wat AnsibleForms eruit leest | Map in de repository |
|---|---|---|
| **Gebruiken voor configuratie?** | `config.yaml` met de categorieën, rollen en constanten | de root |
| **Gebruiken voor formulieren?** | De formulierbestanden, die de ontwerper er ook in terug opslaat, en hun variabelenbestanden | `forms`, of de root; variabelenbestanden in `vars` |
| **Gebruiken voor playbooks?** | De Ansible-playbooks die jobs uitvoeren | `playbooks`, of de root |
| **Gebruiken voor workflows?** | De [workflow](../workflows/)bestanden, die de ontwerper er ook in terug opslaat | elke map |
| **Gebruiken voor inventarissen?** | Eén inventaris, genoemd naar de repository, waarnaar een formulier verwijst met `inventory:` | de root: `inventory.yaml`, `group_vars`, `host_vars` |

Zonder de submap wordt de root van de repository gebruikt. Eén repository kan alles bevatten; verdeel je het, dan mogen alleen **Gebruiken voor
formulieren**, **Gebruiken voor workflows** en **Gebruiken voor inventarissen** op meerdere repositories aanstaan: de andere schakelaars nemen de eerste repository
en loggen een waarschuwing.

Elke repository wordt gekloond in een submap met haar naam, onder [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Eén repository voor alles

Eén repository kan formulieren, variabelenbestanden, configuratie en playbooks bevatten, met de schakelaars aan en één submap per soort.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Eén repository per doel

Met afzonderlijke repositories kunnen teams hun eigen deel beheren, met elk één schakelaar en de bestanden direct in de root.

| Repository | Schakelaar | Inhoud in de root |
|---|---|---|
| `af-config` | **Gebruiken voor configuratie?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Gebruiken voor formulieren?** | De formulierbestanden van elk team, samengevoegd tot één lijst |
| `af-playbooks` | **Gebruiken voor playbooks?** | De playbooks en rollen |

Alleen formulieren kunnen uit meerdere repositories komen; configuratie en playbooks komen elk uit één. De variabelenbestanden komen uit de map `vars`
van de eerste formulierenrepository die er een heeft.

---

## Hoe repositories samengaan met lokale mappen

De inhoud van een repository vervangt de bijbehorende lokale map; deze tabel vat samen waar elk soort bestand vandaan wordt gelezen.

| Inhoud | Gelezen uit, de eerste treffer wint |
|---|---|
| Configuratie | 1. de database, wanneer de configuratie daar wordt bewaard ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. `config.yaml` van de repository met **Gebruiken voor configuratie** <br> 3. `config.yaml` van een repository met **Gebruiken voor formulieren**, wanneer geen repository voor configuratie wordt gebruikt <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulieren | Elke repository met **Gebruiken voor formulieren** plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) alleen als er geen is |
| Playbooks | De repository met **Gebruiken voor playbooks**, anders [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Variabelenbestanden | De map `vars` van de eerste repository met **Gebruiken voor formulieren** die er een heeft, anders [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Elke repository met **Gebruiken voor workflows** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), samen |

Formulieren uit meerdere repositories worden samengevoegd tot één lijst. Bevatten twee ervan een formulier met dezelfde naam, dan blijft het eerst
geladen formulier behouden en wordt de waarschuwing `skipping duplicate form <name>` gelogd, dus houd formuliernamen uniek over alle repositories.

---

## Probleemoplossing

De meeste problemen zie je in de kolom **Pull** en in **Uitvoer van laatste pull tonen** (of **Uitvoer van laatste push tonen**), die de eigen
foutmelding van git bevatten.

- [Een clone of pull van een repository is mislukt](../troubleshooting.html#a-repository-clone-or-pull-failed): authenticatie, known
  hosts en lokale wijzigingen.
- [De formulierenrepository is nog niet gekloond](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): de ontwerper
  kan niet opslaan vóór de eerste clone.
- Een repository die vastzit in `running`, wordt teruggezet naar `failed`: na een herstart, bij de volgende start; binnen een minuut zodra het knooppunt
  dat zijn git-bewerking uitvoert 2 minuten niet meer antwoordt; en in elk geval na 2 uur. Voer **Pull** opnieuw uit.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Een repository toevoegen](adding.html) | De pagina Repositories, elk veld van een repository, en er een declareren in de config seed |
| [Authenticatie](authentication.html) | HTTPS met een token, SSH met de gegenereerde sleutel, en eigen git-commando's |
| [Wijzigingen pullen](pulling.html) | Geplande, handmatige en API-pulls, en lokale wijzigingen |
| [Ontwerper en push](designer.html) | Formulieren bewerken in de ontwerper en ze naar de repository pushen |
