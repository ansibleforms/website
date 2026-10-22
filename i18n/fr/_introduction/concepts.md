---
layout: default
title: Concepts
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Concepts
{: .no_toc }

Les termes utilisés dans cette documentation, chacun avec un lien vers sa page
{: .fs-6 .fw-300 }

---

## Glossaire

Les termes utilisés dans cette documentation :

| Terme | Signification |
|---|---|
| **[Formulaire](forms/)** | Une définition YAML qui recueille des saisies et exécute un playbook, un modèle ou un workflow |
| **[Champ de formulaire](formfields/)** | Une saisie d'un formulaire, comme `text`, `enum` ou `checkbox` ; sa valeur devient une extravar |
| **[Catégorie](config/categories.html)** | Un groupe dans l'arborescence des formulaires affichée sur la page Formulaires, défini dans `config.yaml` |
| **[Rôle](config/roles.html)** | Un ensemble d'utilisateurs et de groupes ; un formulaire liste les rôles qui peuvent le voir et l'exécuter, `default` pour tout le monde |
| **[Expression](expressions/)** | Du JavaScript qui calcule la valeur d'un champ, dans le navigateur (`runLocal: true`) ou sur le serveur |
| **[Extravars](formfields/)** | Les variables envoyées au playbook ou au modèle, construites à partir des valeurs des champs |
| **[Identifiant](expressions/credentials.html)** | Un accès enregistré, chiffré avec `ENCRYPTION_SECRET` : un utilisateur et un mot de passe (plus hôte, port, base de données), ou depuis la 7.3.0 l'adresse et les secrets d'un annuaire LDAP, d'un fournisseur SSO, d'un runner ou d'un HashiCorp Vault |
| **[Coffre de secrets](secret-stores/)** | Une connexion à HashiCorp Vault ou CyberArk qui fournit l'utilisateur et le mot de passe d'un identifiant |
| **[Job](gui/forms-and-jobs.html)** | Une exécution d'un formulaire, avec son statut, ses extravars et sa sortie, conservée dans l'historique des jobs |
| **[Runner](runners.html)** | L'endroit où un job s'exécute, ajouté sous **Connexions > Runners** : `rte` pour les playbooks, `awx` (AWX, ou la variante `aap` ou `ascender`), `semaphore`, `rundeck` ou `jenkins` pour les modèles et les jobs. Un formulaire en choisit un avec `runner:`, ou s'exécute sur le runner par défaut `rte` (playbooks) ou `awx` (modèles) |
| **[RTE](rte/)** | Un environnement d'exécution (runtime environment) : le serveur AnsibleForms démarré avec `AF_ROLE=rte` dans son propre conteneur, à côté de python et d'ansible, qui exécute les playbooks d'un runner de type `rte` |
| **[Point d'approbation](forms/approval.html)** | Une pause dans un job jusqu'à ce qu'un utilisateur ayant un rôle d'approbation l'approuve ou le rejette |
| **[Workflow](workflows/)** | Un graphe de playbooks, d'approbations et d'autres workflows liés en cas de succès, en cas d'échec ou toujours, dans la syntaxe d'AWX |
| **[Formulaire multi-étapes](forms/multistep.html)** | Obsolète depuis la 7 : un formulaire qui exécute plusieurs playbooks ou modèles à la suite ; un workflow le remplace |
| **[Canal de notification](notification-channels.html)** | Un serveur de messagerie, un webhook Slack ou Teams, un chat Telegram ou un webhook vers lequel partent les notifications et les demandes d'approbation |
| **[Concepteur](designer/)** | L'éditeur dans le navigateur pour les formulaires, les playbooks, les inventaires et les workflows, qu'une seule personne utilise à la fois |
| **[Sous-formulaire](forms/subform.html)** | Un ensemble réutilisable de champs qui décrit les lignes d'un champ `list` ou l'objet d'un champ `yaml` |
| **[config.yaml](config/)** | Le fichier qui contient les catégories, les rôles et les constantes ; les formulaires sont dans leurs propres fichiers |
| **[Seed de configuration](seed/)** | Un fichier YAML (`CONFIG_SEED_PATH`) qui déclare les objets d'administration, comme les runners et les identifiants |
| **[Dossier persistant](customization/paths.html)** | Le dossier qui contient les fichiers qu'AnsibleForms doit conserver entre les redémarrages et les mises à niveau |
