---
layout: default
title: Objetos gestionados
parent: Semilla de configuración
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Objetos gestionados
{: .no_toc }

Cómo la semilla se hace dueña de los objetos que lista y cómo mantiene fuera los secretos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Las secciones de una sola fila son todo o nada

`ldap`, `settings` y `chat_assistant` (`chat` antes de la 7.8.0) son **una sola fila** cada una, así que la semilla debe declarar todos sus campos.

Una semilla que omite un campo se niega a arrancar y lo nombra:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Declara un valor vacío de forma explícita con `""` o `false`. Unos pocos campos son opcionales, y uno que se omite se deja sin cambios:

| Sección | Campos opcionales |
|---|---|
| `ldap` | `description`, `credential` (una credencial con la que hacer bind) y `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, y `credential` desde la 7.8.0 |
| `settings` | Las claves `mail_*`, obsoletas desde la 7.6.0 (consulta [Ejemplo](example.html)) |

`settings` cubre solo la URL y las claves de correo obsoletas; el resto de ajustes siguen siendo editables.

---

## El archivo no contiene secretos

Cada `${VARIABLE}` se sustituye por esa variable de entorno (en Kubernetes, desde un `Secret`), así que el archivo puede estar en Git.

Una variable que no está definida es un **error fatal**, así que un marcador nunca puede acabar guardado como contraseña.

Las credenciales también pueden usar un [almacén de secretos](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` desaparece en la 8.

---

## Objetos gestionados

Un objeto de las secciones de lista (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` y `labels`) o de una sección de una sola fila que viene de la semilla se marca como **gestionado**:

- Se impone en **cada** arranque, así que el archivo sigue siendo la referencia.
- Es de solo lectura: la API responde **403**, la interfaz desactiva Editar y Eliminar, y su propia página indica que viene del archivo de
  semilla de configuración y es de solo lectura.
- Solo la semilla puede poner o quitar la marca.

Los objetos creados a mano **nunca se tocan**, salvo que la semilla declare el mismo nombre. Ese registro se **adopta** entonces:
los campos declarados se imponen y pasa a ser de solo lectura. La adopción se registra como aviso y en el rastro de auditoría.

Aplicar la semilla es idempotente: los registros que ya coinciden no se tocan, así que un reinicio normalmente informa de `0 updated`.

Un repositorio declarado al que le falta el árbol de trabajo se **vuelve a clonar** en cada arranque, así que un primer clonado fallido
se reintenta. La fila *Repositorios* de la página Estado muestra cualquier repositorio sin árbol de trabajo.

Desde la 7.8.0 un [repositorio git](../repositories/) puede contener los mismos tipos de objetos. Un objeto que contiene un repositorio sigue
siendo del repositorio: el elemento de la semilla para él no se aplica, y el log del servidor lo indica. Un repositorio que declara la semilla sigue siendo de la semilla.

### Quitar un objeto

Quitar un objeto del archivo lo **libera**: el registro se queda y vuelve a ser editable. Borrar una sección entera
hace lo mismo.

Añade `prune: true` a una sección de lista para **eliminar** los registros gestionados que el archivo ya no declara:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` nunca elimina un registro creado a mano.

### Desactivar la semilla

Quitar `CONFIG_SEED_PATH` desactiva la semilla: el siguiente arranque libera todos los registros y campos que gestionaba la semilla, como lo
haría una semilla vacía aplicada. Los registros conservan sus valores y vuelven a ser editables, y el log del servidor y el log de auditoría indican qué se liberó.

Un `CONFIG_SEED_PATH` cuyo archivo falta no libera nada: el servidor se niega a arrancar en su lugar, porque un archivo montado puede
simplemente llegar tarde.

---

## Ajustes que declara la semilla

Las secciones añadidas en la 7.8.0 pertenecen a la semilla de forma menos estricta que los objetos gestionados, de dos maneras.

| Secciones | Cómo es dueña de ellas la semilla |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Campo a campo: cada campo declarado es de solo lectura en su página, con un aviso, y la API rechaza cambiarlo (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Se crean o se cambian en cada aplicación, nunca se bloquean ni se eliminan |

Un campo de `defaults`, `logo`, `icon`, `name`, `links` o `mcp` que la semilla ya no declara se libera, y todos se liberan
cuando se desactiva la semilla. Un logotipo o un icono de la semilla no se puede subir ni quitar en la aplicación. Cuando un repositorio contiene la
misma página, la semilla conserva los campos que declara y el repositorio contiene los demás.

Un usuario, un grupo, un anuncio, una versión del aviso legal o la clave SSH y los hosts conocidos de la semilla siguen siendo editables en la
aplicación, y la siguiente aplicación vuelve a escribir los valores de la semilla donde difieren. Quitar un elemento del archivo lo deja en la
aplicación, y `prune` no elimina ninguno de ellos.
