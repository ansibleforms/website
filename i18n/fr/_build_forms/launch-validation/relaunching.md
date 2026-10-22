---
layout: default
title: Relancer
parent: Validation au lancement
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Relancer
{: .no_toc }

Comment un job relancé est validé
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un job peut être relancé de deux façons. La manière dont la relance est vérifiée dépend de celle utilisée, et du mode de
validation au lancement.

---

## Deux types de relance

Les deux types diffèrent selon que l'appelant envoie ou non de nouvelles valeurs :

* **À l'identique** : le bouton Relancer, `POST /api/v2/job/{id}/relaunch` sans corps, ou `relaunch_job` sans
  `values`.
* **Avec des modifications** : les mêmes appels avec de nouvelles valeurs, superposées aux valeurs de champ stockées du job :

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Comment chacune est vérifiée

Le mode de validation au lancement décide si une relance est rejouée ou vérifiée de nouveau :

| Relance | `off` / `log` | `enforce` |
|---|---|---|
| **À l'identique** | rejoue les extravars stockées du job, mots de passe compris | la vérification complète, à partir des valeurs de champ stockées |
| **Avec des modifications** | la vérification complète, sur les valeurs stockées avec les modifications superposées | la vérification complète, de la même façon |

Une exception avec `enforce` : un job lancé par une planification de niveau admin n'a pas de valeurs de champ propres ; le relancer à l'identique
rejoue donc les extravars stockées de la planification, pour un admin ou un utilisateur disposant de l'option de rôle `allowScheduledJobs`.

Une relance vérifiée (voir [Log et enforce](log-and-enforce.html)) démarre un nouveau job au nom de l'appelant.

---

## Champs mot de passe

Les valeurs de champ stockées ne contiennent pas de mot de passe : une relance vérifiée n'en a donc pas pour un **champ mot de passe visible** :

* La relance est refusée comme `unsupported`, avec les `passwordFields` qui lui manquent.
* Lancez de nouveau le formulaire et saisissez le mot de passe.
* Un champ mot de passe que les dépendances du formulaire **masquent** n'est pas nécessaire et ne bloque pas la relance.

Avec `enforce`, cela s'applique aussi au bouton Relancer.

---

## Qui peut relancer

Les deux types de relance exigent :

* que le formulaire autorise la relance (`allowRelaunch`, true par défaut) ;
* l'option de rôle `allowJobRelaunch` ;
* que l'utilisateur soit **le propriétaire du job**, un admin, ou un utilisateur disposant de l'option de rôle `manageAllJobs`.

Voir tous les jobs (`showAllJobLogs`) ne suffit pas pour relancer le job d'un autre utilisateur. Les approbateurs peuvent voir un job qui attend leur
approbation, mais ne peuvent pas non plus le relancer.
