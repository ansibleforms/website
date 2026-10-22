---
layout: default
title: Esdeveniments en directe
parent: API REST
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Esdeveniments en directe
{: .no_toc }

Saber quan canvien les tasques i la configuració, en lloc de consultar-ho periòdicament
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El servidor explica als seus clients què canvia, a mesura que canvia. Un script també pot escoltar, en lloc de llegir una tasca cada pocs segons.

---

## El flux

`GET /api/v2/events` és un flux de [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
que es manté obert. Qualsevol usuari que hagi iniciat sessió el pot obrir, amb el token bearer habitual:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Quan alguna cosa canvia, envia un esdeveniment `changed` amb el nom del que ha canviat:

```text
event: changed
data: {"name":"jobs"}
```

---

## Noms d'esdeveniments

Un esdeveniment només porta un nom, mai dades, així que no revela res que l'usuari no pugui veure. S'envien aquests noms:

| Nom | Què ha canviat |
|---|---|
| `jobs` | Una tasca: llançada, el seu estat o la seva sortida, suprimida |
| `appearance` | La configuració que mostra la capçalera: el tema, el nom, un anunci, una variable d'entorn |
| `designer` | Un bloqueig del dissenyador, pres o alliberat |
| `runners` | Un runner (des de la 7.3.0): un RTE s'ha connectat o desconnectat, ha demanat unir-se, s'ha aprovat o rebutjat, o ha canviat el seu mode o la seva configuració |

En rebre un nom, torna a llegir el que mostres a través de l'API normal (per exemple `GET /api/v2/job/42`), amb els teus propis
permisos. Un nom molt actiu s'envia com a màxim un cop per segon.

---

## Mantenir-lo obert

El flux està pensat per sobreviure a servidors intermediaris i balancejadors de càrrega, i un client es torna a connectar tot sol:

* En connectar-se, el servidor envia un esdeveniment `hello`, i demana al client que esperi 3 segons abans de tornar-se a connectar.
* Cada 15 segons envia una línia de comentari (`: ping`), perquè no es tanqui una connexió inactiva. Ignora les línies que comencen amb `:`.
* Els esdeveniments de tots els nodes d'aplicació arriben a tots els fluxos, sigui quin sigui el node al qual està connectat el client.
* Després d'una reconnexió, torna a llegir el que mostres: un esdeveniment enviat mentre el flux estava caigut no es torna a enviar.

---

## Salut i mètriques

Les sondes de liveness i readiness (`/api/v2/live`, `/api/v2/ready`) i les mètriques de Prometheus (`/api/v2/metrics`) estan
pensades per a eines de monitoratge més que per a scripts que actuen com un usuari. Consulta [Monitoratge](../production/monitoring.html).
