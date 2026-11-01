---
layout: default
title: Bases de données
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Bases de données
{: .no_toc }

Les bases de données des formulaires, chacune avec son identifiant
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : nommez les bases de données qu'interrogent vos formulaires, choisissez l'identifiant avec lequel chacune se connecte, et testez-les.

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [La page des bases de données](databases/list.html) | La liste des bases de données, ses colonnes, et la boîte de dialogue qui en ajoute une |
| [La page d'une base de données](databases/database-page.html) | Les onglets d'une base de données, les formulaires qui l'interrogent, Tester la connexion et Supprimer |
| [Les bases de données dans les formulaires](databases/in-forms.html) | Comment le `dbConfig` d'un champ nomme une base de données, et les formulaires écrits avant la 7.5.0 |

---

## Fonctionnement

Depuis la 7.5.0, une **base de données** est une connexion à part entière, ajoutée dans **Connexions > Bases de données**, entre **Coffres de secrets** et **Runners**.
Elle comporte trois éléments :

| Champ | Ce que c'est |
|---|---|
| Nom | Le nom que donne le `dbConfig` d'un champ pour l'interroger, comme `cmdb` |
| Description | À quoi elle sert |
| Identifiant | L'identifiant de [Connexions > Identifiants](credentials.html), de type **Base de données**, avec lequel elle se connecte |

L'identifiant conserve tout ce qui concerne la connexion, comme avant : le type de base de données (MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB),
l'hôte et le port, le nom de la base, TLS, et l'utilisateur et le mot de passe, conservés chiffrés ou lus depuis un [coffre de secrets](secret-stores/).
Une base de données n'a ni adresse ni secret propres, si bien qu'une base de données et un runner choisissent leur identifiant de la même façon.

Un champ interroge une base de données en la nommant dans `dbConfig` :

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Un nom qui n'est pas une base de données est cherché comme un identifiant de type base de données, comme avant la 7.5.0, si bien que les
anciens formulaires fonctionnent toujours sans changement (voir [Les bases de données dans les formulaires](databases/in-forms.html)).

---

## Mettre à jour vers la 7.5.0

La mise à jour remplit **Connexions > Bases de données** une seule fois, si bien que vos formulaires fonctionnent toujours sans aucun changement.

Elle crée une base de données pour chaque identifiant de type base de données, avec le nom et la description de l'identifiant, qui se connecte
avec cet identifiant. Un formulaire dont le `dbConfig` nomme l'identifiant trouve désormais la base de données du même nom, qui se connecte avec
le même identifiant : le résultat est le même. Les identifiants conservent tous leurs champs.

La mise à jour ne s'exécute qu'une fois : une base de données supprimée ensuite n'est pas recréée, et un identifiant de base de données ajouté
plus tard ne reçoit aucune base de données tant que vous n'en ajoutez pas une.

---

## Identifiants utilisés

Un identifiant avec lequel se connecte une base de données est utilisé, comme celui avec lequel un runner se connecte.

Il ne peut être ni supprimé ni renommé tant qu'une base de données le nomme, et l'onglet **Utilisé par** de sa page liste les bases de données (voir
[Identifiants utilisés](credentials.html#credentials-in-use)). Supprimer une base de données laisse son identifiant tel quel.

---

## Qui gère les bases de données

Les bases de données suivent les options de rôle des identifiants qu'elles nomment.

La liste, la page d'une base de données et son API nécessitent l'option de rôle `showSettings` ou `showConnectionsSettings`, comme les identifiants.
Seul un admin peut faire se connecter une base de données avec un identifiant que seul un admin peut nommer, comme un identifiant qui lit son mot
de passe depuis un coffre de secrets (voir [Qui peut modifier un identifiant](credentials.html#who-may-change-a-credential)) : les formulaires qui
l'interrogent se connecteraient avec cet identifiant, et **Tester la connexion** enverrait son secret à son serveur. Un autre utilisateur peut
enregistrer à nouveau une base de données avec l'identifiant qu'elle nomme déjà.

Une base de données déclarée dans le [seed de configuration](seed/) est en lecture seule sur sa page : modifiez-la plutôt dans le fichier seed.

---

## Le seed de configuration

Un seed déclare ses bases de données dans une section `databases:`, après les identifiants qu'elles nomment.

Chaque élément a un `name`, un `credential` de type base de données et, facultativement, une `description`. L'identifiant peut venir de la
section `credentials` du même seed ou être un identifiant créé dans l'application :

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

Voir l'[exemple](seed/example.html) complet et [Objets gérés](seed/managed-objects.html) pour la façon dont le seed prend en charge ce qu'il déclare.

---

## L'API REST

Les scripts gèrent les bases de données via l'[API REST](api/), sous `/api/v2/database`, avec les mêmes options de rôle que la page.

| Appel | Ce qu'il fait |
|---|---|
| `GET /api/v2/database` | Liste les bases de données, chacune avec le type de base, la base, l'hôte et le port de son identifiant, et le nombre de formulaires qui l'interrogent (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Renvoie la base de données de ce nom |
| `GET /api/v2/database/<id>` | Renvoie une base de données |
| `POST /api/v2/database` | Ajoute une base de données : son `name`, son `credential` et facultativement sa `description` |
| `PUT /api/v2/database/<id>` | Modifie une base de données |
| `DELETE /api/v2/database/<id>` | Supprime une base de données ; son identifiant reste |
| `POST /api/v2/database/<id>/check` | Teste sa connexion, avec son identifiant |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Un `credential` qui n'existe pas, ou qui n'est pas de type base de données, est refusé avec `400`. Chaque modification est écrite dans le journal d'audit.
