---
layout: default
title: Accueil
nav_order: 1
description: "AnsibleForms : créez des formulaires dynamiques pilotés par les données pour l'automatisation avec Ansible"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Des formulaires en libre-service pour <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible est un puissant outil d'automatisation, mais il reste une application en ligne de commande, et il manque à AWX/AAP/Ascender
      des formulaires qui recueillent des données de plusieurs sources. AnsibleForms vous permet de créer des formulaires dynamiques, alimentés par des données, de générer des extravars
      et de les envoyer à Ansible, AWX/AAP/Ascender, Semaphore, Rundeck ou Jenkins pour y exécuter des templates.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Installer AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Créer votre premier formulaire</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="Le tableau de bord d'AnsibleForms">
  </div>
</div>

## Fonctionnalités

Ce qu'AnsibleForms apporte à votre installation Ansible, et ce qu'un seul formulaire peut faire :

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Application</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Plateformes d'automatisation</strong><span>Des playbooks sur des RTE, des templates sur Ascender, Semaphore et d'autres</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Contrôle d'accès</strong><span>Rôles et options de rôle, avec des connexions locales, LDAP, Entra ID et OIDC</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Planification</strong><span>Exécuter un formulaire plus tard, ou selon une planification cron</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Historique des jobs</strong><span>Suivre, arrêter et relancer des jobs</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Identifiants et secrets</strong><span>Stocker des identifiants, ou les lire depuis Vault ou CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dépôts git</strong><span>Conserver formulaires, playbooks et configuration dans Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Concepteur</strong><span>Modifier les formulaires en YAML, avec validation</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP et chat</strong><span>Lancer des formulaires depuis des scripts, des agents IA ou un chat</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Formulaires</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Listes déroulantes en cascade</strong><span>Des listes déroulantes qui réagissent aux autres champs</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Expressions et sources de données</strong><span>Remplir des champs depuis des bases de données, des API REST, des fichiers et du JavaScript</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dépendances entre champs</strong><span>Afficher ou masquer des champs selon d'autres champs</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validation</strong><span>Min, max, regex et plus, avec vérification facultative sur le serveur</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflows et assistants</strong><span>Enchaîner playbooks et approbations, ou répartir la saisie sur plusieurs pages</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Champs structurés</strong><span>Des listes et des objets reposant sur des sous-formulaires réutilisables</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Points d'approbation</strong><span>Mettre un job en pause jusqu'à ce que quelqu'un l'approuve</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Notifications</strong><span>Mail, Slack, Teams, Telegram ou un webhook sur les événements des jobs</span></span>
      </li>
    </ul>
  </div>
</div>

## Besoin d'aide ?

Les questions, les bugs et les signalements de sécurité ont chacun leur place :

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Dépannage</strong>
    <span>Rechercher un message d'erreur et la façon de le corriger</span>
    <span class="af-card-more">Dépannage &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Poser une question</strong>
    <span>Interroger la communauté et les mainteneurs</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Signaler un bug</strong>
    <span>Ouvrir une issue avec les étapes pour le reproduire</span>
    <span class="af-card-more">Nouvelle issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Obtenir de l'aide</strong>
    <span>Ce qu'il faut inclure, et comment signaler un problème de sécurité</span>
    <span class="af-card-more">Obtenir de l'aide &rarr;</span>
  </a>
</div>

