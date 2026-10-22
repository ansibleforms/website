---
layout: default
title: Dissenyador
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
---

# Dissenyador
{: .no_toc }

Edita formularis, playbooks, inventaris i workflows al navegador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per als autors de formularis: les seccions del dissenyador, i què mostra cadascuna de les seves pestanyes.

El dissenyador necessita l'[opció de rol](../config/roles.html#role-options) `showDesigner`. Edita un element alhora, un
formulari, un playbook o un fitxer de workflow, amb les seves seccions al menú de l'esquerra. Cada tipus de fitxer també necessita la seva pròpia opció, totes
activades per defecte: `allowPlaybookDesign` per als **Playbooks**, `allowWorkflowDesign` per als **Fluxos de treball**,
`allowInventoryDesign` per als **Inventaris** i `allowVarsFileDesign` per als **Fitxers de variables**. Sense l'opció, la seva secció és
de només lectura i el servidor es nega a desar, crear, treure o fer push dels seus fitxers; els formularis i els workflows encara els poden triar. Els
**Formularis**, les **Categories** i les **Constants** necessiten `allowFormDesign` de la mateixa manera: sense aquesta opció són de només lectura, i el servidor
es nega a desar-los, fer-ne pull o fer-ne push. Només edita una persona alhora: vegeu [El bloqueig del dissenyador](lock.html).

---

## Les seves seccions

Cada secció edita un tipus de fitxer, desat localment o en un [repositori](../repositories/):

| Secció | Què edita |
|---|---|
| **Formularis** | Els fitxers de formulari |
| **Categories** | Les categories de `config.yaml` |
| **Constants** | Les constants de `config.yaml` |
| **Fitxers de variables** | Els fitxers de variables que carreguen els formularis |
| **Playbooks** | Els playbooks que executen els formularis i els workflows |
| **Inventaris** | Els inventaris: `inventory.yaml`, `group_vars` i `host_vars` |
| **Fluxos de treball** | Els fitxers de [workflow](../workflows/) |

Les seccions amb fitxers els mostren en un explorador de fitxers i obren el primer; una secció que encara no té fitxers ho indica. La
secció **Formularis** i totes les seccions de fitxers tenen un botó **Fitxer nou** en primer lloc a la barra d'eines: als Inventaris crea un inventari
nou, als Fluxos de treball, un workflow nou i buit. La lupa de l'explorador obre un quadre que filtra els seus fitxers pel nom.

El quadre de cerca de la línia del títol troba un text al YAML que està obert: marca tots els llocs on apareix. Funciona a la pestanya
**YAML**, un cop tens el bloqueig del dissenyador.

---

## Les seves pestanyes

Totes les seccions tenen les mateixes tres pestanyes, totes sobre el mateix YAML: una edició en una es veu a les altres, i **Desa** la desa.

- **YAML** és el fitxer tal com està escrit.
- **Visual** l'edita amb camps. Només canvien les claus que toca una edició, de manera que els comentaris i la resta queden tal com estaven escrits.
- **Previsualització** mostra què fa, i no edita res.

Què mostren les pestanyes Visual i Previsualització, secció per secció:

| Secció | Visual | Previsualització |
|---|---|---|
| **Formularis** | La configuració del formulari i els seus camps, amb llistes dels playbooks, inventaris i workflows del dissenyador | El formulari tal com és ara, edicions no desades incloses; el seu enviament no executa res |
| **Categories** | Les categories com a taula, editables | El menú de la pàgina Formularis, construït a partir d'elles |
| **Constants** | Les constants com un esquema, editables (una clau es mou amb les tecles de fletxa) | Cada constant amb la seva referència, `$(NAME)`, per copiar-la, i els formularis que la fan servir |
| **Fitxers de variables** | Les variables, editables | Cada variable amb la seva referència en un playbook, {% raw %}`{{ name }}`{% endraw %}, per copiar-la, i els formularis que carreguen el fitxer |
| **Playbooks** | Els plays: el nom de cada play, els hosts, **Become**, **Recollir facts** i els rols, i les seves tasques, cadascuna amb el seu mòdul i els seus arguments | L'esquema del playbook: els seus plays, amb els hosts, els rols i les tasques, i els playbooks que importa |
| **Inventaris** | Els grups, els seus grups fills, els seus hosts i les variables que defineix cadascun | L'inventari en forma d'arbre, amb els seus `group_vars` i `host_vars` |
| **Fluxos de treball** | El graf del workflow, per [editar-lo](../workflows/designer.html) | Una [simulació](../workflows/designer.html#trying-it-out): fes clic en un node perquè falli |

Quan el YAML no es pot llegir, les pestanyes Visual i Previsualització diuen per què, amb **Mostra en YAML** per obrir el YAML a la línia.
