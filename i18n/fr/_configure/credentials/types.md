---
layout: default
title: Types d'identifiants
parent: Identifiants
nav_order: 1
translated_from: eb4f5cce55db979ca4f0d1304d797decc01192ee
---

# Types d'identifiants
{: .no_toc }

Ce que contient chaque type, et où il peut être choisi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les types

Le type indique à quoi sert un identifiant. Il décide des champs que demande la boîte de dialogue, et de l'endroit où il peut être choisi :

| Type | Ce qu'il contient | Utilisé par |
|---|---|---|
| Utilisateur et mot de passe | Un utilisateur et un mot de passe pour n'importe quel accès : une API REST avec authentification basique, un service et plus, avec un hôte et un port facultatifs. Le type par défaut | Les playbooks, via les `credentials` d'un formulaire ou un champ d'identifiant ; les [expressions REST](../expressions/credentials.html) |
| SSH | Un utilisateur avec un mot de passe ou une clé privée pour SSH vers un serveur, avec son hôte et son port | Les playbooks, via les `credentials` ou `ansibleCredentials` d'un formulaire ou un champ d'identifiant, et l'accès d'un nœud de workflow |
| Git | Un jeton, ou un utilisateur et un mot de passe, pour des dépôts git | Les [dépôts](../repositories/authentication.html) |
| API | Un utilisateur et un mot de passe ou un jeton pour une API REST, avec un hôte et un port facultatifs | Les [expressions REST](../expressions/credentials.html), un jeton de bot Telegram, le bearer token d'un webhook, la clé d'API de l'assistant de chat |
| Base de données | Un accès à une base de données, avec son type, son hôte, son port et le nom de la base | Une [base de données](../databases.html) que les formulaires interrogent (`dbConfig`), depuis la 7.5.0, ou directement le `dbConfig` d'un formulaire ; `fnCredentials` ; il peut être testé |
| CyberArk | L'adresse du CyberArk Central Credential Provider (CCP) et son TLS, ainsi que l'AppID, le certificat client et la clé avec lesquels se connecte un coffre CyberArk | Un coffre de secrets [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Un serveur mail, son port et son TLS, et son accès facultatif (aucun pour un relais) | Un [canal de notification](../notification-channels.html) mail |
| LDAP | Les serveurs, le port, le TLS et les certificats d'un annuaire, et son DN et mot de passe de bind | Un [annuaire LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | Une inscription d'application : son ID de tenant, son ID client, son secret client ou son certificat, et son URI de redirection | Un [fournisseur Entra ID](../authentication/entra-id.html) ; un canal mail qui envoie via [Microsoft 365](../notification-channels/microsoft-365.html) |
| Open ID | Le client d'un fournisseur : son issuer, son ID client, son secret client et son URI de redirection | Un [fournisseur OIDC](../authentication/oidc.html) |
| RTE | Le jeton (`RTE_TOKEN`) et l'adresse d'un RTE | Un [runner](../runners.html) RTE |
| AWX, AAP, Ascender | Le jeton ou l'accès, et l'adresse, de cette plateforme | Un runner de ce type |
| Semaphore, Rundeck | Le jeton d'API et l'adresse de ce produit | Un runner de ce type |
| Jenkins | Un utilisateur, son jeton d'API et l'adresse d'un Jenkins | Un runner Jenkins |
| HashiCorp Vault | Le jeton et l'adresse avec lesquels se connecte un coffre Vault | Un coffre de secrets [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Un identifiant de base de données peut être de type MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB. Depuis la 7.5.0, il est choisi par une base de données de
[Connexions > Bases de données](../databases.html), et la mise à jour vers la 7.5.0 crée une base de données pour chacun, avec le même nom.

Dans l'API et le [seed de configuration](../seed/), les types sont `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` et `vault`. La mise à jour depuis la 6
donne à chaque identifiant le type `userpass`, ou `database` pour un identifiant de base de données : un formulaire l'utilise comme dans la 6. Passez-le en SSH pour un
accès avec lequel se connecte le playbook d'un nœud de workflow, ou en API pour une API REST.

---

## Comment un identifiant se connecte

Depuis la 7.6.0, l'étape **Connexion** de ces types demande d'abord comment l'identifiant se connecte, puis n'affiche que les champs de ce choix :

| Type | Choix | Champs |
|---|---|---|
| SSH | **Se connecter avec** : **Mot de passe** ou **Clé privée** | Mot de passe : l'utilisateur et son mot de passe. Clé privée : l'utilisateur, la **Clé privée** PEM ou OpenSSH et une **Phrase secrète** facultative |
| AWX, AAP, Ascender | **Se connecter avec** : **Jeton** ou **Mot de passe** | Jeton : le **Jeton**, sans utilisateur. Mot de passe : l'utilisateur et son mot de passe |
| Git | **Se connecter avec** : **Jeton** ou **Mot de passe** | Jeton : le **Jeton**, sans utilisateur (git envoie alors l'utilisateur `oauth2`). Mot de passe : l'utilisateur et son mot de passe |
| SMTP | **Se connecter avec** : **Sans connexion** ou **Connexion** | Sans connexion, pour un relais : seulement le **Serveur mail**, le **Port mail** et **Utiliser TLS**. Connexion : ceux-ci, plus l'utilisateur et son mot de passe |
| Microsoft Entra ID | **Se connecter avec** : **Secret** ou **Certificat** | Secret : le **Secret client**. Certificat : le **Certificat** PEM et sa clé privée, pour le mail via Microsoft 365 uniquement |

Un identifiant ne garde que ce que son choix demande : un identifiant SSH n'a jamais à la fois un mot de passe et une clé, l'autre est supprimé
à l'enregistrement. Avec **Écrire dans une clé** à l'étape **Stockage**, seuls les choix avec un mot de passe sont proposés, pas **Clé privée**, **Sans connexion** ni **Certificat**.

Les autres types se connectent d'une seule façon. Un identifiant Utilisateur et mot de passe ou API a l'interrupteur **Ajouter un hôte et un port**
après son mot de passe, voir [Hôte et port d'un accès](#host-and-port-of-a-login). La boîte de dialogue nomme **Mot de passe** le mot de passe
de bind LDAP, **Jeton** le jeton RTE, et **Moteur** le type d'une base de données.

---

## Adresses dans les identifiants

Depuis la 7.3.0, un accès qui fonctionne sur un serveur porte ce serveur, si bien que l'enregistrement qui l'utilise ne fait que nommer l'identifiant :

| Enregistrement | Ce qui est passé dans son identifiant |
|---|---|
| Un annuaire LDAP | Ses serveurs, son port, son TLS, ses certificats et son compte de bind, dans un identifiant `ldap` nommé `<directory>-ldap` |
| Un fournisseur SSO | Son ID client et son secret, son tenant ou son issuer, et son URI de redirection, dans un identifiant `entraid` ou `oidc` nommé `<provider>-sso` |
| Un runner | Son adresse et son TLS, et son jeton ou son accès, dans un identifiant de son type, `<runner>-token` ou `<runner>-login` |
| Un coffre de secrets | Son adresse et son TLS, et son jeton (`<store>-token`) ou son AppID et son certificat CyberArk (`<store>-appid`) |
| Un canal mail | Son serveur, son port et son TLS, dans son identifiant `smtp`, ou un nouveau nommé `<channel>-smtp` |

La mise à jour vers la 7.3.0 effectue ces déplacements une seule fois. Un enregistrement qui nommait déjà un identifiant le conserve, et en reçoit une copie quand
un autre enregistrement utilisait le même accès avec un autre serveur. Les enregistrements déclarés dans le [seed de configuration](../seed/) sont laissés tels que le seed les définit.
Les identifiants des connexions et des authentifications ne peuvent être modifiés que par un admin, voir [Qui peut modifier un identifiant](../credentials.html#who-may-change-a-credential).

---

## Hôte et port d'un accès

Depuis la 7.6.0, un identifiant Utilisateur et mot de passe ou API peut aussi contenir un **Hôte** et un **Port**, tous deux facultatifs :
à son étape **Connexion**, l'interrupteur **Ajouter un hôte et un port** après le mot de passe les affiche.

Ils parviennent au playbook et aux expressions avec l'identifiant, sous la forme `host` et `port`, à côté de `user` et `password` : via les
`credentials` d'un formulaire et [`fn.fnCredentials`](../expressions/credentials.html). Un identifiant lu depuis un coffre de secrets garde son
propre hôte et son propre port, et ne prend ceux du secret que là où il les laisse vides. Les identifiants SSH et de base de données les ont toujours eus.

---

## La clé privée d'un identifiant SSH

Depuis la 7.6.0, un identifiant SSH peut se connecter avec une clé privée à la place de son mot de passe : **Se connecter avec** sur **Clé privée** demande ceci :

| Champ | Signification |
|---|---|
| Clé privée | La clé privée PEM ou OpenSSH avec laquelle le playbook se connecte. Stockée chiffrée, plus jamais affichée : laissée vide, celle qui est stockée est conservée. |
| Phrase secrète | La phrase secrète de la clé, si elle en a une. Stockée chiffrée. |

Il se connecte avec l'un ou l'autre, jamais les deux : à l'enregistrement, une clé supprime le mot de passe stocké, et **Mot de passe** supprime la clé
stockée et sa phrase secrète, comme le dit la page de l'identifiant. La clé et sa phrase secrète ne sont jamais renvoyées par l'API, et sont masquées dans la sortie.

Quand un formulaire nomme l'identifiant dans `ansibleCredentials`, le RTE écrit la clé dans un fichier temporaire privé (un dossier à lui, lisible
par son seul utilisateur) et la passe au playbook sous la forme `ansible_ssh_private_key_file`. Une clé avec une phrase secrète est chargée dans
un `ssh-agent` démarré pour ce seul job, et le fichier est supprimé une fois la clé chargée. Le fichier et l'agent disparaissent à la fin du job,
y compris en cas d'échec ou d'abandon, si bien qu'aucune clé ne reste sur le RTE.

Les images RTE contiennent `ssh-agent` et `ssh-add` ; un RTE à vous qui ne les a pas fait échouer, avec un message qui l'explique,
tout job dont la clé a une phrase secrète.

Les `credentials` d'un formulaire qui nomment un identifiant SSH passent la clé au playbook sous la forme `private_key`, et sa phrase secrète sous la
forme `private_key_passphrase`. Dans le [seed de configuration](../seed/), la clé est le `client_key` de l'identifiant et sa phrase secrète `key_passphrase`.
