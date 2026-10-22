---
layout: default
title: Formulaires
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formulaires
{: .no_toc }

Définir les formulaires que remplissent vos utilisateurs
{: .fs-6 .fw-300 }

---

Pour les auteurs de formulaires : comment les formulaires s'écrivent en YAML, d'où ils sont chargés, et les propriétés de chaque type de formulaire.

Les formulaires sont au cœur d'AnsibleForms. Chaque formulaire est une interface web qui recueille les saisies de l'utilisateur et, avec ces données, exécute
un playbook Ansible, un template AWX, AAP ou Ascender, un template Semaphore, un job Rundeck ou Jenkins, ou un
[workflow](../workflows/).

Les formulaires sont définis dans des fichiers YAML du dossier des formulaires. Chaque fichier YAML contient soit un seul formulaire, soit une liste de formulaires, et des sous-dossiers peuvent servir à les organiser.

**VIDÉO** : [Créer votre premier formulaire](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Comprendre la structure d'un formulaire

Chaque formulaire d'AnsibleForms est configuré avec un ensemble de propriétés. **[Propriétés communes](common.html)** liste les propriétés qui s'appliquent à tous les types de formulaire ; les pages propres à chaque type décrivent les propriétés supplémentaires.

---

## Comment les formulaires sont chargés

AnsibleForms charge les formulaires depuis les emplacements suivants :

1. **DEPUIS LES DÉPÔTS** : tous les dépôts dont l'interrupteur « Utiliser pour les formulaires ? » est activé (plusieurs dépôts sont pris en charge)
   - Les formulaires de tous les dépôts activés sont fusionnés automatiquement.
   - Dans chaque dépôt, on cherche d'abord un sous-dossier `forms/`.
   - S'il n'existe pas de sous-dossier `forms/`, la racine du dépôt est utilisée.
   - Les formulaires créés dans le concepteur et pas encore poussés sont conservés dans un dossier de préparation
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) et chargés avec eux.

2. **DEPUIS LE DOSSIER LOCAL** : le dossier local `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), quand aucun dépôt n'a « Utiliser pour les formulaires ? » activé

{: .warning }
> **Remarque :** quand « Utiliser pour les formulaires ? » est activé sur plusieurs dépôts, tous leurs formulaires sont fusionnés. Les noms de formulaire doivent être uniques entre les dépôts pour éviter les conflits.

---

## Où un formulaire s'exécute

Le type d'un formulaire décide du genre de [runner](../runners.html) sur lequel son job s'exécute : un RTE pour `ansible`, un runner AWX pour `awx`,
`aap` et `ascender`, et un runner de son propre type pour `semaphore`, `rundeck` et `jenkins`.

- `runner: <name>` sur le formulaire choisit un runner de ce type par son nom ; sans cela, le job s'exécute sur le runner par défaut du type.
- Un runner désactivé dans **Connexions > Runners** fait échouer le job, que le formulaire le nomme ou qu'il soit celui par défaut. Le job
  ne se rabat jamais sur un autre runner.
- Lorsque l'un des rôles de l'utilisateur liste `runners` dans `config.yaml`, le job ne peut s'exécuter que sur un runner listé par un tel rôle, sinon il est
  refusé. Les rôles sans cette liste ne le limitent pas, et un administrateur n'est jamais limité.

---

## Dans cette section

Les pages suivantes décrivent en détail les propriétés des formulaires :

| Page | Contenu |
|---|---|
| [Propriétés communes](common.html) | Les propriétés qui s'appliquent à tous les types de formulaire (`name`, `description`, `help`, `type`, `fields`) |
| [Formulaires Ansible](ansible.html) | Les propriétés propres à `type: ansible` |
| [Formulaires AWX](awx.html) | Les propriétés propres à `type: awx` |
| [Formulaires Semaphore](semaphore.html) | Les propriétés propres à `type: semaphore`, qui exécute un template Semaphore |
| [Formulaires Rundeck](rundeck.html) | Les propriétés propres à `type: rundeck`, qui exécute un job Rundeck |
| [Formulaires Jenkins](jenkins.html) | Les propriétés propres à `type: jenkins`, qui lance le build d'un job Jenkins |
| [Formulaires multistep](multistep.html) | Les propriétés propres à `type: multistep`, obsolète au profit de `workflow` |
| [Formulaires workflow](workflow.html) | Les propriétés propres à `type: workflow`, qui exécute un [workflow](../workflows/) |
| [Assistant](wizard.html) | Répartir la saisie d'un formulaire sur plusieurs pages (fonctionne avec tout type de formulaire exécutable) |
| [Sous-formulaire](subform.html) | Les sous-formulaires n'utilisent que les propriétés communes |
| [Points d'approbation](approval.html) | Mettre un job en pause jusqu'à son approbation (`approval`) |
| [Notifications](notifications.html) | Envoyer des e-mails et des messages sur des canaux selon le statut ou les événements d'un job (`notifications`) |
| [Actions sur statut de job](job-status-action.html) | Agir sur le formulaire quand un job change de statut (`onSubmit`, `onSuccess`, ...) |
