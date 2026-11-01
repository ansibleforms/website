---
layout: default
title: "La página de una base de datos"
parent: Bases de datos
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# La página de una base de datos
{: .no_toc }

Sus pestañas, los formularios que la consultan, probarla y eliminarla
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pestañas

La página de una base de datos muestra los pasos de su diálogo como pestañas, más los formularios que la consultan:

| Pestaña | Qué contiene |
|---|---|
| Detalles | El **Nombre**, el que da el `dbConfig` de un campo, y la **Descripción** |
| Credenciales | La **Credencial** con la que se conecta, una credencial de Conexiones > Credenciales de tipo **Base de datos**, que contiene su tipo de base de datos, host, puerto, base de datos, TLS y acceso |
| Usado por | Los formularios que la consultan, con el recuento en la pestaña, consulta [Usado por](#used-by) |

Cada pestaña tiene su propia dirección, como `/settings/databases/<id>/used-by`, así que un enlace o un marcador la abre. La búsqueda de
la línea del título filtra todas las pestañas a la vez.

En la pestaña **Credenciales**, **Añadir credencial** crea una credencial nueva de tipo **Base de datos** y la elige. Una contraseña no se vuelve
a mostrar una vez guardada: cámbiala en la credencial.

---

## Usado por

La pestaña **Usado por** lista los formularios cuyos campos consultan la base de datos, tal como la aplicación los lee de los formularios.

| Columna | Qué muestra |
|---|---|
| Formulario | El formulario; una fila lo abre |
| Descripción | La descripción del formulario |
| Campo | Los campos de ese formulario cuyo `dbConfig` nombra la base de datos |

Un campo cuenta cuando su `dbConfig` nombra la base de datos, o nombra su credencial, como hace un formulario escrito antes de la 7.5.0.
Ambos se conectan con la misma credencial, así que ambos se listan. Cuando no hay ninguno, la pestaña dice **Ningún formulario consulta esta base de datos.**

---

## Probar conexión y Eliminar

Los botones de arriba a la derecha actúan sobre la base de datos tal como está guardada.

**Probar conexión** se conecta con su credencial y ejecuta la consulta mínima de su tipo de base de datos, y lo dice en un mensaje,
**Conexión &lt;name&gt; correcta**, o por qué ha fallado. Es la misma prueba que el **Probar conexión** de la propia credencial.

**Eliminar** pregunta primero, y después elimina la base de datos y vuelve a la lista. Su credencial se queda en **Conexiones > Credenciales**.
Junto a ellos, **Guardar** guarda las pestañas Detalles y Credenciales.
