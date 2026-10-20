---
layout: default
title: API REST
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# API REST
{: .no_toc }

Lanza formularios y gestiona AnsibleForms desde scripts
{: .fs-6 .fw-300 }

---

Para desarrolladores e ingenieros de automatización: lanza formularios y gestiona AnsibleForms desde scripts.

Todo lo que hace la interfaz web pasa por la API REST, así que los scripts y otras herramientas pueden hacer lo mismo.

---

## Visión general

La API se sirve bajo `/api/v2` en el servidor de AnsibleForms:

* **Referencia completa** : estas páginas cubren lo que más usan los scripts. Cada endpoint se describe, y se puede probar, en la
  página Swagger integrada del servidor, `https://<your server>/api/v2/docs`.
* **Permisos** : una llamada se ejecuta como el usuario cuyo token lleva, con los roles de ese usuario, igual que en el navegador.
* **Validación del lanzamiento** : los trabajos lanzados a través de la API se pueden comprobar como los lanzamientos desde el navegador
  (consulta [Validación del lanzamiento](../launch-validation/)).
* **Límites de peticiones** : solo están limitados los endpoints de inicio de sesión, cierre de sesión, renovación del token e inicio de sesión único, el cambio de
  contraseña (`PUT /api/v2/profile`) y los endpoints de tokens de API (`POST` y `DELETE /api/v2/profile/tokens`) (consulta
  [Autenticación](authentication.html)). Las demás llamadas no tienen límite de peticiones (el [asistente de chat](../chat/) tiene límites
  propios), así que un script debería dosificar sus llamadas, por ejemplo cuando sigue un trabajo.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Autenticación](authentication.html) | Iniciar sesión, renovar el token o usar un token de larga duración |
| [Trabajos](jobs.html) | Lanzar un formulario, seguir el trabajo, abortarlo, relanzarlo o aprobarlo |
| [Respuestas y errores](responses.html) | La forma de una respuesta y los códigos de estado |
| [Eventos en directo](events.html) | Enterarse de cuándo cambian los trabajos y los ajustes, en lugar de consultar periódicamente |
