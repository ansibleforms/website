---
layout: default
title: Comptes locaux
parent: Authentification
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Comptes locaux
{: .no_toc }

L'admin intégré, et les utilisateurs et groupes stockés dans la base de données d'AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'admin intégré

Chaque démarrage crée le groupe local `admins` et l'utilisateur admin s'ils manquent ; trois variables pilotent l'admin :

| Variable | Défaut | Signification |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Nom d'utilisateur de l'admin, créé dans le groupe `admins` quand aucun utilisateur ne porte ce nom. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Mot de passe donné à l'admin lors de sa création (ou réinitialisation). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` réinitialise le mot de passe de l'admin à `ADMIN_PASSWORD` et le remet dans `admins`. |

`ADMIN_PASSWORD` ne sert qu'à la création ou à la réinitialisation de l'utilisateur : le modifier ensuite ne fait rien à lui seul.

Un utilisateur local qui se connecte avec le mot de passe par défaut public `AnsibleForms!123` ne peut que le changer. Le navigateur ouvre une
page de changement de mot de passe impossible à fermer, et le serveur répond à toute autre requête par `403` (code
`password_change_required`) jusqu'à ce que le mot de passe soit changé. Le nouveau mot de passe doit être différent de celui par défaut ; après le
changement, l'utilisateur se reconnecte avec lui. Définissez `ADMIN_PASSWORD` avec votre propre valeur avant le premier démarrage pour éviter cette étape.

Changer `ADMIN_USERNAME` après le premier démarrage crée un second utilisateur admin portant ce nom ; l'ancien est conservé.

{: .warning }
> `REINIT_ADMIN=1` réinitialise le mot de passe à **chaque** démarrage tant qu'elle est définie. Utilisez-la pour récupérer un mot de passe admin perdu,
> puis retirez-la et redémarrez.

---

## Utilisateurs et groupes

Les utilisateurs et groupes locaux se gèrent dans **Accès > Utilisateurs** et **Accès > Groupes**. Un utilisateur a ces champs :

| Champ | Signification |
|---|---|
| Nom d'utilisateur | Le nom de connexion. Doit être unique. |
| Description | Facultatif. |
| Mot de passe | Stocké sous forme de hash. Changez-le plus tard avec l'action **Changer le mot de passe**. |
| E-mail | Facultatif. |
| Groupe | Le premier groupe local de l'utilisateur. Ajoutez-en d'autres dans l'onglet **Groupes** de la page de l'utilisateur. |

Les utilisateurs locaux changent leur propre mot de passe dans leur profil ; les autres utilisateurs le font dans leur annuaire ou leur fournisseur d'identité.

Un utilisateur peut appartenir à plusieurs groupes, et reçoit les rôles de tous. L'onglet **Groupes** de la page d'un utilisateur ajoute et
retire des groupes, tout comme l'onglet **Utilisateurs** de la page d'un groupe. Un utilisateur garde au moins un groupe : le dernier ne peut pas
être retiré.

Un groupe qui a encore des utilisateurs ne peut pas être supprimé : retirez d'abord ses utilisateurs. Le groupe `admins` ne peut jamais être supprimé ni
renommé, et l'utilisateur `admin` ne peut jamais être supprimé.

---

## Autoriser la connexion

L'onglet **Détails** de la page d'un utilisateur a un interrupteur **Autoriser la connexion**, proposé aussi comme **Bloquer la connexion** et **Autoriser
la connexion** dans le menu de ligne de la liste des utilisateurs. Il existe aussi bien pour les utilisateurs locaux que pour les utilisateurs LDAP et SSO :

- **Activé** : l'utilisateur se connecte normalement.
- **Désactivé** : les sessions de l'utilisateur se terminent immédiatement et toute connexion est refusée, jusqu'à ce qu'un admin le réactive. La page
  demande d'abord une confirmation.

L'interrupteur ne peut pas être désactivé pour l'utilisateur `admin`, le moyen de revenir, ni par un admin pour son propre compte. La page
d'un utilisateur LDAP ou SSO a aussi **Terminer les sessions**, qui déconnecte l'utilisateur partout sans le bloquer.

---

## Correspondance avec les rôles

Les rôles nomment les groupes locaux `local/<group>` et les utilisateurs `local/<user>` ; par défaut, `admins` reçoit `admin` :

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Gardez `local/admins` dans le rôle `admin`, pour que l'admin intégré puisse toujours se connecter, même quand l'annuaire ou le
fournisseur d'identité est indisponible. Quand config.yaml ne peut pas du tout être chargé, les membres de `local/admins` reçoivent quand même le
rôle `admin`, pour que vous puissiez vous connecter et le corriger. Voir [Rôles](../config/roles.html) pour les options de rôle.

---

## Comptes locaux et LDAP

Une connexion par nom d'utilisateur et mot de passe vérifie les utilisateurs locaux avant LDAP. Quand un utilisateur local porte le même nom qu'un utilisateur
de l'annuaire, le compte local l'emporte toujours et le mot de passe de l'annuaire ne fonctionne pas pour ce nom. Donnez aux comptes locaux des noms
qui ne peuvent pas entrer en conflit avec les comptes de l'annuaire, par exemple avec un préfixe `svc-`.
