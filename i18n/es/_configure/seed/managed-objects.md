---
layout: default
title: Objetos gestionados
parent: Semilla de configuración
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Objetos gestionados
{: .no_toc }

Cómo la semilla se hace dueña de los objetos que lista y cómo mantiene fuera los secretos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Las secciones de una sola fila son todo o nada

`ldap`, `settings` y `chat` son **una sola fila** cada una, así que la semilla debe declarar todos sus campos; las demás secciones son listas.

Una semilla que omite un campo se niega a arrancar y lo nombra:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Declara un valor vacío de forma explícita con `""` o `false`. Unos pocos campos son opcionales, y uno que se omite se deja sin cambios:

| Sección | Campos opcionales |
|---|---|
| `ldap` | `description`, `credential` (una credencial con la que hacer bind) y `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` y `extra_headers` |
| `settings` | Ninguno |

`settings` cubre solo los campos de correo y la URL; el resto de ajustes siguen siendo editables.

---

## El archivo no contiene secretos

Cada `${VARIABLE}` se sustituye por esa variable de entorno (en Kubernetes, desde un `Secret`), así que el archivo puede estar en Git.

Una variable que no está definida es un **error fatal**, así que un marcador nunca puede acabar guardado como contraseña.

Las credenciales también pueden usar un [almacén de secretos](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` desaparece en la 8.

---

## Objetos gestionados

Un objeto que viene de la semilla se marca como **gestionado**:

- Se impone en **cada** arranque, así que el archivo sigue siendo la referencia.
- Es de solo lectura: la API responde **403**, la interfaz desactiva Editar y Eliminar, y su propia página indica que viene del archivo de
  semilla de configuración y es de solo lectura.
- Solo la semilla puede poner o quitar la marca.

Los objetos creados a mano **nunca se tocan**, salvo que la semilla declare el mismo nombre. Ese registro se **adopta** entonces:
los campos declarados se imponen y pasa a ser de solo lectura. La adopción se registra como aviso y en el rastro de auditoría.

Aplicar la semilla es idempotente: los registros que ya coinciden no se tocan, así que un reinicio normalmente informa de `0 updated`.

Un repositorio declarado al que le falta el árbol de trabajo se **vuelve a clonar** en cada arranque, así que un primer clonado fallido
se reintenta. La fila *Repositorios* de la página Estado muestra cualquier repositorio sin árbol de trabajo.

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

Quitar `CONFIG_SEED_PATH` **no** libera nada: la semilla deja de aplicarse, y los registros que gestionaba siguen gestionados
y de solo lectura. Para volver a editarlos, libéralos primero: apunta `CONFIG_SEED_PATH` a un archivo sin ellos (un archivo vacío no declara
nada y libera todos los registros), deja que se aplique en un arranque o una recarga, y después quita la variable. Los registros liberados se quedan como
están y pasan a ser editables.
