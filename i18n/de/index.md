---
layout: default
title: Startseite
nav_order: 1
description: "AnsibleForms: dynamische, datengetriebene Formulare für die Automatisierung mit Ansible erstellen"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Self-Service-Formulare für <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible ist ein leistungsfähiges Automatisierungswerkzeug, bleibt aber eine Kommandozeilenanwendung, und AWX/AAP/Ascender fehlen
      Formulare, die Daten aus mehreren Quellen sammeln. Mit AnsibleForms erstellen Sie dynamische, datengetriebene Formulare, erzeugen Extravars,
      senden sie an Ansible, AWX/AAP/Ascender, Semaphore, Rundeck oder Jenkins und führen dort Vorlagen aus.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">AnsibleForms installieren</a>
      <a href="first-form.html" class="btn btn-outline">Ihr erstes Formular erstellen</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="Das Dashboard von AnsibleForms">
  </div>
</div>

## Funktionen

Was AnsibleForms Ihrer Ansible-Umgebung bringt und was ein einzelnes Formular kann:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Anwendung</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Automatisierungsplattformen</strong><span>Playbooks auf RTEs, Vorlagen auf Ascender, Semaphore und mehr</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Zugriffskontrolle</strong><span>Rollen und Rollenoptionen, mit lokaler, LDAP-, Entra-ID- und OIDC-Anmeldung</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Zeitplanung</strong><span>Ein Formular später oder nach einem Cron-Zeitplan ausführen</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Jobverlauf</strong><span>Jobs verfolgen, abbrechen und neu starten</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Anmeldedaten und Secrets</strong><span>Anmeldedaten speichern oder aus Vault oder CyberArk lesen</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Git-Repositories</strong><span>Formulare, Playbooks und Konfiguration in Git aufbewahren</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Designer</strong><span>Formulare als YAML bearbeiten, mit Validierung</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP und Chat</strong><span>Formulare aus Skripten, KI-Agenten oder einem Chat starten</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Formulare</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Kaskadierende Dropdowns</strong><span>Dropdowns, die auf andere Felder reagieren</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Ausdrücke und Datenquellen</strong><span>Felder aus Datenbanken, REST-APIs, Dateien und JavaScript füllen</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Feldabhängigkeiten</strong><span>Felder abhängig von anderen Feldern ein- oder ausblenden</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validierung</strong><span>Min, Max, Regex und mehr, optional auf dem Server geprüft</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflows und Wizard-Formulare</strong><span>Playbooks und Genehmigungen verketten oder Eingaben auf Seiten verteilen</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Strukturierte Felder</strong><span>Listen und Objekte auf Basis wiederverwendbarer Unterformulare</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Genehmigungspunkte</strong><span>Einen Job anhalten, bis jemand ihn genehmigt</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Benachrichtigungen</strong><span>Mail, Slack, Teams, Telegram oder ein Webhook bei Job-Ereignissen</span></span>
      </li>
    </ul>
  </div>
</div>

## Brauchen Sie Hilfe?

Fragen, Fehler und Sicherheitsmeldungen haben jeweils ihren eigenen Ort:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Fehlerbehebung</strong>
    <span>Eine Fehlermeldung nachschlagen und erfahren, wie man sie behebt</span>
    <span class="af-card-more">Fehlerbehebung &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Eine Frage stellen</strong>
    <span>Die Community und die Maintainer fragen</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Einen Fehler melden</strong>
    <span>Ein Issue mit den Schritten zur Reproduktion öffnen</span>
    <span class="af-card-more">Neues Issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Hilfe bekommen</strong>
    <span>Was Sie angeben sollten, und wie Sie ein Sicherheitsproblem melden</span>
    <span class="af-card-more">Hilfe bekommen &rarr;</span>
  </a>
</div>

