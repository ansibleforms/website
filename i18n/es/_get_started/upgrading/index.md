---
layout: default
title: Actualizar
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Actualizar
{: .no_toc }

Pasa AnsibleForms a una release más reciente
{: .fs-6 .fw-300 }

---

Para administradores de una instancia en marcha: pasa a una release más reciente, con el mismo método con el que la instalaste.

---

## En esta sección

El procedimiento de actualización depende de cómo instalaste AnsibleForms. Cada método se describe en su propia página:

| Página | Qué cubre |
|---|---|
| [Actualizar a la v7](../upgrade-7.html) | Qué cambiar cuando todavía estás en la 6.5, antes de pasar a la 7 |
| [Con el instalador](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, para una instalación hecha por el instalador: copia de seguridad, notas de la release y vuelta atrás |
| [Docker](docker.html) | Descarga la nueva imagen y vuelve a crear el contenedor con los mismos ajustes |
| [Docker Compose](docker-compose.html) | Descarga la nueva imagen y reinicia el proyecto docker-compose |
| [Desde el código fuente](from-source.html) | Descarga el nuevo código, vuelve a compilarlo y reinicia la aplicación |
| [Kubernetes](kubernetes.html) | Actualiza el repositorio de charts y ejecuta `helm upgrade` con tus valores |

{: .note }
> **Primero, una copia de seguridad** Haz una copia de seguridad antes de actualizar (**Configuración → Copias de seguridad**). El esquema de la base de datos se actualiza en el primer
> arranque de la nueva release, así que la copia de seguridad es tu punto de vuelta atrás si algo sale mal. Desde la 7.3.0, el worker también hace
> una por sí mismo antes de actualizar desde una release anterior, con el nombre de la release, salvo que
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) sea `0`.

La release que recibes depende de la etiqueta de imagen que ejecutes: `latest` sigue la versión mayor más reciente, mientras que una etiqueta como `7`
se queda en esa versión mayor. Todas las etiquetas aparecen en [Etiquetas de imagen](../installation/#image-tags).
