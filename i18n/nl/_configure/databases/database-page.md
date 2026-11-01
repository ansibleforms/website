---
layout: default
title: "De pagina van een database"
parent: Databases
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# De pagina van een database
{: .no_toc }

De tabbladen, de formulieren die hem bevragen, testen en verwijderen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tabbladen

De pagina van een database toont de stappen van zijn dialoogvenster als tabbladen, plus de formulieren die hem bevragen:

| Tabblad | Wat het bevat |
|---|---|
| Details | De **Naam**, die de `dbConfig` van een veld opgeeft, en de **Beschrijving** |
| Referenties | De **Inloggegevens** waarmee hij verbinding maakt, een referentie uit Verbindingen > Inloggegevens van het type **Database**, die het databasetype, de host, de poort, de database, TLS en de aanmelding bevat |
| Gebruikt door | De formulieren die hem bevragen, met het aantal op het tabblad, zie [Gebruikt door](#used-by) |

Elk tabblad heeft een eigen adres, zoals `/settings/databases/<id>/used-by`, zodat een link of een bladwijzer het opent. De zoekfunctie van de
titelregel filtert alle tabbladen tegelijk.

Op het tabblad **Referenties** maakt **Referentie toevoegen** een nieuwe referentie van het type **Database** en kiest die. Een wachtwoord wordt na
het opslaan nooit meer getoond: wijzig het op de referentie.

---

## Gebruikt door

Het tabblad **Gebruikt door** toont de formulieren waarvan de velden de database bevragen, zoals de app ze uit de formulieren leest.

| Kolom | Wat het toont |
|---|---|
| Formulier | Het formulier, een rij opent het |
| Beschrijving | De beschrijving van het formulier |
| Veld | De velden van dat formulier waarvan de `dbConfig` de database noemt |

Een veld telt mee als zijn `dbConfig` de database noemt, of zijn referentie noemt, zoals een formulier van vóór 7.5.0 doet. Beide maken
verbinding met dezelfde referentie, dus beide worden getoond. Als er geen is, zegt het tabblad **Geen formulier bevraagt deze database.**

---

## Verbinding testen en Verwijderen

De knoppen rechtsboven werken op de database zoals hij is opgeslagen.

**Verbinding testen** maakt verbinding met zijn referentie, voert de kleinste query van zijn databasetype uit, en zegt het in een bericht,
**&lt;name&gt; verbinding ok**, of waarom het mislukte. Het is dezelfde test als **Verbinding testen** van de referentie zelf.

**Verwijderen** vraagt eerst, verwijdert dan de database en gaat terug naar de lijst. Zijn referentie blijft onder **Verbindingen > Inloggegevens**.
Ernaast slaat **Opslaan** de tabbladen Details en Referenties op.
