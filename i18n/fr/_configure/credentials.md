---
layout: default
title: Identifiants
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 08110077a1cf59a4a52e078fc2ebc252f7cae48d
---

# Identifiants
{: .no_toc }

Stockez les accès avec lesquels se connectent les formulaires, les dépôts, les coffres de secrets et les canaux de notification
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : ajoutez les utilisateurs, mots de passe et jetons avec lesquels AnsibleForms se connecte, conservés chiffrés ou lus depuis un coffre de secrets.

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [Types d'identifiants](credentials/types.html) | Ce que contient chaque type, et où il peut être choisi |
| [La page des identifiants](credentials/list.html) | La liste des identifiants, et la boîte de dialogue qui en ajoute un |
| [La page d'un identifiant](credentials/credential-page.html) | Les onglets d'un identifiant, et ce qui l'utilise |

---

## Fonctionnement

Un **identifiant** est un accès nommé, ajouté dans **Connexions > Identifiants**. Les formulaires et les autres objets d'administration y font référence
par son nom, si bien que le mot de passe lui-même n'apparaît jamais dans un formulaire. Son utilisateur et son mot de passe sont soit conservés dans la
base de données d'AnsibleForms, chiffrés avec `ENCRYPTION_SECRET`, soit lus depuis un [coffre de secrets](secret-stores/) à chaque utilisation de
l'identifiant.

---

## Qui peut modifier un identifiant

Depuis la 7.3.0, un identifiant dont dépend une connexion ou une authentification ne peut être ajouté, modifié ou supprimé que par un admin :

| Identifiants | Pourquoi |
|---|---|
| Types de connexion : `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` et `cyberark` | Un runner ou un coffre de secrets en tire son adresse et son secret |
| Types d'authentification : `oidc`, `entraid` et `ldap` | Un fournisseur SSO ou un annuaire LDAP connecte les utilisateurs avec lui |
| Tout identifiant que nomme un runner | Le runner se connecte avec lui, et la modification du runner lui-même nécessite aussi un admin |

Les autres utilisateurs ayant accès aux identifiants les voient en lecture seule. Un utilisateur qui pourrait pointer un tel identifiant vers un autre
serveur recevrait tous les secrets envoyés à travers lui, c'est pourquoi la règle suit celle des runners. Trois autres règles
tiennent ces utilisateurs à l'écart de secrets qu'ils ne pourraient pas lire autrement :

- **Nommer un identifiant protégé** : seul un admin peut nommer l'un de ces identifiants ailleurs, comme dans un dépôt,
  un canal de notification ou les paramètres de l'assistant de chat. Un identifiant qui lit son mot de passe depuis un coffre de secrets est
  protégé de la même façon, quel que soit son type.
- **Choisir un coffre de secrets** : seul un admin peut pointer un identifiant vers un [coffre de secrets](secret-stores/), ou changer le
  coffre ou la référence qu'il lit ; un autre utilisateur peut toujours les renvoyer inchangés, ou les vider tous.
- **Déplacer un identifiant** : quand un autre utilisateur change l'endroit où un identifiant se connecte (son hôte, son port, son issuer, son tenant ou
  l'adresse de son serveur) sans ressaisir son mot de passe, le mot de passe stocké est effacé, de même que la référence au coffre de secrets
  qu'il lit, afin que l'ancien secret n'aille jamais vers la nouvelle cible.

---

## Identifiants utilisés

Un identifiant que des enregistrements nomment encore ne peut être ni supprimé ni renommé, car ils pointeraient alors vers rien.
Le refus indique combien d'enregistrements l'utilisent ; l'onglet **Utilisé par** de [sa page](credentials/credential-page.html) les liste.
Pointez-les d'abord vers un autre identifiant, puis supprimez-le ou renommez-le.
