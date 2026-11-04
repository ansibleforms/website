---
layout: default
title: CyberArk
parent: Coffres de secrets
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Lire des identifiants via le CCP de CyberArk, les écrire via son PVWA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Expérimental.** Pas encore testé sur une installation CyberArk réelle ; merci de nous faire part de vos constats.

Le CCP est l'interface REST de l'Application Access Manager de CyberArk.

---

## Champs du coffre

En plus des [champs communs à tous les coffres](./#adding-a-store), un coffre CyberArk a ces champs :

| Champ | Signification |
|---|---|
| Identifiant | Un identifiant **CyberArk** de [Connexions > Identifiants](../credentials.html) : l'URL de base du CCP, par ex. `https://ccp.example.com` (`/AIMWebService/api/Accounts` est ajouté), ses paramètres TLS, son AppID (l'application définie pour AnsibleForms dans CyberArk), et un certificat client et une clé en PEM, uniquement quand l'AppID en exige un. |

---

## Référence du secret

La référence du secret identifie le compte sous la forme de paires clé-valeur séparées par `;` :

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Clés autorisées : `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` transmet le reste de la référence comme une requête CCP native, avec `QueryFormat=Exact`
  sauf si vous le définissez autrement.
- Un `AppID` dans la référence est ignoré : c'est toujours l'AppID du coffre qui est utilisé.
- Le mot de passe du compte (`Content`) devient le mot de passe ; `UserName`, `Address`, `Port` et
  `Database` remplissent l'utilisateur, l'hôte, le port et le nom de la base de données.

---

## Écrire des identifiants

Depuis 7.6.0, l'utilisateur et le mot de passe d'un identifiant peuvent être écrits dans CyberArk à l'**Enregistrement** (voir [Écrire des identifiants](./#writing-credentials)).
Le CCP ne fait que lire, AnsibleForms écrit donc via l'API REST du PVWA, connecté avec un identifiant à lui.

Activez **Autoriser l'écriture** dans les **Options** du coffre, puis remplissez :

| Champ | Signification |
|---|---|
| Autoriser l'écriture | Permet à un identifiant d'écrire son utilisateur et son mot de passe dans ce coffre à l'**Enregistrement**. Désactivé par défaut. |
| Coffres où écrire | Les coffres où les identifiants peuvent être écrits, séparés par des virgules, p. ex. `Linux, DB`. Requis quand l'écriture est activée. |
| Adresse du PVWA | L'URL de base du PVWA, p. ex. `https://pvwa.example.com`. Requis. |
| Identifiant du PVWA | Un identifiant **Utilisateur et mot de passe** ou **API** à lui, jamais lu dans un coffre de secrets, autorisé à ajouter des comptes dans ces coffres et à changer leurs mots de passe. Requis. |
| Méthode de connexion | Comment l'identifiant du PVWA se connecte : CyberArk (par défaut), LDAP, RADIUS ou Windows. |
| ID de plateforme | La plateforme des comptes qu'il ajoute, p. ex. `UnixSSH`. Nécessaire pour ajouter un nouveau compte. |

La référence désigne le compte comme pour la lecture, `Safe=Linux;Object=srv01-root`, avec `Address=srv01.example.com` quand sa plateforme en demande une.

- Un nouveau compte est ajouté au coffre avec la plateforme, le nom d'utilisateur et le mot de passe.
- Un compte existant n'est modifié que si **Écraser un secret déjà présent** est coché : son nom d'utilisateur, puis son mot de passe.
- La session PVWA est fermée après chaque écriture. La connexion OAuth de Privilege Cloud n'est pas prise en charge.

---

## Options supplémentaires

Les options supplémentaires du coffre se définissent sous forme d'objet JSON :

| Clé | Signification |
|---|---|
| `reason` | Envoyée comme `Reason` quand la référence n'en a pas, pour l'audit de CyberArk. |
| `check_ref` | Une référence que **Tester la connexion** lit réellement. Sans elle, le test vérifie seulement que le CCP répond et accepte l'AppID. |
| `timeout_ms` | Délai d'expiration de la requête, 10000 par défaut. |

Par exemple, pour envoyer une raison et laisser **Tester la connexion** lire un compte de test :

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
