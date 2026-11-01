---
layout: default
title: Bases de dades als formularis
parent: Bases de dades
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Bases de dades als formularis
{: .no_toc }

Com el dbConfig d'un camp nomena una base de dades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nomenar una base de dades

Un camp amb una `query` l'executa a la base de dades que nomena el seu `dbConfig`.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Des de la 7.5.0 el nom es busca en aquest ordre:

| Ordre | El nom és | La consulta es connecta amb |
|---|---|---|
| 1 | Una base de dades de **Connexions > Bases de dades** | La credencial que nomena aquesta base de dades |
| 2 | Si no, una credencial de tipus **Base de dades** de **Connexions > Credencials** | Aquesta credencial, com abans de la 7.5.0 |

El tipus de base de dades (MySQL, MSSQL, PostgreSQL, Oracle o MongoDB) ve de la credencial, així que el formulari no el dona mai. Una credencial
sense tipus es llegeix com a MySQL.

---

## Formularis escrits abans de la 7.5.0

Tots els formularis que nomenaven una credencial al `dbConfig` continuen funcionant, sense cap canvi.

L'[actualització a la 7.5.0](../databases.html#upgrading-to-750) crea una base de dades per a cada credencial de base de dades, amb el mateix nom i
connectada amb aquesta credencial, de manera que el nom que dona un formulari ara troba primer la base de dades, que porta al mateix accés. Una credencial
de tipus base de dades sense cap base de dades amb el seu nom encara es troba al pas 2.

Una base de dades i una credencial poden compartir un nom, com fa l'actualització. Guanya la base de dades: apunta-la a una altra credencial i tots els
formularis que donen aquest nom la segueixen, que és com un formulari passa a un altre servidor sense editar-lo.

---

## Les formes del dbConfig

Les tres formes que `dbConfig` sempre ha acceptat continuen funcionant, i cada nom es busca com s'ha descrit més amunt.

| `dbConfig` | Exemple | Què fa |
|---|---|---|
| Un nom | `dbConfig: cmdb` | Consulta aquesta base de dades |
| Una llista de noms | `dbConfig: [cmdb-eu, cmdb-us]` | Executa la consulta a cadascuna i n'uneix els resultats; els duplicats no s'eliminen |
| Un objecte (antic) | `dbConfig: { name: cmdb, type: mysql }` | Consulta la base de dades o la credencial `name`; obsolet, fes servir només el nom |

Una referència a un [magatzem de secrets](../secret-stores/#inline-without-a-credential-row), com ara `dbConfig: secret:vault:secret/cmdb/db`, no és
cap nom de base de dades ni de credencial, i encara es llegeix del magatzem com abans.

---

## Quins formularis consulten una base de dades

L'aplicació llegeix els formularis per saber quins consulten cada base de dades.

La columna **Usat per** de [la pàgina de bases de dades](list.html) els compta, i la pestanya **Usat per** de
[la pàgina d'una base de dades](database-page.html#used-by) els llista amb els seus camps. Un camp que nomena la credencial de la base de dades
també compta. Reanomena una base de dades només després de canviar els formularis que en donen el nom antic.
