---
layout: default
title: Dépannage
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Dépannage
{: .no_toc }

Messages d'erreur et symptômes, pourquoi ils se produisent et comment les corriger
{: .fs-6 .fw-300 }

---

Chaque problème ci-dessous porte comme titre le message ou le symptôme que vous voyez, suivi de la cause et de la correction. Les messages sont cités
exactement comme AnsibleForms les écrit ; `<name>` représente une valeur qui change selon le cas. La plupart arrivent dans le journal du
serveur, que vous pouvez lire sous [Journal du serveur](gui/administration.html#server-log) ou avec `docker logs`.

**Base de données et démarrage**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Configuration et formulaires**

* [Could not load the forms](#could-not-load-the-forms)
* [La configuration de base a une section forms](#the-base-config-has-a-forms-section)
* [Un formulaire manque dans le tableau de bord](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Connexion**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [L'authentification Azure AD ou OIDC échoue](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Déconnecté après un redémarrage ou au bout d'une journée](#logged-out-after-a-restart-or-after-a-day)
* [Formulaires et jobs vides après une authentification unique (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Jobs**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Un job affiche le statut abandoned](#a-job-shows-the-status-abandoned)
* [Un RTE ne se connecte pas](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Dépôts git et sauvegardes**

* [Le clonage ou le pull d'un dépôt échoue](#a-repository-clone-or-pull-failed)
* [Le dépôt de formulaires n'est pas encore cloné](#the-forms-repository-is-not-cloned-yet)
* [Une sauvegarde échoue](#a-backup-failed)

La [FAQ](faq.html) traite en détail deux problèmes liés : un
[mot de passe admin perdu](faq.html#recovering-a-lost-admin-password) et
[la restriction des destinations des helpers REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms ne démarre pas, et le journal répète ces lignes toutes les 5 secondes :

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Pourquoi cela se produit**

Au démarrage, AnsibleForms attend que la base de données réponde à une requête, et continue d'attendre tant qu'elle ne répond pas.
Le `<reason>` est le message propre du pilote de base de données : une connexion refusée ou expirée désigne l'hôte ou le port,
un message d'accès refusé le nom d'utilisateur ou le mot de passe.

**Comment le corriger**

Vérifiez [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) et [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Depuis l'intérieur d'un conteneur, `localhost` est le conteneur lui-même, pas l'hôte qui fait tourner MySQL. Assurez-vous que MySQL écoute
sur une adresse réseau et que l'utilisateur peut se connecter depuis l'hôte d'AnsibleForms. AnsibleForms continue de lui-même dès
que la base de données répond ; aucun redémarrage n'est nécessaire.

---

## Schema is not ready, skipping group and user initialization

Le navigateur ouvre une page de base de données au lieu de la page de connexion, et le journal affiche :

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Pourquoi cela se produit**

Le schéma `AnsibleForms` est absent ou incomplet. Une base de données *vide* est provisionnée automatiquement au démarrage, sauf si
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) vaut `0`. Si cela échoue, par exemple parce que
l'utilisateur de base de données n'a pas le droit de créer un schéma, le journal indique `Failed to create the schema automatically : <reason>`. Un schéma
qui existe mais auquel il manque des tables (`Table '<name>' is not present`) n'est jamais recréé automatiquement, car créer le
schéma supprime d'abord toutes les tables. La page de base de données indique alors *It appears that you have an unuseable schema*.

**Comment le corriger**

Sur une nouvelle installation, donnez à l'utilisateur de base de données le droit de créer le schéma `AnsibleForms` et redémarrez, ou appuyez sur
**Créer** sur la page de base de données. Sur un schéma présent en partie, restaurez une sauvegarde ou supprimez le schéma `AnsibleForms`
incomplet pour qu'AnsibleForms puisse le recréer. Le journal liste les tables et les patchs qui ont échoué.

---

## Schema creation is disabled

La création du schéma, depuis la page de base de données ou avec `POST /api/v2/schema`, échoue avec :

```
Schema creation is disabled
```

**Pourquoi cela se produit**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) vaut `0`, ce qui désactive à la fois la création
automatique au démarrage et l'endpoint. Sur une base de données qui a déjà des utilisateurs, l'endpoint refuse aussi les appelants qui ne sont pas
connectés en tant qu'administrateur, avec `Schema creation requires an authenticated administrator`.

**Comment le corriger**

Créez le schéma une fois avec `ALLOW_SCHEMA_CREATION=1` (c'est la valeur par défaut), ou restaurez-le depuis une sauvegarde, puis remettez la
variable à `0`. Sur une base de données déjà provisionnée, connectez-vous en tant qu'administrateur avant de recréer le schéma, et n'oubliez pas
que cela supprime et recrée toutes les tables.

---

## Config seed failed, refusing to start

Le conteneur se termine juste après le démarrage, et sa sortie se termine par :

```
Config seed failed, refusing to start : <reason>
```

**Pourquoi cela se produit**

Le fichier de [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) n'a pas pu être appliqué : par exemple, ce n'est pas du YAML
valide ou il enfreint le schéma du seed ; `<reason>` dit ce qui n'a pas fonctionné. AnsibleForms refuse de démarrer plutôt que de
tourner avec la moitié de ses objets déclarés. La raison est aussi écrite sur la sortie d'erreur standard, `docker logs` et `kubectl logs` l'affichent donc.

**Comment le corriger**

Corrigez ce que nomme `<reason>` et redémarrez. Voir [Rechargement et démarrage](seed/reloading.html) pour la façon dont le seed est
appliqué, et [Exemple](seed/example.html) pour un fichier valide.

---

## ENCRYPTION_SECRET is not set

Chaque démarrage écrit cet avertissement dans le journal :

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

Ou le worker refuse de démarrer avec :

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Pourquoi cela se produit**

Les secrets stockés sont chiffrés avec [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET) : depuis la 7.3.0, ils se trouvent dans
les identifiants (les mots de passe et les jetons des annuaires LDAP, des fournisseurs SSO, des runners et des coffres de secrets, entre autres), à côté des adresses
des webhooks Slack et Teams. Sans lui, une clé publique dans le code source est utilisée. Depuis la 7.3.0, un démarrage avec un nouvel
`ENCRYPTION_SECRET` rechiffre chaque secret stocké avec lui, en une seule transaction : depuis la clé par défaut quand il est défini pour la première
fois, ou depuis [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) quand il change. Quand les
secrets stockés n'ont été chiffrés avec aucune des deux, rien n'est modifié et AnsibleForms ne démarre pas.

**Comment le corriger**

Définissez `ENCRYPTION_SECRET`, et gardez-le avec vos autres secrets : les sauvegardes ne le contiennent jamais. Le démarrage suivant écrit
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Pour le changer plus tard, mettez la nouvelle valeur dans
`ENCRYPTION_SECRET` et l'ancienne dans `ENCRYPTION_SECRET_PREVIOUS` le temps d'un démarrage, puis supprimez `ENCRYPTION_SECRET_PREVIOUS`. Quand le
worker refuse de démarrer, mettez dans `ENCRYPTION_SECRET_PREVIOUS` la clé avec laquelle les secrets ont été chiffrés, ou remettez l'ancienne valeur.

---

## Could not load the forms

Le tableau de bord n'affiche aucun formulaire et indique :

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Pourquoi cela se produit**

La configuration de base (`config.yaml`) n'a pas pu être lue ou n'est pas valide. Le `<reason>` dit pourquoi :

| Raison | Cause |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Une erreur de syntaxe YAML |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Un fichier vide, ou qui ne contient que des commentaires |
| `Duplicate role name(s) : <names>. Each role must appear once.` | Le même rôle est défini deux fois |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` est absent et son dossier n'est pas accessible en écriture |
| `There is no forms directory nor could there be one created from template.` | Le dossier des formulaires est absent et ne peut pas être créé |
| Toute autre ligne | La configuration enfreint le schéma, par exemple un rôle sans `groups` |

**Comment le corriger**

Corrigez le fichier nommé par [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH), ou le `config.yaml` du
dépôt utilisé pour la configuration. Quand des fichiers manquent, faites pointer [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) et
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) vers un emplacement persistant et accessible en écriture. Voir
[config.yaml](config/) pour la structure.

---

## La configuration de base a une section forms

Après une mise à niveau depuis la 6.x, le tableau de bord est vide, et le panneau des avertissements affiche :

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Pourquoi cela se produit**

Depuis la 7.0.0, chaque formulaire se trouve dans son propre fichier dans le dossier des formulaires. Les formulaires encore listés dans `config.yaml` sont
ignorés.

**Comment le corriger**

Déplacez chaque formulaire dans son propre fichier dans [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Voir
[Passer à la 7.x](upgrade-7.html).

---

## Un formulaire manque dans le tableau de bord

Un fichier de formulaire existe, mais un utilisateur ne voit pas le formulaire dans le tableau de bord.

**Pourquoi cela se produit**

Un utilisateur ne voit un formulaire que si l'un des `roles` du formulaire fait partie des rôles de l'utilisateur ; les admins voient tous les formulaires. Chaque utilisateur a
le rôle `default`, un formulaire avec `roles: [default]` est donc visible par tous. Les rôles d'un utilisateur viennent des groupes et des utilisateurs
listés sous `roles` dans `config.yaml`. Un formulaire sans `categories` apparaît sous **Default**, il est donc absent des
autres catégories, tout en restant listé sous **Tous les formulaires**. Enfin, un formulaire qui échoue à la validation est ignoré. Le
tableau de bord affiche alors un bouton **Cette configuration contient Avertissements ou erreurs**, qui ouvre des messages comme :

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Comment le corriger**

Ouvrez le panneau des avertissements et corrigez ce qu'il liste. Vérifiez les rôles de l'utilisateur sous
[Permissions](profile/permissions.html) dans le profil, ainsi que les `roles` et les `categories` du formulaire. Voir
[Rôles](config/roles.html) et [Catégories](config/categories.html). Quand deux fichiers définissent le même nom de formulaire,
le premier chargé l'emporte.

---

## Could not save the forms

L'enregistrement dans le concepteur échoue avec :

```
Could not save the forms.

Failed to save forms

<messages>
```

**Pourquoi cela se produit**

Le concepteur valide chaque formulaire selon le schéma avant d'écrire quoi que ce soit. Chaque ligne de `<messages>` nomme le
formulaire et le champ qui enfreignent une règle. Les options supprimées en 7.0.0 ont leur propre message, par exemple
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Comment le corriger**

Corrigez les champs que nomment les messages. Pour les options supprimées en 7.0.0, suivez [Passer à la 7.x](upgrade-7.html).
Pour valider les fichiers de formulaires avant qu'ils n'arrivent dans AnsibleForms, voir
[Validation VS Code des fichiers de formulaires](faq.html#vs-code-validation-for-form-files) dans la FAQ.

---

## The editor is read-only

Le concepteur affiche **Verrouillé** avec le nom d'un autre utilisateur, et l'enregistrement échoue avec :

```
The editor is read-only
```

**Pourquoi cela se produit**

Une seule personne à la fois peut modifier les formulaires. Le verrou est pris quand quelqu'un démarre le concepteur, et il reste jusqu'à ce
qu'il l'arrête, même s'il a fermé le navigateur sans l'arrêter. L'API refuse un enregistrement de toute autre personne avec
`Designer is locked by <username>`.

**Comment le corriger**

Demandez à `<username>` d'arrêter le concepteur. Si ce n'est pas possible, utilisez **Forcer le déverrouillage** dans le concepteur. Celui qui détient le
verrou perd les modifications qu'il n'a pas enregistrées.

---

## Abuse attempt of eval function

Un champ d'expression affiche une erreur, et le journal contient une ligne comme :

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Pourquoi cela se produit**

Les expressions côté serveur sont vérifiées avant leur exécution. Elles ne peuvent appeler que des fonctions `fn.` et `fnc.` ; les instructions multiples,
les lignes multiples, les template literals, `process.env` et des mots comme `require` ou `constructor` sont refusés. Le message
indique quelle règle a été enfreinte. Avec [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) à
`off`, chaque expression serveur échoue avec
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Comment le corriger**

Réécrivez l'expression sous forme d'un seul appel `fn.` ou d'une opération simple, ou exécutez-la dans le navigateur avec `runLocal: true`. Voir
[Expressions](expressions/) et [Expressions locales](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Un champ qui appelle une API REST reste vide, et le journal affiche :

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Pourquoi cela se produit**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) est défini, et l'hôte de l'URL n'y figure pas.
Un hôte qui correspond à [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) est refusé avec
`blocked by REST_DENIED_HOSTS entry "<entry>"`, et un hôte qui ne se résout pas avec `cannot resolve <host>`.

**Comment le corriger**

Ajoutez le nom d'hôte, ou un CIDR qui couvre ses adresses, à `REST_ALLOWED_HOSTS`, ou retirez de `REST_DENIED_HOSTS` l'entrée qui le bloque.
Voir [Restreindre les destinations des helpers REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

La page de connexion refuse un nom d'utilisateur et un mot de passe avec :

```
Authentication failed: Invalid credentials
```

**Pourquoi cela se produit**

La page de connexion donne la même réponse pour chaque échec, pour ne pas révéler si un utilisateur existe. AnsibleForms
essaie d'abord les utilisateurs locaux, puis LDAP : avec plusieurs annuaires, un nom d'utilisateur est cherché dans leur ordre sous **Accès > LDAP**,
sauf s'il nomme un annuaire (`corp\jane`) ou l'un de ses domaines de connexion (`jane@corp.example`). La vraie raison va dans le journal. Les échecs
LDAP sont journalisés sous la forme `Error connecting to ldap: <reason>`, avec des raisons comme `Wrong binding credentials` ou
`Unable to verify the certificate` ; les codes Active Directory sont traduits en `Wrong password`, `User not found`,
`Account disabled`, `Account locked` ou `Password expired`.

**Comment le corriger**

Lisez la raison dans le journal. Pour la raison complète de chaque échec de connexion, mettez
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) à `debug`, qui journalise `Ldap authentication failed: <reason>`.
Si le mot de passe de l'admin local est perdu, voir [Récupérer un mot de passe admin perdu](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Le test d'un annuaire LDAP sous **Accès > LDAP** échoue avec l'un de ces messages :

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Pourquoi cela se produit**

L'utilisateur de bind ou son mot de passe est erroné, le serveur ou le port est injoignable, ou, avec TLS, le certificat du serveur ne peut pas être
vérifié avec le bundle CA. Depuis la 7.3.0, ces éléments se trouvent sur l'identifiant ldap de l'annuaire, sous **Connexions > Identifiants**. Un utilisateur de test qui n'existe pas
compte quand même comme un test réussi, car la connexion et le bind ont fonctionné.

**Comment le corriger**

Ouvrez l'identifiant que nomme l'annuaire (l'annuaire par défaut est `main`) sous **Connexions > Identifiants**, et corrigez le DN de bind
et son mot de passe, les serveurs et le port (généralement 389, ou 636 pour LDAPS). Pour les problèmes TLS, collez le bundle CA qui a signé le
certificat du serveur LDAP ; ignorer la vérification du certificat n'est pas fait pour la production. Voir [LDAP](authentication/ldap.html).

---

## L'authentification Azure AD ou OIDC échoue

Une connexion par authentification unique revient à la page de connexion avec :

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Pourquoi cela se produit**

Le fournisseur d'identité a renvoyé l'utilisateur, mais AnsibleForms n'a pas pu terminer la connexion. Les raisons courantes sont
`azuread login is not enabled` ou `oidc login is not enabled` (le fournisseur est désactivé), et `jwt expired`, car
le relais depuis le fournisseur n'est valable que 5 minutes. Une erreur pendant le callback du fournisseur est aussi affichée
sur la page de connexion, et journalisée.

**Comment le corriger**

Activez le fournisseur sous **Accès > SSO**, et enregistrez l'URL de callback dans le fournisseur d'identité exactement telle
qu'AnsibleForms l'utilise : `https://<your host>/api/v2/auth/entraid/callback` pour Entra ID (depuis la 7.3.0 ; `azureadoauth2` fonctionne toujours), ou
`https://<your host>/api/v2/auth/oidc/callback` pour OIDC. Une URL de callback avec `/api/v1/`, d'avant la 7 ou d'avant la
6.1.5, doit être mise à jour : la page de connexion se recharge alors sans connecter l'utilisateur et sans erreur. Réessayez la connexion après
un relais expiré.

---

## Not authenticated, login is not enabled for this user

Un utilisateur avec un mot de passe valide ne peut pas se connecter, et reçoit :

```
Not authenticated, login is not enabled for this user.
```

**Pourquoi cela se produit**

L'un des rôles de l'utilisateur met l'option de rôle `allowLogin` à `false`. Le journal indique
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Comment le corriger**

Retirez `allowLogin: false` du rôle, ou sortez l'utilisateur de ce rôle. Voir [Rôles](config/roles.html).

---

## Déconnecté après un redémarrage ou au bout d'une journée

Chaque utilisateur est renvoyé vers la page de connexion après un redémarrage d'AnsibleForms, ou après une journée d'utilisation.

**Pourquoi cela se produit**

Quand [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) n'est pas défini, chaque démarrage génère une
nouvelle clé de signature, et journalise
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Les jetons d'avant le
redémarrage ne sont alors plus acceptés. Indépendamment de cela, une session prend fin quand son jeton de rafraîchissement expire
(`Refresh token is expired`), après
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), 24 heures par défaut.

**Comment le corriger**

Mettez `ACCESS_TOKEN_SECRET` à une valeur fixe et secrète. Augmentez `ACCESS_TOKEN_REFRESH_EXPIRATION` si une journée est trop courte. Pour
un accès API de longue durée, utilisez un [jeton d'API](profile/api-token.html).

---

## Formulaires et jobs vides après une authentification unique (HTTP 431)

Un utilisateur se connecte avec Entra ID ou OIDC sans erreur, mais les pages des formulaires et des jobs restent vides. L'onglet réseau
du navigateur montre que les appels API ont reçu cette réponse :

```
431 Request Header Fields Too Large
```

Le journal du serveur n'affiche rien pour ces appels, et le même utilisateur peut très bien fonctionner avec un compte LDAP ou local.

**Pourquoi cela se produit**

Avant la 7.1.0, le jeton de connexion contenait tous les groupes de l'utilisateur, et les groupes Entra ID y figuraient deux fois, par object id
et par nom. Le navigateur envoie ce jeton dans l'en-tête `Authorization` de chaque requête, si bien qu'un utilisateur membre d'une centaine
de groupes ou plus se retrouve avec un en-tête de bien plus de 16 KB. Node.js refuse les en-têtes de requête de plus de 16 KB avec un 431,
avant que la requête n'atteigne AnsibleForms, c'est pourquoi rien n'est journalisé. Un reverse proxy placé devant peut refuser la
requête encore plus tôt : Nginx autorise 8 KB par champ d'en-tête par défaut
(`large_client_header_buffers 4 8k`), et répond alors 400.

**Comment le corriger**

Passez à la 7.1.0 ou ultérieure : le jeton de connexion ne contient plus les groupes, sa taille ne dépend donc plus du nombre de
groupes d'un utilisateur, et l'interface le signale quand une requête est refusée avec un 431 au lieu d'afficher des pages vides.
En attendant de pouvoir mettre à niveau, au choix :

* définissez un **Filtre de groupe** sur le fournisseur sous **Accès > SSO**, une expression régulière qui ne garde que les groupes qu'utilisent vos
  rôles, voir [Entra ID](authentication/entra-id.html) ou [OIDC](authentication/oidc.html) ; l'utilisateur se reconnecte
  pour obtenir un jeton plus petit
* ou augmentez la limite de Node.js avec la variable d'environnement `NODE_OPTIONS=--max-http-header-size=65536`, et
  redémarrez AnsibleForms

Depuis la 7.1.0, [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) définit la même limite, 16384
octets par défaut et lue au démarrage, pour d'autres en-têtes volumineux, comme de gros cookies posés par une passerelle d'authentification unique
placée devant. Augmentez aussi les limites d'en-têtes du proxy, voir [Taille des en-têtes de requête](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Un job Ansible se termine en échec, et la dernière ligne de sa sortie est :

```
[ERROR]: Playbook failed with status (<code>)
```

**Pourquoi cela se produit**

`ansible-playbook` s'est terminé avec un code non nul. Les lignes au-dessus contiennent l'erreur propre d'Ansible : le playbook est
introuvable, un hôte était injoignable, une tâche a échoué, ou l'inventaire est erroné. Le playbook est cherché dans le dépôt
qui a **Utiliser pour les playbooks ?** activé, ou dans [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) ; la ligne de journal
`Running from directory : <path>` montre le dossier utilisé.

**Comment le corriger**

Lisez la sortie du job au-dessus de la dernière ligne. Quand le playbook est introuvable, comparez le `playbook` du formulaire avec le
dossier de `Running from directory`. Voir [Formulaires ansible](forms/ansible.html).

---

## Playbook was aborted by the main process

Un job Ansible se termine en échec avec :

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Pourquoi cela se produit**

Le processus `ansible-playbook` sur le RTE a été arrêté par un signal, et personne n'a interrompu le job. Depuis la 7.0.0, la taille de la
sortie ne provoque plus cela : au-delà de [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (50 MB par flux
par défaut), le reste de la sortie n'est pas stocké, le job affiche
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
et le playbook va jusqu'au bout. La cause habituelle est désormais la mémoire : le conteneur RTE a atteint sa limite de mémoire et le
noyau a tué le playbook, par exemple avec beaucoup de forks ou de gros facts.

**Comment le corriger**

Surveillez la mémoire du conteneur RTE pendant l'exécution du playbook (`docker stats`, `kubectl top pod`) et augmentez sa limite, ou réduisez
la consommation mémoire du playbook (moins de `forks`, pas de collecte de facts inutile). Quand vous ne voyez que l'avertissement `PROCESS_MAX_BUFFER` et
avez besoin de toute la sortie, augmentez `PROCESS_MAX_BUFFER` dans l'environnement du conteneur RTE ; c'est le RTE qui le lit, pas l'application.
---

## Failed to launch awx template

Un job AWX se termine en échec, avec une sortie qui commence par :

```
failed to launch awx template <name>
```

**Pourquoi cela se produit**

La ligne suivante donne la raison. `Request failed with status code 401` signifie que le jeton ou le nom d'utilisateur et le mot de passe de
l'identifiant du runner AWX sont refusés. `could not find job template <name>` signifie qu'aucun modèle de job ni aucun modèle de workflow
ne porte exactement ce nom, ou que l'utilisateur de la connexion ne peut pas le voir. Une erreur de certificat, comme
`unable to verify the first certificate`, signifie que le certificat d'AWX n'est pas approuvé.

**Comment le corriger**

Utilisez **Tester la connexion** sur le runner (**Connexions > Runners**), qui répond `Runner connection is OK` quand tout fonctionne. Depuis la
7.3.0, le jeton ou l'utilisateur et le mot de passe, l'adresse et le **Bundle CA** se trouvent sur l'identifiant du runner, sous
**Connexions > Identifiants** : renouvelez-y le jeton ou le mot de passe, et pour les erreurs de certificat collez la CA dans son **Bundle CA**.
Vérifiez le nom et les permissions du modèle. Saisissez l'adresse sans `/api/v2` : AnsibleForms ajoute
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) lui-même.
Voir [Formulaires AWX](forms/awx.html).

---

## Un job affiche le statut abandoned

Un job qui tournait est maintenant marqué `abandoned`, et le journal d'un nœud ou d'un RTE affiche l'un de ces messages :

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Un RTE en mode base de données, obsolète, journalise les siens :

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Pourquoi cela se produit**

Un job appartient au conteneur qui l'exécute ou le suit : un playbook à son RTE, tout autre job (un job AWX, les étapes d'un formulaire
multi-étapes) au nœud d'application qui l'a démarré. Quand ce conteneur redémarre, il termine ses propres jobs inachevés. Quand il disparaît, un pod
remplacé par exemple, le worker termine ses jobs dès qu'il ne répond plus depuis deux minutes. Un RTE en mode socket qui revient sans
un job qu'il exécutait, un nouveau conteneur sans son spool par exemple, voit ce job se terminer comme abandonné. Un RTE qui s'arrête attend d'abord
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) pour ses playbooks. Toutes les heures, les jobs qui tournent depuis plus
d'une journée sont aussi marqués comme abandonnés.

Depuis la 7.3.0, un job sur AWX, AAP ou Ascender continue sur son runner : juste après qu'un redémarrage l'a abandonné, un nœud le suit à nouveau,
s'il a démarré dans les dernières 24 heures, et il se termine avec ce qui s'est réellement passé là-bas. Le journal indique alors `Following <n> abandoned job(s) again on their runner`.

**Comment le corriger**

Relancez un job de playbook. Redémarrez ou mettez à niveau les RTE et les nœuds d'application quand aucun job ne tourne, et laissez assez de temps à un RTE qui s'arrête
(voir [Mise à l'échelle](rte/run.html)). Vérifiez si le playbook s'est vraiment terminé sur les hôtes gérés avant de
relancer, car il a pu s'exécuter en partie.

---

## Un RTE ne se connecte pas

**Tester la connexion** sur un runner RTE (**Connexions > Runners**) échoue avec :

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Pourquoi cela se produit**

Un RTE en mode socket communique avec l'application via un WebSocket : en sortant, il appelle l'application ; en entrant, c'est l'application qui l'appelle (voir
[Modes](rte/modes.html)). Les journaux de l'application et du RTE disent pourquoi le socket n'est pas ouvert :

| Message | Où | Ce que cela signifie |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | Le RTE (entrant) | Le jeton de l'identifiant RTE du runner n'est pas le `RTE_TOKEN` du RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | L'application (entrant) | La même chose, vue depuis l'application |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | L'application, et le RTE refusé (`401`) | Le RTE s'authentifie avec un autre jeton que celui que l'application garde pour son runner |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | Le RTE (sortant) | Il a demandé à rejoindre et attend une approbation |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | Le RTE (entrant, avec `APP_URL`) | La même chose, pour un RTE entrant |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | L'application, et le RTE refusé (`409`) | Le seed de configuration déclare le runner sans `rte_mode`, donc en mode base de données, et c'est le seed qui décide de son mode. Un RTE entrant reçoit `rte_mode: inbound` et `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | Le RTE | Un RTE entrant qui s'inscrit lui-même a besoin de l'adresse à laquelle l'application l'appelle |
| `Runner '<name>': dialing <address>: <reason>` | L'application, au niveau `debug` | L'application ne parvient pas à ouvrir le socket, par exemple parce que le certificat du RTE n'est pas celui épinglé pour son runner |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | Le RTE | Il tourne en mode base de données, et n'ouvre aucun socket |

**Comment le corriger**

* **Un jeton refusé** : donnez au RTE le jeton de l'identifiant RTE de son runner (**Connexions > Identifiants**), ou l'inverse
* **En attente d'approbation** : approuvez-le sous **Connexions > Runners**, après avoir vérifié que l'empreinte qui y est affichée est celle de son
  journal (voir [Approuver un RTE](runners/registration.html#approving-an-rte))
* **Géré par le seed de configuration en mode base de données** : définissez `rte_mode` sur le runner dans le seed, avec un identifiant RTE (en entrant, son
  adresse), puis redémarrez le RTE
* **Entrant sans `RTE_URL`** : mettez dans `RTE_URL` l'adresse par laquelle l'application atteint le RTE, ou omettez `APP_URL` et déclarez le
  runner dans le seed ou sous **Connexions > Runners**
* **Un certificat qui n'est pas celui épinglé** : un RTE entrant en HTTPS envoie son certificat quand il s'inscrit, et l'application ne l'appelle
  qu'avec celui-là. Après un nouveau certificat, le RTE le renvoie quand il s'inscrit ; quand le bundle CA de l'identifiant a été défini
  à la main, l'application le garde et journalise
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **L'avertissement [DEPRECATED]** : définissez `RTE_MODE` sur le RTE, retirez `DB_*` de son environnement, et passez son runner dans ce mode (voir
  [Modes](rte/modes.html))

---

## The form data is not valid

Avec la validation au lancement sur `enforce`, un lancement est refusé avec `422` et :

```
The form data is not valid
```

**Pourquoi cela se produit**

Le serveur a vérifié les valeurs des champs selon les règles du formulaire et a trouvé des champs manquants ou invalides ; la réponse les liste
sous `details`. Un lancement sans `rawFormData` est refusé aussi. Un formulaire qui ne peut pas encore être vérifié, comme un assistant (wizard),
est refusé avec `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Comment le corriger**

Corrigez les champs que nomment les détails, ou les règles du formulaire si elles sont trop strictes. Passez d'abord par `log` : il journalise
`Launch validation would refuse form '<name>' ...` sans rien refuser. Voir
[Ce que fait enforce](launch-validation/log-and-enforce.html#what-enforce-does) et
[Le déployer](launch-validation/rolling-it-out.html).

---

## Le clonage ou le pull d'un dépôt échoue

Un dépôt affiche un statut en échec, et sa sortie contient l'erreur de git, ou le journal affiche
`Background clone of '<name>' failed : <reason>`.

**Pourquoi cela se produit**

Git n'a pas pu joindre le dépôt distant ou s'y authentifier. Pour les URL SSH (`git@host:path`), le dépôt distant doit accepter la clé
publique d'AnsibleForms ; pour HTTPS, le nom d'utilisateur et le jeton doivent être valides. Un pull est aussi refusé quand la copie de travail a
des modifications, avec
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Comment le corriger**

Pour SSH, copiez la clé publique depuis l'onglet **Clé** de **Connexions > SSH** et ajoutez-la comme clé de déploiement, ou à un utilisateur qui a
accès au dépôt. AnsibleForms ajoute l'hôte distant aux hôtes connus lors d'un clonage ; pour les autres hôtes, utilisez l'onglet
**Hôtes connus** de la même page. Pour
HTTPS, renouvelez le jeton. Voir [Dépôts git](gui/designer-and-git.html#git-repositories) et
[À propos des dépôts](faq.html#about-repositories).

---

## Le dépôt de formulaires n'est pas encore cloné

L'enregistrement des formulaires dans le concepteur échoue avec :

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Pourquoi cela se produit**

Un dépôt qui a **Utiliser pour les formulaires ?** activé n'a pas encore de copie de travail, parce que le clonage n'a pas été lancé ou a échoué.

**Comment le corriger**

Clonez le dépôt depuis les paramètres des dépôts. Si le clonage échoue, voir
[Le clonage ou le pull d'un dépôt échoue](#a-repository-clone-or-pull-failed).

---

## Une sauvegarde échoue

Une sauvegarde échoue, et rien n'est ajouté à la liste des sauvegardes. La raison est l'une de celles-ci :

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Pourquoi cela se produit**

La commande de dump, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), n'est pas installée, n'a pas réussi à se
connecter, ou a produit un fichier vide. Une grosse base de données peut aussi prendre plus de temps que
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), une heure par défaut.
Une sauvegarde échouée ne laisse aucun dossier derrière elle ; le journal indique `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Comment le corriger**

Installez les outils client MySQL ou MariaDB, ou mettez dans `MYSQLDUMP_COMMAND` (et `MYSQL_COMMAND` pour les restaurations) une commande
qui fonctionne sur cet hôte et avec la version de votre serveur. Augmentez `BACKUP_COMMAND_TIMEOUT_SECONDS` pour une grosse base de données.
Voir [Sauvegardes](gui/administration.html#backups).
