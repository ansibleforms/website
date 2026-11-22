---
layout: default
title: Semilla de configuración
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
---

# Semilla de configuración
{: .no_toc }

Declara los objetos de administración en un archivo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores que aprovisionan desde git: declara los objetos de administración en un archivo, para que una instancia se pueda reconstruir sobre una base de datos vacía.

---

## Qué cubre

Define `CONFIG_SEED_PATH` con un archivo YAML y AnsibleForms lo aplica al arrancar. El archivo declara objetos y ajustes que
de otro modo solo existen en la base de datos:

| Sección            | Qué declara                                                                       |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Dónde se ejecutan los trabajos: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`    | Almacenes de secretos (HashiCorp Vault, ...)                                      |
| `credentials`      | Credenciales                                                                      |
| `databases`        | Las bases de datos que consultan los formularios, cada una con su credencial, desde la 7.5.0 |
| `sso`              | Proveedores SSO: Entra ID y OIDC (`oauth2` antes de la 7.8.0)                     |
| `repositories`     | Repositorios git, y lo que la aplicación lee de cada uno                          |
| `syslog`           | Los servidores syslog que reciben el log del servidor y las entradas de auditoría (`syslog_servers` antes de la 7.8.0) |
| `notifications`    | Servidores de correo, Slack, Teams, Telegram y webhooks (`notification_channels` antes de la 7.8.0) |
| `labels`           | Las etiquetas junto al logotipo de la cabecera, desde la 7.3.0                    |
| `ldap`             | La configuración de LDAP                                                          |
| `settings`         | La URL pública; sus claves de correo están obsoletas desde la 7.6.0, en favor de un canal de correo |
| `chat_assistant`   | El proveedor de modelos del asistente de chat (`chat` antes de la 7.8.0)          |
| `users`            | Usuarios, locales y de un directorio, desde la 7.8.0                              |
| `groups`           | Grupos locales y sus miembros, desde la 7.8.0                                     |
| `defaults`         | **Configuración > Apariencia > Valores predeterminados**: tema, idioma, zona horaria, desde la 7.8.0 |
| `logo`, `icon`     | El logotipo y el icono del sitio web, archivos de imagen junto a la semilla, desde la 7.8.0 |
| `name`             | El nombre de la aplicación, desde la 7.8.0                                        |
| `links`            | Los enlaces de la cabecera, y si se muestra el enlace del Designer, desde la 7.8.0 |
| `announcements`    | Los anuncios bajo la cabecera, desde la 7.8.0                                     |
| `disclaimer`       | Las versiones del aviso legal que aceptan los usuarios, desde la 7.8.0            |
| `mcp`              | Los interruptores del servidor MCP, desde la 7.8.0                                |
| `ssh`              | La clave privada SSH de la aplicación y sus hosts conocidos, desde la 7.8.0       |
| `awx`              | Obsoleta desde la 7, eliminada en la 8: usa `runners` con `type: awx`             |

El [Ejemplo](example.html) muestra todas las secciones, y [Objetos gestionados](managed-objects.html) hasta qué punto la semilla es
dueña de lo que declara cada una: la mayoría de las secciones dejan sus objetos en solo lectura en la aplicación, unas pocas solo los crean o los cambian.

Una semilla escrita antes de la 7 sigue funcionando: cada elemento de su sección `awx` se aplica como un runner de tipo `awx`, y el log
avisa en cada aplicación. Mueve esos elementos a `runners` con `type: awx` antes de actualizar a la 8.

La semilla **no** es lo mismo que `config.yaml` (`CONFIG_PATH`), la configuración base de las categorías, los roles y las constantes. Un
repositorio puede contenerlos en su lugar, y ese repositorio es uno de los objetos que declara la semilla, así que la semilla no puede estar dentro de él.

El primer admin sigue viniendo de `ADMIN_USERNAME` / `ADMIN_PASSWORD`, y los usuarios de LDAP o SSO de su directorio al iniciar sesión.
Desde la 7.8.0 las secciones `users` y `groups` pueden añadir usuarios y grupos locales, y bloquear a un usuario de directorio antes de que inicie sesión.

---

## Secciones renombradas

Desde la 7.8.0 cuatro secciones se llaman como las claves bajo las que un [repositorio git](../repositories/) guarda los mismos objetos,
sin `controller_` (`sso:` para `controller_sso:`):

| Antes de la 7.8.0         | Desde la 7.8.0     |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Sus elementos no cambian. Los nombres antiguos se siguen leyendo, obsoletos desde la 7.8.0 y eliminados en la 8: cada uno que se aplica
registra un aviso en el log del servidor, con el nombre nuevo. Una semilla que da una sección con sus dos nombres se rechaza. Renómbralas
en el archivo antes de actualizar a la 8.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Ejemplo](example.html) | Un archivo de semilla completo, sección por sección |
| [Objetos gestionados](managed-objects.html) | Cómo la semilla se hace dueña de los objetos que lista y cómo mantiene fuera los secretos |
| [Recarga y arranque](reloading.html) | Cambia el archivo sin reiniciar, y qué pasa al arrancar |
| [Kubernetes](kubernetes.html) | Aprovisiona AnsibleForms desde un ConfigMap y Secrets |
| [Edición y auditoría](environment-and-audit.html) | Bloquea las páginas de ajustes, y qué registra el log de auditoría |
