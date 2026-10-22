---
layout: default
title: Een repository toevoegen
parent: Git-repositories
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Een repository toevoegen
{: .no_toc }

De pagina Repositories, elk veld van een repository, en er een declareren in de config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De pagina Repositories

Repositories worden beheerd onder **Instellingen > Verbindingen > Repositories**, waarvoor de [roloptie](../config/roles.html#role-options) `showSettings` of, vanaf 7.3.0,
`showConnectionsSettings` nodig is. Sommige wijzigingen zijn alleen voor een admin, zie [hieronder](#who-may-change-a-repository).

![Repositories](../assets/screenshots/git.jpg)

De lijst toont **Naam**, **Beschrijving**, **Branch**, **Head** (de korte hash van de uitgecheckte commit), **Pull** en
**Push**. Het tabblad **Details** van een repository toont dezelfde badges Pull en Push boven de head:

| Kolom | Wat ze zegt |
|---|---|
| **Pull** | De laatste clone, pull of reset: **Bezig** terwijl git werkt, daarna **Geslaagd** of **Mislukt**; een streepje vóór de eerste |
| **Push** | **Mislukt** wanneer de laatste push mislukte; **Openstaande wijzigingen** wanneer wijzigingen die hier, door de ontwerper, zijn opgeslagen nog niet naar de remote zijn gepusht; **Geslaagd** wanneer er niets wacht; een streepje vóór de eerste push |

**Geslaagd** in de kolom Push betekent alleen dat er niets wacht om te worden gepusht: de remote kan nog nieuwere commits hebben die een
pull binnenhaalt. Het menu van elke rij bevat deze acties:

| Actie | Wat ze doet |
|---|---|
| **Bewerken** | De velden hieronder wijzigen |
| **Pull** | De repository klonen, of pullen als de working tree al bestaat |
| **Push** | De working tree committen en pushen; alleen bij repositories die voor formulieren, configuratie, playbooks, workflows of inventarissen worden gebruikt, en alleen beschikbaar zolang er wijzigingen zijn die nog niet zijn gepusht |
| **Resetten** | De working tree verwijderen en opnieuw klonen, waarbij lokale wijzigingen verloren gaan |
| **Referenties wijzigen** | Het tabblad **Referenties** van de repository openen, om de referentie te kiezen die git gebruikt |
| **Uitvoer van laatste pull tonen** | De uitvoer van git bij de laatste clone, pull of reset tonen, met het wachtwoord gemaskeerd |
| **Uitvoer van laatste push tonen** | De uitvoer van git bij de laatste push tonen, met het wachtwoord gemaskeerd |
| **Verwijderen** | Het record en de working tree onder `REPO_PATH` verwijderen; alleen voor een admin |

**Alles pullen**, boven de lijst, pullt alle repositories tegelijk.

Er draait maar één git-bewerking tegelijk op een repository. Een tweede wordt geweigerd met
`Repository '<name>' not found or already running, try again later`.

---

## Een repository toevoegen

Klik op **Repository toevoegen**: een wizard vraagt de velden in vier stappen (**Repository**, **Referenties**, **Gebruik**, **Pull-schema**),
en AnsibleForms start de clone op de achtergrond zodra je opslaat.

![Edit Repository](../assets/screenshots/git-edit.jpg)

| Veld | Verplicht | Betekenis |
|---|---|---|
| **Naam** | ja | De mapnaam onder `REPO_PATH`; letters, cijfers, streepje, underscore en punt |
| **Branch** | ja | De branch om te klonen, te pullen en te pushen, bijvoorbeeld `main`; verplicht vanaf 7.3.0. Alleen een repository uit de config seed mag hem weglaten, om de standaardbranch van de remote te klonen |
| **Referentie** | nee | Een referentie uit [Verbindingen > Inloggegevens](../credentials.html) met de gebruiker en het wachtwoord of token die git gebruikt; **Referentie toevoegen** maakt er een aan |
| **Uri** | ja | De remote, `https://...` of SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Geplande pull inschakelen** | nee | De repository volgens een schema pullen |
| **Pull-schema** | nee | Wanneer er wordt gepulld, als cron-expressie; zichtbaar zodra de geplande pull is ingeschakeld |
| **Beschrijving** | ja | Een vrije beschrijving |
| **Gebruiken voor configuratie?** ... **Gebruiken voor inventarissen?** | nee | Wat de repository bevat, zie [hierboven](./#what-a-repository-is-for) |
| **Pullen bij het starten van de app** | nee | De repository klonen, of pullen, telkens als AnsibleForms start |

Een repository hernoemen verplaatst de working tree naar de nieuwe map en neemt het pull-schema mee. Een repository van
vóór 7 die nog een eigen gebruiker heeft, meldt dat op het tabblad **Referenties**: kies een referentie om die te vervangen.

---

## Wie een repository mag wijzigen

De inhoud van een repository wordt wat AnsibleForms laadt en uitvoert, dus vanaf 7.3.0 kan een gebruiker zonder de rol `admin` niet langer:

- een repository toevoegen of verwijderen;
- de **Uri** of de **Branch** ervan wijzigen;
- een van de schakelaars **Gebruiken voor** aan- of uitzetten.

Hij kan nog wel de beschrijving, het pull-schema en de referentie wijzigen, en de repository pullen, pushen of resetten. Een referentie die een runner,
een verbinding of een aanmelding gebruikt, kan hij niet kiezen; de weigering noemt haar, en zegt niets over wat ze bevat.

---

## Repositories declareren in de config seed

Repositories kunnen ook in de [config seed](../seed/) worden gedeclareerd, zodat een nieuwe instantie ze bij haar eerste start kloont.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

De velden zijn die van de pagina, inclusief `credential` (een referentie uit de seed of uit de app), `rebase_on_start` (**Pullen bij het starten
van de app**) en `cron` (het pull-schema); `user` en `password` worden nog geaccepteerd in plaats van een referentie. Een
repository uit de seed is in de interface alleen-lezen, en wordt bij het starten opnieuw gekloond als de working tree ontbreekt; zie
[Beheerde objecten](../seed/managed-objects.html).
