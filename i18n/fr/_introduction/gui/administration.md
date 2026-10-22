---
layout: default
title: Administration
parent: Visite de l'interface
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Administration
{: .no_toc }

Le menu Paramètres : le système, son apparence, les accès, les connexions et les journaux
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le menu Paramètres

**Paramètres** dans l'en-tête ouvre les pages d'administration, regroupées dans le menu de gauche sous **Système**, **Apparence**,
**Accès**, **Connexions** et **Journaux**. Chaque entrée n'apparaît qu'à un utilisateur qui a l'option de rôle dont sa page a besoin :
`allowBackupOps` pour **Sauvegardes**, `showLogs` pour **Journal du serveur**, et `showSettings` pour toutes les autres pages.
Depuis la 7.3.0, trois options en ouvrent une partie sans le reste :

| Option de rôle | Ouvre |
|---|---|
| `showAppearanceSettings` | Les pages **Apparence** |
| `showConnectionsSettings` | Les pages **Connexions**, sauf **Syslog** ; les dépôts, les coffres de secrets et les identifiants protégés restent modifiables par un admin seulement |
| `showAuditLog` | Le **Journal d'audit** |

Voir [Rôles](../config/roles.html#role-options) pour les options de rôle.

---

## Listes et pages d'enregistrement

Depuis la 7.3.0, les listes des paramètres et les pages d'enregistrement partagent une même mise en page, avec leurs contrôles sur une ligne à part sous le titre :

| Élément | Fonctionnement |
|---|---|
| Champ de recherche | En premier sur cette ligne dans chaque page de paramètres et chaque page d'enregistrement. Un mot filtre tous les onglets à la fois : les champs, lignes ou entrées qui correspondent s'affichent sous le nom de leur onglet |
| Taille de page | Un tableau affiche autant de lignes que l'écran en contient tant qu'aucune taille de page n'est choisie : 10, 20, 50 ou 100 |
| Colonnes | Chaque colonne nommée se trie, et une cellule vide affiche `–` |
| Cases à cocher | Les lignes n'en ont que là où l'on peut faire quelque chose avec les lignes cochées, et le menu de ligne (⋮) propose la même action |
| Menu de ligne | Des libellés courts, comme **Modifier** et **Supprimer**. Une liste avec une colonne **Activé** la met en premier, et propose **Activer** ou **Désactiver** dans chaque menu de ligne, selon le cas |

Les listes avec une colonne **Activé** sont les fournisseurs SSO, les annuaires LDAP, les runners, les planifications, les canaux
de notification, les serveurs syslog, les annonces, les étiquettes et les versions de l'avertissement.

---

## Système

L'instance elle-même : ses paramètres, son état de santé et ses sauvegardes.

| Page | À quoi elle sert |
|---|---|
| **Général** | Les variables d'environnement, en onglets de Configuration à Journalisation. Voir [Variables d'environnement](../customization/). |
| **Statut** | L'état de santé de l'instance et des systèmes dont elle dépend, dans les onglets Vérifications et Informations. Voir [Supervision](../production/monitoring.html). |
| **Sauvegardes** | Faire, restaurer et supprimer des sauvegardes de la base de données, de config.yaml et des formulaires. Voir [Sauvegardes](../production/backups.html). |

![Paramètres > Général, l'onglet Configuration](../assets/screenshots/settings.jpg)

### Sauvegardes

La liste des sauvegardes, nocturnes et manuelles : **Ajouter une sauvegarde** en fait une tout de suite, et le menu d'une ligne propose **Afficher la sauvegarde**, **Restaurer** et **Supprimer**.

![Paramètres > Sauvegardes](../assets/screenshots/backups.jpg)

### Restaurer

**Restaurer** montre le contenu de la sauvegarde, puis la restaure ; **Créer une nouvelle sauvegarde avant la restauration (recommandé)** est coché par défaut.

![Restaurer une sauvegarde](../assets/screenshots/restore.jpg)

---

## Apparence

L'aspect de l'instance pour tout le monde, et les messages qu'elle affiche.

| Page | À quoi elle sert |
|---|---|
| **Valeurs par défaut** | Le thème, la langue, l'affichage des formulaires, le fuseau horaire et le format de date des utilisateurs qui n'en ont choisi aucun. Voir [Valeurs par défaut](../appearance/defaults.html). |
| **Nom** | Le nom dans l'onglet du navigateur et sur la page de connexion. Voir [Nom](../appearance/name.html). |
| **Logo** | Votre propre logo dans l'en-tête. Voir [Logo](../appearance/logo.html). |
| **Icône** | Votre propre icône dans l'onglet du navigateur. Voir [Icône](../appearance/icon.html). |
| **Liens** | Le lien du Concepteur, et vos propres liens et menus dans l'en-tête. Voir [Liens](../appearance/links.html). |
| **Étiquettes** | Des étiquettes à côté du logo, comme PRODUCTION et EU. Voir [Étiquettes](../appearance/labels.html). |
| **Annonces** | Des messages sous l'en-tête, chacun de son début à sa fin. Voir [Annonces](../announcements.html). |

---

## Accès

Qui peut se connecter, et ce qu'il peut faire une fois connecté.

| Page | À quoi elle sert |
|---|---|
| **Avertissement** | Des conditions que chaque utilisateur accepte une fois, et qui a accepté quelle version. Voir [Avertissement](../disclaimer.html). |
| **Utilisateurs** | Les utilisateurs locaux, et ceux de LDAP et de l'authentification unique. Voir [Utilisateurs et groupes](../users-and-groups.html). |
| **Groupes** | Les groupes locaux, et ceux de LDAP et de l'authentification unique. Voir [Utilisateurs et groupes](../users-and-groups/local-group.html). |
| **Rôles** | Les rôles de config.yaml : qui les a et ce qu'ils permettent. Voir [Rôles](../config/roles.html). |
| **LDAP** | La connexion avec un annuaire LDAP ou Active Directory. Voir [LDAP](../authentication/ldap.html). |
| **SSO** | L'authentification unique avec des fournisseurs Entra ID ou OpenID Connect. Voir [Authentification](../authentication/). |

![Accès > LDAP, l'annuaire principal](../assets/screenshots/ldap.jpg)

---

## Connexions

Les systèmes qu'AnsibleForms contacte, et ce avec quoi il s'y connecte.

| Page | À quoi elle sert |
|---|---|
| **Dépôts** | Les dépôts git d'où viennent les formulaires et les playbooks. Voir [Dépôts git](../repositories/). |
| **Identifiants** | Les comptes et les secrets qu'utilisent les formulaires, les playbooks et les connexions. Voir [Identifiants](../credentials.html). |
| **Coffres de secrets** | HashiCorp Vault et CyberArk, où les identifiants peuvent être lus. Voir [Coffres de secrets](../secret-stores/). |
| **Runners** | Là où les jobs s'exécutent : des conteneurs RTE pour les playbooks, et AWX et consorts pour les modèles. Voir [Runners](../runners.html). |
| **SSH** | La paire de clés avec laquelle l'application se connecte à git, et les hôtes connus. Voir [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Notifications** | Serveurs SMTP, Slack, Microsoft Teams, Telegram et webhooks. Voir [Canaux de notification](../notification-channels.html). |
| **Assistant de chat** | Le fournisseur d'IA de l'assistant de chat. Voir [Assistant de chat](../chat/). |
| **MCP** | Le serveur MCP pour les agents d'IA. Voir [MCP](../mcp/). |
| **Syslog** | Des serveurs syslog qui reçoivent le journal du serveur, le journal d'audit, ou les deux. Voir [Syslog](../production/logs.html#syslog). |

![Connexions > Identifiants, l'onglet Connexion d'un identifiant](../assets/screenshots/credentials.jpg)

---

## Journaux

Ce qui s'est passé sur l'instance.

| Page | À quoi elle sert |
|---|---|
| **Journal d'audit** | Qui a modifié quoi, et si c'était autorisé, filtré par utilisateur, action et résultat. Voir [Piste d'audit](../production/logs.html#audit-trail). |
| **Journal du serveur** | Le journal propre du serveur, pour le dépannage. Voir [Journaux](../production/logs.html). |

### Journal du serveur

Les dernières lignes du journal, les plus récentes en bas, suivies au fur et à mesure de leur écriture. Le champ de recherche les filtre (une expression
régulière), **Effacer** vide l'affichage, pas le journal, et **Télécharger** enregistre le journal complet.

![Journaux > Journal du serveur](../assets/screenshots/logs.jpg)

---

## Documentation API

**Documentation API** dans le menu d'aide (le point d'interrogation dans l'en-tête) mène à l'interface Swagger de l'API REST sur `/api/v2/docs`.
Voir [API](../api/).

![Interface Swagger](../assets/screenshots/swagger.jpg)
