---
layout: default
title: Ajouter un dépôt
parent: Dépôts git
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Ajouter un dépôt
{: .no_toc }

La page Dépôts, chaque champ d'un dépôt, et la déclaration d'un dépôt dans le config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La page Dépôts

Les dépôts se gèrent dans **Paramètres > Connexions > Dépôts**, qui nécessite l'[option de rôle](../config/roles.html#role-options) `showSettings` ou, depuis la 7.3.0,
`showConnectionsSettings`. Certaines modifications sont réservées à un admin, voir [ci-dessous](#who-may-change-a-repository).

![Dépôts](../assets/screenshots/git.jpg)

La liste affiche le **Nom**, la **Description**, la **Branche**, le **Head** (le hash court du commit extrait), **Pull** et
**Push**. L'onglet **Détails** d'un dépôt affiche les mêmes badges Pull et Push au-dessus de son head :

| Colonne | Ce qu'elle indique |
|---|---|
| **Pull** | Le dernier clonage, pull ou réinitialisation : **En cours** pendant que git travaille, puis **Réussi** ou **Échoué** ; un tiret avant le premier |
| **Push** | **Échoué** quand le dernier push a échoué ; **Modifications en attente** quand des modifications enregistrées ici, par le concepteur, ne sont pas encore poussées vers le dépôt distant ; **Réussi** quand rien n'attend ; un tiret avant le premier push |

**Réussi** dans la colonne Push signifie seulement que rien n'attend d'être poussé : le dépôt distant peut encore contenir des commits plus récents qu'un
pull rapatrie. Le menu de chaque ligne contient ces actions :

| Action | Ce qu'elle fait |
|---|---|
| **Modifier** | Modifier les champs ci-dessous |
| **Pull** | Cloner le dépôt, ou faire un pull quand l'arbre de travail existe déjà |
| **Push** | Committer et pousser l'arbre de travail ; uniquement sur les dépôts utilisés pour les formulaires, la configuration, les playbooks, les workflows ou les inventaires, et activé seulement tant qu'il y a des modifications non encore poussées |
| **Réinitialiser** | Supprimer l'arbre de travail et le cloner de nouveau, ce qui abandonne les modifications locales |
| **Modifier les identifiants** | Ouvrir l'onglet **Identifiants** du dépôt, pour choisir l'identifiant qu'utilise git |
| **Afficher la sortie du dernier pull** | Afficher la sortie de git pour le dernier clonage, pull ou réinitialisation, avec le mot de passe masqué |
| **Afficher la sortie du dernier push** | Afficher la sortie de git pour le dernier push, avec le mot de passe masqué |
| **Supprimer** | Supprimer l'enregistrement et son arbre de travail sous `REPO_PATH` ; réservé à un admin |

**Tout puller**, au-dessus de la liste, fait un pull de tous les dépôts à la fois.

Une seule opération git s'exécute à la fois sur un dépôt. Une deuxième est refusée avec
`Repository '<name>' not found or already running, try again later`.

---

## Ajouter un dépôt

Cliquez sur **Ajouter un dépôt** : un assistant demande les champs en quatre étapes (**Dépôt**, **Identifiants**, **Utilisation**, **Planification
du pull**), et AnsibleForms lance le clonage en arrière-plan dès que vous enregistrez.

![Modifier un dépôt](../assets/screenshots/git-edit.jpg)

| Champ | Obligatoire | Signification |
|---|---|---|
| **Nom** | oui | Le nom du dossier sous `REPO_PATH` ; lettres, chiffres, tiret, tiret bas et point |
| **Branche** | oui | La branche à cloner, à puller et à pousser, par exemple `main` ; obligatoire depuis la 7.3.0. Seul un dépôt du config seed peut l'omettre, pour cloner la branche par défaut du dépôt distant |
| **Identifiant** | non | Un identifiant de [Connexions > Identifiants](../credentials.html) avec l'utilisateur et le mot de passe ou le jeton qu'utilise git ; **Ajouter un identifiant** en crée un |
| **URI** | oui | Le dépôt distant, `https://...` ou SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Activer le pull planifié** | non | Faire un pull du dépôt selon une planification |
| **Planification du pull** | non | Quand faire le pull, sous forme d'expression cron ; affiché une fois le pull planifié activé |
| **Description** | oui | Une description libre |
| **Utiliser pour la configuration ?** ... **Utiliser pour les inventaires ?** | non | Ce que contient le dépôt, voir [ci-dessus](./#what-a-repository-is-for) |
| **Pull au démarrage de l'application** | non | Cloner le dépôt, ou en faire un pull, à chaque démarrage d'AnsibleForms |

Renommer un dépôt déplace son arbre de travail vers le nouveau dossier, ainsi que sa planification de pull. Un dépôt d'avant
la 7 qui a encore son propre utilisateur l'indique dans son onglet **Identifiants** : choisissez un identifiant pour le remplacer.

---

## Qui peut modifier un dépôt

Le contenu d'un dépôt devient ce qu'AnsibleForms charge et exécute : depuis la 7.3.0, un utilisateur sans le rôle `admin` ne peut donc plus :

- ajouter ou supprimer un dépôt ;
- changer son **URI** ou sa **Branche** ;
- activer ou désactiver l'un de ses interrupteurs **Utiliser pour**.

Il peut toujours changer sa description, sa planification de pull et son identifiant, et faire un pull, un push ou une réinitialisation. Un identifiant qu'utilise un runner,
une connexion ou une méthode de connexion ne peut pas être choisi par lui ; le refus le nomme, et ne dit rien de ce qu'il contient.

---

## Déclarer des dépôts dans le config seed

Les dépôts peuvent aussi être déclarés dans le [config seed](../seed/), pour qu'une nouvelle instance les clone à son premier démarrage.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

Les champs sont ceux de la page, `credential` (un identifiant du seed ou de l'application), `rebase_on_start` (**Pull au démarrage de
l'application**) et `cron` (la planification du pull) compris ; `user` et `password` sont toujours acceptés à la place d'un identifiant. Un
dépôt issu du seed est en lecture seule dans l'interface, et il est cloné de nouveau au démarrage quand son arbre de travail est absent ; voir
[Objets gérés](../seed/managed-objects.html).
