---
layout: default
title: Traer cambios
parent: Repositorios git
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Traer cambios
{: .no_toc }

Pulls programados, manuales y por API, y cambios locales
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Traer cambios

Se hace pull de un repositorio según su programación, al iniciar, desde la página o a través de la API; no hay endpoint de webhook.

| Disparador | Cómo |
|---|---|
| Programación | **Activar el pull programado** y una **Programación del pull**, por ejemplo `0 * * * *` para cada hora |
| Inicio | **Hacer pull al iniciar la aplicación** clona el repositorio, o hace pull cuando ya está clonado |
| Página de configuración | **Pull** en el menú de la fila, o **Pull de todos** encima de la lista |
| Diseñador | **Cargar (repositorio)**, que hace pull de los repositorios de formularios y recarga el diseñador; tomar el bloqueo del diseñador también hace antes pull de todos los repositorios de formularios |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` o `showConnectionsSettings`) o `POST /api/v2/forms-repos/pull/<name>` (ver abajo) |

### Pull desde un pipeline o un webhook

AnsibleForms no tiene un receptor de webhooks propio, pero un job de CI o un webhook del servidor git puede llamar al endpoint de pull.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Crea el token como se describe en [Tokens de API](../profile/api-token.html), para un usuario cuyo rol tenga `showSettings` o
`showConnectionsSettings`. `/api/v2/forms-repos/pull/<name>` necesita en cambio `showDesigner` y `allowFormDesign`, con el diseñador
activado ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` devuelve
`head`, `status` y `output`, para que un pipeline pueda comprobar qué commit ejecuta la instancia tras un pull.

### Cambios locales

Un pull nunca sobrescribe trabajo que aún no se ha enviado, así que un pull programado comprueba el árbol de trabajo antes de ejecutarse.

Un pull programado se omite mientras el árbol de trabajo tiene cambios sin commit o commits sin enviar, y mientras un diseñador
tiene el bloqueo del diseñador. Un pull manual de un árbol de trabajo con cambios en conflicto falla con:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Haz push de los cambios, o descártalos con **Restablecer** en el menú de la fila, que borra el árbol de trabajo y lo vuelve a clonar.
