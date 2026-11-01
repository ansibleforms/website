---
layout: default
title: Databases
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Databases
{: .no_toc }

De databases die formulieren bevragen, elk met zijn referentie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: geef de databases die je formulieren bevragen een naam, kies de referentie waarmee elk verbinding maakt, en test ze.

---

## In deze sectie

| Pagina | Wat er aan bod komt |
|---|---|
| [De pagina Databases](databases/list.html) | De lijst met databases, de kolommen ervan, en het dialoogvenster waarmee je er een toevoegt |
| [De pagina van een database](databases/database-page.html) | De tabbladen van een database, de formulieren die hem bevragen, Verbinding testen en Verwijderen |
| [Databases in formulieren](databases/in-forms.html) | Hoe de `dbConfig` van een veld een database noemt, en de formulieren van vóór 7.5.0 |

---

## Hoe het werkt

Vanaf 7.5.0 is een **database** een eigen verbinding, toegevoegd onder **Verbindingen > Databases**, tussen **Secret stores** en **Runners**.
Hij heeft drie dingen:

| Veld | Wat het is |
|---|---|
| Naam | De naam die de `dbConfig` van een veld opgeeft om hem te bevragen, zoals `cmdb` |
| Beschrijving | Waarvoor hij dient |
| Inloggegevens | De referentie uit [Verbindingen > Inloggegevens](credentials.html), van het type **Database**, waarmee hij verbinding maakt |

De referentie bevat alles over de verbinding, zoals voorheen: het databasetype (MySQL, MSSQL, PostgreSQL, Oracle of MongoDB),
de host en poort, de databasenaam, TLS, en de gebruiker en het wachtwoord, versleuteld bewaard of gelezen uit een [secret store](secret-stores/).
Een database heeft geen eigen adres en geen eigen geheim, dus een database en een runner kiezen hun referentie op dezelfde manier.

Een veld bevraagt een database door hem in `dbConfig` te noemen:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Een naam die geen database is, wordt opgezocht als referentie van het type database, zoals vóór 7.5.0, zodat oudere formulieren
ongewijzigd blijven werken (zie [Databases in formulieren](databases/in-forms.html)).

---

## Upgraden naar 7.5.0

De upgrade vult **Verbindingen > Databases** één keer, zodat je bestaande formulieren zonder wijziging blijven werken.

Hij maakt één database voor elke referentie van het type database, met de naam en beschrijving van de referentie, die met die
referentie verbinding maakt. Een formulier waarvan de `dbConfig` de referentie noemt, vindt nu de database met dezelfde naam, die met dezelfde
referentie verbinding maakt: het resultaat is hetzelfde. Referenties behouden al hun velden.

De upgrade draait maar één keer: een database die daarna wordt verwijderd, wordt niet opnieuw gemaakt, en een databasereferentie die later
wordt toegevoegd, krijgt geen database totdat je er een toevoegt.

---

## Referenties in gebruik

Een referentie waarmee een database verbinding maakt, is in gebruik, net als een referentie waarmee een runner zich aanmeldt.

Ze kan niet worden verwijderd of hernoemd zolang een database haar noemt, en het tabblad **Gebruikt door** van haar pagina toont de databases (zie
[Referenties in gebruik](credentials.html#credentials-in-use)). Een database verwijderen laat zijn referentie zoals ze is.

---

## Wie databases beheert

De databases volgen de rolinstellingen van de referenties die ze noemen.

De lijst, de pagina van een database en de API ervan vereisen de rolinstelling `showSettings` of `showConnectionsSettings`, net als de referenties.
Alleen een admin kan een database verbinding laten maken met een referentie die alleen een admin mag noemen, zoals een die haar wachtwoord uit een
secret store leest (zie [Wie een referentie mag wijzigen](credentials.html#who-may-change-a-credential)): de formulieren die hem bevragen zouden met
die referentie verbinding maken, en **Verbinding testen** zou haar geheim naar haar server sturen. Een andere gebruiker mag een database opnieuw
opslaan met de referentie die hij al noemt.

Een database die in de [configuratie-seed](seed/) is gedeclareerd, is op zijn pagina alleen-lezen: wijzig hem dan in het seedbestand.

---

## De configuratie-seed

Een seed declareert zijn databases in een sectie `databases:`, na de referenties die ze noemen.

Elk item heeft een `name`, een `credential` van het type database en optioneel een `description`. De referentie kan uit de
sectie `credentials` van dezelfde seed komen of een in de app gemaakte referentie zijn:

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

Zie het volledige [voorbeeld](seed/example.html) en [Beheerde objecten](seed/managed-objects.html) voor hoe de seed beheert wat hij declareert.

---

## De REST API

Scripts beheren de databases via de [REST API](api/), onder `/api/v2/database`, met dezelfde rolinstellingen als de pagina.

| Aanroep | Wat het doet |
|---|---|
| `GET /api/v2/database` | Toont de databases, elk met het databasetype, de database, de host en de poort van zijn referentie, en hoeveel formulieren hem bevragen (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Haalt de database met die naam op |
| `GET /api/v2/database/<id>` | Haalt één database op |
| `POST /api/v2/database` | Voegt een database toe: zijn `name`, `credential` en optioneel `description` |
| `PUT /api/v2/database/<id>` | Wijzigt een database |
| `DELETE /api/v2/database/<id>` | Verwijdert een database; zijn referentie blijft |
| `POST /api/v2/database/<id>/check` | Test zijn verbinding, met zijn referentie |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Een `credential` die niet bestaat, of niet van het type database is, wordt geweigerd met `400`. Elke wijziging wordt in het auditlog geschreven.
