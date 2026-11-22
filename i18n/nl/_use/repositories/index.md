---
layout: default
title: Git-repositories
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 5595dcc0c5adf343f1f347feef0f5586f0312a4b
---

# Git-repositories
{: .no_toc }

Bewaar formulieren, playbooks, instellingen en verbindingen in git
{: .fs-6 .fw-300 }

---

Voor beheerders die formulieren, playbooks en de configuratie van de app in git bewaren: wat een repository kan bevatten en welke bron wint.

---

## Waarvoor een repository dient

Een repository is een git-remote die AnsibleForms kloont en bijwerkt, en haar gebruikstypen zeggen wat de app eruit haalt.

Sinds 7.8.0 toont de stap **Gebruik** van een repository de gebruikstypen onder zes kopjes: **Ontwerper**, **Taken**, **Systeem**,
**Uiterlijk**, **Toegang** en **Verbindingen**. De typen onder **Ontwerper** zijn bestanden die de app leest zoals ze zijn:

| Gebruikstype | Wat AnsibleForms eruit leest | Waar in de repository |
|---|---|---|
| **Formulieren** | De formulierbestanden, die de ontwerper er ook in terug opslaat, en hun variabelenbestanden | `forms`, of de root; variabelenbestanden in `vars` |
| **Playbooks** | De Ansible-playbooks die jobs uitvoeren | `playbooks`, of de root |
| **Workflows** | De [workflow](../workflows/)bestanden, die de ontwerper er ook in terug opslaat | elke map |
| **Inventarissen** | Eén inventaris, genoemd naar de repository, waarnaar een formulier verwijst met `inventory:` | de root: `inventory.yaml`, `group_vars`, `host_vars` |
| **Categorieën**, **Constanten** | De categorieën en de constanten, die de ontwerper ook terug in hun bestand opslaat | het bestand met `controller_categories:` of `controller_constants:` |

Elk ander type bewaart instellingen, gebruikers of verbindingen van de app in YAML-bestanden, in beide richtingen gelezen en geschreven: de planners,
de instellingen van Algemeen, de pagina's van Uiterlijk, de gebruikers, groepen en rollen, de aanmeldingen, de inloggegevens, de runners en de
andere verbindingen. Ze worden beschreven in [Configuratie in git](config-as-code.html).

**Formulieren**, **Playbooks**, **Workflows** en **Inventarissen** mogen op meerdere repositories aangevinkt zijn, elk ander type
op hoogstens één repository. Een formulier voert de playbooks van de eerste **Playbooks**-repository uit, tenzij het met
`playbookRepository` zijn eigen noemt. Elke repository wordt gekloond in een submap met haar naam, onder
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

De schakelaar **Gebruiken voor configuratie?** van vóór 7.8.0 is vervangen door **Rollen**, **Categorieën** en **Constanten**, elk gelezen uit het
bestand met zijn sleutel; de `config.yaml` van een repository wordt nog gelezen, verouderd (zie
[Rollen, categorieën en constanten](config-as-code.html#roles-categories-and-constants)).

### Eén repository voor alles

Eén repository kan formulieren, variabelenbestanden, configuratie en playbooks bevatten, met de gebruikstypen aangevinkt en één submap per soort.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Eén repository per doel

Met afzonderlijke repositories kunnen teams hun eigen deel beheren, elk met eigen gebruikstypen en de bestanden direct in de root.

| Repository | Gebruikstypen | Inhoud in de root |
|---|---|---|
| `af-platform` | **Rollen**, **Categorieën**, **Constanten**, **Inloggegevens**, **Runners** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formulieren** | De formulierbestanden van elk team, samengevoegd tot één lijst |
| `af-playbooks` | **Playbooks** | De playbooks en rollen |

De variabelenbestanden komen uit de map `vars` van de eerste formulierenrepository die er een heeft.

---

## Hoe repositories samengaan met lokale mappen

De inhoud van een repository vervangt de bijbehorende lokale map; deze tabel vat samen waar elk soort bestand vandaan wordt gelezen.

| Inhoud | Gelezen uit, de eerste treffer wint |
|---|---|
| Rollen, categorieën, constanten | Elke sleutel apart: 1. het bestand met `controller_roles:`, `controller_categories:` of `controller_constants:` in de repository met dat gebruikstype <br> 2. de `config.yaml` van die repository (verouderd) <br> 3. de basisconfiguratie: de database, wanneer de configuratie daar wordt bewaard ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), anders [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulieren | Elke repository met **Formulieren** plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) alleen als er geen is |
| Playbooks | De repository met **Playbooks**, anders [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Variabelenbestanden | De map `vars` van de eerste repository met **Formulieren** die er een heeft, anders [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Elke repository met **Workflows** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), samen |

Formulieren uit meerdere repositories worden gelezen in de volgorde waarin de repositories zijn toegevoegd. Bevatten twee ervan een formulier met dezelfde
naam, dan wordt de kopie van de eerst toegevoegde repository gebruikt en noemt een waarschuwing beide kopieën, dus houd formuliernamen uniek over alle repositories.

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
| [Configuratie in git](config-as-code.html) | Elke instelling bewaard in een git-repository, in beide richtingen gelezen en geschreven |
