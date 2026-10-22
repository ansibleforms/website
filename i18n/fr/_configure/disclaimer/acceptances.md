---
layout: default
title: Acceptations
parent: Avertissement
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Acceptations
{: .no_toc }

Qui a accepté quelle version, et redemander à des utilisateurs choisis
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qui a accepté

Chaque acceptation est enregistrée pour l'utilisateur et la version, et l'onglet **Acceptations** de la page d'une version les liste, la plus récente en premier :

| Colonne | Signification |
|---|---|
| **Utilisateur** | Le nom d'utilisateur |
| **Connexion** | Comment il s'est connecté : Local, LDAP, Microsoft Entra ID ou OpenID Connect |
| **Accepté** | Quand |
| **Adresse IP** | D'où |
| **Navigateur** | Son navigateur |

---

## Redemander aux utilisateurs

Depuis la 7.3.0, on peut demander à des utilisateurs choisis d'accepter à nouveau une version, sans le redemander à tout le monde.

**Redemander** dans un menu de ligne, ou sur les lignes cochées dans la liste, efface ces acceptations après une confirmation : ces utilisateurs reçoivent à nouveau
l'avertissement à leur prochaine requête, sans se reconnecter. La liste peut aussi être exportée, comme tout tableau.

Le [journal d'audit](../production/logs.html#audit-trail) enregistre aussi chaque acceptation, chaque refus et chaque modification de l'avertissement.
