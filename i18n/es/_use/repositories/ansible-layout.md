---
layout: default
title: La estructura propia de Ansible
parent: Repositorios git
nav_order: 6
translated_from: e34dd6322dd3240a3c390d4786ed9f933a1cd267
---

# Un repositorio con la estructura propia de Ansible
{: .no_toc }

Ejecuta el playbook de un formulario desde la raíz de su repositorio, como AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores y autores de formularios cuyos playbooks están en un repositorio organizado como lo documenta Ansible, desde 7.8.0.

---

## La estructura

La estructura propia de Ansible guarda la configuración, los inventarios, los playbooks y los roles juntos en la raíz del repositorio.

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

Los playbooks están en `playbooks/` y los roles en `roles/`, así que Ansible encuentra los roles gracias al `ansible.cfg` de
la raíz, que solo lee cuando `ansible-playbook` arranca en esa carpeta:

```ini
[defaults]
roles_path = ./roles
```

Las rutas relativas de `ansible.cfg` se leen desde la carpeta que lo contiene, así que `collections_path = ./collections`
funciona igual. AWX ejecuta los playbooks de un proyecto desde la raíz del proyecto, y desde 7.8.0 un formulario puede hacer lo mismo.

---

## Nombrar el repositorio en un formulario

Un formulario nombra el repositorio desde el que se ejecuta su playbook con `playbookRepository`, en un formulario `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

El job se ejecuta entonces desde la raíz de `infra`, esté donde esté la carpeta de los playbooks:

| Qué | Se lee desde |
|---|---|
| `ansible.cfg` | La raíz del repositorio, con su `roles_path`, su `collections_path` y todos los demás ajustes |
| `playbook` | La raíz: `playbooks/site.yml`, no `site.yml` |
| Un `inventory` o `__inventory__` relativo | La raíz: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Sigue moviendo la carpeta de ejecución, ahora desde la raíz |

Un inventario nombrado por su nombre (`inventory: production`) sigue siendo uno de los
[inventarios](../designer/) del diseñador, como antes. El repositorio debe tener el tipo de uso **Playbooks**: un nombre que
no es un repositorio usado para playbooks hace fallar el job con `playbookRepository '<name>' is not a repository used for playbooks`.

Un paso `ansible` de un [formulario de varios pasos](../forms/multistep.html) nombra su propio `playbookRepository`, y un nodo
de playbook de un [workflow](../workflows/file.html#ansibleforms-own-keys) lo nombra como `playbook_repository`.

---

## Varios repositorios de playbooks

Desde 7.8.0 varios repositorios pueden tener el tipo de uso **Playbooks**; antes solo se usaba el primero, con un aviso.

| El formulario | Desde dónde se ejecuta su playbook |
|---|---|
| Sin `playbookRepository` | El primer repositorio usado para playbooks, en el orden en que se añadieron: su carpeta `playbooks`, si no su raíz, exactamente como antes de 7.8.0 |
| Con `playbookRepository: <name>` | La raíz de ese repositorio, el primero incluido |

Por tanto, un formulario que nombra el primer repositorio se ejecuta desde su raíz, y da su `playbook` desde allí
(`playbooks/site.yml`). Los formularios que no nombran ninguno se siguen ejecutando como siempre.

---

## En el diseñador

El diseñador ofrece el repositorio y los playbooks que le corresponden, en un formulario y en un nodo de workflow.

| Dónde | Qué muestra |
|---|---|
| La pestaña **Visual** de un formulario | **Repositorio**, encima de **Playbook**, cuando hay varios repositorios de playbooks o el formulario nombra uno. Su primera opción, **Primer repositorio de playbooks**, quita la clave |
| **Playbook** | Los playbooks del repositorio elegido, nombrados desde su raíz; con **Primer repositorio de playbooks**, los del primero, tal como los ejecuta |
| El nodo de playbook de un workflow | El mismo campo **Repositorio**, en su pestaña **Cómo se ejecuta**, y los playbooks de ese repositorio en **Qué ejecuta** |
| La sección **Playbooks** | Los playbooks del primer repositorio, desde su carpeta `playbooks` (si no, su raíz), y luego cada otro repositorio entero, en una carpeta con su nombre |

La opción de rol [**Editar todos los playbooks**](../designer/#limited-designers) cuenta un playbook por su repositorio y su ruta:
un formulario que ejecuta `playbooks/site.yml` de `infra` usa ese archivo, no un `site.yml` del primer repositorio.

---

## En un runner RTE

Un [RTE](../rte/) recibe el repositorio que nombra el job, en cualquiera de sus [modos de archivos](../rte/modes.html).

- Con `RTE_FILES=transfer`, el predeterminado, la aplicación envía entero, empaquetado, el repositorio que nombra el formulario,
  en lugar de la carpeta `playbooks` del primer repositorio.
- Con `RTE_FILES=local`, el RTE se ejecuta desde su propio clon de ese repositorio, en `REPO_PATH`.

El RTE debe ser 7.8.0 o posterior para ejecutar un formulario que nombra su repositorio. Los runners AWX, Semaphore, Rundeck y
Jenkins ejecutan sus propias plantillas y jobs: `playbookRepository` no es una clave de sus formularios, y un nodo de workflow
en uno de esos runners no la tiene.

---

## Ejemplo: un formulario para cada entorno

El formulario siguiente ejecuta `playbooks/site.yml` de `infra` contra el inventario del entorno que elige el usuario.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

El campo `__inventory__` da el inventario `inventories/production/hosts.yaml` para **production**, leído desde la raíz de
`infra`, con los `group_vars` a su lado. Los roles de `site.yml` vienen de `roles/`, gracias a `roles_path` en `ansible.cfg`.

---

## Lo mismo antes de 7.8.0

Antes de 7.8.0 un formulario solo podía salir de la carpeta `playbooks` del único repositorio de playbooks, con `playbookSubPath: ../`.

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

También se ejecuta desde la raíz, con estos límites, que `playbookRepository` elimina:

- Solo se podía llegar al primer repositorio usado para playbooks, así que la estructura de Ansible tenía que ser ese.
- La lista de playbooks del diseñador mostraba `site.yml`, desde la carpeta `playbooks`, así que `playbooks/site.yml` se escribía a mano.
- Con `RTE_FILES=transfer`, el predeterminado, el RTE solo recibía la carpeta `playbooks`, así que `../` no llegaba al
  `ansible.cfg`, a los roles ni a los inventarios: solo funcionaba con `RTE_FILES=local`.

Pasar un formulario así a 7.8.0 es cambiar `playbookSubPath: ../` por `playbookRepository: <name>`; `playbook` y
`__inventory__` se quedan como están.
