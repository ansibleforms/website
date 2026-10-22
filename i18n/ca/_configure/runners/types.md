---
layout: default
title: Tipus de runner
parent: Runners
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Tipus de runner
{: .no_toc }

Els productes que pot ser un runner, la seva adreça i el seu accés
{: .fs-6 .fw-300 }

El pas **Tipus** ofereix una opció per producte, cadascuna amb una pista; la de l'RTE en dona el nom complet, *Entorn d'execució*. AAP i
Ascender es desen com un runner de tipus `awx` amb una variant (`aap` o `ascender`), que és també el que fa servir la llavor de configuració:

| Tipus | Exemple d'URI | Projecte | Autenticació |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | L'`RTE_TOKEN` de l'RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Un token d'API, o un usuari i una contrasenya |
| Ascender | `https://ascender.example.com/api/v2` | | Un token d'API, o un usuari i una contrasenya |
| AWX | `https://awx.example.com/api/v2` | | Un token d'API, o un usuari i una contrasenya |
| Jenkins | `https://jenkins.example.com` | La carpeta on són les tasques (opcional) | Un usuari i el token d'API d'aquest usuari |
| Rundeck | `https://rundeck.example.com` | El nom del projecte | El token d'API d'un usuari |
| Semaphore | `https://semaphore.example.com` | L'id del projecte, el número de `/project/<id>` | El token d'API d'un usuari |

Una adreça d'AWX, AAP o Ascender porta el seu camí d'API: `/api/v2`, o `/api/controller/v2` per a AAP 2.5 i posteriors.
Un RTE és la imatge d'AnsibleForms iniciada amb `AF_ROLE=rte`; com executar-ne un es descriu a
[Entorns d'execució](../rte/).
