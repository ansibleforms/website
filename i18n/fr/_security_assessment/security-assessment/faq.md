---
layout: default
title: FAQ de l'évaluation
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# FAQ de l'évaluation
{: .no_toc }

Des réponses courtes aux questions les plus fréquentes des questionnaires de sécurité
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Données et hébergement

Où se trouvent les données, et qui peut y accéder :

| Question | Réponse |
|---|---|
| Où nos données sont-elles stockées ? | Dans la base de données MySQL ou MariaDB que vous exploitez, et dans le dossier persistant de votre instance. AnsibleForms est auto-hébergé, sans service cloud derrière. |
| Envoie-t-il des données à ses auteurs ? | Non. Il n'y a ni télémétrie, ni remontée d'usage, ni vérification de mises à jour. |
| À quoi se connecte-t-il ? | Uniquement aux systèmes qu'un administrateur configure : voir [Connexions sortantes](measures.html#outbound-connections). |
| Utilise-t-il l'IA ou envoie-t-il des données à un fournisseur de modèles ? | Uniquement avec l'[assistant de chat](../chat/) activé, qui est désactivé par défaut. Il envoie alors les définitions de formulaire et les valeurs en cours de saisie au fournisseur que vous configurez. |
| Peut-il fonctionner sans accès à internet ? | Oui. L'application n'a pas besoin d'accès à internet ; les playbooks ont besoin de ce que leurs tâches atteignent. |

---

## Chiffrement

Ce qui est chiffré, et avec quelles clés :

| Question | Réponse |
|---|---|
| Les données sont-elles chiffrées en transit ? | Avec [HTTPS](../security/https.html), servi par l'application ou par votre reverse proxy, et `wss://` entre l'application et ses environnements d'exécution. |
| Les données sont-elles chiffrées au repos ? | Chaque secret stocké est chiffré par l'application en AES-256. Les jobs et leur sortie sont stockés tels quels : utilisez le chiffrement au repos propre à la base de données. Voir [Secrets stockés](measures.html#stored-secrets). |
| Qui détient les clés ? | Vous : le [`ENCRYPTION_SECRET`](../security/secrets.html) est défini par vous, tenu à l'écart des sauvegardes, et peut faire l'objet d'une rotation. |
| Les secrets peuvent-ils rester dans notre coffre ? | Oui : [HashiCorp Vault et CyberArk](../secret-stores/) sont lus quand un job en a besoin. |

---

## Accès et traçabilité

Qui peut se connecter, ce qu'il peut faire, et ce qui est enregistré :

| Question | Réponse |
|---|---|
| Prend-il en charge l'authentification unique ? | Oui : LDAP / Active Directory, OpenID Connect et Entra ID. Voir [Authentification](../authentication/). |
| Prend-il en charge l'authentification multifacteur ? | Via l'authentification unique : la MFA de votre fournisseur d'identité s'applique. Les comptes locaux n'en ont pas en propre. |
| Comment les autorisations sont-elles gérées ? | Avec des rôles associés à des groupes, vérifiés par le serveur à chaque requête. Voir [Autorisations](measures.html#permissions). |
| Y a-t-il un journal d'audit ? | Oui : chaque modification et chaque tentative refusée, conservées 365 jours par défaut et transférables vers syslog. Voir [Piste d'audit](measures.html#audit-trail). |
| Y a-t-il un mot de passe par défaut ? | Le premier compte admin a un mot de passe par défaut public, qui doit être changé à la première connexion. Voir [Le compte admin](../security/hardening.html#the-admin-account). |

---

## Vulnérabilités et mises à jour

Comment les problèmes sont trouvés, corrigés et annoncés :

| Question | Réponse |
|---|---|
| Des vulnérabilités ont-elles été trouvées ? | Oui. Chacune de celles publiées est listée dans [Avis de sécurité](advisories.html), avec la version qui l'a corrigée. |
| Comment en signaler une ? | En privé, via GitHub : voir [Signaler une vulnérabilité](reporting.html). |
| Comment le code est-il vérifié ? | Analyse statique CodeQL et revue des dépendances sur chaque pull request, tests automatisés et mises à jour Dependabot. Voir [Développement sécurisé](development.html). |
| Quelles versions reçoivent des correctifs de sécurité ? | 7.x et 6.5.x. Voir [Versions prises en charge](development.html#supported-versions). |
| Comment apprendre la publication d'un nouvel avis ? | Suivez les alertes de sécurité du dépôt sur GitHub. Voir [Être informé des nouveaux avis](advisories.html#being-told-of-new-advisories). |
| A-t-il fait l'objet d'un test d'intrusion ? | Aucun rapport de test d'intrusion tiers n'est publié. Le code est public : votre propre équipe ou votre testeur peut donc l'évaluer, et les découvertes sont signalées comme indiqué ci-dessus. |

---

## Images et chaîne d'approvisionnement

D'où viennent les images, et comment les vérifier :

| Question | Réponse |
|---|---|
| Où les images sont-elles publiées ? | Sur le GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, construites par des workflows GitHub Actions publics. Voir [Versions et images](development.html#releases-and-images). |
| Les conteneurs s'exécutent-ils en root ? | Non : avec l'utilisateur non privilégié `node`. |
| Les images sont-elles signées ? | Pas encore. Récupérez-les par digest (`@sha256:...`) pour être sûr d'exécuter l'image que vous avez examinée. |
| Y a-t-il un SBOM ? | Aucun n'est encore publié avec les images. Un scanner comme Trivy ou Syft en construit un à partir de l'image. |
| Les images sont-elles analysées à la recherche de vulnérabilités ? | Pas dans le pipeline de release. Leurs images de base sont épinglées par digest et maintenues à jour par Dependabot ; analysez les images dans votre propre registre pour appliquer votre propre politique. |
| Sous quelle licence est-il distribué ? | GPL-3.0, open source, sans garantie. |
