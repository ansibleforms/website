---
layout: default
title: Objets gérés
parent: Seed de configuration
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Objets gérés
{: .no_toc }

Comment le seed possède les objets qu'il liste, et comment il garde les secrets à l'écart
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les sections à une seule ligne : tout ou rien

`ldap`, `settings` et `chat_assistant` (`chat` avant la 7.8.0) sont chacune une **seule ligne**, le seed doit donc déclarer tous leurs champs.

Un seed qui omet un champ refuse de démarrer et le nomme :

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Déclarez explicitement une valeur vide avec `""` ou `false`. Quelques champs sont facultatifs, et un champ omis est laissé inchangé :

| Section | Champs facultatifs |
|---|---|
| `ldap` | `description`, `credential` (un identifiant avec lequel faire le bind) et `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, et `credential` depuis la 7.8.0 |
| `settings` | Les clés `mail_*`, dépréciées depuis la 7.6.0 (voir [Exemple](example.html)) |

`settings` ne couvre que l'URL, et les clés mail dépréciées ; tous les autres paramètres restent modifiables.

---

## Le fichier ne contient aucun secret

Chaque `${VARIABLE}` est remplacée par cette variable d'environnement (sur Kubernetes, depuis un `Secret`), si bien que le fichier peut vivre dans Git.

Une variable non définie est une **erreur fatale**, si bien qu'un placeholder ne peut jamais finir stocké comme mot de passe.

Les identifiants peuvent aussi utiliser un [coffre de secrets](../secret-stores) (`secret_store`, `secret_ref`) ; `vault_path` disparaîtra dans la 8.

---

## Objets gérés

Un objet des sections de liste (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` et `labels`) ou d'une section à une seule ligne qui vient du seed est marqué **géré** :

- Il est imposé à **chaque** démarrage, si bien que le fichier fait toujours foi.
- Il est en lecture seule : l'API répond **403**, l'interface désactive Modifier et Supprimer, et sa propre page indique qu'il provient du fichier
  de seed de configuration et est en lecture seule.
- Seul le seed peut poser ou retirer ce marqueur.

Les objets créés à la main ne sont **jamais touchés**, sauf si le seed déclare le même nom. Cet enregistrement est alors **adopté** :
les champs déclarés sont imposés et il passe en lecture seule. L'adoption est journalisée comme un avertissement et dans la piste d'audit.

L'application du seed est idempotente : les enregistrements qui correspondent déjà sont laissés tels quels, si bien qu'un redémarrage indique normalement `0 updated`.

Un dépôt déclaré dont l'arbre de travail manque est **cloné à nouveau** à chaque démarrage, si bien qu'un premier clonage échoué est
retenté. La ligne *Dépôts* de la page Statut montre tout dépôt sans arbre de travail.

Depuis la 7.8.0, un [dépôt git](../repositories/) peut contenir les mêmes types d'objets. Un objet que contient un dépôt reste celui du
dépôt : l'élément du seed pour cet objet n'est pas appliqué, et le journal du serveur le signale. Un dépôt que déclare le seed reste celui du seed.

### Retirer un objet

Retirer un objet du fichier le **libère** : l'enregistrement reste et redevient modifiable. Supprimer une section entière
fait de même.

Ajoutez `prune: true` à une section de liste pour **supprimer** les enregistrements gérés que le fichier ne déclare plus :

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` ne supprime jamais un enregistrement créé à la main.

### Désactiver le seed

Retirer `CONFIG_SEED_PATH` désactive le seed : le démarrage suivant libère chaque enregistrement et chaque champ que le seed gérait, comme
le ferait un seed vide appliqué. Les enregistrements gardent leurs valeurs et redeviennent modifiables, et le journal du serveur et le
journal d'audit indiquent ce qui a été libéré.

Un `CONFIG_SEED_PATH` dont le fichier manque ne libère rien : le serveur refuse plutôt de démarrer, car un fichier monté peut simplement
être en retard.

---

## Paramètres que déclare le seed

Les sections ajoutées dans la 7.8.0 sont possédées moins strictement que les objets gérés, de deux façons.

| Sections | Comment le seed les possède |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Champ par champ : chaque champ déclaré est en lecture seule sur sa page, avec un avis, et l'API refuse de le modifier (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Créés ou modifiés à chaque application, jamais verrouillés ni supprimés |

Un champ de `defaults`, `logo`, `icon`, `name`, `links` ou `mcp` que le seed ne déclare plus est libéré, et tous le sont quand le seed
est désactivé. Un logo ou une icône du seed ne peut être ni téléversé ni retiré dans l'application. Quand un dépôt contient la même page,
le seed garde les champs qu'il déclare et le dépôt contient les autres.

Un utilisateur, un groupe, une annonce, une version de l'avertissement ou la clé SSH et les hôtes connus du seed restent modifiables dans
l'application, et la prochaine application du seed réécrit ses valeurs là où elles diffèrent. Retirer un élément du fichier le laisse dans
l'application, et `prune` n'en supprime aucun.
