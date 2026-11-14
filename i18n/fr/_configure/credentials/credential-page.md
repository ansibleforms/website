---
layout: default
title: "La page d'un identifiant"
parent: Identifiants
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
---

# La page d'un identifiant
{: .no_toc }

Les onglets d'un identifiant, et ce qui l'utilise
{: .fs-6 .fw-300 }

La page d'un identifiant affiche les étapes de sa boîte de dialogue sous forme d'onglets, plus ce qui l'utilise :

| Onglet | Ce qu'il contient |
|---|---|
| Détails | Nom et description. |
| Type | À quoi sert l'identifiant. |
| Connexion | Tous les champs de son type, comme à l'étape **Connexion** de la boîte de dialogue : l'utilisateur, le mot de passe, et l'endroit où il se connecte (hôte et port, la base de données, le serveur mail, les serveurs de l'annuaire, le tenant ou l'issuer, l'adresse du serveur et son TLS). L'AppID, le certificat client et la clé d'un identifiant CyberArk. Depuis la 7.6.0, le choix de sa façon de se connecter, et la clé privée et la phrase secrète d'un identifiant SSH. |
| Stockage | Base de données ou Coffre de secrets, et le coffre et la référence. Pas pour CyberArk ni HashiCorp Vault. |
| Utilisé par | Tout ce qui nomme cet identifiant : coffres de secrets, canaux de notification, dépôts, annuaires LDAP, fournisseurs SSO, runners, [bases de données](../databases.html) (depuis la 7.5.0), l'assistant de chat, les formulaires et les workflows du concepteur. Une ligne l'ouvre. |

Le mot de passe se saisit dans l'onglet **Connexion**, et n'est plus jamais affiché une fois enregistré : laissé vide, celui qui est stocké est conservé. Il en va de même
pour la clé client d'un identifiant CyberArk, et depuis la 7.6.0 pour la clé privée et la phrase secrète d'un identifiant SSH.

Depuis la 7.6.0, cela ne vaut que tant que le choix de connexion reste le même. S'il change (un SSH de **Clé privée** à **Mot de passe** et
inversement, un SMTP de **Sans connexion** à **Connexion**, un Entra ID de **Certificat** à **Secret** et inversement, un **Jeton** à un **Mot de passe**
et inversement), rien de stocké ne lui convient : le nouveau secret qu'il demande est obligatoire, et **Enregistrer** le réclame. Un identifiant SSH
passé à **Mot de passe** supprime sa clé privée et sa phrase secrète stockées au moment d'**Enregistrer**, comme l'onglet l'indique sous le choix. Avec
**Écrire dans une clé** dans l'onglet **Stockage**, seuls les choix avec un mot de passe sont proposés, voir [Comment un identifiant se connecte](types.html#how-a-credential-signs-in).

En haut à droite se trouvent **Tester la connexion** (identifiants de base de données uniquement), **Supprimer** et **Enregistrer**.

Depuis la 7.3.0, **Supprimer** et un nouveau nom sont refusés tant que **Utilisé par** liste quelque chose, voir [Identifiants utilisés](../credentials.html#credentials-in-use).

Un identifiant déclaré dans le [seed de configuration](../seed/) est en lecture seule sur cette page : modifiez-le plutôt dans le fichier seed.
