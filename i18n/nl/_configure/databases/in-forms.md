---
layout: default
title: Databases in formulieren
parent: Databases
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Databases in formulieren
{: .no_toc }

Hoe de dbConfig van een veld een database noemt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Een database noemen

Een veld met een `query` voert die uit op de database die zijn `dbConfig` noemt.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Vanaf 7.5.0 wordt de naam in deze volgorde opgezocht:

| Volgorde | De naam is | De query maakt verbinding met |
|---|---|---|
| 1 | Een database uit **Verbindingen > Databases** | De referentie die die database noemt |
| 2 | Anders een referentie van het type **Database** uit **Verbindingen > Inloggegevens** | Die referentie, zoals vóór 7.5.0 |

Het databasetype (MySQL, MSSQL, PostgreSQL, Oracle of MongoDB) komt uit de referentie, dus het formulier geeft het nooit op. Een referentie
zonder type wordt als MySQL gelezen.

---

## Formulieren van vóór 7.5.0

Elk formulier dat een referentie in `dbConfig` noemde, blijft werken, zonder wijziging.

De [upgrade naar 7.5.0](../databases.html#upgrading-to-750) maakt een database voor elke databasereferentie, met dezelfde naam en
verbonden met die referentie, zodat de naam die een formulier opgeeft nu eerst de database vindt, die naar dezelfde aanmelding leidt. Een referentie
van het type database zonder database met haar naam wordt nog steeds gevonden via stap 2.

Een database en een referentie kunnen een naam delen, zoals de upgrade doet. De database wint: laat hem naar een andere referentie wijzen en elk
formulier dat die naam opgeeft volgt, zo gaat een formulier naar een andere server zonder te worden bewerkt.

---

## De vormen van dbConfig

De drie vormen die `dbConfig` altijd heeft aangenomen, werken nog steeds, elke naam opgezocht zoals hierboven.

| `dbConfig` | Voorbeeld | Wat het doet |
|---|---|---|
| Een naam | `dbConfig: cmdb` | Bevraagt die database |
| Een lijst met namen | `dbConfig: [cmdb-eu, cmdb-us]` | Voert de query op elk uit en voegt de resultaten samen; dubbele worden niet verwijderd |
| Een object (verouderd) | `dbConfig: { name: cmdb, type: mysql }` | Bevraagt de database of referentie `name`; verouderd, gebruik alleen de naam |

Een verwijzing naar een [secret store](../secret-stores/#inline-without-a-credential-row), zoals `dbConfig: secret:vault:secret/cmdb/db`, is
geen naam van een database of een referentie, en wordt nog steeds uit de store gelezen zoals voorheen.

---

## Welke formulieren een database bevragen

De app leest de formulieren om te weten welke ervan elke database bevragen.

De kolom **Gebruikt door** van [de pagina Databases](list.html) telt ze, en het tabblad **Gebruikt door** van
[de pagina van een database](database-page.html#used-by) toont ze met hun velden. Een veld dat in plaats daarvan de referentie van de database
noemt, telt ook mee. Hernoem een database pas nadat je de formulieren hebt gewijzigd die zijn oude naam opgeven.
