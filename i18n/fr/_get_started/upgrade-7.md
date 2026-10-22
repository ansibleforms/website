---
layout: default
title: Passer à la v7
parent: Mise à niveau
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Passer à la v7
{: .no_toc }

Ce qu'il faut changer encore en 6.5, et ce qui change quand vous passez à la version 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La version 7 supprime tout ce que la 6.x avait rendu obsolète ; corrigez-le d'abord en 6.5, où l'ancien et le nouveau fonctionnent tous les deux, puis mettez à niveau.

---

## Avant la mise à niveau (en 6.5)

### Les formulaires sont dans leurs propres fichiers

Les formulaires ne se trouvent que dans le dossier des formulaires (`FORMS_FOLDER_PATH`) ou dans un dépôt de formulaires ; `config.yaml` garde les catégories, les rôles et les constantes.

- **Un fichier `forms.yaml` :** renommez-le en `config.yaml`. En 6.5, la page des paramètres propose pour cela un bouton
  **Convert forms.yaml to config.yaml**.
- **Une section `forms:` dans la configuration de base :** la version 7 la rejette. Déplacez chaque formulaire dans son propre fichier, par exemple
  en le faisant glisser vers un fichier dans le concepteur de la 6.5.
- **Variables d'environnement :**

  | Supprimée | À utiliser à la place |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` et `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### Le champ `table`

La version 7 rejette les champs `table`, et leurs propriétés (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`) disparaissent avec eux : utilisez un champ `list` avec un `subform`, et transformez le `from` de chaque colonne en expression
sur `__parent__` (voir la [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Propriétés renommées

Chaque propriété supprimée a un remplacement direct :

| Supprimée | À utiliser à la place |
|---|---|
| `disableRelaunch: true` (formulaire) | `allowRelaunch: false` |
| `noOutput: true` (champ) | `output: false` |
| `enableLogin` (option de rôle) | `allowLogin` |

### Sources de données et schémas de données

Les imports de sources de données et leurs pages d'administration ont été supprimés, de même que
la collection Galaxy d'AnsibleForms, dont les modules ne servaient qu'à eux.

- Les imports planifiés s'arrêtent et les tables des sources de données sont supprimées : notez d'abord ce dont vous avez besoin.
- Les schémas de données qu'un import remplissait sont des bases de données à part et restent en place. Un formulaire qui
  les interroge via un identifiant continue de fonctionner.
- Pour garder ces données à jour, exécutez l'import comme un playbook à vous, par exemple depuis une
  planification.

### API v1

`/api/v1/*` a été supprimé ; utilisez `/api/v2/*` (documentation interactive sur `/api/v2/docs`). Les appels
qu'utilisent habituellement les scripts sont :

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

La v2 répond avec des codes de statut HTTP (`400`, `403`, `404`, `422`) et un corps JSON simple, et non avec l'enveloppe
`{ status, message, data }` de la v1.

**Les callbacks de l'authentification unique aussi.** Une URL de redirection avec `/api/v1/` ne répond plus : la connexion revient à
la page de connexion sans connecter l'utilisateur. Remplacez-la par `/api/v2/` à deux endroits, sur le fournisseur SSO dans
AnsibleForms et dans le fournisseur d'identité (les URI de redirection de l'inscription d'application Entra ID, les URI de redirection valides
du client OIDC) :

- Entra ID : `https://<your host>/api/v2/auth/azureadoauth2/callback`, ou `/api/v2/auth/entraid/callback` depuis la 7.3.0
- OIDC : `https://<your host>/api/v2/auth/oidc/callback`

---

## Ce qui change en 7

La version 7 change la façon dont les playbooks s'exécutent et resserre plusieurs valeurs par défaut. Vérifiez chacun des points ci-dessous quand vous quittez la 6.5.

### Les playbooks s'exécutent sur un RTE

La version 7 n'exécute plus `ansible-playbook` dans le conteneur AnsibleForms. Les playbooks s'exécutent sur un environnement d'exécution (RTE),
un conteneur à part, et l'image de l'application ne contient plus ni ansible ni python. Démarrez un RTE à côté de l'application, à partir de
l'image `ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Depuis la 7.3.0, l'application appelle le RTE et garde un WebSocket ouvert (voir
[Modes](rte/modes.html)) : le RTE ne reçoit aucun paramètre de base de données ni d'`ENCRYPTION_SECRET`. Ses paramètres :

| Paramètre | Valeur |
|---|---|
| `AF_ROLE` | `rte`. Les images RTE le définissent déjà. |
| `RTE_MODE` | `inbound` : l'application appelle le RTE. Un Runner dans un autre réseau utilise `outbound` (voir [Modes](rte/modes.html)). |
| `RTE_TOKEN` | Un jeton d'au moins 16 caractères. L'application s'authentifie avec auprès du socket du RTE, et le RTE refuse de démarrer sans. |
| `RTE_FILES` | `local` quand le RTE monte le même dossier persistant que l'application, comme lorsqu'il est à côté d'elle. |

Déplacez ensuite les montages ansible du conteneur de l'application vers le RTE :

- `ansible.cfg` sur `/etc/ansible/ansible.cfg`, vos rôles sur `/etc/ansible/roles` et vos collections sur
  `/etc/ansible/collections`.
- Montez aussi sur le RTE le même dossier persistant que l'application, pour qu'il trouve les playbooks et les dépôts.

Déclarez ensuite le RTE comme runner, dans le [seed de configuration](seed/) comme le fait le projet Docker Compose, ou sous **Connexions → Runners** :
un identifiant RTE avec l'adresse du RTE (par exemple `http://rte:8000`) et le même jeton, et un runner de type RTE, en mode entrant,
qui le nomme :

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Le seed lit `RTE_TOKEN` dans l'environnement de l'application. Voir [Runners](runners.html) et [Environnements d'exécution](rte/).

{: .warning }
> **Le même contrat pour l'application et le RTE** L'application résout les identifiants d'un job et les remet au RTE scellés pour
> ce RTE (contrat RTE 2, nouveau en 7.0.0). Un RTE d'un autre contrat refuse les jobs de l'application : utilisez l'image RTE de la même
> version que l'application, et mettez les deux à niveau ensemble. Les versions 7 ultérieures continuent de fonctionner avec un RTE 7 plus ancien tant que le contrat
> reste le même (voir [Mise à l'échelle](../rte/images.html#build-your-own-rte)).


### Ce que contient l'image RTE

Le RTE existe en trois couches, chacune construite sur la précédente. Choisissez celle qui convient à vos playbooks :

| Image | Contenu |
|---|---|
| `ansibleforms-rte-full` | Celle par défaut. Ansible 14 avec ansible-core 2.21, et les collections et bibliothèques python qu'avait l'image 6.5. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core et quelques bibliothèques courantes, sans collections. Ajoutez les vôtres dans une image construite dessus. |
| `ansibleforms-rte-base` | Le serveur seul, sans python ni ansible, pour construire un RTE avec vos propres versions. |

Passer de la 6.5 (ansible 12 avec ansible-core 2.19) change aussi ceci pour vos playbooks :

- **ansible-core 2.21 :** lisez les [guides de portage](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  de la 2.20 et de la 2.21.
- **Python 3.14 :** les couches RTE tournent sur python 3.14.
- **Plus de `boto` :** l'ancienne bibliothèque `boto` 2 a disparu. La collection `amazon.aws` utilise `boto3`, qui est inclus.

Deux variables d'environnement appartiennent désormais au RTE et ne sont plus lues par l'application, définissez-les donc dans le conteneur RTE :

| Variable | Changement |
|---|---|
| `ANSIBLE_PATH` | Le dossier des playbooks, sur le RTE. |
| `PROCESS_MAX_BUFFER` | Désormais 50 MB par défaut. Au-delà, la sortie du job n'est plus stockée (le job l'indique), mais le playbook continue au lieu d'être arrêté. |


### Les conteneurs tournent sous l'uid 1000

Les images de l'application et du RTE tournent sous l'utilisateur `node` (uid 1000) au lieu de root, et leur dossier personnel est `/home/node` :

- **Donnez les volumes à l'uid 1000, une fois.** Pour les volumes persistant et ssh, lancez
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v` ; pour un dossier de l'hôte, `sudo chown -R 1000:1000 <folder>`.
  Sur Kubernetes, définissez `fsGroup: 1000`.
- **Montez le dossier ssh sur `/home/node/.ssh`**, et non sur `/root/.ssh`. Si vous avez mis
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) à `/root`, supprimez-le ou mettez-le à `/home/node`.
- **Votre propre image RTE**, construite sur une couche RTE, passe en `USER root` pour ses installations et revient en `USER node` à la fin.


### La validation au lancement est activée

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) vaut désormais `enforce` par défaut (6.5 : `off`). Chaque
lancement, depuis le navigateur ou depuis `POST /api/v2/job`, est vérifié selon les règles du formulaire, et le job utilise les extravars et
les identifiants que le serveur construit à partir des valeurs vérifiées.

- **Les appelants REST doivent envoyer `rawFormData`**, les valeurs brutes des champs telles que le navigateur les envoie. Un lancement avec seulement
  des `extravars` est refusé, car ses valeurs ne peuvent pas être vérifiées.
- **Pour voir d'abord ce qui serait refusé**, mettez `LAUNCH_VALIDATION=log` et lisez les avertissements dans le journal. `off` rétablit le
  comportement de la 6.5.

Voir [Validation au lancement](launch-validation/) pour les détails.


### Les playbooks ne voient plus les paramètres de l'application

Un playbook n'hérite plus des variables d'environnement qu'AnsibleForms lit lui-même : `ENCRYPTION_SECRET`, les paramètres `DB_*`,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, les paramètres `VAULT_*`, toutes les autres variables documentées et toutes les variables `MYSQL_*`.
Le reste de l'environnement du RTE, comme `PATH`, les proxys, les paramètres `ANSIBLE_*` et les identifiants cloud, est transmis comme avant.

Un playbook qui lisait l'une de ces variables avec `lookup('env', ...)` doit obtenir la valeur autrement : passez-la comme extravar ou comme
identifiant, ou définissez-la sur le RTE sous un autre nom.

### Seul le rôle admin gère les runners et les admins

Un utilisateur qui a accès aux paramètres n'a plus le contrôle total sur qui est admin et sur la destination des identifiants :

- **Runners :** seul le rôle admin ajoute, modifie ou supprime un runner, car un runner reçoit les identifiants des jobs
  qu'il exécute. Les utilisateurs qui ont accès aux paramètres peuvent toujours voir et tester les runners.
- **Comptes et groupes admin :** seul le rôle admin accorde le statut d'admin. Sans lui, un utilisateur ne peut pas mettre un compte dans un groupe que
  le rôle admin nomme, ni modifier, réinitialiser ou supprimer un compte admin ou un tel groupe.
- **Rôles :** un concepteur sans le rôle admin ne peut pas modifier les rôles. Un enregistrement ou une restauration dont les rôles diffèrent est refusé.

Donnez le rôle admin à la personne qui gère les runners, les admins et les rôles.

### Le mot de passe par défaut doit être changé

Un utilisateur qui se connecte avec le mot de passe par défaut public `AnsibleForms!123` doit d'abord le changer. D'ici là, tous les autres appels
d'API répondent `403` avec le code `password_change_required`, et le navigateur affiche la page de changement de mot de passe.

Connectez-vous une fois et choisissez un nouveau mot de passe, ou définissez [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) avant le
premier démarrage. Les scripts qui se connectent avec le mot de passe par défaut doivent en utiliser un autre.

### Les jetons prennent fin à la déconnexion et au changement de mot de passe

Une déconnexion met désormais fin aux jetons de cette session, et un changement de mot de passe met fin à toutes les sessions de cet utilisateur : reconnectez-vous donc après
avoir changé un mot de passe.

Un jeton d'API demandé avec `?expiryDays=` vit au plus [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) jours
(90 par défaut). Les scripts qui utilisent des jetons d'API de longue durée doivent en demander un nouveau avant son expiration.

### Entra ID a besoin de votre tenant

La connexion Entra ID (Azure AD) utilise désormais OpenID Connect sur votre propre tenant uniquement, et un utilisateur d'un autre tenant ne peut pas se
connecter. Un fournisseur sans tenant id, ou avec `common`, `organizations` ou `consumers`, est refusé.

- **Définissez le tenant id** sur le fournisseur SSO : le Directory (tenant) ID, un GUID, ou le domaine du tenant.
- **Accordez les permissions Graph :** la connexion demande `openid profile email User.Read GroupMember.Read.All`. Donnez à l'inscription
  d'application les permissions déléguées Microsoft Graph `User.Read` et `GroupMember.Read.All`, avec le consentement administrateur.
- **Préférez les id de groupe dans les rôles :** nommez un groupe `azuread/<object id>` (`entraid/<object id>` depuis la 7.3.0) plutôt que par son nom d'affichage.

Voir [Entra ID](authentication/entra-id.html) pour la configuration.

### Les mots de passe ont une longueur minimale

Un mot de passe local défini via l'application doit compter au moins
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) caractères (8 par défaut), et ne peut pas être le nom d'utilisateur ni le
mot de passe par défaut. `PASSWORD_MIN_LENGTH=0` désactive la vérification de longueur. Les mots de passe existants continuent de fonctionner.

### Lancez les conteneurs avec une politique de redémarrage

Une exception non interceptée termine désormais le processus, journalisée au niveau `crit`, au lieu de le laisser tourner dans un état inconnu. Lancez
les conteneurs avec une politique de redémarrage, comme `--restart unless-stopped` avec Docker (le projet docker-compose la définit).
Kubernetes redémarre les pods de lui-même.

### Les connexions AWX et le lien d'accueil

Deux autres choses disparaissent en 7, sans rien à faire en 6.5 :

- **Connexions AWX et AAP :** la table `awx`, `/api/v2/awx` et la page A.A.P. ont disparu. La mise à niveau déplace chaque connexion AWX ou
  AAP vers **Connexions → Runners**, comme runner de type `awx`, et les formulaires avec `awx:` continuent de fonctionner.
- **`NAV_HOME_LABEL` et `NAV_HOME_ICON` :** ne sont plus lus. Le premier lien de l'en-tête est toujours Formulaires.

### Obsolète en 7, supprimé en 8

Ces éléments fonctionnent encore en 7, mais chacun écrit un avertissement dans le journal quand il est utilisé. Passez au remplacement avant la version 8 :

| Obsolète | À utiliser à la place |
|---|---|
| Variables d'environnement `VAULT_*` | Un coffre de secrets nommé `vault` (**Connexions → Coffres de secrets**). Le premier démarrage en 7 importe les variables une fois comme ce coffre, puis les ignore. |
| Variables d'environnement `LOG_SYSLOG_*` | Un serveur syslog (**Connexions → Syslog**). Quand `LOG_SYSLOG_HOST` est défini, le premier démarrage en 7 les importe une fois comme le serveur `syslog`, qui reçoit le journal du serveur comme avant, puis les ignore. Pour envoyer aussi les entrées d'audit, configurez-le pour recevoir les deux. |
| `vault_path` sur un identifiant (API, seed de configuration) | `secret_store` et `secret_ref`. Voir [Coffres de secrets](secret-stores/). |
| Le rôle `public` dans `config.yaml` | Le rôle `default`. Le fichier est renommé au chargement de la configuration ; renommez un modèle ytt à la main. `public` dans les `roles:` d'un formulaire continue de correspondre. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` sur un formulaire ou une étape | `approval`. `hasApproval` n'a aucun effet. |
| `awx: <name>` sur un formulaire | `runner: <name>`. Une connexion AWX est un runner de type `awx`. |
| `type: multistep` sur un formulaire, avec ses `steps` | `type: workflow`, avec des nœuds qui nomment un `runner`. Voir [Formulaires workflow](forms/workflow.html). |
| La section `awx:` du seed de configuration | Des éléments `runners:` avec `type: awx` |
| `LOCK_PATH` | Rien : n'est plus lu, le verrou du concepteur est conservé dans la base de données. |
| Un RTE en mode base de données, depuis la 7.3.0 : `RTE_MODE=database` ou pas de `RTE_MODE`, avec les `DB_*` de la base de données et `ENCRYPTION_SECRET` sur le RTE | `RTE_MODE=outbound` ou `RTE_MODE=inbound`, sans `DB_*`. Le RTE rejoint une fois avec un jeton d'adhésion (`RTE_JOIN_TOKEN`), ou son runner est passé dans ce mode sous **Connexions → Runners** ou dans le seed de configuration (`rte_mode`). Voir [Modes](rte/modes.html). |
| `RTE_REGISTER`, depuis la 7.3.0 (mode base de données uniquement) | Un jeton d'adhésion (`RTE_JOIN_TOKEN`) : le RTE s'ajoute lui-même comme runner qui s'authentifie avec un identifiant RTE. |
| Un identifiant `api` ou `userpass` sur un runner du seed de configuration, depuis la 7.3.0 | Un identifiant du type du runner (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` ou `jenkins`), avec son serveur dans `url`. |
| Un runner du seed de configuration avec son propre `token`, ou `username` et `password`, depuis la 7.3.0 | Un identifiant du type du runner dans la section `credentials`, avec son serveur dans `url`, que le runner nomme avec `credential:`. En attendant, le seed en crée un nommé d'après le runner. |

`ENABLE_SSO` et `SSO_AUTO_LOGIN` ne sont plus lus depuis la 7.3.0. Le premier démarrage en 7.3 les reprend une fois : `ENABLE_SSO=0` désactive
tous les fournisseurs SSO, et `SSO_AUTO_LOGIN=1` coche **Passer la page de connexion** sur le seul fournisseur activé. Ils sont ensuite ignorés : chaque démarrage
écrit un avertissement tant qu'ils sont définis, et chaque fournisseur a **Activé** et **Passer la page de connexion** sous **Accès → SSO**.

---

## Tags d'image

`latest` passe à la 7 avec la 7.0.0. Pour rester en 6, utilisez le tag `6` (ou `6.5`) au lieu de `latest`.
Tous les tags sont listés sous [Tags d'image](installation/#image-tags).

---

## Revenir en arrière

Faites une sauvegarde avant la mise à niveau (**Paramètres → Sauvegardes**). La 6.5 tourne sur une base de données mise à niveau en 7, mais seule
la sauvegarde restaure les définitions de sources de données supprimées.
