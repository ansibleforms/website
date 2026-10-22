---
layout: default
title: Sauvegardes
parent: Exploitation en production
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Sauvegardes
{: .no_toc }

Les sauvegardes nocturnes, leur contenu, les restaurations, et ce qu'il faut conserver d'autre
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sauvegardes nocturnes

AnsibleForms se sauvegarde chaque nuit à minuit, dans le fuseau horaire de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(UTC par défaut). Ces paramètres la pilotent :

| Variable | Défaut | Signification |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Où les sauvegardes sont écrites, chacune dans un dossier horodaté |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Combien de sauvegardes nocturnes sont conservées, `0` les garde toutes |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | La commande qui fait le dump de la base de données |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | La commande qui rejoue un dump lors d'une restauration |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Combien de temps le dump et la restauration peuvent durer |

Les utilisateurs ayant l'option de rôle `allowBackupOps` peuvent aussi faire une sauvegarde à tout moment sur la page **Sauvegardes**. Seules les sauvegardes
nocturnes sont supprimées par la conservation, et seules les sauvegardes avec un dump utilisable y sont comptées, si bien qu'une série de nuits
en échec n'évince jamais la dernière bonne.

Avant qu'une mise à jour ne modifie la base de données, le worker fait d'abord une sauvegarde normale, une fois par version, nommée *Before the upgrade to
&lt;version&gt;*. Elle apparaît sur la page **Sauvegardes** et n'est jamais supprimée par la conservation nocturne. Si elle échoue (pas d'outil de dump,
`BACKUP_PATH` non accessible en écriture), la mise à jour s'arrête et explique pourquoi, afin que l'application ne démarre jamais sur une base à moitié mise à jour.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` met à jour sans sauvegarde.

Les commandes peuvent être des wrappers comme `docker exec <container> mysqldump`, si leur premier mot existe localement. Depuis la 7.3.0, elles s'exécutent
sans shell : les guillemets et `$NAME` provenant de l'environnement de la commande fonctionnent, mais `;`, `|`, `&&`, `>` et `<` sont refusés.

---

## Droits sur la base de données

Le dump s'exécute en tant que [`DB_USER`](../customization/server.html#env_DB_USER), et n'a pas besoin de plus de droits que l'application elle-même :

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Le dump est fait avec `--no-tablespaces`, si bien que le droit `PROCESS` au niveau du serveur n'est pas nécessaire, et il ignore les tables
qui décrivent les processus en cours (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). La restauration le rejoue avec le même utilisateur.
La page **Statut** affiche un avertissement sur sa vérification **Utilisateur de la base de données** quand l'utilisateur a des droits sur toutes les bases, comme `root`.

---

## Contenu d'une sauvegarde

Chaque sauvegarde est un dossier sous `BACKUP_PATH`, nommé d'après son horodatage UTC (`YYYYMMDDHHmmss`), qui contient :

| Fichier | Contenu |
|------|---------|
| `ansibleforms.sql` | Le dump de la base de données `AnsibleForms` : utilisateurs, groupes, identifiants, jobs, paramètres, la piste d'audit |
| `config.yaml` | Le fichier situé à [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | Le dossier situé à [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | Le fichier d'environnement qu'écrivent les pages de paramètres, sans `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` ni `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | La description de la sauvegarde |

Une sauvegarde dont le dump échoue est à nouveau supprimée et journalisée comme une erreur. La page **Statut** avertit quand il n'y a aucune sauvegarde,
quand la plus récente a plus de deux jours, ou quand elle n'a pas de dump utilisable, et elle vérifie que l'outil de dump existe.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) conserve quant à elle les points de restauration du concepteur (60 jours par défaut).

---

## Restaurer une sauvegarde

Restaurez depuis la [page **Sauvegardes**](../gui/administration.html#restore), avec **Créer une nouvelle sauvegarde avant la restauration** coché. Une restauration :

* rejoue `ansibleforms.sql`, qui remplace toute la base de données ; depuis la 7.3.0, une sauvegarde d'une version plus ancienne est ensuite mise à jour
  à nouveau, comme au démarrage d'une nouvelle version, et un patch qui échoue est signalé
* recopie `config.yaml`, et remplace le dossier `forms/` par celui de la sauvegarde : depuis la 7.3.0, les formulaires absents de la sauvegarde sont
  supprimés au lieu d'être conservés, les liens et le mode du dossier restent, et une copie qui échoue remet le dossier dans son état précédent
* ne restaure **pas** `managed.env`, car il décrit l'hôte d'où provient la sauvegarde. Le bouton **Restaurer l'environnement**
  le remet en place à la demande, conserve le fichier actuel sous `.env.bak`, et nécessite un redémarrage.

Une sauvegarde sans dump utilisable est refusée ; après une restauration interrompue, corrigez la cause et restaurez à nouveau.

Sur un nouvel hôte, définissez le même `ENCRYPTION_SECRET` avant de restaurer, sinon les identifiants stockés ne pourront pas être déchiffrés.

---

## Quoi sauvegarder d'autre

La sauvegarde nocturne couvre la base de données, la configuration et les formulaires, mais rien d'autre du dossier persistant :

* **`ENCRYPTION_SECRET` et `ACCESS_TOKEN_SECRET`** : jamais dans une sauvegarde, à dessein. Conservez-les dans votre gestionnaire de secrets ;
  sans le secret de chiffrement, un dump de la base de données est inutilisable pour les identifiants.
* **les sauvegardes elles-mêmes** : elles se trouvent sur le même volume que l'instance. Copiez `BACKUP_PATH` vers un autre hôte.
* **le reste du dossier persistant** : playbooks, fichiers téléversés, fichiers de variables, dépôts clonés, certificats et journaux.
  Avec le projet docker-compose, sauvegardez tout le dossier `data/`, qui contient aussi la clé SSH, les fonctions
  personnalisées et les rôles et collections Ansible.

Le contenu qui provient de git (dépôts, formulaires dans un dépôt) peut être cloné à nouveau, sa sauvegarde compte donc moins.
