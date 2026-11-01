---
layout: default
title: Semilla de configuración
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 8f8eb798f4ada177abf5210049a523f7f2f4265b
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

Define `CONFIG_SEED_PATH` con un archivo YAML y AnsibleForms lo aplica al arrancar. El archivo
declara objetos que antes solo existían en la base de datos:

| Sección                 | Qué declara                                                    |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Dónde se ejecutan los trabajos: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Almacenes de secretos (HashiCorp Vault, ...)                                |
| `credentials`           | Credenciales                                                         |
| `databases`             | Las bases de datos que consultan los formularios, cada una con su credencial, desde la 7.5.0 |
| `oauth2`                | Proveedores SSO: Entra ID y OIDC                                    |
| `repositories`          | Repositorios git                                                    |
| `syslog_servers`        | Los servidores syslog que reciben el log del servidor y las entradas de auditoría    |
| `notification_channels` | Servidores de correo, Slack, Teams, Telegram y webhooks para notificaciones |
| `labels`                | Las etiquetas junto al logotipo de la cabecera, desde la 7.3.0                      |
| `ldap`                  | La configuración de LDAP                                              |
| `settings`              | La URL pública y los ajustes de correo que se usan cuando no hay ningún canal de correo activo |
| `chat`                  | El proveedor de modelos del asistente de chat                                 |
| `awx`                   | Obsoleta desde la 7, eliminada en la 8: usa `runners` con `type: awx`    |

Una semilla escrita antes de la 7 sigue funcionando: cada elemento de su sección `awx` se aplica como un runner de tipo `awx`, y el log
avisa en cada aplicación. Mueve esos elementos a `runners` con `type: awx` antes de actualizar a la 8.

La semilla **no** es lo mismo que `config.yaml`, que contiene las categorías, los roles y las constantes
y tiene su propio `CONFIG_PATH`. Las dos se mantienen separadas a propósito: el
repositorio que *contiene* `config.yaml` es uno de los objetos que declara la semilla, así que la semilla
no puede estar dentro de él.

Los usuarios y los grupos quedan fuera: vienen de LDAP o SSO, y el primer admin de `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

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
