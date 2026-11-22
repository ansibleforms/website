---
layout: default
title: Een lokale groep
parent: Gebruikers en groepen
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Een lokale groep
{: .no_toc }

De pagina van een lokale groep en haar tabbladen
{: .fs-6 .fw-300 }

Sinds 7.8.0 opent **Groep toevoegen** de wizard **Nieuwe groep** in drie stappen: **Details** (de naam en de beschrijving), **Gebruikers**
(de lokale gebruikers die in de groep komen) en **Rollen** (de rollen die ze krijgt, zodat haar gebruikers ze hebben). Alleen de naam is verplicht.
**Opslaan**, op de laatste stap, maakt de groep aan, voegt daarna de gebruikers toe en geeft de rollen: wat mislukt, wordt in een melding
genoemd, en de groep blijft bestaan.

De pagina van een groep, `/settings/groups/<id>`, heeft deze tabbladen:

| Tabblad | Wat het toont |
|---|---|
| **Details** | De naam en de beschrijving |
| **Gebruikers** | De gebruikers in de groep; **Gebruiker toevoegen** voegt er een toe, het menu van een rij of de selectievakjes verwijderen er een |
| **Rollen** | De rollen die de groep noemen |
| **Formulieren** | De formulieren die die rollen openen |

Een groep met gebruikers kan niet worden verwijderd: verwijder eerst de gebruikers. De groep `admins` kan nooit worden verwijderd of hernoemd.
