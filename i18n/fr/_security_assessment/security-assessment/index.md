---
layout: default
title: Vue d'ensemble
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Évaluation de la sécurité
{: .no_toc }

Pour les revues de sécurité : mesures, développement et avis
{: .fs-6 .fw-300 }

---

## En bref

AnsibleForms exécute des playbooks et détient leurs identifiants : il fait donc partie de votre chaîne de confiance :

* Il est **auto-hébergé** : il tourne sur votre infrastructure, garde ses données dans votre base de données et n'envoie rien à ses auteurs.
* Il est **open source** (GPL-3.0) : le code, ses pipelines et chaque avis sont publics.
* Chaque secret stocké est **chiffré**, chaque modification **auditée**, et les **rôles** sont vérifiés à chaque requête.
* Les vulnérabilités sont **signalées en privé**, corrigées dans chaque version prise en charge, et **publiées**.

---

## Dans cette section

Les pages répondent aux questions d'une revue de sécurité, de la conception à la liste des CVE :

| Page | Contenu |
|---|---|
| [Mesures de sécurité](measures.html) | Connexion, autorisations, secrets stockés, piste d'audit, navigateur, serveur, connexions et conteneurs |
| [Développement sécurisé](development.html) | Comment une modification est relue et testée, analyse du code et des dépendances, construction des images, versions prises en charge |
| [Signaler une vulnérabilité](reporting.html) | Comment signaler un problème en privé, et ce qui se passe ensuite |
| [Avis de sécurité](advisories.html) | Chaque vulnérabilité publiée, avec sa CVE, sa gravité et la version corrigée |
| [FAQ de l'évaluation](faq.html) | Des réponses courtes aux questions les plus fréquentes des questionnaires de sécurité |

Pour sécuriser une instance plutôt que l'évaluer, voir [Sécurité](../security/) dans le guide de l'administrateur.
