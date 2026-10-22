---
layout: default
title: Home
nav_order: 1
description: "AnsibleForms: crea moduli dinamici basati sui dati per l'automazione con Ansible"
permalink: /
translated_from: 99aee5157823eac7674a411d032a7a133bb0ba5e
---

<div class="af-hero">
  <div>
    <h1 class="no_toc">Moduli self-service per <span>Ansible</span></h1>
    <p class="af-hero-lead">
      Ansible è un potente strumento di automazione, ma resta un'applicazione a riga di comando, e ad AWX/AAP/Ascender mancano
      moduli che raccolgano dati da più sorgenti. AnsibleForms ti permette di costruire moduli dinamici basati sui dati, generare extravars
      e inviarle ad Ansible, AWX/AAP/Ascender, Semaphore, Rundeck o Jenkins per eseguire lì i template.
    </p>
    <div class="af-hero-actions">
      <a href="installation/" class="btn btn-primary">Installa AnsibleForms</a>
      <a href="first-form.html" class="btn btn-outline">Crea il tuo primo modulo</a>
    </div>
  </div>
  <div class="af-hero-shot">
    <img src="assets/screenshots/dashboard.jpg" alt="La dashboard di AnsibleForms">
  </div>
</div>

## Funzionalità

Cosa porta AnsibleForms al tuo ambiente Ansible, e cosa può fare un singolo modulo:

<div class="af-features">
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-server" aria-hidden="true"></i>Applicazione</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Piattaforme di automazione</strong><span>Playbook sugli RTE, template su Ascender, Semaphore e altro</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Controllo degli accessi</strong><span>Ruoli e opzioni di ruolo, con accesso locale, LDAP, Entra ID e OIDC</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Pianificazione</strong><span>Esegui un modulo più tardi, o secondo una pianificazione cron</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Storico dei job</strong><span>Segui, interrompi e rilancia i job</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-vault" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Credenziali e segreti</strong><span>Salva le credenziali, o leggile da Vault o CyberArk</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-code-branch" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Repository Git</strong><span>Tieni moduli, playbook e configurazione in Git</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Designer</strong><span>Modifica i moduli in YAML, con validazione</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>API, MCP e chat</strong><span>Avvia moduli da script, agenti IA o una chat</span></span>
      </li>
    </ul>
  </div>
  <div class="af-feature-panel">
    <div class="af-feature-title"><i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>Moduli</div>
    <ul class="af-feature-list">
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Menu a tendina a cascata</strong><span>Menu a tendina che reagiscono ad altri campi</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-database" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Espressioni e sorgenti di dati</strong><span>Compila i campi da database, API REST, file e JavaScript</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-eye" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Dipendenze tra campi</strong><span>Mostra o nascondi campi in base ad altri campi</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-check-double" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Validazione</strong><span>Min, max, regex e altro, facoltativamente controllati sul server</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Workflow e moduli wizard</strong><span>Concatena playbook e approvazioni, o suddividi l'input su più pagine</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-cubes" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Campi strutturati</strong><span>Liste e oggetti basati su sottomoduli riutilizzabili</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-stamp" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Punti di approvazione</strong><span>Metti in pausa un job finché qualcuno non lo approva</span></span>
      </li>
      <li>
        <span class="af-feature-icon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span>
        <span class="af-feature-text"><strong>Notifiche</strong><span>Mail, Slack, Teams, Telegram o un webhook sugli eventi dei job</span></span>
      </li>
    </ul>
  </div>
</div>

## Serve aiuto?

Domande, bug e segnalazioni di sicurezza hanno ciascuno il proprio posto:

<div class="af-cards af-quick">
  <a class="af-card" href="troubleshooting.html">
    <span class="af-card-icon"><i class="fa-solid fa-stethoscope"></i></span>
    <strong>Risoluzione dei problemi</strong>
    <span>Cerca un messaggio di errore e come risolverlo</span>
    <span class="af-card-more">Risoluzione dei problemi &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/discussions" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-comments"></i></span>
    <strong>Fai una domanda</strong>
    <span>Chiedi alla community e ai maintainer</span>
    <span class="af-card-more">Discussions &rarr;</span>
  </a>
  <a class="af-card" href="https://github.com/ansibleforms/ansibleforms/issues/new/choose" target="_blank" rel="noopener">
    <span class="af-card-icon"><i class="fa-solid fa-bug"></i></span>
    <strong>Segnala un bug</strong>
    <span>Apri una issue con i passi per riprodurlo</span>
    <span class="af-card-more">Nuova issue &rarr;</span>
  </a>
  <a class="af-card" href="getting-help.html">
    <span class="af-card-icon"><i class="fa-solid fa-life-ring"></i></span>
    <strong>Ottenere aiuto</strong>
    <span>Cosa includere, e come segnalare un problema di sicurezza</span>
    <span class="af-card-more">Ottenere aiuto &rarr;</span>
  </a>
</div>

