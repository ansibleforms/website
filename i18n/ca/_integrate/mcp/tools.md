---
layout: default
title: Eines
parent: Servidor MCP
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Eines
{: .no_toc }

Les eines que fa servir un agent per emplenar, aprovar i rellançar formularis
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El servidor MCP ofereix fins a 15 eines. Sis s'ofereixen a tots els usuaris; les altres segueixen les opcions de rol de l'usuari, així que a un usuari
sense una opció no se li ofereixen les seves eines en absolut:

| Eina | Què fa | S'ofereix amb |
|---|---|---|
| `list_forms` | Els formularis que l'usuari pot fer servir: nom, descripció, categories i `enableForChat` (si l'assistent de xat l'ofereix). | sempre |
| `get_form` | La definició completa d'un formulari. Cada camp porta també `dynamic` (avaluat a partir d'una expressió o d'una consulta) i `dependsOn` (els camps que llegeix). | sempre |
| `resolve_field` | Avalua el formulari amb els valors emplenats fins ara. Vegeu més avall. | sempre |
| `launch_job` | Llança el formulari amb els valors donats, exactament com ho faria un enviament des del navegador. Retorna l'id de la tasca. | sempre |
| `relaunch_job` | Torna a llançar una tasca amb alguns camps canviats. Vegeu més avall. | sempre |
| `get_job` | Estat i sortida d'una tasca (`tail` limita la sortida a les darreres línies). | sempre |
| `plan_job` | Executa el formulari una vegada, més tard, com l'usuari: el que fa **Executa més tard (una vegada)** al formulari. | `allowPlannedJobs` |
| `create_schedule` | Crea una programació, recurrent (`cron`) o d'una sola vegada (`run_at`), com a la pàgina **Programacions**. | `allowScheduledJobs` |
| `list_schedules` | Les programacions que l'usuari pot veure: totes amb `allowScheduledJobs`, i si no, les execucions que ha planificat. | `allowPlannedJobs` o `allowScheduledJobs` |
| `get_schedule` | Una programació, amb les seves extra vars (les que semblen secrets, emmascarades) i la sortida de la seva darrera execució. | `allowPlannedJobs` o `allowScheduledJobs` |
| `delete_schedule` | Cancel·la una execució planificada o suprimeix una programació que l'usuari pot veure. | `allowPlannedJobs` o `allowScheduledJobs` |
| `list_stored_jobs` | Les [tasques desades](../jobs/stored-jobs.html) que l'usuari pot veure, sense els seus valors. | `allowStoredJobs` |
| `get_stored_job` | Una tasca desada amb els seus valors, per `id`, o per `form` i `name` entre les de l'usuari. | `allowStoredJobs` |
| `store_job` | Desa valors d'un formulari amb un nom, com fa **Desa** al formulari. | `allowStoredJobs` |
| `delete_stored_job` | Suprimeix una tasca desada que l'usuari pot veure. | `allowStoredJobs` |

`launch_job`, `relaunch_job` i `plan_job` accepten `verbose: true` per executar la tasca en mode detallat, cosa que necessita l'opció de rol
`allowVerboseMode`. Amb [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) les eines que llancen, planifiquen o
canvien coses (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` i `delete_stored_job`)
no s'ofereixen.

No hi ha cap eina per executar una expressió, una consulta, un playbook o unes extravars arbitràries. Les expressions
i les consultes només s'executen tal com les defineix el formulari.

L'[assistent de xat](../chat) també fa servir aquestes eines, amb un botó **Llança** en lloc de `launch_job`.

---

## Emplenar un formulari

Crida `resolve_field` amb el nom del formulari i els valors que tens fins ara, i torna-la a cridar després de cada resposta. Recorre
els camps en ordre de dependència i informa de cadascun:

- `status`: `resolved`, `waiting` (amb `waitingFor`), `hidden`, o `error` (el camp torna al seu valor predeterminat);
- `value`, `default` i, per als camps d'opcions, `options` (com a màxim `maxOptions`, 200 per defecte);
- `needsInput`: un camp obligatori sense valor, o una opció que encara és a `__auto__`;
- `validationErrors`: les regles que incompleix el valor, com a `[{type, description}]`, amb el missatge del navegador.

Per a tot el formulari, `missing` i `invalid` llisten el que encara cal corregir; `launch_job` el rebutja fins que `complete` és true.

La validació és el mateix codi del navegador, compartit amb la [validació del llançament](../launch-validation). Els camps ocults no
es validen, i un camp opcional buit és vàlid.

---

## Programacions i execucions planificades

`plan_job` accepta els mateixos `form`, `values` i `expectedPayloadHash` que `launch_job`, amb un `name` per a l'execució i `run_at`, una
hora ISO 8601 amb el seu desplaçament o `Z` (`2026-10-15T22:00:00+02:00`); es rebutja una hora sense zona. Els valors es resolen
i es validen ara, i es tornen a comprovar quan arriba l'execució, com en una [execució planificada](../jobs/schedules.html#planned-runs) al
navegador. La resposta dona l'hora de l'execució en UTC i segons el rellotge de l'aplicació.

`create_schedule` accepta un `form`, un `name`, o bé `cron` (cinc camps, com ara `0 22 * * 1-5`) o bé `run_at`, i les
`extraVars` que rep la tasca. Una programació així s'executa com a `Schedule Service`, sense la validació del formulari; per executar un formulari una vegada com
l'usuari, fes servir `plan_job`. Els noms de les programacions són únics.

---

## Tasques desades

Una tasca desada són els valors d'un formulari guardats amb un nom; les eines treballen amb les mateixes tasques desades que el navegador.

`list_stored_jobs` llista les tasques desades de l'usuari, o les de tothom per a un usuari amb `showSettings`, amb el nom, la descripció,
el formulari, la creació i la caducitat. Una de marcada com a `usable` (de l'usuari mateix, d'un formulari que pot llançar) es pot passar com a `storedJob`
(`{ "id": 7 }`, o `{ "name": "..." }` entre les de l'usuari d'aquell formulari) a `resolve_field`, `launch_job` o `plan_job`: els seus
valors són el punt de partida i `values` s'hi superposa. Els camps de contrasenya no es desen, així que proporciona'ls a `values`.
`launch_job` i `plan_job` a partir d'una tasca desada necessiten l'`expectedPayloadHash` que `resolve_field` hi ha retornat, i
`resolve_field` rebutja `storedJob` juntament amb `subform`.

`store_job` accepta el `form`, un `name` únic entre les tasques desades de l'usuari d'aquell formulari, els `values` i, opcionalment, una
`description` i `expires_at` (ISO 8601 amb el seu desplaçament o `Z`). La resposta indica quins camps de contrasenya s'han deixat fora.

---

## Passar valors

Passa `field` per resoldre només aquest camp i el que en depèn. Per a una fila de llista o un pas d'assistent, passa `subform` (i
opcionalment `parent`, els valors del formulari pare).

Envia els valors tal com els té el navegador. Un camp d'opcions també accepta un registre parcial o el seu valor de `valueColumn`
(`"vol1"`), i un array quan és `multiple`. Els camps calculats ignoren els valors enviats tret que siguin `editable`.

---

## Aprovar el payload exacte

Quan el formulari és complet, `resolve_field` també retorna el que enviarà `launch_job`:

- `modeledExtravars`: les extravars un cop aplicats `model`, `valueColumn` i `output`,
  amb els camps de contrasenya emmascarats;
- `credentials`: les credencials d'AnsibleForms que farà servir la tasca (noms, no secrets);
- `payloadHash`: un hash SHA-256 del nom del formulari, les extravars reals i les credencials.

Mostra `modeledExtravars` a l'operador, i passa el `payloadHash` que ha aprovat a
`launch_job` com a `expectedPayloadHash`. El llançament torna a resoldre el formulari i es rebutja
quan el payload és diferent, per exemple perquè ara una consulta respon una altra cosa.
`ansibleforms_user`, `__jobid__` i `__verbose__` s'afegeixen en el llançament i no formen part del hash.

`launch_job` només comprova el payload. Una edició del formulari que deixa el payload igual no fa que es rebutgi el llançament.
Cada resposta de `resolve_field` porta també un `formFingerprint`, un hash SHA-256 de la definició del formulari: per rebutjar un
llançament després de qualsevol edició del formulari, compara'l tu mateix abans de cridar `launch_job`, com fa el botó
**Llança** de l'assistent de xat.

---

## Rellançar amb canvis

`relaunch_job` accepta un `id` de tasca i `values`: només els camps que cal canviar, com a valors en brut.
`values` se superposa als valors amb què es va llançar originalment la tasca, i el resultat es
resol i es valida exactament com amb `launch_job`, files de llista incloses, i després es llança com una
tasca nova feta per tu (`ansibleforms_user` ets tu, no qui la va enviar originalment). Es reutilitzen els fitxers pujats de
la tasca original.

Sense `values`, és un rellançament **tal com es va executar la tasca**: les seves extravars desades es tornen a reproduir al
servidor, contrasenyes incloses (la previsualització les emmascara). Ara bé, si el formulari està sota la validació del llançament
`enforce`, el rellançament passa per la mateixa comprovació que un rellançament amb
canvis.

**Les contrasenyes mai es desen amb els valors dels camps**, així que un rellançament que passa per la
comprovació es rebutja quan el formulari mostra un camp de contrasenya, al nivell superior o en una fila de llista
(`unsupported`, amb els `passwordFields`). Un camp de contrasenya ocult per les seves dependències no
bloqueja el rellançament. Consulta [Validació del llançament](../launch-validation).

Crida-la primer amb `preview: true`: retorna `modeledExtravars` (contrasenyes emmascarades),
`credentials` i un `payloadHash` sense llançar res. Confirma'ls amb l'usuari i després crida-la
de nou amb `expectedPayloadHash`. S'apliquen els mateixos permisos que en un rellançament al navegador:
el formulari ha de permetre rellançar i els teus rols necessiten l'opció `allowJobRelaunch`. Una
tasca sense dades del formulari desades (llançada abans que existís el rellançament) i un formulari d'assistent no es poden
rellançar amb canvis.

L'API REST ofereix el mateix a través de `POST /api/v2/job/{id}/relaunch` amb el cos
`{ "values": { ... } }`; sense cos, torna a reproduir la tasca tal com es va executar.

---

## Errors

Una crida rebutjada és un error d'eina el contingut estructurat del qual porta un `code` i els detalls:

| Codi | Quan |
|---|---|
| `form_incomplete` | `launch_job` o `relaunch_job` sobre un formulari que no és complet, amb `missing`, `invalid`, `waiting`, `validationErrors` i `rowErrors` |
| `payload_mismatch` | el payload és diferent d'`expectedPayloadHash`, amb tots dos hashes |
| `access_denied` | els rols de l'usuari no donen accés al formulari, la tasca, la programació o la tasca desada, o al mode detallat, o el servidor és de només lectura |
| `not_found` | no existeix el formulari, el subform o la tasca |
| `unsupported` | un formulari d'assistent, un subform sol, un camp de fitxer, o un `relaunch_job` que necessitaria un camp de contrasenya visible |
| `no_form_data` | `relaunch_job` amb canvis per a una tasca que no va desar cap valor de formulari, com ara una que va llançar una programació; en aquest cas, rellança-la sense canvis |
| `invalid_request` | una petició que el servidor rebutja per mal formada |
| `internal_error` | qualsevol altra cosa |
