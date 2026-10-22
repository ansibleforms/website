---
layout: default
title: Rols
parent: config.yaml
nav_order: 2
translated_from: c23a8fb9203e85e81cd128d2c129228c0a207f6c
---

# Rols
{: .no_toc }

Assigna usuaris i grups a rols, i defineix què pot fer cada rol.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'atribut roles

La llista `roles` de primer nivell de config.yaml:

{% include config_attribute.html name="roles" %}

---

## El rol default

Tots els usuaris que han iniciat sessió tenen el rol `default`, de manera que un formulari amb `roles: [default]` està obert a tothom qui pot iniciar sessió. No
hi ha accés anònim: ningú no rep aquest rol sense iniciar sessió.

El rol no conté cap grup ni cap usuari, perquè ja s'aplica a tothom. Les seves `options` són els valors predeterminats de tothom, tal com
es descriu a [Opcions de rol](#role-options) més avall. `config.yaml` ha de tenir un rol `admin` i un rol `default`, i la
pàgina de rols mostra tots dos com a **Obligatori**.

`default` es deia `public` abans de la 7.0.0, i el nom antic continua funcionant:

- **En un formulari**, `roles: [public]` continua coincidint amb tots els usuaris, així que els formularis dels teus repositoris no necessiten cap canvi.
- **A `config.yaml`**, un rol anomenat `public` es reanomena `default` al fitxer quan es carrega la configuració. Només canvia el
  nom, abans es fa una còpia de seguretat de la configuració, i una configuració guardada en un repositori queda amb un canvi pendent de fer push.
- **En una plantilla ytt**, la plantilla no es reescriu: es reanomena la configuració que produeix, i un avís al registre et demana
  que també reanomenis el rol a la plantilla. La versió 8 hi rebutja un rol `public`.

Una configuració que té alhora un rol `default` i un rol `public` es rebutja, perquè són el mateix rol.

---

## Objecte Role

Cada entrada de la llista `roles`:

{% include config_object.html name="Role" %}

---

## Opcions de rol

Les `options` d'un rol activen o desactiven funcions per als seus membres. Des de la 7.3.0 la pàgina del rol les mostra en quatre grups,
cada opció amb una (i) que explica què dona, el mateix text que mostra la vista **Permisos** del perfil:

| Opció | Permet a l'usuari | Predeterminat |
|---|---|---|
| **Configuració** | | |
| `showSettings` | Veure i canviar totes les pàgines de configuració; el registre del servidor i les còpies de seguretat tenen les seves pròpies opcions | Només admins |
| `showAppearanceSettings` | Canviar la configuració d'aparença, sense la resta de la configuració (des de la 7.3.0) | Desactivat |
| `showConnectionsSettings` | Gestionar la configuració de connexions (credencials, runners i més), sense la resta de la configuració (des de la 7.3.0) | Desactivat |
| `showLogs` | Veure el registre del servidor | Només admins |
| `showAuditLog` | Veure el registre d'auditoria, sense la resta de la configuració (des de la 7.3.0) | Només admins |
| `allowBackupOps` | Fer còpies de seguretat de la base de dades i restaurar-la | Només admins |
| **Dissenyador** | | |
| `showDesigner` | Veure i utilitzar el dissenyador | Només admins |
| `allowFormDesign` | Editar la configuració de formularis al dissenyador: categories, constants i formularis. Sense aquesta opció, només lectura (des de la 7.3.0) | Activat |
| `allowPlaybookDesign` | Editar els playbooks al dissenyador: desar-los, crear-los, treure'ls i fer-ne push. Sense aquesta opció, només lectura | Activat |
| `allowWorkflowDesign` | Editar els workflows al dissenyador: desar-los, crear-los, treure'ls i fer-ne push. Sense aquesta opció, només lectura | Activat |
| `allowInventoryDesign` | Editar els inventaris al dissenyador: desar-los, crear-los, treure'ls i fer-ne push. Sense aquesta opció, només lectura | Activat |
| `allowVarsFileDesign` | Editar els fitxers de variables al dissenyador: desar-los, crear-los, treure'ls i fer-ne push. Sense aquesta opció, només lectura | Activat |
| **Tasques** | | |
| `showJobs` | Veure la pàgina de tasques | Activat |
| `showAllJobLogs` | Veure les tasques de tots els usuaris, no només les seves | Només admins |
| `manageAllJobs` | Avortar, suprimir i tornar a llançar les tasques de tots els usuaris; suprimir i tornar a llançar també necessiten les dues opcions següents (des de la 7.3.0) | Només admins |
| `showExtravars` | Veure les extravars d'un formulari i d'una tasca | Activat |
| `showDebugButtons` | Veure els botons de depuració d'un formulari | Activat |
| `showArtifacts` | Veure els artefactes d'una tasca: el que retorna una tasca d'AWX, o el que un playbook ha recollit amb `set_stats` | Activat |
| `allowVerboseMode` | Executar tasques en mode detallat | Activat |
| `allowJobRelaunch` | Tornar a llançar una tasca amb les dades del formulari d'una execució anterior | Només admins |
| `allowJobDeletion` | Suprimir tasques: les seves, o les de tots els usuaris amb `manageAllJobs`. Sense aquesta opció, l'historial de tasques es conserva sencer (des de la 7.3.0) | Activat |
| `allowScheduledJobs` | Crear i gestionar programacions recurrents i puntuals, a la pàgina **Programacions** (vegeu l'avís més avall) | Només admins |
| `allowPlannedJobs` | Planificar una tasca perquè s'executi una vegada a una hora fixada (**Executa més tard**) | Activat |
| `allowStoredJobs` | Desar les dades d'un formulari i tornar-les a carregar més tard | Activat |
| **Accés i integracions** | | |
| `allowLogin` | Iniciar sessió a AnsibleForms | Activat |
| `allowChat` | Utilitzar l'[assistent de xat](../chat/), quan està activat | Activat |
| `allowMcp` | Utilitzar el [servidor MCP](../mcp/) des d'un agent d'IA, quan està activat | L'`allowChat` del rol |
| `allowFileUploads` | Pujar fitxers mitjançant els camps de fitxer d'un formulari (des de la 7.3.0) | Activat |
| `allowApiTokens` | Crear [tokens d'API](../profile/api-token.html) per a scripts, fins a la durada màxima que permet la instància (des de la 7.3.0) | Desactivat |
| `extendedTokenExpiration` | Crear també tokens d'API que no caduquen mai; necessita `allowApiTokens` | Desactivat |

Algunes opcions n'inclouen d'altres, i la pàgina del rol mostra les incloses activades i en gris:

- **`showSettings`** també dona `showAppearanceSettings`, `showConnectionsSettings` i `showAuditLog`.
- **`manageAllJobs`** també dona `showAllJobLogs`, ja que actuar sobre les tasques de tots els usuaris vol dir veure-les.
- **Les opcions de disseny** només compten amb `showDesigner`, i `extendedTokenExpiration` només amb `allowApiTokens`.

Fins a la 7.2.0, `showAllJobLogs` també permetia a l'usuari avortar i suprimir les tasques que mostrava; des de la 7.3.0 això requereix `manageAllJobs`.
Un rol d'abans de la 7.3.0 amb `extendedTokenExpiration` i sense `allowApiTokens` rep `allowApiTokens`, de manera que conserva els seus tokens.

**Només admins** vol dir activat per als usuaris que tenen el rol `admin`, i desactivat per a tota la resta. Quan un usuari coincideix amb diversos rols,
les opcions es combinen així:

- **Entre els rols de l'usuari**, una opció només està activada quan tots els rols que la defineixen hi estan d'acord: un `false` explícit guanya.
- **El rol `default`** completa les opcions que no defineix cap dels altres rols de l'usuari, de manera que pot contenir valors predeterminats per a tothom.
- **Les opcions que no es defineixen enlloc** prenen el valor predeterminat de la taula.

`showExtraVars`, amb V majúscula, s'accepta com una altra grafia de `showExtravars`; quan qualsevol de les dues és `false`, l'opció
està desactivada.

{: .warning }
> Tracta `allowScheduledJobs` com una opció de nivell d'admin. Les programacions no pertanyen a l'usuari que les ha creat: tots els usuaris amb
> l'opció veuen i poden canviar totes les programacions. A més, una programació s'executa amb drets d'admin, per a qualsevol formulari, sigui quin sigui
> l'accés del creador. Concedeix-la només a rols en què confiaries com a admins.

{: .warning }
> `allowLogin: false` al rol `default` deixa fora tots els usuaris els altres rols dels quals no defineixen `allowLogin: true`, inclosos
> els admins. Torna-la a concedir als rols que han de poder iniciar sessió abans de desar.
