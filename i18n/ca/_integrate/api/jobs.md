---
layout: default
title: Tasques
parent: API REST
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Tasques
{: .no_toc }

Llançar un formulari, seguir la tasca, avortar-la, rellançar-la o aprovar-la
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Una tasca és una execució d'un formulari. Llança-la amb el nom del formulari i els seus valors, i després segueix-la pel seu ID.

---

## Llançar un formulari

Envia el nom del formulari i els seus valors a `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

La petició accepta aquestes propietats:

| Propietat | Significat |
|---|---|
| `formName` | El nom del formulari que es llança. Obligatori. |
| `extravars` | Les variables extra de la tasca. També s'accepta `payload` com a nom alternatiu. |
| `rawFormData` | Els valors dels camps del formulari, tal com els té el navegador. La [validació del llançament](../launch-validation/) els comprova i construeix les extravars a partir d'ells. |
| `credentials` | Credencials que es passen a la tasca, pel nom. |
| `files` | Els fitxers pujats als camps de fitxer del formulari (consulta [Pujada de fitxers](../launch-validation/file-uploads.html)). |

La resposta conté l'ID de la tasca nova:

```json
{ "id": 42 }
```

Per executar la tasca en mode detallat, afegeix `"__verbose__": true` a les extravars. Necessita l'opció de rol `allowVerboseMode`,
o el llançament respon `403`.

---

## Pujar un fitxer

Un formulari amb un camp de fitxer necessita que primer es pugi el fitxer. Envia'l com a part multipart `file` a `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

La resposta descriu el fitxer desat:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Passa'l sense canvis al `files` del llançament, sota el nom del camp de fitxer: `"files": { "firmware": { ... } }`. El servidor
el comprova amb el seu propi disc (consulta [Pujada de fitxers](../launch-validation/file-uploads.html)).

---

## Seguir la tasca

Llegeix la tasca pel seu ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

La tasca conté el seu `status`, les seves `extravars` (també com a `payload`, el mateix objecte), els seus `subjobs` i el seu `output`. La
sortida és HTML amb els colors de la pàgina de la tasca; afegeix `?text=true` per obtenir text pla, més adequat per a un script o un registre:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

El seu `status` és `running` mentre s'executa, i `approve` mentre espera una aprovació. Una tasca acaba amb un d'aquests:

| Estat | Significat |
|---|---|
| `success` | La tasca ha acabat sense errors |
| `failed` | La tasca ha fallat |
| `warning` | Una tasca de diversos passos ha acabat, però un pas que té `continue` definit ha fallat pel camí |
| `aborted` | La tasca s'ha avortat |
| `rejected` | L'aprovació s'ha rebutjat, així que el que l'esperava no s'ha executat |
| `abandoned` | El procés que seguia la tasca s'ha aturat (un reinici, un contenidor substituït) i s'ha abandonat la tasca |

Una tasca que s'executava en un runner quan es va abandonar encara pot acabar amb el seu resultat real, si al final aquell runner l'acaba.

---

## Cercar tasques

`GET /api/v2/job` llista primer les tasques més noves, com a `{ "count": ..., "records": [ ... ] }`. Aquests paràmetres de consulta en restringeixen la llista:

| Paràmetre | Significat |
|---|---|
| `records` | Quantes tasques, com a màxim. El valor predeterminat és [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), i 5000 el màxim tret que `JOBS_LIST_SIZE` sigui més alt. |
| `user`, `user_type` | Només les tasques d'aquest usuari. `user_type` és `local` quan s'omet (`ldap`, `azuread`, `oidc` per als altres). |
| `runner` | Només les tasques que s'han executat en aquest runner |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Un usuari veu les seves pròpies tasques i les tasques que esperen una aprovació que pot donar un dels seus rols. Un administrador, o un rol amb l'opció
`showAllJobLogs` o `manageAllJobs`, veu totes les tasques. Un registre conté el resum de la tasca (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); llegeix
la tasca mateixa per obtenir-ne les extravars i la sortida.

`GET /api/v2/job/approvals` respon amb un número: quantes tasques esperen una aprovació que l'usuari pot donar.

---

## Més informació sobre una tasca

Aquests endpoints llegeixen més dades d'una tasca:

| Crida | Què retorna |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | Els valors dels camps amb què es va llançar la tasca, tal com els tenia el formulari. S'apliquen els mateixos permisos que en un rellançament: la teva pròpia tasca (o totes les tasques per a un administrador o un rol amb `manageAllJobs`), un formulari que permeti rellançar, i l'opció de rol `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Els esdeveniments estructurats d'una tasca de playbook (des de la 7.3.0, per a un playbook en un RTE de la 7.3.0 o posterior): cada play, tasca, resultat per host i el resum, amb els seus `order`, `type`, `play`, `task`, `host`, `duration` i `time` |
| `GET /api/v2/job/{id}/events/{order}` | Un d'aquests esdeveniments amb tot el seu `result`, tal com el mostra el diàleg **Resultat de la tasca**; `400` quan `order` no és un nombre enter, `404` quan la tasca no té aquest esdeveniment |
| `GET /api/v2/job/{id}/node/{nodeId}` | Un node d'una tasca de workflow: `{ "node", "job", "extravars", "artifacts" }`, on `job` és l'ID de la tasca pròpia del node, o `null` quan el node no s'ha executat. |

---

## Altres accions

Aquests endpoints actuen sobre una tasca existent:

| Crida | Acció |
|---|---|
| `POST /api/v2/job/{id}/abort` | Avorta una tasca en execució |
| `POST /api/v2/job/{id}/relaunch` | Rellança una tasca, tal com es va executar o amb canvis (consulta [Rellançar](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Aprova una tasca que espera aprovació; la teva pròpia tasca respon `403`, tret que la seva aprovació defineixi `allowSelf: true` o siguis administrador |
| `POST /api/v2/job/{id}/reject` | Rebutja una tasca que espera aprovació |
| `GET /api/v2/job/{id}/download` | Baixa la sortida de la tasca |
| `DELETE /api/v2/job/{id}` | Suprimeix una tasca |

Avortar, aprovar, rebutjar i suprimir responen amb un missatge, i un rellançament també amb l'ID de la tasca nova:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Afegeix `?verbose=true` a un rellançament per executar la tasca nova en mode detallat, amb l'opció de rol `allowVerboseMode`. Una tasca que
és en un estat que no correspon a l'acció, per exemple avortar una tasca que ja ha acabat, respon `409`.
