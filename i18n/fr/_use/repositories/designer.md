---
layout: default
title: Concepteur et push
parent: Dépôts git
nav_order: 4
translated_from: 9f1f2463b8bc0fb3c8b5b934435c305fef1f7f20
---

# Concepteur et push
{: .no_toc }

Modifier des formulaires dans le concepteur et les pousser vers le dépôt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Modifier et pousser depuis le concepteur

Avec un dépôt utilisé pour les formulaires, le concepteur modifie les fichiers de son arbre de travail et les pousse vers le dépôt distant.

| Bouton | Ce qu'il fait |
|---|---|
| **Enregistrer (local)** | Écrit les formulaires et `config.yaml` dans les arbres de travail, sans commit |
| **Enregistrer (dépôt)** | Committe et pousse les modifications enregistrées ; activé dès qu'il y a des modifications non poussées |
| **Charger (dépôt)** | Fait un pull des dépôts de formulaires et recharge le concepteur, après confirmation si des modifications ne sont pas enregistrées |

Les formulaires restent dans leur dépôt ; les nouveaux attendent, déjà utilisables, dans [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) jusqu'à ce que vous les poussiez.
Un formulaire enregistré dans un sous-dossier garde son chemin relatif : `team/deploy.yaml` est poussé vers `team/deploy.yaml` sous le dossier des formulaires
du dépôt. Un nouveau formulaire dont le chemin existe déjà là-bas n'est pas écrasé ; il reste en préparation : renommez-le donc.
Avec plusieurs dépôts de formulaires, **Enregistrer (dépôt)** et **Charger (dépôt)** demandent lequel, par défaut celui de `config.yaml`.

Un push indexe toutes les modifications, les committe en tant que `AnsibleForms` avec le message `Forms sync by <user>`, puis fait un fetch, un rebase sur
le dépôt distant et un push, en réessayant jusqu'à cinq fois. Un conflit de rebase est abandonné et les fichiers en conflit sont listés ;
corrigez-les dans le dépôt distant, ou utilisez **Réinitialiser** sur la page Dépôts. **Push** sur la page Dépôts fait la même chose.

Quand un unique dépôt de formulaires est cloné vide, AnsibleForms copie le `config.yaml` local et les formulaires dans son arbre
de travail, pour qu'un push (**Enregistrer (dépôt)**, ou **Push** sur la page Dépôts) les publie. Pour en savoir plus sur le concepteur, voir [Concepteur et git](../gui/designer-and-git.html).
