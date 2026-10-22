---
layout: default
title: LDAP
parent: Authentification
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Permettez aux utilisateurs de l'annuaire de se connecter avec leur propre mot de passe, et attribuez-leur des rôles via leurs groupes d'annuaire
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fonctionnement

AnsibleForms se connecte à l'annuaire avec un compte de bind, recherche l'utilisateur, puis effectue un bind en tant que cet utilisateur pour vérifier
le mot de passe :

1. L'utilisateur se connecte avec son nom d'utilisateur et son mot de passe. Quand aucun utilisateur **local** ne porte ce nom, LDAP est essayé.
2. AnsibleForms effectue un bind avec le compte de bind de l'identifiant de l'annuaire, et cherche dans **Base de recherche** une entrée dont
   l'**Attribut nom d'utilisateur** est égal au nom d'utilisateur.
3. Il effectue un bind en tant que l'entrée trouvée, avec le mot de passe saisi.
4. Les groupes sont lus depuis l'entrée (ou depuis une recherche de groupes), filtrés, et préfixés par `ldap/`.

Un nom d'utilisateur au format UPN (`jdoe@example.com`) qui ne trouve aucun utilisateur est réessayé une fois avec la partie avant le `@`, afin que les utilisateurs
puissent se connecter sous l'une ou l'autre forme même quand l'attribut nom d'utilisateur contient le nom court. Un mauvais mot de passe n'est jamais réessayé.

Un même jeu de paramètres sert pour Active Directory, OpenLDAP et d'autres ; depuis la 7.3.0, il peut y avoir [plusieurs annuaires](#several-directories).

---

## Paramètres

Depuis la 7.3.0, les paramètres sont propres à chaque annuaire. **Accès > LDAP** liste les annuaires, dans l'ordre où un nom d'utilisateur simple est recherché :

![Accès > LDAP](../assets/screenshots/ldap.jpg)

| Menu de ligne | Ce qu'il fait |
|---|---|
| Modifier | Ouvre la page de l'annuaire |
| Tester la connexion | Essaie une connexion avec un nom d'utilisateur et un mot de passe de test, voir [Tester la connexion](#testing-the-connection) |
| Activer, Désactiver | Active ou désactive l'annuaire ; `main` est désactivé plutôt que supprimé |
| Monter, Descendre | Change sa place dans l'ordre de recherche |
| Supprimer | Retire l'annuaire ; affiché mais désactivé sur `main` |

L'ajout d'un annuaire demande ses champs en quatre étapes, les onglets de sa page. **Détails** contient **Activé**, le **Nom** et une **Description** :

| Onglet | Paramètre | Signification |
|---|---|---|
| Identifiants | Identifiant | Obligatoire. Un identifiant `ldap` de [Connexions > Identifiants](../credentials.html), qui contient la connexion, voir plus bas |
| Utilisateurs | Base de recherche | DN où commence la recherche d'utilisateurs, par ex. `OU=Users,DC=example,DC=com`. Les sous-arbres sont aussi parcourus |
| Utilisateurs | Attribut nom d'utilisateur | Attribut comparé au nom de connexion : `sAMAccountName` dans AD (par défaut), `uid` dans OpenLDAP |
| Utilisateurs | Attribut mail | Attribut contenant l'adresse e-mail, généralement `mail` |
| Utilisateurs | Domaines de connexion | Domaines dont les connexions `user@domain` vont directement vers cet annuaire, voir [Plusieurs annuaires](#several-directories) |
| Groupes | Attribut groupes | Attribut de l'entrée utilisateur qui contient les groupes (`memberOf`, par défaut), ou `groups` avec une recherche de groupes |
| Groupes | Base de recherche des groupes | DN où commence la recherche de groupes |
| Groupes | Classe de groupe | objectClass des groupes, par ex. `group`, `groupOfNames` ou `posixGroup` |
| Groupes | Attribut membre du groupe | Attribut d'un groupe qui liste ses membres, par ex. `member`, `uniqueMember` ou `memberUid` ; par défaut `member` |
| Groupes | Attribut utilisateur pour membre du groupe | Attribut de l'utilisateur que contiennent ces valeurs de membre, par ex. `dn` ou `uid` ; par défaut `dn` |
| Groupes | Filtre de groupe | Expression régulière ; seuls les groupes dont le nom correspond sont conservés. Vide, tous les groupes sont conservés |

Les valeurs par défaut des trois derniers champs de groupe ne s'appliquent que lorsque la recherche de groupes est utilisée, voir la section suivante.

L'identifiant `ldap` indique comment l'annuaire est joint et sous quel compte il est interrogé :

| Champ | Signification |
|---|---|
| Serveurs | Un par champ, sous la forme `host`, `host:port` ou `ldaps://host:port`, essayés dans cet ordre : quand l'un est injoignable, on passe au suivant |
| Port | `389` pour LDAP en clair, `636` pour LDAPS |
| Activer TLS | Se connecter en LDAPS (`ldaps://`). StartTLS sur le port 389 n'est pas pris en charge |
| Ignorer les certificats | Ne pas valider le certificat du serveur. Affiché uniquement avec **Activer TLS** |
| Certificat | Le certificat client qu'AnsibleForms présente aux serveurs, en PEM, quand les certificats sont vérifiés |
| Bundle CA | Le ou les certificats de CA qui ont signé le certificat du serveur, en PEM, quand les certificats sont vérifiés |
| DN de l'utilisateur de bind | Le DN du compte de service qui interroge l'annuaire |
| Mot de passe de l'utilisateur de bind | Son mot de passe, stocké chiffré ou lu depuis un [coffre de secrets](../secret-stores/) |

Seul un admin peut ajouter ou modifier un identifiant `ldap`, voir [Qui peut modifier un identifiant](../credentials.html#who-may-change-a-credential).
Jusqu'à la 7.2.0, les serveurs, TLS et le compte de bind étaient des champs des paramètres LDAP. La mise à jour vers la 7.3.0 les déplace dans un identifiant,
voir [Adresses dans les identifiants](../credentials/types.html#addresses-in-credentials) :

| L'annuaire avant la mise à jour | Où vont ses serveurs |
|---|---|
| Son propre DN et mot de passe de bind, sans identifiant | Un nouvel identifiant `ldap` nommé `<directory>-ldap`, comme `main-ldap` |
| Un identifiant sans serveurs | Dans cet identifiant |
| Un identifiant qui contient déjà d'autres serveurs | Une copie de l'identifiant nommée `<credential>-<directory>`, que l'annuaire référence ensuite |

Un nom déjà pris reçoit `-2`, `-3` et ainsi de suite. Un annuaire issu du seed de configuration est laissé tel quel : c'est le seed qui le gère.

---

## Groupes

Les groupes proviennent de l'un de deux endroits, et l'**Attribut groupes** décide lequel est utilisé :

- **Un attribut de l'entrée utilisateur**, généralement `memberOf`. C'est la configuration courante pour Active Directory, et pour
  OpenLDAP avec l'overlay `memberof`.
- **Une recherche de groupes**, pour les annuaires sans `memberOf`. Elle ne s'exécute que lorsque **Base de recherche des groupes** et **Classe de groupe**
  sont tous deux définis : AnsibleForms cherche alors les groupes de cette classe dont l'**Attribut membre du groupe** contient
  l'**Attribut utilisateur pour membre du groupe** de l'utilisateur, et stocke le résultat dans l'attribut `groups`. Mettez **Attribut groupes** à `groups`
  pour l'utiliser.

{: .note }
> Avec **Attribut groupes** à `memberOf`, une recherche de groupes configurée s'exécute mais son résultat n'est pas utilisé pour les rôles.

Chaque groupe est un DN, et AnsibleForms garde son premier CN : `CN=AF-Admins,OU=Groups,DC=example,DC=com` devient `AF-Admins`.
Le **Filtre de groupe** est ensuite appliqué à ce nom, et les groupes restants reçoivent le préfixe `ldap/` : `ldap/AF-Admins`.

Dans les grands annuaires, le filtre garde les jetons et les jobs légers ; une expression régulière invalide conserve tous les groupes et est journalisée.

---

## Correspondance avec les rôles

Dans config.yaml, un groupe LDAP est `ldap/<group CN>` et un utilisateur LDAP est `ldap/<username>`, tous deux sensibles à la casse :

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

Le nom d'utilisateur est la valeur de l'**Attribut nom d'utilisateur** telle que l'annuaire la renvoie, et non telle que l'utilisateur l'a saisie.
Voir [Rôles](../config/roles.html) pour les options de rôle.

---

## Plusieurs annuaires

Depuis la 7.3.0, il peut y avoir plusieurs annuaires, chacun avec ses propres serveurs, utilisateurs et groupes. Leurs noms distinguent leurs membres :

| Annuaire | Nom d'utilisateur | Groupes | Dans un rôle |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Tout autre, comme `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Un utilisateur nomme l'annuaire à la connexion sous la forme `corp\jdoe` ou `corp/jdoe`, ou se connecte avec une adresse d'un domaine que possède
l'annuaire. Un nom d'utilisateur simple est essayé dans chaque annuaire activé, dans leur ordre, et il en va de même pour un nom comme `other\jdoe` quand aucun
annuaire ne s'appelle `other` : il est alors recherché tel que saisi.

Le premier annuaire qui connaît l'utilisateur tranche : un mauvais mot de passe y est la réponse, et l'annuaire suivant n'est pas
essayé, puisqu'il pourrait contenir quelqu'un d'autre portant ce nom. Un annuaire injoignable est ignoré.

L'annuaire nommé `default` jusqu'à la 7.2.0 s'appelle `main` depuis la 7.3.0 : la mise à jour le renomme, et une nouvelle installation démarre
avec `main`. Ses membres gardent leurs noms courts, si bien que les rôles qui les nomment n'ont pas besoin d'être modifiés. L'annuaire `main` ne peut pas être
renommé, et un nom d'annuaire ne contient que des lettres, des chiffres, `-` et `_`.

---

## Tester la connexion

**Tester la connexion** demande un nom d'utilisateur et un mot de passe de test, et essaie une connexion avec les paramètres affichés à l'écran, enregistrés ou non.
En cas de succès, il affiche l'entrée d'annuaire de l'utilisateur, qui vous indique les noms d'attributs exacts et les DN de groupes à utiliser.

Un utilisateur de test qui n'existe pas renvoie quand même un succès : la connexion et le compte de bind fonctionnent, seul l'utilisateur est
introuvable. Erreurs typiques :

| Message | Cause |
|---|---|
| `Bad server or port (connection failed)` | Le nom d'hôte ne se résout pas ou le port n'est pas joignable. |
| `Wrong binding credentials` | Le DN ou le mot de passe de bind de l'identifiant de l'annuaire est incorrect. |
| `Unable to verify the certificate` | Le certificat du serveur n'est pas signé par le bundle CA de l'identifiant. |
| `Certificate is not valid` | Le certificat ou le bundle CA de l'identifiant ne contient pas de certificat PEM valide. |

---

## Exemple Active Directory

Cet exemple se connecte à deux contrôleurs de domaine en LDAPS et ne garde que les groupes dont le nom commence par `AF-` :

| Paramètre | Valeur |
|---|---|
| Identifiant > Serveurs | `dc01.example.com`, puis `dc02.example.com` |
| Identifiant > Port | `636` |
| Identifiant > Activer TLS | activé |
| Identifiant > Ignorer les certificats | désactivé, avec un certificat client et la chaîne de CA de l'autorité d'entreprise |
| Identifiant > DN de l'utilisateur de bind | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Base de recherche | `OU=Users,DC=example,DC=com` |
| Attribut mail | `mail` |
| Attribut nom d'utilisateur | `sAMAccountName` |
| Attribut groupes | `memberOf` |
| Filtre de groupe | `^AF-` |

Les membres de `CN=AF-Operators,…` correspondent aux rôles avec `ldap/AF-Operators`, et se connectent en tant que `jdoe` ou `jdoe@example.com`.

---

## Exemple OpenLDAP

Cet exemple utilise une recherche de groupes sur des entrées `groupOfNames`, il fonctionne donc sans l'overlay `memberof` :

| Paramètre | Valeur |
|---|---|
| Identifiant > Serveurs | `ldap.example.com` |
| Identifiant > Port | `636` |
| Identifiant > Activer TLS | activé |
| Identifiant > DN de l'utilisateur de bind | `cn=readonly,dc=example,dc=com` |
| Base de recherche | `ou=people,dc=example,dc=com` |
| Attribut mail | `mail` |
| Attribut nom d'utilisateur | `uid` |
| Attribut groupes | `groups` |
| Base de recherche des groupes | `ou=groups,dc=example,dc=com` |
| Classe de groupe | `groupOfNames` |
| Attribut membre du groupe | `member` |
| Attribut utilisateur pour membre du groupe | `dn` |

Un utilisateur listé dans `cn=af-admins,ou=groups,dc=example,dc=com` reçoit le groupe `ldap/af-admins`. Pour des groupes `posixGroup`,
utilisez **Attribut membre du groupe** `memberUid` et **Attribut utilisateur pour membre du groupe** `uid`.

Avec l'overlay `memberof`, laissez vides les champs de recherche de groupes et mettez **Attribut groupes** à `memberOf`.

---

## Pièges courants

La plupart des problèmes LDAP se ramènent à l'un de ceux-ci :

- **Un utilisateur local portant le même nom.** Les utilisateurs locaux sont vérifiés en premier, donc l'annuaire n'est jamais interrogé pour ce nom.
- **Aucun groupe, ou pas les bons.** L'attribut groupes doit exister (`groups` avec une recherche de groupes) ; `memberOf` ignore l'imbrication.
- **Des noms de groupe qui ne correspondent pas.** Utilisez `ldap/<CN>` avec la même casse, et vérifiez que le filtre de groupe conserve le groupe.
- **Des DN de groupe qui ne commencent pas par un CN.** Seule la première valeur `CN=` sert de nom de groupe, donc chaque DN de groupe
  doit commencer par `CN=` (ou `cn=`).
- **Les certificats.** TLS nécessite les deux champs de certificat de l'identifiant et un nom de serveur correspondant ; Ignorer les certificats est réservé aux tests.
- **Des paramètres impossibles à enregistrer.** Quand un annuaire provient du [seed de configuration](../seed/managed-objects.html), sa page
  est en lecture seule : modifiez plutôt le fichier seed.

Une connexion qui échoue affiche un message générique. La raison est journalisée par le serveur et conservée dans le journal d'audit, et pour Active
Directory elle est traduite depuis le code de l'annuaire, par ex. `Wrong password`, `Account locked` ou `Password expired`.
