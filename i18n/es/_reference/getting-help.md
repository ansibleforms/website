---
layout: default
title: Obtener ayuda
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Obtener ayuda
{: .no_toc }

Dónde hacer una pregunta, informar de un error o de un problema de seguridad, y proponer una mejora
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Antes de preguntar

La mayoría de las respuestas ya están escritas; un vistazo rápido suele ahorrar un ida y vuelta:

1. Busca en este sitio con el cuadro de búsqueda de la parte superior de cada página.
2. Busca el mensaje de error exacto en [Resolución de problemas](troubleshooting.html) y echa un vistazo a las [preguntas frecuentes](faq.html).
3. Revisa el registro del servidor (**Configuración** y luego **Registro del servidor**) y la página **Estado**, que informan de la mayoría de los problemas de configuración.
4. Consulta el [Changelog](changelog.html): puede que el problema ya esté corregido en una versión más reciente.

---

## Adónde ir

Cada tipo de petición tiene su propio sitio, todos en GitHub:

| Quieres | Ve a |
|---|---|
| Hacer una pregunta o compartir una idea | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Informar de un error | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Proponer una funcionalidad | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Informar de un problema de seguridad | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), en privado |
| Corregir o mejorar esta documentación | **Editar esta página en GitHub** al pie de cualquier página, o una [issue en el sitio web](https://github.com/ansibleforms/website/issues) |

---

## Informar de un error

Un informe que se puede reproducir se corrige antes. La plantilla de informe de error pide lo siguiente:

* **Versión** : se muestra en **Acerca de**, en el menú de ayuda (**?**) de la barra superior
* **Despliegue** : Docker, Docker Compose, Kubernetes, el instalador (y su motor), una instalación nativa o desde el código fuente
* **Pasos para reproducirlo** : qué hiciste, qué esperabas y qué pasó en su lugar
* **Pruebas** : las líneas relevantes del registro del servidor, y una captura de pantalla cuando el problema es visible

Para un problema con un formulario, incluye una definición mínima del formulario que lo muestre. Quita contraseñas, tokens,
nombres de host y cualquier otro dato privado de los registros y formularios antes de publicarlos: las issues y las discusiones son públicas.

---

## Informar de un problema de seguridad

**Nunca abras una issue pública para ello:** usa [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), que solo ven los mantenedores.

La [política de seguridad](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) indica las versiones con soporte y
qué ocurre después de tu informe.
