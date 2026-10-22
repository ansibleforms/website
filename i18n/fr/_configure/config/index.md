---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Catégories, rôles et constantes pour tous les formulaires
{: .fs-6 .fw-300 }

---

Pour les administrateurs : le fichier config.yaml qui contient les catégories, les rôles et les constantes partagés par tous les formulaires.

AnsibleForms utilise un fichier config.yaml pour configurer les catégories, les rôles et les constantes. Si aucun fichier n'est fourni, il en génère un avec une configuration minimale. La configuration peut aussi être importée dans la base de données, ce qui rend le fichier config.yaml inutile.

---

## Vue d'ensemble

Le fichier config.yaml contient la configuration des catégories, des rôles et des constantes utilisés par AnsibleForms.

**VIDÉO** : [Créez votre premier formulaire](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

Le config.yaml minimal suivant sert de point de départ. Il ne contient que la catégorie obligatoire `Default` et les rôles obligatoires `admin` et `default`.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Priorité de chargement de la configuration

AnsibleForms charge le fichier config.yaml dans l'ordre suivant (la première correspondance l'emporte) :

1. **DEPUIS LA BASE DE DONNÉES** : la configuration importée dans la base de données, uniquement quand `ENABLE_CONFIG_IN_DATABASE=1`, ou quand cette
   variable n'est pas définie et que la source de configuration stockée dans la base de données est `database` (une copie vide se rabat sur le fichier)
2. **DEPUIS UN DÉPÔT (use_for_config)** : le dépôt dont l'interrupteur « use for config » est activé (nouveau dans la 6.1.0)
3. **DEPUIS UN DÉPÔT (use_for_forms)** : le dépôt dont l'interrupteur « use for forms » est activé (repli pour la rétrocompatibilité)
4. **DEPUIS LE FICHIER LOCAL** : le fichier local `config.yaml` (variable d'environnement CONFIG_PATH)

{: .warning }
> **Remarque :** activez « use for config » sur un seul dépôt. Si plusieurs l'ont activé, un avertissement est journalisé et le premier est utilisé.

---

## Dans cette section

Le fichier a trois attributs de premier niveau, et chacun a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Catégories](categories.html) | Regrouper les formulaires du tableau de bord dans une arborescence de catégories avec des icônes |
| [Rôles](roles.html) | Associer les utilisateurs et les groupes à des rôles, et définir ce que chaque rôle peut faire |
| [Constantes](constants.html) | Des objets libres que chaque formulaire peut réutiliser |
