---
layout: default
title: Roles
parent: config.yaml
nav_order: 2
translated_from: c23a8fb9203e85e81cd128d2c129228c0a207f6c
---

# Roles
{: .no_toc }

Asigna usuarios y grupos a roles, y define qué puede hacer cada rol.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El atributo roles

La lista `roles` de nivel superior de config.yaml:

{% include config_attribute.html name="roles" %}

---

## El rol default

Todo usuario con sesión iniciada tiene el rol `default`, así que un formulario con `roles: [default]` está abierto a todos los que pueden iniciar sesión. No
hay acceso anónimo: nadie recibe este rol sin iniciar sesión.

El rol no contiene grupos ni usuarios, ya que se aplica a todos. Sus `options` son los valores predeterminados de todos, como
se describe en [Opciones de rol](#role-options) más abajo. `config.yaml` debe tener un rol `admin` y un rol `default`, y la
página de roles muestra ambos como **Requerido**.

`default` se llamaba `public` antes de la 7.0.0, y el nombre antiguo sigue funcionando:

- **En un formulario**, `roles: [public]` sigue coincidiendo con todos los usuarios, así que los formularios de tus repositorios no necesitan cambios.
- **En `config.yaml`**, un rol llamado `public` se renombra a `default` en el archivo al cargar la configuración. Solo cambia el
  nombre, antes se hace una copia de seguridad de la configuración, y una configuración guardada en un repositorio queda con un cambio que hacer push.
- **En una plantilla ytt**, la plantilla no se reescribe: se renombra la configuración que produce, y un aviso en el log te pide
  que renombres también el rol en la plantilla. La versión 8 rechaza ahí un rol `public`.

Una configuración con un rol `default` y un rol `public` a la vez se rechaza, porque son el mismo rol.

---

## Objeto Role

Cada entrada de la lista `roles`:

{% include config_object.html name="Role" %}

---

## Opciones de rol

Las `options` de un rol activan o desactivan funciones para sus miembros. Desde la 7.3.0 la página del rol las muestra en cuatro grupos,
cada opción con una (i) que dice lo que da, el mismo texto que muestra la vista **Permisos** del perfil:

| Opción | Permite al usuario | Predeterminado |
|---|---|---|
| **Configuración** | | |
| `showSettings` | Ver y cambiar todas las páginas de configuración; el registro del servidor y las copias de seguridad tienen sus propias opciones | Solo admins |
| `showAppearanceSettings` | Cambiar la configuración de apariencia, sin el resto de la configuración (desde la 7.3.0) | Desactivado |
| `showConnectionsSettings` | Gestionar la configuración de conexiones (credenciales, runners y más), sin el resto de la configuración (desde la 7.3.0) | Desactivado |
| `showLogs` | Ver el registro del servidor | Solo admins |
| `showAuditLog` | Ver el registro de auditoría, sin el resto de la configuración (desde la 7.3.0) | Solo admins |
| `allowBackupOps` | Hacer copias de seguridad de la base de datos y restaurarla | Solo admins |
| **Diseñador** | | |
| `showDesigner` | Ver y usar el diseñador | Solo admins |
| `allowFormDesign` | Editar la configuración de formularios en el diseñador: categorías, constantes y formularios. Sin ella, solo lectura (desde la 7.3.0) | Activado |
| `allowPlaybookDesign` | Editar los playbooks en el diseñador: guardarlos, crearlos, quitarlos y hacer push. Sin ella, solo lectura | Activado |
| `allowWorkflowDesign` | Editar los workflows en el diseñador: guardarlos, crearlos, quitarlos y hacer push. Sin ella, solo lectura | Activado |
| `allowInventoryDesign` | Editar los inventories en el diseñador: guardarlos, crearlos, quitarlos y hacer push. Sin ella, solo lectura | Activado |
| `allowVarsFileDesign` | Editar los archivos de variables en el diseñador: guardarlos, crearlos, quitarlos y hacer push. Sin ella, solo lectura | Activado |
| **Trabajos** | | |
| `showJobs` | Ver la página de trabajos | Activado |
| `showAllJobLogs` | Ver los trabajos de todos los usuarios, no solo los suyos | Solo admins |
| `manageAllJobs` | Abortar, eliminar y relanzar los trabajos de todos los usuarios; eliminar y relanzar también necesitan las dos opciones siguientes (desde la 7.3.0) | Solo admins |
| `showExtravars` | Ver las extravars de un formulario y de un trabajo | Activado |
| `showDebugButtons` | Ver los botones de depuración de un formulario | Activado |
| `showArtifacts` | Ver los artefactos de un trabajo: lo que devuelve un trabajo en AWX, o lo que un playbook recogió con `set_stats` | Activado |
| `allowVerboseMode` | Ejecutar trabajos en modo detallado | Activado |
| `allowJobRelaunch` | Relanzar un trabajo con los datos del formulario de una ejecución anterior | Solo admins |
| `allowJobDeletion` | Eliminar trabajos: los suyos, o los de todos los usuarios con `manageAllJobs`. Sin ella, el historial de trabajos se conserva completo (desde la 7.3.0) | Activado |
| `allowScheduledJobs` | Crear y gestionar programaciones recurrentes y puntuales, en la página **Programaciones** (consulta el aviso más abajo) | Solo admins |
| `allowPlannedJobs` | Planificar un trabajo para que se ejecute una vez a una hora fijada (**Ejecutar más tarde**) | Activado |
| `allowStoredJobs` | Guardar los datos de un formulario y volver a cargarlos más tarde | Activado |
| **Acceso e integraciones** | | |
| `allowLogin` | Iniciar sesión en AnsibleForms | Activado |
| `allowChat` | Usar el [asistente de chat](../chat/), cuando está habilitado | Activado |
| `allowMcp` | Usar el [servidor MCP](../mcp/) desde un agente de IA, cuando está habilitado | El `allowChat` del rol |
| `allowFileUploads` | Subir archivos mediante los campos de archivo de un formulario (desde la 7.3.0) | Activado |
| `allowApiTokens` | Crear [tokens de API](../profile/api-token.html) para scripts, hasta la duración máxima que permite la instancia (desde la 7.3.0) | Desactivado |
| `extendedTokenExpiration` | Crear también tokens de API que no caducan nunca; necesita `allowApiTokens` | Desactivado |

Algunas opciones incluyen otras, y la página del rol muestra las incluidas activadas y en gris:

- **`showSettings`** da también `showAppearanceSettings`, `showConnectionsSettings` y `showAuditLog`.
- **`manageAllJobs`** da también `showAllJobLogs`, ya que actuar sobre los trabajos de todos los usuarios implica verlos.
- **Las opciones de diseño** solo cuentan con `showDesigner`, y `extendedTokenExpiration` solo con `allowApiTokens`.

Hasta la 7.2.0, `showAllJobLogs` también permitía al usuario abortar y eliminar los trabajos que mostraba; desde la 7.3.0 eso requiere `manageAllJobs`.
Un rol de antes de la 7.3.0 con `extendedTokenExpiration` y sin `allowApiTokens` recibe `allowApiTokens`, así que conserva sus tokens.

**Solo admins** significa activado para los usuarios que tienen el rol `admin`, y desactivado para todos los demás. Cuando un usuario coincide con varios roles,
las opciones se combinan así:

- **Entre los roles del usuario**, una opción solo está activada cuando todos los roles que la definen están de acuerdo: un `false` explícito gana.
- **El rol `default`** completa las opciones que no define ninguno de los demás roles del usuario, así que puede contener valores predeterminados para todos.
- **Las opciones que no se definen en ningún sitio** toman el valor predeterminado de la tabla.

`showExtraVars`, con V mayúscula, se acepta como otra forma de escribir `showExtravars`; cuando cualquiera de las dos es `false`, la
opción está desactivada.

{: .warning }
> Trata `allowScheduledJobs` como una opción de nivel de admin. Las programaciones no pertenecen al usuario que las creó: todo usuario con
> la opción ve y puede cambiar todas las programaciones. Una programación además se ejecuta con derechos de admin, para cualquier formulario, sea cual sea el
> acceso del creador. Concédela solo a roles en los que confiarías como admins.

{: .warning }
> `allowLogin: false` en el rol `default` deja fuera a todo usuario cuyos otros roles no definan `allowLogin: true`, incluidos
> los admins. Vuelve a concederla en los roles que deben iniciar sesión antes de guardar.
