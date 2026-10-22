---
layout: default
title: Permisos
parent: El teu perfil
nav_order: 4
translated_from: 08770187a1159539d1d450cf7dddf80c6943cfed
---

# Permisos
{: .no_toc }

Què et permeten fer els teus rols
{: .fs-6 .fw-300 }

---

Les opcions de rol s'agrupen en pestanyes, cadascuna amb quantes de les seves opcions tens, com ara `5/8`:

| Pestanya | Opcions sobre |
|---|---|
| **Accés i integracions** | L'inici de sessió, l'assistent de xat, el servidor MCP, la pujada de fitxers i els tokens d'API |
| **Dissenyador** | Obrir el dissenyador, i editar formularis, playbooks, workflows, inventaris i fitxers de variables |
| **Tasques** | Veure les tasques i les seves extravars o els seus artefactes, i rellançar, suprimir, programar i desar tasques |
| **Configuració** | Les pàgines de configuració, els registres, el registre d'auditoria i les còpies de seguretat |
| **Altres** | Una opció definida a mà en un rol que no és a cap altra pestanya; sempre és l'última pestanya |

Les altres pestanyes estan per ordre alfabètic. Cada pestanya és una taula amb les columnes **Opció** (l'opció), **Descripció**
(què fa) i **El teu accés**: **Permès** o **No permès**. Una opció que s'aplica a causa d'una altra ho indica
sota la seva descripció: **Inclosa a** una opció que tens l'activa, i **Necessita** una opció que no tens la manté desactivada.

Les opcions surten de les `options` dels teus rols a `config.yaml`; la pàgina [Rols](../config/roles.html) explica com
es combinen.
