---
layout: default
title: Rellançament
parent: Validació del llançament
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Rellançament
{: .no_toc }

Com es valida una tasca rellançada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Una tasca es pot rellançar de dues maneres. Com es comprova el rellançament depèn de quina es faci servir, i del mode de validació
del llançament.

---

## Dos tipus de rellançament

Els dos tipus es diferencien en si qui fa la crida envia valors nous o no:

* **Tal com es va executar**: el botó Rellança, `POST /api/v2/job/{id}/relaunch` sense cos, o `relaunch_job` sense
  `values`.
* **Amb canvis**: les mateixes crides amb valors nous, aplicats per sobre dels valors dels camps desats de la tasca:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Com es comprova cadascun

El mode de validació del llançament decideix si un rellançament es reprodueix o es torna a comprovar:

| Rellançament | `off` / `log` | `enforce` |
|---|---|---|
| **Tal com es va executar** | reprodueix les extravars desades de la tasca, contrasenyes incloses | la comprovació completa, a partir dels valors dels camps desats |
| **Amb canvis** | la comprovació completa, sobre els valors desats amb els canvis aplicats a sobre | la comprovació completa, de la mateixa manera |

Una excepció amb `enforce`: una tasca llançada per una programació de nivell d'administrador no té valors de camp propis, de manera que rellançar-la tal com es va executar
reprodueix les extravars desades de la programació, per a un administrador o per a un usuari amb l'opció de rol `allowScheduledJobs`.

Un rellançament comprovat (vegeu [Registrar i aplicar](log-and-enforce.html)) inicia una tasca nova a nom de qui fa la crida.

---

## Camps de contrasenya

Els valors dels camps desats no contenen contrasenyes, de manera que un rellançament comprovat no en té cap per a un **camp de contrasenya visible**:

* El rellançament es rebutja com a `unsupported`, amb els `passwordFields` que li falten.
* Torna a llançar el formulari i introdueix la contrasenya.
* Un camp de contrasenya que les dependències del formulari **amaguen** no és necessari i no bloqueja el rellançament.

Amb `enforce`, això també s'aplica al botó Rellança.

---

## Qui pot rellançar

Tots dos tipus de rellançament requereixen:

* que el formulari permeti el rellançament (`allowRelaunch`, true per defecte);
* l'opció de rol `allowJobRelaunch`;
* que l'usuari sigui **el propietari de la tasca**, un administrador o un usuari amb l'opció de rol `manageAllJobs`.

Veure totes les tasques (`showAllJobLogs`) no és suficient per rellançar la tasca d'un altre usuari. Els aprovadors poden veure una tasca que espera la seva
aprovació, però tampoc no la poden rellançar.
