---
layout: default
title: Bases de datos
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Bases de datos
{: .no_toc }

Las bases de datos que consultan los formularios, con su credencial
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: nombra las bases de datos que consultan tus formularios, elige la credencial con la que se conecta cada una, y pruébalas.

---

## En esta sección

| Página | Qué trata |
|---|---|
| [La página de bases de datos](databases/list.html) | La lista de bases de datos, sus columnas y el diálogo que añade una |
| [La página de una base de datos](databases/database-page.html) | Las pestañas de una base de datos, los formularios que la consultan, Probar conexión y Eliminar |
| [Bases de datos en los formularios](databases/in-forms.html) | Cómo el `dbConfig` de un campo nombra una base de datos, y los formularios escritos antes de la 7.5.0 |

---

## Cómo funciona

Desde la 7.5.0 una **base de datos** es una conexión propia, que se añade en **Conexiones > Bases de datos**, entre **Almacenes de secretos** y **Runners**.
Tiene tres cosas:

| Campo | Qué es |
|---|---|
| Nombre | El nombre que da el `dbConfig` de un campo para consultarla, como `cmdb` |
| Descripción | Para qué sirve |
| Credencial | La credencial de [Conexiones > Credenciales](credentials.html), de tipo **Base de datos**, con la que se conecta |

La credencial guarda todo lo relativo a la conexión, como antes: el tipo de base de datos (MySQL, MSSQL, PostgreSQL, Oracle o MongoDB),
el host y el puerto, el nombre de la base de datos, TLS, y el usuario y la contraseña, guardados cifrados o leídos de un [almacén de secretos](secret-stores/).
Una base de datos no tiene dirección ni secreto propios, así que una base de datos y un runner eligen su credencial de la misma manera.

Un campo consulta una base de datos nombrándola en `dbConfig`:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Un nombre que no es una base de datos se busca como una credencial de tipo base de datos, como antes de la 7.5.0, así que los formularios
antiguos siguen funcionando sin cambios (consulta [Bases de datos en los formularios](databases/in-forms.html)).

---

## Actualizar a la 7.5.0

La actualización rellena **Conexiones > Bases de datos** una sola vez, así que tus formularios siguen funcionando sin ningún cambio.

Crea una base de datos para cada credencial de tipo base de datos, con el nombre y la descripción de la credencial, que se conecta con esa
credencial. Un formulario cuyo `dbConfig` nombra la credencial encuentra ahora la base de datos del mismo nombre, que se conecta con la misma
credencial: el resultado es el mismo. Las credenciales conservan todos sus campos.

La actualización se ejecuta una sola vez: una base de datos eliminada después no se vuelve a crear, y una credencial de base de datos añadida
más tarde no recibe ninguna base de datos hasta que añadas una.

---

## Credenciales en uso

Una credencial con la que se conecta una base de datos está en uso, como una con la que inicia sesión un runner.

No se puede eliminar ni renombrar mientras una base de datos la nombre, y la pestaña **Usado por** de su página lista las bases de datos (consulta
[Credenciales en uso](credentials.html#credentials-in-use)). Eliminar una base de datos deja su credencial tal como está.

---

## Quién gestiona las bases de datos

Las bases de datos siguen las opciones de rol de las credenciales que nombran.

La lista, la página de una base de datos y su API necesitan la opción de rol `showSettings` o `showConnectionsSettings`, como las credenciales.
Solo un admin puede hacer que una base de datos se conecte con una credencial que solo un admin puede nombrar, como una que lee su contraseña
de un almacén de secretos (consulta [Quién puede cambiar una credencial](credentials.html#who-may-change-a-credential)): los formularios que la
consultan se conectarían con esa credencial, y **Probar conexión** enviaría su secreto a su servidor. Otro usuario puede guardar de nuevo una
base de datos con la credencial que ya nombra.

Una base de datos declarada en la [semilla de configuración](seed/) es de solo lectura en su página: cámbiala en el archivo de la semilla.

---

## La semilla de configuración

Una semilla declara sus bases de datos en una sección `databases:`, después de las credenciales que nombran.

Cada entrada tiene un `name`, una `credential` de tipo base de datos y, opcionalmente, una `description`. La credencial puede venir de la
sección `credentials` de la misma semilla o ser una creada en la aplicación:

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

Consulta el [ejemplo](seed/example.html) completo y [Objetos gestionados](seed/managed-objects.html) para ver cómo la semilla se adueña de lo que declara.

---

## La API REST

Los scripts gestionan las bases de datos mediante la [API REST](api/), en `/api/v2/database`, con las mismas opciones de rol que la página.

| Llamada | Qué hace |
|---|---|
| `GET /api/v2/database` | Lista las bases de datos, cada una con el tipo de base de datos, la base de datos, el host y el puerto de su credencial, y cuántos formularios la consultan (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Obtiene la base de datos con ese nombre |
| `GET /api/v2/database/<id>` | Obtiene una base de datos |
| `POST /api/v2/database` | Añade una base de datos: su `name`, su `credential` y, opcionalmente, su `description` |
| `PUT /api/v2/database/<id>` | Cambia una base de datos |
| `DELETE /api/v2/database/<id>` | Elimina una base de datos; su credencial se queda |
| `POST /api/v2/database/<id>/check` | Prueba su conexión, con su credencial |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Una `credential` que no existe, o que no es de tipo base de datos, se rechaza con `400`. Cada cambio se escribe en el log de auditoría.
