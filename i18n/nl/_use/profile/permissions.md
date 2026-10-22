---
layout: default
title: Rechten
parent: Je profiel
nav_order: 4
translated_from: 08770187a1159539d1d450cf7dddf80c6943cfed
---

# Rechten
{: .no_toc }

Wat je rollen je toestaan
{: .fs-6 .fw-300 }

---

De rolopties zijn gegroepeerd in tabbladen, elk met het aantal opties dat je ervan hebt, zoals `5/8`:

| Tabblad | Opties over |
|---|---|
| **Toegang en integraties** | Aanmelden, de chatassistent, de MCP-server, bestandsuploads en API-tokens |
| **Ontwerper** | De ontwerper openen, en formulieren, playbooks, workflows, inventarissen en variabelenbestanden bewerken |
| **Jobs** | Jobs en hun extravars of artifacts zien, jobs herstarten, verwijderen, plannen en opslaan |
| **Instellingen** | De instellingenpagina's, de logs, het auditlogboek en back-ups |
| **Overig** | Een optie die met de hand in een rol is gezet en in geen ander tabblad staat; altijd het laatste tabblad |

De andere tabbladen staan in alfabetische volgorde. Elk tabblad is een tabel met de kolommen **Instelling** (de optie), **Omschrijving**
(wat ze doet) en **Jouw toegang**: **Toegestaan** of **Niet toegestaan**. Een optie die geldt vanwege een andere optie, zegt dat
onder haar omschrijving: **Inbegrepen in** een optie die je hebt, zet haar aan, en **Vereist** een optie die je mist, houdt haar uit.

Opties komen uit de `options` van je rollen in `config.yaml`; de pagina [Rollen](../config/roles.html) legt uit hoe
ze worden gecombineerd.
