---
layout: default
title: La page des identifiants
parent: Identifiants
nav_order: 2
translated_from: e91c49850d61e193daa84ddbd0b841f65d8b3090
---

# La page des identifiants
{: .no_toc }

La liste des identifiants, et la boîte de dialogue qui en ajoute un
{: .fs-6 .fw-300 }

La page **Connexions > Identifiants** liste chaque identifiant avec son **Nom**, son **Type**, sa **Description** et **Utilisé par**, le
nombre d'enregistrements, de formulaires et de workflows qui le nomment (voir [Identifiants utilisés](../credentials.html#credentials-in-use)).

**Ajouter un identifiant** ouvre une boîte de dialogue en étapes :

| Étape | Champs |
|---|---|
| Identifiant | Nom et description, tous deux obligatoires. |
| Type | L'un des 18 types, voir plus bas. |
| Stockage | Où l'utilisateur et le mot de passe sont conservés : **Base de données** (chiffrés dans la base de données d'AnsibleForms) ou **Coffre de secrets**. Sous **Coffre de secrets**, **Pointer vers une clé** lit un secret déjà présent dans le coffre, et **Écrire dans une clé** écrit dans le coffre, à l'**Enregistrement**, l'utilisateur et le mot de passe saisis à l'étape **Connexion**. Choisissez ensuite le coffre et remplissez la **Référence** ; son exemple suit le coffre : un chemin HashiCorp Vault ou un compte CyberArk. Pas pour CyberArk ni HashiCorp Vault, avec lesquels un coffre de secrets se connecte. |
| Connexion | Ce avec quoi le type se connecte et où, voir plus bas. |

L'étape **Type** liste les types par leur nom : AAP, API, Ascender, AWX, CyberArk, Base de données, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, et Utilisateur et mot de passe (voir [Types d'identifiants](types.html)).

L'étape **Connexion** contient tous les champs du type, adresse comprise ; il n'y a pas d'étape de connexion séparée. Depuis la 7.6.0, certains
types demandent d'abord comment ils se connectent, puis n'affichent que ce qu'il faut (voir [Comment un identifiant se connecte](types.html#how-a-credential-signs-in)) :

| Types | Champs de l'étape Connexion |
|---|---|
| Tous les types sauf CyberArk | Le mot de passe, ou ce qui en tient lieu : le **Mot de passe** de LDAP (son mot de passe de bind), le **Secret client** d'Entra ID et d'Open ID, le **Jeton** de HashiCorp Vault et du RTE, le **Jeton d'API** de Semaphore, Rundeck et Jenkins, le **Jeton** ou le **Mot de passe** d'AWX, AAP, Ascender et Git. Aucun pour une clé privée SSH, un relais SMTP ou un certificat Entra ID |
| Tous les types sauf HashiCorp Vault, RTE, Semaphore et Rundeck | L'utilisateur : l'AppID de CyberArk, le DN de bind de LDAP, l'ID client d'Entra ID et d'Open ID. Aucun avec **Jeton** (AWX, AAP, Ascender, Git) ou **Sans connexion** (SMTP) |
| SSH, Base de données | **Hôte** et **Port** ; pour une base de données, aussi son **Moteur** et **Base de données** |
| SSH | Depuis la 7.6.0, **Se connecter avec** : **Mot de passe**, ou **Clé privée** avec la **Clé privée** et sa **Phrase secrète** facultative |
| AWX, AAP, Ascender, Git | Depuis la 7.6.0, **Se connecter avec** : **Jeton** (sans utilisateur) ou **Mot de passe** (un utilisateur et son mot de passe) |
| Utilisateur et mot de passe, API | Depuis la 7.6.0, l'interrupteur **Ajouter un hôte et un port**, après le mot de passe, affiche un **Hôte** et un **Port** facultatifs |
| SMTP | **Serveur mail** (obligatoire), **Port mail** et **Utiliser TLS** ; depuis la 7.6.0, **Se connecter avec** : **Sans connexion** (un relais) ou **Connexion** (un utilisateur et son mot de passe) |
| LDAP | Les **Serveurs** de l'annuaire (obligatoire), son **Port** et **Activer TLS** ; avec TLS, **Ignorer les certificats**, le **Bundle CA** et un **Certificat client** |
| Microsoft Entra ID | **ID du tenant** (obligatoire) et **URI de redirection** ; depuis la 7.6.0, **Se connecter avec** : **Secret** (le **Secret client**) ou **Certificat** (un **Certificat** et sa clé privée, mail uniquement) |
| Open ID | **Issuer** (obligatoire) et **URI de redirection** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Serveur**, l'adresse à laquelle il se connecte, obligatoire, avec **Ignorer la vérification du certificat** et le **Bundle CA** |
| CyberArk | **Certificat client** et **Clé client** |

Avec **Pointer vers une clé**, l'utilisateur et le mot de passe ne sont pas demandés : le coffre les donne. L'étape **Connexion** ne garde alors que les champs d'adresse du type (SSH, base de données, serveurs de messagerie et d'annuaire, l'adresse d'un serveur, l'hôte et le port facultatifs d'Utilisateur et mot de passe et d'API depuis la 7.6.0), et une connexion Git n'a pas d'étape **Connexion** : elle s'enregistre depuis l'étape **Stockage**.

Avec **Écrire dans une clé** (depuis 7.6.0), l'étape **Connexion** demande l'utilisateur et le mot de passe, en ne proposant que les choix de connexion avec un mot de passe
(voir [Comment un identifiant se connecte](types.html#how-a-credential-signs-in)), et **Enregistrer** les écrit dans le coffre à la **Référence** ; AnsibleForms ne garde que le coffre et la référence. Seuls les coffres qui autorisent l'écriture sont proposés, et **Ajouter un coffre de secrets** en crée un avec l'écriture déjà activée. Une clé qui contient déjà un secret n'est remplacée que si **Écraser un secret déjà présent** est coché, voir [Écrire des identifiants](../secret-stores/#writing-credentials).

Une ligne ouvre la page de l'identifiant. Son menu propose **Modifier**, **Tester la connexion** (identifiants de base de données uniquement) et **Supprimer**. Le
mot de passe se change sur la page de l'identifiant, dans son onglet **Connexion**.
