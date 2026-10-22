---
layout: default
title: Jobs enregistrés
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c4e55de429d31936d8735965a2f487c070b9140d
---

# Jobs enregistrés
{: .no_toc }

Conserver les données d'un formulaire pour les recharger plus tard
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jobs enregistrés

Les jobs enregistrés conservent les valeurs d'un formulaire pour que vous puissiez les recharger, au lieu de remplir les mêmes champs à chaque fois.

Pour enregistrer, remplissez le formulaire, ouvrez la liste déroulante à côté de **Soumettre** et choisissez **Enregistrer**. Dans **Enregistrer les données du formulaire**, saisissez un
**Nom**, une **Description** facultative et une date **Expire le (optionnel)**, puis enregistrez. Les champs mot de passe et constantes ne sont
jamais enregistrés. Un sous-formulaire a la même action **Enregistrer** à côté de son bouton **Enregistrer**, et conserve des valeurs inachevées sans
les valider.

Pour charger, sélectionnez **Charger depuis le stockage** en haut du formulaire. **Charger le formulaire enregistré** liste vos jobs enregistrés pour ce formulaire, avec
leurs dates de création et d'expiration ; sélectionnez-en un pour remplir le formulaire avec ses valeurs. Rien ne s'exécute tant que vous ne soumettez pas.

Les jobs enregistrés sont conservés dans la base de données d'AnsibleForms (table `stored_jobs`), avec le nom du formulaire, votre utilisateur sous la forme
`<type>/<username>` (par exemple `local/admin`) et les valeurs en JSON. Un nom doit être unique par utilisateur et par formulaire ; enregistrer
un second job portant le même nom échoue avec « Un formulaire enregistré portant ce nom existe déjà ».

---

## Gérer les jobs enregistrés

La page **Jobs enregistrés** liste les jobs enregistrés avec leur formulaire, leur utilisateur et leurs dates de création et d'expiration, et nécessite `allowStoredJobs`.

- **Modifier** ouvre la page propre au job enregistré : ses **Détails** (nom, formulaire, expiration) et ses **Valeurs**, les valeurs de champ
  enregistrées en YAML, qui peuvent y être modifiées et enregistrées.
- **Ouvrir dans le formulaire** ouvre son formulaire avec les valeurs enregistrées remplies ; rien ne s'exécute tant que vous ne soumettez pas.
- **Supprimer** le supprime. Vous pouvez supprimer vos propres jobs enregistrés ; les utilisateurs disposant de `showSettings` peuvent supprimer n'importe lequel.
- Les jobs enregistrés dont la date **Expire le** est passée sont supprimés automatiquement chaque jour à 04:00 (dans `LOG_TZ`).
