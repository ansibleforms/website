---
layout: default
title: Secrets et chiffrement
parent: Sécurité
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Secrets et chiffrement
{: .no_toc }

Les deux secrets maîtres, ce qu'ils protègent, et la durée des sessions et des jetons
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les deux secrets maîtres

Deux secrets protègent tout le reste. Définissez-les tous deux avant que l'instance ne contienne de vraies données, conservez-les hors de l'instance,
et ne les changez jamais à la légère :

| Secret | Ce qu'il protège | S'il n'est pas défini | S'il est perdu ou changé |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Chaque mot de passe et chaque jeton stocké dans la base de données : identifiants, mot de passe de bind LDAP, jetons des runners, secrets client SSO, adresses des webhooks Slack et Teams, clé d'API du chat | Une clé par défaut est utilisée, publique dans le code source | Perdu : chaque secret stocké doit être ressaisi. Changé : depuis la 7.3.0, chaque secret stocké est rechiffré, voir [plus bas](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | La signature des jetons d'accès et de rafraîchissement, y compris les [jetons d'API](../profile/api-token.html) de longue durée | Un secret aléatoire est généré à chaque démarrage, si bien que chaque redémarrage déconnecte tout le monde | Chaque session et chaque jeton d'API deviennent invalides |

Tous deux sont journalisés sous forme d'avertissement `[SECURITY]` au démarrage tant qu'ils manquent. Les pages de paramètres refusent de les modifier,
l'API ne les renvoie jamais, et les sauvegardes les omettent volontairement, si bien qu'un `ENCRYPTION_SECRET` perdu ne peut être récupéré
nulle part : gardez-en une copie dans votre gestionnaire de secrets. Le secret de chiffrement sert de clé de 32 caractères ; une valeur plus courte ou
plus longue est complétée ou tronquée.

Changer `ACCESS_TOKEN_SECRET` met fin d'un coup à chaque session et à chaque jeton d'API. Pour mettre fin aux jetons d'un utilisateur ou d'une
session, utilisez les révocations décrites dans [Jetons](#tokens).

---

## Changer le secret de chiffrement

Depuis la 7.3.0, définir ou changer `ENCRYPTION_SECRET` ne fait plus perdre les secrets stockés. Au démarrage suivant, le worker rechiffre
chacun d'eux avec la nouvelle clé, dans une seule transaction de base de données, avant que quoi que ce soit d'autre n'écrive un secret :

| Situation | Que définir |
|---|---|
| L'instance tournait sans `ENCRYPTION_SECRET`, sur la clé publique par défaut | Seulement `ENCRYPTION_SECRET` : les secrets sont rechiffrés depuis la clé par défaut |
| L'instance tournait avec une clé à vous | `ENCRYPTION_SECRET` avec la nouvelle clé et [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) avec l'ancienne, pour ce seul démarrage |

Quand les secrets stockés ont été chiffrés avec une clé qui n'est ni l'une ni l'autre, rien n'est modifié et l'application refuse de démarrer tant que
`ENCRYPTION_SECRET_PREVIOUS` ne nomme pas cette clé. Retirez `ENCRYPTION_SECRET_PREVIOUS` une fois que le démarrage les a rechiffrés, et définissez le
nouveau `ENCRYPTION_SECRET` sur chaque nœud d'application, le worker et chaque RTE en mode base de données qui s'enregistre lui-même. Cet
auto-enregistrement (`RTE_REGISTER`) est déprécié dans la 7.3.0 : un RTE qui rejoint avec un jeton d'adhésion (`RTE_JOIN_TOKEN`) en mode
socket n'a besoin d'aucun `ENCRYPTION_SECRET`, voir [Modes du RTE](../rte/modes.html).

---

## Jetons

Une connexion renvoie un jeton d'accès de courte durée et un jeton de rafraîchissement plus long, que le navigateur utilise pour obtenir une nouvelle paire :

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` par défaut. Plus court, il
  limite l'usage d'un jeton intercepté.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` par
  défaut. C'est la durée pendant laquelle un navigateur inactif reste connecté.
* L'option de rôle `allowApiTokens` permet à un utilisateur de demander un jeton d'API valable un certain nombre de jours, et
  `extendedTokenExpiration` en ajoute un qui n'expire jamais. Ne les accordez qu'aux rôles qui ont besoin d'un accès API depuis des scripts.
  Sur la [page de profil](../profile/api-token.html), un jeton se crée depuis une session de navigateur connectée il y a 10 minutes
  au plus, et jamais depuis un autre jeton d'API. Un jeton qui n'expire jamais vit 50 ans, et les événements ci-dessous y mettent quand même fin.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : `90` par défaut. La durée de vie maximale d'un jeton
  d'API : une demande plus longue y est ramenée.

Un jeton est un JWT signé, mais le serveur tient aussi une liste de jetons révoqués, partagée par tous les nœuds d'application, si bien qu'un jeton
peut prendre fin avant son expiration :

| Événement | Ce qui prend fin |
|-------|-----------|
| La déconnexion | Chaque jeton de cette connexion : le jeton d'accès, son jeton de rafraîchissement, et un jeton d'API quand la déconnexion l'utilise |
| Un changement de mot de passe, par l'utilisateur ou par un admin | Chaque jeton de l'utilisateur émis avant le changement, jetons d'API compris, sur chaque appareil |
| L'interrupteur **Autoriser la connexion** d'un utilisateur désactivé (utilisateur local, LDAP ou SSO), ou un utilisateur local supprimé | Chaque jeton de l'utilisateur |
| **Terminer les sessions** sur la page d'un utilisateur LDAP ou SSO | Chaque jeton de l'utilisateur ; il peut se reconnecter sauf s'il est bloqué |
| **Révoquer** sur un jeton d'API, sur la page de profil ou dans l'onglet **Jetons d'API** de l'utilisateur | Ce seul jeton d'API, immédiatement |

Un script met fin à son propre jeton d'API en se déconnectant avec lui : `POST /api/v2/auth/logout` avec le jeton dans l'en-tête
`Authorization`.
