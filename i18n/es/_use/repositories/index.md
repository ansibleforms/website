---
layout: default
title: Repositorios git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Repositorios git
{: .no_toc }

Guarda formularios, archivos de variables, configuración y playbooks en git
{: .fs-6 .fw-300 }

---

Para administradores que guardan formularios, configuración y playbooks en git: qué puede contener un repositorio y qué origen prevalece.

---

## Para qué sirve un repositorio

Un repositorio es un remoto git que AnsibleForms clona y mantiene al día, y cada uno tiene interruptores que indican qué contiene:

| Interruptor | Qué lee AnsibleForms de él | Carpeta en el repositorio |
|---|---|---|
| **¿Usar para configuración?** | `config.yaml` con las categorías, roles y constantes | la raíz |
| **¿Usar para formularios?** | Los archivos de formulario, que el diseñador también guarda de vuelta en él, y sus archivos de variables | `forms`, o la raíz; archivos de variables en `vars` |
| **¿Usar para playbooks?** | Los playbooks de Ansible que ejecutan los trabajos | `playbooks`, o la raíz |
| **¿Usar para workflows?** | Los archivos de [workflow](../workflows/), que el diseñador también guarda de vuelta en él | cualquier carpeta |
| **¿Usar para inventarios?** | Un inventario, con el nombre del repositorio, que un formulario nombra con `inventory:` | la raíz: `inventory.yaml`, `group_vars`, `host_vars` |

Sin la subcarpeta, se usa la raíz del repositorio. Un repositorio puede contenerlo todo; si los separas, solo **¿Usar para
formularios?**, **¿Usar para workflows?** y **¿Usar para inventarios?** pueden estar activados en varios: los demás interruptores toman el primer repositorio
y registran un aviso.

Cada repositorio se clona en una subcarpeta con su nombre, bajo [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Un repositorio para todo

Un único repositorio puede contener formularios, archivos de variables, configuración y playbooks, con los interruptores activados y una subcarpeta por tipo.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un repositorio por finalidad

Los repositorios separados permiten que cada equipo sea dueño de su parte, con un interruptor cada uno y los archivos directamente en la raíz.

| Repositorio | Interruptor | Contenido en la raíz |
|---|---|---|
| `af-config` | **¿Usar para configuración?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **¿Usar para formularios?** | Los archivos de formulario de cada equipo, combinados en una sola lista |
| `af-playbooks` | **¿Usar para playbooks?** | Los playbooks y roles |

Solo los formularios pueden venir de varios repositorios; la configuración y los playbooks vienen cada uno de uno solo. Los archivos de variables vienen de la carpeta `vars`
del primer repositorio de formularios que tenga una.

---

## Cómo se combinan los repositorios con las carpetas locales

El contenido de un repositorio sustituye a la carpeta local correspondiente; esta tabla resume de dónde se lee cada tipo de archivo.

| Contenido | Se lee de, gana la primera coincidencia |
|---|---|
| Configuración | 1. la base de datos, cuando la configuración se guarda allí ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. `config.yaml` del repositorio **¿Usar para configuración?** <br> 3. `config.yaml` de un repositorio **¿Usar para formularios?**, cuando ningún repositorio se usa para la configuración <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formularios | Todos los repositorios **¿Usar para formularios?** más `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) solo cuando no hay ninguno |
| Playbooks | El repositorio **¿Usar para playbooks?**, si no [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Archivos de variables | La carpeta `vars` del primer repositorio **¿Usar para formularios?** que tenga una, si no [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Todos los repositorios **¿Usar para workflows?** más [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), juntos |

Los formularios de varios repositorios se combinan en una sola lista. Cuando dos de ellos contienen un formulario con el mismo nombre, se conserva el primero
cargado y se registra el aviso `skipping duplicate form <name>`, así que mantén los nombres de formulario únicos entre repositorios.

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
