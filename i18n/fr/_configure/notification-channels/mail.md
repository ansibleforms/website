---
layout: default
title: Mail
parent: Canaux de notification
nav_order: 1
translated_from: 912c390487fa6b9e65cd83eb1e626c18c44f981a
---

# Mail
{: .no_toc }

Les serveurs mail, celui par défaut, et la façon dont ils se connectent
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le canal mail

Un canal mail est le serveur par lequel l'application envoie son mail : un serveur SMTP, ou Microsoft 365 depuis la 7.6.0. Vous pouvez en garder
plusieurs ; celui marqué **Par défaut** est le serveur avec lequel l'application envoie son mail quand un formulaire ne nomme aucun canal mail :

| Étape | Champ | Signification |
|---|---|---|
| Identifiants | Identifiant | Un identifiant **smtp** de [Connexions > Identifiants](../credentials.html) (le serveur mail, son port et son TLS, et son accès, ou **Sans connexion** pour un relais), ou un identifiant **Microsoft Entra ID** pour envoyer via [Microsoft 365](microsoft-365.html). Obligatoire pour un nouveau canal ; l'étape ne demande rien d'autre du serveur. |
| Identifiants | Serveur mail, Port mail, Utiliser TLS | Pas dans la boîte de dialogue. Seulement sur la page d'un canal sans identifiant, ou dont l'identifiant smtp n'a pas de serveur, voir ci-dessous. |
| Identifiants | Envoyer par | Seulement avec un identifiant Microsoft Entra ID : **Microsoft Graph** (par défaut) ou **SMTP (OAuth2)**, voir [Microsoft 365](microsoft-365.html). |
| Expéditeur | Expéditeur mail | L'adresse d'expéditeur que voient les destinataires. Avec Microsoft 365, la boîte aux lettres au nom de laquelle le mail est envoyé. |

---

## Un relais sans accès

Un serveur mail qui accepte du mail sans accès (un relais) peut s'utiliser de deux façons, et les deux envoient sans authentification :

- **Un identifiant smtp avec Sans connexion** (depuis la 7.6.0) : il ne contient que le **Serveur mail**, le **Port mail** et **Utiliser TLS**, sans utilisateur ni mot de passe.
- **Aucun identifiant** : un canal sans identifiant (d'avant, ou le relais de la mise à jour, voir ci-dessous) garde sur sa page son propre **Serveur mail**, **Port mail** et **Utiliser TLS**.

Un canal dont l'identifiant smtp n'a pas de serveur (créé avant que les identifiants le contiennent) garde aussi sur sa page son propre serveur,
port et TLS, où l'accès de son identifiant se connecte. Un canal qui nomme un identifiant ayant son propre serveur oublie celui saisi avant.

---

## Le canal par défaut

Le premier canal mail devient celui par défaut, et **Définir par défaut** dans le menu de la ligne le déplace vers un autre. L'interrupteur
**Par défaut** de l'onglet **Détails** de la page d'un canal mail fait de même.

Depuis la 7.6.0, l'application n'envoie aucun mail tant qu'aucun canal mail n'est celui par défaut, ou tant que celui par défaut est désactivé. Avant,
elle se rabattait sur les paramètres mail de la page des paramètres ou du seed de configuration. La mise à jour vers la 7.6.0 transforme ces paramètres
en canal mail par défaut `default` quand aucun canal mail n'était encore actif : avec un accès, il nomme un nouvel identifiant smtp `mail-login` ;
pour un relais, il a son propre serveur et aucun identifiant. Dans le [seed de configuration](../seed/), déclarez un canal mail sous
`notification_channels:` (voir [Exemple](../seed/example.html)) : les anciennes clés `mail_*` sous `settings:` fonctionnent toujours mais sont dépréciées.
