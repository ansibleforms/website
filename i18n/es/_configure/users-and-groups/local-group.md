---
layout: default
title: Un grupo local
parent: Usuarios y grupos
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Un grupo local
{: .no_toc }

La página de un grupo local y sus pestañas
{: .fs-6 .fw-300 }

Desde la 7.8.0, **Agregar grupo** abre el asistente **Nuevo grupo** en tres pasos: **Detalles** (el nombre y la descripción), **Usuarios** (los
usuarios locales que se ponen en el grupo) y **Roles** (los roles que se le dan, para que sus usuarios los tengan). Solo el nombre es obligatorio. **Guardar**, en el
último paso, crea el grupo, luego añade los usuarios y da los roles: lo que falla se nombra en un mensaje, y el grupo se queda.

La página de un grupo, `/settings/groups/<id>`, tiene estas pestañas:

| Pestaña | Qué muestra |
|---|---|
| **Detalles** | El nombre y la descripción |
| **Usuarios** | Los usuarios del grupo; **Agregar usuario** añade uno, el menú de una fila o las casillas quitan uno |
| **Roles** | Los roles que nombran al grupo |
| **Formularios** | Los formularios que abren esos roles |

Un grupo con usuarios no se puede eliminar: quita antes sus usuarios. El grupo `admins` nunca se puede eliminar ni renombrar.
