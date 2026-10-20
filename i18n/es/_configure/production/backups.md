---
layout: default
title: Copias de seguridad
parent: En producción
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Copias de seguridad
{: .no_toc }

Copias nocturnas, qué contienen, cómo restaurarlas y qué más conviene guardar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Copias nocturnas

AnsibleForms hace una copia de seguridad de sí mismo cada noche a medianoche, en la zona horaria de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(UTC por defecto). Estos ajustes la controlan:

| Variable | Valor predeterminado | Significado |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Dónde se escriben las copias, cada una en una carpeta con su marca de tiempo |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Cuántas copias nocturnas se conservan; `0` las conserva todas |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | El comando que vuelca la base de datos |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | El comando que reproduce un volcado al restaurar |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Cuánto tiempo pueden durar el volcado y la restauración |

Los usuarios con la opción de rol `allowBackupOps` también pueden hacer una copia en cualquier momento en la página **Copias de seguridad**. La retención
solo elimina copias nocturnas, y solo cuentan para ella las copias con un volcado utilizable, así que una serie de noches fallidas
nunca desplaza la última copia buena.

Antes de que una actualización cambie la base de datos, el worker hace primero una copia normal, una vez por versión, llamada *Before the upgrade to
&lt;version&gt;*. Aparece en la página **Copias de seguridad** y la retención nocturna nunca la elimina. Si falla (no hay herramienta de volcado,
no se puede escribir en `BACKUP_PATH`), la actualización se detiene e indica el motivo, de modo que la aplicación nunca arranca sobre una base de datos a medio actualizar.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` actualiza sin copia.

Los comandos pueden ser envoltorios como `docker exec <container> mysqldump`, siempre que su primera palabra exista localmente. Desde la 7.3.0 se ejecutan
sin shell: las comillas y `$NAME` del entorno del comando funcionan, pero `;`, `|`, `&&`, `>` y `<` se rechazan.

---

## Permisos en la base de datos

El volcado se ejecuta como [`DB_USER`](../customization/server.html#env_DB_USER), y no necesita más permisos que los que necesita la propia aplicación:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

El volcado se hace con `--no-tablespaces`, así que no hace falta el permiso `PROCESS` de todo el servidor, y omite las tablas
que describen los procesos en ejecución (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). La restauración lo reproduce con el mismo usuario.
La página **Estado** muestra un aviso en su comprobación **Usuario de la base de datos** cuando el usuario tiene permisos sobre todas las bases de datos, como `root`.

---

## Qué contiene una copia

Cada copia es una carpeta dentro de `BACKUP_PATH`, con el nombre de su marca de tiempo UTC (`YYYYMMDDHHmmss`), que contiene:

| Archivo | Contenido |
|------|---------|
| `ansibleforms.sql` | El volcado de la base de datos `AnsibleForms`: usuarios, grupos, credenciales, trabajos, ajustes, el registro de auditoría |
| `config.yaml` | El archivo de [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | La carpeta de [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | El archivo de entorno que escriben las páginas de configuración, sin `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` ni `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | La descripción de la copia |

Una copia cuyo volcado falla se vuelve a eliminar y se registra como error. La página **Estado** avisa cuando no hay ninguna copia,
cuando la más reciente tiene más de dos días o cuando no tiene un volcado utilizable, y comprueba que la herramienta de volcado existe.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS), en cambio, conserva los puntos de restauración del diseñador (60 días por defecto).

---

## Restaurar una copia

Restaura desde la [página **Copias de seguridad**](../gui/administration.html#restore), con **Crear una nueva copia de seguridad antes de restaurar** marcado. Una restauración:

* reproduce `ansibleforms.sql`, que sustituye toda la base de datos; desde la 7.3.0, una copia de una versión anterior se vuelve a
  actualizar después, como al arrancar una versión nueva, y se informa de cualquier parche que falle
* vuelve a copiar `config.yaml` y sustituye la carpeta `forms/` por la de la copia: desde la 7.3.0 los formularios que no están en la copia se
  eliminan en lugar de conservarse, los enlaces y el modo de la carpeta se mantienen, y una copia fallida devuelve la carpeta a su estado anterior
* **no** restaura `managed.env`, porque describe el host del que procede la copia. El botón **Restaurar entorno**
  lo recupera si se le pide, guarda el archivo actual como `.env.bak` y requiere un reinicio.

Una copia sin un volcado utilizable se rechaza; tras una restauración interrumpida, corrige la causa y vuelve a restaurar.

En un host nuevo, define el mismo `ENCRYPTION_SECRET` antes de restaurar, o las credenciales guardadas no se podrán descifrar.

---

## Qué más hay que guardar

La copia nocturna cubre la base de datos, la configuración y los formularios, pero nada más de la carpeta persistente:

* **`ENCRYPTION_SECRET` y `ACCESS_TOKEN_SECRET`** : nunca están en una copia, por diseño. Guárdalos en tu gestor de secretos;
  sin el secreto de cifrado, un volcado de la base de datos no sirve para las credenciales.
* **las propias copias** : están en el mismo volumen que la instancia. Copia `BACKUP_PATH` a otro host.
* **el resto de la carpeta persistente** : playbooks, archivos subidos, archivos de variables, repositorios clonados, certificados y logs.
  Con el proyecto docker-compose, haz copia de toda la carpeta `data/`, que también contiene la clave SSH, las funciones
  personalizadas y los roles y colecciones de Ansible.

El contenido que procede de git (repositorios, formularios de un repositorio) se puede volver a clonar, así que su copia importa menos.
