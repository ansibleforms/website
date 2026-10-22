---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflows
{: .no_toc }

Encadena playbooks, aprovacions i altres workflows, com fa AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per als autors de formularis: què és un workflow, com s'executen els seus nodes i on continuar llegint.

Un workflow és un graf de nodes. Cada node executa alguna cosa: un dels playbooks del dissenyador, un altre workflow, una aprovació
o un pull d'un repositori. Els enllaços entre els nodes indiquen què s'executa després: si té èxit, si falla o sempre. Un formulari de
[tipus `workflow`](../forms/workflow.html) el llança, i la pàgina de tasques el dibuixa en directe mentre s'executa.

Els workflows segueixen la sintaxi i les regles d'AWX, de manera que un workflow exportat d'AWX es llegeix igual a AnsibleForms. S'executen a
l'RTE, sense AWX: un node de playbook és una tasca pròpia, amb l'inventari, les credencials, el límit i les etiquetes del node.

---

## Com s'executa un workflow

Els nodes s'executen segons les regles d'AWX, i les branques que no depenen l'una de l'altra s'executen en paral·lel.

- **Un node sense pare comença de seguida**, quan comença el workflow.
- **Un enllaç s'activa quan el seu node ha acabat**: un enllaç *si té èxit* després d'un èxit, un enllaç *si falla* després d'una fallada,
  un enllaç *sempre* després de qualsevol dels dos. Un node cancel·lat no activa cap dels seus enllaços.
- **Un node comença tan bon punt s'activa un dels enllaços que hi arriben.** Amb **Tots els pares han de convergir** activat, espera fins que s'han activat tots
  els enllaços que hi arriben.
- **Un node que ja no pot començar es marca com a *no s'executa***, igual que els nodes que només ell podia iniciar.
- **El workflow falla quan un node ha fallat i res no ho gestiona**: aquest node no té cap enllaç *si falla* ni cap enllaç *sempre*.
  Una fallada que gestiona un enllaç no fa fallar el workflow.

Un node amb una condició (`if_extra_var`) que no es compleix s'omet. El que el segueix s'executa com després d'un èxit. Un node
d'aprovació no admet condició: sempre espera una resposta.

---

## Passar dades entre nodes

El que el playbook d'un node recull amb `set_stats` arriba als nodes posteriors com a extra vars, de la mateixa manera que AWX passa els
artefactes d'una tasca. Un node rep les dades de tots els pares l'enllaç dels quals cap a ell s'ha activat, fusionades en l'ordre en què estan
escrits els pares, i passa endavant el que ha rebut més les dades de la seva pròpia tasca; si tots dos defineixen una clau, guanya la seva.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Un node posterior llegeix llavors {% raw %}`{{ version }}` i `{{ build_id }}`{% endraw %} com qualsevol altra extra var.

Les extra vars d'un node provenen de quatre llocs. Un d'ells, `extra_data`, són les variables pròpies del node: el nom que els dona AWX,
definides al node al [fitxer de workflow](file.html#run-settings). Quan dos llocs defineixen la mateixa clau, l'ordre de precedència és
el d'AWX, de menor a major:

| Origen | Guanya a |
|---|---|
| les variables pròpies del node (`extra_data`) | res |
| les dades passades amb `set_stats` | l'`extra_data` del node |
| les `extra_vars` del workflow | les dades passades |
| els valors del formulari | tot |

- Només es passen les dades de tot el playbook: `set_stats` amb `per_host: false`, el seu valor per defecte.
- Un node d'aprovació, un node omès i un node de projecte passen endavant el que els ha arribat.
- La sortida d'un node acaba amb les claus que ha passat endavant, només pel nom, ja que els seus valors poden ser secrets.
- La tasca del node conserva les seves dades com a artefactes (**Mostra els artefactes** a la seva pàgina), i la tasca del workflow conserva les dades de tots
  els seus nodes, de manera que un workflow niat també les passa als nodes posteriors.
- Un node que s'executa en un runner d'AWX passa endavant els artefactes de la seva tasca d'AWX de la mateixa manera.
---

## En aquesta secció

Les pàgines següents descriuen els workflows en detall:

| Pàgina | Què tracta |
|---|---|
| [El fitxer de workflow](file.html) | La sintaxi del fitxer, els tipus de node i les opcions d'execució de cada node |
| [Edició al dissenyador](designer.html) | La secció Fluxos de treball del dissenyador: el graf, els diàlegs de node i d'enllaç i la simulació |
| [Executar un workflow](running.html) | El formulari que el llança, la pàgina de la tasca, les sortides dels nodes, les aprovacions i l'avortament |
