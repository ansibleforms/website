---
layout: default
title: Votre premier formulaire
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# Votre premier formulaire
{: .no_toc }

Écrire un playbook, lui construire un formulaire dans le Concepteur, le lancer et retrouver le job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ce tutoriel part d'une installation neuve, voir [Installation](installation/). Il prend environ un quart d'heure.

---

## 1. Se connecter

Ouvrez AnsibleForms dans un navigateur et connectez-vous en tant qu'administrateur.

Le compte par défaut est `admin` / `AnsibleForms!123` (ou vos valeurs [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)) ; la page **Formulaires** s'ouvre :

![La page Formulaires, avec des formulaires d'exemple](assets/screenshots/dashboard.jpg)

---

## 2. Écrire le playbook

Un formulaire `ansible` exécute un playbook du dossier des playbooks, le playbook vient donc en premier. Enregistrez ceci sous `hello.yaml` :

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

Le playbook lit quatre variables. Le formulaire que vous construisez ensuite les envoie comme extravars, une par champ.

Placez le fichier dans le dossier `playbooks` du dossier persistant
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)) ; créez le dossier s'il n'existe pas encore :

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Depuis les sources</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Le dossier que vous avez monté sur `/app/dist/persistent`, `/srv/apps/ansibleforms/persistent` dans l'exemple d'installation :

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

Le dossier `data/playbooks` du projet docker-compose :

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

Le volume persistant, monté sur `/app/dist/persistent` dans le pod AnsibleForms. Cherchez le nom du pod, puis copiez-y le fichier :

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

Le dossier `persistent/playbooks` du serveur, `/srv/apps/ansibleforms/server` dans l'exemple d'installation :

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Quand un dépôt git a **Utiliser pour les playbooks ?** activé, les playbooks sont exécutés depuis ce dépôt à la place :
> commitez-y `hello.yaml`. Voir [Concepteur et git](gui/designer-and-git.html).

---

## 3. Créer le formulaire

Les formulaires sont des fichiers YAML dans le dossier des formulaires. Le Concepteur les modifie dans le navigateur et les vérifie avant d'enregistrer.

1. Cliquez sur **Concepteur** dans le menu du haut, puis sur **Formulaires** dans le menu de gauche.
2. Cliquez sur l'interrupteur en haut à droite (**Démarrer le concepteur**). Il verrouille la configuration pour que personne d'autre ne la modifie en même
   temps, puis affiche **Verrouillé par moi**.
3. Cliquez sur **Nouveau fichier**, le premier bouton de la barre d'outils, et saisissez le nom de fichier `hello-world.yaml`. Le Concepteur y ajoute un formulaire
   appelé `New Form`.
4. Remplacez le YAML de l'éditeur par ce formulaire :

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. Cliquez sur **Valider** (la coche), puis sur **Enregistrer**. L'enregistrement écrit `hello-world.yaml` dans le dossier des formulaires.
6. Cliquez à nouveau sur l'interrupteur pour libérer le verrou.

![Le Concepteur, en train de modifier un formulaire](assets/screenshots/designer.jpg)

Le formulaire utilise quatre types de champs :

| Champ | Type | Ce qu'il fait |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Une zone de texte obligatoire |
| `target_env` | [`enum`](formfields/enum.html) | Une liste déroulante avec une liste fixe de `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Une liste déroulante remplie par une [expression](expressions/local.html) locale ; `__auto__` sélectionne le premier élément |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Une case à cocher, envoyée comme `true` ou `false` |

`vm_size` affiche les deux colonnes, `size` et `cpus`, et envoie `size`, la première ; `valueColumn` en choisit une autre.

`roles: [default]` permet à tout utilisateur connecté d'exécuter le formulaire, et `categories: [Default]` le place dans la catégorie que définit le
`config.yaml` par défaut.

{: .note }
> Vous pouvez aussi copier `hello-world.yaml` dans [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH), et [le valider dans VS Code](faq.html#vs-code-validation-for-form-files).

---

## 4. Le lancer

Ouvrez le formulaire depuis la page **Formulaires** : cliquez sur **Formulaires** dans le menu du haut et choisissez **Hello world** dans la catégorie **Default**.

Saisissez votre nom et modifiez les autres champs si vous le souhaitez. Cliquez sur **Afficher les variables supplémentaires** pour voir ce que le playbook va
recevoir, puis cliquez sur **Soumettre** :

![Un formulaire](assets/screenshots/form.jpg)

---

## 5. Suivre la sortie

Le job démarre immédiatement, et sa sortie apparaît sous le formulaire pendant son exécution, pour se terminer par une barre **Terminé** :

![La sortie d'un job](assets/screenshots/run.jpg)

La tâche debug affiche vos valeurs, par exemple `Hello Alice: a small machine in development (dry run: True)`.

L'avertissement sur le localhost implicite est normal sans inventaire ; un vrai formulaire définit un [`inventory`](forms/ansible.html).

---

## 6. Le retrouver dans l'historique des jobs

Chaque lancement est conservé comme un job. Cliquez sur **Jobs** dans le menu du haut : le nouveau job est en tête de **Tous les jobs**.

Cliquez sur le job pour revoir sa sortie, et sur **Afficher les variables supplémentaires** pour voir ce qui a été envoyé. Les icônes devant chaque job
le relancent ou le suppriment :

![L'historique des jobs](assets/screenshots/job-output.jpg)

---

## Étapes suivantes

Développez ce formulaire à l'aide des pages de référence :

* **[Formulaires](forms/)** : chaque propriété de formulaire, les modèles sur les runners, les formulaires workflow, les points d'approbation et les notifications
* **[Champs de formulaire](formfields/)** : tous les types de champs, avec la validation, les dépendances et la mise en page
* **[Expressions](expressions/)** : remplir les champs depuis des API REST, des bases de données et des fichiers
* **[Rôles](config/roles.html)** et **[catégories](config/categories.html)** dans `config.yaml` : décider qui voit quel formulaire
* **[Comment ça marche](how-it-works.html)** : ce qui se passe derrière un lancement, et où tout est stocké
