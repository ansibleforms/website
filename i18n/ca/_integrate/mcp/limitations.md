---
layout: default
title: Limitacions
parent: Servidor MCP
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Limitacions
{: .no_toc }

Les expressions s'executen al servidor, i què no fa el servidor MCP
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Expressions runLocal

Les expressions `runLocal`, els camps `local` / `credential` / `html` i els valors predeterminats `evalDefault`
s'avaluen al servidor, en un context V8 separat: sense `process`, `require`, xarxa ni
temporitzadors, sense compilar cadenes en codi, amb un límit de temps de 2 segons i només amb les funcions
auxiliars que ofereix el navegador (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Això protegeix contra expressions defectuoses o descontrolades. No és un sandbox per a codi hostil,
i no cal que ho sigui: el codi ve de la definició del formulari, mai de qui crida el servidor
MCP, i cada valor que envia qui crida se substitueix com un literal de JavaScript.

Una expressió que fa servir una API del navegador (`window`, `document`, `fetch`) no s'hi pot executar i
retorna `status: error`.

Les expressions del costat del servidor (sense `runLocal`) passen per les mateixes
regles d'[`EXPRESSION_SANITIZER`](../customization) que per al navegador.

---

## Limitacions

Alguns formularis i camps encara no es poden fer servir a través del servidor MCP:

- Els **formularis d'assistent (wizard)** encara no es poden llançar. Els seus passos es poden resoldre amb `subform`.
- Els **camps de fitxer** no es poden emplenar; es rebutja un formulari amb un camp de fitxer que tingui valor.
- **Files de llista** (i un camp `yaml` amb un subform, que és una fila d'aquest tipus): cada fila que
  envies, excepte una que porti el `deleteMarker` de la llista, es resol a través del seu subform amb
  els valors del formulari com a `__parent__` i després es valida. Això inclou les llistes niades, en què
  `__parent__.__parent__` arriba al formulari. Envia files planes, és a dir, els valors en brut dels camps
  del subform. Les files que fallen es llisten per camp de llista a `rowErrors`
  (`vms[1].disks[0].size (missing)` al missatge). S'accepten com a màxim 500 files per crida,
  sumant tots els nivells.
- Un enum deixat en `__auto__` mai s'emplena amb la seva primera opció; qui crida ha de triar.
- Cada petició MCP crea una entrada al registre d'auditoria (acció "Sol·licitud MCP (agent d'IA)"); la
  tasca mateixa es registra a nom de l'usuari, com qualsevol altre llançament.
