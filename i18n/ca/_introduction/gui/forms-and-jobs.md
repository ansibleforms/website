---
layout: default
title: Formularis i tasques
parent: Recorregut per la interfície
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# Formularis i tasques
{: .no_toc }

Iniciar sessió, el tauler principal, emplenar un formulari i seguir-ne les tasques
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Inici de sessió

La pàgina d'autenticació d'usuaris, compatible amb autenticació local, LDAP, Entra ID i OIDC.

![Inici de sessió](../assets/screenshots/login.jpg)

---

## El tauler principal

El tauler principal mostra tots els formularis disponibles, organitzats per categoria.

![Tauler principal](../assets/screenshots/dashboard.jpg)

---

## Un formulari

Un exemple de formulari amb fonts de dades externes i camps dinàmics.

![Exemple de formulari](../assets/screenshots/form.jpg)

---

## Previsualització JSON del formulari

Previsualitza el payload JSON i les variables extra que es passen a Ansible abans d'executar la tasca.

![Previsualització JSON del formulari](../assets/screenshots/form-json.jpg)

---

## Tasca en execució

Execució en temps real d'un playbook d'Ansible, amb la sortida en directe.

![Tasca en execució](../assets/screenshots/run.jpg)

---

## Sortida de la tasca

La sortida completa d'un playbook d'Ansible ja executat.

![Sortida de la tasca](../assets/screenshots/job-output.jpg)

---

## Registre de tasques

Totes les tasques amb el seu estat i les seves hores, filtrades per estat des del menú de l'esquerra.

![Registre de tasques](../assets/screenshots/job-log.jpg)

---

## Diversos passos

Una tasca de diversos passos, amb la sortida de cada pas sota la tasca principal. Els formularis de diversos passos són obsolets des de la 7: un
[workflow](../workflows/) encadena playbooks, plantilles i aprovacions en el seu lloc.

![Formulari de diversos passos](../assets/screenshots/multistep.jpg)

---

## Programacions

Programa formularis perquè s'executin a hores concretes o a intervals. Els [exemples de cron](../faq.html#which-cron-expressions-can-i-use) llisten
expressions habituals i expliquen en quina zona horària s'executa una programació.

![Programacions](../assets/screenshots/schedules.jpg)
