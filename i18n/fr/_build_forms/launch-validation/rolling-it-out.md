---
layout: default
title: Déploiement
parent: Validation au lancement
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Déploiement
{: .no_toc }

Faire passer une instance en enforce, et les limitations connues
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Déploiement

`enforce` est la valeur par défaut. Sur une instance où des scripts ou d'autres systèmes lancent des formulaires via
REST, atteignez-la par étapes, en surveillant le journal avant de refuser quoi que ce soit :

1. Définissez `LAUNCH_VALIDATION=log` pour toute l'instance (avant la mise à niveau, lors d'une mise à niveau).
2. Restez un moment dans ce mode et examinez le journal : les avertissements `would refuse` signalent des lancements
   qui enfreignent les règles ; les avertissements `extravars differ` signalent des formulaires qui calculent quelque chose
   différemment sur le serveur (un horodatage, des données externes). Décidez pour chaque formulaire si cela
   compte.
3. Passez ces formulaires en `launchValidation: enforce`. Les appelants qui envoyaient des valeurs invalides ou
   des extravars inventées reçoivent désormais un `422` avec la raison.
4. Quand chaque formulaire se comporte comme prévu, retirez `LAUNCH_VALIDATION` (ou définissez-la à `enforce`) pour toute l'instance.

---

## Limitations

La validation au lancement ne couvre pas encore tout :

- **Les formulaires assistant** ne peuvent pas être relancés avec des modifications, et un job d'assistant lancé avant la 7.0
  ne peut pas être relancé avec `enforce` (il ne stockait pas les valeurs de ses étapes). Le serveur MCP
  ne peut pas lancer de formulaires assistant.
- **La résolution des espaces réservés** dans le navigateur utilise toujours sa propre copie du code du serveur ; dans
  de rares cas limites (`__undefined__`, guillemets à l'intérieur d'expressions), les deux pourraient résoudre un
  espace réservé différemment. `log` révèle de telles différences.
- **Les expressions `runLocal`** s'exécutent dans le moteur JavaScript du navigateur côté navigateur, et dans un
  bac à sable sur le serveur ; le même code produit le même résultat, sauf quand il dépend du
  fuseau horaire ou de la langue du navigateur.

---

## Formulaires assistant

Un [assistant](../forms/wizard.html) est vérifié étape par étape : le navigateur envoie les valeurs de
chaque étape, et le serveur vérifie chaque étape que l'utilisateur soumettrait avec son propre sous-formulaire.

- Une étape est omise quand elle est `optional` et que l'utilisateur l'a passée, ou quand son `when` est faux.
- Une étape lit les étapes précédentes via `$(__parent__.<step>.<field>)`, avec leurs valeurs vérifiées.
- Les erreurs nomment l'étape et le champ, sous la forme `<step>.<field>`.
- Avec `enforce`, les extravars sont construites sur le serveur, chaque étape sous son `defaultModel`.
- Les champs fichier ne sont pas pris en charge dans un assistant.
