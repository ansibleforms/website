---
layout: default
title: Bases de dades
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Bases de dades
{: .no_toc }

Les bases de dades que consulten els formularis, amb la seva credencial
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: anomena les bases de dades que consulten els formularis, tria la credencial amb què es connecta cadascuna i prova-les.

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [La pàgina de bases de dades](databases/list.html) | La llista de bases de dades, les seves columnes i el diàleg que n'afegeix una |
| [La pàgina d'una base de dades](databases/database-page.html) | Les pestanyes d'una base de dades, els formularis que la consulten, Prova la connexió i Suprimeix |
| [Bases de dades als formularis](databases/in-forms.html) | Com el `dbConfig` d'un camp nomena una base de dades, i els formularis escrits abans de la 7.5.0 |

---

## Com funciona

Des de la 7.5.0 una **base de dades** és una connexió pròpia, que s'afegeix a **Connexions > Bases de dades**, entre **Magatzems de secrets** i **Runners**.
Té tres coses:

| Camp | Què és |
|---|---|
| Nom | El nom que dona el `dbConfig` d'un camp per consultar-la, com ara `cmdb` |
| Descripció | Per a què serveix |
| Credencial | La credencial de [Connexions > Credencials](credentials.html), de tipus **Base de dades**, amb què es connecta |

La credencial conserva tot el que fa referència a la connexió, com abans: el tipus de base de dades (MySQL, MSSQL, PostgreSQL, Oracle o MongoDB),
el host i el port, el nom de la base de dades, el TLS, i l'usuari i la contrasenya, desats xifrats o llegits d'un [magatzem de secrets](secret-stores/).
Una base de dades no té cap adreça ni cap secret propis, així que una base de dades i un runner trien la seva credencial de la mateixa manera.

Un camp consulta una base de dades nomenant-la al `dbConfig`:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Un nom que no és cap base de dades es busca com una credencial de tipus base de dades, com abans de la 7.5.0, de manera que els formularis més antics
continuen funcionant sense canvis (vegeu [Bases de dades als formularis](databases/in-forms.html)).

---

## Actualitzar a la 7.5.0

L'actualització omple **Connexions > Bases de dades** una sola vegada, perquè els formularis que tens continuïn funcionant sense cap canvi.

Crea una base de dades per a cada credencial de tipus base de dades, amb el nom i la descripció de la credencial, que es connecta amb aquesta
credencial. Un formulari el `dbConfig` del qual nomena la credencial ara troba la base de dades del mateix nom, que es connecta amb la mateixa
credencial: el resultat és el mateix. Les credencials conserven tots els seus camps.

L'actualització només s'executa una vegada: una base de dades suprimida després no es torna a crear, i una credencial de base de dades afegida més tard
no té cap base de dades fins que n'afegeixes una.

---

## Credencials en ús

Una credencial amb què es connecta una base de dades està en ús, com la credencial amb què inicia sessió un runner.

No es pot suprimir ni reanomenar mentre una base de dades la nomena, i la pestanya **Usat per** de la seva pàgina llista les bases de dades (vegeu
[Credencials en ús](credentials.html#credentials-in-use)). Suprimir una base de dades deixa la seva credencial tal com està.

---

## Qui gestiona les bases de dades

Les bases de dades segueixen les opcions de rol de les credencials que nomenen.

La llista, la pàgina d'una base de dades i la seva API necessiten l'opció de rol `showSettings` o `showConnectionsSettings`, com les credencials.
Només un admin pot fer que una base de dades es connecti amb una credencial que només un admin pot nomenar, com ara una que llegeix la seva
contrasenya d'un magatzem de secrets (vegeu [Qui pot canviar una credencial](credentials.html#who-may-change-a-credential)): els formularis que la
consulten es connectarien amb aquesta credencial, i **Prova la connexió** enviaria el seu secret al seu servidor. Un altre usuari pot tornar a desar una
base de dades amb la credencial que ja nomena.

Una base de dades declarada a la [llavor de configuració](seed/) és només de lectura a la seva pàgina: canvia-la al fitxer de la llavor.

---

## La llavor de configuració

Una llavor declara les seves bases de dades en una secció `databases:`, després de les credencials que nomenen.

Cada element té un `name`, una `credential` de tipus base de dades i, opcionalment, una `description`. La credencial pot venir de la secció
`credentials` de la mateixa llavor o ser una creada a l'aplicació:

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

Vegeu l'[exemple](seed/example.html) complet i [Objectes gestionats](seed/managed-objects.html) per saber com la llavor es fa seu el que declara.

---

## L'API REST

Els scripts gestionen les bases de dades a través de l'[API REST](api/), sota `/api/v2/database`, amb les mateixes opcions de rol que la pàgina.

| Crida | Què fa |
|---|---|
| `GET /api/v2/database` | Llista les bases de dades, cadascuna amb el tipus de base de dades, la base de dades, el host i el port de la seva credencial, i quants formularis la consulten (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Obté la base de dades d'aquest nom |
| `GET /api/v2/database/<id>` | Obté una base de dades |
| `POST /api/v2/database` | Afegeix una base de dades: el seu `name`, la seva `credential` i, opcionalment, la seva `description` |
| `PUT /api/v2/database/<id>` | Canvia una base de dades |
| `DELETE /api/v2/database/<id>` | Suprimeix una base de dades; la seva credencial es queda |
| `POST /api/v2/database/<id>/check` | Prova la seva connexió, amb la seva credencial |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Una `credential` que no existeix, o que no és de tipus base de dades, es rebutja amb `400`. Cada canvi s'escriu al registre d'auditoria.
