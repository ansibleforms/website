---
layout: default
title: Añadir un repositorio
parent: Repositorios git
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Añadir un repositorio
{: .no_toc }

La página Repositorios, cada campo de un repositorio y cómo declarar uno en el config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La página Repositorios

Los repositorios se gestionan en **Configuración > Conexiones > Repositorios**, que necesita la [opción de rol](../config/roles.html#role-options)
`showSettings` o, desde 7.3.0, `showConnectionsSettings`. Algunos cambios son solo para un administrador, consulta [más abajo](#who-may-change-a-repository).

![Repositorios](../assets/screenshots/git.jpg)

La lista muestra **Nombre**, **Descripción**, **Rama**, **Cabeza** (el hash corto del commit en el que está), **Pull** y
**Push**. La pestaña **Detalles** de un repositorio muestra las mismas insignias de Pull y Push sobre su cabeza:

| Columna | Qué indica |
|---|---|
| **Pull** | El último clone, pull o reset: **En ejecución** mientras git trabaja, luego **Correcto** o **Fallido**; un guion antes del primero |
| **Push** | **Fallido** cuando el último push falló; **Cambios pendientes** cuando los cambios guardados aquí, por el diseñador, aún no se han enviado al remoto; **Correcto** cuando no hay nada pendiente; un guion antes del primer push |

**Correcto** en la columna Push solo significa que no hay nada pendiente de enviar: el remoto puede tener aún commits más recientes que
trae un pull. El menú de cada fila contiene estas acciones:

| Acción | Qué hace |
|---|---|
| **Editar** | Cambiar los campos de abajo |
| **Pull** | Clonar el repositorio, o hacer pull cuando el árbol de trabajo ya existe |
| **Push** | Hacer commit y push del árbol de trabajo; solo en repositorios usados para formularios, configuración, playbooks, workflows o inventarios, y activo solo mientras haya cambios aún sin enviar |
| **Restablecer** | Borrar el árbol de trabajo y volver a clonarlo, lo que descarta los cambios locales |
| **Cambiar credenciales** | Abrir la pestaña **Credenciales** del repositorio, para elegir la credencial que usa git |
| **Mostrar salida del último pull** | Mostrar la salida de git del último clone, pull o reset, con la contraseña enmascarada |
| **Mostrar salida del último push** | Mostrar la salida de git del último push, con la contraseña enmascarada |
| **Eliminar** | Quitar el registro y su árbol de trabajo bajo `REPO_PATH`; solo un administrador |

**Pull de todos**, encima de la lista, hace pull de todos los repositorios a la vez.

Solo se ejecuta una operación de git a la vez en un repositorio. Una segunda se rechaza con
`Repository '<name>' not found or already running, try again later`.

---

## Añadir un repositorio

Haz clic en **Añadir repositorio**: un asistente pide los campos en cuatro pasos (**Repositorio**, **Credenciales**, **Uso**,
**Programación del pull**), y AnsibleForms inicia el clone en segundo plano en cuanto guardas.

![Editar repositorio](../assets/screenshots/git-edit.jpg)

| Campo | Obligatorio | Significado |
|---|---|---|
| **Nombre** | sí | El nombre de la carpeta bajo `REPO_PATH`; letras, dígitos, guion, guion bajo y punto |
| **Rama** | sí | La rama que se clona, de la que se hace pull y a la que se hace push, por ejemplo `main`; obligatoria desde 7.3.0. Solo un repositorio del config seed puede omitirla, para clonar la rama predeterminada del remoto |
| **Credencial** | no | Una credencial de [Conexiones > Credenciales](../credentials.html) con el usuario y la contraseña o el token que usa git; **Añadir credencial** crea una |
| **Uri** | sí | El remoto, `https://...` o SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Activar el pull programado** | no | Hacer pull del repositorio según una programación |
| **Programación del pull** | no | Cuándo hacer pull, como expresión cron; se muestra una vez activado el pull programado |
| **Descripción** | sí | Una descripción de texto libre |
| **¿Usar para configuración?** ... **¿Usar para inventarios?** | no | Qué contiene el repositorio, consulta [más arriba](./#what-a-repository-is-for) |
| **Hacer pull al iniciar la aplicación** | no | Clonar el repositorio, o hacer pull, cada vez que AnsibleForms se inicia |

Renombrar un repositorio mueve su árbol de trabajo a la nueva carpeta y mueve también su programación de pull. Un repositorio de
antes de la 7 que aún tiene su propio usuario lo indica en su pestaña **Credenciales**: elige una credencial para sustituirlo.

---

## Quién puede cambiar un repositorio

El contenido de un repositorio pasa a ser lo que AnsibleForms carga y ejecuta, así que desde 7.3.0 un usuario sin el rol `admin` ya no puede:

- añadir ni eliminar un repositorio;
- cambiar su **Uri** ni su **Rama**;
- activar ni desactivar ninguno de sus indicadores **Usar para**.

Sí puede cambiar su descripción, su programación de pull y su credencial, y hacer pull, push o reset. No puede elegir una credencial
que use un runner, una conexión o un inicio de sesión; el rechazo la nombra, y no dice nada de lo que contiene.

---

## Declarar repositorios en el config seed

Los repositorios también se pueden declarar en el [config seed](../seed/), para que una instancia nueva los clone en su primer inicio.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

Los campos son los de la página, incluidos `credential` (una credencial del seed o de la aplicación), `rebase_on_start` (**Hacer pull al
iniciar la aplicación**) y `cron` (la programación del pull); `user` y `password` se siguen aceptando en lugar de una credencial. Un
repositorio del seed es de solo lectura en la interfaz, y se vuelve a clonar al iniciar cuando falta su árbol de trabajo; consulta
[Objetos gestionados](../seed/managed-objects.html).
