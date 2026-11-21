---
layout: default
title: Jobs enregistrés
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
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
**Nom**, une **Description** facultative et quand il est **Supprimé** (voir [Quand il est supprimé](#when-it-is-removed)), puis enregistrez. Les champs
mot de passe et constantes ne sont jamais enregistrés. Un sous-formulaire a la même action **Enregistrer** à côté de son bouton **Enregistrer**, et
conserve des valeurs inachevées sans les valider.

Pour charger, sélectionnez **Charger depuis le stockage** en haut du formulaire. **Charger le formulaire enregistré** liste vos jobs enregistrés pour ce formulaire, avec
leurs dates de création et d'expiration ; sélectionnez-en un pour remplir le formulaire avec ses valeurs. Rien ne s'exécute tant que vous ne soumettez pas.

Les jobs enregistrés sont conservés dans la base de données d'AnsibleForms (table `stored_jobs`), avec le nom du formulaire, votre utilisateur sous la forme
`<type>/<username>` (par exemple `local/admin`) et les valeurs en JSON. Un nom doit être unique par utilisateur et par formulaire ; enregistrer
un second job portant le même nom échoue avec « Un formulaire enregistré portant ce nom existe déjà ».

---

## Gérer les jobs enregistrés

La page **Jobs enregistrés** liste les jobs enregistrés avec leur formulaire, leur utilisateur et leurs dates de création et d'expiration, et nécessite `allowStoredJobs`.

Depuis la 7.6.0, `allowStoredJobs` suffit à ouvrir **Jobs > Enregistrés** et **Ajouter un job enregistré**, qui demandaient avant aussi `showSettings` ou
`allowScheduledJobs`. Sa liste **Formulaire** propose les formulaires que vos rôles ouvrent ; les utilisateurs avec `showSettings` ou `allowScheduledJobs` ont tous les formulaires.

Depuis la 7.7.0, la liste a une colonne triable **Dernière utilisation**, qui distingue les jobs enregistrés utilisés des abandonnés.

- **Modifier** ouvre la page propre au job enregistré : ses **Détails** (nom, description, formulaire, utilisateur, dates de création et de dernière
  utilisation, et quand il est supprimé), ses **Valeurs**, les valeurs de champ enregistrées en YAML, qui peuvent y être modifiées et enregistrées, et ses **Exécutions**.
- **Ouvrir dans le formulaire** ouvre son formulaire avec les valeurs enregistrées remplies ; rien ne s'exécute tant que vous ne soumettez pas.
- **Supprimer** le supprime. Vous pouvez supprimer vos propres jobs enregistrés ; les utilisateurs disposant de `showSettings` peuvent supprimer n'importe lequel.

---

## Dernière utilisation et exécutions

Depuis la 7.7.0, un job enregistré garde sa dernière utilisation et les jobs lancés depuis lui, pour savoir lesquels servent encore.

Ces lancements comptent comme une utilisation d'un job enregistré :

| Lancement | Quand il compte |
|---|---|
| Le formulaire ouvert depuis lui (**Ouvrir dans le formulaire**), ou rempli avec **Charger depuis le stockage** | Quand le job est lancé |
| **Exécuter plus tard** depuis ce formulaire | Quand l'exécution planifiée se déclenche, pas quand elle est planifiée |
| Une **relance** d'un job lancé depuis lui | Quand la relance démarre, avec les mêmes valeurs ou des valeurs modifiées |
| `launch_job` ou `plan_job` de MCP avec lui | Comme ci-dessus |

Les exécutions d'une planification ne comptent jamais, même celles d'une planification créée depuis un job enregistré : une planification garde sa
propre copie des valeurs. Un lancement ne compte que si l'utilisateur peut voir le job enregistré ; s'il a été supprimé ou masqué depuis, il est
ignoré et le job s'exécute quand même.

La page du job indique le job enregistré depuis lequel il a été lancé, avec un lien, si vous pouvez le voir. L'onglet **Exécutions** de la page du
job enregistré liste les jobs lancés depuis lui que vous pouvez voir, avec leur statut, leur début, leur fin et leur durée.

---

## Quand il est supprimé

Chaque job enregistré indique quand il est supprimé : jamais, à une date, ou après quelques jours sans utilisation.

| Choix | Ce qu'il fait |
|---|---|
| **Jamais** | Le garde jusqu'à ce que quelqu'un le supprime. Pas proposé tant que `STORED_JOB_UNUSED_DAYS` est défini |
| **À une date** | Le supprime à cette date |
| **Inutilisé depuis N jours** | Le supprime dès qu'aucun job n'a été lancé depuis lui pendant ce nombre de jours |

Un admin peut définir [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Paramètres > Général > Conservation). Il supprime alors tout job enregistré inutilisé pendant ce nombre de jours, les jours propres d'un job
enregistré ne peuvent être que moins nombreux, la boîte de dialogue Enregistrer part de cette valeur, et un job supprimé à une date l'est aussi dès
qu'il reste inutilisé aussi longtemps. Les jours comptent depuis la dernière utilisation ou, pour un job enregistré jamais utilisé, depuis son
enregistrement. Sa valeur par défaut, 0, ne supprime jamais un job parce qu'il est inutilisé.

Les jobs enregistrés sont supprimés chaque jour à 04:00 (dans `LOG_TZ`), à la première échéance entre leur date et leurs jours.
