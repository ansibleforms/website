---
layout: default
title: Renforcement
parent: Sécurité
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Renforcement
{: .no_toc }

Le compte admin, les limites de connexion, la base de données, les expressions, les données des jobs, la politique du navigateur, les fonctionnalités facultatives et les options de rôle
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le compte admin

Le compte admin local est créé au premier démarrage à partir de [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
et [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), dont la valeur par défaut est `AnsibleForms!123`.

* Une connexion avec le mot de passe public par défaut `AnsibleForms!123` doit d'abord le changer : d'ici là, le serveur répond
  à toute requête autre que le changement de mot de passe par `403` (code `password_change_required`), et le navigateur affiche une
  page de changement de mot de passe impossible à fermer. Le nouveau mot de passe ne peut pas être à nouveau celui par défaut.
* `ADMIN_PASSWORD` n'est lu qu'à la première création du compte : définissez votre propre valeur avant le premier démarrage.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` réinitialise le mot de passe à `ADMIN_PASSWORD` à chaque
  démarrage. Ne l'utilisez que pour récupérer un mot de passe perdu, puis retirez-la et redémarrez.
* Définissez d'abord les deux secrets maîtres : voir [Secrets et chiffrement](secrets.html).
* Une fois la connexion LDAP ou SSO fonctionnelle, gardez l'admin local pour les urgences uniquement, avec un long mot de passe conservé dans votre coffre.

---

## Limites de connexion et mots de passe

Les tentatives de deviner un mot de passe sont freinées par trois limites. Les échecs sont comptés dans la base de données, si bien que chaque nœud d'application voit les
mêmes tentatives, et chaque limite s'applique sans redémarrage :

| Variable | Défaut | Ce qu'elle fait |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Après ce nombre de connexions échouées, un compte local ou LDAP est verrouillé pendant `LOGIN_LOCKOUT_MINUTES`. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Une adresse qui atteint ce nombre de connexions échouées en `LOGIN_LOCKOUT_MINUTES` est retenue jusqu'à la fin de cette fenêtre : une adresse qui essaie de nombreux comptes. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Combien de temps un compte reste verrouillé, et la fenêtre pendant laquelle les échecs sont comptés. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Les requêtes par minute depuis une adresse, par nœud d'application, sur la connexion, la déconnexion, le rafraîchissement du jeton et les callbacks d'authentification unique. |

Un compte verrouillé ou une adresse retenue reçoit `429` avec un en-tête `Retry-After`, avant toute vérification de mot de passe et
que le compte existe ou non ; au-delà de `AUTH_RATE_LIMIT`, la réponse est aussi `429`. Une connexion réussie remet à zéro le compteur
du compte, tout comme un admin qui définit le mot de passe de l'utilisateur. `0` désactive une limite ; `LOGIN_LOCKOUT_MINUTES=0`
désactive à la fois le verrouillage et la limite par adresse.

`LOGIN_MAX_FAILURES_PER_IP` et `AUTH_RATE_LIMIT` comptent par adresse du client : derrière un reverse proxy, définissez `TRUST_PROXY`
pour que l'adresse soit celle du client et non celle du proxy, voir [Adresses des clients](../production/reverse-proxy.html#client-addresses).

Un mot de passe local défini via l'application, pour un nouvel utilisateur, par un admin ou par un utilisateur qui change le sien, doit avoir
au moins [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) caractères (`8` par défaut,
`0` ne vérifie aucune longueur). Il ne peut être ni le nom d'utilisateur ni le mot de passe public par défaut. `ADMIN_PASSWORD` n'est pas vérifié.

---

## La base de données

AnsibleForms conserve chaque identifiant et chaque job dans sa base de données MySQL, gardez donc cette base hors du réseau :

* Le projet docker-compose publie MySQL sur l'hôte (`MYSQLDB_LOCAL_PORT`, `3306`) et est livré avec le mot de passe root
  `AnsibleForms!123`. Retirez ce mappage de port, ou liez-le à `127.0.0.1`, et changez le mot de passe.
* Connectez-vous avec un compte dédié plutôt qu'avec `root`, défini dans [`DB_USER`](../customization/server.html#env_DB_USER) et
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Il n'a besoin de droits que sur le schéma `AnsibleForms` :

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Cela couvre la création du schéma (le `CREATE DATABASE` compris), ses patchs lors des mises à jour, et les
  [sauvegardes](../production/backups.html) et restaurations, qui s'exécutent avec le même utilisateur : le dump est fait avec
  `--no-tablespaces`, si bien qu'aucun droit au niveau du serveur comme `PROCESS` n'est nécessaire. Remplacez `%` par l'adresse de
  l'application quand vous le pouvez. Un utilisateur qui a des droits sur toutes les bases, comme `root`, transforme une faille de l'application en
  faille de tout le serveur de bases de données : la page **Statut** le signale dans sa vérification **Utilisateur de la base de données**, et le journal
  à chaque démarrage.
* Mettez [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) à `0` une fois le schéma créé.
  La création du schéma supprime d'abord toutes les tables ; avec `0`, ni l'initialisation au démarrage ni l'endpoint `/api/v2/schema`
  ne peuvent l'exécuter.

---

## Expressions et appels sortants

Les expressions serveur s'exécutent sur le serveur pour tout utilisateur connecté, le filtre et les filtres sortants comptent donc :

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` ou `paranoid`, jamais `legacy`, qui permet aux utilisateurs d'exécuter du code serveur.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : les hôtes que les expressions REST ne peuvent pas atteindre, par ex. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : quand elle est définie, les expressions REST ne peuvent atteindre
  que ces hôtes et ces plages. La liste des refus l'emporte sur elle.

Les deux listes ne couvrent que les fonctions d'aide REST d'AnsibleForms lui-même ; les playbooks s'exécutent en dehors et ne sont pas filtrés.

Depuis la 7.3.0, les fonctions d'aide REST vérifient le certificat de l'endpoint, comme toute autre connexion.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` désactive la vérification : ne l'utilisez que pour
des endpoints avec un certificat auto-signé.

---

## Données des jobs

Les extravars et la sortie des jobs sont stockées dans la base de données et montrées à tous ceux qui peuvent voir le job :

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : les extravars dont la clé correspond sont
  affichées sous la forme `********`. La valeur par défaut est `password|secret|token` ; les champs mot de passe sont toujours masqués. Étendez-la avec
  les noms qu'utilisent vos formulaires, par exemple `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : réduit l'objet `ansibleforms_user`
  envoyé avec chaque job, qui contient sinon toutes les appartenances aux groupes de l'utilisateur.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) ne masque que les tâches bavardes ; masquez les secrets avec `no_log`.

---

## La Content-Security-Policy

L'interface est servie avec un en-tête Content-Security-Policy, qui limite ce qu'une page peut charger et exécuter dans le navigateur :

* Les scripts ne proviennent que de l'application elle-même, si bien qu'un script injecté dans une page ne s'exécute pas.
* Aucun autre site ne peut afficher l'interface dans un cadre.
* Elle autorise ce dont l'application a besoin : les expressions locales de formulaire évaluées dans le navigateur (`'unsafe-eval'`), les styles
  en ligne, les images depuis n'importe quelle URL (images de formulaires et de catégories), et les workers de l'éditeur de code.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) vaut `1` par défaut et devrait
le rester. Avec `0`, la politique est envoyée en `Content-Security-Policy-Report-Only` : la console du navigateur liste ce qu'elle
bloquerait, et rien n'est bloqué. N'utilisez `0` que pour une configuration qui ne peut pas encore fonctionner avec la politique, comme un reverse proxy
qui injecte son propre script. Une modification sur la page de paramètres s'applique sans redémarrage.

---

## Les pages de paramètres et le concepteur

Les administrateurs peuvent modifier une grande partie de la configuration depuis le navigateur. Restreignez cela quand la configuration est gérée ailleurs :

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : des paramètres en lecture seule, pour un [environnement géré](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : retire le concepteur intégré quand les formulaires
  sont maintenus dans git.

---

## Fonctionnalités facultatives

Ces fonctionnalités sont désactivées par défaut. Ne les activez que si vous les utilisez ; une modification sur la page de paramètres s'applique sans redémarrage :

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : sert le [serveur MCP](../mcp/) sur `/api/v2/mcp`,
  pour que des clients MCP puissent lancer des formulaires avec le jeton d'un utilisateur.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : l'[assistant de chat](../chat/). Les définitions de formulaires
  et les valeurs en cours de saisie sont envoyées au fournisseur de modèle configuré.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) fonctionne à l'inverse : elle vaut `enforce`
par défaut, si bien que le serveur refuse un lancement dont les valeurs enfreignent les règles du formulaire, y compris les lancements via l'API REST.
Laissez-la ainsi : `log` ne fait que journaliser ce qui serait refusé et `off` ne vérifie rien, voir [Validation au lancement](../launch-validation/).

---

## Options de rôle

Certaines options de rôle de [config.yaml](../config/roles.html) donnent plus que ce que suggère leur nom. Accordez-les avec prudence :

| Option | Pourquoi elle compte |
|--------|----------------|
| `allowScheduledJobs` | Un utilisateur qui l'a voit et peut modifier toutes les planifications, et une planification s'exécute avec des droits d'admin, pour n'importe quel formulaire. Traitez-la comme une option de niveau admin. |
| `allowBackupOps` | Inclut la **restauration**, qui remplace toute la base de données. |
| `showSettings` | Ouvre les pages d'administration. Sans le rôle admin, elle ne permet pas de modifier les comptes et les groupes que nomme le rôle admin, voir [Utilisateurs et groupes](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Montre le journal du serveur, qui peut contenir des noms d'hôtes, des noms d'utilisateurs et des détails d'erreurs. |
| `showConnectionsSettings` | Ouvre les pages de connexions : identifiants, runners, canaux de notification et plus. Ajouter, modifier et supprimer des runners et des coffres de secrets reste réservé à un admin, de même que les identifiants des connexions et des authentifications. Pour un dépôt, l'ajouter ou le supprimer et changer son adresse, sa branche ou ses indicateurs `use_for_*` restent réservés à un admin. |
| `showAllJobLogs` | Montre les jobs de tous les utilisateurs, pas seulement ceux de l'utilisateur. |
| `manageAllJobs` | Interrompt, supprime et relance les jobs de tous les utilisateurs. |
| `allowApiTokens` | Permet à l'utilisateur de créer des jetons d'API qui vivent jusqu'à [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 par défaut). Se déconnecter avec un jeton ou le révoquer y met fin, et un changement de mot de passe met fin à tous les jetons de l'utilisateur, voir [Jetons](secrets.html#tokens). |
| `extendedTokenExpiration` | Avec `allowApiTokens`, permet aussi à l'utilisateur de créer des jetons d'API qui n'expirent jamais. |
| `allowFileUploads` | Permet à l'utilisateur de téléverser des fichiers via les champs fichier d'un formulaire. Activée pour chaque utilisateur sauf si un rôle la désactive. |
| `allowChat`, `allowMcp` | Permettent à l'utilisateur d'utiliser l'assistant de chat et le serveur MCP, quand ils sont activés. `allowChat` est activée pour chaque utilisateur sauf si un rôle la désactive, et `allowMcp` suit `allowChat` sauf si un rôle la définit. |

Un utilisateur sans le rôle `admin` ne reçoit aucune des options de niveau admin ci-dessus sauf si un rôle les lui donne. Quand le rôle `admin`
ne définit aucune option, ses utilisateurs reçoivent `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` et `allowScheduledJobs`. `allowApiTokens` et
`extendedTokenExpiration` restent désactivées même pour le rôle `admin` : définissez-les sur les rôles qui en ont besoin.

Quand plusieurs rôles d'un utilisateur définissent la même option, `false` l'emporte. Les options du rôle `default` ne font que compléter les options
qu'aucun des rôles propres de l'utilisateur ne définit ; elles ne les annulent jamais.
