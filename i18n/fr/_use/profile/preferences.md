---
layout: default
title: Préférences
parent: Votre profil
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Préférences
{: .no_toc }

Langue, thème, fuseau horaire, format de date et notifications de bureau
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les préférences

La vue Préférences change l'apparence d'AnsibleForms pour vous. Chaque choix est stocké dans le navigateur
où vous le faites : un autre navigateur ou un autre ordinateur repart donc des valeurs par défaut.

| Paramètre | Choix | Aussi modifiable depuis |
|---|---|---|
| Langue | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (japonais), 简体中文 (chinois simplifié) | le drapeau dans l'en-tête |
| Thème | Suivre le navigateur, Clair, Sombre, ou Couleur (un en-tête dans la couleur de votre choix) | l'icône du soleil dans l'en-tête |
| Affichage des formulaires | Tuiles ou Liste | le bouton de la page Formulaires |
| Fuseau horaire | UTC, le fuseau de ce navigateur, ou n'importe quel fuseau par son nom | uniquement ici |
| Format de date | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` ou `DD.MM.YYYY` | uniquement ici |
| Notifications de bureau | Activées ou désactivées | uniquement ici |

Depuis la 7.3.0, la vue est organisée en onglets, chacun à sa propre adresse (`/profile/preferences/<tab>`) : **Apparence** (langue, thème et affichage
des formulaires), **Date et heure** (fuseau horaire et format de date) et **Notifications**. La zone de recherche au-dessus liste les paramètres correspondants
sous le nom de leur onglet. Un choix reste un brouillon jusqu'à **Enregistrer**, et quitter la vue avec une modification non enregistrée demande d'abord confirmation.

**Suivre le navigateur** passe en clair ou en sombre comme le navigateur, et change avec lui. C'est le thème par défaut depuis la 7.3.0, sauf si votre
administrateur en choisit un autre. Survoler une couleur du thème **Couleur**, ici ou dans le menu des thèmes de l'en-tête, donne un aperçu de l'application dans cette
couleur, et le thème précédent revient quand le pointeur quitte la palette ; rien ne change avant un clic.

---

## Notifications de bureau

Depuis la 7.3.0, l'onglet **Notifications** active les notifications de bureau dans ce navigateur, pour les utilisateurs dont le rôle définit `showJobs`.

Le navigateur demande son autorisation la première fois. Quand il bloque les notifications pour le site, l'interrupteur reste désactivé et indique comment
les autoriser, et un site en simple `http` ne peut pas du tout en afficher. Une fois activées, une notification arrive :

| Quand | Elle indique | Un clic dessus |
|---|---|---|
| Un job que vous avez lancé se termine | Le formulaire et son résultat, comme *Patch Linux servers: Réussi*, avec le numéro et la durée du job | Ramène l'onglet au premier plan sur ce job |
| Un job attend votre approbation | Le formulaire, le numéro du job et qui l'a lancé, avec les boutons **Approuver** et **Rejeter** | Ouvre les jobs en attente d'approbation |

Les boutons **Approuver** et **Rejeter** s'affichent dans Chrome et Edge ; Firefox et Safari affichent la notification sans eux, tout comme un
site avec un certificat auto-signé, car les boutons nécessitent un service worker. Les notifications n'arrivent que lorsqu'un onglet AnsibleForms est ouvert,
même en arrière-plan : rien n'est envoyé une fois tous les onglets fermés. Chacune ne s'affiche qu'une fois, quel que soit le nombre d'onglets ouverts, et les étapes d'un
job multistep et le job que vous êtes en train de regarder restent silencieux.

---

## Fuseau horaire

Les dates et heures dans tout AnsibleForms sont affichées dans le fuseau horaire que vous sélectionnez. Cela inclut les heures de début
et de fin des jobs, le journal d'audit, la page de statut, les sauvegardes, les jobs enregistrés, et l'expiration d'un jeton
d'API. Changer de fuseau horaire met à jour chaque page immédiatement, sans rechargement.

Tant que vous n'en choisissez pas, c'est le fuseau horaire défini par votre administrateur pour tout le monde qui s'applique (**Paramètres > Apparence > Valeurs par défaut**, voir
[Apparence](../appearance.html)), **UTC** sauf modification. **Ce navigateur** suit le fuseau horaire de votre ordinateur, et la
liste contient tous les fuseaux par leur nom, comme `Europe/Madrid`. La carte affiche l'heure actuelle dans le fuseau et le format sélectionnés.

---

## Format de date

Le format de date définit comment se lit la partie date de chaque date, chaque choix étant affiché avec la date du jour : `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` ou `DD.MM.YYYY`. Tant que vous n'en choisissez pas, le format de date par défaut de votre administrateur
s'applique, `YYYY-MM-DD` sauf modification. Comme les autres choix, il est conservé dans ce navigateur.

---

## Ce qui garde les heures du serveur

Deux exceptions gardent les heures propres au serveur :

- **Le journal du serveur et la sortie des jobs** sont du texte qui contient les heures que le serveur y a écrites.
- **Les heures que vous saisissez**, comme le moment où un job planifié doit s'exécuter, et les planifications cron, fonctionnent comme
  avant.
