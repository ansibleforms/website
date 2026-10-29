---
layout: default
title: Rôles
parent: config.yaml
nav_order: 2
translated_from: 204f9e089bcb7000e0be4712ad4590ad3b3fd74b
---

# Rôles
{: .no_toc }

Associez les utilisateurs et les groupes à des rôles, et définissez ce que chaque rôle peut faire.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'attribut roles

La liste `roles` de premier niveau de config.yaml :

{% include config_attribute.html name="roles" %}

---

## Le rôle default

Chaque utilisateur connecté a le rôle `default`, si bien qu'un formulaire avec `roles: [default]` est ouvert à tous ceux qui peuvent se connecter. Il
n'y a pas d'accès anonyme : personne ne reçoit ce rôle sans se connecter.

Le rôle ne contient ni groupes ni utilisateurs, puisqu'il s'applique déjà à tout le monde. Ses `options` sont les valeurs par défaut de tous, comme
décrit dans [Options de rôle](#role-options) plus bas. `config.yaml` doit avoir un rôle `admin` et un rôle `default`, et la
page des rôles les affiche tous deux comme **Requis**.

`default` s'appelait `public` avant la 7.0.0, et l'ancien nom fonctionne toujours :

- **Dans un formulaire**, `roles: [public]` correspond toujours à tous les utilisateurs, les formulaires de vos dépôts n'ont donc pas besoin d'être modifiés.
- **Dans `config.yaml`**, un rôle appelé `public` est renommé `default` dans le fichier au chargement de la config. Seul le nom
  change, une sauvegarde de la config est faite d'abord, et une config conservée dans un dépôt a alors une modification à pousser.
- **Dans un modèle ytt**, le modèle n'est pas réécrit : la config qu'il produit est renommée, et un avertissement dans le journal vous demande
  de renommer aussi le rôle dans le modèle. La version 8 y refuse un rôle `public`.

Une config qui a à la fois un rôle `default` et un rôle `public` est refusée, car il s'agit du même rôle.

---

## Objet Role

Chaque entrée de la liste `roles` :

{% include config_object.html name="Role" %}

---

## Options de rôle

Les `options` d'un rôle activent ou désactivent des fonctionnalités pour ses membres. Depuis la 7.3.0, la page du rôle les affiche en quatre groupes,
chaque option avec un (i) qui explique ce qu'elle donne, le même texte que celui de la vue **Autorisations** du profil :

| Option | Permet à l'utilisateur de | Défaut |
|---|---|---|
| **Paramètres** | | |
| `showSettings` | Voir et modifier toutes les pages de paramètres ; le journal du serveur et les sauvegardes ont leurs propres options | Admins uniquement |
| `showAppearanceSettings` | Modifier les paramètres d'apparence, sans les autres paramètres (depuis la 7.3.0) | Désactivé |
| `showConnectionsSettings` | Gérer les paramètres de connexions (identifiants, runners et plus), sans les autres paramètres (depuis la 7.3.0) | Désactivé |
| `showLogs` | Voir le journal du serveur | Admins uniquement |
| `showAuditLog` | Voir le journal d'audit, sans les autres paramètres (depuis la 7.3.0) | Admins uniquement |
| `allowBackupOps` | Sauvegarder et restaurer la base de données | Admins uniquement |
| **Concepteur** | | |
| `showDesigner` | Voir et utiliser le concepteur | Admins uniquement |
| `allowFormDesign` | Modifier la config des formulaires dans le concepteur : catégories, constantes et formulaires. Sans elle, lecture seule (depuis la 7.3.0) | Activé |
| `designAllForms` | Voir et modifier tous les formulaires dans le concepteur. Sans elle, seulement les formulaires des rôles de l'utilisateur (depuis la 7.5.0) | Activé |
| `allowPlaybookDesign` | Modifier les playbooks dans le concepteur : les enregistrer, créer, retirer et pousser. Sans elle, lecture seule | Activé |
| `designAllPlaybooks` | Voir et modifier tous les playbooks dans le concepteur. Sans elle, seulement ceux qu'utilisent les formulaires de l'utilisateur ou qu'aucun formulaire n'utilise encore (depuis la 7.5.0) | Activé |
| `allowWorkflowDesign` | Modifier les workflows dans le concepteur : les enregistrer, créer, retirer et pousser. Sans elle, lecture seule | Activé |
| `designAllWorkflows` | Voir et modifier tous les workflows dans le concepteur. Sans elle, seulement ceux qu'utilisent les formulaires de l'utilisateur ou qu'aucun formulaire n'utilise encore (depuis la 7.5.0) | Activé |
| `allowInventoryDesign` | Modifier les inventaires dans le concepteur : les enregistrer, créer, retirer et pousser. Sans elle, lecture seule | Activé |
| `allowVarsFileDesign` | Modifier les fichiers de variables dans le concepteur : les enregistrer, créer, retirer et pousser. Sans elle, lecture seule | Activé |
| **Jobs** | | |
| `showJobs` | Voir la page des jobs | Activé |
| `showAllJobLogs` | Voir les jobs de tous les utilisateurs, pas seulement les siens | Admins uniquement |
| `manageAllJobs` | Interrompre, supprimer et relancer les jobs de tous les utilisateurs ; supprimer et relancer nécessitent aussi les deux options ci-dessous (depuis la 7.3.0) | Admins uniquement |
| `showExtravars` | Voir les extravars d'un formulaire et d'un job | Activé |
| `showDebugButtons` | Voir les boutons de débogage d'un formulaire | Activé |
| `showArtifacts` | Voir les artefacts d'un job : ce que renvoie un job AWX, ou ce qu'un playbook a collecté avec `set_stats` | Activé |
| `allowVerboseMode` | Exécuter des jobs en mode verbeux | Activé |
| `allowJobRelaunch` | Relancer un job avec les données de formulaire d'une exécution précédente | Admins uniquement |
| `allowJobDeletion` | Supprimer des jobs : les siens, ou ceux de tous les utilisateurs avec `manageAllJobs`. Sans elle, l'historique des jobs reste complet (depuis la 7.3.0) | Activé |
| `allowScheduledJobs` | Créer et gérer des planifications récurrentes et ponctuelles, sur la page **Planifications** (voir l'avertissement ci-dessous) | Admins uniquement |
| `allowPlannedJobs` | Planifier un job pour qu'il s'exécute une fois à une heure donnée (**Exécuter plus tard**) | Activé |
| `allowStoredJobs` | Enregistrer les données d'un formulaire et les recharger plus tard | Activé |
| **Accès et intégrations** | | |
| `allowLogin` | Se connecter à AnsibleForms | Activé |
| `allowChat` | Utiliser l'[assistant de chat](../chat/), quand il est activé | Activé |
| `allowMcp` | Utiliser le [serveur MCP](../mcp/) depuis un agent IA, quand il est activé | Le `allowChat` du rôle |
| `allowFileUploads` | Téléverser des fichiers via les champs fichier d'un formulaire (depuis la 7.3.0) | Activé |
| `allowApiTokens` | Créer des [jetons d'API](../profile/api-token.html) pour des scripts, jusqu'à la durée de vie maximale qu'autorise l'instance (depuis la 7.3.0) | Désactivé |
| `extendedTokenExpiration` | Créer aussi des jetons d'API qui n'expirent jamais ; nécessite `allowApiTokens` | Désactivé |

Certaines options en incluent d'autres, et la page du rôle affiche celles qui sont incluses activées et grisées :

- **`showSettings`** donne aussi `showAppearanceSettings`, `showConnectionsSettings` et `showAuditLog`.
- **`manageAllJobs`** donne aussi `showAllJobLogs`, car agir sur les jobs de tous les utilisateurs suppose de les voir.
- **Les options de conception** ne comptent qu'avec `showDesigner`, et `extendedTokenExpiration` qu'avec `allowApiTokens`.

Jusqu'à la 7.2.0, `showAllJobLogs` permettait aussi à un utilisateur d'interrompre et de supprimer les jobs qu'elle affichait ; depuis la 7.3.0, il faut `manageAllJobs`.
Un rôle d'avant la 7.3.0 avec `extendedTokenExpiration` et sans `allowApiTokens` reçoit `allowApiTokens`, et garde donc ses jetons.

`designAllForms`, `designAllPlaybooks` et `designAllWorkflows` sont toujours activées pour les admins, et ce que le concepteur montre à un
utilisateur sans elles est décrit dans [Concepteurs limités](../designer/#limited-designers).

**Admins uniquement** signifie activé pour les utilisateurs qui ont le rôle `admin`, et désactivé pour tous les autres. Quand un utilisateur correspond à plusieurs rôles,
les options se combinent comme suit :

- **Entre les rôles de l'utilisateur**, une option n'est activée que si tous les rôles qui la définissent sont d'accord : un `false` explicite l'emporte.
- **Le rôle `default`** complète les options qu'aucun des autres rôles de l'utilisateur ne définit, il peut donc contenir des valeurs par défaut pour tous.
- **Les options définies nulle part** prennent la valeur par défaut du tableau.

`showExtraVars`, avec un V majuscule, est accepté comme autre orthographe de `showExtravars` ; quand l'une des deux orthographes vaut `false`,
l'option est désactivée.

{: .warning }
> Traitez `allowScheduledJobs` comme une option de niveau admin. Les planifications n'appartiennent pas à l'utilisateur qui les a créées : chaque utilisateur ayant
> l'option voit et peut modifier toutes les planifications. Une planification s'exécute aussi avec des droits d'admin, pour n'importe quel formulaire, quels que soient les
> accès propres de son créateur. Ne l'accordez qu'aux rôles auxquels vous feriez confiance comme admins.

{: .warning }
> `allowLogin: false` sur le rôle `default` bloque tous les utilisateurs dont les autres rôles ne définissent pas `allowLogin: true`, y compris
> les admins. Réaccordez-la sur les rôles qui doivent se connecter avant d'enregistrer.
