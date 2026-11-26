---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Catégories, rôles et constantes pour tous les formulaires
{: .fs-6 .fw-300 }

---

Pour les administrateurs : le fichier config.yaml qui contient les catégories, les rôles et les constantes partagés par tous les formulaires.

AnsibleForms utilise un fichier config.yaml pour configurer les catégories, les rôles et les constantes. Si aucun fichier n'est fourni, il en génère un avec une configuration minimale. La configuration peut aussi être importée dans la base de données, ce qui rend le fichier config.yaml inutile, et chacun des trois peut être conservé dans un dépôt git.

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

Depuis la 7.8.0, les catégories, les rôles et les constantes sont lus chacun séparément, depuis la première source ci-dessous qui le contient.

1. **DEPUIS UN DÉPÔT** : le dépôt ayant le type d'usage **Catégories**, **Rôles** ou **Constantes**, depuis son fichier qui donne
   `controller_categories:`, `controller_roles:` ou `controller_constants:`, de n'importe quel nom et dans n'importe quel dossier (voir
   [Configuration dans git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **DEPUIS LE config.yaml DU DÉPÔT** : la clé simple dans le `config.yaml` de ce dépôt, dépréciée depuis la 7.8.0 et plus
   lue dans la 8.0 ; le journal du serveur, la sortie du pull et la page du dépôt le signalent
3. **DEPUIS LA BASE DE DONNÉES** : la configuration importée dans la base de données, uniquement quand `ENABLE_CONFIG_IN_DATABASE=1`, ou quand cette
   variable n'est pas définie et que la source de configuration stockée dans la base de données est `database` (une copie vide se rabat sur le fichier)
4. **DEPUIS LE FICHIER LOCAL** : le fichier local `config.yaml` (variable d'environnement CONFIG_PATH)

{: .warning }
> **Remarque :** l'interrupteur **Utiliser pour la configuration** n'existe plus depuis la 7.8.0. Une mise à jour donne **Rôles**, **Catégories** et
> **Constantes** au dépôt qui l'avait, et `use_for_config` dans le config seed ou l'API est un alias déprécié des trois.

---

## Dans cette section

Le fichier a trois attributs de premier niveau, et chacun a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Catégories](categories.html) | Regrouper les formulaires du tableau de bord dans une arborescence de catégories avec des icônes |
| [Rôles](roles.html) | Associer les utilisateurs et les groupes à des rôles, et définir ce que chaque rôle peut faire |
| [Constantes](constants.html) | Des objets libres que chaque formulaire peut réutiliser |
