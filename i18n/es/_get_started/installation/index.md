---
layout: default
title: Instalación
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Instalación
{: .no_toc }

Elige un método de instalación para AnsibleForms
{: .fs-6 .fw-300 }

---

Para administradores que montan una instancia nueva: elige un método de instalación y sigue su página.

---

## En esta sección

AnsibleForms admite varios métodos de instalación, cada uno descrito en su propia página:

| Página | Qué cubre |
|---|---|
| [Instalador](installer.html) | Un solo comando que instala un controlador o un Runner en Docker, Podman, Kubernetes o de forma nativa, y después lo actualiza y hace sus copias de seguridad |
| [Nativa](native.html) | La instalación del instalador sin contenedores: Node.js, MariaDB y Ansible en el servidor, AnsibleForms como servicios de systemd |
| [Docker](docker.html) | Instala MySQL y ejecuta la imagen de Docker precompilada con las variables de entorno necesarias |
| [Docker Compose](docker-compose.html) | Descarga el [proyecto de docker-compose](https://github.com/ansibleforms/docker) y usa docker-compose para arrancar MySQL y AnsibleForms |
| [Desde el código fuente](from-source.html) | Instala todas las dependencias a mano, y después compila y arranca el código |
| [Kubernetes](kubernetes.html) | Instala el chart de Helm y usa Kubernetes para arrancar AnsibleForms y su base de datos MySQL |

{: .note }
> **Recomendación** El instalador, desde la 7.3.0, es la forma más rápida de tener una instancia funcionando: monta el proyecto de Docker Compose en
> Docker o Podman, o uno de los otros métodos, a partir de unas pocas preguntas. Las imágenes de Docker incluyen todas las dependencias.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Para pasar una instalación existente a una versión más reciente, consulta [Actualizar](../upgrading/).

Todos los métodos ejecutan un RTE junto a la aplicación, el contenedor (o servicio) que ejecuta los playbooks. Para añadir otro, en otro host o en otro
centro de datos, instala un Runner con el [instalador](installer.html#a-runner): se conecta a AnsibleForms por un único WebSocket (saliente, consulta
[Modos](../rte/modes.html)) y no guarda credenciales de base de datos. Consulta también [Entornos de ejecución](../rte/) y su guía
[Un RTE en otro centro de datos](../rte/another-datacenter.html).

---

## Etiquetas de imagen

La imagen se publica como `ghcr.io/ansibleforms/ansibleforms` en el GitHub Container Registry, que pertenece al
proyecto y no limita las descargas anónimas. Todas las versiones desde la 7.0.0 se publican solo allí, y las versiones 6.x
también están.

Desde la 7, los playbooks se ejecutan en un RTE, publicado en tres capas junto a la aplicación (consulta [Las imágenes del RTE](../rte/images.html)):

| Imagen | Qué es |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | La aplicación web y la API, sin python ni ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | El RTE sin python ni ansible: la base para el tuyo propio |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base con python, ansible-core y unas pocas librerías: la que usar para añadir tus colecciones |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | La core con el paquete `ansible`, sus colecciones y librerías: el RTE predeterminado |

Las cuatro imágenes se construyen en la misma ejecución y llevan las mismas etiquetas, así que la etiqueta de un RTE siempre coincide con la de la aplicación.

El antiguo repositorio de Docker Hub, `ansibleguy/ansibleforms`, ya no se actualiza. Conserva sus
versiones existentes pero no recibe versiones nuevas de ninguna de las dos líneas. Si descargas de él, cambia
a `ghcr.io/ansibleforms/ansibleforms` con la misma etiqueta para seguir recibiendo actualizaciones.

Las siguientes etiquetas están disponibles en cada imagen; las imágenes del RTE empiezan en la 7.0.0, así que no tienen etiquetas 6.x:

| Etiqueta | Apunta a |
|---|---|
| `latest` | la versión más reciente de la versión mayor más reciente |
| `7`, `6` | la versión más reciente de esa versión mayor |
| `7.0`, `6.5` | la versión más reciente de esa versión menor |
| `7.0.0`, `6.5.5` | exactamente esa versión |
| `latest-rc` | la release candidate más reciente, o la versión más reciente cuando es más nueva; cada candidata tiene también su propia etiqueta |

`latest` solo avanza: un parche de una versión mayor anterior (por ejemplo una 6.5.x publicada
después de la 7.0.0) mueve `6` y `6.5`, pero nunca `latest`.

Para quedarte en una versión mayor, usa su número (`6`) en lugar de `latest`.
