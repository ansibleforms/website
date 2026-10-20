---
layout: default
title: Administración
parent: Recorrido por la interfaz
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Administración
{: .no_toc }

El menú Configuración: el sistema, su apariencia, el acceso, las conexiones y los registros
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El menú Configuración

**Configuración** en la cabecera abre las páginas de administración, agrupadas en el menú de la izquierda en **Sistema**, **Apariencia**,
**Acceso**, **Conexiones** y **Registros**. Cada entrada solo se muestra a un usuario con la opción de rol que necesita su página:
`allowBackupOps` para **Copias de seguridad**, `showLogs` para **Registro del servidor** y `showSettings` para todas las demás páginas.
Desde la 7.3.0, tres opciones abren una parte de ellas sin el resto:

| Opción de rol | Abre |
|---|---|
| `showAppearanceSettings` | Las páginas de **Apariencia** |
| `showConnectionsSettings` | Las páginas de **Conexiones**, salvo **Syslog**; los repositorios, los almacenes de secretos y las credenciales protegidas solo los puede cambiar un administrador |
| `showAuditLog` | El **Registro de auditoría** |

Consulta [Roles](../config/roles.html#role-options) para ver las opciones de rol.

---

## Listas y páginas de registro

Desde la 7.3.0, las listas de configuración y las páginas de cada registro comparten un mismo diseño, con sus controles en una fila propia bajo el título:

| Parte | Cómo funciona |
|---|---|
| Cuadro de búsqueda | El primero de esa fila en todas las páginas de configuración y de registro. Una palabra filtra todas las pestañas a la vez: los campos, filas o líneas que coinciden se muestran bajo el nombre de su pestaña |
| Tamaño de página | Una tabla muestra tantas filas como caben en la pantalla hasta que se elige un tamaño de página: 10, 20, 50 o 100 |
| Columnas | Todas las columnas con nombre se pueden ordenar, y una celda vacía muestra `–` |
| Casillas | Las filas solo las tienen donde se puede hacer algo con las filas marcadas, y el menú de la fila (⋮) ofrece la misma acción |
| Menú de la fila | Etiquetas cortas, como **Editar** y **Eliminar**. Una lista con una columna **Activado** la tiene en primer lugar, y ofrece **Activar** o **Desactivar** en el menú de cada fila, según corresponda |

Las listas con una columna **Activado** son los proveedores de SSO, los directorios LDAP, los runners, las programaciones, los canales de notificación,
los servidores syslog, los anuncios, las etiquetas y las versiones del aviso legal.

---

## Sistema

La propia instancia: su configuración, su estado de salud y sus copias de seguridad.

| Página | Para qué sirve |
|---|---|
| **General** | Las variables de entorno, en pestañas de Configuración a Registro. Consulta [Variables de entorno](../customization/). |
| **Estado** | La salud de la instancia y de los sistemas de los que depende, en las pestañas Comprobaciones e Información. Consulta [Monitorización](../production/monitoring.html). |
| **Copias de seguridad** | Hacer, restaurar y eliminar copias de seguridad de la base de datos, config.yaml y los formularios. Consulta [Copias de seguridad](../production/backups.html). |

![Configuración > General, la pestaña Configuración](../assets/screenshots/settings.jpg)

### Copias de seguridad

La lista de copias de seguridad, nocturnas y manuales: **Añadir copia de seguridad** hace una en ese momento, y el menú de una fila tiene **Mostrar copia de seguridad**, **Restaurar** y **Eliminar**.

![Configuración > Copias de seguridad](../assets/screenshots/backups.jpg)

### Restaurar

**Restaurar** muestra lo que contiene la copia de seguridad y después la restaura; **Crear una nueva copia de seguridad antes de restaurar (recomendado)** está marcada por defecto.

![Restaurar una copia de seguridad](../assets/screenshots/restore.jpg)

---

## Apariencia

Cómo se ve la instancia para todos, y los mensajes que muestra.

| Página | Para qué sirve |
|---|---|
| **Valores predeterminados** | El tema, el idioma, la vista de formularios, la zona horaria y el formato de fecha de los usuarios que no han elegido ninguno. Consulta [Valores predeterminados](../appearance/defaults.html). |
| **Nombre** | El nombre en la pestaña del navegador y en la página de inicio de sesión. Consulta [Nombre](../appearance/name.html). |
| **Logo** | Tu propio logotipo en la cabecera. Consulta [Logotipo](../appearance/logo.html). |
| **Icono** | Tu propio icono en la pestaña del navegador. Consulta [Icono](../appearance/icon.html). |
| **Enlaces** | El enlace al Diseñador, y tus propios enlaces y menús en la cabecera. Consulta [Enlaces](../appearance/links.html). |
| **Etiquetas** | Etiquetas junto al logotipo, como PRODUCTION y EU. Consulta [Etiquetas](../appearance/labels.html). |
| **Anuncios** | Mensajes bajo la cabecera, cada uno desde su inicio hasta su fin. Consulta [Anuncios](../announcements.html). |

---

## Acceso

Quién puede iniciar sesión y qué puede hacer una vez dentro.

| Página | Para qué sirve |
|---|---|
| **Aviso legal** | Condiciones que cada usuario acepta una vez, y quién aceptó qué versión. Consulta [Aviso legal](../disclaimer.html). |
| **Usuarios** | Los usuarios locales, y los de LDAP y de inicio de sesión único. Consulta [Usuarios y grupos](../users-and-groups.html). |
| **Grupos** | Los grupos locales, y los de LDAP y de inicio de sesión único. Consulta [Usuarios y grupos](../users-and-groups/local-group.html). |
| **Roles** | Los roles de config.yaml: quién los tiene y qué permiten. Consulta [Roles](../config/roles.html). |
| **LDAP** | Inicio de sesión con un directorio LDAP o Active Directory. Consulta [LDAP](../authentication/ldap.html). |
| **SSO** | Inicio de sesión único con proveedores de Entra ID u OpenID Connect. Consulta [Autenticación](../authentication/). |

![Acceso > LDAP, el directorio principal](../assets/screenshots/ldap.jpg)

---

## Conexiones

Los sistemas a los que accede AnsibleForms, y con qué inicia sesión en ellos.

| Página | Para qué sirve |
|---|---|
| **Repositorios** | Los repositorios git de los que vienen los formularios y los playbooks. Consulta [Repositorios git](../repositories/). |
| **Credenciales** | Las cuentas y los secretos que usan los formularios, los playbooks y las conexiones. Consulta [Credenciales](../credentials.html). |
| **Almacenes de secretos** | HashiCorp Vault y CyberArk, de donde se pueden leer las credenciales. Consulta [Almacenes de secretos](../secret-stores/). |
| **Runners** | Dónde se ejecutan los trabajos: contenedores RTE para los playbooks, y AWX y similares para las plantillas. Consulta [Runners](../runners.html). |
| **SSH** | El par de claves con el que la aplicación se conecta a git, y los hosts conocidos. Consulta [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Notificaciones** | Servidores SMTP, Slack, Microsoft Teams, Telegram y webhooks. Consulta [Canales de notificación](../notification-channels.html). |
| **Asistente de chat** | El proveedor de IA del asistente de chat. Consulta [Asistente de chat](../chat/). |
| **MCP** | El servidor MCP para agentes de IA. Consulta [MCP](../mcp/). |
| **Syslog** | Servidores syslog que reciben el registro del servidor, el registro de auditoría o ambos. Consulta [Syslog](../production/logs.html#syslog). |

![Conexiones > Credenciales, la pestaña Conexión de una credencial](../assets/screenshots/credentials.jpg)

---

## Registros

Lo que ha ocurrido en la instancia.

| Página | Para qué sirve |
|---|---|
| **Registro de auditoría** | Quién cambió qué, y si estaba permitido, filtrado por usuario, acción y resultado. Consulta [Pista de auditoría](../production/logs.html#audit-trail). |
| **Registro del servidor** | El propio registro del servidor, para resolver problemas. Consulta [Logs](../production/logs.html). |

### Registro del servidor

Las últimas líneas del registro, las más recientes abajo, que se siguen a medida que se escriben. El cuadro de búsqueda las filtra (una expresión
regular), **Limpiar** vacía la vista, no el registro, y **Descargar** guarda el registro completo.

![Registros > Registro del servidor](../assets/screenshots/logs.jpg)

---

## Documentación de la API

**Documentación de API** en el menú de ayuda (el signo de interrogación de la cabecera) enlaza a la interfaz Swagger de la API REST en `/api/v2/docs`.
Consulta [API](../api/).

![Interfaz Swagger](../assets/screenshots/swagger.jpg)
