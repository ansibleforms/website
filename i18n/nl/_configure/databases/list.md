---
layout: default
title: De pagina Databases
parent: Databases
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# De pagina Databases
{: .no_toc }

De lijst met databases, de kolommen, en er een toevoegen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De lijst

De pagina onder **Verbindingen > Databases** toont elke database met deze kolommen:

| Kolom | Betekenis |
|---|---|
| Naam | Hoe formulieren ernaar verwijzen, met `dbConfig: <name>` |
| Beschrijving | Waarvoor hij dient |
| Database type | Dat van zijn referentie: MySQL, MSSQL, PostgreSQL, Oracle of MongoDB |
| Database | De database die zijn referentie opent |

**Kolommen** voegt er nog twee toe, standaard uit: **Host**, waar zijn referentie verbinding maakt, met de poort als die er is, en **Gebruikt door**,
hoeveel formulieren hem bevragen, met zijn naam of met die van zijn referentie (zie [Gebruikt door](database-page.html#used-by)).

Het databasetype, de database en de host worden uit de referentie gelezen: wijzig ze op de referentie, onder
**Verbindingen > Inloggegevens**. Geen enkele kolom toont een gebruiker of een wachtwoord.

---

## Een database toevoegen

**Database toevoegen** opent een dialoogvenster in twee stappen, zoals dat van een runner.

| Stap | Velden |
|---|---|
| Database | **Naam** en **Beschrijving**. De naam is verplicht, en uniek |
| Referenties | **Inloggegevens**, verplicht: een referentie van het type **Database**. Alleen die worden aangeboden |

In de stap **Referenties** opent **Referentie toevoegen** het dialoogvenster van een nieuwe referentie van het type **Database** (zie
[De pagina met inloggegevens](../credentials/list.html)) en kiest die zodra ze is opgeslagen, zodat een database en zijn aanmelding in één keer kunnen worden toegevoegd.

---

## Het rijmenu

Een rij opent de eigen pagina van de database, en het menu biedt:

| Actie | Wat het doet |
|---|---|
| Bewerken | Opent zijn pagina |
| Verbinding testen | Maakt verbinding met zijn referentie, voert de kleinste query van zijn databasetype uit, en zegt of het lukte |
| Verwijderen | Verwijdert de database, na een bevestiging. Zijn referentie blijft |

Een database verwijderen die formulieren nog noemen, laat hun query's mislukken, tenzij er een referentie met dezelfde naam overblijft om op terug
te vallen (zie [Databases in formulieren](in-forms.html)). Controleer eerst zijn tabblad **Gebruikt door**.
