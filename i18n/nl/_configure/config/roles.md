---
layout: default
title: Rollen
parent: config.yaml
nav_order: 2
translated_from: 204f9e089bcb7000e0be4712ad4590ad3b3fd74b
---

# Rollen
{: .no_toc }

Gebruikers en groepen aan rollen koppelen, en instellen wat elke rol mag doen.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het attribuut roles

De lijst `roles` op het hoogste niveau van config.yaml:

{% include config_attribute.html name="roles" %}

---

## De rol default

Elke aangemelde gebruiker heeft de rol `default`, dus een formulier met `roles: [default]` staat open voor iedereen die zich kan aanmelden. Er
is geen anonieme toegang: niemand krijgt deze rol zonder zich aan te melden.

De rol bevat geen groepen en geen gebruikers, omdat hij al voor iedereen geldt. Zijn `options` zijn de standaardwaarden voor iedereen, zoals
beschreven onder [Rolinstellingen](#role-options) hieronder. `config.yaml` moet een rol `admin` en een rol `default` hebben, en de
rollenpagina toont beide als **Vereist**.

`default` heette vóór 7.0.0 `public`, en de oude naam blijft werken:

- **In een formulier** matcht `roles: [public]` nog steeds elke gebruiker, dus formulieren in je repositories hoeven niet te worden gewijzigd.
- **In `config.yaml`** wordt een rol met de naam `public` in het bestand hernoemd naar `default` wanneer de configuratie laadt. Alleen de naam
  verandert, er wordt eerst een back-up van de configuratie gemaakt, en een configuratie die in een repository staat heeft dan een wijziging om te pushen.
- **In een ytt-template** wordt de template niet herschreven: de configuratie die hij produceert wordt hernoemd, en een waarschuwing in het log vraagt
  je de rol ook in de template te hernoemen. Versie 8 weigert daar een rol `public`.

Een configuratie met zowel een rol `default` als een rol `public` wordt geweigerd, omdat het dezelfde rol is.

---

## Het object Role

Elk item van de lijst `roles`:

{% include config_object.html name="Role" %}

---

## Rolinstellingen

De `options` van een rol schakelen functies in of uit voor de leden ervan. Vanaf 7.3.0 toont de pagina van de rol ze in vier groepen,
elke instelling met een (i) die zegt wat ze geeft, dezelfde tekst die de weergave **Rechten** van het profiel toont:

| Instelling | Laat de gebruiker toe om | Standaard |
|---|---|---|
| **Instellingen** | | |
| `showSettings` | Elke instellingenpagina te zien en te wijzigen; het serverlog en de back-ups hebben eigen instellingen | Alleen admins |
| `showAppearanceSettings` | De instellingen voor het uiterlijk te wijzigen, zonder de andere instellingen (vanaf 7.3.0) | Uit |
| `showConnectionsSettings` | De verbindingsinstellingen te beheren (referenties, runners en meer), zonder de andere instellingen (vanaf 7.3.0) | Uit |
| `showLogs` | Het serverlog te zien | Alleen admins |
| `showAuditLog` | Het auditlogboek te zien, zonder de andere instellingen (vanaf 7.3.0) | Alleen admins |
| `allowBackupOps` | Back-ups van de database te maken en terug te zetten | Alleen admins |
| **Designer** | | |
| `showDesigner` | De designer te zien en te gebruiken | Alleen admins |
| `allowFormDesign` | De formulierconfiguratie in de designer te bewerken: categorieën, constanten en formulieren. Zonder deze instelling alleen-lezen (vanaf 7.3.0) | Aan |
| `designAllForms` | Elk formulier in de designer te zien en te bewerken. Zonder deze instelling alleen de formulieren van de rollen van de gebruiker (vanaf 7.5.0) | Aan |
| `allowPlaybookDesign` | De playbooks in de designer te bewerken: opslaan, aanmaken, verwijderen en pushen. Zonder deze instelling alleen-lezen | Aan |
| `designAllPlaybooks` | Elk playbook in de designer te zien en te bewerken. Zonder deze instelling alleen die de formulieren van de gebruiker gebruiken of die nog geen formulier gebruikt (vanaf 7.5.0) | Aan |
| `allowWorkflowDesign` | De workflows in de designer te bewerken: opslaan, aanmaken, verwijderen en pushen. Zonder deze instelling alleen-lezen | Aan |
| `designAllWorkflows` | Elke workflow in de designer te zien en te bewerken. Zonder deze instelling alleen die de formulieren van de gebruiker gebruiken of die nog geen formulier gebruikt (vanaf 7.5.0) | Aan |
| `allowInventoryDesign` | De inventories in de designer te bewerken: opslaan, aanmaken, verwijderen en pushen. Zonder deze instelling alleen-lezen | Aan |
| `allowVarsFileDesign` | De vars-bestanden in de designer te bewerken: opslaan, aanmaken, verwijderen en pushen. Zonder deze instelling alleen-lezen | Aan |
| **Jobs** | | |
| `showJobs` | De jobpagina te zien | Aan |
| `showAllJobLogs` | De jobs van elke gebruiker te zien, niet alleen de eigen | Alleen admins |
| `manageAllJobs` | De jobs van elke gebruiker af te breken, te verwijderen en opnieuw te starten; verwijderen en opnieuw starten vereisen ook de twee instellingen hieronder (vanaf 7.3.0) | Alleen admins |
| `showExtravars` | De extravars van een formulier en van een job te zien | Aan |
| `showDebugButtons` | De debugknoppen op een formulier te zien | Aan |
| `showArtifacts` | De artifacts van een job te zien: wat een AWX-job teruggeeft, of wat een playbook met `set_stats` heeft verzameld | Aan |
| `allowVerboseMode` | Jobs in verbose-modus uit te voeren | Aan |
| `allowJobRelaunch` | Een job opnieuw te starten met de formuliergegevens van een eerdere uitvoering | Alleen admins |
| `allowJobDeletion` | Jobs te verwijderen: de eigen, of die van elke gebruiker met `manageAllJobs`. Zonder deze instelling blijft de jobgeschiedenis volledig (vanaf 7.3.0) | Aan |
| `allowScheduledJobs` | Terugkerende en eenmalige planningen aan te maken en te beheren, op de pagina **Planner** (zie de waarschuwing hieronder) | Alleen admins |
| `allowPlannedJobs` | Een job te plannen om eenmaal op een vast tijdstip te draaien (**Later uitvoeren**) | Aan |
| `allowStoredJobs` | De gegevens van een formulier op te slaan en later weer te laden | Aan |
| **Toegang en integraties** | | |
| `allowLogin` | Zich aan te melden bij AnsibleForms | Aan |
| `allowChat` | De [chat-assistent](../chat/) te gebruiken, als die is ingeschakeld | Aan |
| `allowMcp` | De [MCP-server](../mcp/) vanuit een AI-agent te gebruiken, als die is ingeschakeld | De `allowChat` van de rol |
| `allowFileUploads` | Bestanden te uploaden via de bestandsvelden van een formulier (vanaf 7.3.0) | Aan |
| `allowApiTokens` | [API-tokens](../profile/api-token.html) voor scripts te maken, tot de langste levensduur die de instantie toestaat (vanaf 7.3.0) | Uit |
| `extendedTokenExpiration` | Ook API-tokens te maken die nooit verlopen; vereist `allowApiTokens` | Uit |

Sommige instellingen omvatten andere, en de pagina van de rol toont de inbegrepen instellingen als aan en grijs:

- **`showSettings`** geeft ook `showAppearanceSettings`, `showConnectionsSettings` en `showAuditLog`.
- **`manageAllJobs`** geeft ook `showAllJobLogs`, omdat handelen op de jobs van elke gebruiker betekent dat je ze ziet.
- **De ontwerpinstellingen** tellen alleen mee met `showDesigner`, en `extendedTokenExpiration` alleen met `allowApiTokens`.

Tot en met 7.2.0 liet `showAllJobLogs` een gebruiker ook de getoonde jobs afbreken en verwijderen; vanaf 7.3.0 is daarvoor `manageAllJobs` nodig.
Een rol van vóór 7.3.0 met `extendedTokenExpiration` en zonder `allowApiTokens` krijgt `allowApiTokens`, zodat hij zijn tokens behoudt.

`designAllForms`, `designAllPlaybooks` en `designAllWorkflows` staan altijd aan voor admins, en wat de designer een gebruiker zonder
deze instellingen toont, staat in [Beperkte ontwerpers](../designer/#limited-designers).

**Alleen admins** betekent aan voor gebruikers met de rol `admin`, en uit voor alle anderen. Als een gebruiker met meerdere rollen overeenkomt,
worden de instellingen als volgt gecombineerd:

- **Tussen de rollen van de gebruiker** is een instelling alleen aan als elke rol die haar instelt het eens is: een expliciete `false` wint.
- **De rol `default`** vult de instellingen aan die geen van de andere rollen van de gebruiker instelt, zodat hij standaardwaarden voor iedereen kan bevatten.
- **Instellingen die nergens zijn ingesteld** nemen de standaardwaarde uit de tabel.

`showExtraVars`, met een hoofdletter V, wordt geaccepteerd als andere schrijfwijze van `showExtravars`; als een van beide schrijfwijzen `false` is, staat de
instelling uit.

{: .warning }
> Behandel `allowScheduledJobs` als een instelling op adminniveau. Planningen zijn geen eigendom van de gebruiker die ze heeft aangemaakt: elke gebruiker met
> de instelling ziet alle planningen en kan ze wijzigen. Een planning draait ook met adminrechten, voor elk formulier, ongeacht de eigen
> toegang van de maker. Geef haar alleen aan rollen die je als admins zou vertrouwen.

{: .warning }
> `allowLogin: false` op de rol `default` sluit elke gebruiker buiten wiens andere rollen geen `allowLogin: true` instellen, inclusief
> de admins. Geef haar terug aan de rollen die zich moeten aanmelden voordat je opslaat.
