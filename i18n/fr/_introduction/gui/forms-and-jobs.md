---
layout: default
title: Formulaires et jobs
parent: Visite de l'interface
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

# Formulaires et jobs
{: .no_toc }

La connexion, le tableau de bord, remplir un formulaire et suivre ses jobs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Connexion

La page d'authentification des utilisateurs, avec la prise en charge de l'authentification locale, LDAP, Entra ID et OIDC.

![Connexion](../assets/screenshots/login.jpg)

---

## Le tableau de bord

Le tableau de bord principal affiche tous les formulaires disponibles, rangés par catégorie.

![Tableau de bord](../assets/screenshots/dashboard.jpg)

---

## Un formulaire

Un exemple de formulaire avec des sources de données externes et des champs dynamiques.

![Exemple de formulaire](../assets/screenshots/form.jpg)

---

## Aperçu JSON du formulaire

Prévisualisez le contenu JSON et les variables supplémentaires transmis à Ansible avant de lancer le job.

![Aperçu JSON du formulaire](../assets/screenshots/form-json.jpg)

---

## Job en cours

L'exécution en temps réel d'un playbook Ansible, avec la sortie en direct.

![Job en cours](../assets/screenshots/run.jpg)

---

## Sortie du job

La sortie complète d'un playbook Ansible exécuté.

![Sortie du job](../assets/screenshots/job-output.jpg)

---

## Journal des jobs

Tous les jobs avec leur statut et leurs horaires, filtrés par statut depuis le menu de gauche.

![Journal des jobs](../assets/screenshots/job-log.jpg)

---

## Multi-étapes

Un job multi-étapes, avec la sortie de chaque étape sous le job principal. Les formulaires multi-étapes sont obsolètes depuis la 7 : un
[workflow](../workflows/) enchaîne à la place playbooks, modèles et approbations.

![Formulaire multi-étapes](../assets/screenshots/multistep.jpg)

---

## Planifications

Planifiez l'exécution de formulaires à des heures ou à des intervalles précis. Les [exemples cron](../faq.html#which-cron-expressions-can-i-use) listent les
expressions courantes et expliquent dans quel fuseau horaire une planification s'exécute.

![Planifications](../assets/screenshots/schedules.jpg)
