---
layout: default
title: Types d'identifiants
parent: Identifiants
nav_order: 1
translated_from: 1f21f8fc1ae73953922d8c9f21de6db05b3b1a87
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
| Utilisateur et mot de passe | Un utilisateur et un mot de passe pour n'importe quel accès : une API REST avec authentification basique, un service et plus. Le type par défaut | Les playbooks, via les `credentials` d'un formulaire ou un champ d'identifiant ; les [expressions REST](../expressions/credentials.html) |
| SSH | Un utilisateur et un mot de passe pour SSH vers un serveur, avec son hôte et son port | Les playbooks, via les `credentials` ou `ansibleCredentials` d'un formulaire ou un champ d'identifiant, et l'accès d'un nœud de workflow |
| Git | Un utilisateur et un mot de passe ou un jeton pour des dépôts git | Les [dépôts](../repositories/authentication.html) |
| API | Un utilisateur et un mot de passe ou un jeton pour une API REST | Les [expressions REST](../expressions/credentials.html), un jeton de bot Telegram, le bearer token d'un webhook, la clé d'API de l'assistant de chat |
| Base de données | Un accès à une base de données, avec son type, son hôte, son port et le nom de la base | Les requêtes de formulaire (`dbConfig`) et `fnCredentials` ; il peut être testé |
| CyberArk | L'adresse du CyberArk Central Credential Provider (CCP) et son TLS, ainsi que l'AppID, le certificat client et la clé avec lesquels se connecte un coffre CyberArk | Un coffre de secrets [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Un serveur mail, son port et son TLS, et son accès (aucun pour un relais) | Un [canal de notification](../notification-channels.html) mail |
| LDAP | Les serveurs, le port, le TLS et les certificats d'un annuaire, et son DN et mot de passe de bind | Un [annuaire LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | L'inscription d'application d'un fournisseur : son ID de tenant, son ID client, son secret client et son URI de redirection | Un [fournisseur Entra ID](../authentication/entra-id.html) |
| Open ID | Le client d'un fournisseur : son issuer, son ID client, son secret client et son URI de redirection | Un [fournisseur OIDC](../authentication/oidc.html) |
| RTE | Le jeton (`RTE_TOKEN`) et l'adresse d'un RTE | Un [runner](../runners.html) RTE |
| AWX, AAP, Ascender | Le jeton ou l'accès, et l'adresse, de cette plateforme | Un runner de ce type |
| Semaphore, Rundeck | Le jeton d'API et l'adresse de ce produit | Un runner de ce type |
| Jenkins | Un utilisateur, son jeton d'API et l'adresse d'un Jenkins | Un runner Jenkins |
| HashiCorp Vault | Le jeton et l'adresse avec lesquels se connecte un coffre Vault | Un coffre de secrets [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Un identifiant de base de données peut être de type MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB.

Dans l'API et le [seed de configuration](../seed/), les types sont `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` et `vault`. La mise à jour depuis la 6
donne à chaque identifiant le type `userpass`, ou `database` pour un identifiant de base de données : un formulaire l'utilise comme dans la 6. Passez-le en SSH pour un
accès avec lequel se connecte le playbook d'un nœud de workflow, ou en API pour une API REST.

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
