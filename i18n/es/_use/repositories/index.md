---
layout: default
title: Repositorios git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 04bcefa07810f2c0318286071624cd4a6d05e7e3
---

# Repositorios git
{: .no_toc }

Guarda formularios, playbooks, ajustes y conexiones en git
{: .fs-6 .fw-300 }

---

Para administradores que guardan formularios, playbooks y la configuración de la aplicación en git: qué puede contener un repositorio y qué origen prevalece.

---

## Para qué sirve un repositorio

Un repositorio es un remoto git que AnsibleForms clona y mantiene al día, y sus tipos de uso indican qué toma la aplicación de él.

Desde 7.8.0 el paso **Uso** de un repositorio lista los tipos de uso bajo seis encabezados: **Diseñador**, **Trabajos**, **Sistema**,
**Apariencia**, **Acceso** y **Conexiones**. Los tipos de **Diseñador** son los archivos que la aplicación lee tal como están:

| Tipo de uso | Qué lee AnsibleForms de él | Dónde en el repositorio |
|---|---|---|
| **Formularios** | Los archivos de formulario, que el diseñador también guarda de vuelta en él, y sus archivos de variables | `forms`, o la raíz; archivos de variables en `vars` |
| **Playbooks** | Los playbooks de Ansible que ejecutan los trabajos | `playbooks`, o la raíz |
| **Workflows** | Los archivos de [workflow](../workflows/), que el diseñador también guarda de vuelta en él | cualquier carpeta |
| **Inventarios** | Un inventario, con el nombre del repositorio, que un formulario nombra con `inventory:` | la raíz: `inventory.yaml`, `group_vars`, `host_vars` |
| **Categorías**, **Constantes** | Las categorías y las constantes, que el diseñador también guarda de vuelta en su archivo | el archivo que da `controller_categories:` o `controller_constants:` |

Todos los demás tipos guardan ajustes, usuarios o conexiones de la aplicación en archivos YAML, leídos y escritos en ambos sentidos: las
programaciones, los ajustes de General, las páginas de Apariencia, los usuarios, grupos y roles, los inicios de sesión, las credenciales, los
runners y las demás conexiones. Se describen en [Configuración en git](config-as-code.html).

**Formularios**, **Workflows** e **Inventarios** pueden marcarse en varios repositorios; los **Playbooks** vienen del primero, y cada uno
de los demás tipos de un repositorio como máximo. Cada repositorio se clona en una subcarpeta con su nombre, bajo
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

El interruptor **¿Usar para configuración?** de antes de 7.8.0 se sustituye por **Roles**, **Categorías** y **Constantes**, cada uno leído
del archivo que da su clave; el `config.yaml` de un repositorio aún se lee, obsoleto (consulta
[Roles, categorías y constantes](config-as-code.html#roles-categories-and-constants)).

### Un repositorio para todo

Un único repositorio puede contener formularios, archivos de variables, configuración y playbooks, con los tipos de uso marcados y una subcarpeta por tipo.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un repositorio por finalidad

Los repositorios separados permiten que cada equipo sea dueño de su parte, cada uno con sus propios tipos de uso y los archivos directamente en la raíz.

| Repositorio | Tipos de uso | Contenido en la raíz |
|---|---|---|
| `af-platform` | **Roles**, **Categorías**, **Constantes**, **Credenciales**, **Runners** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formularios** | Los archivos de formulario de cada equipo, combinados en una sola lista |
| `af-playbooks` | **Playbooks** | Los playbooks y roles |

Los archivos de variables vienen de la carpeta `vars` del primer repositorio de formularios que tenga una.

---

## Cómo se combinan los repositorios con las carpetas locales

El contenido de un repositorio sustituye a la carpeta local correspondiente; esta tabla resume de dónde se lee cada tipo de archivo.

| Contenido | Se lee de, gana la primera coincidencia |
|---|---|
| Roles, categorías, constantes | Cada clave por separado: 1. el archivo que da `controller_roles:`, `controller_categories:` o `controller_constants:` en el repositorio con ese tipo de uso <br> 2. el `config.yaml` de ese repositorio (obsoleto) <br> 3. la configuración base: la base de datos, cuando la configuración se guarda allí ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), si no [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formularios | Todos los repositorios **Formularios** más `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) solo cuando no hay ninguno |
| Playbooks | El repositorio **Playbooks**, si no [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Archivos de variables | La carpeta `vars` del primer repositorio **Formularios** que tenga una, si no [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Todos los repositorios **Workflows** más [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), juntos |

Los formularios de varios repositorios se leen en el orden en que se añadieron los repositorios. Cuando dos de ellos contienen un formulario con el
mismo nombre, se usa la copia del repositorio añadido primero y un aviso nombra ambas copias, así que mantén los nombres de formulario únicos entre repositorios.

---

## Solución de problemas

La mayoría de los problemas se ven en la columna **Pull** y en **Mostrar salida del último pull** (o **Mostrar salida del último push**), que contienen el propio
mensaje de error de git.

- [Falló el clone o el pull de un repositorio](../troubleshooting.html#a-repository-clone-or-pull-failed): autenticación, hosts
  conocidos y cambios locales.
- [El repositorio de formularios aún no está clonado](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): el diseñador
  no puede guardar antes del primer clone.
- Un repositorio atascado en `running` se restablece a `failed`: tras un reinicio, en el siguiente inicio; en un minuto cuando el nodo
  que ejecuta su operación de git deja de responder durante 2 minutos; y en cualquier caso tras 2 horas. Vuelve a ejecutar **Pull**.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Añadir un repositorio](adding.html) | La página Repositorios, cada campo de un repositorio y cómo declarar uno en el config seed |
| [Autenticación](authentication.html) | HTTPS con un token, SSH con la clave generada y comandos de git personalizados |
| [Traer cambios](pulling.html) | Pulls programados, manuales y por API, y cambios locales |
| [Diseñador y push](designer.html) | Edita formularios en el diseñador y haz push de ellos al repositorio |
| [Configuración en git](config-as-code.html) | Cada ajuste guardado en un repositorio git, leído y escrito en ambos sentidos |
