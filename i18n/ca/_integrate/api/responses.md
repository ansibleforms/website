---
layout: default
title: Respostes i errors
parent: API REST
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Respostes i errors
{: .no_toc }

La forma d'una resposta i els codis d'estat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Les respostes són JSON pla, i el codi d'estat HTTP indica si una crida ha tingut èxit.

---

## Respostes

Una crida correcta retorna l'objecte mateix, o una llista amb la seva mida:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Un error retorna un missatge, i detalls quan n'hi ha:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Codis d'estat

El codi d'estat indica què ha anat malament:

| Codi | Significat |
|---|---|
| `200` | La crida ha tingut èxit |
| `400` | La petició està mal formada, per exemple una renovació de token sense token de renovació, o una pujada sense fitxer |
| `401` | El token falta, és incorrecte o ha caducat: inicia sessió o renova'l |
| `403` | Els rols de l'usuari no permeten la crida (inclòs aprovar la teva pròpia tasca, tret que la seva aprovació defineixi `allowSelf: true` o siguis administrador), o el compte ha de fer alguna cosa abans (vegeu més avall) |
| `404` | L'objecte no existeix |
| `409` | La petició està incompleta (un llançament sense dades), o l'objecte no és en un estat que permeti l'acció |
| `422` | La [validació del llançament](../launch-validation/) ha rebutjat els valors del formulari; `details` en llista els motius |
| `429` | Massa peticions als endpoints d'inici de sessió i de tokens, o massa inicis de sessió fallits (consulta [Autenticació](authentication.html)) |
| `500` | El servidor ha fallat; el registre del servidor té el motiu |

Per a una tasca, un `409` vol dir que és en un estat que no correspon a l'acció: avortar una tasca que no s'està executant (o que ja s'ha demanat avortar),
rellançar una tasca que encara s'està executant, o aprovar o rebutjar una tasca que ja no espera cap aprovació.

---

## Un 403 amb un codi

Algunes respostes `403` porten un `code`, per a alguna cosa que l'usuari ha de fer al navegador abans que funcioni cap altra crida:

```json
{ "error": "...", "code": "password_change_required" }
```

| Codi | Què cal fer |
|---|---|
| `password_change_required` | L'usuari ha iniciat sessió amb la contrasenya predeterminada pública: canvia-la primer al perfil |
| `disclaimer_required` | L'avís legal està activat i l'usuari encara no n'ha acceptat la versió actual: accepta'l al navegador |

Un token d'API de llarga durada (consulta [Autenticació](authentication.html#long-lived-tokens)) mai queda retingut per l'avís legal.
