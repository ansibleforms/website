---
layout: default
title: La pàgina de bases de dades
parent: Bases de dades
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# La pàgina de bases de dades
{: .no_toc }

La llista de bases de dades, les columnes i el diàleg per afegir-ne
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La llista

La pàgina de **Connexions > Bases de dades** llista totes les bases de dades amb aquestes columnes:

| Columna | Significat |
|---|---|
| Nom | Com la nomenen els formularis, amb `dbConfig: <name>` |
| Descripció | Per a què serveix |
| Tipus de base de dades | El de la seva credencial: MySQL, MSSQL, PostgreSQL, Oracle o MongoDB |
| Base de dades | La base de dades que obre la seva credencial |

**Columnes** n'afegeix dues més, desactivades per defecte: **Amfitrió**, on es connecta la seva credencial, amb el port quan en té, i **Usat per**,
quants formularis la consulten, pel seu nom o pel de la seva credencial (vegeu [Usat per](database-page.html#used-by)).

El tipus de base de dades, la base de dades i l'amfitrió es llegeixen de la credencial: canvia'ls a la credencial, a
**Connexions > Credencials**. Cap columna no mostra un usuari ni una contrasenya.

---

## Afegir una base de dades

**Afegeix base de dades** obre un diàleg en dos passos, com el d'un runner.

| Pas | Camps |
|---|---|
| Base de dades | **Nom** i **Descripció**. El nom és obligatori i únic |
| Credencials | **Credencial**, obligatòria: una credencial de tipus **Base de dades**. Només s'ofereixen aquestes |

Al pas **Credencials**, **Afegeix una credencial** obre el diàleg d'una credencial nova de tipus **Base de dades** (vegeu
[La pàgina de credencials](../credentials/list.html)) i la tria un cop desada, de manera que una base de dades i el seu accés es poden afegir d'una vegada.

---

## El menú de la fila

Una fila obre la pàgina pròpia de la base de dades, i el seu menú ofereix:

| Acció | Què fa |
|---|---|
| Edita | Obre la seva pàgina |
| Prova la connexió | Es connecta amb la seva credencial i executa la consulta mínima del seu tipus de base de dades, i diu si ha funcionat |
| Suprimeix | Suprimeix la base de dades, després d'una confirmació. La seva credencial es queda |

Suprimir una base de dades que els formularis encara nomenen fa fallar les seves consultes, tret que quedi una credencial del mateix nom a la qual
puguin recórrer (vegeu [Bases de dades als formularis](in-forms.html)). Comprova primer la seva pestanya **Usat per**.
