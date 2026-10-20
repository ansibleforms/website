---
layout: default
title: Un usuario local
parent: Usuarios y grupos
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Un usuario local
{: .no_toc }

Añadir un usuario local, y las pestañas de su página
{: .fs-6 .fw-300 }

**Agregar usuario** abre un asistente de tres pasos: **Usuario** (nombre de usuario, descripción, correo), **Contraseña** y **Grupo**.

La página de un usuario, `/settings/users/<id>`, tiene estas pestañas:

| Pestaña | Qué muestra |
|---|---|
| **Detalles** | El interruptor **Permitir inicio de sesión**, el nombre de usuario, la descripción, el correo y, desde la 7.3.0, el **Último inicio de sesión** |
| **Grupos** | Los grupos a los que pertenece el usuario |
| **Roles** | Los roles que tiene el usuario y qué le da cada uno: **Directamente**, **A través de** un grupo, o **Todos** |
| **Formularios** | Los formularios que abren esos roles |
| **Trabajos** | Los trabajos que lanzó el usuario, del más reciente al más antiguo |
| **Trabajos almacenados** | Los valores de formulario que el usuario guardó para volver a ejecutarlos |
| **Programaciones** | Los trabajos que el usuario planificó con Ejecutar más tarde |
| **Actividad** | Lo que el log de auditoría registró que hizo el usuario |
| **Tokens de API** | Los tokens de API del usuario, con cuándo se creó, cuándo caduca y cuándo se usó por última vez cada uno; **Revocar** termina uno al instante |

Desde la 7.3.0 los inicios de sesión de un usuario local se registran, como ya pasaba con los de un usuario LDAP o SSO: **Último inicio de sesión** muestra el más reciente, y
la lista de usuarios tiene una columna **Último inicio de sesión** ordenable para todos los orígenes, así que una cuenta que nadie usa salta a la vista. Un inicio de sesión rechazado no
se registra, y un usuario local que no ha iniciado sesión desde la actualización muestra `–`.

**Cambiar contraseña** y **Eliminar** están arriba a la derecha. El usuario `admin` nunca se puede eliminar ni renombrar.
