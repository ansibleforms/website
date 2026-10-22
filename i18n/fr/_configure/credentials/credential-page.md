---
layout: default
title: "La page d'un identifiant"
parent: Identifiants
nav_order: 3
translated_from: 0269b5c0d313622bea6c910b96231f41ffd852d7
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
| Connexion | Tous les champs de son type, comme à l'étape **Connexion** de la boîte de dialogue : l'utilisateur, le mot de passe, et l'endroit où il se connecte (hôte et port, la base de données, le serveur mail, les serveurs de l'annuaire, le tenant ou l'issuer, l'adresse du serveur et son TLS). L'AppID, le certificat client et la clé d'un identifiant CyberArk. |
| Stockage | Base de données ou Coffre de secrets, et le coffre et la référence. Pas pour CyberArk ni HashiCorp Vault. |
| Utilisé par | Tout ce qui nomme cet identifiant : coffres de secrets, canaux de notification, dépôts, annuaires LDAP, fournisseurs SSO, runners, l'assistant de chat, les formulaires et les workflows du concepteur. Une ligne l'ouvre. |

Le mot de passe se saisit dans l'onglet **Connexion**, et n'est plus jamais affiché une fois enregistré : laissé vide, celui qui est stocké est conservé. Pour un identifiant
CyberArk, laissez la clé client vide pour garder celle qui est stockée. En haut à droite se trouvent **Tester la connexion** (identifiants de base de données uniquement),
**Supprimer** et **Enregistrer**.

Depuis la 7.3.0, **Supprimer** et un nouveau nom sont refusés tant que **Utilisé par** liste quelque chose, voir [Identifiants utilisés](../credentials.html#credentials-in-use).

Un identifiant déclaré dans le [seed de configuration](../seed/) est en lecture seule sur cette page : modifiez-le plutôt dans le fichier seed.
