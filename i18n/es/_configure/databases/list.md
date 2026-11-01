---
layout: default
title: La página de bases de datos
parent: Bases de datos
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# La página de bases de datos
{: .no_toc }

La lista de bases de datos, sus columnas y el diálogo que añade una
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

La página de **Conexiones > Bases de datos** lista todas las bases de datos con estas columnas:

| Columna | Significado |
|---|---|
| Nombre | Cómo la nombran los formularios, con `dbConfig: <name>` |
| Descripción | Para qué sirve |
| Tipo de base de datos | El de su credencial: MySQL, MSSQL, PostgreSQL, Oracle o MongoDB |
| Base de datos | La base de datos que abre su credencial |

**Columnas** añade dos más, ocultas por defecto: **Host**, dónde se conecta su credencial, con su puerto cuando lo tiene, y **Usado por**,
cuántos formularios la consultan, por su nombre o por el de su credencial (consulta [Usado por](database-page.html#used-by)).

El tipo de base de datos, la base de datos y el host se leen de la credencial: cámbialos en la credencial, en
**Conexiones > Credenciales**. Ninguna columna muestra un usuario ni una contraseña.

---

## Añadir una base de datos

**Añadir base de datos** abre un diálogo en dos pasos, como el de un runner.

| Paso | Campos |
|---|---|
| Base de datos | **Nombre** y **Descripción**. El nombre es obligatorio y único |
| Credenciales | **Credencial**, obligatoria: una credencial de tipo **Base de datos**. Solo se ofrecen esas |

En el paso **Credenciales**, **Añadir credencial** abre el diálogo de una credencial nueva de tipo **Base de datos** (consulta
[La página de credenciales](../credentials/list.html)) y la elige una vez guardada, así que una base de datos y su acceso se pueden añadir de una vez.

---

## El menú de la fila

Una fila abre la página propia de la base de datos, y su menú ofrece:

| Acción | Qué hace |
|---|---|
| Editar | Abre su página |
| Probar conexión | Se conecta con su credencial, ejecuta la consulta mínima de su tipo de base de datos, y dice si ha funcionado |
| Eliminar | Elimina la base de datos, tras una confirmación. Su credencial se queda |

Eliminar una base de datos que los formularios todavía nombran hace que sus consultas fallen, salvo que quede una credencial del mismo nombre
a la que recurrir (consulta [Bases de datos en los formularios](in-forms.html)). Revisa antes su pestaña **Usado por**.
