---
layout: default
title: Les bases de données dans les formulaires
parent: Bases de données
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Les bases de données dans les formulaires
{: .no_toc }

Comment le dbConfig d'un champ nomme une base, et les anciens formulaires
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nommer une base de données

Un champ avec une `query` l'exécute sur la base de données que nomme son `dbConfig`.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Depuis la 7.5.0, le nom est cherché dans cet ordre :

| Ordre | Le nom est | La requête se connecte avec |
|---|---|---|
| 1 | Une base de données de **Connexions > Bases de données** | L'identifiant que nomme cette base de données |
| 2 | Sinon un identifiant de type **Base de données** de **Connexions > Identifiants** | Cet identifiant, comme avant la 7.5.0 |

Le type de base de données (MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB) vient de l'identifiant, si bien que le formulaire ne le donne jamais.
Un identifiant sans type est lu comme MySQL.

---

## Les formulaires écrits avant la 7.5.0

Tout formulaire qui nommait un identifiant dans `dbConfig` fonctionne toujours, sans changement.

La [mise à jour vers la 7.5.0](../databases.html#upgrading-to-750) crée une base de données pour chaque identifiant de base de données, avec le même
nom et se connectant avec cet identifiant, si bien que le nom que donne un formulaire trouve désormais d'abord la base de données, qui mène au même
accès. Un identifiant de type base de données sans base de données de son nom est toujours trouvé par l'étape 2.

Une base de données et un identifiant peuvent partager un nom, comme le fait la mise à jour. La base de données l'emporte : pointez-la vers un
autre identifiant et chaque formulaire qui donne ce nom suit, ce qui permet à un formulaire de passer à un autre serveur sans être modifié.

---

## Les formes de dbConfig

Les trois formes que `dbConfig` a toujours acceptées fonctionnent toujours, chaque nom étant cherché comme ci-dessus.

| `dbConfig` | Exemple | Ce qu'il fait |
|---|---|---|
| Un nom | `dbConfig: cmdb` | Interroge cette base de données |
| Une liste de noms | `dbConfig: [cmdb-eu, cmdb-us]` | Exécute la requête sur chacune et réunit les résultats ; les doublons ne sont pas supprimés |
| Un objet (ancien) | `dbConfig: { name: cmdb, type: mysql }` | Interroge la base de données ou l'identifiant `name` ; obsolète, utilisez le nom seul |

Une référence à un [coffre de secrets](../secret-stores/#inline-without-a-credential-row), comme `dbConfig: secret:vault:secret/cmdb/db`, n'est le
nom ni d'une base de données ni d'un identifiant, et elle est toujours lue depuis le coffre comme avant.

---

## Quels formulaires interrogent une base de données

L'application lit les formulaires pour savoir lesquels interrogent chaque base de données.

La colonne **Utilisé par** de [la page des bases de données](list.html) les compte, et l'onglet **Utilisé par** de
[la page d'une base de données](database-page.html#used-by) les liste avec leurs champs. Un champ qui nomme à la place l'identifiant de la base de
données compte aussi. Renommez une base de données seulement après avoir modifié les formulaires qui donnent son ancien nom.
