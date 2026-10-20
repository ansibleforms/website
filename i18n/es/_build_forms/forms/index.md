---
layout: default
title: Formularios
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formularios
{: .no_toc }

Define los formularios que rellenan tus usuarios
{: .fs-6 .fw-300 }

---

Para autores de formularios: cómo se escriben los formularios en YAML, desde dónde se cargan y las propiedades de cada tipo de formulario.

Los formularios son el núcleo de AnsibleForms. Cada formulario es una interfaz web que recoge datos del usuario y, con ellos, ejecuta un
playbook de Ansible, una plantilla de AWX, AAP o Ascender, una plantilla de Semaphore, un job de Rundeck o Jenkins, o un
[workflow](../workflows/).

Los formularios se definen en archivos YAML dentro de la carpeta de formularios. Cada archivo YAML contiene un solo formulario o una lista de formularios, y puedes usar subcarpetas para organizarlos.

**VÍDEO**: [Crea tu primer formulario](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Entender la estructura de un formulario

Cada formulario de AnsibleForms se configura con un conjunto de propiedades. **[Propiedades comunes](common.html)** enumera las propiedades que se aplican a todos los tipos de formulario; las páginas de cada tipo describen las demás.

---

## Cómo se cargan los formularios

AnsibleForms carga los formularios desde las siguientes ubicaciones:

1. **DESDE REPOSITORIOS** : todos los repositorios con el interruptor "Usar para formularios" activado (se admiten varios repositorios)
   - Los formularios de todos los repositorios activados se combinan automáticamente.
   - En cada repositorio se busca primero una subcarpeta `forms/`.
   - Si no existe la subcarpeta `forms/`, se usa la raíz del repositorio.
   - Los formularios creados en el diseñador que aún no se han subido con push se guardan en una carpeta de preparación
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) y se cargan junto con ellos.

2. **DESDE LA CARPETA LOCAL** : la carpeta local `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), cuando ningún repositorio tiene activado "Usar para formularios"

{: .warning }
> **Nota:** Cuando "Usar para formularios" está activado en varios repositorios, todos sus formularios se combinan. Los nombres de los formularios deben ser únicos entre repositorios para evitar conflictos.

---

## Dónde se ejecuta un formulario

El tipo de un formulario decide en qué clase de [runner](../runners.html) se ejecuta su trabajo: un RTE para `ansible`, un runner de AWX para `awx`,
`aap` y `ascender`, y un runner de su propio tipo para `semaphore`, `rundeck` y `jenkins`.

- `runner: <name>` en el formulario elige por nombre un runner de ese tipo; sin él, el trabajo se ejecuta en el runner predeterminado del tipo.
- Un runner desactivado en **Conexiones > Runners** hace fallar el trabajo, tanto si el formulario lo nombra como si es el predeterminado. El trabajo
  nunca recurre a otro runner.
- Cuando uno de los roles del usuario enumera `runners` en `config.yaml`, el trabajo solo puede ejecutarse en un runner que enumere uno de esos roles, o se
  rechaza. Los roles sin esa lista no lo limitan, y un administrador nunca está limitado.

---

## En esta sección

Las siguientes páginas describen en detalle las propiedades de los formularios:

| Página | Qué cubre |
|---|---|
| [Propiedades comunes](common.html) | Propiedades que se aplican a todos los tipos de formulario (`name`, `description`, `help`, `type`, `fields`) |
| [Formularios de Ansible](ansible.html) | Propiedades específicas de `type: ansible` |
| [Formularios de AWX](awx.html) | Propiedades específicas de `type: awx` |
| [Formularios de Semaphore](semaphore.html) | Propiedades específicas de `type: semaphore`, que ejecuta una plantilla de Semaphore |
| [Formularios de Rundeck](rundeck.html) | Propiedades específicas de `type: rundeck`, que ejecuta un job de Rundeck |
| [Formularios de Jenkins](jenkins.html) | Propiedades específicas de `type: jenkins`, que ejecuta un build de un job de Jenkins |
| [Formularios de varios pasos](multistep.html) | Propiedades específicas de `type: multistep`, obsoleto en favor de `workflow` |
| [Formularios de workflow](workflow.html) | Propiedades específicas de `type: workflow`, que ejecuta un [workflow](../workflows/) |
| [Asistente](wizard.html) | Reparte los datos de un formulario en varias páginas (funciona sobre cualquier tipo de formulario ejecutable) |
| [Subform](subform.html) | Los subformularios solo usan las propiedades comunes |
| [Puntos de aprobación](approval.html) | Pausa un trabajo hasta que se apruebe (`approval`) |
| [Notificaciones](notifications.html) | Envía correos y mensajes a canales según el estado o los eventos del trabajo (`notifications`) |
| [Acciones según el estado del trabajo](job-status-action.html) | Actúa sobre el formulario cuando un trabajo cambia de estado (`onSubmit`, `onSuccess`, ...) |
