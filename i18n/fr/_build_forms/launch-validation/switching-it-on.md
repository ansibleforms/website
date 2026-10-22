---
layout: default
title: L'activer
parent: Validation au lancement
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# L'activer
{: .no_toc }

Pour toute l'instance, ou pour un seul formulaire
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La validation au lancement a deux réglages. **C'est le plus strict des deux qui s'applique.**

---

## Pour toute l'instance : `LAUNCH_VALIDATION`

La variable d'environnement [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) s'applique à tous les formulaires :

- `off` : aucune vérification côté serveur ; le job s'exécute avec les extravars envoyées par le navigateur ou l'appelant.
- `log` : chaque lancement est vérifié ; ce qui serait refusé est écrit dans le journal comme
  avertissement, et le lancement s'exécute comme avant.
- `enforce` (par défaut) : un lancement invalide est refusé, et un lancement valide s'exécute avec les extravars que
  construit le serveur.

Une valeur vide ou inconnue signifie aussi `enforce`. Les changements prennent effet sans redémarrage.

{: .warning }
> **La mise à niveau change le comportement.** Une instance qui ne définit pas `LAUNCH_VALIDATION` applique enforce
> à chaque lancement après la mise à niveau. Les scripts qui appellent `POST /api/v2/job` sans `rawFormData`,
> ou avec des valeurs qui enfreignent les règles d'un formulaire, sont refusés avec un `422`. Définissez
> `LAUNCH_VALIDATION=log` avant la mise à niveau pour voir ce qui serait refusé, ou `off` pour garder
> l'ancien comportement (voir [Déploiement](rolling-it-out.html)).

---

## Pour un seul formulaire : `launchValidation`

Un formulaire peut définir son propre niveau :

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Utilisez ce réglage sur une instance qui tourne en `off` ou en `log`, pour un formulaire dont vous savez qu'il sera
lancé via REST : ce formulaire est en enforce, alors que le reste de l'instance ne l'est pas. Il peut aussi être défini dans le concepteur, dans les
paramètres du formulaire.

**Un formulaire peut être rendu plus strict que l'instance, jamais plus permissif.** Avec `LAUNCH_VALIDATION`
sur `enforce`, le `launchValidation: off` d'un formulaire n'a aucun effet : un formulaire ne peut pas passer outre
la décision d'un opérateur.

Les formulaires assistant l'utilisent aussi : le lancement d'un assistant est vérifié étape par étape, chaque étape avec son propre
sous-formulaire (voir [Formulaires assistant](rolling-it-out.html#wizard-forms)).
