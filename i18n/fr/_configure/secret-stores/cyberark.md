---
layout: default
title: CyberArk
parent: Coffres de secrets
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Lisez les identifiants depuis le CyberArk Central Credential Provider (CCP)
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
