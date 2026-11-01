---
layout: default
title: Bases de datos en los formularios
parent: Bases de datos
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Bases de datos en los formularios
{: .no_toc }

Cómo el dbConfig de un campo nombra una base de datos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nombrar una base de datos

Un campo con una `query` la ejecuta en la base de datos que nombra su `dbConfig`.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Desde la 7.5.0 el nombre se busca en este orden:

| Orden | El nombre es | La consulta se conecta con |
|---|---|---|
| 1 | Una base de datos de **Conexiones > Bases de datos** | La credencial que nombra esa base de datos |
| 2 | Si no, una credencial de tipo **Base de datos** de **Conexiones > Credenciales** | Esa credencial, como antes de la 7.5.0 |

El tipo de base de datos (MySQL, MSSQL, PostgreSQL, Oracle o MongoDB) viene de la credencial, así que el formulario nunca lo indica. Una
credencial sin tipo se lee como MySQL.

---

## Formularios escritos antes de la 7.5.0

Todo formulario que nombraba una credencial en `dbConfig` sigue funcionando, sin ningún cambio.

La [actualización a la 7.5.0](../databases.html#upgrading-to-750) crea una base de datos para cada credencial de base de datos, con el mismo nombre
y que se conecta con esa credencial, así que el nombre que da un formulario encuentra ahora primero la base de datos, que lleva al mismo acceso.
Una credencial de tipo base de datos sin una base de datos con su nombre se sigue encontrando en el paso 2.

Una base de datos y una credencial pueden compartir nombre, como hace la actualización. Gana la base de datos: apúntala a otra credencial y
todos los formularios que dan ese nombre la siguen, que es como un formulario pasa a otro servidor sin editarlo.

---

## Las formas de dbConfig

Las tres formas que `dbConfig` ha aceptado siempre siguen funcionando, y cada nombre se busca como arriba.

| `dbConfig` | Ejemplo | Qué hace |
|---|---|---|
| Un nombre | `dbConfig: cmdb` | Consulta esa base de datos |
| Una lista de nombres | `dbConfig: [cmdb-eu, cmdb-us]` | Ejecuta la consulta en cada una y une los resultados; los duplicados no se eliminan |
| Un objeto (heredado) | `dbConfig: { name: cmdb, type: mysql }` | Consulta la base de datos o la credencial `name`; obsoleto, usa solo el nombre |

Una referencia a un [almacén de secretos](../secret-stores/#inline-without-a-credential-row), como `dbConfig: secret:vault:secret/cmdb/db`, no es
el nombre de una base de datos ni de una credencial, y se sigue leyendo del almacén como antes.

---

## Qué formularios consultan una base de datos

La aplicación lee los formularios para saber cuáles consultan cada base de datos.

La columna **Usado por** de [la página de bases de datos](list.html) los cuenta, y la pestaña **Usado por** de
[la página de una base de datos](database-page.html#used-by) los lista con sus campos. Un campo que nombra en su lugar la credencial de la base de datos
también cuenta. Renombra una base de datos solo después de cambiar los formularios que dan su nombre antiguo.
