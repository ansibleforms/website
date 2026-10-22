---
layout: default
title: Authentification
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Authentification
{: .no_toc }

Choisissez comment les utilisateurs se connectent, et comment leur compte et leurs groupes mènent aux rôles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Méthodes de connexion

AnsibleForms prend en charge quatre méthodes de connexion, et plusieurs peuvent être actives en même temps :

| Méthode | Quand l'utiliser | Page |
|---|---|---|
| Comptes locaux | L'admin intégré, les comptes de service, les petites équipes, ou une solution de repli quand l'annuaire est indisponible. | [Comptes locaux](local.html) |
| LDAP | Les utilisateurs et les groupes se trouvent dans Active Directory, OpenLDAP ou un autre annuaire LDAP. | [LDAP](ldap.html) |
| Entra ID | Les utilisateurs se connectent avec leur compte Microsoft 365 / Entra ID (authentification unique). | [Entra ID](entra-id.html) |
| OIDC | Authentification unique via un autre fournisseur OpenID Connect, comme Keycloak. | [OIDC](oidc.html) |

Les comptes locaux et LDAP se configurent dans **Accès > Utilisateurs**, **Groupes** et **LDAP** ; Entra ID et OIDC dans
**Accès > SSO**.

---

## Comment une connexion choisit la méthode

La page de connexion a un formulaire nom d'utilisateur et mot de passe, plus un bouton par fournisseur d'authentification unique activé :

- **Le nom d'utilisateur et le mot de passe** sont d'abord vérifiés auprès des utilisateurs locaux. L'annuaire n'est essayé que lorsqu'aucun utilisateur local ne porte ce nom et que LDAP
  est activé. Un utilisateur local avec un mauvais mot de passe est refusé sans interroger LDAP.
- **Les boutons Entra ID et OpenID** apparaissent sous **Se connecter** quand un tel fournisseur est activé. Ils envoient le navigateur vers
  le fournisseur puis le ramènent ; aucun mot de passe n'atteint AnsibleForms.

Un seul fournisseur Entra ID et un seul fournisseur OIDC sont activés à la fois : en activer un désactive les autres du même type.
Une connexion par nom d'utilisateur et mot de passe qui échoue affiche toujours le même message générique ; la raison se trouve dans le journal du serveur et le journal d'audit.

---

## Basculer l'authentification unique

Depuis la 7.3.0, chaque fournisseur dans **Accès > SSO** a deux interrupteurs propres, qui s'appliquent sans redémarrage :

| Interrupteur | Effet |
|---|---|
| **Activé** | Affiche le bouton du fournisseur sur la page de connexion et accepte sa connexion. L'activer désactive les autres fournisseurs du même type. |
| **Passer la page de connexion** | Les utilisateurs vont directement vers ce fournisseur, sans la page de connexion, tant que le fournisseur est activé. L'activer pour un fournisseur le désactive pour les autres ; il est grisé sur un fournisseur désactivé. |

Le formulaire nom d'utilisateur et mot de passe reste accessible à `/login?local`, pour l'admin local ou quand le fournisseur est en panne,
et il s'affiche après la déconnexion et quand une connexion par authentification unique revient avec une erreur.

Les variables `ENABLE_SSO` et `SSO_AUTO_LOGIN` sont supprimées dans la 7.3.0. Le premier démarrage de la 7.3.0 les lit une fois, et
journalise un avertissement à chaque démarrage tant qu'elles restent définies : retirez-les donc de l'environnement après la mise à jour :

| Variable avant la 7.3.0 | Ce que fait la mise à jour |
|---|---|
| `ENABLE_SSO=0` | Désactive tous les fournisseurs : ils restent configurés, sans bouton sur la page de connexion |
| `SSO_AUTO_LOGIN=1` | Active **Passer la page de connexion** pour le fournisseur activé, quand exactement un est activé et que `ENABLE_SSO` ne vaut pas `0` |

---

## De l'utilisateur aux rôles

Chaque connexion produit un utilisateur avec un **type** (`local`, `ldap`, `azuread` ou `oidc`), un nom d'utilisateur et une liste de groupes.
Chaque groupe reçoit le préfixe de son type, si bien qu'un groupe Entra ID est stocké et affiché comme `azuread/...` :

| Méthode de connexion | Nom d'utilisateur | Groupes |
|---|---|---|
| Local | le nom d'utilisateur local | `local/<group>`, un pour chaque groupe local de l'utilisateur |
| LDAP, annuaire `main` | la valeur de l'attribut de nom d'utilisateur | `ldap/<cn>`, le CN de chaque groupe que renvoie l'annuaire |
| LDAP, un autre annuaire | `<directory>/<username>` | `ldap/<directory>/<cn>`, voir [Plusieurs annuaires](ldap.html#several-directories) |
| Entra ID | le claim `upn`, ou `preferred_username` quand le token n'a pas de `upn` | `azuread/<object id>` et `azuread/<display name>` de chaque groupe, lus depuis Microsoft Graph |
| OIDC | le claim `preferred_username` | `oidc/<name>`, depuis le claim `groups` de l'ID token |

Les [rôles](../config/roles.html) de config.yaml font ensuite correspondre ces valeurs : un rôle s'applique quand l'un de ses `groups` est l'un
des groupes de l'utilisateur, ou quand ses `users` contiennent `<type>/<username>`. Chaque utilisateur reçoit aussi le rôle `default`. Depuis la 7.3.0, un
rôle nomme un membre Entra ID `entraid/<group>` ou `entraid/<upn>`, ce qui correspond à la valeur `azuread/` stockée ; `azuread/`
dans un rôle fonctionne toujours et sera supprimé dans la 8.0. Le profil et les extravars du job continuent d'afficher `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

La page **Profil** d'un utilisateur liste le type de connexion, les groupes et les rôles, ce qui est le moyen le plus rapide de vérifier une correspondance.
L'option de rôle `allowLogin` peut refuser la connexion des utilisateurs qui ne correspondent à aucun rôle : mettez-la à `false` sur `default` et à
`true` sur les rôles autorisés à se connecter.
