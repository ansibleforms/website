---
layout: default
title: Edició al dissenyador
parent: Workflows
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Edició al dissenyador
{: .no_toc }

Dibuixa un workflow i prova'l sense executar res
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La secció Fluxos de treball

**Dissenyador > Fluxos de treball** mostra els fitxers de workflow en un explorador de fitxers, amb les pestanyes YAML, Visual i Previsualització de totes les
seccions del [dissenyador](../designer/).

- **El botó `+`** de la barra d'eines crea un fitxer de workflow, amb un workflow buit per començar.
- **YAML** mostra el fitxer tal com està escrit. Les altres pestanyes també conserven els comentaris i l'ordre de les claus.
- **Visual** dibuixa cada workflow del fitxer com un graf, amb el seu nom i la seva descripció a sobre. Un fitxer amb dos workflows
  mostra tots dos, l'un sota l'altre.
- **Previsualització** és una simulació del workflow: vegeu [Provar-lo](#trying-it-out).

Els problemes es mostren a sobre del graf, cadascun amb un enllaç que obre el YAML a la seva línia: un enllaç a un node que no
existeix, un bucle, o un playbook, inventari, credencial, runner o repositori que el dissenyador no coneix.

---

## El graf

El graf es llegeix d'esquerra a dreta, des de **START** fins als últims nodes. Cada node mostra el seu identificador i, a sota, què
executa; els enllaços tenen colors segons què els activa, tal com indica la llegenda dins del graf: en cas d'èxit, en cas d'error,
sempre.

- **Fes clic a START** per afegir un primer node: un node sense pare, que s'executa tan bon punt comença el workflow.
- **Fes clic en un node** per editar-lo.
- **Fes clic en un enllaç** per canviar què l'activa, o per treure'l.

---

## Afegir un node

Un node nou s'afegeix amb un assistent: **Node nou si té èxit**, **Node nou si falla** o **Node nou sempre** en un node
existent, o START per al primer.

1. **Què executa**: l'identificador del node, **Executa** (quin tipus de node és i, per a un node de playbook, on s'executa)
   i què executa: un playbook o una plantilla o job, un workflow, el nom i el temps límit d'una aprovació, o un repositori. Vegeu
   [On s'executa un node](#where-a-node-runs).
2. **Com s'executa**: les opcions d'execució: l'inventari, les credencials, el límit, les etiquetes, la verbositat,
   el mode check i el mode diff, la condició (**S'executa si**) i **Valors de** (vegeu [el fitxer de workflow](file.html#run-settings)).
3. **On va**: el node després del qual s'executa, i en quin cas.

**Crear** afegeix el node al YAML.

---

## On s'executa un node

**Executa** indica què executa un node i on, en una sola llista: **Playbook a l'RTE**, **Plantilla a AWX**, **Plantilla a
Semaphore**, **Job a Rundeck**, **Job a Jenkins**, i després **Workflow**, **Aprovació** i **Pull de repositori**.

| Executa | El camp de sota | Runner |
|---|---|---|
| **Playbook a l'RTE** | **Playbook**: un playbook del dissenyador | **L'RTE per defecte**, o un runner RTE pel nom |
| **Plantilla a AWX** (AAP i Ascender inclosos) | **Plantilla**: el nom de la plantilla, escrit a mà | els runners d'AWX, cadascun amb la seva variant |
| **Plantilla a Semaphore** | **Plantilla**: el nom de la plantilla, escrit a mà | els runners de Semaphore |
| **Job a Rundeck** o **Job a Jenkins** | **Job**: el nom del job, escrit a mà | els runners de Rundeck o de Jenkins |

- **Playbook a l'RTE** s'ofereix sempre; els altres, només quan la instància té un [runner](../runners.html) d'aquest tipus.
- **Runner** només mostra els runners d'aquest tipus, amb el per defecte marcat i preseleccionat (o el primer per nom).
- Triar un altre lloc esborra el que executa el node, de manera que s'ha de tornar a triar.
- Un node el runner del qual el dissenyador no coneix mostra **Plantilla o job a** aquest runner.

El fitxer de workflow no canvia: un node així és un node `job_template` amb un `runner:` (vegeu
[el fitxer de workflow](file.html#run-settings)).

---

## Editar un node

En fer clic en un node s'obre el seu diàleg, amb quatre pestanyes:

| Pestanya | Què conté |
|---|---|
| **Què executa** | L'identificador, **Executa**, què executa i, per a un node de playbook, el runner |
| **Com s'executa** | Les opcions d'execució; les credencials es trien d'una llista, i cadascuna s'afegeix amb `+` |
| **S'executa després de** | Els enllaços que arriben al node, i **Tots els pares han de convergir** |
| **Executa després** | Els enllaços que en surten, amb **Enllaçar a un node existent:** i **Enllaçar a un node nou:** |

**Mostra en YAML** obre el YAML al node, i **Treure node** el treu amb els seus enllaços. Cada canvi s'escriu al
YAML immediatament; **Desa** desa el fitxer.

---

## Provar-lo

La pestanya **Previsualització** recorre el workflow sense llançar res, segons les regles d'AWX.

Tots els nodes comencen amb èxit. Fes clic en un node perquè falli, i torna-hi a fer clic perquè tingui èxit; llavors el graf mostra
quins nodes s'executarien, quins no s'executarien i si el workflow fallaria. **Restablir** torna a fer que tots els nodes tinguin èxit.
