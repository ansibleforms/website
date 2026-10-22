---
layout: default
title: Mail
parent: Canaux de notification
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Mail
{: .no_toc }

Les serveurs SMTP, celui par défaut, et leur accès
{: .fs-6 .fw-300 }

Un canal mail est un serveur SMTP. Vous pouvez en garder plusieurs ; celui marqué **Par défaut** est le serveur avec lequel l'application envoie son
mail quand un formulaire ne nomme aucun canal mail. Le premier canal mail devient celui par défaut, et **Définir par défaut** change ce choix.

| Étape | Champ | Signification |
|---|---|---|
| Identifiants | Identifiant | Obligatoire. Un identifiant **smtp** de [Connexions > Identifiants](../credentials.html) : le serveur mail, son port et son TLS, et l'accès. Pour un relais sans accès, un identifiant smtp sans utilisateur. |
| Expéditeur | Expéditeur mail | L'adresse d'expéditeur que voient les destinataires. |

L'interrupteur **Par défaut** de l'onglet **Détails** de la page d'un canal mail en fait celui par défaut, comme le fait **Définir par défaut**.
Les paramètres mail du seed de configuration sont utilisés tant qu'aucun canal mail n'est celui par défaut, ou tant que celui par défaut est désactivé.
