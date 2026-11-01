---
layout: default
title: Canaux de notification
nav_order: 10
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1756db6ff7b9197f88b34a0c089953a68493e008
---

# Canaux de notification
{: .no_toc }

Envoyez les demandes d'approbation et les notifications de job par mail, vers Slack, Microsoft Teams, Telegram ou n'importe quel webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : ajoutez les serveurs mail et les canaux de chat vers lesquels les formulaires envoient leurs notifications et leurs approbations.

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [Mail](notification-channels/mail.html) | Les serveurs SMTP, celui par défaut, et leur accès |
| [Slack et Microsoft Teams](notification-channels/slack-and-teams.html) | Un webhook de canal Slack ou Teams |
| [Telegram](notification-channels/telegram.html) | Un bot qui publie dans un chat Telegram |
| [Webhook](notification-channels/webhook.html) | Une requête JSON vers n'importe quel endpoint HTTP |
| [Utiliser les canaux dans un formulaire](notification-channels/in-a-form.html) | Nommer des canaux dans les notifications et les approbations |
| [Tester un canal](notification-channels/testing.html) | Envoyer un test, et ce que cela prouve |


---

## Fonctionnement

Un **canal de notification** est un endroit où vont les notifications, ajouté dans **Connexions > Notifications**. Chaque canal a
l'un de ces types :

| Type | Ce qu'il envoie |
|---|---|
| Mail | Du mail via un serveur SMTP : demandes d'approbation et notifications de job. |
| Slack | Un message dans un canal Slack, via son webhook entrant, avec un bouton vers le job. |
| Microsoft Teams | Une carte dans un canal Teams, via un webhook Workflows, avec un bouton vers le job. |
| Telegram | Un message d'un bot dans un chat Telegram, avec un lien vers le job. |
| Webhook | Une requête JSON vers n'importe quel endpoint HTTP, construite à partir d'un modèle. |

Un formulaire nomme ses canaux dans ses [notifications](forms/notifications.html) et son [approbation](forms/approval.html),
avec `channels:`. Une notification qui ne peut pas être envoyée est écrite dans le journal ; elle ne fait jamais échouer le job ni l'approbation.

---

## La page des notifications

La page **Connexions > Notifications** liste chaque canal avec ces colonnes :

| Colonne | Signification |
|---|---|
| Activé | Si des notifications lui sont envoyées, voir [Utiliser les canaux dans un formulaire](notification-channels/in-a-form.html). |
| Nom | Comment les formulaires y font référence dans `channels:`. |
| Type | Mail, Slack, Microsoft Teams, Telegram ou Webhook. Le canal mail par défaut affiche une pastille **Par défaut** après son type. |
| Description | À quoi sert le canal. |

**Ajouter un canal de notification** ouvre une boîte de dialogue : **Canal** (nom et description), **Type**, puis les étapes du type
choisi. Le type est défini à la création du canal et ne change plus. Une ligne ouvre la page du canal, avec les mêmes étapes en
onglets après **Détails**, et **Envoyer un test**, **Supprimer** et **Enregistrer** en haut à droite. Le menu de ligne propose
**Modifier**, **Activer** ou **Désactiver** (selon le cas), **Définir par défaut** (mail), **Envoyer un test** et **Supprimer**.

L'onglet **Détails** de la page d'un canal contient l'interrupteur **Activé**, qui est enregistré immédiatement, et pour le mail l'interrupteur **Par défaut**,
qui est enregistré avec **Enregistrer**.

Un utilisateur qui ouvre ces pages avec `showConnectionsSettings` mais sans le rôle admin ne peut pas choisir un identifiant que seul
un admin peut nommer, voir [Qui peut modifier un identifiant](credentials.html#who-may-change-a-credential). Quand un tel utilisateur change
l'endroit où un canal envoie (l'url d'un webhook ou sa vérification de certificat, une adresse de Bot API Telegram), le canal perd
l'identifiant qu'il nommait, sauf s'il en choisit un dans la même modification.

Un canal déclaré dans le [seed de configuration](seed/) est en lecture seule sur cette page, et peut toujours être testé.

