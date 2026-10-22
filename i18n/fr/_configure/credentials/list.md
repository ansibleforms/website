---
layout: default
title: La page des identifiants
parent: Identifiants
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
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
| Connexion | Ce avec quoi le type se connecte et où, voir plus bas. |
| Stockage | Où sont conservés l'utilisateur et le mot de passe : **Base de données** (chiffrés dans la base de données d'AnsibleForms) ou **Coffre de secrets**, avec le coffre et la **Référence** qu'il contient. Pas pour CyberArk ni HashiCorp Vault, avec lesquels un coffre de secrets se connecte. |

L'étape **Type** liste les types par leur nom : AAP, API, Ascender, AWX, CyberArk, Base de données, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, et Utilisateur et mot de passe (voir [Types d'identifiants](types.html)).

L'étape **Connexion** contient tous les champs du type, adresse comprise ; il n'y a pas d'étape de connexion séparée :

| Types | Champs de l'étape Connexion |
|---|---|
| Tous les types sauf CyberArk | Le mot de passe, ou ce qui en tient lieu : le mot de passe de bind de LDAP, le secret client d'Entra ID et d'Open ID, le jeton de HashiCorp Vault, le jeton RTE, le jeton d'API de Semaphore, Rundeck et Jenkins, un jeton ou mot de passe pour AWX, AAP et Ascender |
| Tous les types sauf HashiCorp Vault, RTE, Semaphore et Rundeck | L'utilisateur : l'AppID de CyberArk, le DN de bind de LDAP, l'ID client d'Entra ID et d'Open ID, facultatif pour AWX, AAP et Ascender |
| SSH, Base de données | **Hôte** et **Port** ; pour une base de données, aussi le **Type de base de données** et **Base de données** |
| SMTP | **Serveur mail** (obligatoire), son **Port** et **Utiliser TLS** |
| LDAP | Les **Serveurs** de l'annuaire (obligatoire), son **Port** et **Activer TLS** ; avec TLS, **Ignorer les certificats**, le **Bundle CA** et un **Certificat client** |
| Microsoft Entra ID | **ID du tenant** (obligatoire) et **URI de redirection** |
| Open ID | **Issuer** (obligatoire) et **URI de redirection** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Serveur**, l'adresse à laquelle il se connecte, obligatoire, avec **Ignorer la vérification du certificat** et le **Bundle CA** |
| CyberArk | **Certificat client** et **Clé client** |

Une ligne ouvre la page de l'identifiant. Son menu propose **Modifier**, **Tester la connexion** (identifiants de base de données uniquement) et **Supprimer**. Le
mot de passe se change sur la page de l'identifiant, dans son onglet **Connexion**.
