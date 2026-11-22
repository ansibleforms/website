---
layout: default
title: Repositoris Git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 04bcefa07810f2c0318286071624cd4a6d05e7e3
---

# Repositoris Git
{: .no_toc }

Guarda formularis, playbooks, ajustos i connexions a git
{: .fs-6 .fw-300 }

---

Per als administradors que guarden formularis, playbooks i la configuració de l'aplicació a git: què pot contenir un repositori i quina font té prioritat.

---

## Per a què serveix un repositori

Un repositori és un remot git que AnsibleForms clona i manté al dia, i els seus tipus d'ús indiquen què n'agafa l'aplicació.

Des de la 7.8.0 el pas **Ús** d'un repositori llista els tipus d'ús sota sis encapçalaments: **Dissenyador**, **Tasques**, **Sistema**,
**Aparença**, **Accés** i **Connexions**. Els tipus de **Dissenyador** són els fitxers que l'aplicació llegeix tal com són:

| Tipus d'ús | Què en llegeix AnsibleForms | On és al repositori |
|---|---|---|
| **Formularis** | Els fitxers de formulari, que el dissenyador també hi torna a desar, i els seus fitxers de variables | `forms`, o l'arrel; els fitxers de variables a `vars` |
| **Playbooks** | Els playbooks d'Ansible que executen les tasques | `playbooks`, o l'arrel |
| **Workflows** | Els fitxers de [workflow](../workflows/), que el dissenyador també hi torna a desar | qualsevol carpeta |
| **Inventaris** | Un inventari, amb el nom del repositori, que un formulari indica amb `inventory:` | l'arrel: `inventory.yaml`, `group_vars`, `host_vars` |
| **Categories**, **Constants** | Les categories i les constants, que el dissenyador també torna a desar al seu fitxer | el fitxer que dona `controller_categories:` o `controller_constants:` |

Tots els altres tipus guarden ajustos, usuaris o connexions de l'aplicació en fitxers YAML, llegits i escrits en tots dos sentits: les
programacions, els ajustos de General, les pàgines d'Aparença, els usuaris, grups i rols, els inicis de sessió, les credencials, els runners i
les altres connexions. Es descriuen a [Configuració a git](config-as-code.html).

**Formularis**, **Workflows** i **Inventaris** es poden marcar en diversos repositoris; els **Playbooks** venen del primer, i cadascun dels
altres tipus d'un repositori com a màxim. Cada repositori es clona en una subcarpeta amb el seu nom, dins de
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

L'interruptor **Utilitzar per a la configuració ?** d'abans de la 7.8.0 se substitueix per **Rols**, **Categories** i **Constants**, cadascun
llegit del fitxer que dona la seva clau; el `config.yaml` d'un repositori encara es llegeix, obsolet (vegeu
[Rols, categories i constants](config-as-code.html#roles-categories-and-constants)).

### Un repositori per a tot

Un sol repositori pot contenir formularis, fitxers de variables, configuració i playbooks, amb els tipus d'ús marcats i una subcarpeta per a cada tipus.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un repositori per a cada finalitat

Els repositoris separats permeten que cada equip sigui propietari de la seva part, cadascun amb els seus tipus d'ús i els fitxers directament a l'arrel.

| Repositori | Tipus d'ús | Contingut a l'arrel |
|---|---|---|
| `af-platform` | **Rols**, **Categories**, **Constants**, **Credencials**, **Runners** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formularis** | Els fitxers de formulari de cada equip, fusionats en una sola llista |
| `af-playbooks` | **Playbooks** | Els playbooks i els rols |

Els fitxers de variables venen de la carpeta `vars` del primer repositori de formularis que en tingui una.

---

## Com es combinen els repositoris amb les carpetes locals

El contingut dels repositoris substitueix la carpeta local corresponent; aquesta taula resumeix d'on es llegeix cada tipus de fitxer.

| Contingut | Es llegeix de, guanya la primera coincidència |
|---|---|
| Rols, categories, constants | Cada clau per separat: 1. el fitxer que dona `controller_roles:`, `controller_categories:` o `controller_constants:` al repositori amb aquest tipus d'ús <br> 2. el `config.yaml` d'aquest repositori (obsolet) <br> 3. la configuració base: la base de dades, quan la configuració s'hi desa ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), o si no [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formularis | Tots els repositoris **Formularis** més `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) només quan no n'hi ha cap |
| Playbooks | El repositori **Playbooks**, o si no [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Fitxers de variables | La carpeta `vars` del primer repositori **Formularis** que en tingui una, o si no [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Tots els repositoris **Workflows** més [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), conjuntament |

Els formularis de diversos repositoris es llegeixen en l'ordre en què es van afegir els repositoris. Quan dos d'ells contenen un formulari amb el
mateix nom, es fa servir la còpia del repositori afegit primer i un avís anomena totes dues còpies, així que mantén els noms dels formularis únics entre repositoris.

---

## Resolució de problemes

La majoria dels problemes es veuen a la columna **Pull** i a **Mostra la sortida de l'últim pull** (o **Mostra la sortida de l'últim push**), que contenen el missatge d'error
de git mateix.

- [Ha fallat el clonatge o el pull d'un repositori](../troubleshooting.html#a-repository-clone-or-pull-failed): autenticació, amfitrions
  coneguts i canvis locals.
- [El repositori de formularis encara no s'ha clonat](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): el dissenyador
  no pot desar abans del primer clonatge.
- Un repositori encallat a `running` es restableix a `failed`: després d'un reinici, a la següent arrencada; en menys d'un minut quan el node
  que executa la seva operació git deixa de respondre durant 2 minuts; i en qualsevol cas passades 2 hores. Torna a executar **Pull**.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Afegir un repositori](adding.html) | La pàgina Repositoris, cada camp d'un repositori i com declarar-ne un al config seed |
| [Autenticació](authentication.html) | HTTPS amb un token, SSH amb la clau generada i ordres git personalitzades |
| [Fer pull dels canvis](pulling.html) | Pulls programats, manuals i per API, i els canvis locals |
| [Dissenyador i push](designer.html) | Editar formularis al dissenyador i fer-ne push al repositori |
| [Configuració a git](config-as-code.html) | Cada ajust guardat en un repositori git, llegit i escrit en tots dos sentits |
