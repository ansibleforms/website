---
layout: default
title: Repositoris Git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Repositoris Git
{: .no_toc }

Guarda formularis, fitxers de variables, configuració i playbooks a git
{: .fs-6 .fw-300 }

---

Per als administradors que guarden formularis, configuració i playbooks a git: què pot contenir un repositori i quina font té prioritat.

---

## Per a què serveix un repositori

Un repositori és un remot git que AnsibleForms clona i manté al dia, i cadascun té interruptors que indiquen què conté:

| Interruptor | Què en llegeix AnsibleForms | Carpeta del repositori |
|---|---|---|
| **Utilitzar per a la configuració ?** | `config.yaml` amb les categories, els rols i les constants | l'arrel |
| **Utilitzar per als formularis ?** | Els fitxers de formulari, que el dissenyador també hi torna a desar, i els seus fitxers de variables | `forms`, o l'arrel; els fitxers de variables a `vars` |
| **Utilitzar per als playbooks ?** | Els playbooks d'Ansible que executen les tasques | `playbooks`, o l'arrel |
| **Fer servir per a workflows?** | Els fitxers de [workflow](../workflows/), que el dissenyador també hi torna a desar | qualsevol carpeta |
| **Fer servir per a inventaris?** | Un inventari, amb el nom del repositori, que un formulari indica amb `inventory:` | l'arrel: `inventory.yaml`, `group_vars`, `host_vars` |

Sense la subcarpeta, es fa servir l'arrel del repositori. Un repositori ho pot contenir tot; si els separes, només **Utilitzar per als
formularis**, **Fer servir per a workflows** i **Fer servir per a inventaris** poden estar activats en diversos: els altres interruptors agafen el primer repositori
i registren un avís.

Cada repositori es clona en una subcarpeta amb el seu nom, dins de [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Un repositori per a tot

Un sol repositori pot contenir formularis, fitxers de variables, configuració i playbooks, amb els interruptors activats i una subcarpeta per a cada tipus.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un repositori per a cada finalitat

Els repositoris separats permeten que cada equip sigui propietari de la seva part, amb un interruptor cadascun i els fitxers directament a l'arrel.

| Repositori | Interruptor | Contingut a l'arrel |
|---|---|---|
| `af-config` | **Utilitzar per a la configuració ?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Utilitzar per als formularis ?** | Els fitxers de formulari de cada equip, fusionats en una sola llista |
| `af-playbooks` | **Utilitzar per als playbooks ?** | Els playbooks i els rols |

Només els formularis poden venir de diversos repositoris; la configuració i els playbooks venen cadascun d'un de sol. Els fitxers de variables venen de la carpeta `vars`
del primer repositori de formularis que en tingui una.

---

## Com es combinen els repositoris amb les carpetes locals

El contingut dels repositoris substitueix la carpeta local corresponent; aquesta taula resumeix d'on es llegeix cada tipus de fitxer.

| Contingut | Es llegeix de, guanya la primera coincidència |
|---|---|
| Configuració | 1. la base de dades, quan la configuració s'hi desa ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. el `config.yaml` del repositori **Utilitzar per a la configuració** <br> 3. el `config.yaml` d'un repositori **Utilitzar per als formularis**, quan cap repositori no es fa servir per a la configuració <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formularis | Tots els repositoris **Utilitzar per als formularis** més `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) només quan no n'hi ha cap |
| Playbooks | El repositori **Utilitzar per als playbooks**, o si no [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Fitxers de variables | La carpeta `vars` del primer repositori **Utilitzar per als formularis** que en tingui una, o si no [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Tots els repositoris **Fer servir per a workflows** més [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), conjuntament |

Els formularis de diversos repositoris es fusionen en una sola llista. Quan dos d'ells contenen un formulari amb el mateix nom, es conserva el primer
que es carrega i es registra l'avís `skipping duplicate form <name>`, així que mantén els noms dels formularis únics entre repositoris.

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
