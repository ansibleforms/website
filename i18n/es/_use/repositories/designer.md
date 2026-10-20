---
layout: default
title: Diseñador y push
parent: Repositorios git
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Diseñador y push
{: .no_toc }

Edita formularios en el diseñador y haz push de ellos al repositorio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Editar y hacer push desde el diseñador

Con un repositorio usado para formularios, el diseñador edita los archivos de su árbol de trabajo y los envía de vuelta al remoto.

| Botón | Qué hace |
|---|---|
| **Guardar (local)** | Escribe los formularios y `config.yaml` en los árboles de trabajo, sin hacer commit |
| **Guardar (repositorio)** | Hace commit y push de los cambios guardados; activo cuando hay cambios sin enviar |
| **Cargar (repositorio)** | Hace pull de los repositorios de formularios y recarga el diseñador, tras una confirmación si hay ediciones sin guardar |

Los formularios se quedan en su repositorio; los nuevos esperan, ya utilizables, en [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) hasta que haces push.
Un formulario guardado en una subcarpeta conserva su ruta relativa: `team/deploy.yaml` se envía a `team/deploy.yaml` bajo la carpeta de formularios
del repositorio. Un formulario nuevo cuya ruta ya existe allí no se sobrescribe; se queda en staging, así que cámbiale el nombre.
Con varios repositorios de formularios, **Guardar (repositorio)** y **Cargar (repositorio)** preguntan cuál, con el de `config.yaml` por defecto.

Un push prepara todos los cambios, hace commit como `AnsibleForms` con el mensaje `Forms sync by <user>`, y luego hace fetch, rebase sobre
el remoto y push, con hasta cinco reintentos. Un conflicto de rebase se aborta y se listan los archivos en conflicto;
corrígelos en el remoto, o usa **Restablecer** en la página Repositorios. **Push** en la página Repositorios hace lo mismo.

Cuando un único repositorio de formularios se clona vacío, AnsibleForms copia el `config.yaml` local y los formularios en su árbol de
trabajo, para que un push (**Guardar (repositorio)**, o **Push** en la página Repositorios) los publique. Hay más sobre el diseñador en [Diseñador y git](../gui/designer-and-git.html).
