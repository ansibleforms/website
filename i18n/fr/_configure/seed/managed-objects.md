---
layout: default
title: Objets gérés
parent: Seed de configuration
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Objets gérés
{: .no_toc }

Comment le seed possède les objets qu'il liste, et comment il garde les secrets à l'écart
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les sections à une seule ligne : tout ou rien

`ldap`, `settings` et `chat` sont chacune une **seule ligne**, le seed doit donc déclarer tous leurs champs ; les autres sections sont des listes.

Un seed qui omet un champ refuse de démarrer et le nomme :

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Déclarez explicitement une valeur vide avec `""` ou `false`. Quelques champs sont facultatifs, et un champ omis est laissé inchangé :

| Section | Champs facultatifs |
|---|---|
| `ldap` | `description`, `credential` (un identifiant avec lequel faire le bind) et `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` et `extra_headers` |
| `settings` | Aucun |

`settings` ne couvre que les champs mail et l'URL ; tous les autres paramètres restent modifiables.

---

## Le fichier ne contient aucun secret

Chaque `${VARIABLE}` est remplacée par cette variable d'environnement (sur Kubernetes, depuis un `Secret`), si bien que le fichier peut vivre dans Git.

Une variable non définie est une **erreur fatale**, si bien qu'un placeholder ne peut jamais finir stocké comme mot de passe.

Les identifiants peuvent aussi utiliser un [coffre de secrets](../secret-stores) (`secret_store`, `secret_ref`) ; `vault_path` disparaîtra dans la 8.

---

## Objets gérés

Un objet qui vient du seed est marqué **géré** :

- Il est imposé à **chaque** démarrage, si bien que le fichier fait toujours foi.
- Il est en lecture seule : l'API répond **403**, l'interface désactive Modifier et Supprimer, et sa propre page indique qu'il provient du fichier
  de seed de configuration et est en lecture seule.
- Seul le seed peut poser ou retirer ce marqueur.

Les objets créés à la main ne sont **jamais touchés**, sauf si le seed déclare le même nom. Cet enregistrement est alors **adopté** :
les champs déclarés sont imposés et il passe en lecture seule. L'adoption est journalisée comme un avertissement et dans la piste d'audit.

L'application du seed est idempotente : les enregistrements qui correspondent déjà sont laissés tels quels, si bien qu'un redémarrage indique normalement `0 updated`.

Un dépôt déclaré dont l'arbre de travail manque est **cloné à nouveau** à chaque démarrage, si bien qu'un premier clonage échoué est
retenté. La ligne *Dépôts* de la page Statut montre tout dépôt sans arbre de travail.

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

Retirer `CONFIG_SEED_PATH` ne libère **rien** : le seed n'est plus appliqué, et les enregistrements qu'il gérait restent gérés
et en lecture seule. Pour les modifier à nouveau, libérez-les d'abord : pointez `CONFIG_SEED_PATH` vers un fichier qui ne les contient pas (un fichier vide ne déclare
rien et libère tous les enregistrements), laissez-le s'appliquer à un démarrage ou à un rechargement, puis retirez la variable. Les enregistrements libérés restent tels
quels, et deviennent modifiables.
