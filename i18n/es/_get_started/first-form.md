---
layout: default
title: Tu primer formulario
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# Tu primer formulario
{: .no_toc }

Escribe un playbook, crea un formulario para él en el Diseñador, lánzalo y encuentra el trabajo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Este tutorial parte de una instalación nueva, consulta [Instalación](installation/). Lleva unos quince minutos.

---

## 1. Inicia sesión

Abre AnsibleForms en un navegador e inicia sesión como administrador.

La cuenta predeterminada es `admin` / `AnsibleForms!123` (o tus valores de [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)); se abre la página **Formularios**:

![La página Formularios, con formularios de ejemplo](assets/screenshots/dashboard.jpg)

---

## 2. Escribe el playbook

Un formulario `ansible` ejecuta un playbook de la carpeta de playbooks, así que el playbook va primero. Guarda esto como `hello.yaml`:

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

El playbook lee cuatro variables. El formulario que crearás a continuación se las envía como extravars, una por campo.

Pon el archivo en la carpeta `playbooks` de la carpeta persistente
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); crea la carpeta si todavía no existe:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Desde el código fuente</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

La carpeta que montaste en `/app/dist/persistent`, `/srv/apps/ansibleforms/persistent` en el ejemplo de instalación:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

La carpeta `data/playbooks` del proyecto de docker-compose:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

El volumen persistente, montado en `/app/dist/persistent` en el pod de AnsibleForms. Busca el nombre del pod y copia el archivo en él:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

La carpeta `persistent/playbooks` del servidor, `/srv/apps/ansibleforms/server` en el ejemplo de instalación:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Cuando un repositorio git tiene activado **¿Usar para playbooks?**, los playbooks se ejecutan desde ese repositorio:
> confirma `hello.yaml` allí. Consulta [Diseñador y git](gui/designer-and-git.html).

---

## 3. Crea el formulario

Los formularios son archivos YAML de la carpeta de formularios. El Diseñador los edita en el navegador y los comprueba antes de guardar.

1. Haz clic en **Diseñador** en el menú superior y después en **Formularios** en el menú de la izquierda.
2. Haz clic en el interruptor de arriba a la derecha (**Iniciar diseñador**). Bloquea la configuración para que nadie más la edite
   a la vez, y después muestra **Bloqueado por mí**.
3. Haz clic en **Nuevo archivo**, el primer botón de la barra de herramientas, e introduce el nombre de archivo `hello-world.yaml`. El Diseñador le añade
   un formulario llamado `New Form`.
4. Sustituye el YAML del editor por este formulario:

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. Haz clic en **Validar** (la marca de verificación) y después en **Guardar**. Al guardar se escribe `hello-world.yaml` en la carpeta de formularios.
6. Vuelve a hacer clic en el interruptor para liberar el bloqueo.

![El Diseñador, editando un formulario](assets/screenshots/designer.jpg)

El formulario usa cuatro tipos de campo:

| Campo | Tipo | Qué hace |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Un cuadro de texto obligatorio |
| `target_env` | [`enum`](formfields/enum.html) | Un desplegable con una lista fija de `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Un desplegable rellenado por una [expresión](expressions/local.html) local; `__auto__` selecciona el primer elemento |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Una casilla, enviada como `true` o `false` |

`vm_size` muestra las dos columnas, `size` y `cpus`, y envía `size`, la primera; `valueColumn` elige otra.

`roles: [default]` permite a cualquier usuario con sesión iniciada ejecutar el formulario, y `categories: [Default]` lo coloca en la categoría que define el
`config.yaml` predeterminado.

{: .note }
> También puedes copiar `hello-world.yaml` en [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) y [validarlo en VS Code](faq.html#vs-code-validation-for-form-files).

---

## 4. Lánzalo

Abre el formulario desde la página **Formularios**: haz clic en **Formularios** en el menú superior y elige **Hello world** en la categoría **Default**.

Escribe tu nombre y cambia los otros campos si quieres. Haz clic en **Mostrar variables extra** para ver lo que recibirá
el playbook y después haz clic en **Enviar**:

![Un formulario](assets/screenshots/form.jpg)

---

## 5. Mira la salida

El trabajo empieza al instante y su salida aparece debajo del formulario mientras se ejecuta, terminando con una barra **Finalizado**:

![La salida de un trabajo](assets/screenshots/run.jpg)

La tarea de debug muestra tus valores, por ejemplo `Hello Alice: a small machine in development (dry run: True)`.

El aviso del localhost implícito es normal sin un inventory; un formulario real define [`inventory`](forms/ansible.html).

---

## 6. Encuéntralo en el historial de trabajos

Cada lanzamiento se guarda como un trabajo. Haz clic en **Trabajos** en el menú superior: el trabajo nuevo está arriba del todo en **Todos los jobs**.

Haz clic en el trabajo para volver a ver su salida, y en **Mostrar variables extra** para ver lo que se envió. Los iconos delante de cada trabajo
lo relanzan o lo eliminan:

![El historial de trabajos](assets/screenshots/job-output.jpg)

---

## Siguientes pasos

Amplía este formulario con las páginas de referencia:

* **[Formularios](forms/)** : todas las propiedades de un formulario, plantillas en runners, formularios de workflow, puntos de aprobación y notificaciones
* **[Campos de formulario](formfields/)** : todos los tipos de campo, con validación, dependencias y disposición
* **[Expresiones](expressions/)** : rellena campos desde APIs REST, bases de datos y archivos
* **[Roles](config/roles.html)** y **[categorías](config/categories.html)** en `config.yaml` : decide quién ve cada formulario
* **[Cómo funciona](how-it-works.html)** : qué pasa detrás de un lanzamiento y dónde se guarda todo
